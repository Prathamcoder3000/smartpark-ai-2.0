import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { generateToken } from '../plugins/auth';

export async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // POST /api/auth/signup
  fastify.post('/signup', {
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_SIGNUP_MAX ?? 10),
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const { name, email, password } = body;
      if (!name || !email || !password) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Name, email, and password are required.' }
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid email format.' }
        });
      }

      if (password.length < 6) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Password must be at least 6 characters long.' }
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: { code: 'CONFLICT', message: 'A user with this email address already exists.' }
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });

      const token = generateToken(user.id, user.email);

      return reply.status(201).send({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // POST /api/auth/login
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 15),
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const { email, password } = body;
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Email and password are required.' }
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user || !user.passwordHash) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' }
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' }
        });
      }

      const token = generateToken(user.id, user.email);

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    // Statelessly handle logout by returning success. Client discards token.
    return reply.send({
      success: true,
      data: { message: 'Logged out successfully.' }
    });
  });

  // GET /api/auth/me
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({
      success: true,
      data: { user: request.user }
    });
  });
}
