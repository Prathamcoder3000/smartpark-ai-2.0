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
import { realtimeEmitter, emitAvailabilityUpdate } from '../utils/events';

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
    const testLicense = `TEST-${Date.now().toString().slice(-4)}`;
    const vehRes = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` },
      payload: { licensePlate: testLicense, make: 'Tesla', model: 'Model 3', isEV: true }
    });
    const vehData = JSON.parse(vehRes.body);
    if (vehRes.statusCode !== 201 || !vehData.success) {
      throw new Error(`Vehicle creation failed: ${vehRes.body}`);
    }
    vehicleId = vehData.data.id;
    console.log(` -> VEHICLE REGISTRY SUCCESS. Vehicle ID: ${vehicleId}`);

    // 5A. GET VEHICLE LIST & BY ID TEST
    console.log('[Test 5A] Query user vehicle list and details by ID...');
    const listVehRes = await app.inject({
      method: 'GET',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` }
    });
    const listVehData = JSON.parse(listVehRes.body);
    if (listVehRes.statusCode !== 200 || !listVehData.success || !Array.isArray(listVehData.data)) {
      throw new Error(`GET /api/vehicles failed: ${listVehRes.body}`);
    }

    const getVehRes = await app.inject({
      method: 'GET',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    const getVehData = JSON.parse(getVehRes.body);
    if (getVehRes.statusCode !== 200 || !getVehData.success || getVehData.data.id !== vehicleId) {
      throw new Error(`GET /api/vehicles/:id failed: ${getVehRes.body}`);
    }
    console.log(' -> VEHICLE QUERY SUCCESS.');

    // 5B. UPDATE VEHICLE TEST
    console.log('[Test 5B] Update vehicle details (PUT)...');
    const updateVehRes = await app.inject({
      method: 'PUT',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${token}` },
      payload: { make: 'Tesla Updated', model: 'Model Y', color: 'Midnight Silver', isEV: true }
    });
    const updateVehData = JSON.parse(updateVehRes.body);
    if (updateVehRes.statusCode !== 200 || !updateVehData.success || updateVehData.data.model !== 'Model Y') {
      throw new Error(`PUT /api/vehicles/:id failed: ${updateVehRes.body}`);
    }
    console.log(' -> VEHICLE UPDATE SUCCESS.');

    // 5C. DUPLICATE LICENSE PLATE TEST (409 CONFLICT)
    console.log('[Test 5C] Register duplicate vehicle license plate (should fail 409)...');
    const dupVehRes = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` },
      payload: { licensePlate: testLicense, make: 'Honda', model: 'Civic' }
    });
    if (dupVehRes.statusCode !== 409) {
      throw new Error(`Duplicate vehicle registration returned status ${dupVehRes.statusCode} instead of 409.`);
    }
    console.log(' -> DUPLICATE LICENSE GUARD SUCCESS.');

    // 5D. INVALID VEHICLE INPUT TEST (400 BAD REQUEST)
    console.log('[Test 5D] Register vehicle without license plate (should fail 400)...');
    const invalidVehRes = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` },
      payload: { make: 'Toyota', model: 'Corolla' }
    });
    if (invalidVehRes.statusCode !== 400) {
      throw new Error(`Invalid vehicle payload returned status ${invalidVehRes.statusCode} instead of 400.`);
    }
    console.log(' -> INVALID INPUT GUARD SUCCESS.');

    // 5E. CROSS-USER OWNERSHIP AUTHORIZATION TEST
    console.log('[Test 5E] Registering second User B for ownership testing...');
    const userBEmail = `integration-userB-${Date.now()}@example.com`;
    const signupBRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: 'User B', email: userBEmail, password: 'SecurePassword123!' }
    });
    const tokenB = JSON.parse(signupBRes.body).data.token;
    const userBId = JSON.parse(signupBRes.body).data.user.id;

    console.log('[Test 5E-1] User B attempts GET User A vehicle (should fail 403)...');
    const crossGetRes = await app.inject({
      method: 'GET',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (crossGetRes.statusCode !== 403) {
      throw new Error(`Cross-user GET returned status ${crossGetRes.statusCode} instead of 403.`);
    }

    console.log('[Test 5E-2] User B attempts PUT User A vehicle (should fail 403)...');
    const crossPutRes = await app.inject({
      method: 'PUT',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${tokenB}` },
      payload: { make: 'Hacked Make' }
    });
    if (crossPutRes.statusCode !== 403) {
      throw new Error(`Cross-user PUT returned status ${crossPutRes.statusCode} instead of 403.`);
    }

    console.log('[Test 5E-3] User B attempts DELETE User A vehicle (should fail 403)...');
    const crossDelRes = await app.inject({
      method: 'DELETE',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (crossDelRes.statusCode !== 403) {
      throw new Error(`Cross-user DELETE returned status ${crossDelRes.statusCode} instead of 403.`);
    }

    console.log('[Test 5E-4] User B attempts reservation attaching User A vehicle (should fail 400)...');
    const crossReserveRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${tokenB}` },
      payload: {
        facilityId,
        slotId,
        vehicleId: vehicleId,
        startTime: new Date(Date.now() + 100000).toISOString(),
        endTime: new Date(Date.now() + 200000).toISOString()
      }
    });
    if (crossReserveRes.statusCode !== 400) {
      throw new Error(`Cross-user vehicle reservation returned status ${crossReserveRes.statusCode} instead of 400.`);
    }
    console.log(' -> CROSS-USER OWNERSHIP GUARDS SUCCESS.');

    // 5F. SAFE VEHICLE DELETION TEST (UNRESERVED VEHICLE)
    console.log('[Test 5F] Creating temporary unreserved vehicle for safe deletion...');
    const tempVehRes = await app.inject({
      method: 'POST',
      url: '/api/vehicles',
      headers: { Authorization: `Bearer ${token}` },
      payload: { licensePlate: `TEMP-${Date.now().toString().slice(-4)}`, make: 'Ford', model: 'Mustang' }
    });
    const tempVehId = JSON.parse(tempVehRes.body).data.id;

    console.log('[Test 5F-1] Deleting unreserved vehicle...');
    const delVehRes = await app.inject({
      method: 'DELETE',
      url: `/api/vehicles/${tempVehId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (delVehRes.statusCode !== 200) {
      throw new Error(`Unreserved vehicle deletion failed: ${delVehRes.body}`);
    }
    console.log(' -> UNRESERVED VEHICLE DELETION SUCCESS.');

    // Cleanup User B
    await prisma.user.deleteMany({ where: { id: userBId } });

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

    // 6A. ACTIVE RESERVATION VEHICLE DELETION GUARD TEST (400 BAD REQUEST)
    console.log('[Test 6A] Attempt to delete vehicle with active reservation (should fail 400)...');
    const activeVehDelRes = await app.inject({
      method: 'DELETE',
      url: `/api/vehicles/${vehicleId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (activeVehDelRes.statusCode !== 400) {
      throw new Error(`Deleting vehicle with active reservation returned status ${activeVehDelRes.statusCode} instead of 400.`);
    }
    console.log(' -> ACTIVE RESERVATION VEHICLE DELETION GUARD SUCCESS.');

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

    // 12. RESERVATION CANCELLATION VIA DELETE TEST
    console.log('[Test 12] Creating new reservation to test DELETE cancellation...');
    const cancelStartTime = new Date(Date.now() + 10000);
    const cancelEndTime = new Date(Date.now() + 7200000);
    const createToCancelRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: cancelStartTime.toISOString(),
        endTime: cancelEndTime.toISOString()
      }
    });
    const createToCancelData = JSON.parse(createToCancelRes.body);
    const tempResId = createToCancelData.data.id;

    console.log('[Test 12A] Cancel reservation via DELETE...');
    const deleteCancelRes = await app.inject({
      method: 'DELETE',
      url: `/api/reservations/${tempResId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteCancelData = JSON.parse(deleteCancelRes.body);
    if (deleteCancelRes.statusCode !== 200 || !deleteCancelData.success || deleteCancelData.data.status !== 'CANCELLED') {
      throw new Error(`DELETE reservation cancel failed: ${deleteCancelRes.body}`);
    }
    const slotAfterDeleteCancel = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterDeleteCancel?.status !== ParkingSlotStatus.AVAILABLE) {
      throw new Error(`Slot status not AVAILABLE after cancellation. Current: ${slotAfterDeleteCancel?.status}`);
    }
    console.log(' -> DELETE RESERVATION CANCEL SUCCESS.');

    // 13. ALREADY CANCELLED EDGE CASE TEST
    console.log('[Test 13] Attempting to cancel already-cancelled reservation (should fail 400)...');
    const reCancelRes = await app.inject({
      method: 'DELETE',
      url: `/api/reservations/${tempResId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (reCancelRes.statusCode !== 400) {
      throw new Error(`Re-cancelling reservation returned status ${reCancelRes.statusCode} instead of 400.`);
    }
    console.log(' -> ALREADY-CANCELLED GUARD SUCCESS.');

    // 14. NONEXISTENT RESERVATION TEST
    console.log('[Test 14] Attempting to cancel non-existent reservation (should fail 404)...');
    const nonExistentRes = await app.inject({
      method: 'DELETE',
      url: '/api/reservations/non-existent-id-12345',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (nonExistentRes.statusCode !== 404) {
      throw new Error(`Non-existent reservation cancel returned status ${nonExistentRes.statusCode} instead of 404.`);
    }
    console.log(' -> NONEXISTENT RESERVATION GUARD SUCCESS.');

    // 15. RESERVATION CANCELLATION VIA POST ROUTE TEST
    console.log('[Test 15] Creating new reservation to test POST /cancel route...');
    const postCancelResCreate = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: new Date(Date.now() + 15000).toISOString(),
        endTime: new Date(Date.now() + 10800000).toISOString()
      }
    });
    const postCancelDataCreate = JSON.parse(postCancelResCreate.body);
    const postCancelResId = postCancelDataCreate.data.id;

    console.log('[Test 15A] Cancel reservation via POST /api/reservations/:id/cancel...');
    const postCancelRes = await app.inject({
      method: 'POST',
      url: `/api/reservations/${postCancelResId}/cancel`,
      headers: { Authorization: `Bearer ${token}` }
    });
    const postCancelData = JSON.parse(postCancelRes.body);
    if (postCancelRes.statusCode !== 200 || !postCancelData.success || postCancelData.data.status !== 'CANCELLED') {
      throw new Error(`POST reservation cancel failed: ${postCancelRes.body}`);
    }
    console.log(' -> POST /api/reservations/:id/cancel SUCCESS.');

    // 16. LINKED BOOKING CASCADE CANCELLATION TEST
    console.log('[Test 16] Testing linked booking cascade cancellation...');
    const cascadeResCreate = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: new Date(Date.now() + 20000).toISOString(),
        endTime: new Date(Date.now() + 14400000).toISOString()
      }
    });
    const cascadeResId = JSON.parse(cascadeResCreate.body).data.id;

    // Convert to booking
    const cascadeBookCreate = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      headers: { Authorization: `Bearer ${token}` },
      payload: { reservationId: cascadeResId }
    });
    const cascadeBookId = JSON.parse(cascadeBookCreate.body).data.id;

    // Cancel reservation directly
    const cascadeCancelRes = await app.inject({
      method: 'DELETE',
      url: `/api/reservations/${cascadeResId}`,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (cascadeCancelRes.statusCode !== 200) {
      throw new Error(`Cascade cancel failed: ${cascadeCancelRes.body}`);
    }

    // Verify linked booking is also CANCELLED
    const dbBookingAfterCascade = await prisma.booking.findUnique({ where: { id: cascadeBookId } });
    if (dbBookingAfterCascade?.status !== 'CANCELLED') {
      throw new Error(`Linked booking status not CANCELLED after reservation cancel! Current: ${dbBookingAfterCascade?.status}`);
    }
    console.log(' -> LINKED BOOKING CASCADE CANCEL SUCCESS.');

    // 17. AI PARKING INTELLIGENCE TESTS
    console.log('[Test 17] Testing AI Recommendation endpoint (POST /api/ai/recommend)...');
    const aiRecRes = await app.inject({
      method: 'POST',
      url: '/api/ai/recommend',
      headers: { Authorization: `Bearer ${token}` },
      payload: { preferences: { evCompatible: false } }
    });
    const aiRecData = JSON.parse(aiRecRes.body);
    if (aiRecRes.statusCode !== 200 || !aiRecData.success || !Array.isArray(aiRecData.recommendations)) {
      throw new Error(`AI recommendation failed: ${aiRecRes.body}`);
    }
    console.log(` -> AI RECOMMEND SUCCESS. Returned ${aiRecData.recommendations.length} recommendations.`);

    // 17A. HIGH-AVAILABILITY & DISTANCE RANKING TEST
    console.log('[Test 17A] Verifying AI recommendation ranking order and scoring...');
    const topRec = aiRecData.recommendations[0];
    if (!topRec.facility || typeof topRec.matchScore !== 'number' || !Array.isArray(topRec.reasoning)) {
      throw new Error(`Invalid AI recommendation item format: ${JSON.stringify(topRec)}`);
    }
    console.log(` -> AI RANKING SUCCESS. Top choice: "${topRec.facility.name}" with score ${topRec.matchScore}.`);

    // 17B. EXPLAINABILITY & CONFIDENCE BOUNDARY TEST
    console.log('[Test 17B] Verifying explainability reasons and confidence score boundaries...');
    if (topRec.reasoning.length === 0) {
      throw new Error('AI recommendation missing explainability reasoning array!');
    }
    if (topRec.confidence !== undefined && (topRec.confidence < 0.60 || topRec.confidence > 0.99)) {
      throw new Error(`AI confidence score out of bounds [0.60, 0.99]: ${topRec.confidence}`);
    }
    console.log(` -> EXPLAINABILITY & CONFIDENCE SUCCESS. Reasons: ${topRec.reasoning.length}, Confidence: ${topRec.confidenceScore || topRec.confidence}.`);

    // 17C. EV VEHICLE RECOMMENDATION PREFERENCE TEST
    console.log('[Test 17C] Testing EV vehicle preference scoring (evCompatible = true)...');
    const evRecRes = await app.inject({
      method: 'POST',
      url: '/api/ai/recommend',
      headers: { Authorization: `Bearer ${token}` },
      payload: { preferences: { evCompatible: true } }
    });
    const evRecData = JSON.parse(evRecRes.body);
    if (evRecRes.statusCode !== 200 || !evRecData.success || !Array.isArray(evRecData.recommendations)) {
      throw new Error(`EV AI recommendation failed: ${evRecRes.body}`);
    }
    const topEV = evRecData.recommendations.find((r: any) => r.isEVChargingReady);
    if (!topEV) {
      throw new Error('No EV-ready facility found in EV recommendation results!');
    }
    console.log(` -> EV PREFERENCE SUCCESS. Top EV match: "${topEV.facility.name}".`);

    // 17D. ACTIVE FILTER COMPATIBILITY TEST
    console.log('[Test 17D] Testing hard filter enforcement (evOnly = true)...');
    const evOnlyRes = await app.inject({
      method: 'POST',
      url: '/api/ai/recommend',
      headers: { Authorization: `Bearer ${token}` },
      payload: { preferences: { evOnly: true } }
    });
    const evOnlyData = JSON.parse(evOnlyRes.body);
    if (evOnlyRes.statusCode !== 200 || !evOnlyData.success) {
      throw new Error(`EV-only filter recommendation failed: ${evOnlyRes.body}`);
    }
    for (const rec of evOnlyData.recommendations) {
      if (rec.isEVChargingReady === false) {
        throw new Error(`Non-EV facility "${rec.facility.name}" returned despite evOnly filter!`);
      }
    }
    console.log(' -> HARD FILTER ENFORCEMENT SUCCESS.');

    // 17E. AI PREDICT ENDPOINT TEST
    console.log('[Test 17E] Testing AI Predict endpoint (POST /api/ai/predict)...');
    const predictRes = await app.inject({
      method: 'POST',
      url: '/api/ai/predict',
      headers: { Authorization: `Bearer ${token}` },
      payload: { facilityId, durationMinutes: 60 }
    });
    const predictData = JSON.parse(predictRes.body);
    if (predictRes.statusCode !== 200 || !predictData.success || !predictData.data?.prediction) {
      throw new Error(`AI predict failed: ${predictRes.body}`);
    }
    const pred = predictData.data.prediction;
    if (typeof pred.occupancy !== 'number' || typeof pred.confidence !== 'number') {
      throw new Error(`Invalid prediction payload format: ${JSON.stringify(predictData.data)}`);
    }
    console.log(` -> AI PREDICT SUCCESS. Predicted Occupancy: ${pred.occupancy}%, Confidence: ${pred.confidence}.`);

    // 17F. INVALID PREDICT REQUEST GUARD TEST (400 BAD REQUEST)
    console.log('[Test 17F] Testing invalid predict request without facilityId (should fail 400)...');
    const invalidPredRes = await app.inject({
      method: 'POST',
      url: '/api/ai/predict',
      headers: { Authorization: `Bearer ${token}` },
      payload: { durationMinutes: 60 }
    });
    if (invalidPredRes.statusCode !== 400) {
      throw new Error(`Invalid predict payload returned status ${invalidPredRes.statusCode} instead of 400.`);
    }
    console.log(' -> INVALID AI PREDICT GUARD SUCCESS.');

    // 18. LIVE MAP, SLOT STATUS & TELEMETRY PROTECTION TESTS
    console.log('[Test 18] Query facility detailed slots (GET /api/facilities/:id/slots)...');
    const slotsRes = await app.inject({
      method: 'GET',
      url: `/api/facilities/${facilityId}/slots`
    });
    const slotsData = JSON.parse(slotsRes.body);
    if (slotsRes.statusCode !== 200 || !slotsData.success || !Array.isArray(slotsData.data)) {
      throw new Error(`Facility slots query failed: ${slotsRes.body}`);
    }
    console.log(` -> FACILITY SLOTS QUERY SUCCESS. Found ${slotsData.data.length} slots.`);

    // 18A. TELEMETRY INGESTION ON AVAILABLE SLOT (AVAILABLE -> OCCUPIED)
    console.log('[Test 18A] Telemetry report occupied on AVAILABLE slot...');
    const telOccRes = await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: {
        facilityId,
        slotId,
        occupancy: true,
        source: 'ESP32_TEST'
      }
    });
    if (telOccRes.statusCode !== 201) {
      throw new Error(`Telemetry report occupied failed: ${telOccRes.body}`);
    }
    const slotAfterTelOcc = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterTelOcc?.status !== ParkingSlotStatus.OCCUPIED) {
      throw new Error(`Slot status not OCCUPIED after telemetry occupied report. Current: ${slotAfterTelOcc?.status}`);
    }
    console.log(' -> TELEMETRY OCCUPIED SUCCESS.');

    // 18B. TELEMETRY INGESTION VACANT (OCCUPIED -> AVAILABLE)
    console.log('[Test 18B] Telemetry report vacant on un-booked OCCUPIED slot...');
    const telVacRes = await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: {
        facilityId,
        slotId,
        occupancy: false,
        source: 'ESP32_TEST'
      }
    });
    if (telVacRes.statusCode !== 201) {
      throw new Error(`Telemetry report vacant failed: ${telVacRes.body}`);
    }
    const slotAfterTelVac = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (slotAfterTelVac?.status !== ParkingSlotStatus.AVAILABLE) {
      throw new Error(`Slot status not AVAILABLE after telemetry vacant report. Current: ${slotAfterTelVac?.status}`);
    }
    console.log(' -> TELEMETRY VACANT SUCCESS.');

    // 18C. RESERVED-SLOT TELEMETRY PROTECTION TEST
    console.log('[Test 18C] Reserved Slot Telemetry Protection test (RESERVED slot must NOT mutate on telemetry)...');
    const protResCreate = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        facilityId,
        slotId,
        vehicleId,
        startTime: new Date(Date.now() + 30000).toISOString(),
        endTime: new Date(Date.now() + 18000000).toISOString()
      }
    });
    const protResId = JSON.parse(protResCreate.body).data.id;

    // Slot is now RESERVED. Ingest telemetry occupied and vacant
    await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: { facilityId, slotId, occupancy: false, source: 'ESP32_TEST' }
    });
    let protSlot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (protSlot?.status !== ParkingSlotStatus.RESERVED) {
      throw new Error(`RESERVED slot mutated to ${protSlot?.status} by vacant telemetry report!`);
    }

    await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: { facilityId, slotId, occupancy: true, source: 'ESP32_TEST' }
    });
    protSlot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (protSlot?.status !== ParkingSlotStatus.RESERVED) {
      throw new Error(`RESERVED slot mutated to ${protSlot?.status} by occupied telemetry report!`);
    }
    console.log(' -> RESERVED-SLOT TELEMETRY PROTECTION SUCCESS.');

    // 18D. ACTIVE BOOKING TELEMETRY PROTECTION TEST
    console.log('[Test 18D] Active Booking Telemetry Protection test (OCCUPIED slot with ACTIVE booking must NOT become AVAILABLE on vacant telemetry)...');
    const protBookCreate = await app.inject({
      method: 'POST',
      url: '/api/bookings',
      headers: { Authorization: `Bearer ${token}` },
      payload: { reservationId: protResId }
    });
    const protBookId = JSON.parse(protBookCreate.body).data.id;

    // Check-in to make booking ACTIVE
    await app.inject({
      method: 'POST',
      url: `/api/bookings/${protBookId}/check-in`,
      headers: { Authorization: `Bearer ${token}` }
    });
    let activeSlot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (activeSlot?.status !== ParkingSlotStatus.OCCUPIED) {
      throw new Error(`Slot not OCCUPIED after check-in! Current: ${activeSlot?.status}`);
    }

    // Ingest telemetry vacant on active booking
    await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: { facilityId, slotId, occupancy: false, source: 'ESP32_TEST' }
    });
    activeSlot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (activeSlot?.status !== ParkingSlotStatus.OCCUPIED) {
      throw new Error(`ACTIVE booking slot mutated to ${activeSlot?.status} by vacant telemetry!`);
    }
    console.log(' -> ACTIVE BOOKING TELEMETRY PROTECTION SUCCESS.');

    // Clean up active booking & reservation via check-out
    await app.inject({
      method: 'POST',
      url: `/api/bookings/${protBookId}/check-out`,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 18E. DISABLED SLOT TELEMETRY PROTECTION TEST
    console.log('[Test 18E] Disabled Slot Telemetry Protection test...');
    await prisma.parkingSlot.update({
      where: { id: slotId },
      data: { status: ParkingSlotStatus.DISABLED }
    });
    await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: { facilityId, slotId, occupancy: true, source: 'ESP32_TEST' }
    });
    let disabledSlot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (disabledSlot?.status !== ParkingSlotStatus.DISABLED) {
      throw new Error(`DISABLED slot mutated to ${disabledSlot?.status} by telemetry!`);
    }
    // Revert slot status to AVAILABLE
    await prisma.parkingSlot.update({
      where: { id: slotId },
      data: { status: ParkingSlotStatus.AVAILABLE }
    });
    console.log(' -> DISABLED SLOT TELEMETRY PROTECTION SUCCESS.');

    // 18F. BATCH TELEMETRY INGESTION TEST
    console.log('[Test 18F] Telemetry batch ingestion (POST /api/telemetry/batch)...');
    const batchRes = await app.inject({
      method: 'POST',
      url: '/api/telemetry/batch',
      payload: [
        { facilityId, slotId, occupancy: false, source: 'ESP32_BATCH' }
      ]
    });
    if (batchRes.statusCode !== 201) {
      throw new Error(`Telemetry batch ingestion failed: ${batchRes.body}`);
    }
    console.log(' -> BATCH TELEMETRY INGESTION SUCCESS.');

    // 18G. INVALID TELEMETRY PAYLOAD GUARD TEST (400 BAD REQUEST)
    console.log('[Test 18G] Invalid telemetry payload validation...');
    const invalidTelRes = await app.inject({
      method: 'POST',
      url: '/api/telemetry',
      payload: { facilityId: 'invalid-facility-id-12345', occupancy: true }
    });
    if (invalidTelRes.statusCode !== 400) {
      throw new Error(`Invalid telemetry payload returned status ${invalidTelRes.statusCode} instead of 400.`);
    }
    console.log(' -> INVALID TELEMETRY GUARD SUCCESS.');

    // 18H. SSE REALTIME EVENT BROADCAST VERIFICATION
    console.log('[Test 18H] SSE Realtime Event Broadcasting verification...');
    let sseEventReceived = false;
    let receivedPayload: any = null;
    const testListener = (data: any) => {
      if (data.event === 'availability_update' && data.facilityId === facilityId) {
        sseEventReceived = true;
        receivedPayload = data;
      }
    };
    realtimeEmitter.on('availability_update', testListener);
    emitAvailabilityUpdate(facilityId);
    realtimeEmitter.off('availability_update', testListener);

    if (!sseEventReceived || !receivedPayload || receivedPayload.facilityId !== facilityId) {
      throw new Error(`SSE realtime event broadcast failed! Received: ${JSON.stringify(receivedPayload)}`);
    }
    console.log(' -> SSE REALTIME EVENT BROADCAST SUCCESS.');

    // 19. AUTHENTICATION, SESSION & SECURITY TESTS
    console.log('[Test 19] Testing duplicate email signup (should fail 409)...');
    const dupSignupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: testName, email: testEmail, password: testPassword }
    });
    if (dupSignupRes.statusCode !== 409) {
      throw new Error(`Duplicate signup returned status ${dupSignupRes.statusCode} instead of 409.`);
    }
    console.log(' -> DUPLICATE SIGNUP GUARD SUCCESS.');

    // 19A. INVALID EMAIL SIGNUP CHECK
    console.log('[Test 19A] Testing invalid email format signup (should fail 400)...');
    const invalidEmailRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: 'Invalid User', email: 'not-an-email', password: testPassword }
    });
    if (invalidEmailRes.statusCode !== 400) {
      throw new Error(`Invalid email signup returned status ${invalidEmailRes.statusCode} instead of 400.`);
    }
    console.log(' -> INVALID EMAIL GUARD SUCCESS.');

    // 19B. SHORT PASSWORD SIGNUP CHECK
    console.log('[Test 19B] Testing short password signup (should fail 400)...');
    const shortPassRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: 'Short User', email: `short-${Date.now()}@example.com`, password: '123' }
    });
    if (shortPassRes.statusCode !== 400) {
      throw new Error(`Short password signup returned status ${shortPassRes.statusCode} instead of 400.`);
    }
    console.log(' -> SHORT PASSWORD GUARD SUCCESS.');

    // 19C. INVALID PASSWORD LOGIN CHECK
    console.log('[Test 19C] Testing invalid password login (should fail 401)...');
    const badPassRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: testEmail, password: 'WrongPassword123!' }
    });
    if (badPassRes.statusCode !== 401) {
      throw new Error(`Invalid password login returned status ${badPassRes.statusCode} instead of 401.`);
    }
    console.log(' -> INVALID PASSWORD GUARD SUCCESS.');

    // 19D. UNKNOWN ACCOUNT LOGIN CHECK
    console.log('[Test 19D] Testing unknown user login (should fail 401)...');
    const unknownUserRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: `nonexistent-${Date.now()}@example.com`, password: testPassword }
    });
    if (unknownUserRes.statusCode !== 401) {
      throw new Error(`Unknown account login returned status ${unknownUserRes.statusCode} instead of 401.`);
    }
    console.log(' -> UNKNOWN ACCOUNT GUARD SUCCESS.');

    // 19E. UNAUTHENTICATED /ME REQUEST CHECK
    console.log('[Test 19E] Testing unauthenticated /api/auth/me request (should fail 401)...');
    const noTokenMeRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me'
    });
    if (noTokenMeRes.statusCode !== 401) {
      throw new Error(`Unauthenticated /me returned status ${noTokenMeRes.statusCode} instead of 401.`);
    }
    console.log(' -> UNAUTHENTICATED /ME GUARD SUCCESS.');

    // 19F. INVALID JWT TOKEN CHECK
    console.log('[Test 19F] Testing malformed JWT token request (should fail 401)...');
    const malformedTokenRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { Authorization: 'Bearer invalid.jwt.token.12345' }
    });
    if (malformedTokenRes.statusCode !== 401) {
      throw new Error(`Malformed JWT returned status ${malformedTokenRes.statusCode} instead of 401.`);
    }
    console.log(' -> MALFORMED JWT GUARD SUCCESS.');

    // 19G. CROSS-USER ISOLATION CHECK
    console.log('[Test 19G] Testing cross-user data isolation...');
    const userCEmail = `userC-${Date.now()}@example.com`;
    const signupC = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: 'User C', email: userCEmail, password: 'SecurePassword123!' }
    });
    const tokenC = JSON.parse(signupC.body).data.token;
    const userCId = JSON.parse(signupC.body).data.user.id;

    // User C queries /api/reservations (should get User C's list, 0 records, NOT User A's reservations)
    const userCResList = await app.inject({
      method: 'GET',
      url: '/api/reservations',
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    const userCResData = JSON.parse(userCResList.body);
    if (userCResList.statusCode !== 200 || !userCResData.success || userCResData.data.length !== 0) {
      throw new Error(`User C received user A reservations! Count: ${userCResData.data?.length}`);
    }

    // User C queries /api/bookings (should get User C's list, 0 records)
    const userCBookList = await app.inject({
      method: 'GET',
      url: '/api/bookings',
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    const userCBookData = JSON.parse(userCBookList.body);
    if (userCBookList.statusCode !== 200 || !userCBookData.success || userCBookData.data.length !== 0) {
      throw new Error(`User C received user A bookings! Count: ${userCBookData.data?.length}`);
    }
    console.log(' -> CROSS-USER DATA ISOLATION SUCCESS.');

    // Clean up User C
    await prisma.user.deleteMany({ where: { id: userCId } });

    // 19H. SENSITIVE FIELD EXCLUSION CHECK
    console.log('[Test 19H] Verifying passwordHash is never returned in signup, login, or /me payloads...');
    const checkMeRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { Authorization: `Bearer ${token}` }
    });
    const checkMeData = JSON.parse(checkMeRes.body);
    if (checkMeData.data?.user?.passwordHash !== undefined) {
      throw new Error('LEAK DETECTED: passwordHash exposed in /api/auth/me response!');
    }
    if (signupData.data?.user?.passwordHash !== undefined) {
      throw new Error('LEAK DETECTED: passwordHash exposed in /api/auth/signup response!');
    }
    if (loginData.data?.user?.passwordHash !== undefined) {
      throw new Error('LEAK DETECTED: passwordHash exposed in /api/auth/login response!');
    }
    console.log(' -> SENSITIVE FIELD EXCLUSION SUCCESS.');

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
