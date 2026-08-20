import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { authPlugin } from './plugins/auth';
import { authRoutes } from './routes/auth';
import { facilityRoutes } from './routes/facilities';
import { vehicleRoutes } from './routes/vehicles';
import { reservationRoutes } from './routes/reservations';
import { bookingRoutes } from './routes/bookings';
import { notificationRoutes } from './routes/notifications';
import { operatorRoutes } from './routes/operator';
import { telemetryRoutes } from './routes/telemetry';
import { aiRoutes } from './routes/ai';
import { realtimeRoutes } from './routes/realtime';

dotenv.config();

// Environment validation
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  requiredEnv.push('FRONTEND_URL', 'AI_ENGINE_URL');
}
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`Error: Missing required environment variable: ${env}`);
    process.exit(1);
  }
}

const server = Fastify({ logger: true });

const start = async () => {
  // CORS setup
  const frontendUrl = process.env.FRONTEND_URL;
  await server.register(cors, {
    origin: frontendUrl && frontendUrl !== '*' ? frontendUrl : true,
    credentials: true,
  });

  // Auth helper decorator plugin
  await server.register(authPlugin);

  // Health endpoint
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // Route registration
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(facilityRoutes, { prefix: '/api/facilities' });
  await server.register(vehicleRoutes, { prefix: '/api/vehicles' });
  await server.register(reservationRoutes, { prefix: '/api/reservations' });
  await server.register(bookingRoutes, { prefix: '/api/bookings' });
  await server.register(notificationRoutes, { prefix: '/api/notifications' });
  await server.register(operatorRoutes, { prefix: '/api/operator' });
  await server.register(telemetryRoutes, { prefix: '/api/telemetry' });
  await server.register(aiRoutes, { prefix: '/api/ai' });
  await server.register(realtimeRoutes, { prefix: '/api/realtime' });

  const port = Number(process.env.PORT ?? 8001);
  const host = '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`Backend running at http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
