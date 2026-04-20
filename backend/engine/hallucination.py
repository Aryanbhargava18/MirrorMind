"""TripSense — Hallucination Armor

Cross-references LLM output against source hotel data.
Flags any claims not in the ground truth.
No LLM needed — pure data validation.
"""

from data.hotels import HOTELS, get_hotel_by_id


def check_hallucinations(shortlist: dict, hotels_json: list[dict]) -> dict:
    """Validate every claim in the shortlist against ground truth hotel data."""

    flags = []
    verified_count = 0
    total_claims = 0

    hotel_lookup = {h["id"]: h for h in hotels_json}

    for item in shortlist.get("shortlist", []):
        hotel_id = item.get("hotel_id", "")
        source = hotel_lookup.get(hotel_id)

        if not source:
            flags.append({
                "hotel_id": hotel_id,
                "type": "missing_source",
                "severity": "critical",
                "message": f"Hotel '{hotel_id}' not found in source data — possible hallucination"
            })
            continue

        # Check price claim
        claimed_cost = item.get("total_cost_per_night", 0)
        actual_price = source.get("pricePerNight", 0)
        hidden = source.get("hiddenFees", {})
        actual_total = actual_price + hidden.get("resortFee", 0) + hidden.get("parkingPerNight", 0)

        if claimed_cost > 0 and abs(claimed_cost - actual_total) > 20:
            flags.append({
                "hotel_id": hotel_id,
                "type": "price_mismatch",
                "severity": "high",
                "message": f"Claimed ${claimed_cost}/night but actual total is ${actual_total}/night",
                "fix": {"correct_value": actual_total}
            })
        else:
            verified_count += 1
        total_claims += 1

        # Check star rating if mentioned in why_it_fits
        why = item.get("why_it_fits", "").lower()
        if "5-star" in why and source.get("starRating") != 5:
            flags.append({
                "hotel_id": hotel_id,
                "type": "rating_hallucination",
                "severity": "high",
                "message": f"Claims 5-star but actual rating is {source.get('starRating')}-star"
            })
        total_claims += 1
        verified_count += 1

        # Check review score if mentioned
        if "4.9" in why or "4.8" in why or "4.7" in why or "4.6" in why:
            actual_score = source.get("reviews", {}).get("avgScore", 0)
            for score_str in ["4.9", "4.8", "4.7", "4.6"]:
                if score_str in why and abs(float(score_str) - actual_score) > 0.2:
                    flags.append({
                        "hotel_id": hotel_id,
                        "type": "review_hallucination",
                        "severity": "medium",
                        "message": f"Claims {score_str} rating but actual is {actual_score}"
                    })
        total_claims += 1
        verified_count += 1

        # Check tags claimed exist
        claimed_tags = item.get("tags", [])
        actual_tags = source.get("tags", [])
        for tag in claimed_tags:
            if tag not in actual_tags:
                flags.append({
                    "hotel_id": hotel_id,
                    "type": "tag_hallucination",
                    "severity": "low",
                    "message": f"Tag '{tag}' not in source data tags: {actual_tags}"
                })
            total_claims += 1
            verified_count += 1

    accuracy = verified_count / max(total_claims, 1)

    return {
        "flags": flags,
        "total_claims_checked": total_claims,
        "verified": verified_count,
        "accuracy": round(accuracy, 3),
        "has_critical": any(f["severity"] == "critical" for f in flags),
        "has_high": any(f["severity"] == "high" for f in flags),
    }
