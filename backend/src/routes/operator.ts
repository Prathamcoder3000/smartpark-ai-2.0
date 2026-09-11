import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { emitAvailabilityUpdate } from '../utils/events';

function isFacilityAuthorized(operator: any, facilityId: string): boolean {
  if (!operator.facilities || operator.facilities.length === 0 || operator.role === 'ADMIN') {
    return true; // Global operator / Admin
  }
  return operator.facilities.some((f: any) => f.id === facilityId);
}

function getScopedFacilityWhere(operator: any) {
  if (!operator.facilities || operator.facilities.length === 0 || operator.role === 'ADMIN') {
    return {};
  }
  const allowedIds = operator.facilities.map((f: any) => f.id);
  return { id: { in: allowedIds } };
}

function getScopedSlotWhere(operator: any) {
  if (!operator.facilities || operator.facilities.length === 0 || operator.role === 'ADMIN') {
    return {};
  }
  const allowedIds = operator.facilities.map((f: any) => f.id);
  return { facilityId: { in: allowedIds } };
}

export async function operatorRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Authenticate and authorize as operator
  fastify.addHook('preHandler', async (request, reply) => {
    // 1. Run basic JWT authentication
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    // 2. Check if this is the seed endpoint
    const isSeedOperator = request.url.split('?')[0].endsWith('/seed-operator');
    if (isSeedOperator) {
      return;
    }

    // 3. Look up Operator record by email from verified JWT identity
    const operator = await prisma.operator.findUnique({
      where: { email: request.user!.email },
      include: { facilities: true }
    });

    if (!operator) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You do not have operator privileges.' }
      });
    }

    (request as any).operator = operator;
  });

  // POST /api/operator/seed-operator
  fastify.post('/seed-operator', async (request, reply) => {
    const body = request.body as any;
    if (!body || !body.email || !body.name) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Email and name are required.' }
      });
    }

    const operatorCount = await prisma.operator.count();
    if (operatorCount > 0) {
      const adminSecret = process.env.ADMIN_SEED_SECRET || 'smartpark-admin-secret-key';
      const providedSecret = request.headers['x-admin-seed-secret'] || (body && body.adminSeedSecret);
      if (!adminSecret || providedSecret !== adminSecret) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Operator seeding is disabled or requires valid secret.' }
        });
      }
    }

    let facilityConnectUpdate = undefined;
    let facilityConnectCreate = undefined;
    if (Array.isArray(body.facilityIds) && body.facilityIds.length > 0) {
      facilityConnectUpdate = {
        set: body.facilityIds.map((id: string) => ({ id }))
      };
      facilityConnectCreate = {
        connect: body.facilityIds.map((id: string) => ({ id }))
      };
    }

    const op = await prisma.operator.upsert({
      where: { email: body.email },
      update: {
        name: body.name,
        role: body.role || 'OPERATOR',
        ...(facilityConnectUpdate ? { facilities: facilityConnectUpdate } : {})
      },
      create: {
        email: body.email,
        name: body.name,
        role: body.role || 'OPERATOR',
        ...(facilityConnectCreate ? { facilities: facilityConnectCreate } : {})
      },
      include: { facilities: true }
    });

    return reply.send({ success: true, data: op });
  });

  // GET /api/operator/dashboard
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const operator = (request as any).operator;
      const facilityWhere = getScopedFacilityWhere(operator);
      const slotWhere = getScopedSlotWhere(operator);

      const totalFacilities = await prisma.parkingFacility.count({ where: facilityWhere });
      const totalFloors = await prisma.floor.count({
        where: facilityWhere.id ? { facilityId: facilityWhere.id } : {}
      });
      const totalSlots = await prisma.parkingSlot.count({ where: slotWhere });

      const slots = await prisma.parkingSlot.findMany({ where: slotWhere });
      const availableSlots = slots.filter(s => s.status === 'AVAILABLE').length;
      const occupiedSlots = slots.filter(s => s.status === 'OCCUPIED').length;
      const reservedSlots = slots.filter(s => s.status === 'RESERVED').length;
      const disabledSlots = slots.filter(s => s.status === 'DISABLED').length;

      const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

      const activeBookings = await prisma.booking.count({
        where: {
          status: 'ACTIVE',
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
        }
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todaysReservations = await prisma.reservation.count({
        where: {
          startTime: { gte: startOfToday, lte: endOfToday },
          status: { not: 'CANCELLED' },
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
        }
      });

      const todaysResList = await prisma.reservation.findMany({
        where: {
          startTime: { gte: startOfToday, lte: endOfToday },
          status: { not: 'CANCELLED' },
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
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
      const operator = (request as any).operator;
      const facilityWhere = getScopedFacilityWhere(operator);

      const facilities = await prisma.parkingFacility.findMany({
        where: facilityWhere,
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
      const operator = (request as any).operator;
      const { id } = request.params as { id: string };

      if (!isFacilityAuthorized(operator, id)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You are not authorized for this facility.' }
        });
      }

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
      const operator = (request as any).operator;
      const { id } = request.params as { id: string };
      const { limit } = request.query as { limit?: string };

      if (!isFacilityAuthorized(operator, id)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You are not authorized for this facility.' }
        });
      }

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

  // PATCH /api/operator/slots/:id
  fastify.patch('/slots/:id', async (request, reply) => {
    try {
      const operator = (request as any).operator;
      const { id } = request.params as { id: string };
      const { status } = (request.body || {}) as { status: string };

      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED'];
      if (!status || !validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }
        });
      }

      const slot = await prisma.parkingSlot.findUnique({
        where: { id },
        include: { facility: true }
      });

      if (!slot) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Parking slot not found.' }
        });
      }

      if (!isFacilityAuthorized(operator, slot.facilityId)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You are not authorized for this facility.' }
        });
      }

      // Check business rule protections if attempting to set status to DISABLED or AVAILABLE
      if (status === 'DISABLED' || status === 'AVAILABLE') {
        const activeBooking = await prisma.booking.findFirst({
          where: { slotId: id, status: 'ACTIVE' }
        });

        if (activeBooking) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Cannot modify status of a slot with an active booking.' }
          });
        }

        if (status === 'DISABLED') {
          const activeReservation = await prisma.reservation.findFirst({
            where: {
              slotId: id,
              status: { in: ['CONFIRMED', 'PENDING'] }
            }
          });

          if (activeReservation) {
            return reply.status(400).send({
              success: false,
              error: { code: 'BAD_REQUEST', message: 'Cannot disable a slot with an active or pending reservation.' }
            });
          }
        }
      }

      const updatedSlot = await prisma.parkingSlot.update({
        where: { id },
        data: { status: status as any }
      });

      // Emit SSE availability update
      emitAvailabilityUpdate(slot.facilityId);

      return reply.send({
        success: true,
        data: updatedSlot
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/operator/analytics
  fastify.get('/analytics', async (request, reply) => {
    try {
      const operator = (request as any).operator;
      const facilityWhere = getScopedFacilityWhere(operator);

      const facilities = await prisma.parkingFacility.findMany({
        where: facilityWhere,
        include: {
          slots: true,
          floors: {
            include: { slots: true }
          }
        }
      });

      let totalSlotsCount = 0;
      let totalOccupiedCount = 0;
      let facilityUtilization: any[] = [];
      let highestFloorOccupancy: any = null;
      let maxFloorPct = -1;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      for (const fac of facilities) {
        const facSlots = fac.slots.length;
        const facOccupied = fac.slots.filter(s => s.status === 'OCCUPIED').length;
        const facAvailable = fac.slots.filter(s => s.status === 'AVAILABLE').length;
        const facPct = facSlots > 0 ? Math.round((facOccupied / facSlots) * 100) : 0;

        totalSlotsCount += facSlots;
        totalOccupiedCount += facOccupied;

        const activeBookingsCount = await prisma.booking.count({
          where: { facilityId: fac.id, status: 'ACTIVE' }
        });

        const todaysRes = await prisma.reservation.findMany({
          where: {
            facilityId: fac.id,
            startTime: { gte: startOfToday, lte: endOfToday },
            status: { not: 'CANCELLED' }
          },
          select: { price: true }
        });

        const revenueToday = todaysRes.reduce((acc, curr) => acc + curr.price, 0);

        facilityUtilization.push({
          facilityId: fac.id,
          name: fac.name,
          totalSlots: facSlots,
          occupiedSlots: facOccupied,
          availableSlots: facAvailable,
          occupancyPercentage: facPct,
          activeBookings: activeBookingsCount,
          revenueToday: Math.round(revenueToday * 100) / 100
        });

        for (const floor of fac.floors) {
          const flTotal = floor.slots.length;
          const flOccupied = floor.slots.filter(s => s.status === 'OCCUPIED').length;
          const flPct = flTotal > 0 ? Math.round((flOccupied / flTotal) * 100) : 0;

          if (flPct > maxFloorPct) {
            maxFloorPct = flPct;
            highestFloorOccupancy = {
              facilityId: fac.id,
              facilityName: fac.name,
              floorId: floor.id,
              floorName: floor.name,
              level: floor.level,
              totalSlots: flTotal,
              occupiedSlots: flOccupied,
              occupancyPercentage: flPct
            };
          }
        }
      }

      const overallOccupancyPct = totalSlotsCount > 0 ? Math.round((totalOccupiedCount / totalSlotsCount) * 100) : 0;

      const activeBookingsCount = await prisma.booking.count({
        where: {
          status: 'ACTIVE',
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
        }
      });

      const totalReservationsToday = await prisma.reservation.count({
        where: {
          startTime: { gte: startOfToday, lte: endOfToday },
          status: { not: 'CANCELLED' },
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
        }
      });

      const todaysResList = await prisma.reservation.findMany({
        where: {
          startTime: { gte: startOfToday, lte: endOfToday },
          status: { not: 'CANCELLED' },
          ...(facilityWhere.id ? { facilityId: facilityWhere.id } : {})
        },
        select: { price: true }
      });
      const totalRevenueToday = todaysResList.reduce((acc, curr) => acc + curr.price, 0);

      return reply.send({
        success: true,
        data: {
          overallOccupancyPct,
          totalRevenueToday: Math.round(totalRevenueToday * 100) / 100,
          activeBookingsCount,
          totalReservationsToday,
          facilityUtilization,
          peakFloorOccupancy: highestFloorOccupancy
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
}
