import { EventEmitter } from 'events';

export const realtimeEmitter = new EventEmitter();

// Allow up to 100 concurrent SSE client listeners
realtimeEmitter.setMaxListeners(100);

export const emitAvailabilityUpdate = (facilityId: string) => {
  realtimeEmitter.emit('availability_update', { facilityId, timestamp: new Date() });
};
export const emitTelemetryUpdate = (facilityId: string, slotId: string) => {
  realtimeEmitter.emit('telemetry_update', { facilityId, slotId, timestamp: new Date() });
};
