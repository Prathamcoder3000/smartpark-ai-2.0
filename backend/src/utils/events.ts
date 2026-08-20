import { EventEmitter } from 'events';

export const realtimeEmitter = new EventEmitter();

// Allow up to 100 concurrent SSE client listeners
realtimeEmitter.setMaxListeners(100);

export const emitAvailabilityUpdate = (facilityId: string) => {
  realtimeEmitter.emit('availability_update', {
    event: 'availability_update',
    facilityId,
    timestamp: new Date()
  });
};

export const emitTelemetryUpdate = (facilityId: string, slotId: string) => {
  realtimeEmitter.emit('telemetry_update', {
    event: 'telemetry_update',
    facilityId,
    slotId,
    timestamp: new Date()
  });
};

export const emitBookingUpdate = (
  facilityId: string,
  bookingId: string,
  status: string,
  slotId?: string,
  reservationId?: string
) => {
  realtimeEmitter.emit('booking_update', {
    event: 'booking_update',
    facilityId,
    bookingId,
    status,
    slotId,
    reservationId,
    timestamp: new Date()
  });
};

export const emitReservationUpdate = (
  facilityId: string,
  reservationId: string,
  status: string,
  slotId?: string
) => {
  realtimeEmitter.emit('reservation_update', {
    event: 'reservation_update',
    facilityId,
    reservationId,
    status,
    slotId,
    timestamp: new Date()
  });
};
