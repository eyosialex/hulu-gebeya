from image_verification.analysis import analyze_image_content

def get_image_confidence(image_url, category=None):
    """
    Validates uploaded images using AI Content Analysis.
    Compares detected vision labels against the declared category.
    """
    if not image_url:
        return 0.0
    
    # 1. Run AI Vision Content Analysis (Simulated)
    analysis = analyze_image_content(image_url)
    labels = analysis["labels"]
    text = analysis["text_detected"]

    # 2. Content Accuracy (40% weight)
    content_score = 0.0
    if category:
        # Check if any label matches the category or its common themes
        themes = {
            "game": ["gaming", "electronics", "neon", "monitor"],
            "food": ["food", "dining", "table", "indoor"],
            "services": ["medical", "building", "sign", "hospital"],
            "clinic": ["medical", "building", "sign", "hospital"],
            "church": ["religious", "building", "architecture"]
        }
        
        target_labels = themes.get(category, [category])
        if any(label in labels for label in target_labels):
            content_score = 1.0
        elif any(label in labels for label in ["outdoor", "building"]): # General match
            content_score = 0.5

    # 3. Source & Branding (60% weight)
    # Give higher trust if the image belongs to the verified SmartMap domain or matches ID text
    source_score = 0.5
    if "smartmap.et" in image_url:
        source_score = 1.0
    elif text and category in text.lower():
        source_score = 0.9

    final_score = (content_score * 0.4) + (source_score * 0.6)
    
    return round(final_score, 2)
