export type BookingStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  facilityName: string;
  facilityAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  slotNumber: string;
  floor: string;
  vehicle: string;
  amount: number;
  bookingStatus: BookingStatus;
  bookingReference: string;
  distanceKm: number;
  walkMinutes: number;
  amenities: string[];
  createdDate: string;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-01',
    facilityName: 'Cyber City Innovation Hub Garage',
    facilityAddress: 'Cyber City Phase II, Sector 24, Zone A',
    date: '2026-08-16',
    startTime: '10:00',
    endTime: '14:00',
    slotNumber: 'P2-142',
    floor: 'Level B2',
    vehicle: 'MH-12-PA-7890 (Tesla Model 3)',
    amount: 360,
    bookingStatus: 'UPCOMING',
    bookingReference: 'SP-992-18A',
    distanceKm: 0.8,
    walkMinutes: 7,
    amenities: ['EV Fast Charger', 'CCTV 24/7', 'Covered Deck', 'Wheelchair Access'],
    createdDate: '2026-08-15 14:20:00',
  },
  {
    id: 'book-02',
    facilityName: 'Central Metro Junction Station',
    facilityAddress: 'Concourse Road, Gate 3, Zone B',
    date: '2026-08-15',
    startTime: '18:00',
    endTime: '22:00',
    slotNumber: 'P1-024',
    floor: 'Level B1',
    vehicle: 'MH-12-PA-7890 (Tesla Model 3)',
    amount: 320,
    bookingStatus: 'ACTIVE',
    bookingReference: 'SP-104-58X',
    distanceKm: 0.6,
    walkMinutes: 6,
    amenities: ['Transit Link', 'Underground Deck', 'ANPR Access'],
    createdDate: '2026-08-15 17:45:00',
  },
  {
    id: 'book-03',
    facilityName: 'TechPark Square Underground',
    facilityAddress: 'Tower 4 Promenade, Zone A',
    date: '2026-08-12',
    startTime: '09:00',
    endTime: '17:00',
    slotNumber: 'P3-088',
    floor: 'Level B3',
    vehicle: 'MH-12-PA-7890 (Tesla Model 3)',
    amount: 800,
    bookingStatus: 'COMPLETED',
    bookingReference: 'SP-084-21B',
    distanceKm: 0.5,
    walkMinutes: 5,
    amenities: ['EV Fast Charger', 'VIP Bays', 'Automated Barrier'],
    createdDate: '2026-08-11 18:10:00',
  },
  {
    id: 'book-04',
    facilityName: 'Financial District North Deck',
    facilityAddress: 'Corporate Boulevard, Sector 18, Zone A',
    date: '2026-08-10',
    startTime: '14:00',
    endTime: '18:00',
    slotNumber: 'P2-012',
    floor: 'Level B2',
    vehicle: 'MH-12-PA-7890 (Tesla Model 3)',
    amount: 300,
    bookingStatus: 'COMPLETED',
    bookingReference: 'SP-052-19K',
    distanceKm: 0.7,
    walkMinutes: 7,
    amenities: ['Covered Deck', 'Monthly Passes', 'ANR Scanner'],
    createdDate: '2026-08-10 11:30:00',
  },
  {
    id: 'book-05',
    facilityName: 'Grand Galleria Shopping Deck',
    facilityAddress: 'Main Retail Corridor, Level -1, Zone C',
    date: '2026-08-08',
    startTime: '16:00',
    endTime: '20:00',
    slotNumber: 'P1-105',
    floor: 'Level B1',
    vehicle: 'MH-12-PA-7890 (Tesla Model 3)',
    amount: 240,
    bookingStatus: 'CANCELLED',
    bookingReference: 'SP-022-77L',
    distanceKm: 0.9,
    walkMinutes: 9,
    amenities: ['Mall Access', 'Disabled Friendly', 'Wide Bays'],
    createdDate: '2026-08-08 12:15:00',
  },
];
