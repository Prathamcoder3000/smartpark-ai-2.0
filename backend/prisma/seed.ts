import { PrismaClient, ParkingSlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

const facilitiesData = [
  {
    id: 'facility-metro-central',
    name: 'Metro Central Garage',
    address: '101 Metro Boulevard, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'Multi-level garage in the heart of downtown with integrated EV charging and security patrols.',
    floors: [
      {
        id: 'floor-metro-0',
        name: 'Ground Floor',
        level: 0,
        slots: [
          { slotNumber: 'M0-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: true },
          { slotNumber: 'M0-02', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'M0-03', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'M0-04', status: ParkingSlotStatus.RESERVED, isEVCharging: true },
          { slotNumber: 'M0-05', status: ParkingSlotStatus.DISABLED, isEVCharging: false },
        ]
      },
      {
        id: 'floor-metro-1',
        name: 'Floor 1',
        level: 1,
        slots: [
          { slotNumber: 'M1-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'M1-02', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'M1-03', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'M1-04', status: ParkingSlotStatus.OCCUPIED, isEVCharging: true },
          { slotNumber: 'M1-05', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
        ]
      }
    ]
  },
  {
    id: 'facility-cyber-city',
    name: 'Cyber City Hub',
    address: '404 Cybernetic Way, Tech District',
    latitude: 37.7749,
    longitude: -122.4194,
    description: 'Tech-forward parking facility with ultra-fast EV charging stations and automated space guidance.',
    floors: [
      {
        id: 'floor-cyber-1',
        name: 'L1 - Entry Level',
        level: 1,
        slots: [
          { slotNumber: 'C1-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: true },
          { slotNumber: 'C1-02', status: ParkingSlotStatus.OCCUPIED, isEVCharging: true },
          { slotNumber: 'C1-03', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'C1-04', status: ParkingSlotStatus.RESERVED, isEVCharging: false },
          { slotNumber: 'C1-05', status: ParkingSlotStatus.DISABLED, isEVCharging: true },
        ]
      },
      {
        id: 'floor-cyber-2',
        name: 'L2 - Upper Deck',
        level: 2,
        slots: [
          { slotNumber: 'C2-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'C2-02', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'C2-03', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'C2-04', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'C2-05', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
        ]
      }
    ]
  },
  {
    id: 'facility-techpark',
    name: 'TechPark Parking',
    address: '77 Innovation Drive, Silicon Suburbs',
    latitude: 34.0522,
    longitude: -118.2437,
    description: 'Secure suburban parking deck optimized for tech commuters with full mobile integration.',
    floors: [
      {
        id: 'floor-tech-b1',
        name: 'Basement 1',
        level: -1,
        slots: [
          { slotNumber: 'T-B1-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: true },
          { slotNumber: 'T-B1-02', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'T-B1-03', status: ParkingSlotStatus.RESERVED, isEVCharging: true },
          { slotNumber: 'T-B1-04', status: ParkingSlotStatus.DISABLED, isEVCharging: false },
          { slotNumber: 'T-B1-05', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
        ]
      },
      {
        id: 'floor-tech-0',
        name: 'Ground Floor',
        level: 0,
        slots: [
          { slotNumber: 'T-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'T-02', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'T-03', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'T-04', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'T-05', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
        ]
      }
    ]
  },
  {
    id: 'facility-financial-plaza',
    name: 'Financial Plaza Deck',
    address: '55 Wall Street, Financial District',
    latitude: 40.7075,
    longitude: -74.0112,
    description: 'Corporate parking complex offering premium oversized spaces and 24/7 valet options.',
    floors: [
      {
        id: 'floor-financial-1',
        name: 'L1',
        level: 1,
        slots: [
          { slotNumber: 'F1-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: true },
          { slotNumber: 'F1-02', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'F1-03', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'F1-04', status: ParkingSlotStatus.RESERVED, isEVCharging: false },
          { slotNumber: 'F1-05', status: ParkingSlotStatus.DISABLED, isEVCharging: false },
          { slotNumber: 'F1-06', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
        ]
      },
      {
        id: 'floor-financial-2',
        name: 'L2',
        level: 2,
        slots: [
          { slotNumber: 'F2-01', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'F2-02', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'F2-03', status: ParkingSlotStatus.OCCUPIED, isEVCharging: true },
          { slotNumber: 'F2-04', status: ParkingSlotStatus.OCCUPIED, isEVCharging: false },
          { slotNumber: 'F2-05', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
          { slotNumber: 'F2-06', status: ParkingSlotStatus.AVAILABLE, isEVCharging: false },
        ]
      }
    ]
  }
];

async function main() {
  console.log('Seeding database with deterministic SmartPark data...');

  for (const f of facilitiesData) {
    const facility = await prisma.parkingFacility.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        address: f.address,
        latitude: f.latitude,
        longitude: f.longitude,
        description: f.description,
      },
      create: {
        id: f.id,
        name: f.name,
        address: f.address,
        latitude: f.latitude,
        longitude: f.longitude,
        description: f.description,
      },
    });

    console.log(`Facility upserted: ${facility.name} (${facility.id})`);

    for (const fl of f.floors) {
      const floor = await prisma.floor.upsert({
        where: { id: fl.id },
        update: {
          name: fl.name,
          level: fl.level,
          facilityId: facility.id,
        },
        create: {
          id: fl.id,
          name: fl.name,
          level: fl.level,
          facilityId: facility.id,
        },
      });

      for (const sl of fl.slots) {
        await prisma.parkingSlot.upsert({
          where: {
            facilityId_slotNumber: {
              facilityId: facility.id,
              slotNumber: sl.slotNumber,
            }
          },
          update: {
            status: sl.status,
            isEVCharging: sl.isEVCharging,
            floorId: floor.id,
          },
          create: {
            slotNumber: sl.slotNumber,
            status: sl.status,
            isEVCharging: sl.isEVCharging,
            facilityId: facility.id,
            floorId: floor.id,
          }
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
