import { PrismaClient, ParkingSlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

const facilitiesData = [
  {
    id: 'facility-metro-central',
    name: 'Metro Central Garage',
    address: '101 Nariman Point Boulevard, Fort, Mumbai 400021',
    latitude: 18.9256,
    longitude: 72.8242,
    description: 'Multi-level garage in South Mumbai (Fort / Nariman Point) with integrated EV charging and security patrols.',
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
    address: '404 BKC Avenue, Bandra East, Mumbai 400051',
    latitude: 19.0657,
    longitude: 72.8687,
    description: 'Tech-forward parking facility in Bandra Kurla Complex (BKC) with ultra-fast EV charging stations and automated space guidance.',
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
    address: '77 MIDC Central Road, Andheri East, Mumbai 400093',
    latitude: 19.1197,
    longitude: 72.8697,
    description: 'Secure commercial parking deck in Andheri East MIDC optimized for tech commuters with full mobile integration.',
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
    address: '55 Hiranandani Boulevard, Powai, Mumbai 400076',
    latitude: 19.1176,
    longitude: 72.9060,
    description: 'Corporate parking complex in Powai Hiranandani offering premium oversized spaces and 24/7 valet options.',
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
