import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({ logger: true });

const start = async () => {
  await server.register(cors, {
    origin: true,
  });

  server.get('/health', async () => {
    return { status: 'ok' };
  });

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
