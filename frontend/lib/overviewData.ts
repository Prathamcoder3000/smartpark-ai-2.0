export interface ParkingFacility {
  id: string;
  name: string;
  location: string;
  zone: string;
  status: 'AVAILABLE' | 'LIMITED' | 'OCCUPIED';
  availableBays: number;
  totalBays: number;
  ratePerHour: string;
  distanceKm: number;
  walkMinutes: number;
  evCharging: boolean;
  security24x7: boolean;
  covered: boolean;
  tags: string[];
}

export interface MetricSummary {
  label: string;
  value: string;
  unit: string;
  trend: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface TelemetryLevel {
  level: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyPercentage: number;
}

export interface HourlyDemand {
  time: string;
  occupancyPercent: number;
  isPeak: boolean;
}

export const MOCK_METRICS: MetricSummary[] = [
  {
    label: 'Live Available Bays',
    value: '348',
    unit: 'bays in region',
    trend: { value: '+12% vs last hr', direction: 'up' },
  },
  {
    label: 'Average Occupancy Rate',
    value: '72%',
    unit: 'capacity filled',
    trend: { value: 'Peak window active', direction: 'neutral' },
  },
  {
    label: 'Avg Search Time Saved',
    value: '14.5',
    unit: 'mins / trip',
    trend: { value: '2.4x faster', direction: 'up' },
  },
  {
    label: 'AI Forecast Precision',
    value: '98.4%',
    unit: 'confidence index',
    trend: { value: '+0.4% accurate', direction: 'up' },
  },
];

export const MOCK_FACILITIES: ParkingFacility[] = [
  {
    id: 'fac-01',
    name: 'Cyber City Innovation Hub Garage',
    location: 'Cyber City Phase II, Sector 24',
    zone: 'Zone A — Commercial Center',
    status: 'AVAILABLE',
    availableBays: 48,
    totalBays: 120,
    ratePerHour: '₹40/hr',
    distanceKm: 0.8,
    walkMinutes: 4,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['EV Fast Charge', 'Valet Available', '24/7 Access'],
  },
  {
    id: 'fac-02',
    name: 'Central Metro Junction Station',
    location: 'Concourse Road, Gate 3',
    zone: 'Zone B — Transit Hub',
    status: 'LIMITED',
    availableBays: 12,
    totalBays: 150,
    ratePerHour: '₹30/hr',
    distanceKm: 1.4,
    walkMinutes: 7,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['Metro Link', 'Covered Deck', 'CCTV Active'],
  },
  {
    id: 'fac-03',
    name: 'TechPark Square Underground',
    location: 'Tower 4 Promenade',
    zone: 'Zone A — Enterprise District',
    status: 'AVAILABLE',
    availableBays: 84,
    totalBays: 200,
    ratePerHour: '₹50/hr',
    distanceKm: 2.1,
    walkMinutes: 9,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['Automated Barrier', 'VIP Bays', 'Fast Exit'],
  },
  {
    id: 'fac-04',
    name: 'Grand Galleria Shopping Deck',
    location: 'Main Retail Corridor, Level -1',
    zone: 'Zone C — Retail & Entertainment',
    status: 'LIMITED',
    availableBays: 9,
    totalBays: 180,
    ratePerHour: '₹60/hr',
    distanceKm: 2.8,
    walkMinutes: 12,
    evCharging: false,
    security24x7: true,
    covered: true,
    tags: ['Mall Access', 'Disabled Friendly', 'Wide Bays'],
  },
  {
    id: 'fac-05',
    name: 'Financial District North Deck',
    location: 'Corporate Boulevard, Sector 18',
    zone: 'Zone A — Financial Plaza',
    status: 'OCCUPIED',
    availableBays: 2,
    totalBays: 90,
    ratePerHour: '₹45/hr',
    distanceKm: 3.5,
    walkMinutes: 15,
    evCharging: true,
    security24x7: true,
    covered: false,
    tags: ['Open Sky Deck', 'Monthly Passes', 'ANR Scanner'],
  },
  {
    id: 'fac-06',
    name: 'Westside Business Park Surface Lot',
    location: 'Outer Ring Road, Exit 12',
    zone: 'Zone D — Outer Ring',
    status: 'AVAILABLE',
    availableBays: 115,
    totalBays: 160,
    ratePerHour: '₹25/hr',
    distanceKm: 4.2,
    walkMinutes: 18,
    evCharging: false,
    security24x7: true,
    covered: false,
    tags: ['Economical Rate', 'Large Vehicles', 'Easy Access'],
  },
];

export const MOCK_TELEMETRY_LEVELS: TelemetryLevel[] = [
  { level: 'Level B1 (VIP & Fast Charging)', totalSlots: 40, occupiedSlots: 32, availableSlots: 8, occupancyPercentage: 80 },
  { level: 'Level B2 (General Visitor Grid)', totalSlots: 60, occupiedSlots: 38, availableSlots: 22, occupancyPercentage: 63 },
  { level: 'Level B3 (Long-Term & Executive)', totalSlots: 50, occupiedSlots: 25, availableSlots: 25, occupancyPercentage: 50 },
];

export const MOCK_HOURLY_DEMAND: HourlyDemand[] = [
  { time: '08:00', occupancyPercent: 35, isPeak: false },
  { time: '10:00', occupancyPercent: 68, isPeak: false },
  { time: '12:00', occupancyPercent: 88, isPeak: true },
  { time: '14:00', occupancyPercent: 82, isPeak: true },
  { time: '16:00', occupancyPercent: 74, isPeak: false },
  { time: '18:00', occupancyPercent: 92, isPeak: true },
  { time: '20:00', occupancyPercent: 60, isPeak: false },
  { time: '22:00', occupancyPercent: 30, isPeak: false },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Predictive Search & Destination Mapping',
    description: 'Enter your final destination or drop-off pin. SmartPark AI analyzes real-time sensor networks and historical occupancy trends to select optimal facilities before you set off.',
  },
  {
    step: '02',
    title: 'Spatial Bay Recommendation',
    description: 'Our neural allocation engine assigns specific parking slots based on walking proximity, vehicle dimensions, EV charging requirements, and preferred pricing.',
  },
  {
    step: '03',
    title: 'Guaranteed Reserve & Turn-by-Turn Guidance',
    description: 'Lock in your parking bay with a single tap. Automated gate license plate recognition (ANPR) grants seamless entry without physical tickets or delays.',
  },
  {
    step: '04',
    title: 'Frictionless Sensor Exit & Automated Billing',
    description: 'Drive out effortlessly when finished. Telemetry sensors register your exit timestamp and automatically process payment via your linked SmartPark account.',
  },
];
