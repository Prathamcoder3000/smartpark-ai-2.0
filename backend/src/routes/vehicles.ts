import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';

export async function vehicleRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Protect all vehicle routes
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/vehicles
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        data: vehicles
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // POST /api/vehicles
  fastify.post('/', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const body = request.body as any;

      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const { licensePlate, make, model, color, isEV } = body;

      if (!licensePlate) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'License plate (registration number) is required.' }
        });
      }

      const normalizedLicense = licensePlate.trim().toUpperCase();
      if (normalizedLicense.length < 2) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid license plate format.' }
        });
      }

      // Check registration uniqueness globally
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { licensePlate: normalizedLicense }
      });

      if (existingVehicle) {
        return reply.status(409).send({
          success: false,
          error: { code: 'CONFLICT', message: 'A vehicle with this license plate is already registered.' }
        });
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          licensePlate: normalizedLicense,
          make: make ? make.trim() : null,
          model: model ? model.trim() : null,
          color: color ? color.trim() : null,
          isEV: typeof isEV === 'boolean' ? isEV : false,
          userId
        }
      });

      return reply.status(201).send({
        success: true,
        data: vehicle
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // GET /api/vehicles/:id
  fastify.get('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const vehicle = await prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Vehicle not found.' }
        });
      }

      // Authorization check
      if (vehicle.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to access this vehicle.' }
        });
      }

      return reply.send({
        success: true,
        data: vehicle
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // PUT /api/vehicles/:id
  fastify.put('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };
      const body = request.body as any;

      if (!body) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request body is required.' }
        });
      }

      const vehicle = await prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Vehicle not found.' }
        });
      }

      // Authorization check
      if (vehicle.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to update this vehicle.' }
        });
      }

      const { licensePlate, make, model, color, isEV } = body;
      const updateData: any = {};

      if (licensePlate !== undefined) {
        const normalizedLicense = licensePlate.trim().toUpperCase();
        if (normalizedLicense.length < 2) {
          return reply.status(400).send({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Invalid license plate format.' }
          });
        }

        // Check uniqueness if license plate is changing
        if (normalizedLicense !== vehicle.licensePlate) {
          const duplicate = await prisma.vehicle.findUnique({
            where: { licensePlate: normalizedLicense }
          });
          if (duplicate) {
            return reply.status(409).send({
              success: false,
              error: { code: 'CONFLICT', message: 'A vehicle with this license plate is already registered.' }
            });
          }
        }
        updateData.licensePlate = normalizedLicense;
      }

      if (make !== undefined) updateData.make = make ? make.trim() : null;
      if (model !== undefined) updateData.model = model ? model.trim() : null;
      if (color !== undefined) updateData.color = color ? color.trim() : null;
      if (isEV !== undefined) updateData.isEV = typeof isEV === 'boolean' ? isEV : false;

      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: updateData
      });

      return reply.send({
        success: true,
        data: updatedVehicle
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // DELETE /api/vehicles/:id
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const vehicle = await prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Vehicle not found.' }
        });
      }

      // Authorization check
      if (vehicle.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this vehicle.' }
        });
      }

      await prisma.vehicle.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        data: { message: 'Vehicle deleted successfully.' }
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
