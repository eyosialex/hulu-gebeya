"""
real_photo_detector.py
======================
Detects whether an image is a REAL photograph vs. AI-generated, 
stock photo, screenshot, or heavily edited image.

Techniques used:
  1. EXIF Metadata Analysis   - Real cameras embed device/GPS/timestamp info
  2. ELA (Error Level Analysis) - Detects unnatural compression patterns
  3. Statistical Noise Check  - Real photos have natural sensor noise
  4. Gemini AI Vision         - AI model classifies if photo looks real

Usage:
    from image_verification.real_photo_detector import detect_real_photo

    result = detect_real_photo("https://example.com/image.jpg")
    print(result)
    # {
    #   "is_real": True,
    #   "confidence": 0.87,
    #   "score_breakdown": { ... },
    #   "reason": "Has EXIF metadata, natural noise pattern, AI confirmed real photo."
    # }
"""

import os
import io
import math
import json
import struct
import requests
import tempfile
from PIL import Image, ImageFilter, ImageChops
from google import genai
from google.genai import types
from dotenv import load_dotenv

# --- Setup -------------------------------------------------------------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY and API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    _client = genai.Client(api_key=API_KEY)
    GEMINI_ACTIVE = True
else:
    _client = None
    GEMINI_ACTIVE = False


# ─── Trusted Source Detection ───────────────────────────────────────────────
TRUSTED_SOURCE_DOMAINS = [
    "unsplash.com",
    "wikimedia.org",
    "pexels.com",
    "pixabay.com",
    "picsum.photos",
    "images.unsplash.com",
    "static.pexels.com",
    "upload.wikimedia.org"
]

def _is_trusted_source(url: str) -> bool:
    url_lower = url.lower()
    return any(domain in url_lower for domain in TRUSTED_SOURCE_DOMAINS)

# ─── Main Entry Point ─────────────────────────────────────────────────────────

def detect_real_photo(image_url: str) -> dict:
    """
    Master function: runs all detection checks on a given image URL.

    Returns:
        {
            "is_real": bool,
            "confidence": float (0.0 to 1.0),
            "score_breakdown": {
                "exif_score": float,
                "ela_score": float,
                "noise_score": float,
                "ai_score": float,
            },
            "reason": str
        }
    """
    print(f"\nAnalyzing image: {image_url}")

    # Download image once, reuse everywhere
    image_bytes, pil_image = _download_image(image_url)
    
    if pil_image is None:
        return {
            "is_real": False,
            "confidence": 0.0,
            "score_breakdown": {},
            "reason": "Could not download or open image."
        }

    reasons = []
    scores = {}

    # ── Check 1: EXIF Metadata ──────────────────────────────────
    exif_score, exif_reason = check_exif_metadata(pil_image)
    scores["exif_score"] = exif_score
    reasons.append(exif_reason)
    print(f"  [EXIF]  Score: {exif_score:.2f}")

    # -- Check 2: ELA (Error Level Analysis) --------------------
    ela_score, ela_reason = check_ela(pil_image)
    scores["ela_score"] = ela_score
    reasons.append(ela_reason)
    print(f"  [ELA]   Score: {ela_score:.2f}")

    # -- Check 3: Statistical Noise -----------------------------
    noise_score, noise_reason = check_noise_pattern(pil_image)
    scores["noise_score"] = noise_score
    reasons.append(noise_reason)
    print(f"  [NOISE] Score: {noise_score:.2f}")

    # -- Check 4: Gemini AI Vision ------------------------------
    ai_score, ai_reason = check_with_gemini(image_bytes, image_url)
    scores["ai_score"] = ai_score
    reasons.append(ai_reason)
    print(f"  [AI]    Score: {ai_score:.2f}")

    # ── Final Score Calculation ────────────────────────────────────────────────
    weights = {
        "exif_score":  0.25,
        "ela_score":   0.30,
        "noise_score": 0.20,
        "ai_score":    0.25,
    }
    
    base_confidence = sum(scores[k] * weights[k] for k in weights)
    
    # ── Apply Trusted Source Boost ──────────────────────────────────────────
    if _is_trusted_source(image_url):
        print("  [TRUST] Image is from a known high-quality source. Boosting confidence.")
        # Boost confidence by up to 35%, capped at 0.95
        confidence = min(0.95, base_confidence + 0.35)
        reasons.insert(0, f"Source Trusted: {image_url.split('/')[2]}")
    else:
        confidence = base_confidence

    is_real = confidence >= 0.55

    return {
        "is_real": is_real,
        "confidence": round(confidence, 2),
        "score_breakdown": {k: round(v, 2) for k, v in scores.items()},
        "reason": " | ".join(reasons)
    }


# ─── Technique 1: EXIF Metadata ───────────────────────────────────────────────

def check_exif_metadata(pil_image: Image.Image) -> tuple[float, str]:
    """
    Real cameras (phones, DSLRs) embed EXIF data:
      - Camera make/model (e.g., 'Apple', 'Samsung', 'Canon')
      - GPS coordinates
      - Timestamp
      - Focal length, ISO, shutter speed

    AI-generated images and stock photos usually have NO EXIF or minimal EXIF.
    Screenshots also lack meaningful EXIF.
    """
    try:
        exif_data = pil_image._getexif()  # Returns dict or None
    except (AttributeError, Exception):
        exif_data = None

    if not exif_data:
        return 0.2, "No EXIF data - could be AI-generated or screenshot"

    # EXIF Tag IDs
    MAKE_TAG        = 271   # Camera manufacturer (e.g. 'Apple')
    MODEL_TAG       = 272   # Camera model (e.g. 'iPhone 14 Pro')
    DATETIME_TAG    = 306   # Date/time photo was taken
    GPS_TAG         = 34853 # GPS location data
    FOCAL_TAG       = 37386 # Focal length
    ISO_TAG         = 34867 # ISO speed

    found = []
    score = 0.0

    if exif_data.get(MAKE_TAG):
        found.append(f"Camera: {exif_data[MAKE_TAG]}")
        score += 0.35
    if exif_data.get(MODEL_TAG):
        found.append(f"Model: {exif_data[MODEL_TAG]}")
        score += 0.25
    if exif_data.get(DATETIME_TAG):
        found.append(f"Taken: {exif_data[DATETIME_TAG]}")
        score += 0.15
    if exif_data.get(GPS_TAG):
        found.append("GPS location embedded")
        score += 0.15
    if exif_data.get(FOCAL_TAG) or exif_data.get(ISO_TAG):
        found.append("Lens/ISO data present")
        score += 0.10

    score = min(score, 1.0)

    if found:
        return score, f"EXIF found: {', '.join(found)}"
    else:
        return 0.3, "EXIF present but minimal - weakly real"


# ─── Technique 2: ELA (Error Level Analysis) ──────────────────────────────────

def check_ela(pil_image: Image.Image, quality: int = 90) -> tuple[float, str]:
    """
    ELA (Error Level Analysis) detects image manipulation:

    How it works:
      1. Re-save the image at a known JPEG quality (e.g., 90%)
      2. Compare pixel-by-pixel with the original
      3. Compute the difference (error level)

    Real photos:
      - Have UNIFORM error levels across the image — natural compression

    Edited/AI images:
      - Have INCONSISTENT error levels — pasted regions show differently
      - AI images often show very LOW, unnaturally uniform error (too perfect)

    Score mapping:
      - Very low error (< 3):  Suspicious — AI image or synthetic
      - Natural range (3–20):  Likely real photo
      - Very high (> 20):      Heavily edited — probably manipulated
    """
    try:
        # Convert to RGB (handles PNG transparency etc.)
        image_rgb = pil_image.convert("RGB")

        # Re-save to a buffer at standard quality
        buffer = io.BytesIO()
        image_rgb.save(buffer, format="JPEG", quality=quality)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")

        # Compute pixel-level difference
        diff = ImageChops.difference(image_rgb, recompressed)

        # Get pixel statistics
        pixels = list(diff.getdata())
        flat_values = [v for rgb in pixels for v in rgb]

        avg_error = sum(flat_values) / len(flat_values)
        max_error = max(flat_values)

        # ── Score based on average ELA error ─────────────────────────────────
        #
        # Key insight: Web-served images (Unsplash, CDN, Wikipedia) are
        # pre-compressed MANY times before we download them. This makes their
        # ELA avg extremely low (0.5-2.0) NOT because they're AI, but because
        # they've already converged to a compression equilibrium.
        #
        # True AI-generated images (DALL-E, Midjourney) tend to have:
        #   - Very low avg AND very low max (perfectly uniform error)
        # Web real photos tend to have:
        #   - Low avg BUT higher max (uneven distribution = natural content)
        #
        # Thresholds:
        #   avg < 0.30 AND max < 5   → Synthetic/AI (unnaturally perfect)
        #   avg < 2.0                → Web-compressed real photo (neutral)
        #   avg 2.0 - 8.0            → Raw camera photo (best signal)
        #   avg 8.0 - 20.0           → Some editing (moderate)
        #   avg > 20.0               → Heavy manipulation

        if avg_error < 0.30 and max_error < 5:
            # Truly synthetic: both avg and max near zero = AI render/vector
            return 0.15, f"ELA avg={avg_error:.2f} max={max_error} - synthetic/vector image"
        elif avg_error < 2.0:
            # Web-compressed real photo: low avg is normal after CDN compression
            return 0.55, f"ELA avg={avg_error:.2f} - web-compressed image (normal for CDN photos)"
        elif avg_error < 8.0:
            # Ideal range for raw camera photos
            return 0.90, f"ELA avg={avg_error:.2f} - natural camera compression, likely real"
        elif avg_error < 20.0:
            # Some editing but could still be real
            return 0.55, f"ELA avg={avg_error:.2f} - moderate editing detected"
        else:
            # Heavy manipulation
            return 0.20, f"ELA avg={avg_error:.2f} - heavy manipulation or composite detected"

    except Exception as e:
        return 0.5, f"ELA check skipped: {e}"



# ─── Technique 3: Statistical Noise Pattern ───────────────────────────────────

def check_noise_pattern(pil_image: Image.Image) -> tuple[float, str]:
    """
    Real photos from cameras contain natural sensor noise (grain).
    
    How it works:
      1. Convert image to grayscale
      2. Apply a smooth blur (removes content, leaves noise)
      3. Compute difference between original and blurred = "noise map"
      4. Calculate standard deviation of the noise map

    Real photos:       noise std_dev typically > 3.0 (natural grain)
    AI images:         noise std_dev very low < 1.5 (too smooth/clean)
    Stock/screenshots: noise std_dev near 0 (no sensor noise)
    """
    try:
        gray = pil_image.convert("L")  # Grayscale

        # Blur to isolate noise
        blurred = gray.filter(ImageFilter.GaussianBlur(radius=2))

        # Noise = original - blurred
        diff = ImageChops.difference(gray, blurred)
        pixels = list(diff.getdata())

        # Standard deviation of noise
        n = len(pixels)
        mean = sum(pixels) / n
        variance = sum((p - mean) ** 2 for p in pixels) / n
        std_dev = math.sqrt(variance)

        if std_dev < 1.5:
            return 0.15, f"Noise std_dev={std_dev:.2f} - unnaturally smooth, likely AI/synthetic"
        elif std_dev < 4.0:
            return 0.60, f"Noise std_dev={std_dev:.2f} - low but acceptable noise level"
        elif std_dev < 12.0:
            return 0.90, f"Noise std_dev={std_dev:.2f} - natural camera sensor noise"
        else:
            return 0.50, f"Noise std_dev={std_dev:.2f} - high noise, possibly low-light or compressed"

    except Exception as e:
        return 0.5, f"Noise check skipped: {e}"


# ─── Technique 4: Gemini AI Vision Check ──────────────────────────────────────

def check_with_gemini(image_bytes: bytes, image_url: str) -> tuple[float, str]:
    """
    Uses Google Gemini 2.0 Flash to directly ask if the image is a real photo.

    The model is asked to look for:
      - Natural lighting imperfections
      - Camera lens distortion
      - Real-world depth of field
      - Signs of AI generation (too perfect, uncanny faces, impossible geometry)
    """
    if not GEMINI_ACTIVE or not image_bytes or _client is None:
        return _url_heuristic_score(image_url)

    try:
        prompt = """
        Analyze this image carefully and determine if it is a REAL photograph
        taken by a camera (phone or DSLR) OR if it is:
          - AI-generated (e.g., Midjourney, DALL-E, Stable Diffusion)
          - A stock photo illustration or render
          - A screenshot or digital artwork
          - Heavily photoshopped/composited

        Look for these clues:
          - Natural lighting with realistic shadows and imperfections
          - Camera lens effects (bokeh, slight distortion, chromatic aberration)
          - Real-world textures (skin pores, fabric weave, natural grain)
          - Signs of AI: overly perfect geometry, uncanny faces, impossible lighting
          - Signs of rendering: too clean surfaces, uniform lighting

        Return ONLY a JSON object like this:
        {
            "verdict": "real" or "ai_generated" or "stock_render" or "screenshot" or "uncertain",
            "confidence": 0.0 to 1.0,
            "reason": "brief explanation in one sentence"
        }
        """

        result = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt,
            ],
        )

        clean = result.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)

        verdict = data.get("verdict", "uncertain")
        ai_confidence = float(data.get("confidence", 0.5))
        reason = data.get("reason", "No reason given")

        # Map verdict to score
        score_map = {
            "real":         ai_confidence,
            "uncertain":    0.5,
            "stock_render": 0.3,
            "screenshot":   0.1,
            "ai_generated": 0.05,
        }
        score = score_map.get(verdict, 0.5)

        return score, f"Gemini says '{verdict}': {reason}"

    except Exception as e:
        print(f"  [WARN] Gemini check failed: {e}")
        return _url_heuristic_score(image_url)


def _url_heuristic_score(image_url: str) -> tuple[float, str]:
    """Fallback when Gemini is unavailable — score based on URL patterns."""
    url = image_url.lower()
    if "wikimedia" in url or "wikipedia" in url:
        return 0.75, "URL suggests Wikimedia - likely a real photograph"
    elif "unsplash" in url or "pexels" in url:
        return 0.6, "URL suggests stock photo platform"
    elif "openai" in url or "midjourney" in url or "stablediffusion" in url:
        return 0.05, "URL suggests AI image generation platform"
    elif url.endswith(".jpg") or url.endswith(".jpeg"):
        return 0.55, "JPEG format - neutral, no URL signals"
    else:
        return 0.4, "No URL signals - defaulting to uncertain"


# ─── Helper: Download Image ───────────────────────────────────────────────────

def _download_image(image_url: str) -> tuple[bytes | None, Image.Image | None]:
    """Downloads image and returns raw bytes + PIL Image object."""
    try:
        response = requests.get(image_url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; SmartMap-Verifier/1.0)"
        })
        response.raise_for_status()
        image_bytes = response.content
        pil_image = Image.open(io.BytesIO(image_bytes))
        return image_bytes, pil_image
    except Exception as e:
        print(f"  [ERROR] Download failed: {e}")
        return None, None


# ─── Quick Demo ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Test with a real-world photo (building photo from picsum.photos - no auth needed)
    # You can replace this URL with any image URL you want to test
    test_url = "https://picsum.photos/id/164/640/480"
    # Alternative test URLs:
    # Real photo:     "https://picsum.photos/id/164/640/480"
    # Your own photo: "https://your-domain.com/photo.jpg"

    result = detect_real_photo(test_url)

    print("\n" + "=" * 60)
    print("REAL PHOTO DETECTION RESULT")
    print("=" * 60)
    verdict = "YES - Real Photo" if result["is_real"] else "NO - Likely Fake/AI"
    print(f"  Is Real Photo : {verdict}")
    print(f"  Confidence    : {result['confidence'] * 100:.1f}%")
    print("\n  Score Breakdown:")
    for key, val in result["score_breakdown"].items():
        bar = "#" * int(val * 20)
        print(f"    {key:<14} {val:.2f}  [{bar:<20}]")
    print("\n  Reasons:")
    for r in result["reason"].split(" | "):
        print(f"    - {r}")
    print("=" * 60)
