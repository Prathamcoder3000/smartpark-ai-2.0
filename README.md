# 🚗 SmartPark AI 2.0

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Backend-Fastify%205-181d21?style=flat-square&logo=fastify)](https://fastify.dev/)
[![FastAPI](https://img.shields.io/badge/AI_Engine-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Language-Python%203-3776ab?style=flat-square&logo=python)](https://www.python.org/)
[![Project Status](https://img.shields.io/badge/Status-Release%20Ready-success?style=flat-square)](https://github.com/Prathamcoder3000/smartpark-ai-2.0)

SmartPark AI 2.0 is an intelligent, production-grade parking discovery, reservation, and real-time mobility platform. It helps drivers locate optimal parking bays by combining spatial 2D floor visualizers, explainable AI recommendation algorithms, IoT ultrasonic sensor telemetry, and live multi-client server-sent events.

---

## 📖 Table of Contents

- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Database Schema](#-database-schema)
- [Core Workflows](#-core-workflows)
- [Advanced Features](#-advanced-features)
  - [Rule-Based Explainable AI](#1-rule-based-explainable-ai)
  - [IoT Telemetry Pipeline](#2-iot-telemetry-pipeline)
  - [Real-Time SSE updates](#3-real-time-sse-updates)
  - [Production Security & Abuse Protection](#4-production-security--abuse-protection)
- [Installation & Local Setup](#-installation--local-setup)
- [API Documentation](#-api-documentation)
- [Automated Integration Tests](#-automated-integration-tests)
- [Roadmap & engineering phases](#-roadmap--engineering-phases)
- [License](#-license)

---

## 🎯 Executive Overview

Modern urban mobility requires balancing driver preferences (budget, walking distance, vehicle constraints) with real-world garage capacities. Traditional parking locators fail because static data staleness leads to arrival conflicts. 

SmartPark AI 2.0 addresses this challenge by providing:
- **Intelligent Recommendations**: A deterministic search utility incorporating driver profile settings (EV charging necessity, price cap, distance limits) to rank parking facilities.
- **Dynamic Slot Reservation**: Users can navigate individual floors, pre-select specific bays, and reserve them.
- **IoT-Powered Status Propagation**: Real-world slot sensors report occupancies via telemetry endpoints. Active reservations protect target bays, preventing incoming simulator state events from overwriting slots to `AVAILABLE`.
- **Operator Metrics**: Operational views show dynamic facility telemetry, occupancy rates, and real-time floor statuses.

---

## 🏗️ System Architecture

```text
                  ┌──────────────────────────────────────────┐
                  │          Next.js Web Application         │
                  │   - App Router Pages (Search, Live Map)  │
                  │   - SSE client streams & dynamic maps    │
                  └────────────────────┬─────────────────────┘
                                       │
                              HTTP REST / SSE Stream
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │           Fastify API Gateway            │
                  │   - User sessions (JWT/Bcrypt)           │
                  │   - Telemetry ingestion routes           │
                  │   - EventSource SSE broadcaster          │
                  └──────────┬────────────────────┬──────────┘
                             │                    │
                      Prisma │                    │ REST Proxy
                             ▼                    ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │ Supabase         │    │ FastAPI AI       │
                    │ PostgreSQL       │    │ Recommender      │
                    └──────────────────┘    └──────────────────┘
                             ▲
                             │ Telemetry updates
                    ┌────────┴─────────┐
                    │ IoT Simulator    │
                    │ Telemetry Script │
                    └──────────────────┘
```

- **Frontend**: Next.js client-side interface fetching state from the Fastify REST proxy, monitoring SSE events to update visual layouts in real time.
- **Backend API Gateway**: Fastify router securing sessions with JSON Web Tokens (JWT), managing Prisma transaction states, and emitting socket-free events.
- **AI Recommendation Engine**: FastAPI Python microservice running scoring matrices to filter and order facilities.
- **IoT Simulator**: Multi-threaded python loop reporting simulated hardware sensor changes directly to the telemetry api.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS, TypeScript, Lucide Icons | Responsive panels, SVG slot grids, user profile preferences, notifications overlay. |
| **Backend API** | Fastify 5, `@fastify/rate-limit`, `@fastify/cors` | Fast JSON serialization, JWT authentication, rate limiting, and EventSource endpoints. |
| **Database** | Supabase Cloud PostgreSQL, Prisma ORM | SQL persistence with strict indexation, cascade deletions, and relational integrity. |
| **AI Engine** | FastAPI, Uvicorn, Python 3.9, Pydantic | Deterministic rule-based scoring and explanatory tags generation. |
| **IoT Simulation**| Python 3, requests, python-dotenv | Mocking physical parking lot sensors with customizable targets and intervals. |

---

## 📂 Repository Structure

```text
SmartPark-AI-2.0/
├── frontend/             # Next.js Application Client
│   ├── app/              # Router layouts & page views (intelligence, map, search)
│   ├── components/       # Component Library (Header, Button, StatusBadge, Toast)
│   └── lib/              # API services client, JWT helper, profile data fetchers
│
├── backend/              # Fastify Gateway Service
│   ├── src/index.ts      # App entry point, CORS configuration, Rate Limiter, Error Handler
│   ├── src/routes/       # Domain routes (auth, facilities, reservations, bookings, operator, telemetry)
│   ├── src/tests/        # Automated integration test flow (integration.test.ts)
│   └── prisma/           # Prisma Client, schema.prisma models, and database seeds
│
├── ai-engine/            # FastAPI Recommendation Microservice
│   ├── app/main.py       # Deterministic rule-based prediction & recommendation endpoints
│   └── requirements.txt  # Python pip dependencies
│
└── iot-simulator/        # IoT Telemetry Simulator
    ├── simulator.py      # Simulator loop posting slot telemetry status updates
    └── README.md         # Configuration guide
```

---

## 🗄️ Database Schema

SmartPark AI 2.0 uses a highly structured relational schema defined via Prisma:

```text
  ┌──────────┐          ┌───────────┐          ┌──────────┐
  │   User   │─────────<>│  Vehicle  │          │ Operator │
  └────┬─────┘          └─────┬─────┘          └────┬─────┘
       │                      │                     │
       ├──────────────────────┼─────────────┐       │ Manages
       │                      │             │       │
      <›                     <›            <›       ▼
┌─────────────┐        ┌────────────┐     ┌─────────────────┐
│ Reservation │<>─────<>│  Booking  │     │ ParkingFacility │
└──────┬──────┘        └─────┬──────┘     └────────┬────────┘
       │                     │                     │
       ├─────────────────────┘                     ├───────────┐
       ▼                                           ▼           ▼
┌─────────────┐                               ┌─────────┐ ┌───────────┐
│ ParkingSlot │◄──────────────────────────────│  Floor  │ │ Telemetry │
└─────────────┘                               └─────────┘ └───────────┘
```

### Key Models:
- **`ParkingFacility`**: Tracks location, name, floors, and associated operators.
- **`Floor`**: Levels inside a facility (e.g., Level B1).
- **`ParkingSlot`**: Grid bays supporting status enums (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `DISABLED`) and EV charging status.
- **`Reservation`**: Scheduled slot claims mapped to users and vehicles.
- **`Booking`**: Checked-in occupancy records associated with an active reservation.
- **`ParkingTelemetry`**: Sensor ingestion history capturing occupancy and signal strength values.

---

## ⚡ Advanced Features

### 1. Rule-Based Explainable AI
The FastAPI service evaluates parking options based on profile preferences:
- **EV Compatibility Match**: Checks if the vehicle is electric and prioritizes slots with charging capability.
- **Distance & Pricing Weights**: Ranks facilities using proximity scores and hourly cost metrics.
- **Explainable Feedback**: Returns explicit justification tags (e.g., `"Short walking distance"`, `"EV Charging Compatible"`) alongside a deterministic matching percentage.

### 2. IoT Telemetry Pipeline
- Ultrasonic sensors post state reports to `POST /api/telemetry`.
- **Reserved-Slot Protection**: If a slot status is currently `RESERVED` (owing to a user booking conversion), incoming telemetry reports indicating that a bay is vacant will **not** override the status to `AVAILABLE`, securing the driver's spot.

### 3. Real-Time SSE Updates
- Real-time updates are piped using Fastify Server-Sent Events (SSE).
- Re-connection loops and clean event emitters are integrated in [realtime.ts](file:///d:/SmartPark-AI-2.0/backend/src/routes/realtime.ts).
- Dynamically broadcasts occupancy modifications to target facility channels or the global dashboard view.

### 4. Production Security & Abuse Protection
- **JWT Enforced Routes**: Sensitive APIs require verification of the signed JWT bearer token.
- **API Rate Limiting**: Global rate-limits using `@fastify/rate-limit` block brute-force attempts on `/signup`, `/login`, `/telemetry`, and `/recommend` routes.
- **Operator Seeding Lock**: The `/seed-operator` endpoint is blocked once a database operator exists, requiring verification of `ADMIN_SEED_SECRET` headers.
- **Sanitized Errors**: The Fastify global error handler catches internal stack traces and database details, returning structured, sanitized responses:
  ```json
  {
    "success": false,
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred."
    }
  }
  ```

---

## 🔧 Installation & Local Setup

### 1. Clone & Core Setup
```bash
git clone https://github.com/Prathamcoder3000/smartpark-ai-2.0.git
cd smartpark-ai-2.0
```

### 2. Fastify Backend Configuration
```bash
cd backend
cp .env.example .env
npm install
```
Update `.env` database URLs and JWT secrets:
```env
DATABASE_URL="postgresql://user:password@your-db-host:5432/postgres?pgbouncer=true"
JWT_SECRET="generate-a-long-random-string"
AI_ENGINE_URL="http://127.0.0.1:8002"
FRONTEND_URL="http://localhost:3000"
ADMIN_SEED_SECRET="your-seed-secret"
```

Push database schema & populate default data:
```bash
npx prisma db push
npx prisma db seed
```

Start Fastify backend:
```bash
npm run dev
```

### 3. Next.js Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

### 4. FastAPI Recommender Setup
```bash
cd ../ai-engine
pip install -r requirements.txt
uvicorn app.main:app --port 8002 --reload
```

### 5. Telemetry Simulator Execution
```bash
cd ../iot-simulator
pip install requests python-dotenv
python simulator.py
```

---

## 📡 API Documentation

### Authentication `/api/auth`
- `POST /signup`: Register a new driver user.
- `POST /login`: Generate driver JWT session token.
- `GET /me`: Fetch authenticated user profile data.

### Facilities `/api/facilities`
- `GET /`: Retrieve all active facilities.
- `GET /:id`: Fetch metadata, floors, and slots of a specific facility.

### Vehicles `/api/vehicles`
- `POST /`: Register a vehicle (license plate, EV flag).
- `GET /`: List driver's registered vehicles.
- `DELETE /:id`: Remove a registered vehicle.

### Reservations `/api/reservations`
- `POST /`: Book slot schedule reservation (prevents overlapping times).
- `GET /`: Retrieve driver's active reservations.
- `DELETE /:id/cancel`: Cancel reservation.

### Bookings `/api/bookings`
- `POST /`: Convert reservation to active booking (slot status becomes `RESERVED`).
- `POST /:id/check-in`: Trigger check-in (slot status becomes `OCCUPIED`).
- `POST /:id/check-out`: Trigger check-out (slot status becomes `AVAILABLE`).

### Telemetry `/api/telemetry`
- `POST /`: Ingest single slot sensor event payload.
- `POST /batch`: Bulk ingest telemetry updates.

### AI Engine proxy `/api/ai`
- `POST /recommend`: Proxies requests to FastAPI engine returning sorted parking options.

### Realtime Streaming `/api/realtime`
- `GET /facilities/:id`: SSE connection stream listener.

### System Diagnostics
- `GET /health`: Basic operational diagnostics status.
- `GET /ready`: SQL query test checking active PostgreSQL database connectivity.

---

## 🧪 Automated Integration Tests

SmartPark AI 2.0 features an automated end-to-end integration test runner validating all core routines:

```bash
cd backend
npx ts-node src/tests/integration.test.ts
```

The test runner creates sandboxed test data, validates session states, check-in flows, double-booking protection, and automatically clears all test records from the database upon exit.

---

## 🛣️ Roadmap & Engineering Phases

### Completed Development Phases:
* **Phase 1: Database & Backend Foundation** - Supabase connectivity, Prisma schema definitions, Fastify server setup.
* **Phase 2: Core Feature Implementation** - Slot search, bookings controllers, notification models.
* **Phase 3: Service Integration** - API proxy routing, JWT token verification, dynamic dashboard feeds.
* **Phase 4: QA Auditing & Bug Fixing** - Seeding logic isolation, overlapping reservation locks.
* **Phase 5: Production Hardening & IoT** - Fastify rate limiting, env variable checks, Python sensor simulator.
* **Phase 6: Release Readiness** - Global error handlers, `/ready` health diagnostics, full integration test suites.
* **Phase 7: Final Release Validation** - Compile verifications, telemetry checks.

### Future Infrastructure Work:
* Configure automated deployment pipelines (CI/CD) for AWS/Vercel.
* Integrate Prometheus/Grafana metrics monitoring.
* Incorporate distributed event brokers (Kafka/RabbitMQ) to scale real-time telemetry streams.

---

## 📄 License

License has not yet been specified.

---

<p align="center">
  <b>SmartPark AI 2.0</b><br/>
  Intelligent Parking • Real-Time Infrastructure • Explainable AI • IoT
</p>