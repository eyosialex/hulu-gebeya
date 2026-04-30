"""Quick smoke test for the upgraded mission engine."""
import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from game.mission_engine import get_next_mission, generate_quiz, submit_quiz_answer

print("\n" + "="*55)
print("  SmartMap — Fraud-Resistant Game Agent Smoke Test")
print("="*55)

# Test 1: Mission selection
m = get_next_mission(9.01, 38.74, user_id="user_001", user_reputation=0.85)
print("\n=== MISSION ===")
print(f"  Target   : {m.get('target_name', 'N/A')}")
print(f"  Priority : {m.get('priority', 'N/A')}")
print(f"  Reward   : {m.get('reward', {})}")

# Test 2: Quiz generation (real distractors, no AI hallucination)
q = generate_quiz(mode="choice", current_lat=9.01, current_lng=38.74)
print("\n=== QUIZ ===")
print(f"  Q          : {q.get('question', 'N/A')}")
print(f"  Options    : {q.get('options', [])}")
print(f"  Difficulty : {q.get('difficulty', 'N/A')}")
print(f"  Correct    : {q.get('correct_answer', 'N/A')}")

# Test 3: Trusted user submits correct answer near location
r = submit_quiz_answer(
    location_id=q["location_id"],
    is_correct=True,
    user_id="user_001",
    user_reputation=0.85,
    quiz_difficulty=q["difficulty"],
    user_lat=9.01,
    user_lng=38.74,
)
print("\n=== TRUSTED USER SUBMISSION ===")
print(f"  Status     : {r.get('status')}")
print(f"  Conf Added : {r.get('confirmation_added')}   (vs raw +1 before)")
print(f"  New Total  : {r.get('new_confirmations')}")
print(f"  Breakdown  : {r.get('breakdown')}")
print(f"  Reward     : {r.get('reward')}")

# Test 4: Bot submits same correct answer (low reputation)
r2 = submit_quiz_answer(
    location_id=q["location_id"],
    is_correct=True,
    user_id="bot_001",
    user_reputation=0.04,
    quiz_difficulty=0.5,
)
print("\n=== BOT SUBMISSION (rep=0.04) ===")
print(f"  Status     : {r2.get('status')}")
print(f"  Conf Added : {r2.get('confirmation_added')}  (almost nothing)")
print(f"  Reward     : {r2.get('reward')}")

# Test 5: Cooldown — same user, same place again
m2 = get_next_mission(9.01, 38.74, user_id="user_001", user_reputation=0.85)
print("\n=== SECOND MISSION (should avoid recently verified) ===")
print(f"  Target   : {m2.get('target_name', m2.get('error', 'N/A'))}")

print("\n" + "="*55)
print("  All tests complete!")
print("="*55 + "\n")
