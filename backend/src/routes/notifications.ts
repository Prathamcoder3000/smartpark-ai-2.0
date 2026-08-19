import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { NotificationType, NotificationPriority } from '@prisma/client';

export async function notificationRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/notifications
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { unread, type, priority } = request.query as { unread?: string; type?: string; priority?: string };

      const whereClause: any = { userId };

      if (unread !== undefined) {
        if (unread !== 'true' && unread !== 'false') {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Invalid unread parameter. Must be "true" or "false".' }
          });
        }
        whereClause.isRead = unread === 'false';
      }

      if (type) {
        const validTypes = Object.values(NotificationType);
        if (!validTypes.includes(type as any)) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: `Invalid type parameter. Must be one of: ${validTypes.join(', ')}` }
          });
        }
        whereClause.type = type as NotificationType;
      }

      if (priority) {
        const validPriorities = Object.values(NotificationPriority);
        if (!validPriorities.includes(priority as any)) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: `Invalid priority parameter. Must be one of: ${validPriorities.join(', ')}` }
          });
        }
        whereClause.priority = priority as NotificationPriority;
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // PUT /api/notifications/read-all
  fastify.put('/read-all', async (request, reply) => {
    try {
      const userId = request.user!.id;

      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      return reply.send({
        success: true,
        data: { count: result.count }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // PUT /api/notifications/:id/read
  fastify.put('/:id/read', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found.' }
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this notification.' }
        });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      return reply.send({
        success: true,
        data: updated
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // DELETE /api/notifications/:id
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found.' }
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not own this notification.' }
        });
      }

      await prisma.notification.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        data: { message: 'Notification deleted successfully.' }
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
