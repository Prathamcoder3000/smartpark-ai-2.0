# 🚗 SmartPark AI 2.0

> **Don't just find parking. Know where you should park before you arrive.**

SmartPark AI 2.0 is an intelligent parking and urban mobility platform designed to help drivers discover, evaluate, and reserve optimal parking spaces using spatial information, predictive intelligence, and personalized preferences.

Finding parking in modern cities is not just a distance query—it is a temporal, economic, and convenience trade-off. Traditional parking locators only show static "current availability," which often changes by the time a driver arrives. SmartPark AI 2.0 solves this by presenting live predictive occupancy forecasts, walking ETAs, EV charging availability, and tailored AI recommendations.

---

## 📌 Project Status

The platform is a fully integrated, production-hardened microservices application consisting of a modern Next.js frontend, a Fastify-based backend gateway with Prisma, a FastAPI-based AI engine, and a Python-based IoT sensor simulator.

| Area / Component | Current Implementation | Status |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | ✅ Complete |
| **Backend Gateway** | Fastify 5 + TypeScript + Prisma Client | ✅ Complete |
| **Database** | Supabase PostgreSQL + Prisma Schema | ✅ Complete |
| **AI Engine** | FastAPI + Uvicorn + Pydantic (Rule-Based Parking Intelligence) | ✅ Complete |
| **Telemetry Simulator** | Python IoT parking occupancy sensor simulator | ✅ Complete |
| **Real-Time Streaming** | Server-Sent Events (SSE) + Node EventEmitter integration | ✅ Complete |
| **System Security** | JWT Auth sessions + Bcrypt + Global Error Sanitizer | ✅ Complete |
| **Rate Limiting** | `@fastify/rate-limit` abuse protection rules | ✅ Complete |
| **Integration Testing** | Repeatable end-to-end Fastify integration suite | ✅ Complete |

---

## 🏗️ System Architecture

SmartPark AI 2.0 utilizes a decoupled, event-driven microservices architecture:

```mermaid
flowchart TD
    Driver([Driver / User]) <-->|React / Next.js| Frontend[Next.js App Server :3000]
    Frontend <-->|REST API / SSE| Backend[Fastify API Gateway :8001]
    
    Backend <-->|Prisma Client| DB[(Supabase PostgreSQL)]
    Backend <-->|REST API| AIEngine[FastAPI Python Engine :8002]
    
    IoTSimulator[IoT Telemetry Simulator] -->|HTTP POST| Backend
    Backend -->|EventEmitter| SSE[SSE Streaming Controller]
    SSE -->|Live Updates / SSE| Frontend
```

### Telemetry Pipeline
1. **IoT Simulator** updates slot status via `POST /api/telemetry` or `/api/telemetry/batch`.
2. **Fastify Gateway** verifies slot constraints, updates state in **PostgreSQL**, and emits realtime events.
3. **SSE controller** broadcasts updates to the `/api/realtime/facilities/:id` and `/all` streams.
4. **Next.js Frontend** receives events via `EventSource` and dynamically re-renders active map indicators.

---

## 🧩 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons | Responsive spatial visualizer, reservation panels, operator views, and profile controls. |
| **Backend Gateway** | Fastify 5, TypeScript, jsonwebtoken, bcryptjs, `@fastify/rate-limit` | REST API endpoints, JWT session authorization, rate limiting, and event dispatch. |
| **Database & ORM** | Prisma ORM, Supabase Cloud PostgreSQL | Schema definitions, migration management, and transaction isolation. |
| **AI Engine** | FastAPI, Uvicorn, Python 3.9, Pydantic | Rule-based predict & recommend scoring matching user profiles. |
| **IoT Simulation** | Python 3, requests, python-dotenv | Simulates ultrasonic garage sensors reporting slot occupancy status. |

---

## 📂 Directory Structure

```text
SmartPark-AI-2.0/
├── frontend/             # Next.js App Router Frontend
│   ├── app/              # Page layouts, hooks & route definitions
│   ├── components/       # Reusable UI system components (Design Lab)
│   ├── lib/              # Centralized API client & JWT auth services
│   └── tailwind.config.ts# Theme & Design tokens palette
│
├── backend/              # Fastify API Gateway
│   ├── src/index.ts      # Main server entry & environment validations
│   ├── src/routes/       # Route handlers (auth, reservations, bookings, telemetry, ai)
│   ├── src/tests/        # Integration test suites (integration.test.ts)
│   ├── prisma/           # Prisma DB schema & seed scripts
│   └── package.json      # Backend NPM dependencies
│
├── ai-engine/            # FastAPI Python Recommendations Engine
│   ├── app/main.py       # API endpoints & predictive logic
│   └── requirements.txt  # Python requirements
│
└── iot-simulator/        # IoT Telemetry Sensor Simulator
    ├── simulator.py      # Simulator script
    └── README.md         # Configuration guide
```

---

## 🔧 Setup & Installation

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **Python** (v3.9 or later)
- **PostgreSQL Database** (Supabase instance recommended)

---

### 2. Backend Installation (`:8001`)

1. Navigate to backend and copy example environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Update `.env` with your Supabase database credentials, JWT secret key, and AI URL:
   ```env
   PORT=8001
   DATABASE_URL="postgresql://user:password@your-db-host:6543/postgres?pgbouncer=true"
   JWT_SECRET="your-jwt-secret-here"
   AI_ENGINE_URL="http://127.0.0.1:8002"
   FRONTEND_URL="http://localhost:3000"
   ADMIN_SEED_SECRET="your-seed-secret"
   ```
3. Install packages, run migrations, and start server:
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```

---

### 3. Frontend Installation (`:3000`)

1. Navigate to frontend and copy environment:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
2. Install packages and start server:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### 4. AI Engine Setup (`:8002`)

1. Navigate to ai-engine and install dependencies:
   ```bash
   cd ../ai-engine
   pip install -r requirements.txt
   ```
2. Start the service:
   ```bash
   uvicorn app.main:app --port 8002 --reload
   ```

---

### 5. IoT Simulator Setup

1. Navigate to simulator and install packages:
   ```bash
   cd ../iot-simulator
   pip install requests python-dotenv
   ```
2. Start simulator:
   ```bash
   python simulator.py
   ```

---

## 🧪 Running Integration Tests

SmartPark AI 2.0 includes an automated integration test suite checking signup, login, auth context, vehicle registration, reservation overlaps, booking states, check-in, check-out, and telemetry protection.

To run:
```bash
cd backend
npx ts-node src/tests/integration.test.ts
```

All test records are temporary and are automatically cleaned from the database upon completion.