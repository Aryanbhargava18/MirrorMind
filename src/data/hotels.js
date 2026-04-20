// TripSense — Mock Hotel Data (15 hotels, full attribute schema)
// Every hotel has verified/unverified attributes, anti-recs, neighborhood context,
// accessibility info, seasonal notes, hidden fees, and trip-type-specific review filtering.

export const hotels = [
  {
    id: 'h01',
    name: 'The Mercer',
    city: 'New York',
    neighborhood: 'SoHo',
    starRating: 5,
    pricePerNight: 450,
    totalCostExtras: { resortFee: 0, parking: 65, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/mercer.jpg' },
    amenities: ['spa', 'gym', 'concierge', 'room-service', 'minibar', 'rooftop'],
    tags: ['luxury', 'walkable', 'design-hotel', 'celeb-spot', 'quiet-rooms'],
    reviews: {
      avgScore: 4.7,
      count: 1842,
      sentimentScore: 0.91,
      topPositiveTag: 'impeccable service',
      topNegativeTag: 'overpriced minibar',
      recentTrend: 'stable',
      recencyWeight: 0.88,
      sampleQuotes: [
        { text: 'The lobby alone is worth the stay. Staff remembered my name on day two.', rating: 5, date: '2026-03-10', tripType: 'romantic' },
        { text: 'Beautiful but the minibar charges are outrageous. $18 for water.', rating: 4, date: '2026-02-22', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.8, count: 620 },
        business: { avg: 4.5, count: 480 },
        romantic: { avg: 4.9, count: 390 },
        solo: { avg: 4.4, count: 180 },
        family: { avg: 4.2, count: 172 }
      }
    },
    tripTypeScores: { leisure: 92, business: 85, family: 58, solo: 78, romantic: 95 },
    loyaltyPerks: {
      pointsEarnRate: 12,
      pointsRedeemOptions: [
        { points: 800, benefit: 'Free breakfast for two' },
        { points: 1500, benefit: 'Suite upgrade' },
        { points: 3000, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Late checkout until 2pm',
        gold: 'Welcome champagne + late checkout',
        platinum: 'Suite upgrade on availability + spa credit'
      }
    },
    antiRec: 'Not ideal for families — no kids\' club, limited connecting rooms, and the SoHo street noise can wake light sleepers after midnight.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.2,
      noiseLevel: 'moderate-evening',
      safetyFeel: 'very safe',
      nearbyHighlights: ['MoMA (12 min walk)', 'Washington Sq Park (5 min)', 'Broadway theaters (15 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom', 'visual-alerts'],
    seasonalNotes: { winter: 'Holiday surcharge Dec 20-Jan 2', summer: 'Great rooftop season', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'available ($75)', luggageStorage: true },
    photoTrustScore: 0.94,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility', 'checkInOut'],
    unverifiedAttributes: ['noiseLevel-after-midnight']
  },
  {
    id: 'h02',
    name: 'Ace Hotel',
    city: 'New York',
    neighborhood: 'NoMad',
    starRating: 4,
    pricePerNight: 280,
    totalCostExtras: { resortFee: 0, parking: 55, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/ace.jpg' },
    amenities: ['lobby-bar', 'gym', 'coworking', 'vinyl-lounge', 'restaurant'],
    tags: ['creative', 'social', 'walkable', 'hipster', 'nightlife'],
    reviews: {
      avgScore: 4.3,
      count: 2150,
      sentimentScore: 0.82,
      topPositiveTag: 'incredible vibe',
      topNegativeTag: 'small rooms',
      recentTrend: 'improving',
      recencyWeight: 0.92,
      sampleQuotes: [
        { text: 'The lobby is the best coworking space in NYC. Coffee is unreal.', rating: 5, date: '2026-03-15', tripType: 'solo' },
        { text: 'Room was the size of a closet. Stylish closet, but still.', rating: 3, date: '2026-01-08', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.5, count: 700 },
        business: { avg: 4.0, count: 520 },
        romantic: { avg: 4.2, count: 310 },
        solo: { avg: 4.7, count: 420 },
        family: { avg: 3.5, count: 200 }
      }
    },
    tripTypeScores: { leisure: 88, business: 72, family: 40, solo: 95, romantic: 75 },
    loyaltyPerks: {
      pointsEarnRate: 8,
      pointsRedeemOptions: [
        { points: 500, benefit: 'Welcome drink + vinyl session' },
        { points: 1200, benefit: 'Room upgrade' },
        { points: 2200, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Priority lobby seating',
        gold: 'Room upgrade + welcome drink',
        platinum: 'Full day early check-in + curated city guide'
      }
    },
    antiRec: 'Rooms are genuinely small — if you spread out or have large luggage, you\'ll feel cramped. Lobby is buzzy which means it can get loud on weekends.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.5,
      noiseLevel: 'lively',
      safetyFeel: 'safe',
      nearbyHighlights: ['Madison Square Park (3 min)', 'Eataly (5 min)', 'Empire State Building (8 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator'],
    seasonalNotes: { winter: 'Cozy lobby season, great for remote work', summer: 'No rooftop — can feel stuffy', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'not available', luggageStorage: true },
    photoTrustScore: 0.88,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility'],
    unverifiedAttributes: ['lobby-noise-level-weekends']
  },
  {
    id: 'h03',
    name: 'The Beekman',
    city: 'New York',
    neighborhood: 'Financial District',
    starRating: 5,
    pricePerNight: 520,
    totalCostExtras: { resortFee: 35, parking: 70, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/beekman.jpg' },
    amenities: ['spa', 'gym', 'restaurant', 'bar', 'concierge', 'turret-suite'],
    tags: ['historic', 'luxury', 'architecture', 'quiet', 'romantic'],
    reviews: {
      avgScore: 4.8,
      count: 1250,
      sentimentScore: 0.93,
      topPositiveTag: 'stunning atrium',
      topNegativeTag: 'far from midtown',
      recentTrend: 'stable',
      recencyWeight: 0.85,
      sampleQuotes: [
        { text: 'The Victorian atrium took my breath away. This is where architecture meets hospitality.', rating: 5, date: '2026-03-01', tripType: 'romantic' },
        { text: 'Love the building but FiDi is a ghost town after 7pm on weekdays.', rating: 4, date: '2026-02-14', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.6, count: 340 },
        business: { avg: 4.8, count: 420 },
        romantic: { avg: 4.9, count: 300 },
        solo: { avg: 4.5, count: 100 },
        family: { avg: 4.3, count: 90 }
      }
    },
    tripTypeScores: { leisure: 80, business: 90, family: 55, solo: 72, romantic: 94 },
    loyaltyPerks: {
      pointsEarnRate: 14,
      pointsRedeemOptions: [
        { points: 1000, benefit: 'Spa treatment for two' },
        { points: 2000, benefit: 'Turret suite upgrade' },
        { points: 4000, benefit: 'Free night + dinner' }
      ],
      tierBenefits: {
        silver: 'Welcome amenity',
        gold: 'Late checkout + welcome wine',
        platinum: 'Suite upgrade + $100 dining credit'
      }
    },
    antiRec: 'Financial District empties out at night — if you want a vibrant neighborhood for evening walks and spontaneous dining, this isn\'t it.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 7.8,
      noiseLevel: 'quiet-evening',
      safetyFeel: 'very safe',
      nearbyHighlights: ['Brooklyn Bridge (8 min walk)', 'South Street Seaport (3 min)', 'Wall Street (5 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom'],
    seasonalNotes: { winter: 'Holiday market nearby', summer: 'Great for waterfront walks', general: 'Resort fee applies year-round' },
    checkInOut: { checkIn: '4:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'available ($50)', luggageStorage: true },
    photoTrustScore: 0.96,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility', 'totalCostExtras'],
    unverifiedAttributes: []
  },
  {
    id: 'h04',
    name: 'citizenM Times Square',
    city: 'New York',
    neighborhood: 'Times Square',
    starRating: 3,
    pricePerNight: 160,
    totalCostExtras: { resortFee: 0, parking: 0, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/citizenm.jpg' },
    amenities: ['rooftop-bar', 'coworking', 'self-checkin', '24hr-food', 'smart-room'],
    tags: ['budget-luxury', 'tech-forward', 'social', 'walkable', 'no-frills'],
    reviews: {
      avgScore: 4.2,
      count: 3400,
      sentimentScore: 0.79,
      topPositiveTag: 'incredible value',
      topNegativeTag: 'tiny room',
      recentTrend: 'stable',
      recencyWeight: 0.90,
      sampleQuotes: [
        { text: 'Best value in Manhattan. The rooftop bar view is insane for this price.', rating: 5, date: '2026-03-12', tripType: 'solo' },
        { text: 'If you need space, look elsewhere. But for sleeping + exploring, it\'s perfect.', rating: 4, date: '2026-02-28', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.3, count: 1200 },
        business: { avg: 4.0, count: 800 },
        romantic: { avg: 3.8, count: 400 },
        solo: { avg: 4.6, count: 700 },
        family: { avg: 3.2, count: 300 }
      }
    },
    tripTypeScores: { leisure: 85, business: 70, family: 35, solo: 92, romantic: 55 },
    loyaltyPerks: {
      pointsEarnRate: 6,
      pointsRedeemOptions: [
        { points: 300, benefit: 'Free rooftop cocktail' },
        { points: 800, benefit: 'Room upgrade to corner view' },
        { points: 1500, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Priority self-check-in',
        gold: 'Rooftop bar credit + corner room',
        platinum: 'Free upgrade + late checkout'
      }
    },
    antiRec: 'Rooms are designed for efficiency, not comfort — no closet, no desk, and the bed fills 80% of the room. Times Square noise is constant.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.8,
      noiseLevel: 'very-loud',
      safetyFeel: 'safe',
      nearbyHighlights: ['Broadway theaters (1 min)', 'Central Park (10 min walk)', 'Restaurant Row (3 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'self-checkin-kiosk'],
    seasonalNotes: { winter: 'NYE pricing 3x normal', summer: 'Times Square gets extremely crowded', general: 'No hidden fees — truly all-in pricing' },
    checkInOut: { checkIn: '2:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'kiosk — whenever room is ready', luggageStorage: true },
    photoTrustScore: 0.91,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'totalCostExtras'],
    unverifiedAttributes: ['smart-room-reliability']
  },
  {
    id: 'h05',
    name: 'The Ludlow',
    city: 'New York',
    neighborhood: 'Lower East Side',
    starRating: 4,
    pricePerNight: 320,
    totalCostExtras: { resortFee: 0, parking: 50, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/ludlow.jpg' },
    amenities: ['rooftop-pool', 'restaurant', 'bar', 'gym', 'garden-terrace'],
    tags: ['trendy', 'rooftop-pool', 'nightlife', 'design-hotel', 'foodie'],
    reviews: {
      avgScore: 4.4,
      count: 980,
      sentimentScore: 0.86,
      topPositiveTag: 'rooftop pool is a dream',
      topNegativeTag: 'can be loud at night',
      recentTrend: 'improving',
      recencyWeight: 0.89,
      sampleQuotes: [
        { text: 'The rooftop pool at sunset is Manhattan\'s best kept secret. Dirty French downstairs is phenomenal.', rating: 5, date: '2026-03-18', tripType: 'romantic' },
        { text: 'LES is loud at 2am on weekends. Bring earplugs if you\'re a light sleeper.', rating: 3, date: '2026-01-20', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.6, count: 380 },
        business: { avg: 3.9, count: 160 },
        romantic: { avg: 4.7, count: 280 },
        solo: { avg: 4.5, count: 100 },
        family: { avg: 3.4, count: 60 }
      }
    },
    tripTypeScores: { leisure: 90, business: 60, family: 30, solo: 85, romantic: 92 },
    loyaltyPerks: {
      pointsEarnRate: 10,
      pointsRedeemOptions: [
        { points: 600, benefit: 'Poolside cabana reservation' },
        { points: 1000, benefit: 'Dinner for two at Dirty French' },
        { points: 2500, benefit: 'Free night + pool access' }
      ],
      tierBenefits: {
        silver: 'Welcome cocktail',
        gold: 'Pool priority + welcome cocktail',
        platinum: 'Suite upgrade + dinner credit'
      }
    },
    antiRec: 'The Lower East Side party scene means weekend noise until 3am. If you need early mornings or have kids, this will be a problem.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.0,
      noiseLevel: 'loud-weekends',
      safetyFeel: 'mostly safe',
      nearbyHighlights: ['Katz\'s Deli (5 min)', 'New Museum (4 min)', 'Williamsburg Bridge (8 min)']
    },
    accessibility: ['elevator', 'ground-floor-restaurant'],
    seasonalNotes: { winter: 'Pool closed Nov-Apr', summer: 'Peak rooftop season — book early', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'subject to availability', luggageStorage: true },
    photoTrustScore: 0.87,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight'],
    unverifiedAttributes: ['pool-hours-may-vary', 'noise-level-weekends']
  },
  {
    id: 'h06',
    name: 'Aman New York',
    city: 'New York',
    neighborhood: 'Midtown',
    starRating: 5,
    pricePerNight: 1200,
    totalCostExtras: { resortFee: 0, parking: 85, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/aman.jpg' },
    amenities: ['spa', 'pool', 'jazz-club', 'fine-dining', 'fireplace-suites', 'concierge'],
    tags: ['ultra-luxury', 'spa', 'quiet', 'intimate', 'architectural'],
    reviews: {
      avgScore: 4.9,
      count: 420,
      sentimentScore: 0.97,
      topPositiveTag: 'transcendent experience',
      topNegativeTag: 'eye-watering price',
      recentTrend: 'stable',
      recencyWeight: 0.82,
      sampleQuotes: [
        { text: 'I\'ve stayed at every luxury hotel in NYC. This is in a different universe.', rating: 5, date: '2026-02-20', tripType: 'romantic' },
        { text: 'Worth every penny if you can afford it. But most people can\'t, and that\'s the anti-rec.', rating: 5, date: '2026-03-05', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.9, count: 150 },
        business: { avg: 4.8, count: 100 },
        romantic: { avg: 5.0, count: 120 },
        solo: { avg: 4.7, count: 30 },
        family: { avg: 4.5, count: 20 }
      }
    },
    tripTypeScores: { leisure: 98, business: 88, family: 60, solo: 80, romantic: 99 },
    loyaltyPerks: {
      pointsEarnRate: 20,
      pointsRedeemOptions: [
        { points: 2000, benefit: 'Spa treatment' },
        { points: 5000, benefit: 'Suite upgrade + dining credit' },
        { points: 10000, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome amenity',
        gold: 'Spa access + welcome champagne',
        platinum: 'Personal host + suite upgrade + $500 credit'
      }
    },
    antiRec: 'At $1,200/night, this is a splurge that most budgets can\'t justify. The exclusivity can also feel isolating — you\'re in a bubble, not in New York.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 8.5,
      noiseLevel: 'quiet-inside',
      safetyFeel: 'very safe',
      nearbyHighlights: ['Central Park (5 min)', 'MoMA (8 min)', '5th Avenue shopping (2 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom', 'personal-assistance'],
    seasonalNotes: { winter: 'Fireplace suites are magical', summer: 'Rooftop garden at peak', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'always available for platinum', luggageStorage: true },
    photoTrustScore: 0.98,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility', 'checkInOut'],
    unverifiedAttributes: []
  },
  {
    id: 'h07',
    name: 'Pod 51',
    city: 'New York',
    neighborhood: 'Midtown East',
    starRating: 2,
    pricePerNight: 95,
    totalCostExtras: { resortFee: 0, parking: 0, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/pod51.jpg' },
    amenities: ['rooftop-garden', 'shared-kitchen', 'bike-rental', 'cafe'],
    tags: ['budget', 'minimalist', 'solo-friendly', 'walkable', 'no-frills'],
    reviews: {
      avgScore: 3.9,
      count: 4200,
      sentimentScore: 0.72,
      topPositiveTag: 'unbeatable location for price',
      topNegativeTag: 'room barely fits a suitcase',
      recentTrend: 'stable',
      recencyWeight: 0.87,
      sampleQuotes: [
        { text: 'For $95 in Midtown? I\'ll take the tiny room and spend the savings on Broadway.', rating: 4, date: '2026-03-08', tripType: 'solo' },
        { text: 'Functional but not comfortable. Walls are thin, rooms are micro.', rating: 3, date: '2026-02-15', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 3.8, count: 1400 },
        business: { avg: 3.2, count: 600 },
        romantic: { avg: 2.8, count: 300 },
        solo: { avg: 4.3, count: 1500 },
        family: { avg: 2.5, count: 400 }
      }
    },
    tripTypeScores: { leisure: 65, business: 40, family: 15, solo: 88, romantic: 20 },
    loyaltyPerks: {
      pointsEarnRate: 4,
      pointsRedeemOptions: [
        { points: 200, benefit: 'Free coffee for stay' },
        { points: 500, benefit: 'Room upgrade to queen pod' },
        { points: 900, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome coffee',
        gold: 'Best-available pod + coffee',
        platinum: 'Queen pod upgrade + bike rental'
      }
    },
    antiRec: 'This is a pod hotel — the room is essentially a bed with walls. No desk, no closet, thin walls. Only works if you treat the hotel as a place to sleep, nothing more.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.4,
      noiseLevel: 'moderate',
      safetyFeel: 'safe',
      nearbyHighlights: ['Grand Central (5 min)', 'UN Headquarters (7 min)', 'Rockefeller Center (10 min)']
    },
    accessibility: ['elevator'],
    seasonalNotes: { winter: 'Rooftop closed', summer: 'Rooftop garden is lovely', general: 'No hidden fees at all' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'not available', luggageStorage: true },
    photoTrustScore: 0.85,
    verifiedAttributes: ['starRating', 'pricePerNight', 'totalCostExtras'],
    unverifiedAttributes: ['wifi-speed', 'noise-insulation']
  },
  {
    id: 'h08',
    name: 'The Greenwich Hotel',
    city: 'New York',
    neighborhood: 'TriBeCa',
    starRating: 5,
    pricePerNight: 680,
    totalCostExtras: { resortFee: 0, parking: 60, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/greenwich.jpg' },
    amenities: ['pool', 'spa', 'restaurant', 'drawing-room', 'courtyard', 'lantern-lit-pool'],
    tags: ['intimate', 'luxury', 'quiet', 'romantic', 'celeb-discreet', 'unique-rooms'],
    reviews: {
      avgScore: 4.8,
      count: 890,
      sentimentScore: 0.95,
      topPositiveTag: 'feels like a secret',
      topNegativeTag: 'hard to get a reservation',
      recentTrend: 'stable',
      recencyWeight: 0.84,
      sampleQuotes: [
        { text: 'Every room is different. The Japanese-inspired pool is the most beautiful thing I\'ve seen in a hotel.', rating: 5, date: '2026-03-22', tripType: 'romantic' },
        { text: 'Robert De Niro\'s hotel lives up to every expectation. Intimate, warm, zero pretension.', rating: 5, date: '2026-02-10', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.9, count: 310 },
        business: { avg: 4.5, count: 180 },
        romantic: { avg: 4.9, count: 260 },
        solo: { avg: 4.6, count: 70 },
        family: { avg: 4.4, count: 70 }
      }
    },
    tripTypeScores: { leisure: 94, business: 78, family: 65, solo: 82, romantic: 97 },
    loyaltyPerks: {
      pointsEarnRate: 15,
      pointsRedeemOptions: [
        { points: 1200, benefit: 'Pool & spa day pass' },
        { points: 2500, benefit: 'Drawing room cocktail evening' },
        { points: 5000, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome cortado',
        gold: 'Pool access + drawing room invite',
        platinum: 'Preferred room + $200 Locanda Verde credit'
      }
    },
    antiRec: 'TriBeCa is quiet — almost too quiet if you want nightlife energy. Also, the intimate scale (88 rooms) means availability is scarce.',
    hiddenGem: true,
    neighborhood_context: {
      walkability: 8.2,
      noiseLevel: 'quiet',
      safetyFeel: 'very safe',
      nearbyHighlights: ['Hudson River Park (5 min)', 'Locanda Verde restaurant (in-hotel)', 'One World Trade (10 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom'],
    seasonalNotes: { winter: 'Courtyard with heat lamps is magical', summer: 'Pool is the highlight', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'best-effort, complimentary', luggageStorage: true },
    photoTrustScore: 0.92,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility'],
    unverifiedAttributes: ['celeb-sighting-frequency']
  },
  {
    id: 'h09',
    name: 'MADE Hotel',
    city: 'New York',
    neighborhood: 'NoMad',
    starRating: 4,
    pricePerNight: 220,
    totalCostExtras: { resortFee: 0, parking: 45, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/made.jpg' },
    amenities: ['coffee-shop', 'restaurant', 'gym', 'library-lounge'],
    tags: ['design-hotel', 'affordable-chic', 'walkable', 'local-feel', 'quiet'],
    reviews: {
      avgScore: 4.3,
      count: 1560,
      sentimentScore: 0.84,
      topPositiveTag: 'design-forward on a budget',
      topNegativeTag: 'basic amenities',
      recentTrend: 'improving',
      recencyWeight: 0.91,
      sampleQuotes: [
        { text: 'Finally, a well-designed hotel that doesn\'t charge $500. The coffee shop is legit.', rating: 5, date: '2026-03-14', tripType: 'solo' },
        { text: 'Nice design but no room service, no minibar. You get what you pay for.', rating: 3, date: '2026-02-02', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.4, count: 550 },
        business: { avg: 4.1, count: 380 },
        romantic: { avg: 4.2, count: 250 },
        solo: { avg: 4.6, count: 280 },
        family: { avg: 3.8, count: 100 }
      }
    },
    tripTypeScores: { leisure: 86, business: 75, family: 52, solo: 90, romantic: 78 },
    loyaltyPerks: {
      pointsEarnRate: 7,
      pointsRedeemOptions: [
        { points: 400, benefit: 'Free coffee for entire stay' },
        { points: 900, benefit: 'Room with a view upgrade' },
        { points: 1800, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome coffee',
        gold: 'High-floor room + coffee',
        platinum: 'Best room available + restaurant credit'
      }
    },
    antiRec: 'If you expect full-service luxury (room service, turndown, minibar), this won\'t deliver. It\'s a design hotel, not a pampering hotel.',
    hiddenGem: true,
    neighborhood_context: {
      walkability: 9.3,
      noiseLevel: 'moderate',
      safetyFeel: 'safe',
      nearbyHighlights: ['Flatiron Building (6 min)', 'Koreatown (4 min)', 'Union Square (10 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator'],
    seasonalNotes: { winter: 'Library lounge is a highlight', summer: 'No outdoor space', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'subject to availability', luggageStorage: true },
    photoTrustScore: 0.90,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight'],
    unverifiedAttributes: ['gym-equipment-quality']
  },
  {
    id: 'h10',
    name: 'The Standard High Line',
    city: 'New York',
    neighborhood: 'Meatpacking District',
    starRating: 4,
    pricePerNight: 380,
    totalCostExtras: { resortFee: 0, parking: 55, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/standard.jpg' },
    amenities: ['rooftop-bar', 'beer-garden', 'restaurant', 'gym', 'floor-to-ceiling-windows'],
    tags: ['party', 'rooftop', 'scenic', 'nightlife', 'iconic', 'social'],
    reviews: {
      avgScore: 4.2,
      count: 2800,
      sentimentScore: 0.80,
      topPositiveTag: 'the views are insane',
      topNegativeTag: 'party hotel problems',
      recentTrend: 'stable',
      recencyWeight: 0.86,
      sampleQuotes: [
        { text: 'Floor-to-ceiling windows over the High Line. Woke up feeling like I owned Manhattan.', rating: 5, date: '2026-03-20', tripType: 'solo' },
        { text: 'The rooftop bar brings crowds and noise. Beautiful chaos if you\'re into it, misery if you\'re not.', rating: 3, date: '2026-01-15', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.4, count: 900 },
        business: { avg: 3.6, count: 500 },
        romantic: { avg: 4.3, count: 600 },
        solo: { avg: 4.5, count: 500 },
        family: { avg: 3.0, count: 300 }
      }
    },
    tripTypeScores: { leisure: 88, business: 55, family: 25, solo: 90, romantic: 82 },
    loyaltyPerks: {
      pointsEarnRate: 9,
      pointsRedeemOptions: [
        { points: 700, benefit: 'VIP rooftop access' },
        { points: 1500, benefit: 'High-floor panoramic room' },
        { points: 3000, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome drink at Le Bain',
        gold: 'Rooftop VIP + high floor',
        platinum: 'Penthouse waitlist priority + dinner credit'
      }
    },
    antiRec: 'This is a party hotel. If you need peace, predictability, or early sleep, the thumping bass from Le Bain will be your nemesis. Floor-to-ceiling windows also mean zero privacy.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.0,
      noiseLevel: 'very-loud-weekends',
      safetyFeel: 'safe',
      nearbyHighlights: ['High Line (attached)', 'Whitney Museum (3 min)', 'Chelsea Market (5 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator'],
    seasonalNotes: { winter: 'Beer garden closed', summer: 'Peak rooftop season — expect lines', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'available ($100)', luggageStorage: true },
    photoTrustScore: 0.83,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight'],
    unverifiedAttributes: ['privacy-floor-to-ceiling-windows', 'noise-from-le-bain']
  },
  {
    id: 'h11',
    name: 'The Marlton',
    city: 'New York',
    neighborhood: 'Greenwich Village',
    starRating: 4,
    pricePerNight: 290,
    totalCostExtras: { resortFee: 0, parking: 50, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/marlton.jpg' },
    amenities: ['espresso-bar', 'lobby-library', 'fireplace', 'curated-minibar'],
    tags: ['literary', 'cozy', 'intimate', 'village-charm', 'quiet', 'romantic'],
    reviews: {
      avgScore: 4.5,
      count: 760,
      sentimentScore: 0.89,
      topPositiveTag: 'feels like a Parisian hideaway',
      topNegativeTag: 'rooms are snug',
      recentTrend: 'stable',
      recencyWeight: 0.86,
      sampleQuotes: [
        { text: 'Jack Kerouac stayed here and I can see why. The lobby fireplace, the espresso bar — it\'s literary heaven.', rating: 5, date: '2026-03-05', tripType: 'solo' },
        { text: 'Charming but rooms are small by American standards. Very European feel.', rating: 4, date: '2026-02-18', tripType: 'romantic' }
      ],
      byTripType: {
        leisure: { avg: 4.6, count: 280 },
        business: { avg: 4.2, count: 120 },
        romantic: { avg: 4.7, count: 220 },
        solo: { avg: 4.6, count: 100 },
        family: { avg: 3.5, count: 40 }
      }
    },
    tripTypeScores: { leisure: 87, business: 68, family: 42, solo: 88, romantic: 91 },
    loyaltyPerks: {
      pointsEarnRate: 8,
      pointsRedeemOptions: [
        { points: 500, benefit: 'Curated minibar experience' },
        { points: 1100, benefit: 'Room upgrade + welcome drink' },
        { points: 2200, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome espresso',
        gold: 'Fireplace room + espresso',
        platinum: 'Best room + dinner reservation at Margaux'
      }
    },
    antiRec: 'Rooms are charming but small — think Parisian proportions, not American ones. No gym, no pool, no room service. This is all about atmosphere, not amenities.',
    hiddenGem: true,
    neighborhood_context: {
      walkability: 9.6,
      noiseLevel: 'moderate',
      safetyFeel: 'very safe',
      nearbyHighlights: ['Washington Square Park (1 min)', 'Comedy Cellar (3 min)', 'Blue Note Jazz (5 min)']
    },
    accessibility: ['elevator'],
    seasonalNotes: { winter: 'Fireplace season — the best time', summer: 'Village outdoor dining is special', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'subject to availability', luggageStorage: true },
    photoTrustScore: 0.91,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight'],
    unverifiedAttributes: ['literary-history-accuracy']
  },
  {
    id: 'h12',
    name: 'The William Vale',
    city: 'New York',
    neighborhood: 'Williamsburg, Brooklyn',
    starRating: 4,
    pricePerNight: 310,
    totalCostExtras: { resortFee: 25, parking: 40, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/williamvale.jpg' },
    amenities: ['rooftop-pool', 'restaurant', 'bar', 'gym', 'terrace', 'skyline-views'],
    tags: ['brooklyn', 'rooftop-pool', 'scenic', 'trendy', 'family-friendly', 'spacious'],
    reviews: {
      avgScore: 4.4,
      count: 2100,
      sentimentScore: 0.85,
      topPositiveTag: 'best skyline views in NYC',
      topNegativeTag: 'not walkable to Manhattan attractions',
      recentTrend: 'improving',
      recencyWeight: 0.90,
      sampleQuotes: [
        { text: 'The Manhattan skyline from the pool is worth crossing the bridge for. Rooms are spacious by NYC standards.', rating: 5, date: '2026-03-16', tripType: 'family' },
        { text: 'Williamsburg is cool but you\'ll Uber everywhere to Manhattan. Factor that into the "savings."', rating: 4, date: '2026-02-25', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.5, count: 700 },
        business: { avg: 4.0, count: 300 },
        romantic: { avg: 4.5, count: 450 },
        solo: { avg: 4.3, count: 350 },
        family: { avg: 4.4, count: 300 }
      }
    },
    tripTypeScores: { leisure: 85, business: 62, family: 78, solo: 80, romantic: 86 },
    loyaltyPerks: {
      pointsEarnRate: 9,
      pointsRedeemOptions: [
        { points: 500, benefit: 'Pool day pass for two' },
        { points: 1200, benefit: 'Skyline view room upgrade' },
        { points: 2400, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome drink at Westlight',
        gold: 'Pool priority + skyline room',
        platinum: 'Suite upgrade + $150 dining credit'
      }
    },
    antiRec: 'You\'re in Brooklyn, not Manhattan. If your itinerary is Manhattan-centric, you\'ll spend $20-40/day on Ubers. The resort fee also adds $25/night that isn\'t in the quoted price.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 7.5,
      noiseLevel: 'moderate',
      safetyFeel: 'safe',
      nearbyHighlights: ['Bedford Ave shops (5 min)', 'Smorgasburg (weekends, 3 min)', 'Brooklyn Brewery (8 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom', 'pool-lift'],
    seasonalNotes: { winter: 'Pool closed Nov-Apr, resort fee still applies', summer: 'Best pool experience in NYC', general: 'Resort fee year-round' },
    checkInOut: { checkIn: '4:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'available ($60)', luggageStorage: true },
    photoTrustScore: 0.89,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'totalCostExtras', 'accessibility'],
    unverifiedAttributes: ['pool-crowding-summer']
  },
  {
    id: 'h13',
    name: 'Freehand New York',
    city: 'New York',
    neighborhood: 'Flatiron',
    starRating: 3,
    pricePerNight: 175,
    totalCostExtras: { resortFee: 0, parking: 0, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/freehand.jpg' },
    amenities: ['rooftop-bar', 'lobby-bar', 'coworking', 'restaurant', 'shared-rooms'],
    tags: ['social', 'affordable', 'rooftop', 'creative', 'backpacker-upgrade'],
    reviews: {
      avgScore: 4.1,
      count: 1800,
      sentimentScore: 0.77,
      topPositiveTag: 'rooftop bar is everything',
      topNegativeTag: 'hostel vibes can be a pro or con',
      recentTrend: 'stable',
      recencyWeight: 0.88,
      sampleQuotes: [
        { text: 'Broken Shaker on the roof is one of the best bars in Manhattan. The private rooms are solid at this price.', rating: 4, date: '2026-03-11', tripType: 'solo' },
        { text: 'It\'s a fancy hostel. If you expect hotel-level service, adjust expectations.', rating: 3, date: '2026-01-22', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.0, count: 600 },
        business: { avg: 3.5, count: 250 },
        romantic: { avg: 3.8, count: 200 },
        solo: { avg: 4.5, count: 550 },
        family: { avg: 3.0, count: 200 }
      }
    },
    tripTypeScores: { leisure: 78, business: 55, family: 30, solo: 92, romantic: 60 },
    loyaltyPerks: {
      pointsEarnRate: 5,
      pointsRedeemOptions: [
        { points: 300, benefit: 'Broken Shaker cocktail voucher' },
        { points: 700, benefit: 'Room upgrade to deluxe' },
        { points: 1400, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Priority rooftop entry',
        gold: 'Rooftop VIP + room upgrade',
        platinum: 'Best room + bar tab credit'
      }
    },
    antiRec: 'At its core, this is a hostel that grew up. Walls are thin, service is casual not polished, and shared spaces can get loud. Not for those who want traditional hotel experiences.',
    hiddenGem: true,
    neighborhood_context: {
      walkability: 9.4,
      noiseLevel: 'moderate-lively',
      safetyFeel: 'safe',
      nearbyHighlights: ['Madison Square Park (5 min)', 'Eataly (6 min)', 'Flatiron Building (3 min)']
    },
    accessibility: ['elevator', 'ground-floor-access'],
    seasonalNotes: { winter: 'Rooftop has heated section', summer: 'Peak rooftop season, long waits', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'not available', luggageStorage: true },
    photoTrustScore: 0.82,
    verifiedAttributes: ['starRating', 'pricePerNight', 'amenities'],
    unverifiedAttributes: ['noise-levels', 'service-consistency']
  },
  {
    id: 'h14',
    name: 'The Whitby',
    city: 'New York',
    neighborhood: 'Midtown West',
    starRating: 5,
    pricePerNight: 550,
    totalCostExtras: { resortFee: 0, parking: 65, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/whitby.jpg' },
    amenities: ['screening-room', 'gym', 'drawing-room', 'restaurant', 'bar', 'art-collection'],
    tags: ['art', 'luxury', 'colorful', 'design-hotel', 'cultural', 'quiet'],
    reviews: {
      avgScore: 4.7,
      count: 640,
      sentimentScore: 0.92,
      topPositiveTag: 'every corner is a work of art',
      topNegativeTag: 'can feel overly curated',
      recentTrend: 'stable',
      recencyWeight: 0.83,
      sampleQuotes: [
        { text: 'Kit Kemp\'s design genius on full display. The screening room for guests is a revelation.', rating: 5, date: '2026-03-08', tripType: 'leisure' },
        { text: 'Stunning but there\'s so much pattern and color that some rooms feel busy.', rating: 4, date: '2026-02-20', tripType: 'business' }
      ],
      byTripType: {
        leisure: { avg: 4.8, count: 240 },
        business: { avg: 4.5, count: 160 },
        romantic: { avg: 4.7, count: 140 },
        solo: { avg: 4.6, count: 60 },
        family: { avg: 4.3, count: 40 }
      }
    },
    tripTypeScores: { leisure: 92, business: 82, family: 60, solo: 84, romantic: 88 },
    loyaltyPerks: {
      pointsEarnRate: 13,
      pointsRedeemOptions: [
        { points: 1000, benefit: 'Private screening room booking' },
        { points: 2000, benefit: 'Studio suite upgrade' },
        { points: 4500, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome tea in the drawing room',
        gold: 'Screening room access + tea',
        platinum: 'Studio suite + art tour + drawing room'
      }
    },
    antiRec: 'The maximalist design is polarizing — if you prefer clean minimalism (think Aman), the bold patterns and colors in every room may feel overwhelming rather than inspiring.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 9.0,
      noiseLevel: 'quiet-inside',
      safetyFeel: 'very safe',
      nearbyHighlights: ['MoMA (5 min)', 'Central Park (8 min)', 'Carnegie Hall (6 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom'],
    seasonalNotes: { winter: 'Drawing room with afternoon tea is peak cozy', summer: 'No outdoor space', general: '' },
    checkInOut: { checkIn: '3:00 PM', checkOut: '12:00 PM', earlyCheckIn: 'available ($75)', luggageStorage: true },
    photoTrustScore: 0.95,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'accessibility'],
    unverifiedAttributes: []
  },
  {
    id: 'h15',
    name: '1 Hotel Brooklyn Bridge',
    city: 'New York',
    neighborhood: 'DUMBO, Brooklyn',
    starRating: 4,
    pricePerNight: 350,
    totalCostExtras: { resortFee: 30, parking: 45, wifi: 0 },
    currency: 'USD',
    images: { hero: '/hotels/1hotel.jpg' },
    amenities: ['rooftop-pool', 'spa', 'gym', 'restaurant', 'skyline-views', 'eco-conscious'],
    tags: ['eco', 'family-friendly', 'scenic', 'brooklyn', 'rooftop-pool', 'sustainable'],
    reviews: {
      avgScore: 4.4,
      count: 1650,
      sentimentScore: 0.84,
      topPositiveTag: 'most beautiful hotel pool in NYC',
      topNegativeTag: 'resort fee adds up',
      recentTrend: 'stable',
      recencyWeight: 0.87,
      sampleQuotes: [
        { text: 'Waking up to the Brooklyn Bridge view with an eco-clean conscience. The pool at sunset is perfection.', rating: 5, date: '2026-03-19', tripType: 'family' },
        { text: 'Love the sustainability mission but the resort fee feels greenwashy. Just include it.', rating: 4, date: '2026-02-12', tripType: 'leisure' }
      ],
      byTripType: {
        leisure: { avg: 4.5, count: 550 },
        business: { avg: 4.1, count: 280 },
        romantic: { avg: 4.5, count: 380 },
        solo: { avg: 4.2, count: 220 },
        family: { avg: 4.6, count: 220 }
      }
    },
    tripTypeScores: { leisure: 86, business: 65, family: 82, solo: 75, romantic: 87 },
    loyaltyPerks: {
      pointsEarnRate: 10,
      pointsRedeemOptions: [
        { points: 600, benefit: 'Spa treatment' },
        { points: 1300, benefit: 'Skyline view room upgrade' },
        { points: 2800, benefit: 'Free night' }
      ],
      tierBenefits: {
        silver: 'Welcome juice + eco-kit',
        gold: 'Pool priority + skyline room',
        platinum: 'Suite upgrade + spa day + dinner'
      }
    },
    antiRec: 'Resort fee of $30/night isn\'t in the listed price. Brooklyn location means you\'re a subway ride from most Manhattan attractions. The eco-branding is genuine but doesn\'t mean budget-friendly.',
    hiddenGem: false,
    neighborhood_context: {
      walkability: 7.8,
      noiseLevel: 'quiet',
      safetyFeel: 'very safe',
      nearbyHighlights: ['Brooklyn Bridge Park (1 min)', 'Jane\'s Carousel (3 min)', 'Grimaldi\'s Pizza (5 min)']
    },
    accessibility: ['wheelchair-accessible', 'elevator', 'ada-bathroom', 'pool-lift'],
    seasonalNotes: { winter: 'Pool heated but cold surroundings', summer: 'Best pool in NYC', general: 'Resort fee year-round ($30/night)' },
    checkInOut: { checkIn: '4:00 PM', checkOut: '11:00 AM', earlyCheckIn: 'available ($50)', luggageStorage: true },
    photoTrustScore: 0.90,
    verifiedAttributes: ['starRating', 'amenities', 'pricePerNight', 'totalCostExtras', 'accessibility'],
    unverifiedAttributes: ['eco-certification-details']
  }
];
