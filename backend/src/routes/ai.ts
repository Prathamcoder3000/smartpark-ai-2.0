import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../utils/db';
import { verifyToken } from '../plugins/auth';

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
        const confidence = historicalCount > 20 ? 0.90 : 0.75;
        return reply.send({
          success: true,
          data: {
            prediction: {
              occupancy: fallbackOcc,
              confidence,
              forecastStatus: fallbackOcc > 80 ? 'Filling fast' : (fallbackOcc < 40 ? 'High availability' : 'Moderate filling')
            },
            recommendation: fallbackOcc > 80 ? 'BUSY_PERIOD' : 'GOOD_TIME',
            reasoning: [
              "Rule-based fallback calculation used (AI engine offline).",
              `Occupancy (${fallbackOcc}%) estimated from current physical database status.`
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
  fastify.post('/recommend', {
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_RECOMMEND_MAX ?? 50),
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as any;
      const { preferences, vehicleId } = body || {};

      // Auto-detect EV preference from authenticated user's vehicles if available
      let evCompatible = preferences?.evCompatible ?? false;
      
      // If authorization token exists or vehicleId is passed, check vehicle EV status
      let authUserId: string | null = null;
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = verifyToken(token);
          authUserId = decoded?.sub || null;
        }
      } catch {
        // Ignore auth error for public recommendation query
      }

      if (vehicleId && authUserId) {
        const vehicle = await prisma.vehicle.findFirst({
          where: { id: vehicleId, userId: authUserId }
        });
        if (vehicle?.isEV) {
          evCompatible = true;
        }
      } else if (authUserId && !preferences?.evCompatible) {
        const userVehicles = await prisma.vehicle.findMany({
          where: { userId: authUserId }
        });
        if (userVehicles.some(v => v.isEV)) {
          evCompatible = true;
        }
      }

      const mergedPreferences = {
        ...preferences,
        evCompatible
      };

      // 1. Fetch facilities from DB
      const facilities = await prisma.parkingFacility.findMany({
        include: { slots: true }
      });

      if (!facilities || facilities.length === 0) {
        return reply.send({
          success: true,
          engine: "Rule-Based Parking Intelligence",
          recommendations: []
        });
      }

      // Distance & Pricing mappings for prototype facilities
      const distanceMapping: Record<string, number> = {
        'facility-metro-central': 2,
        'facility-cyber-city': 5,
        'facility-techpark': 8,
        'facility-financial-plaza': 3
      };

      const priceMapping: Record<string, number> = {
        'facility-metro-central': 60,
        'facility-cyber-city': 50,
        'facility-techpark': 40,
        'facility-financial-plaza': 75
      };

      const facilityOptions = facilities.map(f => {
        const capacity = f.slots.length;
        const available = f.slots.filter(s => s.status === 'AVAILABLE').length;
        const evReady = f.slots.some(s => s.isEVCharging && s.status === 'AVAILABLE');
        const price = priceMapping[f.id] ?? 50;
        const distance = distanceMapping[f.id] ?? 5;

        return {
          id: f.id,
          name: f.name,
          address: f.address,
          availableSlots: available,
          totalCapacity: capacity,
          price,
          distanceMinutes: distance,
          isEVChargingReady: evReady,
          isCovered: true,
          hasSecurity: true
        };
      });

      try {
        const response = await fetch(`${AI_ENGINE_URL}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilities: facilityOptions,
            preferences: mergedPreferences
          })
        });

        if (!response.ok) {
          throw new Error(`AI Engine returned status: ${response.status}`);
        }

        const data = await response.json();
        return reply.send(data);
      } catch (err) {
        fastify.log.warn(`AI Engine unreachable at ${AI_ENGINE_URL}. Using fallback recommender.`);

        // Fallback recommender score logic with exact scoring formula
        const recommendations = facilityOptions
          .filter(f => {
            if (mergedPreferences?.evOnly && !f.isEVChargingReady) return false;
            if (mergedPreferences?.maxPrice && mergedPreferences.maxPrice > 0 && f.price > mergedPreferences.maxPrice) return false;
            if (mergedPreferences?.maxWalkingDistanceMin && mergedPreferences.maxWalkingDistanceMin > 0 && f.distanceMinutes > mergedPreferences.maxWalkingDistanceMin) return false;
            return true;
          })
          .map(f => {
            const availRatio = f.totalCapacity > 0 ? f.availableSlots / f.totalCapacity : 0;
            const availScore = availRatio * 100;
            const distScore = Math.max(0, 100 - f.distanceMinutes * 6.67);
            const evScore = mergedPreferences?.evCompatible ? (f.isEVChargingReady ? 100 : 20) : 100;
            const priceScore = Math.max(0, 100 - f.price * 1.5);
            
            const matchScore = Math.round(((availScore * 0.40) + (distScore * 0.25) + (evScore * 0.20) + (priceScore * 0.15)) * 10) / 10;
            const confidenceValue = roundNum(Math.min(0.98, Math.max(0.70, 0.80 + (availRatio * 0.15))), 3);
            const confidencePct = `${Math.round(confidenceValue * 1000) / 10}%`;

            const reasoning = [
              `High slot availability (${f.availableSlots} open, ${Math.round(availRatio * 100)}% available).`,
              `Short ${f.distanceMinutes} min walk to destination.`
            ];
            if (mergedPreferences?.evCompatible && f.isEVChargingReady) {
              reasoning.push("Matches EV charging criteria.");
            }

            return {
              facility: {
                id: f.id,
                name: f.name,
                address: f.address
              },
              matchScore,
              confidence: confidenceValue,
              confidenceScore: confidencePct,
              estimatedWalkingTime: f.distanceMinutes,
              estimatedPrice: f.price,
              availableSlots: f.availableSlots,
              totalCapacity: f.totalCapacity,
              isEVChargingReady: f.isEVChargingReady,
              forecastStatus: availRatio >= 0.4 ? 'Good availability' : 'Moderate filling',
              reasoning: [
                `Slot availability: ${f.availableSlots} of ${f.totalCapacity} slots open (${Math.round(availRatio * 100)}%).`,
                `Proximity: ${f.distanceMinutes} min walking distance.`,
                f.isEVChargingReady ? "EV fast charging stations available." : "Standard parking bays available."
              ]
            };
          }).sort((a, b) => b.matchScore - a.matchScore);

        return reply.send({
          success: true,
          engine: "Rule-Based Parking Intelligence (Fallback)",
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

function roundNum(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

