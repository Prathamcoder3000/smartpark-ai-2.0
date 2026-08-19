import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL ?? 'http://127.0.0.1:8002';

export async function aiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // POST /api/ai/predict
  fastify.post('/predict', async (request, reply) => {
    try {
      const body = request.body as any;
      const { facilityId, time, currentOccupancy, durationMinutes } = body || {};

      if (!facilityId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'facilityId is required.' }
        });
      }

      // Query historical counts to pass to AI engine
      const historicalCount = await prisma.parkingTelemetry.count({
        where: { facilityId }
      });

      // Get current occupancy from DB
      const slots = await prisma.parkingSlot.findMany({
        where: { facilityId }
      });
      const total = slots.length;
      const occupied = slots.filter(s => s.status === 'OCCUPIED').length;
      const actualOccupancy = total > 0 ? occupied / total : 0.5;

      try {
        const response = await fetch(`${AI_ENGINE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            time: time || new Date().toISOString(),
            currentOccupancy: currentOccupancy !== undefined ? currentOccupancy : actualOccupancy,
            historicalTelemetryCount: historicalCount,
            durationMinutes: durationMinutes || 60
          })
        });

        if (!response.ok) {
          throw new Error(`AI Engine returned status: ${response.status}`);
        }

        const data = await response.json();
        return reply.send({
          success: true,
          data
        });
      } catch (err: any) {
        fastify.log.warn(`AI Engine unreachable at ${AI_ENGINE_URL}. Using fallback prediction.`);
        
        // Graceful fallback prediction logic
        const fallbackOcc = Math.round(actualOccupancy * 100);
        return reply.send({
          success: true,
          data: {
            prediction: {
              occupancy: fallbackOcc,
              confidence: 0.50
            },
            recommendation: fallbackOcc > 80 ? 'BUSY_PERIOD' : 'GOOD_TIME',
            reasoning: [
              "Rule-based fallback calculation used (AI engine offline).",
              "Occupancy estimated from current physical database status."
            ]
          }
        });
      }
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });

  // POST /api/ai/recommend
  fastify.post('/recommend', async (request, reply) => {
    try {
      const body = request.body as any;
      const { preferences } = body || {};

      // 1. Fetch facilities from DB
      const facilities = await prisma.parkingFacility.findMany({
        include: { slots: true }
      });

      // Simple mock distance mappings for prototype recommendations
      const distanceMapping: Record<string, number> = {
        'facility-metro-central': 2,
        'facility-cyber-city': 5,
        'facility-techpark': 8,
        'facility-financial-plaza': 3
      };

      const facilityOptions = facilities.map(f => {
        const capacity = f.slots.length;
        const available = f.slots.filter(s => s.status === 'AVAILABLE').length;
        const evReady = f.slots.some(s => s.isEVCharging && s.status === 'AVAILABLE');
        const price = 5.00; // Flat pricing rate for prototype
        const distance = distanceMapping[f.id] ?? 6;

        return {
          id: f.id,
          name: f.name,
          address: f.address,
          availableSlots: available,
          totalCapacity: capacity,
          price,
          distanceMinutes: distance,
          isEVChargingReady: evReady
        };
      });

      try {
        const response = await fetch(`${AI_ENGINE_URL}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilities: facilityOptions,
            preferences
          })
        });

        if (!response.ok) {
          throw new Error(`AI Engine returned status: ${response.status}`);
        }

        const data = await response.json();
        return reply.send(data);
      } catch (err) {
        fastify.log.warn(`AI Engine unreachable at ${AI_ENGINE_URL}. Using fallback recommender.`);

        // Fallback recommender score logic: sort simply by availability descending
        const recommendations = facilityOptions.map(f => {
          const availRatio = f.availableSlots / f.totalCapacity;
          const matchScore = Math.round(availRatio * 100 * 10) / 10;
          return {
            facility: {
              id: f.id,
              name: f.name,
              address: f.address
            },
            matchScore,
            estimatedWalkingTime: f.distanceMinutes,
            estimatedPrice: f.price,
            reasoning: [
              "Fallback recommendation calculation (AI engine offline).",
              "Ranked strictly based on current available slots."
            ]
          };
        }).sort((a, b) => b.matchScore - a.matchScore);

        return reply.send({
          success: true,
          recommendations
        });
      }
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal error occurred.' }
      });
    }
  });
}
