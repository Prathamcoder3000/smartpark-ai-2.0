from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartPark AI Engine")

class PredictRequest(BaseModel):
    facilityId: str
    time: Optional[str] = None
    currentOccupancy: Optional[float] = 0.5
    historicalTelemetryCount: Optional[int] = 0
    durationMinutes: Optional[int] = 60

class RecommendPreference(BaseModel):
    evCompatible: Optional[bool] = False
    maxWalkingDistanceMin: Optional[int] = 0
    maxPrice: Optional[float] = 0.0
    evOnly: Optional[bool] = False
    coveredOnly: Optional[bool] = False
    securityOnly: Optional[bool] = False
    minAvailableSlots: Optional[int] = 0

class FacilityOption(BaseModel):
    id: str
    name: str
    address: str
    availableSlots: int
    totalCapacity: int
    price: float
    distanceMinutes: int
    isEVChargingReady: bool
    isCovered: Optional[bool] = True
    hasSecurity: Optional[bool] = True

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
    # Rule-based explainable prediction logic
    occ = int(payload.currentOccupancy * 100) if payload.currentOccupancy is not None else 50
    duration = payload.durationMinutes if payload.durationMinutes is not None else 60
    telemetry_count = payload.historicalTelemetryCount if payload.historicalTelemetryCount is not None else 0

    # Calculate predicted occupancy based on requested duration and current occupancy
    trend = 10 if duration > 120 else (-5 if occ > 60 else 5)
    predicted_occ = min(100, max(0, occ + trend))
    
    # Calculate deterministic confidence score based on telemetry data quantity (0.60 to 0.98)
    if telemetry_count >= 50:
        confidence = 0.95
    elif telemetry_count >= 20:
        confidence = 0.88
    elif telemetry_count > 0:
        confidence = 0.78
    else:
        confidence = 0.65

    reasoning = [
        f"Current occupancy is {occ}% ({'high' if occ >= 75 else 'moderate' if occ >= 40 else 'low'}).",
        f"Duration of {duration} minutes analyzed for peak volume risk.",
        f"Confidence ({int(confidence * 100)}%) calculated from {telemetry_count} historical telemetry events."
    ]

    forecast_status = "Good availability"
    recommendation = "GOOD_TIME"
    if predicted_occ > 80:
        recommendation = "BUSY_PERIOD"
        forecast_status = "Filling fast"
    elif predicted_occ < 40:
        recommendation = "EXCELLENT_TIME"
        forecast_status = "High availability"

    return {
        "success": True,
        "engine": "Rule-Based Parking Intelligence",
        "prediction": {
            "occupancy": predicted_occ,
            "confidence": confidence,
            "forecastStatus": forecast_status
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
        # Check hard filters
        if pref.evOnly and not f.isEVChargingReady:
            continue
        if pref.coveredOnly and not getattr(f, 'isCovered', True):
            continue
        if pref.securityOnly and not getattr(f, 'hasSecurity', True):
            continue
        if pref.maxPrice and pref.maxPrice > 0 and f.price > pref.maxPrice:
            continue
        if pref.maxWalkingDistanceMin and pref.maxWalkingDistanceMin > 0 and f.distanceMinutes > pref.maxWalkingDistanceMin:
            continue
        if pref.minAvailableSlots and pref.minAvailableSlots > 0 and f.availableSlots < pref.minAvailableSlots:
            continue

        # Score calculation (0.0 to 100.0)
        
        # 1. Availability Score (40% weight)
        avail_ratio = f.availableSlots / f.totalCapacity if f.totalCapacity > 0 else 0
        avail_score = avail_ratio * 100.0
        
        # 2. Distance Score (25% weight)
        # Standardize: 0 minutes = 100, 15+ minutes = 0
        dist_score = max(0.0, 100.0 - (f.distanceMinutes * 6.67))
        
        # 3. EV Match Score (20% weight)
        if pref.evCompatible:
            ev_score = 100.0 if f.isEVChargingReady else 20.0
        else:
            ev_score = 100.0 # Non-EV vehicles can use standard or EV spots
            
        # 4. Price Score (15% weight)
        # Standardize: $0 = 100, $30+ = 0
        price_score = max(0.0, 100.0 - (f.price * 3.33))
        
        # Final Score
        final_score = (avail_score * 0.40) + (dist_score * 0.25) + (ev_score * 0.20) + (price_score * 0.15)
        final_score = round(final_score, 1)

        # Confidence calculation based on capacity and availability stability (0.75 to 0.98)
        confidence_value = round(min(0.98, max(0.70, 0.80 + (avail_ratio * 0.15))), 3)
        confidence_pct = f"{round(confidence_value * 100, 1)}%"

        # Explainability reasoning generation from actual facility data
        reasoning = []
        avail_pct = round(avail_ratio * 100)
        if avail_pct >= 50:
            reasoning.append(f"High slot availability ({f.availableSlots} open, {avail_pct}% available).")
        elif f.availableSlots > 0:
            reasoning.append(f"Moderate slot availability ({f.availableSlots} open).")
        else:
            reasoning.append("Currently at full capacity.")

        if f.distanceMinutes <= 3:
            reasoning.append(f"Short {f.distanceMinutes} min walk to destination.")
        else:
            reasoning.append(f"Proximity of {f.distanceMinutes} min walk.")

        if pref.evCompatible and f.isEVChargingReady:
            reasoning.append("Matches EV charging criteria.")
        
        if f.price <= 10:
            reasoning.append(f"Economical pricing at ₹{int(f.price) if f.price == int(f.price) else f.price}/hr.")

        if getattr(f, 'isCovered', True):
            reasoning.append("Covered parking deck.")

        forecast_status = "Good availability" if avail_pct >= 40 else ("Moderate filling" if avail_pct >= 15 else "Filling fast")

        scored_recommendations.append({
            "facility": {
                "id": f.id,
                "name": f.name,
                "address": f.address
            },
            "matchScore": final_score,
            "confidence": confidence_value,
            "confidenceScore": confidence_pct,
            "estimatedWalkingTime": f.distanceMinutes,
            "estimatedPrice": f.price,
            "availableSlots": f.availableSlots,
            "totalCapacity": f.totalCapacity,
            "isEVChargingReady": f.isEVChargingReady,
            "forecastStatus": forecast_status,
            "reasoning": reasoning
        })

    # Sort by score descending
    scored_recommendations.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "success": True,
        "engine": "Rule-Based Parking Intelligence",
        "recommendations": scored_recommendations
    }

