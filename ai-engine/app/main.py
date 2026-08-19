from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartPark AI Engine")

class PredictRequest(BaseModel):
    facilityId: str
    time: str
    currentOccupancy: Optional[float] = 0.5
    historicalTelemetryCount: Optional[int] = 0
    durationMinutes: Optional[int] = 60

class RecommendPreference(BaseModel):
    evCompatible: Optional[bool] = False
    maxWalkingDistanceMin: Optional[int] = 10
    maxPrice: Optional[float] = 50.0

class FacilityOption(BaseModel):
    id: str
    name: str
    address: str
    availableSlots: int
    totalCapacity: int
    price: float
    distanceMinutes: int
    isEVChargingReady: bool

class RecommendRequest(BaseModel):
    facilities: List[FacilityOption]
    preferences: Optional[RecommendPreference] = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "SmartPark AI engine foundation"}

@app.post("/predict")
def predict(payload: PredictRequest):
    # Deterministic rule-based intelligence for prototyping
    occ = int(payload.currentOccupancy * 100) if payload.currentOccupancy is not None else 50
    
    # Calculate a mocked but sensible prediction
    predicted_occ = min(100, max(0, occ + (10 if payload.durationMinutes > 120 else -5)))
    
    confidence = 0.85
    if payload.historicalTelemetryCount > 20:
        confidence = 0.95
    elif payload.historicalTelemetryCount == 0:
        confidence = 0.70

    reasoning = [
        "Current occupancy is moderate." if occ < 75 else "Current occupancy is high.",
        "Duration requested is over 2 hours, slightly increasing peak risk." if payload.durationMinutes > 120 else "Duration requested is brief.",
        "Rule-based prediction confidence is adjusted based on local telemetry availability."
    ]

    recommendation = "GOOD_TIME"
    if predicted_occ > 80:
        recommendation = "BUSY_PERIOD"
    elif predicted_occ < 40:
        recommendation = "EXCELLENT_TIME"

    return {
        "prediction": {
            "occupancy": predicted_occ,
            "confidence": confidence
        },
        "recommendation": recommendation,
        "reasoning": reasoning
    }

@app.post("/recommend")
def recommend(payload: RecommendRequest):
    # Ranked recommendation scoring logic
    # Weights: Availability (40%), Distance/Walking (25%), EV Compatibility Match (20%), Price (15%)
    scored_recommendations = []
    
    pref = payload.preferences or RecommendPreference()

    for f in payload.facilities:
        # Score calculation (0.0 to 100.0)
        
        # 1. Availability Score (40% weight)
        avail_ratio = f.availableSlots / f.totalCapacity if f.totalCapacity > 0 else 0
        avail_score = avail_ratio * 100.0
        
        # 2. Distance Score (25% weight)
        # Standardize: 0 minutes = 100, 15+ minutes = 0
        dist_score = max(0.0, 100.0 - (f.distanceMinutes * 6.67))
        
        # 3. EV Match Score (20% weight)
        # If user wants EV charging and facility has it, 100. If user doesn't care, 100. Else 0.
        if pref.evCompatible:
            ev_score = 100.0 if f.isEVChargingReady else 0.0
        else:
            ev_score = 100.0 # compatible with non-EV preferences
            
        # 4. Price Score (15% weight)
        # Standardize: $0 = 100, $30+ = 0
        price_score = max(0.0, 100.0 - (f.price * 3.33))
        
        # Final Score
        final_score = (avail_score * 0.40) + (dist_score * 0.25) + (ev_score * 0.20) + (price_score * 0.15)
        final_score = round(final_score, 1)

        reasoning = []
        if f.availableSlots > 5:
            reasoning.append("High slot availability.")
        else:
            reasoning.append("Limited slot availability.")

        if f.distanceMinutes <= 3:
            reasoning.append("Extremely close proximity to destination.")
        else:
            reasoning.append("Moderate walking distance.")

        if pref.evCompatible and f.isEVChargingReady:
            reasoning.append("Matches EV charging criteria.")
        
        if f.price <= 10:
            reasoning.append("Highly economical pricing.")

        scored_recommendations.append({
            "facility": {
                "id": f.id,
                "name": f.name,
                "address": f.address
            },
            "matchScore": final_score,
            "estimatedWalkingTime": f.distanceMinutes,
            "estimatedPrice": f.price,
            "reasoning": reasoning
        })

    # Sort by score descending
    scored_recommendations.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "success": True,
        "recommendations": scored_recommendations
    }
