import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { authPlugin } from '../plugins/auth';
import { authRoutes } from '../routes/auth';
import { facilityRoutes } from '../routes/facilities';
import { vehicleRoutes } from '../routes/vehicles';
import { reservationRoutes } from '../routes/reservations';
import { bookingRoutes } from '../routes/bookings';
import { notificationRoutes } from '../routes/notifications';
import { operatorRoutes } from '../routes/operator';
import { telemetryRoutes } from '../routes/telemetry';
import { aiRoutes } from '../routes/ai';
import { realtimeRoutes } from '../routes/realtime';
import { prisma } from '../utils/db';
import { ParkingSlotStatus } from '@prisma/client';

async function runTests() {
  console.log('=== STARTING SMARTPARK INTEGRATION TEST SUITE ===');

  const app = Fastify({ logger: false });

  // Register identical plugins and routes as index.ts
  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 1000, timeWindow: '1 minute' });
  await app.register(authPlugin);

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(facilityRoutes, { prefix: '/api/facilities' });
  await app.register(vehicleRoutes, { prefix: '/api/vehicles' });
  await app.register(reservationRoutes, { prefix: '/api/reservations' });
  await app.register(bookingRoutes, { prefix: '/api/bookings' });
  await app.register(notificationRoutes, { prefix: '/api/notifications' });
  await app.register(operatorRoutes, { prefix: '/api/operator' });
  await app.register(telemetryRoutes, { prefix: '/api/telemetry' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(realtimeRoutes, { prefix: '/api/realtime' });

  // Health endpoint
  app.get('/health', async () => {
    return { status: 'ok', service: 'smartpark-backend' };
  });

  // Readiness endpoint checking DB connectivity
  app.get('/ready', async (request, reply) => {
    try {
      const { prisma } = await import('../utils/db');
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'smartpark-backend',
        db: 'connected'
      };
    } catch (err: any) {
      app.log.error(`Readiness check failed: ${err.message}`);
      return reply.status(503).send({
        status: 'error',
        service: 'smartpark-backend',
        db: 'disconnected'
      });
    }
  });

  // State variables to clean up
  const testEmail = `integration-test-${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Test User';
  let userId: string = '';
  let token: string = '';
  let vehicleId: string = '';
  let facilityId: string = '';
  let floorId: string | null = '';
  let slotId: string = '';
  let reservationId: string = '';
  let bookingId: string = '';

  try {
    // 1. SIGNUP TEST
    console.log('[Test 1] Signup new user...');
    const signupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: testName, email: testEmail, password: testPassword }
    });
    const signupData = JSON.parse(signupRes.body);
    if (signupRes.statusCode !== 201 || !signupData.success) {
      throw new Error(`Signup failed: ${signupRes.body}`);
    }
    userId = signupData.data.user.id;
    token = signupData.data.token;
    console.log(` -> SIGNUP SUCCESS. User ID: ${userId}`);

    // 2. LOGIN TEST
    console.log('[Test 2] Login with credentials...');
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: testEmail, password: testPassword }
    });
    const loginData = JSON.parse(loginRes.body);
    if (loginRes.statusCode !== 200 || !loginData.success) {
      throw new Error(`Login failed: ${loginRes.body}`);
    }
    console.log(' -> LOGIN SUCCESS.');

    // 3. AUTH /ME TEST
    console.log('[Test 3] Request /me details...');
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (meRes.statusCode !== 200) {
      throw new Error(`Auth /me failed: ${meRes.body}`);
    }
    console.log(' -> AUTH /ME SUCCESS.');

    // 3A. HEALTH CHECK TEST
    console.log('[Test 3A] Testing /health endpoint...');
    const healthRes = await app.inject({
      method: 'GET',
      url: '/health'
    });
    const healthData = JSON.parse(healthRes.body);
    if (healthRes.statusCode !== 200 || healthData.status !== 'ok') {
      throw new Error(`Health check failed: ${healthRes.body}`);
    }
    console.log(' -> HEALTH CHECK SUCCESS.');

    // 3B. READINESS CHECK TEST
    console.log('[Test 3B] Testing /ready endpoint...');
    const readyRes = await app.inject({
      method: 'GET',
      url: '/ready'
    });
    const readyData = JSON.parse(readyRes.body);
    if (readyRes.statusCode !== 200 || readyData.status !== 'ok' || readyData.db !== 'connected') {
      throw new Error(`Readiness check failed: ${readyRes.body}`);
    }
    console.log(' -> READINESS CHECK SUCCESS.');

    // 4. GET FACILITIES TEST & SLOT RESOLUTION
    console.log('[Test 4] Query active facilities & slots...');
    const facRes = await app.inject({
      method: 'GET',
      url: '/api/facilities'
    });
    const facData = JSON.parse(facRes.body);
    if (facRes.statusCode !== 200 || !facData.success || facData.data.length === 0) {
      throw new Error(`Get facilities failed: ${facRes.body}`);
    }
    const targetFacility = facData.data[0];
    facilityId = targetFacility.id;
    
    // Resolve slot from database directly to ensure we have a valid slot
    const dbSlot = await prisma.parkingSlot.findFirst({
      where: { facilityId, status: ParkingSlotStatus.AVAILABLE },
      include: { floor: true }
    });
    if (!dbSlot) {
      throw new Error('No available slots found in database to execute test.');
    }
    slotId = dbSlot.id;
    floorId = dbSlot.floorId;
    console.log(` -> RESOLVED SLOT. Facility: ${facilityId}, Floor: ${floorId}, Slot: ${slotId}`);

    // 5. VEHICLE CREATION TEST
    console.log('[Test 5] Register new vehicle...');
    const vehRes = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` },
      payload: { licensePlate: `TEST-${Date.now().toString().slice(-4)}`, make: 'Tesla', model: 'Model 3', isEV: true }
    });
    const vehData = JSON.parse(vehRes.body);
    if (vehRes.statusCode !== 201 || !vehData.success) {
      throw new Error(`Vehicle creation failed: ${vehRes.body}`);
    }
    vehicleId = vehData.data.id;
    console.log(` -> VEHICLE REGISTRY SUCCESS. Vehicle ID: ${vehicleId}`);

    // 6. RESERVATION CREATION TEST
    console.log('[Test 6] Book a slot reservation...');
    const startTime = new Date(Date.now() + 5000);
    const endTime = new Date(Date.now() + 3600000); // 1 hour
    const reserveRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    });
    const reserveData = JSON.parse(reserveRes.body);
    if (reserveRes.statusCode !== 201 || !reserveData.success) {
      throw new Error(`Reservation booking failed: ${reserveRes.body}`);
    }
    reservationId = reserveData.data.id;
    console.log(` -> RESERVATION SUCCESS. Reservation ID: ${reservationId}`);

    // 7. DOUBLE BOOKING PREVENTION TEST
    console.log('[Test 7] Attempting overlapping reservation (should fail)...');
    const overlapRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    });
    if (overlapRes.statusCode !== 409) {
      throw new Error(`Overlapping reservation succeeded when it should have failed. HTTP Status: ${overlapRes.statusCode}`);
    }
    console.log(' -> DOUBLE-BOOKING BLOCKED SUCCESS.');

    // 8. CONVERT RESERVATION TO BOOKING
    console.log('[Test 8] Convert reservation to active booking...');
    const bookRes = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      headers: { Authorization: `Bearer ${token}` },
      payload: { reservationId }
    });
    const bookData = JSON.parse(bookRes.body);
    if (bookRes.statusCode !== 201 || !bookData.success) {
      throw new Error(`Booking conversion failed: ${bookRes.body}`);
    }
    bookingId = bookData.data.id;
    console.log(` -> BOOKING SUCCESS. Booking ID: ${bookingId}`);

    // Check slot became RESERVED
    const slotAfterReserve = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterReserve?.status !== ParkingSlotStatus.RESERVED) {
      throw new Error(`Slot status not updated to RESERVED. Current: ${slotAfterReserve?.status}`);
    }
    console.log(' -> SLOT RESERVED STATUS CONFIRMED.');

    // 9. TELEMETRY INGESTION PROTECTION TEST
    console.log('[Test 9] Telemetry report vacant on RESERVED slot (must NOT overwrite status to AVAILABLE)...');
    const telRes = await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: {
        facilityId,
        slotId,
        occupancy: false,
        signalStrength: -70,
        sensorType: 'ULTRASONIC'
      }
    });
    if (telRes.statusCode !== 201) {
      throw new Error(`Telemetry request failed: ${telRes.body}`);
    }
    const slotAfterTel = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterTel?.status !== ParkingSlotStatus.RESERVED) {
      throw new Error(`Slot status overridden by telemetry report! Current: ${slotAfterTel?.status}`);
    }
    console.log(' -> TELEMETRY RESERVED PROTECTION SUCCESS.');

    // 10. CHECK-IN TEST
    console.log('[Test 10] Trigger check-in...');
    const checkinRes = await app.inject({
      method: 'POST',
      url: `/api/bookings/${bookingId}/check-in`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (checkinRes.statusCode !== 200) {
      throw new Error(`Check-in failed: ${checkinRes.body}`);
    }
    const slotAfterCheckin = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterCheckin?.status !== ParkingSlotStatus.OCCUPIED) {
      throw new Error(`Slot status not OCCUPIED after check-in. Current: ${slotAfterCheckin?.status}`);
    }
    console.log(' -> CHECK-IN OCCUPIED SUCCESS.');

    // 11. CHECK-OUT TEST
    console.log('[Test 11] Trigger check-out...');
    const checkoutRes = await app.inject({
      method: 'POST',
      url: `/api/bookings/${bookingId}/check-out`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (checkoutRes.statusCode !== 200) {
      throw new Error(`Check-out failed: ${checkoutRes.body}`);
    }
    const slotAfterCheckout = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterCheckout?.status !== ParkingSlotStatus.AVAILABLE) {
      throw new Error(`Slot status not AVAILABLE after check-out. Current: ${slotAfterCheckout?.status}`);
    }
    console.log(' -> CHECK-OUT AVAILABLE SUCCESS.');

    console.log('\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n!!! TEST FAILURE !!!');
    console.error(error);
    process.exitCode = 1;
  } finally {
    console.log('\nCleaning up temporary test records...');
    
    // Clean database records safely
    try {
      if (bookingId) {
        await prisma.booking.deleteMany({ where: { id: bookingId } });
      }
      if (reservationId) {
        await prisma.reservation.deleteMany({ where: { id: reservationId } });
      }
      if (vehicleId) {
        await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
      }
      if (userId) {
        // Delete user notifications
        await prisma.notification.deleteMany({ where: { userId } });
        // Delete user profile
        await prisma.user.deleteMany({ where: { id: userId } });
      }
      // Revert test slot status to AVAILABLE
      if (slotId) {
        await prisma.parkingSlot.update({
          where: { id: slotId },
          data: { status: ParkingSlotStatus.AVAILABLE }
        });
      }
      console.log(' -> Database cleaned successfully.');
    } catch (cleanError) {
      console.error('Failed to clean test records:', cleanError);
    }
  }
}

runTests();
