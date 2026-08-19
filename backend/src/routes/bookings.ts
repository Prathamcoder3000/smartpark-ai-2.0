import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { BookingStatus, ReservationStatus, ParkingSlotStatus, NotificationType, NotificationPriority } from '@prisma/client';

export async function bookingRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.authenticate);

  // Helper to calculate actual checkout amount ($5.00 per hour, minimum $5.00)
  const calculateFinalAmount = (entryTime: Date, exitTime: Date): number => {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return Math.max(5.00, Math.round(hours * 5.00 * 100) / 100);
  };

  // POST /api/bookings (Create booking from confirmed reservation)
  fastify.post('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const body = request.body as any;

      if (!body || !body.reservationId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'reservationId is required.' }
        });
      }

      const { reservationId } = body;

      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
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
          error: { code: 'FORBIDDEN', message: 'You do not own this reservation.' }
        });
      }

      if (reservation.status !== ReservationStatus.CONFIRMED) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: `Reservation must be CONFIRMED. Current status: ${reservation.status}` }
        });
      }

      const now = new Date();
      if (new Date(reservation.endTime) <= now) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Reservation has already expired.' }
        });
      }

      // Check if another active booking already exists for this reservation
      const existingBooking = await prisma.booking.findFirst({
        where: {
          reservationId,
          status: BookingStatus.ACTIVE
        }
      });

      if (existingBooking) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'An active booking already exists for this reservation.' }
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            userId,
            facilityId: reservation.facilityId,
            slotId: reservation.slotId,
            reservationId,
            status: BookingStatus.ACTIVE
          },
          include: {
            facility: true,
            slot: true,
            reservation: true
          }
        });

        // Set slot to RESERVED as the active reservation starts
        await tx.parkingSlot.update({
          where: { id: reservation.slotId },
          data: { status: ParkingSlotStatus.RESERVED }
        });

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Booking created',
            message: `Your booking for ${reservation.facility.name} (Slot ${reservation.slot.slotNumber}) is created. You can now check in.`
          }
        });

        return booking;
      });

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

  // POST /api/bookings/:id/check-in
  fastify.post('/:id/check-in', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { facility: true, slot: true }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found.' }
        });
      }

      if (booking.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this booking.' }
        });
      }

      if (booking.status !== BookingStatus.ACTIVE) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: `Booking must be ACTIVE. Current status: ${booking.status}` }
        });
      }

      if (booking.entryTime) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Already checked in.' }
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Update slot status first
        await tx.parkingSlot.update({
          where: { id: booking.slotId },
          data: { status: ParkingSlotStatus.OCCUPIED }
        });

        // 2. Update booking and fetch it (slot will now show status = OCCUPIED)
        const updated = await tx.booking.update({
          where: { id },
          data: { entryTime: new Date() },
          include: { facility: true, slot: true }
        });

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Check-in successful',
            message: `You checked in at ${booking.facility.name} (Slot ${booking.slot.slotNumber}).`
          }
        });

        return updated;
      });

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

  // POST /api/bookings/:id/check-out
  fastify.post('/:id/check-out', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { facility: true, slot: true }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found.' }
        });
      }

      if (booking.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this booking.' }
        });
      }

      if (booking.status !== BookingStatus.ACTIVE) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: `Booking must be ACTIVE. Current status: ${booking.status}` }
        });
      }

      if (!booking.entryTime) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Cannot check out without checking in first.' }
        });
      }

      if (booking.exitTime) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Already checked out.' }
        });
      }

      const now = new Date();
      const finalAmount = calculateFinalAmount(booking.entryTime, now);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Set slot to AVAILABLE first
        await tx.parkingSlot.update({
          where: { id: booking.slotId },
          data: { status: ParkingSlotStatus.AVAILABLE }
        });

        // 2. Update reservation to COMPLETED
        if (booking.reservationId) {
          await tx.reservation.update({
            where: { id: booking.reservationId },
            data: { status: ReservationStatus.COMPLETED }
          });
        }

        // 3. Update booking and fetch it (slot will now show status = AVAILABLE)
        const updated = await tx.booking.update({
          where: { id },
          data: {
            exitTime: now,
            finalAmount,
            status: BookingStatus.COMPLETED
          },
          include: { facility: true, slot: true }
        });

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Check-out successful',
            message: `You checked out of ${booking.facility.name} (Slot ${booking.slot.slotNumber}). Total: $${finalAmount.toFixed(2)}.`
          }
        });

        return updated;
      });

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

  // POST /api/bookings/:id/cancel
  fastify.post('/:id/cancel', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { facility: true, slot: true }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found.' }
        });
      }

      if (booking.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this booking.' }
        });
      }

      if (booking.status !== BookingStatus.ACTIVE) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: `Cannot cancel a booking with status: ${booking.status}` }
        });
      }

      if (booking.entryTime) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Cannot cancel a booking after check-in has occurred.' }
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Revert slot status back to AVAILABLE
        await tx.parkingSlot.update({
          where: { id: booking.slotId },
          data: { status: ParkingSlotStatus.AVAILABLE }
        });

        // 2. Cancel the associated reservation
        if (booking.reservationId) {
          await tx.reservation.update({
            where: { id: booking.reservationId },
            data: { status: ReservationStatus.CANCELLED }
          });
        }

        // 3. Update booking and fetch it (slot will now show status = AVAILABLE)
        const updated = await tx.booking.update({
          where: { id },
          data: { status: BookingStatus.CANCELLED },
          include: { facility: true, slot: true }
        });

        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BOOKING,
            priority: NotificationPriority.IMPORTANT,
            title: 'Booking cancelled',
            message: `Your booking for ${booking.facility.name} (Slot ${booking.slot.slotNumber}) has been cancelled.`
          }
        });

        return updated;
      });

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

  // GET /api/bookings
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { status } = request.query as { status?: string };

      const whereClause: any = { userId };

      if (status) {
        const validStatuses = Object.values(BookingStatus);
        if (!validStatuses.includes(status as any)) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}` }
          });
        }
        whereClause.status = status as BookingStatus;
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          facility: true,
          slot: {
            include: {
              floor: true
            }
          },
          reservation: {
            include: {
              vehicle: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: bookings
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/bookings/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          facility: true,
          slot: {
            include: {
              floor: true
            }
          },
          reservation: {
            include: {
              vehicle: true
            }
          }
        }
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found.' }
        });
      }

      if (booking.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this booking.' }
        });
      }

      return reply.send({
        success: true,
        data: booking
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
