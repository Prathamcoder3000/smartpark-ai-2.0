import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';

export async function operatorRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Authenticate and authorize as operator
  fastify.addHook('preHandler', async (request, reply) => {
    // 1. Run basic JWT authentication
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    // 2. Check if the authenticated user is an Operator
    const operator = await prisma.operator.findUnique({
      where: { email: request.user!.email }
    });

    if (!operator) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not have operator privileges.' }
      });
    }
  });

  // GET /api/operator/dashboard
  fastify.post('/seed-operator', async (request, reply) => {
    // Hidden endpoint to seed a test operator for integration tests
    const body = request.body as any;
    if (!body || !body.email || !body.name) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Email and name are required.' } });
    }
    const op = await prisma.operator.upsert({
      where: { email: body.email },
      update: { name: body.name },
      create: { email: body.email, name: body.name }
    });
    return reply.send({ success: true, data: op });
  });

  fastify.get('/dashboard', async (request, reply) => {
    try {
      const totalFacilities = await prisma.parkingFacility.count();
      const totalFloors = await prisma.floor.count();
      const totalSlots = await prisma.parkingSlot.count();

      const slots = await prisma.parkingSlot.findMany();
      const availableSlots = slots.filter(s => s.status === 'AVAILABLE').length;
      const occupiedSlots = slots.filter(s => s.status === 'OCCUPIED').length;
      const reservedSlots = slots.filter(s => s.status === 'RESERVED').length;
      const disabledSlots = slots.filter(s => s.status === 'DISABLED').length;

      const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

      const activeBookings = await prisma.booking.count({
        where: { status: 'ACTIVE' }
      });

      // Today's boundaries
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todaysReservations = await prisma.reservation.count({
        where: {
          startTime: {
            gte: startOfToday,
            lte: endOfToday
          },
          status: { not: 'CANCELLED' }
        }
      });

      const todaysResList = await prisma.reservation.findMany({
        where: {
          startTime: {
            gte: startOfToday,
            lte: endOfToday
          },
          status: { not: 'CANCELLED' }
        },
        select: { price: true }
      });

      const todaysRevenue = todaysResList.reduce((acc, curr) => acc + curr.price, 0);

      return reply.send({
        success: true,
        data: {
          totalFacilities,
          totalFloors,
          totalSlots,
          availableSlots,
          occupiedSlots,
          reservedSlots,
          disabledSlots,
          occupancyPercentage,
          activeBookings,
          todaysReservations,
          todaysRevenue: Math.round(todaysRevenue * 100) / 100
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/operator/facilities
  fastify.get('/facilities', async (request, reply) => {
    try {
      const facilities = await prisma.parkingFacility.findMany({
        include: { slots: true }
      });

      const data = facilities.map(f => {
        const capacity = f.slots.length;
        const available = f.slots.filter(s => s.status === 'AVAILABLE').length;
        const occupied = f.slots.filter(s => s.status === 'OCCUPIED').length;
        const reserved = f.slots.filter(s => s.status === 'RESERVED').length;
        const disabled = f.slots.filter(s => s.status === 'DISABLED').length;
        const occupancyPercentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

        return {
          id: f.id,
          name: f.name,
          address: f.address,
          capacity,
          available,
          occupied,
          reserved,
          disabled,
          occupancyPercentage
        };
      });

      return reply.send({
        success: true,
        data
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/operator/facilities/:id/occupancy
  fastify.get('/facilities/:id/occupancy', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const facility = await prisma.parkingFacility.findUnique({
        where: { id },
        include: {
          slots: true,
          floors: {
            include: { slots: true }
          }
        }
      });

      if (!facility) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Facility not found.' }
        });
      }

      const total = facility.slots.length;
      const available = facility.slots.filter(s => s.status === 'AVAILABLE').length;
      const occupied = facility.slots.filter(s => s.status === 'OCCUPIED').length;
      const reserved = facility.slots.filter(s => s.status === 'RESERVED').length;
      const disabled = facility.slots.filter(s => s.status === 'DISABLED').length;
      const occupancyPercentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

      const floorBreakdown = facility.floors.map(floor => {
        const floorTotal = floor.slots.length;
        const floorAvailable = floor.slots.filter(s => s.status === 'AVAILABLE').length;
        const floorOccupied = floor.slots.filter(s => s.status === 'OCCUPIED').length;
        const floorReserved = floor.slots.filter(s => s.status === 'RESERVED').length;
        const floorDisabled = floor.slots.filter(s => s.status === 'DISABLED').length;
        const floorOccupancyPercentage = floorTotal > 0 ? Math.round((floorOccupied / floorTotal) * 100) : 0;

        return {
          id: floor.id,
          name: floor.name,
          level: floor.level,
          total: floorTotal,
          available: floorAvailable,
          occupied: floorOccupied,
          reserved: floorReserved,
          disabled: floorDisabled,
          occupancyPercentage: floorOccupancyPercentage,
          slots: floor.slots
        };
      });

      return reply.send({
        success: true,
        data: {
          facilityId: id,
          name: facility.name,
          total,
          available,
          occupied,
          reserved,
          disabled,
          occupancyPercentage,
          floors: floorBreakdown
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/operator/facilities/:id/telemetry
  fastify.get('/facilities/:id/telemetry', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit } = request.query as { limit?: string };

      const maxLimit = limit ? Math.min(100, Math.max(1, parseInt(limit))) : 20;

      const facility = await prisma.parkingFacility.findUnique({
        where: { id }
      });

      if (!facility) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Facility not found.' }
        });
      }

      const telemetry = await prisma.parkingTelemetry.findMany({
        where: { facilityId: id },
        include: {
          floor: true,
          slot: true
        },
        orderBy: { timestamp: 'desc' },
        take: maxLimit
      });

      return reply.send({
        success: true,
        data: telemetry
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });
}
