import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { emitAvailabilityUpdate, emitTelemetryUpdate } from '../utils/events';
import { ParkingSlotStatus } from '@prisma/client';

export async function telemetryRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Helper to validate a single telemetry item
  const validateItem = async (item: any) => {
    const { facilityId, floorId, slotId, occupancy, source, timestamp } = item;
    if (!facilityId) {
      throw new Error('facilityId is required.');
    }

    const facility = await prisma.parkingFacility.findUnique({
      where: { id: facilityId }
    });
    if (!facility) {
      throw new Error(`Facility not found: ${facilityId}`);
    }

    if (floorId) {
      const floor = await prisma.floor.findUnique({
        where: { id: floorId }
      });
      if (!floor || floor.facilityId !== facilityId) {
        throw new Error(`Floor not found or does not belong to facility: ${floorId}`);
      }
    }

    if (slotId) {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId }
      });
      if (!slot || slot.facilityId !== facilityId) {
        throw new Error(`Slot not found or does not belong to facility: ${slotId}`);
      }
      if (floorId && slot.floorId !== floorId) {
        throw new Error(`Slot does not belong to requested floor: ${slotId}`);
      }
    }
  };

  // POST /api/telemetry
  fastify.post('/', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body) {
        return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Body is required.' } });
      }

      await validateItem(body);

      const { facilityId, floorId, slotId, occupancy, source, timestamp } = body;

      const dateTimestamp = timestamp ? new Date(timestamp) : new Date();

      const result = await prisma.$transaction(async (tx) => {
        // Create telemetry record
        const telemetry = await tx.parkingTelemetry.create({
          data: {
            facilityId,
            floorId: floorId || null,
            slotId: slotId || null,
            occupancyRate: occupancy ? 1.0 : 0.0,
            sensorValue: occupancy ? 'occupied' : 'vacant',
            sensorType: source || 'ESP32',
            timestamp: dateTimestamp
          }
        });

        // Update slot state (excluding DISABLED)
        if (slotId) {
          const slot = await tx.parkingSlot.findUnique({
            where: { id: slotId }
          });

          if (slot && slot.status !== ParkingSlotStatus.DISABLED) {
            const targetStatus = occupancy ? ParkingSlotStatus.OCCUPIED : ParkingSlotStatus.AVAILABLE;
            if (slot.status !== targetStatus) {
              await tx.parkingSlot.update({
                where: { id: slotId },
                data: { status: targetStatus }
              });
            }
          }
        }

        return telemetry;
      });

      // Emit realtime events
      emitAvailabilityUpdate(facilityId);
      if (slotId) {
        emitTelemetryUpdate(facilityId, slotId);
      }

      return reply.status(201).send({
        success: true,
        data: result
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message || 'Validation error.' }
      });
    }
  });

  // POST /api/telemetry/batch
  fastify.post('/batch', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body || !Array.isArray(body)) {
        return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Batch payload must be an array.' } });
      }

      // Pre-validate all items before writing
      for (const item of body) {
        await validateItem(item);
      }

      const affectedFacilities = new Set<string>();
      const affectedSlots = new Set<string>();

      const result = await prisma.$transaction(async (tx) => {
        const records = [];
        for (const item of body) {
          const { facilityId, floorId, slotId, occupancy, source, timestamp } = item;
          const dateTimestamp = timestamp ? new Date(timestamp) : new Date();

          const telemetry = await tx.parkingTelemetry.create({
            data: {
              facilityId,
              floorId: floorId || null,
              slotId: slotId || null,
              occupancyRate: occupancy ? 1.0 : 0.0,
              sensorValue: occupancy ? 'occupied' : 'vacant',
              sensorType: source || 'ESP32',
              timestamp: dateTimestamp
            }
          });
          records.push(telemetry);

          if (slotId) {
            const slot = await tx.parkingSlot.findUnique({
              where: { id: slotId }
            });

            if (slot && slot.status !== ParkingSlotStatus.DISABLED) {
              const targetStatus = occupancy ? ParkingSlotStatus.OCCUPIED : ParkingSlotStatus.AVAILABLE;
              if (slot.status !== targetStatus) {
                await tx.parkingSlot.update({
                  where: { id: slotId },
                  data: { status: targetStatus }
                });
              }
            }
            affectedSlots.add(slotId);
          }
          affectedFacilities.add(facilityId);
        }
        return records;
      });

      // Emit events
      affectedFacilities.forEach(fId => emitAvailabilityUpdate(fId));
      affectedSlots.forEach(sId => {
        const slotRecord = body.find(item => item.slotId === sId);
        if (slotRecord) {
          emitTelemetryUpdate(slotRecord.facilityId, sId);
        }
      });

      return reply.status(201).send({
        success: true,
        data: { count: result.length, records: result }
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message || 'Validation error.' }
      });
    }
  });

  // GET /api/telemetry/facility/:facilityId
  fastify.get('/facility/:facilityId', async (request, reply) => {
    try {
      const { facilityId } = request.params as { facilityId: string };
      const records = await prisma.parkingTelemetry.findMany({
        where: { facilityId },
        include: { floor: true, slot: true },
        orderBy: { timestamp: 'desc' }
      });
      return reply.send({ success: true, data: records });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal error.' } });
    }
  });

  // GET /api/telemetry/slot/:slotId
  fastify.get('/slot/:slotId', async (request, reply) => {
    try {
      const { slotId } = request.params as { slotId: string };
      const records = await prisma.parkingTelemetry.findMany({
        where: { slotId },
        include: { floor: true, slot: true },
        orderBy: { timestamp: 'desc' }
      });
      return reply.send({ success: true, data: records });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal error.' } });
    }
  });
}
