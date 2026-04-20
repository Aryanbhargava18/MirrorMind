"""TripSense — Fallback Scoring Engine

When no LLM API key is available, this module provides algorithmic
scoring that mirrors what the real agents would produce.
Uses the same hotel data and intent structure.
"""

from __future__ import annotations
import json
from data.hotels import HOTELS, get_hotels_json


def fallback_optimizer(hotels_json: list[dict], intent: dict, session_dna: dict) -> dict:
    """Score hotels using algorithmic matching — no LLM needed."""
    trip_type = intent.get("trip_type", "leisure")
    budget_min = intent.get("budget_min", 100)
    budget_max = intent.get("budget_max", 600)
    user_tags = set(intent.get("tags", []))

    candidates = []
    for h in hotels_json:
        score = 0
        breakdown = {"trip_type_fit": 0, "budget_alignment": 0, "review_quality": 0, "tag_match": 0}

        # Trip type fit (0-25)
        trip_reviews = h.get("reviews", {}).get("byTripType", {}).get(trip_type, {})
        if trip_reviews:
            trip_avg = trip_reviews.get("avg", 3.0)
            trip_count = trip_reviews.get("count", 0)
            breakdown["trip_type_fit"] = min(25, int((trip_avg / 5.0) * 20 + min(trip_count / 100, 5)))
        else:
            breakdown["trip_type_fit"] = 10

        # Budget alignment (0-25)
        price = h.get("pricePerNight", 0)
        fees = h.get("hiddenFees", {})
        total = price + fees.get("resortFee", 0) + fees.get("parkingPerNight", 0)

        if budget_min <= price <= budget_max:
            breakdown["budget_alignment"] = 22
        elif price < budget_min:
            breakdown["budget_alignment"] = 15  # Under budget is ok but not ideal
        elif price <= budget_max * 1.2:
            breakdown["budget_alignment"] = 10  # Slightly over
        else:
            breakdown["budget_alignment"] = 3  # Way over

        # Review quality (0-25)
        avg_score = h.get("reviews", {}).get("avgScore", 3.0)
        review_count = h.get("reviews", {}).get("count", 0)
        trend = h.get("reviews", {}).get("recentTrend", "stable")
        trend_bonus = 2 if trend == "improving" else 0

        breakdown["review_quality"] = min(25, int((avg_score / 5.0) * 18 + min(review_count / 500, 5) + trend_bonus))

        # Tag match (0-25)
        hotel_tags = set(h.get("tags", []))
        if user_tags:
            overlap = len(user_tags & hotel_tags)
            breakdown["tag_match"] = min(25, int((overlap / max(len(user_tags), 1)) * 25))
        else:
            breakdown["tag_match"] = 12  # Neutral

        score = sum(breakdown.values())

        # Preference vector boost
        pref_vector = session_dna.get("preferenceVector", {})
        for tag in hotel_tags:
            if tag in pref_vector:
                score += int(pref_vector[tag] * 3)

        candidates.append({
            "hotel_id": h["id"],
            "hotel_name": h["name"],
            "score": min(100, score),
            "score_breakdown": breakdown,
            "reasoning": f"Scored {score}/100: trip-type fit {breakdown['trip_type_fit']}/25, budget {breakdown['budget_alignment']}/25, reviews {breakdown['review_quality']}/25, tags {breakdown['tag_match']}/25",
        })

    # Sort by score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)

    return {
        "reasoning": f"Scored {len(candidates)} hotels for {trip_type} trip, budget ${budget_min}-${budget_max}/night. Ranking by trip-type reviews, budget fit, review quality, and tag overlap.",
        "candidates": candidates[:6],
    }


def fallback_advocate(optimizer_output: dict, hotels_json: list[dict], intent: dict) -> dict:
    """Generate challenges for each recommended hotel — no LLM needed."""
    hotel_lookup = {h["id"]: h for h in hotels_json}
    challenges = []
    total_impact = 0

    for c in optimizer_output.get("candidates", [])[:6]:
        hotel_id = c["hotel_id"]
        h = hotel_lookup.get(hotel_id, {})
        hotel_challenges = []

        # Check hidden fees
        fees = h.get("hiddenFees", {})
        price = h.get("pricePerNight", 0)
        resort_fee = fees.get("resortFee", 0)
        parking = fees.get("parkingPerNight", 0)

        if resort_fee > 0 or parking > 0:
            total_extra = resort_fee + parking
            hotel_challenges.append({
                "type": "hidden_fee",
                "severity": "high" if total_extra > 50 else "medium",
                "message": f"Listed ${price}/night doesn't include ${parking} parking" +
                           (f", ${resort_fee} resort fee" if resort_fee > 0 else "") +
                           f". Real nightly cost could be ${price + total_extra}.",
            })

        # Check seasonal issues
        seasonal = h.get("seasonalNotes", {})
        if seasonal.get("general"):
            hotel_challenges.append({
                "type": "seasonal",
                "severity": "low",
                "message": f"Seasonal alert: {seasonal['general']}",
            })

        # Check review complaints
        complaints = h.get("reviews", {}).get("commonComplaints", [])
        if complaints:
            hotel_challenges.append({
                "type": "review_issue",
                "severity": "medium",
                "message": f"Common complaints: {'; '.join(complaints[:2])}",
            })

        # Check photo trust
        photo_trust = h.get("photoTrustScore", 1.0)
        if photo_trust < 0.85:
            hotel_challenges.append({
                "type": "unverified",
                "severity": "medium",
                "message": f"Photo trust score is {photo_trust*100:.0f}% — photos may not accurately represent the property.",
            })

        impact = -len(hotel_challenges) * 5
        total_impact += abs(impact)

        # Build algorithmic anti-rec based on rules
        star_rating = h.get("starRating", 4)
        walkability = h.get("neighborhood_context", {}).get("walkability", 5)
        review_count = h.get("reviews", {}).get("count", 0)
        review_score = h.get("reviews", {}).get("avgScore", 4.0)
        location = h.get("neighborhood", "").lower()
        
        fallback_anti_recs = []
        if star_rating <= 2:
            fallback_anti_recs.append("Rooms are typically very small with limited storage.")
        if star_rating <= 3 and price > 10000:
            fallback_anti_recs.append("Price-to-quality ratio is questionable at this tier.")
        if walkability < 7:
            fallback_anti_recs.append("You will need transport for most attractions — not a walk-everywhere stay.")
        if review_count < 500:
            fallback_anti_recs.append("Limited review data means quality is harder to verify.")
        if "airport" in location or "express" in h.get("name", "").lower():
            fallback_anti_recs.append("Positioned for transit, not experience — neighborhood has limited character.")
        if review_score < 4.0:
            fallback_anti_recs.append("Mixed guest experiences — read recent reviews before booking.")
            
        final_anti_rec = " ".join(fallback_anti_recs) if fallback_anti_recs else "Standard amenities, but lacks standout architectural character."

        challenges.append({
            "hotel_id": hotel_id,
            "hotel_name": c["hotel_name"],
            "challenges": hotel_challenges,
            "anti_rec": final_anti_rec,
            "score_impact": impact,
            "should_reject": False,
        })

    return {
        "reasoning": "[Thought] Applying algorithmic anti-rec rules. [Action] Penalized for hidden fees/low trust.",
        "challenges": challenges,
        "rejections": [],
        "total_impact": f"Total score impact: -{total_impact} points",
    }


def fallback_empathy(optimizer_output: dict, hotels_json: list[dict], intent: dict, session_dna: dict) -> dict:
    """Find emotional resonance — no LLM needed. Uses trip-type review depth."""
    trip_type = intent.get("trip_type", "leisure")
    hotel_lookup = {h["id"]: h for h in hotels_json}
    candidates = optimizer_output.get("candidates", [])

    # Find soul match — the hotel with highest trip-type review score that isn't #1
    best_emotion = None
    best_emotion_score = 0

    emotional_notes = []
    for c in candidates[:6]:
        h = hotel_lookup.get(c["hotel_id"], {})
        trip_reviews = h.get("reviews", {}).get("byTripType", {}).get(trip_type, {})
        trip_avg = trip_reviews.get("avg", 0) if trip_reviews else 0
        trip_count = trip_reviews.get("count", 0) if trip_reviews else 0

        walkability = h.get("neighborhood_context", {}).get("walkability", 5)
        noise = h.get("neighborhood_context", {}).get("noiseLevel", "moderate")
        highlights = h.get("neighborhood_context", {}).get("nearbyHighlights", [])

        notes = []
        if trip_avg >= 4.5:
            notes.append(f"Rated {trip_avg}/5 by {trip_count} {trip_type} travelers — this is a proven {trip_type} pick.")
        if walkability >= 9:
            notes.append(f"Step outside and the city is yours — effortless exploration from the front door.")
        if noise == "low" and trip_type in ["romantic", "solo"]:
            notes.append(f"Quiet neighborhood — the kind of peace that {trip_type} travelers remember.")
        if highlights:
            notes.append(f"Nearby: {', '.join(highlights[:3])}")

        emotional_notes.append({
            "hotel_id": c["hotel_id"],
            "hotel_name": c["hotel_name"],
            "notes": notes,
            "emotional_score": int(trip_avg * 20) if trip_avg else 50,
            "trip_type_feel": f"For {trip_type}: {trip_avg}/5 from {trip_count} reviews" if trip_avg else "Limited data",
        })

        # Soul match: best trip-type score that isn't already #1
        if c != candidates[0] and trip_avg > best_emotion_score:
            best_emotion = c
            best_emotion_score = trip_avg

    soul_match = {
        "hotel_id": best_emotion["hotel_id"] if best_emotion else candidates[0]["hotel_id"],
        "hotel_name": best_emotion["hotel_name"] if best_emotion else candidates[0]["hotel_name"],
        "why": f"This isn't the obvious pick — it's the one you'll remember. Rated {best_emotion_score}/5 by {trip_type} travelers." if best_emotion else "Top overall pick.",
        "score_boost": 10 if best_emotion else 0,
    }

    return {
        "reasoning": f"Scanned emotional signals for {trip_type} travelers. {len([n for n in emotional_notes if n['notes']])} hotels triggered resonance.",
        "soul_match": soul_match,
        "emotional_notes": emotional_notes,
        "override_recommendation": None,
    }


def fallback_synthesizer(optimizer_output: dict, advocate_output: dict, empathy_output: dict, intent: dict, hotels_json: list[dict]) -> dict:
    """Merge all three agent outputs into final shortlist — no LLM needed."""
    hotel_lookup = {h["id"]: h for h in hotels_json}
    challenge_lookup = {c["hotel_id"]: c for c in advocate_output.get("challenges", [])}
    emotion_lookup = {n["hotel_id"]: n for n in empathy_output.get("emotional_notes", [])}
    soul_match_id = empathy_output.get("soul_match", {}).get("hotel_id", "")

    candidates = optimizer_output.get("candidates", [])[:4]
    rejections = set(advocate_output.get("rejections", []))

    # Filter rejections
    candidates = [c for c in candidates if c["hotel_id"] not in rejections]

    # Check if soul match is already in the list
    candidate_ids = {c["hotel_id"] for c in candidates}
    soul_match_inserted = False
    if soul_match_id and soul_match_id not in candidate_ids:
        all_candidates = optimizer_output.get("candidates", [])
        soul_candidate = next((c for c in all_candidates if c["hotel_id"] == soul_match_id), None)
        if soul_candidate:
            candidates.append(soul_candidate)
            soul_match_inserted = True

    # Hotel-specific templates for unique whyItFits
    UNIQUE_TEMPLATES = {
        "greenwich": "The Greenwich Hotel's hand-laid Moroccan courtyard and Japanese-inspired pool create an intimacy you won't find at any other NYC property.",
        "made": "MADE Hotel's stripped-back design aesthetic and curated lobby art collection make it the rare affordable hotel that actually feels intentional.",
        "marlton": "The Marlton's literary heritage — Jack Kerouac wrote here — gives it a Greenwich Village soul that no chain hotel can replicate.",
        "beekman": "The Beekman's nine-story Victorian atrium, with its original ironwork balconies, is one of the most dramatic hotel interiors in Manhattan.",
        "freehand": "Freehand's rooftop bar and communal workspaces blur the line between hostel and hotel — it's built for people who travel to connect.",
        "ace": "Ace Hotel's lobby is a cultural institution — DJs, pop-ups, and the Stumptown coffee bar create a scene that's as much about the energy as the rooms.",
        "ludlow": "The Ludlow's Lower East Side address puts you in the heartbeat of NYC nightlife — the rooftop pool and Dirty French restaurant seal it.",
        "wythe": "Wythe Hotel's converted textile factory walls and floor-to-ceiling Manhattan skyline views make Brooklyn feel like the main event, not the consolation.",
        "crosby": "Crosby Street Hotel's individually designed rooms — each with original Kit Kemp artwork — make it feel like staying in a private SoHo gallery.",
        "pod51": "Pod 51 distills city accommodation to its essence — a clean, efficient sleep pod in Midtown with zero pretension and a price that lets you spend on the city instead.",
        "1hotel_bk": "1 Hotel Brooklyn Bridge's reclaimed-wood interiors and rooftop pool overlooking the Manhattan skyline combine eco-luxury with a view you'll never forget.",
        "nomad": "NoMad Hotel's mahogany-paneled library bar and Daniel Humm's restaurant make it a destination for food-obsessed travelers who want to eat where they sleep.",
        "mercer": "The Mercer's loft-style rooms in a 19th-century Romanesque Revival building defined the SoHo hotel — spacious, minimal, and still the neighborhood's gold standard.",
        "highline": "The High Line Hotel's 1895 seminary building and private garden courtyard feel like a secret estate in the middle of Chelsea's gallery district.",
        "jane": "The Jane Hotel's ship-cabin rooms and Gilded Age ballroom-turned-nightclub offer the most character per dollar of any hotel in Manhattan.",
    }

    # Per-hotel second sentences that connect the hotel to the user's trip type
    HOTEL_CONNECTORS = {
        "greenwich": {
            "romantic": "For a romantic escape, the intimate 88-room scale keeps things personal and quiet.",
            "business": "For business, the TriBeCa address puts you near Financial District meetings without the Midtown chaos.",
            "solo": "Traveling solo, the Japanese pool and courtyard offer moments of genuine solitude.",
            "family": "For families, the generous suites give everyone room to breathe.",
            "leisure": "On a leisure trip, the courtyard pool alone is worth the splurge.",
        },
        "made": {
            "romantic": "The rooftop views make sunset drinks feel effortlessly romantic.",
            "business": "The lobby doubles as a focused workspace with excellent coffee.",
            "solo": "Solo travelers love the communal energy without pressure to socialize.",
            "family": "The NoMad location puts parks and museums within walking distance for kids.",
            "leisure": "At this price point, you won't find better design credibility in Manhattan.",
        },
        "marlton": {
            "romantic": "The intimate scale — just 107 rooms — means the lobby bar feels like your own secret.",
            "business": "Greenwich Village's cafe culture gives you all the off-site meeting spots you need.",
            "solo": "For solo travelers, the literary history and village walkability make every hour feel curated.",
            "family": "The central Village address puts Washington Square Park steps away for kids.",
            "leisure": "The walkable Village location means you'll discover more on foot than any concierge could plan.",
        },
        "beekman": {
            "romantic": "The nine-story atrium — original ironwork intact — is the most romantic interior in the city.",
            "business": "Temple Court downstairs handles client dinners without leaving the building.",
            "solo": "The atrium alone justifies booking — it's a solo traveler's Instagram dream.",
            "family": "Connecting rooms and the FiDi location give families space and access to ferries.",
            "leisure": "This is the kind of hotel you book specifically to experience, not just sleep in.",
        },
        "freehand": {
            "romantic": "The rooftop bar's Manhattan views set the scene for evenings you'll both remember.",
            "business": "Communal workspaces mean you can stay productive without being isolated.",
            "solo": "Built for connection — solo travelers consistently rate the social atmosphere highest.",
            "family": "The mix of private and shared spaces lets families customize their experience.",
            "leisure": "The hostel-meets-hotel energy attracts a crowd that's actually interesting to be around.",
        },
        "ace": {
            "romantic": "The lobby energy spills into late-night culture — romantic for couples who don't do quiet.",
            "business": "The Stumptown coffee and lobby tables are a freelancer's dream office.",
            "solo": "Solo travelers find instant community in the lobby without forced socializing.",
            "family": "The Midtown location puts Broadway theaters and Central Park within blocks.",
            "leisure": "The rotating pop-ups and DJ sets make every visit feel like discovering something new.",
        },
        "ludlow": {
            "romantic": "The rooftop pool and Dirty French restaurant create a date-night destination without leaving the hotel.",
            "business": "The LES address signals creative credibility for non-corporate meetings.",
            "solo": "Solo travelers get nightlife at the doorstep without needing a plan.",
            "family": "Not ideal for small kids, but teenagers will love the Lower East Side energy.",
            "leisure": "The rooftop pool overlooking the LES is one of New York's best-kept summer secrets.",
        },
        "wythe": {
            "romantic": "The Manhattan skyline views from every room make sunrise feel impossibly romantic.",
            "business": "Brooklyn's tech scene is walking distance — and the view aids every pitch deck.",
            "solo": "Williamsburg's food scene starts at the hotel and never stops.",
            "family": "The converted factory rooms are massive — families actually have space here.",
            "leisure": "Staying here makes Brooklyn feel like the main event, not the consolation prize.",
        },
        "crosby": {
            "romantic": "Kit Kemp's individually designed rooms ensure no two stays at the Crosby feel alike.",
            "business": "SoHo's cobblestone streets redefine what a 'business dinner neighborhood' can be.",
            "solo": "The private garden is a solo traveler's quiet escape from SoHo's energy.",
            "family": "The spacious suites and SoHo location give families culture without compromise.",
            "leisure": "Every room is a private gallery — this is SoHo distilled into a hotel.",
        },
        "pod51": {
            "romantic": "The savings let you spend on the experiences that actually matter together.",
            "business": "The Midtown address gets you to any meeting in Manhattan in under 20 minutes.",
            "solo": "The efficiency-first approach lets solo travelers spend on the city, not the room.",
            "family": "The price frees up budget for museums, shows, and actual New York experiences.",
            "leisure": "Smart travel means knowing when a room is just a room — and spending the difference on dinner.",
        },
        "1hotel_bk": {
            "romantic": "The rooftop pool with Lower Manhattan glittering across the river is impossibly romantic.",
            "business": "The eco-luxury angle plays well with sustainability-conscious clients.",
            "solo": "Solo travelers get the best of Brooklyn with Manhattan skyline views as a backdrop.",
            "family": "Brooklyn Bridge Park is steps away — families can play and explore.",
            "leisure": "The reclaimed-wood aesthetic proves luxury doesn't have to be at nature's expense.",
        },
        "nomad": {
            "romantic": "Daniel Humm's restaurant downstairs turns dinner into the evening itself.",
            "business": "The mahogany library bar handles everything from cocktails to client dinners.",
            "solo": "The food-obsessed atmosphere attracts solo diners who take eating seriously.",
            "family": "The Flatiron location gives families easy access to both downtown and midtown.",
            "leisure": "For travelers who eat first and sleep second, the NoMad was built for you.",
        },
        "mercer": {
            "romantic": "The loft-scale rooms in SoHo's heart give couples genuine space to decompress.",
            "business": "The understated luxury signals taste without trying — ideal for creative industries.",
            "solo": "Solo travelers appreciate the Mercer's 'locals only' anonymity.",
            "family": "The loft-sized rooms are among the most spacious in downtown Manhattan.",
            "leisure": "This is the hotel that defined SoHo — staying here is staying in the original.",
        },
        "highline": {
            "romantic": "The private garden and 1895 seminary architecture create a romantic escape within Chelsea.",
            "business": "Chelsea's gallery district location impresses creative and media clients.",
            "solo": "The garden courtyard is a rare private green space in Manhattan — ideal for morning quiet.",
            "family": "The High Line park runs right past the door — the best free attraction in the city.",
            "leisure": "The seminary building's history and the garden courtyard make Chelsea feel like a village.",
        },
        "jane": {
            "romantic": "The Gilded Age ballroom and West Village address create romance on a shoestring.",
            "business": "Not a power-meeting hotel, but the savings fund everything else.",
            "solo": "Ship-cabin rooms are designed for solo travelers who spend their time outside.",
            "family": "Cabin rooms are tiny — but the price means you can book multiples.",
            "leisure": "More character per dollar than any hotel in Manhattan. The ballroom alone is worth it.",
        },
    }

    shortlist = []
    advocate_changed = False

    for idx, c in enumerate(candidates[:4]):
        h = hotel_lookup.get(c["hotel_id"], {})
        challenge = challenge_lookup.get(c["hotel_id"], {})
        emotion = emotion_lookup.get(c["hotel_id"], {})

        optimizer_score = c.get("score", 50)
        advocate_impact = challenge.get("score_impact", 0)
        empathy_boost = empathy_output.get("soul_match", {}).get("score_boost", 0) if c["hotel_id"] == soul_match_id else 0

        final_score = max(0, min(100, optimizer_score + advocate_impact + empathy_boost))

        if advocate_impact < -10:
            advocate_changed = True

        # Build UNIQUE why_it_fits from hotel-specific template
        trip_type = intent.get("trip_type", "leisure")
        hotel_id = c["hotel_id"]

        sentence1 = UNIQUE_TEMPLATES.get(hotel_id, f"{c['hotel_name']}'s distinct character makes it stand out from the standard Manhattan hotel.")

        # Get per-hotel connector sentence (unique to this hotel + trip type)
        hotel_connectors = HOTEL_CONNECTORS.get(hotel_id, {})
        if hotel_connectors and trip_type in hotel_connectors:
            sentence2 = hotel_connectors[trip_type]
        else:
            # Generic fallback — varies by position to avoid repetition
            generic_variants = [
                f"Your {trip_type} trip gains a distinctive character from a hotel that doesn't try to be everything.",
                f"Among {trip_type} travelers, this one consistently earns loyalty from repeat visitors.",
                f"The neighborhood context elevates your {trip_type} experience beyond what the room alone delivers.",
                f"For a {trip_type} trip at this price, the location-to-quality ratio is hard to beat in Manhattan.",
            ]
            sentence2 = generic_variants[idx % len(generic_variants)]

        why_it_fits = f"{sentence1} {sentence2}"

        # Structured matchScore
        breakdown = c.get("score_breakdown", {})
        match_score = {
            "total": final_score,
            "budgetFit": min(10, round(breakdown.get("budget_alignment", 15) / 2.5)),
            "tripTypeMatch": min(10, round(breakdown.get("trip_type_fit", 15) / 2.5)),
            "reviewSignal": min(10, round(breakdown.get("review_quality", 15) / 2.5)),
            "agentConsensus": "A+C" if c["hotel_id"] == soul_match_id else "A",
        }

        fees = h.get("hiddenFees", {})
        total_cost = h.get("pricePerNight", 0) + fees.get("resortFee", 0) + fees.get("parkingPerNight", 0)



        shortlist.append({
            "hotel_id": c["hotel_id"],
            "hotel_name": c["hotel_name"],
            "final_score": final_score,
            "optimizer_score": optimizer_score,
            "advocate_impact": advocate_impact,
            "empathy_boost": empathy_boost,
            "why_it_fits": why_it_fits,
            "anti_rec": challenge.get("anti_rec", h.get("antiRec", "")),
            "is_soul_match": c["hotel_id"] == soul_match_id,
            "matchScore": match_score,
            "total_cost_per_night": total_cost,
            "tags": h.get("tags", []),
            # Pass through hotel data for frontend rendering
            "neighborhood": h.get("neighborhood", ""),
            "pricePerNight": h.get("pricePerNight", 0),
            "priceDisplay": h.get("priceDisplay", ""),
            "totalPrice": h.get("totalPrice", ""),
            "totalExtracted": h.get("totalExtracted", 0),
            "beforeTaxes": h.get("beforeTaxes", ""),
            "currency": h.get("currency", "INR"),
            "starRating": h.get("starRating", 0),
            "reviews": h.get("reviews", {}),
            "neighborhood_context": h.get("neighborhood_context", h.get("neighborhoodContext", {})),
            "hiddenFees": h.get("hiddenFees", {}),
            "accessibility": h.get("accessibility", []),
            "checkInOut": h.get("checkInOut", {}),
            "checkInTime": h.get("checkInTime", ""),
            "checkOutTime": h.get("checkOutTime", ""),
            "seasonalNotes": h.get("seasonalNotes", {}),
            "images": h.get("images", []),
            "description": h.get("description", ""),
            # New live-data fields
            "bookingSources": h.get("bookingSources", []),
            "officialLink": h.get("officialLink", ""),
            "ecoCertified": h.get("ecoCertified", False),
            "deal": h.get("deal", ""),
            "dealDescription": h.get("dealDescription", ""),
            "reviewHighlights": h.get("reviewHighlights", []),
            "nearbyPlaces": h.get("nearbyPlaces", []),
        })

    # Sort by final score
    shortlist.sort(key=lambda x: x["final_score"], reverse=True)

    return {
        "reasoning": f"Merged 3 agent outputs. {'Advocate changed rankings.' if advocate_changed else 'Rankings held.'}" +
                     (f" Soul match ({empathy_output.get('soul_match', {}).get('hotel_name', '')}) inserted." if soul_match_inserted else ""),
        "did_advocate_change_ranking": advocate_changed,
        "did_empathy_override": soul_match_inserted,
        "shortlist": shortlist,
        "rejected_hotels": [{"hotel_id": r, "reason": "Rejected by Devil's Advocate"} for r in rejections],
    }

    candidates = optimizer_output.get("candidates", [])[:4]
    rejections = set(advocate_output.get("rejections", []))

    # Filter rejections
    candidates = [c for c in candidates if c["hotel_id"] not in rejections]

    # Check if soul match is already in the list
    candidate_ids = {c["hotel_id"] for c in candidates}
    soul_match_inserted = False
    if soul_match_id and soul_match_id not in candidate_ids:
        # Find soul match in the full optimizer output
        all_candidates = optimizer_output.get("candidates", [])
        soul_candidate = next((c for c in all_candidates if c["hotel_id"] == soul_match_id), None)
        if soul_candidate:
            candidates.append(soul_candidate)
            soul_match_inserted = True

    shortlist = []
    advocate_changed = False

    for c in candidates[:4]:
        h = hotel_lookup.get(c["hotel_id"], {})
        challenge = challenge_lookup.get(c["hotel_id"], {})
        emotion = emotion_lookup.get(c["hotel_id"], {})

        optimizer_score = c.get("score", 50)
        advocate_impact = challenge.get("score_impact", 0)
        empathy_boost = empathy_output.get("soul_match", {}).get("score_boost", 0) if c["hotel_id"] == soul_match_id else 0

        final_score = max(0, min(100, optimizer_score + advocate_impact + empathy_boost))

        if advocate_impact < -10:
            advocate_changed = True

        # Build why_it_fits from hotel data
        trip_type = intent.get("trip_type", "leisure")
        trip_reviews = h.get("reviews", {}).get("byTripType", {}).get(trip_type, {})
        trip_avg = trip_reviews.get("avg", 0) if trip_reviews else 0
        trip_count = trip_reviews.get("count", 0) if trip_reviews else 0

        why_parts = []
        if h.get("tags"):
            matching_tags = [t for t in h["tags"] if t in set(intent.get("tags", []))]
            if matching_tags:
                why_parts.append(f"Matches your taste for {' and '.join(matching_tags)}")
        if trip_avg > 0:
            why_parts.append(f"rated {trip_avg}/5 from {trip_count} {trip_type} travelers")
        if emotion.get("notes"):
            why_parts.append(emotion["notes"][0])

        why_it_fits = ". ".join(why_parts) + "." if why_parts else f"Strong overall match for {trip_type} trips."

        # Confidence flags
        confidence_flags = []
        photo_trust = h.get("photoTrustScore", 1.0)
        if photo_trust < 0.85:
            confidence_flags.append("photos-may-differ")
        for ch in challenge.get("challenges", []):
            if ch.get("type") == "unverified":
                confidence_flags.append(ch["message"][:50])

        fees = h.get("hiddenFees", {})
        total_cost = h.get("pricePerNight", 0) + fees.get("resortFee", 0) + fees.get("parkingPerNight", 0)

        shortlist.append({
            "hotel_id": c["hotel_id"],
            "hotel_name": c["hotel_name"],
            "final_score": final_score,
            "optimizer_score": optimizer_score,
            "advocate_impact": advocate_impact,
            "empathy_boost": empathy_boost,
            "why_it_fits": why_it_fits,
            "anti_rec": challenge.get("anti_rec", h.get("antiRec", "")),
            "is_soul_match": c["hotel_id"] == soul_match_id,
            "confidence_flags": confidence_flags,
            "total_cost_per_night": total_cost,
            "tags": h.get("tags", []),
            # Pass through hotel data for frontend rendering
            "neighborhood": h.get("neighborhood", ""),
            "pricePerNight": h.get("pricePerNight", 0),
            "priceDisplay": h.get("priceDisplay", ""),
            "totalPrice": h.get("totalPrice", ""),
            "totalExtracted": h.get("totalExtracted", 0),
            "beforeTaxes": h.get("beforeTaxes", ""),
            "currency": h.get("currency", "INR"),
            "starRating": h.get("starRating", 0),
            "reviews": h.get("reviews", {}),
            "neighborhood_context": h.get("neighborhood_context", h.get("neighborhoodContext", {})),
            "hiddenFees": h.get("hiddenFees", {}),
            "photoTrustScore": h.get("photoTrustScore", 0),
            "accessibility": h.get("accessibility", []),
            "checkInOut": h.get("checkInOut", {}),
            "checkInTime": h.get("checkInTime", ""),
            "checkOutTime": h.get("checkOutTime", ""),
            "seasonalNotes": h.get("seasonalNotes", {}),
            "images": h.get("images", []),
            "description": h.get("description", ""),
            # New live-data fields
            "bookingSources": h.get("bookingSources", []),
            "officialLink": h.get("officialLink", ""),
            "ecoCertified": h.get("ecoCertified", False),
            "deal": h.get("deal", ""),
            "dealDescription": h.get("dealDescription", ""),
            "reviewHighlights": h.get("reviewHighlights", []),
            "nearbyPlaces": h.get("nearbyPlaces", []),
        })

    # Sort by final score
    shortlist.sort(key=lambda x: x["final_score"], reverse=True)

    return {
        "reasoning": f"Merged 3 agent outputs. {'Advocate changed rankings.' if advocate_changed else 'Rankings held.'}" +
                     (f" Soul match ({empathy_output.get('soul_match', {}).get('hotel_name', '')}) inserted." if soul_match_inserted else ""),
        "did_advocate_change_ranking": advocate_changed,
        "did_empathy_override": soul_match_inserted,
        "shortlist": shortlist,
        "rejected_hotels": [{"hotel_id": r, "reason": "Rejected by Devil's Advocate"} for r in rejections],
    }
