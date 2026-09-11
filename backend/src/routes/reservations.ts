import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { ReservationStatus, NotificationType, NotificationPriority } from '@prisma/client';
import { emitReservationUpdate, emitAvailabilityUpdate } from '../utils/events';

export async function reservationRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Helper pricing calculation ($5.00 per hour, minimum $5.00)
  const calculatePrice = (startTime: string, endTime: string): number => {
    const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return Math.max(5.00, Math.round(hours * 5.00 * 100) / 100);
  };

  // POST /api/reservations
  fastify.post('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const body = request.body as any;

      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const { facilityId, slotId, vehicleId, startTime, endTime } = body;

      if (!facilityId || !slotId || !startTime || !endTime) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'facilityId, slotId, startTime, and endTime are required.' }
        });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid date/time format.' }
        });
      }

      if (start >= end) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'endTime must be after startTime.' }
        });
      }

      if (start.getTime() < now.getTime() - 60000) { // Allow 1 min buffer
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Reservation cannot be in the past.' }
        });
      }

      // Verify facility exists
      const facility = await prisma.parkingFacility.findUnique({
        where: { id: facilityId }
      });
      if (!facility) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Facility not found.' }
        });
      }

      // Verify slot exists and belongs to facility
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId }
      });
      if (!slot || slot.facilityId !== facilityId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Parking slot does not exist or does not belong to the facility.' }
        });
      }

      if (slot.status === 'DISABLED') {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Selected parking slot is currently disabled.' }
        });
      }

      // Verify vehicle belongs to user if provided
      if (vehicleId) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });
        if (!vehicle || vehicle.userId !== userId) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Vehicle not found or does not belong to you.' }
          });
        }
      }

      // Double-booking check: verify slot has no active reservations overlapping requested range
      const overlapping = await prisma.reservation.findFirst({
        where: {
          slotId,
          status: {
            notIn: [ReservationStatus.CANCELLED, ReservationStatus.EXPIRED, ReservationStatus.COMPLETED]
          },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });

      if (overlapping) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'Parking slot is not available for the selected time.'
          }
        });
      }

      const calculatedPrice = calculatePrice(startTime, endTime);

      const result = await prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.create({
          data: {
            userId,
            facilityId,
            slotId,
            vehicleId: vehicleId || null,
            startTime: start,
            endTime: end,
            status: ReservationStatus.CONFIRMED,
            price: calculatedPrice
          },
          include: {
            facility: true,
            slot: {
              include: {
                floor: true
              }
            },
            vehicle: true
          }
        });

        // Reserve slot if currently AVAILABLE
        if (slot.status === 'AVAILABLE') {
          await tx.parkingSlot.update({
            where: { id: slotId },
            data: { status: 'RESERVED' }
          });
        }

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Reservation confirmed',
            message: `Your parking reservation at ${facility.name} (Slot ${slot.slotNumber}) is confirmed.`
          }
        });

        return reservation;
      });

      emitReservationUpdate(result.facilityId, result.id, result.status, result.slotId);
      emitAvailabilityUpdate(result.facilityId);

      return reply.status(201).send({
        success: true,
        data: result
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/reservations
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { status, upcoming, past } = request.query as { status?: string; upcoming?: string; past?: string };

      const whereClause: any = { userId };

      if (status) {
        const validStatuses = Object.values(ReservationStatus);
        if (!validStatuses.includes(status as any)) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}` }
          });
        }
        whereClause.status = status as ReservationStatus;
      }

      const now = new Date();
      if (upcoming === 'true') {
        whereClause.startTime = { gt: now };
      } else if (past === 'true') {
        whereClause.endTime = { lt: now };
      }

      const reservations = await prisma.reservation.findMany({
        where: whereClause,
        include: {
          facility: true,
          slot: {
            include: {
              floor: true
            }
          },
          vehicle: true
        },
        orderBy: { startTime: 'desc' }
      });

      return reply.send({
        success: true,
        data: reservations
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/reservations/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
          facility: true,
          slot: {
            include: {
              floor: true
            }
          },
          vehicle: true
        }
      });

      if (!reservation) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation not found.' }
        });
      }

      if (reservation.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to view this reservation.' }
        });
      }

      return reply.send({
        success: true,
        data: reservation
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // PUT /api/reservations/:id
  fastify.put('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };
      const body = request.body as any;

      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { facility: true, slot: true }
      });

      if (!reservation) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation not found.' }
        });
      }

      if (reservation.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this reservation.' }
        });
      }

      const terminalStates: ReservationStatus[] = [ReservationStatus.CANCELLED, ReservationStatus.EXPIRED, ReservationStatus.COMPLETED];
      if (terminalStates.includes(reservation.status)) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Cannot modify a reservation in a terminal state.' }
        });
      }

      const { slotId, vehicleId, startTime, endTime } = body;

      const newStart = startTime ? new Date(startTime) : new Date(reservation.startTime);
      const newEnd = endTime ? new Date(endTime) : new Date(reservation.endTime);
      const targetSlotId = slotId || reservation.slotId;

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid date/time format.' }
        });
      }

      if (newStart >= newEnd) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'endTime must be after startTime.' }
        });
      }

      // Verify slot if changed
      if (slotId && slotId !== reservation.slotId) {
        const slot = await prisma.parkingSlot.findUnique({
          where: { id: slotId }
        });
        if (!slot || slot.facilityId !== reservation.facilityId) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Parking slot does not exist or does not belong to the same facility.' }
          });
        }
        if (slot.status === 'DISABLED') {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Selected parking slot is disabled.' }
          });
        }
      }

      // Verify vehicle if changed
      if (vehicleId && vehicleId !== reservation.vehicleId) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });
        if (!vehicle || vehicle.userId !== userId) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Vehicle not found or does not belong to you.' }
          });
        }
      }

      // Re-check overlaps excluding this reservation
      const overlapping = await prisma.reservation.findFirst({
        where: {
          id: { not: id },
          slotId: targetSlotId,
          status: {
            notIn: [ReservationStatus.CANCELLED, ReservationStatus.EXPIRED, ReservationStatus.COMPLETED]
          },
          startTime: { lt: newEnd },
          endTime: { gt: newStart }
        }
      });

      if (overlapping) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'Parking slot is not available for the selected time.'
          }
        });
      }

      const calculatedPrice = calculatePrice(newStart.toISOString(), newEnd.toISOString());

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.reservation.update({
          where: { id },
          data: {
            slotId: targetSlotId,
            vehicleId: vehicleId || reservation.vehicleId,
            startTime: newStart,
            endTime: newEnd,
            price: calculatedPrice
          },
          include: {
            facility: true,
            slot: {
              include: {
                floor: true
              }
            },
            vehicle: true
          }
        });

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Reservation updated',
            message: `Your reservation at ${reservation.facility.name} (Slot ${updated.slot.slotNumber}) has been updated.`
          }
        });

        return updated;
      });

      emitReservationUpdate(result.facilityId, result.id, result.status, result.slotId);
      emitAvailabilityUpdate(result.facilityId);

      return reply.send({
        success: true,
        data: result
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // Shared Cancellation Logic Helper
  const processReservationCancel = async (id: string, userId: string) => {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        facility: true,
        slot: {
          include: {
            floor: true
          }
        },
        bookings: true
      }
    });

    if (!reservation) {
      return { status: 404, error: { code: 'NOT_FOUND', message: 'Reservation not found.' } };
    }

    if (reservation.userId !== userId) {
      return { status: 403, error: { code: 'FORBIDDEN', message: 'You do not have permission to cancel this reservation.' } };
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      return { status: 400, error: { code: 'BAD_REQUEST', message: 'Reservation is already cancelled.' } };
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      return { status: 400, error: { code: 'BAD_REQUEST', message: 'Cannot cancel a completed reservation.' } };
    }

    // Check linked active bookings for check-in status
    const activeBookings = reservation.bookings.filter(b => b.status === 'ACTIVE');
    const checkedInBooking = activeBookings.find(b => b.entryTime !== null);

    if (checkedInBooking) {
      return { status: 400, error: { code: 'BAD_REQUEST', message: 'Cannot cancel reservation after check-in has occurred.' } };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update reservation status to CANCELLED
      const updated = await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CANCELLED },
        include: {
          facility: true,
          slot: {
            include: {
              floor: true
            }
          },
          vehicle: true
        }
      });

      // 2. Cancel all linked active (not checked-in) bookings
      if (activeBookings.length > 0) {
        await tx.booking.updateMany({
          where: {
            reservationId: id,
            status: 'ACTIVE'
          },
          data: { status: 'CANCELLED' }
        });
      }

      // 3. Release parking slot status if currently RESERVED
      if (reservation.slot.status === 'RESERVED') {
        await tx.parkingSlot.update({
          where: { id: reservation.slotId },
          data: { status: 'AVAILABLE' }
        });
      }

      // 4. Create user notification
      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.BOOKING,
          priority: NotificationPriority.IMPORTANT,
          title: 'Reservation cancelled',
          message: `Your reservation at ${reservation.facility.name} (Slot ${reservation.slot.slotNumber}) has been cancelled.`
        }
      });

      return { updated, activeBookings };
    });

    // Emit realtime SSE events
    emitReservationUpdate(reservation.facilityId, result.updated.id, result.updated.status, reservation.slotId);
    for (const b of result.activeBookings) {
      const { emitBookingUpdate } = await import('../utils/events');
      emitBookingUpdate(reservation.facilityId, b.id, 'CANCELLED', reservation.slotId, reservation.id);
    }
    emitAvailabilityUpdate(reservation.facilityId);

    return { status: 200, data: result.updated };
  };

  // DELETE /api/reservations/:id (Cancel reservation)
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const outcome = await processReservationCancel(id, userId);
      if (outcome.error) {
        return reply.status(outcome.status).send({
          success: false,
          error: outcome.error
        });
      }

      return reply.send({
        success: true,
        data: outcome.data
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // POST /api/reservations/:id/cancel (Cancel reservation - POST method support)
  fastify.post('/:id/cancel', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const outcome = await processReservationCancel(id, userId);
      if (outcome.error) {
        return reply.status(outcome.status).send({
          success: false,
          error: outcome.error
        });
      }

      return reply.send({
        success: true,
        data: outcome.data
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

