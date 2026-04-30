from trust_engine import calculate_trust_score, get_realism_status
from data import locations

def run_audit():
    print("="*60)
    print("SMARTMAP DATABASE REALISM AUDIT")
    print("="*60)
    print(f"{'Location Name':<25} | {'Score':<6} | {'Status':<15}")
    print("-" * 60)

    audit_results = []

    for loc in locations:
        score = calculate_trust_score(loc)
        status = get_realism_status(score)
        
        print(f"{loc['name']:<25} | {score:<6.2f} | {status:<15}")
        
        audit_results.append({
            "name": loc["name"],
            "score": score,
            "status": status
        })

    print("-" * 60)
    fake_count = sum(1 for r in audit_results if r["status"] == "Fake / Suspicious")
    print(f"Audit Summary: {len(locations)} Total | {fake_count} Suspicious flagging required.")
    print("="*60)

if __name__ == "__main__":
    run_audit()
