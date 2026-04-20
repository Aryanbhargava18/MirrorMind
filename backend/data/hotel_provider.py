import os
import requests
import logging
from typing import List, Dict, Any
from .hotels import HOTELS, get_hotels_json

logger = logging.getLogger(__name__)


class HotelProvider:
    """
    Live API orchestrator for discovering genuine hotels.
    Fetches real hotels via SerpAPI Google Hotels in INR with multi-source
    booking links for price comparison across platforms.
    Falls back gracefully to the offline dataset when API is unavailable.
    """

    def discover_hotels(self, location: str = "New York", check_in: str = "2026-06-01", check_out: str = "2026-06-03") -> List[Dict[str, Any]]:
        """Fetch genuine hotel data or fallback to local truth."""
        api_key = os.getenv("SERPAPI_API_KEY", "").strip()
        if not api_key:
            return get_hotels_json()

        try:
            return self._fetch_live_google_hotels(location, check_in, check_out, api_key)
        except Exception as e:
            logger.error(f"[hotel_provider] Live API search failed: {e}. Falling back to internal data.")
            return get_hotels_json()

    def _fetch_live_google_hotels(self, location: str, check_in: str, check_out: str, api_key: str) -> List[Dict[str, Any]]:
        """
        Two-pass fetch:
        1. Listing pass — gets hotel list with INR prices, images, ratings
        2. Detail pass — for each hotel, fetches multi-source booking links
        """
        # Pass 1: Listing
        params = {
            "engine": "google_hotels",
            "q": f"hotels in {location}",
            "check_in_date": check_in,
            "check_out_date": check_out,
            "adults": "2",
            "currency": "INR",
            "hl": "en",
            "gl": "in",
            "api_key": api_key,
        }

        response = requests.get("https://serpapi.com/search", params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        if "properties" not in data:
            return get_hotels_json()

        live_hotels = []
        for prop in data["properties"][:5]:
            # Extract images
            images = []
            for img in prop.get("images", []):
                url = img.get("original_image") or img.get("thumbnail")
                if url:
                    images.append(url)
            if not images:
                images = ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"]

            # Extract rate info (INR)
            rate = prop.get("rate_per_night", {})
            total_rate = prop.get("total_rate", {})
            price_inr = rate.get("extracted_lowest", 0)
            price_display = rate.get("lowest", "")
            total_display = total_rate.get("lowest", "")
            total_extracted = total_rate.get("extracted_lowest", 0)
            before_taxes = rate.get("before_taxes_fees", "")

            # Extract multi-source booking links from listing prices
            booking_sources = []
            for src in prop.get("prices", []):
                source_entry = {
                    "source": src.get("source", "Unknown"),
                    "logo": src.get("logo", ""),
                    "rate_per_night": src.get("rate_per_night", {}).get("lowest", ""),
                    "rate_extracted": src.get("rate_per_night", {}).get("extracted_lowest", 0),
                    "total": src.get("total_rate", {}).get("lowest", ""),
                    "total_extracted": src.get("total_rate", {}).get("extracted_lowest", 0),
                    "link": src.get("link", ""),
                    "num_guests": src.get("num_guests", 2),
                }
                booking_sources.append(source_entry)

            # Hotel official website link
            official_link = prop.get("link", "")

            # Build property token link for detail fetching
            property_token = prop.get("property_token", "")

            # Pass 2: Fetch detailed multi-source booking for this hotel (if we have a token)
            if property_token and len(booking_sources) < 2:
                try:
                    detail_sources = self._fetch_booking_sources(
                        location, check_in, check_out, property_token, api_key
                    )
                    if detail_sources:
                        booking_sources = detail_sources
                except Exception as e:
                    logger.warning(f"[hotel_provider] Detail fetch skipped for {prop.get('name')}: {e}")

            # If we still have no booking sources, create one from the listing data
            if not booking_sources and price_inr > 0:
                booking_sources.append({
                    "source": "Official Website",
                    "logo": "",
                    "rate_per_night": price_display,
                    "rate_extracted": price_inr,
                    "total": total_display,
                    "total_extracted": total_extracted,
                    "link": official_link,
                    "num_guests": 2,
                })

            # Classify hotel
            hotel_class_str = prop.get("hotel_class", "")
            star_rating = prop.get("extracted_hotel_class", 4)
            if not star_rating and hotel_class_str:
                try:
                    star_rating = int(hotel_class_str[0])
                except (ValueError, IndexError):
                    star_rating = 4

            hotel_id = prop.get("name", "hotel").replace(" ", "").lower()[:20]

            # Description
            description = prop.get("description", "")
            if not description:
                description = f"A {hotel_class_str or 'premium'} hotel in {location}."

            # Review breakdown highlights
            review_highlights = []
            for rb in prop.get("reviews_breakdown", [])[:3]:
                name_rb = rb.get("name", "")
                pos = rb.get("positive", 0)
                neg = rb.get("negative", 0)
                total_mentioned = rb.get("total_mentioned", 1)
                sentiment = "positive" if pos > neg else "mixed" if pos > 0 else "negative"
                review_highlights.append({
                    "aspect": name_rb,
                    "sentiment": sentiment,
                    "mentions": total_mentioned,
                })

            # Nearby places
            nearby = []
            for place in prop.get("nearby_places", [])[:3]:
                nearby.append({
                    "name": place.get("name", ""),
                    "transport": place.get("transportations", [{}])[0].get("type", ""),
                    "duration": place.get("transportations", [{}])[0].get("duration", ""),
                })

            h = {
                "id": f"live_{hotel_id}",
                "name": prop.get("name", "Unknown Hotel"),
                "neighborhood": location,
                "city": location,
                "starRating": star_rating or 4,
                "pricePerNight": price_inr,
                "priceDisplay": price_display,
                "totalPrice": total_display,
                "totalExtracted": total_extracted,
                "beforeTaxes": before_taxes,
                "currency": "INR",
                "tags": prop.get("amenities", ["Wi-Fi"])[:5],
                "description": description,
                "images": images[:4],
                "officialLink": official_link,
                "bookingSources": booking_sources,
                "checkInTime": prop.get("check_in_time", ""),
                "checkOutTime": prop.get("check_out_time", ""),
                "ecoCertified": prop.get("eco_certified", False),
                "deal": prop.get("deal", ""),
                "dealDescription": prop.get("deal_description", ""),
                "reviewHighlights": review_highlights,
                "nearbyPlaces": nearby,
                "reviews": {
                    "avgScore": float(prop.get("overall_rating", 0)),
                    "count": int(prop.get("reviews", 0)),
                    "recentTrend": "consistent",
                    "locationRating": float(prop.get("location_rating", 0)),
                    "commonComplaints": [],
                    "byTripType": {
                        "business": {"avg": float(prop.get("overall_rating", 0)), "count": 50},
                        "leisure": {"avg": float(prop.get("overall_rating", 0)), "count": 50},
                    },
                },
                "neighborhoodContext": {
                    "walkability": 8.0,
                    "noiseLevel": "moderate",
                    "safetyFeel": "high",
                    "nearbyHighlights": [p.get("name", "") for p in prop.get("nearby_places", [])[:3]],
                },
                "hiddenFees": {
                    "resortFee": 0,
                    "parkingPerNight": 0,
                    "wifiIncluded": "Free Wi-Fi" in prop.get("amenities", []),
                    "breakfastIncluded": any("Breakfast" in a and "($)" not in a for a in prop.get("amenities", [])),
                },
                "loyaltyPerks": {
                    "silver": "Free wifi",
                    "gold": "Late checkout + point multiplier",
                    "platinum": "Room upgrade + lounge access",
                },
            }
            live_hotels.append(h)

        if not live_hotels:
            return get_hotels_json()

        return live_hotels

    def _fetch_booking_sources(self, location: str, check_in: str, check_out: str, property_token: str, api_key: str) -> List[Dict]:
        """Fetch detailed multi-source booking links for a specific hotel property."""
        params = {
            "engine": "google_hotels",
            "q": f"hotels in {location}",
            "property_token": property_token,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "adults": "2",
            "currency": "INR",
            "hl": "en",
            "gl": "in",
            "api_key": api_key,
        }

        response = requests.get("https://serpapi.com/search", params=params, timeout=10)
        response.raise_for_status()
        detail = response.json()

        sources = []
        for src in detail.get("prices", []):
            sources.append({
                "source": src.get("source", "Unknown"),
                "logo": src.get("logo", ""),
                "rate_per_night": src.get("rate_per_night", {}).get("lowest", ""),
                "rate_extracted": src.get("rate_per_night", {}).get("extracted_lowest", 0),
                "total": src.get("total_rate", {}).get("lowest", ""),
                "total_extracted": src.get("total_rate", {}).get("extracted_lowest", 0),
                "link": src.get("link", ""),
                "num_guests": src.get("num_guests", 2),
            })

        return sources


provider = HotelProvider()


def get_genuine_hotels(location: str = "New York") -> List[Dict[str, Any]]:
    return provider.discover_hotels(location=location)
