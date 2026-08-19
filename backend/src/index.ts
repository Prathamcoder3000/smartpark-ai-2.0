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

dotenv.config();

const server = Fastify({ logger: true });

const start = async () => {
  // CORS setup
  await server.register(cors, {
    origin: true,
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
