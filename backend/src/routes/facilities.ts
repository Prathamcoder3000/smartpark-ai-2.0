import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { ParkingSlotStatus } from '@prisma/client';

export async function facilityRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Helper to verify facility exists
  const getFacilityOrThrow = async (id: string) => {
    const facility = await prisma.parkingFacility.findUnique({
      where: { id }
    });
    if (!facility) {
      const err = new Error('Facility not found') as any;
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return facility;
  };

  // GET /api/facilities
  fastify.get('/', async (request, reply) => {
    try {
      const facilities = await prisma.parkingFacility.findMany({
        include: {
          slots: true
        }
      });

      const data = facilities.map((facility) => {
        const totalCapacity = facility.slots.length;
        const availableSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.AVAILABLE).length;
        const occupiedSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.OCCUPIED).length;
        const reservedSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.RESERVED).length;
        const disabledSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.DISABLED).length;
        const occupancyPercentage = totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0;

        return {
          id: facility.id,
          name: facility.name,
          address: facility.address,
          latitude: facility.latitude,
          longitude: facility.longitude,
          description: facility.description,
          createdAt: facility.createdAt,
          updatedAt: facility.updatedAt,
          totalCapacity,
          availableSlots,
          occupiedSlots,
          reservedSlots,
          disabledSlots,
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

  // GET /api/facilities/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const facility = await prisma.parkingFacility.findUnique({
        where: { id },
        include: {
          floors: true,
          slots: true
        }
      });

      if (!facility) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Facility not found.' }
        });
      }

      const totalCapacity = facility.slots.length;
      const availableSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.AVAILABLE).length;
      const occupiedSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.OCCUPIED).length;
      const reservedSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.RESERVED).length;
      const disabledSlots = facility.slots.filter(s => s.status === ParkingSlotStatus.DISABLED).length;
      const occupancyPercentage = totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0;

      return reply.send({
        success: true,
        data: {
          facility: {
            id: facility.id,
            name: facility.name,
            address: facility.address,
            latitude: facility.latitude,
            longitude: facility.longitude,
            description: facility.description,
            createdAt: facility.createdAt,
            updatedAt: facility.updatedAt
          },
          floors: facility.floors,
          capacitySummary: {
            totalCapacity,
            occupancyPercentage
          },
          availabilitySummary: {
            available: availableSlots,
            occupied: occupiedSlots,
            reserved: reservedSlots,
            disabled: disabledSlots
          }
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

  // GET /api/facilities/:id/floors
  fastify.get('/:id/floors', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await getFacilityOrThrow(id);

      const floors = await prisma.floor.findMany({
        where: { facilityId: id },
        include: {
          slots: true
        }
      });

      const data = floors.map((floor) => {
        const totalSlots = floor.slots.length;
        const available = floor.slots.filter(s => s.status === ParkingSlotStatus.AVAILABLE).length;
        const occupied = floor.slots.filter(s => s.status === ParkingSlotStatus.OCCUPIED).length;
        const reserved = floor.slots.filter(s => s.status === ParkingSlotStatus.RESERVED).length;
        const disabled = floor.slots.filter(s => s.status === ParkingSlotStatus.DISABLED).length;

        return {
          id: floor.id,
          name: floor.name,
          level: floor.level,
          totalSlots,
          available,
          occupied,
          reserved,
          disabled
        };
      });

      return reply.send({
        success: true,
        data
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/facilities/:id/slots
  fastify.get('/:id/slots', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await getFacilityOrThrow(id);

      const { floorId, status, ev } = request.query as { floorId?: string; status?: string; ev?: string };

      const whereClause: any = { facilityId: id };

      if (floorId !== undefined) {
        // Validate floor exists in this facility
        const floor = await prisma.floor.findFirst({
          where: { id: floorId, facilityId: id }
        });
        if (!floor) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Invalid floorId provided for this facility.' }
          });
        }
        whereClause.floorId = floorId;
      }

      if (status !== undefined) {
        // Validate status enum
        const validStatuses = Object.values(ParkingSlotStatus);
        if (!validStatuses.includes(status as any)) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}` }
          });
        }
        whereClause.status = status as ParkingSlotStatus;
      }

      if (ev !== undefined) {
        // Validate ev boolean string
        if (ev !== 'true' && ev !== 'false') {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Invalid ev parameter. Must be "true" or "false".' }
          });
        }
        whereClause.isEVCharging = ev === 'true';
      }

      const slots = await prisma.parkingSlot.findMany({
        where: whereClause,
        orderBy: { slotNumber: 'asc' }
      });

      return reply.send({
        success: true,
        data: slots
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/facilities/:id/availability
  fastify.get('/:id/availability', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await getFacilityOrThrow(id);

      const slots = await prisma.parkingSlot.findMany({
        where: { facilityId: id }
      });

      const total = slots.length;
      const available = slots.filter(s => s.status === ParkingSlotStatus.AVAILABLE).length;
      const occupied = slots.filter(s => s.status === ParkingSlotStatus.OCCUPIED).length;
      const reserved = slots.filter(s => s.status === ParkingSlotStatus.RESERVED).length;
      const disabled = slots.filter(s => s.status === ParkingSlotStatus.DISABLED).length;
      const occupancyPercentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

      return reply.send({
        success: true,
        data: {
          facilityId: id,
          total,
          available,
          occupied,
          reserved,
          disabled,
          occupancyPercentage
        }
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message }
        });
      }
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });
}
