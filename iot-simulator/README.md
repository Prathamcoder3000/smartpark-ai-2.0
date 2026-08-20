# SmartPark AI 2.0 - IoT Parking Sensor Simulator

This simulator mimics physical IoT parking occupancy sensors (e.g., ultrasonic sensors) deployed in facility slots. It generates realistic heartbeat events and sends status telemetry updates directly to the backend API.

## 1. How to Configure the Simulator

The simulator reads configuration values from environment variables or a local `.env` file in the same folder. Copy the `.env.example` to start:

```bash
cp .env.example .env
```

Configuration variables:
- `BACKEND_URL`: URL of the SmartPark Fastify API server (default: `http://localhost:8001`).
- `SIMULATION_INTERVAL`: Delay in seconds between telemetry transmissions (default: `10.0`).
- `FACILITY_ID`: The unique database ID of the target parking facility (e.g., `facility-metro-central`).
- `SLOT_ID`: The unique database ID of the target parking slot (e.g., `slot-metro-central-1-1`).

---

## 2. How to Start the Simulator

1. Install required Python packages:
   ```bash
   pip install requests python-dotenv
   ```

2. Run the simulator script:
   ```bash
   python simulator.py
   ```

---

## 3. What Telemetry it Sends

The simulator posts structured JSON payloads directly to `POST /api/telemetry` on the configured backend API:

```json
{
  "facilityId": "facility-metro-central",
  "slotId": "slot-metro-central-1-1",
  "occupancy": true,
  "signalStrength": -62,
  "sensorType": "ULTRASONIC"
}
```

- **`occupancy`**: Automatically alternates states (with a 15% state-transition chance on each tick) to simulate real-world vehicle arrivals and departures.
- **`signalStrength`**: Randomizes RSSI signal metrics (between -55 dBm and -90 dBm) to represent realistic telemetry signal flux.

---

## 4. How to Stop the Simulator

To terminate the simulation loop, press **`Ctrl + C`** in your console. The script catches the interrupt signal (`SIGINT` / `SIGTERM`) and closes gracefully.

---

## 5. How to Verify Telemetry Reaches SmartPark

1. **Backend Logs**: The Fastify server logs will show incoming requests:
   `POST /api/telemetry 201 Created`
2. **Database Verification**: Connect to Supabase or run a SQL query verifying slot status transitions:
   `SELECT status FROM "ParkingSlot" WHERE id = 'slot-metro-central-1-1';`
3. **Real-time Map Visuals**: Load the map UI page on your frontend. The slot occupancy state changes dynamically without manual page refresh via the SSE stream listener.
