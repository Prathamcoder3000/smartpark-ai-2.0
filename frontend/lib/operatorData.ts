export type ParkingSlotState = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DISABLED';

export interface OperatorParkingSlot {
  id: string;
  floor: string;
  state: ParkingSlotState;
  evCharging: boolean;
  reservationId?: string;
  lastStateChange: string;
}

export interface OperatorFloor {
  floorId: string; // e.g. B1, B2, B3
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  reservedBays: number;
  slots: OperatorParkingSlot[];
}

export interface DemandPoint {
  time: string;
  demandLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  occupancyPercent: number;
  availableBays: number;
}

export interface OperationalAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: string;
  affectedArea: string;
}

export interface OperatorInsight {
  id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  affectedFloor: string;
  timestamp: string;
}

export interface PricingSummary {
  currentHourlyRate: number;
  peakPeriodRate: number;
  evChargingRate: number;
  avgTransactionValue: number;
}

export interface OperatorFacility {
  id: string;
  name: string;
  location: string;
  zone: string;
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  reservedBays: number;
  occupancyPct: number;
  revenueToday: number;
  revenueTrend: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  activeBookings: number;
  evBays: number;
  coveredBays: number;
  securityStatus: string;
  operatingStatus: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
  floors: OperatorFloor[];
  hourlyDemandForecast: Record<string, DemandPoint[]>; // keys: '30' | '60' | '90' | '120'
  alerts: OperationalAlert[];
  insights: OperatorInsight[];
  pricing: PricingSummary;
}

// Helper to generate mock slots for testing grid layout
const generateMockSlotsForFloor = (floor: string): OperatorParkingSlot[] => {
  const slots: OperatorParkingSlot[] = [];
  const states: ParkingSlotState[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED'];
  
  for (let i = 1; i <= 24; i++) {
    // Semi-deterministic distribution
    let state: ParkingSlotState = 'AVAILABLE';
    if (i % 3 === 0) state = 'OCCUPIED';
    else if (i % 7 === 0) state = 'RESERVED';
    else if (i === 15) state = 'DISABLED';

    slots.push({
      id: `${floor}-${String(i).padStart(3, '0')}`,
      floor,
      state,
      evCharging: i % 4 === 0,
      reservationId: state === 'RESERVED' ? `RES-${900 + i}` : undefined,
      lastStateChange: '2026-08-15 19:42:15',
    });
  }
  return slots;
};

export const MOCK_OPERATOR_FACILITIES: OperatorFacility[] = [
  {
    id: 'fac-mcg',
    name: 'Metro Central Garage',
    location: 'Concourse Road, Gate 3',
    zone: 'Metro Central',
    totalBays: 500,
    availableBays: 140,
    occupiedBays: 320,
    reservedBays: 40,
    occupancyPct: 72,
    revenueToday: 32400,
    revenueTrend: { value: '+14% vs yesterday', direction: 'up' },
    activeBookings: 84,
    evBays: 35,
    coveredBays: 500,
    securityStatus: 'Patrol Active',
    operatingStatus: 'OPEN',
    floors: [
      { floorId: 'B1', totalBays: 180, availableBays: 40, occupiedBays: 120, reservedBays: 20, slots: generateMockSlotsForFloor('B1') },
      { floorId: 'B2', totalBays: 160, availableBays: 50, occupiedBays: 100, reservedBays: 10, slots: generateMockSlotsForFloor('B2') },
      { floorId: 'B3', totalBays: 160, availableBays: 50, occupiedBays: 100, reservedBays: 10, slots: generateMockSlotsForFloor('B3') }
    ],
    pricing: {
      currentHourlyRate: 80,
      peakPeriodRate: 100,
      evChargingRate: 15,
      avgTransactionValue: 240
    },
    hourlyDemandForecast: {
      '30': [
        { time: '20:30', demandLevel: 'HIGH', occupancyPercent: 74, availableBays: 130 },
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 76, availableBays: 120 },
        { time: '21:30', demandLevel: 'MODERATE', occupancyPercent: 70, availableBays: 150 },
        { time: '22:00', demandLevel: 'MODERATE', occupancyPercent: 62, availableBays: 190 }
      ],
      '60': [
        { time: '21:00', demandLevel: 'HIGH', occupancyPercent: 78, availableBays: 110 },
        { time: '22:00', demandLevel: 'MODERATE', occupancyPercent: 65, availableBays: 175 },
        { time: '23:00', demandLevel: 'LOW', occupancyPercent: 45, availableBays: 275 },
        { time: '00:00', demandLevel: 'LOW', occupancyPercent: 28, availableBays: 360 }
      ],
      '90': [
        { time: '21:30', demandLevel: 'HIGH', occupancyPercent: 80, availableBays: 100 },
        { time: '23:00', demandLevel: 'LOW', occupancyPercent: 42, availableBays: 290 },
        { time: '00:30', demandLevel: 'LOW', occupancyPercent: 20, availableBays: 400 },
        { time: '02:00', demandLevel: 'LOW', occupancyPercent: 12, availableBays: 440 }
      ],
      '120': [
        { time: '22:00', demandLevel: 'HIGH', occupancyPercent: 82, availableBays: 90 },
        { time: '00:00', demandLevel: 'LOW', occupancyPercent: 30, availableBays: 350 },
        { time: '02:00', demandLevel: 'LOW', occupancyPercent: 10, availableBays: 450 },
        { time: '04:00', demandLevel: 'LOW', occupancyPercent: 5, availableBays: 475 }
      ]
    },
    alerts: [
      { id: 'a1', severity: 'WARNING', title: 'High Occupancy Approaching', description: 'Occupancy is projected to cross 85% by 22:00 peak hours.', timestamp: '2026-08-15 21:10:00', affectedArea: 'Facility Wide' },
      { id: 'a2', severity: 'CRITICAL', title: 'EV Bay Overuse Flag', description: 'Active EV charging connections exceed 90% capacity on B1.', timestamp: '2026-08-15 21:05:00', affectedArea: 'Level B1' },
      { id: 'a3', severity: 'INFO', title: 'Disabled Bay Maintenance', description: 'Bay B2-015 scheduled for telemetry sensor upgrade tomorrow.', timestamp: '2026-08-15 20:30:00', affectedArea: 'Level B2' }
    ],
    insights: [
      { id: 'i1', priority: 'HIGH', explanation: 'Evening commute traffic peak expected to spike occupancies by 14%.', affectedFloor: 'Facility Wide', timestamp: '10m ago' },
      { id: 'i2', priority: 'MEDIUM', explanation: 'Concentrated availability (50 open bays) remains on B3.', affectedFloor: 'Level B3', timestamp: '15m ago' },
      { id: 'i3', priority: 'LOW', explanation: 'Redirect entry barrier gates to B2 queue for optimal load distribution.', affectedFloor: 'Level B2', timestamp: '30m ago' }
    ]
  },
  {
    id: 'fac-cch',
    name: 'Cyber City Hub',
    location: 'Sector 24, Cyber City Phase II',
    zone: 'Cyber City',
    totalBays: 300,
    availableBays: 120,
    occupiedBays: 160,
    reservedBays: 20,
    occupancyPct: 53,
    revenueToday: 18400,
    revenueTrend: { value: '-2% vs yesterday', direction: 'down' },
    activeBookings: 42,
    evBays: 20,
    coveredBays: 150,
    securityStatus: 'Barrier Scan Online',
    operatingStatus: 'OPEN',
    floors: [
      { floorId: 'B1', totalBays: 150, availableBays: 60, occupiedBays: 80, reservedBays: 10, slots: generateMockSlotsForFloor('B1') },
      { floorId: 'B2', totalBays: 150, availableBays: 60, occupiedBays: 80, reservedBays: 10, slots: generateMockSlotsForFloor('B2') }
    ],
    pricing: {
      currentHourlyRate: 90,
      peakPeriodRate: 110,
      evChargingRate: 18,
      avgTransactionValue: 270
    },
    hourlyDemandForecast: {
      '30': [
        { time: '20:30', demandLevel: 'MODERATE', occupancyPercent: 55, availableBays: 135 },
        { time: '21:00', demandLevel: 'MODERATE', occupancyPercent: 57, availableBays: 129 }
      ],
      '60': [
        { time: '21:00', demandLevel: 'MODERATE', occupancyPercent: 58, availableBays: 126 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 48, availableBays: 156 }
      ],
      '90': [
        { time: '21:30', demandLevel: 'LOW', occupancyPercent: 50, availableBays: 150 },
        { time: '23:00', demandLevel: 'LOW', occupancyPercent: 38, availableBays: 186 }
      ],
      '120': [
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 46, availableBays: 162 },
        { time: '00:00', demandLevel: 'LOW', occupancyPercent: 25, availableBays: 225 }
      ]
    },
    alerts: [
      { id: 'a10', severity: 'WARNING', title: 'Low EV Charging Availability', description: 'Only 2 EV spaces remain unoccupied on B2.', timestamp: '2026-08-15 21:02:00', affectedArea: 'Level B2' }
    ],
    insights: [
      { id: 'i10', priority: 'MEDIUM', explanation: 'EV charging utilization matches current weekly peaks.', affectedFloor: 'Level B2', timestamp: '5m ago' }
    ]
  },
  {
    id: 'fac-tpp',
    name: 'TechPark Parking',
    location: 'Tower 4 Promenade',
    zone: 'TechPark',
    totalBays: 400,
    availableBays: 40,
    occupiedBays: 340,
    reservedBays: 20,
    occupancyPct: 85,
    revenueToday: 41200,
    revenueTrend: { value: '+22% vs yesterday', direction: 'up' },
    activeBookings: 110,
    evBays: 40,
    coveredBays: 400,
    securityStatus: 'Enhanced Patrols',
    operatingStatus: 'OPEN',
    floors: [
      { floorId: 'B1', totalBays: 200, availableBays: 20, occupiedBays: 170, reservedBays: 10, slots: generateMockSlotsForFloor('B1') },
      { floorId: 'B2', totalBays: 200, availableBays: 20, occupiedBays: 170, reservedBays: 10, slots: generateMockSlotsForFloor('B2') }
    ],
    pricing: {
      currentHourlyRate: 100,
      peakPeriodRate: 120,
      evChargingRate: 20,
      avgTransactionValue: 300
    },
    hourlyDemandForecast: {
      '30': [
        { time: '20:30', demandLevel: 'VERY HIGH', occupancyPercent: 88, availableBays: 48 },
        { time: '21:00', demandLevel: 'VERY HIGH', occupancyPercent: 90, availableBays: 40 }
      ],
      '60': [
        { time: '21:00', demandLevel: 'VERY HIGH', occupancyPercent: 91, availableBays: 36 },
        { time: '22:00', demandLevel: 'HIGH', occupancyPercent: 80, availableBays: 80 }
      ],
      '90': [
        { time: '21:30', demandLevel: 'VERY HIGH', occupancyPercent: 92, availableBays: 32 },
        { time: '23:00', demandLevel: 'HIGH', occupancyPercent: 72, availableBays: 112 }
      ],
      '120': [
        { time: '22:00', demandLevel: 'VERY HIGH', occupancyPercent: 94, availableBays: 24 },
        { time: '00:00', demandLevel: 'MODERATE', occupancyPercent: 55, availableBays: 180 }
      ]
    },
    alerts: [
      { id: 'a20', severity: 'CRITICAL', title: 'Critical Congestion Warning', description: 'Occupancy is approaching absolute limit of 95% on B1.', timestamp: '2026-08-15 21:20:00', affectedArea: 'Level B1' }
    ],
    insights: [
      { id: 'i20', priority: 'HIGH', explanation: 'Direct all incoming visitors to TechPark North annex surface overflow.', affectedFloor: 'Surface Lot', timestamp: '2m ago' }
    ]
  },
  {
    id: 'fac-fpd',
    name: 'Financial Plaza Deck',
    location: 'Corporate Boulevard, Sector 18',
    zone: 'Financial Plaza',
    totalBays: 600,
    availableBays: 420,
    occupiedBays: 150,
    reservedBays: 30,
    occupancyPct: 25,
    revenueToday: 12000,
    revenueTrend: { value: '+5% vs yesterday', direction: 'up' },
    activeBookings: 18,
    evBays: 50,
    coveredBays: 300,
    securityStatus: 'Full CCTV active',
    operatingStatus: 'OPEN',
    floors: [
      { floorId: 'B1', totalBays: 200, availableBays: 140, occupiedBays: 50, reservedBays: 10, slots: generateMockSlotsForFloor('B1') },
      { floorId: 'B2', totalBays: 200, availableBays: 140, occupiedBays: 50, reservedBays: 10, slots: generateMockSlotsForFloor('B2') },
      { floorId: 'B3', totalBays: 200, availableBays: 140, occupiedBays: 50, reservedBays: 10, slots: generateMockSlotsForFloor('B3') }
    ],
    pricing: {
      currentHourlyRate: 75,
      peakPeriodRate: 90,
      evChargingRate: 12,
      avgTransactionValue: 220
    },
    hourlyDemandForecast: {
      '30': [
        { time: '20:30', demandLevel: 'LOW', occupancyPercent: 26, availableBays: 444 },
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 27, availableBays: 438 }
      ],
      '60': [
        { time: '21:00', demandLevel: 'LOW', occupancyPercent: 28, availableBays: 432 },
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 22, availableBays: 468 }
      ],
      '90': [
        { time: '21:30', demandLevel: 'LOW', occupancyPercent: 28, availableBays: 432 },
        { time: '23:00', demandLevel: 'LOW', occupancyPercent: 18, availableBays: 492 }
      ],
      '120': [
        { time: '22:00', demandLevel: 'LOW', occupancyPercent: 29, availableBays: 426 },
        { time: '00:00', demandLevel: 'LOW', occupancyPercent: 12, availableBays: 528 }
      ]
    },
    alerts: [],
    insights: [
      { id: 'i30', priority: 'LOW', explanation: 'Ample general bays available across all levels.', affectedFloor: 'Facility Wide', timestamp: '1h ago' }
    ]
  }
];
