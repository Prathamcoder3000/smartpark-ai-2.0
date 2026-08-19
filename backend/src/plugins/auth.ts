import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import fp from 'fastify-plugin';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'smartpark-super-secret-key-change-in-prod';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string | null;
    };
  }
}

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

async function authPluginRaw(fastify: FastifyInstance) {
  fastify.decorateRequest('user', undefined);

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please provide a Bearer token.'
          }
        });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded || !decoded.sub) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired authentication token.'
          }
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User associated with this token no longer exists.'
          }
        });
      }

      request.user = user;
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed.'
        }
      });
    }
  });
}

export const authPlugin = fp(authPluginRaw);

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
