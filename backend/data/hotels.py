from __future__ import annotations
"""TripSense — Hotel Data Layer

Structured hotel data with Pydantic validation.
The agents REASON about this data but don't fabricate it.
This is the hallucination armor's ground truth.
"""

from pydantic import BaseModel
from typing import Optional


class NeighborhoodContext(BaseModel):
    walkability: float
    noiseLevel: str
    safetyFeel: str
    nearbyHighlights: list[str]


class TripTypeReview(BaseModel):
    avg: float
    count: int


class Reviews(BaseModel):
    avgScore: float
    count: int
    recentTrend: str
    commonComplaints: list[str]
    byTripType: dict[str, TripTypeReview]


class CheckInOut(BaseModel):
    checkIn: str
    checkOut: str
    earlyCheckIn: str
    luggageStorage: bool


class SeasonalNotes(BaseModel):
    general: Optional[str] = None
    summer: Optional[str] = None
    winter: Optional[str] = None


class HiddenFees(BaseModel):
    resortFee: float = 0
    parkingPerNight: float = 0
    wifiIncluded: bool = True
    breakfastIncluded: bool = False


class Hotel(BaseModel):
    id: str
    name: str
    neighborhood: str
    city: str
    starRating: int
    pricePerNight: int
    tags: list[str]
    reviews: Reviews
    antiRec: str  # Mandatory honest criticism
    neighborhood_context: NeighborhoodContext
    accessibility: list[str]
    checkInOut: CheckInOut
    seasonalNotes: SeasonalNotes
    hiddenFees: HiddenFees
    photoTrustScore: float
    loyaltyEligible: bool = True
    loyaltyPerks: dict[str, str] = {}


# ── 15 NYC Hotels — Ground Truth Data ──
HOTELS: list[Hotel] = [
    Hotel(
        id="greenwich",
        name="The Greenwich Hotel",
        neighborhood="TriBeCa",
        city="New York",
        starRating=5,
        pricePerNight=680,
        tags=["intimate", "luxury", "quiet", "romantic", "celeb-discreet", "unique-rooms"],
        reviews=Reviews(
            avgScore=4.8, count=890, recentTrend="stable",
            commonComplaints=["price point", "limited availability", "no pool"],
            byTripType={
                "romantic": TripTypeReview(avg=4.9, count=260),
                "business": TripTypeReview(avg=4.3, count=120),
                "leisure": TripTypeReview(avg=4.7, count=310),
                "solo": TripTypeReview(avg=4.1, count=80),
                "family": TripTypeReview(avg=3.8, count=60),
            }
        ),
        antiRec="TriBeCa is quiet — almost too quiet if you want nightlife energy. Also, the intimate scale (88 rooms) means availability is scarce.",
        neighborhood_context=NeighborhoodContext(
            walkability=8.2, noiseLevel="low", safetyFeel="very safe",
            nearbyHighlights=["Locanda Verde", "Hudson River Park", "Brookfield Place"]
        ),
        accessibility=["elevator", "ADA rooms", "wheelchair-accessible lobby"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="subject to availability", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Courtyard garden is magical spring-fall. Winter can feel isolated."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=65, wifiIncluded=True),
        photoTrustScore=0.95,
        loyaltyPerks={"gold": "Pool access + drawing room invite", "platinum": "Suite upgrade + breakfast"},
    ),
    Hotel(
        id="made",
        name="MADE Hotel",
        neighborhood="NoMad",
        city="New York",
        starRating=4,
        pricePerNight=220,
        tags=["design-hotel", "affordable-chic", "walkable", "local-feel", "quiet"],
        reviews=Reviews(
            avgScore=4.3, count=1560, recentTrend="improving",
            commonComplaints=["small rooms", "no room service", "thin walls"],
            byTripType={
                "romantic": TripTypeReview(avg=4.2, count=250),
                "business": TripTypeReview(avg=3.9, count=200),
                "leisure": TripTypeReview(avg=4.4, count=600),
                "solo": TripTypeReview(avg=4.6, count=300),
                "family": TripTypeReview(avg=3.5, count=80),
            }
        ),
        antiRec="If you expect full-service luxury (room service, turndown, minibar), this won't deliver. It's a design hotel, not a pampering hotel.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.3, noiseLevel="moderate", safetyFeel="safe",
            nearbyHighlights=["Eataly", "Madison Square Park", "Korean BBQ row", "Jazz clubs"]
        ),
        accessibility=["elevator", "ADA rooms"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="$50 fee", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="NoMad is a year-round neighborhood. Summer sidewalk dining is a highlight."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=45, wifiIncluded=True),
        photoTrustScore=0.88,
        loyaltyPerks={"gold": "High-floor room + coffee", "platinum": "Suite upgrade"},
    ),
    Hotel(
        id="marlton",
        name="The Marlton",
        neighborhood="Greenwich Village",
        city="New York",
        starRating=4,
        pricePerNight=290,
        tags=["literary", "cozy", "intimate", "village-charm", "quiet", "romantic"],
        reviews=Reviews(
            avgScore=4.5, count=760, recentTrend="stable",
            commonComplaints=["tiny rooms", "street noise on lower floors", "no gym"],
            byTripType={
                "romantic": TripTypeReview(avg=4.7, count=220),
                "business": TripTypeReview(avg=3.6, count=80),
                "leisure": TripTypeReview(avg=4.5, count=280),
                "solo": TripTypeReview(avg=4.8, count=120),
                "family": TripTypeReview(avg=3.2, count=30),
            }
        ),
        antiRec="Rooms are charming but small — think Parisian proportions, not American ones. No gym, no pool, no room service. This is all about atmosphere, not amenities.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.6, noiseLevel="moderate", safetyFeel="safe",
            nearbyHighlights=["Washington Square Park", "Blue Note Jazz", "Joe's Pizza", "McNally Jackson"]
        ),
        accessibility=["elevator", "limited ADA"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="not available", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Fall in the Village is peak season. Book early Sept-Nov."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=50, wifiIncluded=True),
        photoTrustScore=0.92,
        loyaltyPerks={"gold": "Fireplace room + espresso", "platinum": "Suite + welcome champagne"},
    ),
    Hotel(
        id="beekman",
        name="The Beekman",
        neighborhood="Financial District",
        city="New York",
        starRating=5,
        pricePerNight=520,
        tags=["historic", "luxury", "dramatic-atrium", "foodie", "architectural"],
        reviews=Reviews(
            avgScore=4.6, count=1200, recentTrend="stable",
            commonComplaints=["FiDi can feel dead at night", "expensive dining", "construction noise"],
            byTripType={
                "romantic": TripTypeReview(avg=4.9, count=300),
                "business": TripTypeReview(avg=4.7, count=400),
                "leisure": TripTypeReview(avg=4.5, count=350),
                "solo": TripTypeReview(avg=4.0, count=80),
                "family": TripTypeReview(avg=3.9, count=70),
            }
        ),
        antiRec="FiDi empties out after 7pm on weekdays — if you want neighborhood energy, this isn't it. The atrium is stunning but the rooms don't match that drama.",
        neighborhood_context=NeighborhoodContext(
            walkability=7.8, noiseLevel="low-evening", safetyFeel="safe",
            nearbyHighlights=["Temple Court restaurant", "South Street Seaport", "Brooklyn Bridge walk"]
        ),
        accessibility=["elevator", "ADA rooms", "wheelchair-accessible restaurant"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="upon request", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Best in fall. Summer weekends can feel empty."),
        hiddenFees=HiddenFees(resortFee=35, parkingPerNight=70, wifiIncluded=True),
        photoTrustScore=0.90,
        loyaltyPerks={"gold": "Atrium view room", "platinum": "Penthouse upgrade + dinner credit"},
    ),
    Hotel(
        id="freehand",
        name="Freehand New York",
        neighborhood="Flatiron",
        city="New York",
        starRating=3,
        pricePerNight=175,
        tags=["social", "affordable", "rooftop", "creative", "backpacker-upgrade"],
        reviews=Reviews(
            avgScore=4.1, count=1800, recentTrend="improving",
            commonComplaints=["noise from bar", "inconsistent service", "small rooms"],
            byTripType={
                "romantic": TripTypeReview(avg=3.8, count=200),
                "business": TripTypeReview(avg=3.4, count=150),
                "leisure": TripTypeReview(avg=4.3, count=600),
                "solo": TripTypeReview(avg=4.7, count=500),
                "family": TripTypeReview(avg=3.2, count=100),
            }
        ),
        antiRec="At its core, this is a hostel that grew up. Walls are thin, service is casual not polished, and shared spaces can get loud. Not for those who want traditional hotel experiences.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.4, noiseLevel="high", safetyFeel="safe",
            nearbyHighlights=["Flatiron Building", "Madison Square Park", "Eataly", "Union Square"]
        ),
        accessibility=["elevator", "limited ADA"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="not available", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Rooftop bar is the draw May-Oct. Winter loses its appeal."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=55, wifiIncluded=True),
        photoTrustScore=0.82,
        loyaltyPerks={"gold": "Rooftop VIP + room upgrade", "platinum": "Suite + cocktail credits"},
    ),
    Hotel(
        id="ace",
        name="Ace Hotel New York",
        neighborhood="NoMad",
        city="New York",
        starRating=4,
        pricePerNight=280,
        tags=["creative", "lobby-scene", "design", "music", "social"],
        reviews=Reviews(
            avgScore=4.2, count=2100, recentTrend="stable",
            commonComplaints=["lobby noise", "small rooms", "inconsistent housekeeping"],
            byTripType={
                "romantic": TripTypeReview(avg=3.9, count=250),
                "business": TripTypeReview(avg=4.1, count=400),
                "leisure": TripTypeReview(avg=4.3, count=700),
                "solo": TripTypeReview(avg=4.5, count=450),
                "family": TripTypeReview(avg=3.3, count=80),
            }
        ),
        antiRec="The lobby is famously buzzy — great if you're social, terrible if you want peace. Rooms feel afterthought compared to the public spaces. This is a scene hotel.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.1, noiseLevel="high", safetyFeel="safe",
            nearbyHighlights=["Stumptown Coffee", "Breslin Bar", "NoMad food scene"]
        ),
        accessibility=["elevator", "ADA rooms"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="$40 fee", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Year-round appeal. Lobby culture peaks during fashion weeks."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=55, wifiIncluded=True),
        photoTrustScore=0.85,
        loyaltyPerks={"gold": "Turntable room + vinyl collection", "platinum": "Loft suite"},
    ),
    Hotel(
        id="ludlow",
        name="The Ludlow",
        neighborhood="Lower East Side",
        city="New York",
        starRating=4,
        pricePerNight=320,
        tags=["nightlife", "trendy", "rooftop", "downtown-cool", "social"],
        reviews=Reviews(
            avgScore=4.4, count=980, recentTrend="stable",
            commonComplaints=["street noise weekends", "attitude from staff", "pool closed in winter"],
            byTripType={
                "romantic": TripTypeReview(avg=4.3, count=200),
                "business": TripTypeReview(avg=3.5, count=80),
                "leisure": TripTypeReview(avg=4.5, count=400),
                "solo": TripTypeReview(avg=4.6, count=200),
                "family": TripTypeReview(avg=3.0, count=30),
            }
        ),
        antiRec="LES is loud on weekends. If you're over 35 and want quiet, this will feel exhausting by night two. Staff can lean toward too-cool-for-school.",
        neighborhood_context=NeighborhoodContext(
            walkability=8.8, noiseLevel="high-weekends", safetyFeel="mostly safe",
            nearbyHighlights=["Katz's Deli", "Music Venue Row", "Tenement Museum", "Cocktail bars"]
        ),
        accessibility=["elevator", "ADA rooms"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="subject to availability", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Pool closed Nov-Apr. Summer is peak LES energy."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=50, wifiIncluded=True),
        photoTrustScore=0.87,
        loyaltyPerks={"gold": "Pool access + late checkout", "platinum": "Penthouse + dinner credit"},
    ),
    Hotel(
        id="wythe",
        name="Wythe Hotel",
        neighborhood="Williamsburg, Brooklyn",
        city="New York",
        starRating=4,
        pricePerNight=310,
        tags=["brooklyn", "industrial-chic", "rooftop", "views", "creative"],
        reviews=Reviews(
            avgScore=4.4, count=1100, recentTrend="improving",
            commonComplaints=["far from Manhattan", "elevator wait", "street parking only"],
            byTripType={
                "romantic": TripTypeReview(avg=4.5, count=250),
                "business": TripTypeReview(avg=3.5, count=80),
                "leisure": TripTypeReview(avg=4.6, count=450),
                "solo": TripTypeReview(avg=4.3, count=200),
                "family": TripTypeReview(avg=3.6, count=50),
            }
        ),
        antiRec="You're in Brooklyn, not Manhattan — the commute adds 20-40 min to Midtown. If you need to be in the city center, this is a bad pick despite its charm.",
        neighborhood_context=NeighborhoodContext(
            walkability=8.5, noiseLevel="moderate", safetyFeel="safe",
            nearbyHighlights=["Smorgasburg", "Brooklyn waterfront", "Domino Park", "Indie galleries"]
        ),
        accessibility=["elevator", "limited ADA"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="not available", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Summer = rooftop + waterfront perfection. Winter reduces the appeal significantly."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=0, wifiIncluded=True),
        photoTrustScore=0.91,
        loyaltyPerks={"gold": "Manhattan view room", "platinum": "Factory suite + dinner"},
    ),
    Hotel(
        id="crosby",
        name="Crosby Street Hotel",
        neighborhood="SoHo",
        city="New York",
        starRating=5,
        pricePerNight=750,
        tags=["luxury", "art-filled", "soho-chic", "garden", "discreet"],
        reviews=Reviews(
            avgScore=4.9, count=650, recentTrend="stable",
            commonComplaints=["extremely expensive", "small lobby", "SoHo tourist crowds"],
            byTripType={
                "romantic": TripTypeReview(avg=4.9, count=200),
                "business": TripTypeReview(avg=4.5, count=100),
                "leisure": TripTypeReview(avg=4.8, count=250),
                "solo": TripTypeReview(avg=4.2, count=50),
                "family": TripTypeReview(avg=4.0, count=40),
            }
        ),
        antiRec="At $750+/night, this is a splurge that needs justification. SoHo streets are tourist-packed daytime. The hotel is intimate, but you're paying for the name and the art, not the square footage.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.2, noiseLevel="moderate-daytime", safetyFeel="very safe",
            nearbyHighlights=["SoHo galleries", "Balthazar", "Cast iron architecture", "Shopping"]
        ),
        accessibility=["elevator", "ADA rooms", "wheelchair-accessible garden"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="complimentary for suite guests", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Garden courtyard is stunning spring-fall. Holiday SoHo is magical but crowded."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=75, wifiIncluded=True, breakfastIncluded=True),
        photoTrustScore=0.96,
        loyaltyPerks={"gold": "Garden view + wine", "platinum": "Loft suite + private screening"},
    ),
    Hotel(
        id="pod51",
        name="Pod 51",
        neighborhood="Midtown East",
        city="New York",
        starRating=2,
        pricePerNight=110,
        tags=["budget", "micro-rooms", "efficient", "central", "solo-friendly"],
        reviews=Reviews(
            avgScore=3.8, count=3200, recentTrend="stable",
            commonComplaints=["tiny rooms", "shared bathrooms in some pods", "noisy neighbors"],
            byTripType={
                "romantic": TripTypeReview(avg=2.8, count=200),
                "business": TripTypeReview(avg=3.5, count=500),
                "leisure": TripTypeReview(avg=3.9, count=1200),
                "solo": TripTypeReview(avg=4.3, count=800),
                "family": TripTypeReview(avg=2.5, count=200),
            }
        ),
        antiRec="This is a pod hotel — rooms are utility-sized, not comfort-sized. If you need space, a desk, or privacy, look elsewhere. It's a bed in Manhattan, not a hotel experience.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.0, noiseLevel="moderate", safetyFeel="safe",
            nearbyHighlights=["Grand Central", "Rockefeller Center", "Central Park South"]
        ),
        accessibility=["elevator", "limited ADA"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="not available", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Year-round central location. Holiday season books fast."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=0, wifiIncluded=True),
        photoTrustScore=0.80,
    ),
    Hotel(
        id="1hotel_bk",
        name="1 Hotel Brooklyn Bridge",
        neighborhood="DUMBO, Brooklyn",
        city="New York",
        starRating=5,
        pricePerNight=450,
        tags=["eco", "luxury", "views", "rooftop-pool", "sustainable", "family-friendly"],
        reviews=Reviews(
            avgScore=4.6, count=1400, recentTrend="improving",
            commonComplaints=["Brooklyn commute", "eco-aesthetic not for everyone", "pricey restaurant"],
            byTripType={
                "romantic": TripTypeReview(avg=4.7, count=350),
                "business": TripTypeReview(avg=3.8, count=150),
                "leisure": TripTypeReview(avg=4.7, count=500),
                "solo": TripTypeReview(avg=4.0, count=100),
                "family": TripTypeReview(avg=4.5, count=250),
            }
        ),
        antiRec="You're paying Manhattan luxury prices for a Brooklyn location. The eco-aesthetic (reclaimed wood, hemp everything) is divisive. And the Manhattan skyline view? You're looking AT Manhattan, not IN it.",
        neighborhood_context=NeighborhoodContext(
            walkability=7.5, noiseLevel="low", safetyFeel="very safe",
            nearbyHighlights=["Brooklyn Bridge Park", "Jane's Carousel", "Time Out Market", "Manhattan skyline"]
        ),
        accessibility=["elevator", "ADA rooms", "pool lift", "wheelchair-accessible paths"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="for loyalty members", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Rooftop pool open May-Sep. Brooklyn Bridge walks are best fall mornings."),
        hiddenFees=HiddenFees(resortFee=25, parkingPerNight=55, wifiIncluded=True),
        photoTrustScore=0.93,
        loyaltyPerks={"gold": "Pool cabana + smoothie bar", "platinum": "Bridge view suite + spa credit"},
    ),
    Hotel(
        id="nomad",
        name="NoMad Hotel",
        neighborhood="NoMad",
        city="New York",
        starRating=4,
        pricePerNight=350,
        tags=["foodie", "atmospheric", "library", "cocktails", "design"],
        reviews=Reviews(
            avgScore=4.5, count=1350, recentTrend="stable",
            commonComplaints=["restaurant noise bleeds up", "dated rooms in older wing", "expensive F&B"],
            byTripType={
                "romantic": TripTypeReview(avg=4.6, count=300),
                "business": TripTypeReview(avg=4.2, count=250),
                "leisure": TripTypeReview(avg=4.5, count=500),
                "solo": TripTypeReview(avg=4.3, count=180),
                "family": TripTypeReview(avg=3.4, count=60),
            }
        ),
        antiRec="The restaurant is the real star — the rooms feel secondary. If you're not eating here, you're paying for atmosphere you won't fully experience. Older wing rooms need a refresh.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.2, noiseLevel="moderate", safetyFeel="safe",
            nearbyHighlights=["NoMad restaurant", "Eleven Madison Park", "Museum at FIT", "K-town"]
        ),
        accessibility=["elevator", "ADA rooms"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="upon request", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="NoMad Library is magical year-round. Restaurant reservations needed 2+ weeks out."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=55, wifiIncluded=True),
        photoTrustScore=0.88,
        loyaltyPerks={"gold": "Library access + cocktail", "platinum": "Suite + tasting menu"},
    ),
    Hotel(
        id="mercer",
        name="The Mercer",
        neighborhood="SoHo",
        city="New York",
        starRating=5,
        pricePerNight=450,
        tags=["loft-style", "luxury", "soho-icon", "celeb-favorite", "spacious"],
        reviews=Reviews(
            avgScore=4.7, count=780, recentTrend="stable",
            commonComplaints=["aging interiors", "SoHo crowds", "expensive for what you get"],
            byTripType={
                "romantic": TripTypeReview(avg=4.8, count=250),
                "business": TripTypeReview(avg=4.3, count=100),
                "leisure": TripTypeReview(avg=4.6, count=300),
                "solo": TripTypeReview(avg=4.1, count=60),
                "family": TripTypeReview(avg=4.2, count=50),
            }
        ),
        antiRec="Living on reputation. The loft aesthetic was groundbreaking in 1997 — now it feels dated compared to newer design hotels at half the price. SoHo streets are a tourist gauntlet.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.1, noiseLevel="high-daytime", safetyFeel="very safe",
            nearbyHighlights=["Mercer Kitchen", "Broadway shopping", "New Museum nearby", "Prince Street Pizza"]
        ),
        accessibility=["elevator", "ADA rooms", "wheelchair-accessible restaurant"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="12:00 PM", earlyCheckIn="complimentary", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Holiday surcharge Dec 20-Jan 2. Spring SoHo is the sweet spot."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=65, wifiIncluded=True, breakfastIncluded=True),
        photoTrustScore=0.89,
        loyaltyPerks={"gold": "Loft upgrade + Mercer Kitchen priority", "platinum": "Penthouse loft + car service"},
    ),
    Hotel(
        id="highline",
        name="The High Line Hotel",
        neighborhood="Chelsea",
        city="New York",
        starRating=4,
        pricePerNight=340,
        tags=["historic", "garden", "chelsea-charm", "art-district", "quiet"],
        reviews=Reviews(
            avgScore=4.4, count=920, recentTrend="improving",
            commonComplaints=["aging building quirks", "limited dining", "no pool or gym"],
            byTripType={
                "romantic": TripTypeReview(avg=4.6, count=250),
                "business": TripTypeReview(avg=3.7, count=100),
                "leisure": TripTypeReview(avg=4.5, count=350),
                "solo": TripTypeReview(avg=4.2, count=130),
                "family": TripTypeReview(avg=3.8, count=60),
            }
        ),
        antiRec="It's in a converted seminary — charming but quirky. Expect old-building idiosyncrasies: creaky floors, uneven heating, narrow hallways. No gym, no pool. The garden is the amenity.",
        neighborhood_context=NeighborhoodContext(
            walkability=8.7, noiseLevel="low", safetyFeel="safe",
            nearbyHighlights=["The High Line", "Chelsea Market", "Chelsea Galleries", "Hudson Yards"]
        ),
        accessibility=["elevator", "limited ADA", "garden accessible"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="$50", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Garden weddings spring-fall. High Line walking is best Apr-Oct."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=45, wifiIncluded=True),
        photoTrustScore=0.90,
        loyaltyPerks={"gold": "Garden-view room + coffee", "platinum": "Parlor suite + High Line tour"},
    ),
    Hotel(
        id="jane",
        name="The Jane Hotel",
        neighborhood="West Village",
        city="New York",
        starRating=2,
        pricePerNight=130,
        tags=["budget", "historic", "quirky", "nightlife", "backpacker-luxury"],
        reviews=Reviews(
            avgScore=3.9, count=2500, recentTrend="stable",
            commonComplaints=["cabin rooms are TINY", "shared bathrooms in cabins", "party noise"],
            byTripType={
                "romantic": TripTypeReview(avg=3.2, count=300),
                "business": TripTypeReview(avg=2.8, count=100),
                "leisure": TripTypeReview(avg=4.1, count=800),
                "solo": TripTypeReview(avg=4.5, count=700),
                "family": TripTypeReview(avg=2.5, count=100),
            }
        ),
        antiRec="Cabin rooms are literally ship-cabin-sized with shared bathrooms. The ballroom nightclub means noise until 2am. This is an experience, not comfort. Standard rooms exist but at 3x the price.",
        neighborhood_context=NeighborhoodContext(
            walkability=9.0, noiseLevel="high-nighttime", safetyFeel="safe",
            nearbyHighlights=["West Village brownstones", "Whitney Museum", "Hudson River", "Meatpacking District"]
        ),
        accessibility=["elevator to most floors", "limited ADA"],
        checkInOut=CheckInOut(checkIn="3:00 PM", checkOut="11:00 AM", earlyCheckIn="not available", luggageStorage=True),
        seasonalNotes=SeasonalNotes(general="Ballroom events year-round. Summer rooftop is a draw."),
        hiddenFees=HiddenFees(resortFee=0, parkingPerNight=0, wifiIncluded=True),
        photoTrustScore=0.78,
        loyaltyPerks={"gold": "Standard room upgrade + ballroom entry", "platinum": "Captain's cabin + cocktails"},
    ),
]


def get_hotels_json() -> list[dict]:
    """Return hotels as plain dicts for LLM consumption."""
    return [h.model_dump() for h in HOTELS]


def get_hotel_by_id(hotel_id: str) -> Optional[Hotel]:
    return next((h for h in HOTELS if h.id == hotel_id), None)
