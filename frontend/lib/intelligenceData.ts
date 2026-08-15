export interface OccupancySnapshot {
  currentOccupancy: number;
  predicted30m: number;
  predicted60m: number;
  predicted120m: number;
}

export interface DemandPoint {
  time: string;
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  occupancyPercent: number;
  availableBays: number;
}

export interface RecommendationReason {
  id: string;
  label: string;
  description: string;
}

export interface IntelligenceFacility {
  id: string;
  name: string;
  zone: string;
  distanceKm: number;
  walkMinutes: number;
  ratePerHour: number;
  evCharging: boolean;
  security24x7: boolean;
  covered: boolean;
  currentOccupancy: number;
  predictedOccupancy: number; // occupancy in +60m
  availableBays: number;
  totalBays: number;
  forecastConfidence: number;
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  recommendationScore: number; // match % out of 100
  tags: string[];
  reasons: RecommendationReason[];
  occupancySnapshot: OccupancySnapshot;
  hourlyForecast: DemandPoint[];
}

export interface RegionalSummary {
  regionId: string;
  regionName: string;
  occupancy: number;
  predictedOccupancy: number;
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  availableBays: number;
  confidence: number;
  searchTimeSavedMin: number;
}

export const MOCK_REGIONS: RegionalSummary[] = [
  {
    regionId: 'metro-central',
    regionName: 'Metro Central',
    occupancy: 74,
    predictedOccupancy: 81,
    demandLevel: 'HIGH',
    availableBays: 348,
    confidence: 96.8,
    searchTimeSavedMin: 14.5,
  },
  {
    regionId: 'cyber-city',
    regionName: 'Cyber City',
    occupancy: 62,
    predictedOccupancy: 68,
    demandLevel: 'MODERATE',
    availableBays: 512,
    confidence: 94.2,
    searchTimeSavedMin: 12.1,
  },
  {
    regionId: 'techpark',
    regionName: 'TechPark',
    occupancy: 86,
    predictedOccupancy: 92,
    demandLevel: 'VERY HIGH',
    availableBays: 120,
    confidence: 97.5,
    searchTimeSavedMin: 18.2,
  },
  {
    regionId: 'financial-plaza',
    regionName: 'Financial Plaza',
    occupancy: 45,
    predictedOccupancy: 50,
    demandLevel: 'LOW',
    availableBays: 680,
    confidence: 91.8,
    searchTimeSavedMin: 8.4,
  },
];

export const MOCK_INTELLIGENCE_FACILITIES: Record<string, IntelligenceFacility[]> = {
  'metro-central': [
    {
      id: 'fac-mc-1',
      name: 'Central Metro Junction Station',
      zone: 'Metro Central',
      distanceKm: 0.6,
      walkMinutes: 6,
      ratePerHour: 80,
      evCharging: true,
      security24x7: true,
      covered: true,
      currentOccupancy: 72,
      predictedOccupancy: 78,
      availableBays: 42,
      totalBays: 150,
      forecastConfidence: 96.8,
      demandLevel: 'HIGH',
      recommendationScore: 96.8,
      tags: ['Transit Hub', 'Underground', 'EV Fast Charge'],
      reasons: [
        { id: 'r1', label: 'High Predicted Availability', description: 'Stable availability forecast for the next 45 minutes.' },
        { id: 'r2', label: 'Proximity Match', description: 'Only a 6-minute walk to central plaza transit entries.' },
        { id: 'r3', label: 'Optimized Pricing', description: 'Lowest peak rate among covered facilities in this zone.' },
        { id: 'r4', label: 'EV Priority Charging', description: 'Active fast-charger status confirmed online.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 72,
        predicted30m: 75,
        predicted60m: 78,
        predicted120m: 85
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'MODERATE', occupancyPercent: 55, availableBays: 67 },
        { time: '15:00', demandLevel: 'MODERATE', occupancyPercent: 62, availableBays: 57 },
        { time: '16:00', demandLevel: 'HIGH', occupancyPercent: 68, availableBays: 48 },
        { time: '17:00', demandLevel: 'HIGH', occupancyPercent: 70, availableBays: 45 },
        { time: '18:00', demandLevel: 'HIGH', occupancyPercent: 72, availableBays: 42 },
        { time: '19:00', demandLevel: 'VERY HIGH', occupancyPercent: 78, availableBays: 33 },
        { time: '20:00', demandLevel: 'VERY HIGH', occupancyPercent: 85, availableBays: 22 },
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 80, availableBays: 30 },
        { time: '22:00', demandLevel: 'MODERATE', occupancyPercent: 60, availableBays: 60 }
      ]
    },
    {
      id: 'fac-mc-2',
      name: 'Grand Galleria Shopping Deck',
      zone: 'Metro Central',
      distanceKm: 0.9,
      walkMinutes: 9,
      ratePerHour: 100,
      evCharging: false,
      security24x7: true,
      covered: true,
      currentOccupancy: 88,
      predictedOccupancy: 94,
      availableBays: 21,
      totalBays: 180,
      forecastConfidence: 94.5,
      demandLevel: 'VERY HIGH',
      recommendationScore: 82.5,
      tags: ['Retail Zone', 'Premium Deck', 'CCTV Monitor'],
      reasons: [
        { id: 'r1', label: 'Covered Deck', description: 'Complete weather protection across all levels.' },
        { id: 'r2', label: 'Direct Access', description: 'Direct elevators linking to the premium retail concourse.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 88,
        predicted30m: 91,
        predicted60m: 94,
        predicted120m: 97
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'HIGH', occupancyPercent: 78, availableBays: 39 },
        { time: '15:00', demandLevel: 'HIGH', occupancyPercent: 82, availableBays: 32 },
        { time: '16:00', demandLevel: 'VERY HIGH', occupancyPercent: 85, availableBays: 27 },
        { time: '17:00', demandLevel: 'VERY HIGH', occupancyPercent: 88, availableBays: 21 },
        { time: '18:00', demandLevel: 'VERY HIGH', occupancyPercent: 92, availableBays: 14 },
        { time: '19:00', demandLevel: 'VERY HIGH', occupancyPercent: 94, availableBays: 10 },
        { time: '20:00', demandLevel: 'VERY HIGH', occupancyPercent: 96, availableBays: 7 },
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 89, availableBays: 19 },
        { time: '22:00', demandLevel: 'MODERATE', occupancyPercent: 70, availableBays: 54 }
      ]
    },
    {
      id: 'fac-mc-3',
      name: 'Connaught Plaza Multi-Level',
      zone: 'Metro Central',
      distanceKm: 1.2,
      walkMinutes: 12,
      ratePerHour: 60,
      evCharging: true,
      security24x7: false,
      covered: false,
      currentOccupancy: 50,
      predictedOccupancy: 55,
      availableBays: 100,
      totalBays: 200,
      forecastConfidence: 91.0,
      demandLevel: 'MODERATE',
      recommendationScore: 89.0,
      tags: ['Open Sky', 'Economic Rate', 'ANPR Entry'],
      reasons: [
        { id: 'r1', label: 'Highest Availability', description: 'Over 100 open bays currently ready for entry.' },
        { id: 'r2', label: 'Economic Choice', description: 'Saves ₹20 per hour compared to metro central stations.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 50,
        predicted30m: 52,
        predicted60m: 55,
        predicted120m: 60
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'LOW', occupancyPercent: 40, availableBays: 120 },
        { time: '15:00', demandLevel: 'LOW', occupancyPercent: 42, availableBays: 116 },
        { time: '16:00', demandLevel: 'MODERATE', occupancyPercent: 45, availableBays: 110 },
        { time: '17:00', demandLevel: 'MODERATE', occupancyPercent: 48, availableBays: 104 },
        { time: '18:00', demandLevel: 'MODERATE', occupancyPercent: 50, availableBays: 100 },
        { time: '19:00', demandLevel: 'MODERATE', occupancyPercent: 53, availableBays: 94 },
        { time: '20:00', demandLevel: 'HIGH', occupancyPercent: 62, availableBays: 76 },
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 58, availableBays: 84 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 38, availableBays: 124 }
      ]
    }
  ],
  'cyber-city': [
    {
      id: 'fac-cc-1',
      name: 'Cyber City Innovation Hub Garage',
      zone: 'Cyber City',
      distanceKm: 0.8,
      walkMinutes: 7,
      ratePerHour: 90,
      evCharging: true,
      security24x7: true,
      covered: true,
      currentOccupancy: 62,
      predictedOccupancy: 68,
      availableBays: 45,
      totalBays: 120,
      forecastConfidence: 94.2,
      demandLevel: 'MODERATE',
      recommendationScore: 95.0,
      tags: ['Fast Charge', 'Valet Available', 'Enterprise Priority'],
      reasons: [
        { id: 'r1', label: 'Premium Amenities', description: 'Valet parking and automated security check-ins.' },
        { id: 'r2', label: 'Stable Occupancy', description: 'Steady entry rate ensures a stress-free arrival window.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 62,
        predicted30m: 65,
        predicted60m: 68,
        predicted120m: 74
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'MODERATE', occupancyPercent: 58, availableBays: 50 },
        { time: '15:00', demandLevel: 'MODERATE', occupancyPercent: 60, availableBays: 48 },
        { time: '16:00', demandLevel: 'MODERATE', occupancyPercent: 62, availableBays: 45 },
        { time: '17:00', demandLevel: 'HIGH', occupancyPercent: 65, availableBays: 42 },
        { time: '18:00', demandLevel: 'HIGH', occupancyPercent: 68, availableBays: 38 },
        { time: '19:00', demandLevel: 'HIGH', occupancyPercent: 71, availableBays: 34 },
        { time: '20:00', demandLevel: 'MODERATE', occupancyPercent: 66, availableBays: 40 },
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 50, availableBays: 60 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 40, availableBays: 72 }
      ]
    },
    {
      id: 'fac-cc-2',
      name: 'Corporate Towers West Lot',
      zone: 'Cyber City',
      distanceKm: 1.5,
      walkMinutes: 15,
      ratePerHour: 50,
      evCharging: false,
      security24x7: true,
      covered: false,
      currentOccupancy: 45,
      predictedOccupancy: 48,
      availableBays: 82,
      totalBays: 150,
      forecastConfidence: 91.5,
      demandLevel: 'LOW',
      recommendationScore: 84.0,
      tags: ['Open Sky Lot', 'Economic', 'Easy Exit'],
      reasons: [
        { id: 'r1', label: 'Highly Economical', description: 'Save over 40% on standard sector parking rates.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 45,
        predicted30m: 47,
        predicted60m: 48,
        predicted120m: 52
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'LOW', occupancyPercent: 40, availableBays: 90 },
        { time: '15:00', demandLevel: 'LOW', occupancyPercent: 42, availableBays: 87 },
        { time: '16:00', demandLevel: 'LOW', occupancyPercent: 45, availableBays: 82 },
        { time: '17:00', demandLevel: 'LOW', occupancyPercent: 46, availableBays: 81 },
        { time: '18:00', demandLevel: 'LOW', occupancyPercent: 48, availableBays: 78 },
        { time: '19:00', demandLevel: 'LOW', occupancyPercent: 49, availableBays: 76 },
        { time: '20:00', demandLevel: 'LOW', occupancyPercent: 45, availableBays: 82 },
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 35, availableBays: 97 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 25, availableBays: 112 }
      ]
    }
  ],
  'techpark': [
    {
      id: 'fac-tp-1',
      name: 'TechPark Square Underground',
      zone: 'TechPark',
      distanceKm: 0.5,
      walkMinutes: 5,
      ratePerHour: 100,
      evCharging: true,
      security24x7: true,
      covered: true,
      currentOccupancy: 86,
      predictedOccupancy: 92,
      availableBays: 28,
      totalBays: 200,
      forecastConfidence: 97.5,
      demandLevel: 'VERY HIGH',
      recommendationScore: 97.0,
      tags: ['Premium Underdeck', 'EV Fast Charge', 'ANR Gate'],
      reasons: [
        { id: 'r1', label: 'Prime Tech Access', description: 'Direct connection to Enterprise Block building cores.' },
        { id: 'r2', label: 'Automated ANPR Gate', description: 'Instant license recognition ensures rapid drive-through.' },
        { id: 'r3', label: '24/7 Enhanced Patrols', description: 'Constantly monitored CCTV and physical on-site patrols.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 86,
        predicted30m: 89,
        predicted60m: 92,
        predicted120m: 96
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'HIGH', occupancyPercent: 82, availableBays: 36 },
        { time: '15:00', demandLevel: 'HIGH', occupancyPercent: 84, availableBays: 32 },
        { time: '16:00', demandLevel: 'VERY HIGH', occupancyPercent: 86, availableBays: 28 },
        { time: '17:00', demandLevel: 'VERY HIGH', occupancyPercent: 89, availableBays: 22 },
        { time: '18:00', demandLevel: 'VERY HIGH', occupancyPercent: 92, availableBays: 16 },
        { time: '19:00', demandLevel: 'VERY HIGH', occupancyPercent: 95, availableBays: 10 },
        { time: '20:00', demandLevel: 'VERY HIGH', occupancyPercent: 97, availableBays: 6 },
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 90, availableBays: 20 },
        { time: '22:00', demandLevel: 'MODERATE', occupancyPercent: 75, availableBays: 50 }
      ]
    },
    {
      id: 'fac-tp-2',
      name: 'North Campus Surface Lot',
      zone: 'TechPark',
      distanceKm: 1.1,
      walkMinutes: 11,
      ratePerHour: 60,
      evCharging: false,
      security24x7: true,
      covered: false,
      currentOccupancy: 60,
      predictedOccupancy: 64,
      availableBays: 60,
      totalBays: 150,
      forecastConfidence: 93.0,
      demandLevel: 'MODERATE',
      recommendationScore: 88.0,
      tags: ['Surface Lot', 'Standard Security'],
      reasons: [
        { id: 'r1', label: 'Decent Space Reserve', description: '60 available slots with moderate occupancy growth.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 60,
        predicted30m: 62,
        predicted60m: 64,
        predicted120m: 70
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'MODERATE', occupancyPercent: 55, availableBays: 67 },
        { time: '15:00', demandLevel: 'MODERATE', occupancyPercent: 58, availableBays: 63 },
        { time: '16:00', demandLevel: 'MODERATE', occupancyPercent: 60, availableBays: 60 },
        { time: '17:00', demandLevel: 'MODERATE', occupancyPercent: 62, availableBays: 57 },
        { time: '18:00', demandLevel: 'MODERATE', occupancyPercent: 64, availableBays: 54 },
        { time: '19:00', demandLevel: 'HIGH', occupancyPercent: 68, availableBays: 48 },
        { time: '20:00', demandLevel: 'HIGH', occupancyPercent: 72, availableBays: 42 },
        { time: '21:00', demandLevel: 'MODERATE', occupancyPercent: 65, availableBays: 52 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 45, availableBays: 82 }
      ]
    }
  ],
  'financial-plaza': [
    {
      id: 'fac-fp-1',
      name: 'Financial District North Deck',
      zone: 'Financial Plaza',
      distanceKm: 0.7,
      walkMinutes: 7,
      ratePerHour: 75,
      evCharging: true,
      security24x7: true,
      covered: true,
      currentOccupancy: 45,
      predictedOccupancy: 50,
      availableBays: 99,
      totalBays: 180,
      forecastConfidence: 91.8,
      demandLevel: 'LOW',
      recommendationScore: 94.0,
      tags: ['ANR Scan', 'VIP Lounges', 'Security Guarded'],
      reasons: [
        { id: 'r1', label: 'Highly Secure Precinct', description: 'Under continuous multi-point security supervision.' },
        { id: 'r2', label: 'Ample Empty Slots', description: 'Close to 100 empty bays currently registered.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 45,
        predicted30m: 47,
        predicted60m: 50,
        predicted120m: 55
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'LOW', occupancyPercent: 40, availableBays: 108 },
        { time: '15:00', demandLevel: 'LOW', occupancyPercent: 42, availableBays: 104 },
        { time: '16:00', demandLevel: 'LOW', occupancyPercent: 45, availableBays: 99 },
        { time: '17:00', demandLevel: 'LOW', occupancyPercent: 47, availableBays: 95 },
        { time: '18:00', demandLevel: 'LOW', occupancyPercent: 50, availableBays: 90 },
        { time: '19:00', demandLevel: 'LOW', occupancyPercent: 52, availableBays: 86 },
        { time: '20:00', demandLevel: 'LOW', occupancyPercent: 54, availableBays: 82 },
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 48, availableBays: 93 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 35, availableBays: 117 }
      ]
    },
    {
      id: 'fac-fp-2',
      name: 'Trade Tower South Annex',
      zone: 'Financial Plaza',
      distanceKm: 1.4,
      walkMinutes: 14,
      ratePerHour: 60,
      evCharging: false,
      security24x7: true,
      covered: false,
      currentOccupancy: 30,
      predictedOccupancy: 33,
      availableBays: 140,
      totalBays: 200,
      forecastConfidence: 89.5,
      demandLevel: 'LOW',
      recommendationScore: 86.0,
      tags: ['Budget Choice', 'Corporate discountable'],
      reasons: [
        { id: 'r1', label: 'Maximum Availability', description: 'Massive capacity with 140 open parking spaces.' }
      ],
      occupancySnapshot: {
        currentOccupancy: 30,
        predicted30m: 32,
        predicted60m: 33,
        predicted120m: 35
      },
      hourlyForecast: [
        { time: '14:00', demandLevel: 'LOW', occupancyPercent: 28, availableBays: 144 },
        { time: '15:00', demandLevel: 'LOW', occupancyPercent: 30, availableBays: 140 },
        { time: '16:00', demandLevel: 'LOW', occupancyPercent: 30, availableBays: 140 },
        { time: '17:00', demandLevel: 'LOW', occupancyPercent: 32, availableBays: 136 },
        { time: '18:00', demandLevel: 'LOW', occupancyPercent: 33, availableBays: 134 },
        { time: '19:00', demandLevel: 'LOW', occupancyPercent: 34, availableBays: 132 },
        { time: '20:00', demandLevel: 'LOW', occupancyPercent: 30, availableBays: 140 },
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 25, availableBays: 150 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 15, availableBays: 170 }
      ]
    }
  ]
};
