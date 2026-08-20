#!/usr/bin/env python3
"""
SmartPark AI 2.0 - IoT Parking Sensor Simulator
===============================================
This script simulates an IoT parking slot occupancy sensor, generating realistic 
telemetry events and sending them to the Fastify backend API.

Configuration:
--------------
Create an '.env' file in this folder (or set environment variables):
  BACKEND_URL=http://localhost:8001
  SIMULATION_INTERVAL=10.0
  FACILITY_ID=facility-metro-central
  SLOT_ID=slot-metro-central-1-1

Install dependencies:
---------------------
  pip install requests python-dotenv

Usage:
------
  python simulator.py
"""

import os
import sys
import time
import random
import signal
import requests
from dotenv import load_dotenv

# Load env file if present
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001").rstrip("/")
INTERVAL = float(os.getenv("SIMULATION_INTERVAL", "10.0"))
FACILITY_ID = os.getenv("FACILITY_ID", "facility-metro-central")
SLOT_ID = os.getenv("SLOT_ID", "slot-metro-central-1-1")

running = True

def handle_shutdown(signum, frame):
    global running
    print("\n[IoT Simulator] Shutdown signal received. Exiting gracefully...")
    running = False

# Register signal hooks
signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

def run_simulator():
    print("=" * 60)
    print(" SmartPark AI 2.0 - IoT Parking Sensor Simulator starting...")
    print(f" Target API: {BACKEND_URL}/api/telemetry")
    print(f" Facility:   {FACILITY_ID}")
    print(f" Slot:       {SLOT_ID}")
    print(f" Interval:   {INTERVAL} seconds")
    print(" Press Ctrl+C to stop.")
    print("=" * 60)

    # Initial state
    is_occupied = False
    
    while running:
        # Periodic occupancy transition: 15% chance to toggle state
        if random.random() < 0.15:
            is_occupied = not is_occupied

        # Generate realistic RSSI (signal strength) between -50 dBm and -95 dBm
        signal_strength = random.randint(-90, -55)
        
        payload = {
            "facilityId": FACILITY_ID,
            "slotId": SLOT_ID,
            "occupancy": is_occupied,
            "signalStrength": signal_strength,
            "sensorType": "ULTRASONIC"
        }

        try:
            print(f"[IoT Simulator] Sending telemetry: Slot {SLOT_ID} -> {'OCCUPIED' if is_occupied else 'AVAILABLE'} (RSSI: {signal_strength}dBm)...", end="")
            response = requests.post(
                f"{BACKEND_URL}/api/telemetry",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code in (200, 201):
                print(" SUCCESS")
            else:
                print(f" FAILED (HTTP {response.status_code}): {response.text}")
        except Exception as e:
            print(f" ERROR (Connection Failed): {e}")

        # Sleep for interval in small increments to respond quickly to shutdown signals
        elapsed = 0.0
        while elapsed < INTERVAL and running:
            time.sleep(0.5)
            elapsed += 0.5

if __name__ == "__main__":
    run_simulator()
