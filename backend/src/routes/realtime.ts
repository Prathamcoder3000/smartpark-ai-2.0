import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { realtimeEmitter } from '../utils/events';

export async function realtimeRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // GET /api/realtime/facilities/:id
  fastify.get('/facilities/:id', (request, reply) => {
    const { id } = request.params as { id: string };

    // Establish Server-Sent Events (SSE) connection headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Write initial connection success event
    reply.raw.write(`data: ${JSON.stringify({ connected: true, facilityId: id, timestamp: new Date() })}\n\n`);

    // Keepalive ping every 30 seconds to prevent reverse proxy timeouts
    const heartbeatTimer = setInterval(() => {
      if (!reply.raw.destroyed) {
        reply.raw.write(': keepalive ping\n\n');
      }
    }, 30000);

    const onUpdate = (eventData: any) => {
      if (eventData.facilityId === id && !reply.raw.destroyed) {
        reply.raw.write(`data: ${JSON.stringify(eventData)}\n\n`);
      }
    };

    // Listen to changes
    realtimeEmitter.on('availability_update', onUpdate);

    // Cleanup when request closes
    request.raw.on('close', () => {
      clearInterval(heartbeatTimer);
      realtimeEmitter.off('availability_update', onUpdate);
    });
  });
}
