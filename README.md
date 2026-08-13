# 🚗 SmartPark AI 2.0

> **Don't just find parking. Know where you should park before you arrive.**

SmartPark AI 2.0 is an intelligent parking and urban mobility platform designed to help drivers discover, evaluate, and reserve optimal parking spaces using spatial information, predictive intelligence, and personalized preferences.

Finding parking in modern cities is not just a distance query—it is a temporal, economic, and convenience trade-off. Traditional parking locators only show static "current availability," which often changes by the time a driver arrives. SmartPark AI 2.0 solves this by presenting live predictive occupancy forecasts, walking ETAs, EV charging availability, and tailored AI recommendations.

---

## 📌 Project Status

The platform consists of a modern Next.js frontend, a Fastify-based backend with Prisma, and a FastAPI-based AI engine. The current implementation status across components is outlined below:

| Area / Component | Current Implementation | Status |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | ✅ Complete |
| **Overview Page (`/`)** | Live statistics dashboard, recent bookings summary, and analytics | ✅ Complete |
| **Live Map (`/map`)** | Interactive 2D floor visualizer, live slot picker, and selector panel | ✅ Complete |
| **Search Page (`/search`)** | Search console, auto-complete suggestions, filters, and sorting | ✅ Complete |
| **Profile Page (`/profile`)** | User settings, saved facilities, preferences, and mock actions | ✅ Complete |
| **Design Lab (`/design-system`)** | Interactive system tokens, style controls, and components preview | ✅ Complete |
| **Authentication UI** | Animated, responsive `/login` and `/signup` screens | 🟡 Frontend Prototype |
| **Backend API (`backend/`)** | Fastify service foundation on Port 8001 with CORS configuration | 🟡 Server Foundation |
| **Database Schema** | Prisma ORM with PostgreSQL provider mapping `ParkingFacility` | 🟡 Database Schema |
| **AI Engine (`ai-engine/`)** | FastAPI service on Port 8000 returning service health feeds | 🟡 Engine Foundation |
| **API / Services Integration** | Frontend calls are fully client-side using mock data modules | 📋 Planned Integration |

---

## 🎯 Product Vision

SmartPark AI 2.0 bridges the gap between drivers and parking infrastructure by optimizing parking occupancy:

### 👤 Driver Experience
- **Smart Search & Recommendations**: Enter a destination and instantly receive recommendations ranked by distance, cost, covered options, and EV charger availability.
- **Predictive Booking**: Know the forecasted occupancy of a garage hours in advance.
- **Interactive Spatial Mapping**: Drill down into specific garage levels, view individual slot attributes (EV, Disabled, Standard), and pre-select a bay.
- **Personalized Profile Preferences**: Configure custom weights (e.g., prioritize short walking distance over cost or flag EV charging as mandatory) that directly re-rank search recommendations.

### 🏢 Operator Experience (Planned)
- **Occupancy Optimization**: Balance vehicle volume across multi-level structures.
- **Dynamic Pricing Controls**: Automatically adjust rates during peak demand hours.
- **Predictive Demand Forecasting**: Review historical peak data to optimize staffing and energy usage.

---

## ✨ Current Capabilities

### 📊 Overview Dashboard (`/`)
- Displays real-time KPIs (Active Reservations, Total Hours Logged, Average Cost, Active Vehicles).
- Renders occupancy charts and active reservations.
- Direct links to key pages (Live Map, Design Lab).

### 🗺️ Interactive Live Map (`/map`)
- Allows users to select active facilities in the city.
- Displays interactive multi-floor layouts (e.g., Level B1, B2).
- Dynamic slot grid visualizer: select standard, disabled, or EV-ready bays.
- Interactive booking panel showing ETA, bay numbers, and billing summary.

### 🔍 Parking Search Console (`/search`)
- Destination search with popular quick-select destination chips (e.g., Cyber City, Central Metro, TechPark).
- Auto-complete suggestions categorized by *Parking Facilities*, *Nearby Destinations*, and *Parking Zones*.
- Top Highlighted **SmartPark Recommended** option displaying AI recommendation reasons and confidence score (e.g., 98.4%).
- Multi-criteria filters: Availability (High Availability), Features (EV Ready, Covered, 24/7 Security), and maximum Price limits.
- Result sorting by Recommended, Closest, Lowest Price, and Highest Availability.
- Detailed modal overview displaying facilities, rates, and amenities.

### 👤 Profile Center (`/profile`)
- User summary Hero Card with "Pro Operator" status and active status badges.
- Edit profile form modal with client-side validation and Toast notification updates.
- Interactive preferences panel to toggle EV, Covered, Low Price, and Shorter Walk settings.
- Saved Parking List allowing users to remove items with empty state visual fallbacks.
- Mock Account Security modals (Change Password, Privacy Policy, Terms of Service, and Logout Confirmation).

---

## 🖥️ Application Routes

| Route | Purpose | Current State |
| :--- | :--- | :--- |
| `/` | System Overview, Booking Summary, and Main Dashboard | ✅ Completed (Mock Data) |
| `/design-system` | Developer Design Laboratory & component style preview | ✅ Completed (Interactive) |
| `/map` | Live Map, multi-level layouts, slot selector, and booking summary | ✅ Completed (Mock Data) |
| `/login` | Secure operator login screen with animated flow | 🟡 Frontend Prototype |
| `/signup` | Operator account signup screen with validation | 🟡 Frontend Prototype |
| `/profile` | Manage account data, parking preferences, and saved garages | 🟡 Frontend Prototype |
| `/search` | Search dashboard with auto-complete suggestions and filters | 🟡 Frontend Prototype |

---

## 🧠 SmartPark Intelligence

The user experience simulates predictive analytics to guide drivers:

- **AI Recommendation Confidence**: Calculations displaying matching confidence (e.g., `98.4%`) based on user profile settings.
- **Occupancy Alerts & Forecasts**: Real-time status indicators (`AVAILABLE`, `LIMITED`, `OCCUPIED`) paired with text forecasts (e.g., *"High stability next 3 hrs"*).
- **Recommendation Reasoning**: Explanatory tags indicating why a spot was chosen (e.g., *Short walking distance*, *Covered Deck*).

### 🔍 Current Integration State
Currently, all predictions, recommendation rationale, and confidence scores are generated using client-side mock data engines ([`frontend/lib/liveMapData.ts`](frontend/lib/liveMapData.ts) & [`frontend/lib/searchData.ts`](frontend/lib/searchData.ts)). Connecting the Next.js frontend to the Fastify gateway and FastAPI python forecasting models is planned.

---

## 🎨 Design System

SmartPark AI 2.0 utilizes a spatial dark-mode visual system designed to reduce driver eye strain.

### 🎨 Color Palette
Tailwind CSS tokens implemented in [`frontend/tailwind.config.ts`](frontend/tailwind.config.ts):

| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `smartBg` | `#0A0C0E` | Deep background dark canvas |
| `smartSurface` | `#111519` | Main layout card surfaces |
| `smartElevated` | `#181D21` | Popups, modals, and hover card surfaces |
| `smartBorder` | `#282F34` | Sleek borders separating sections |
| `smartTextPrimary` | `#F4F6F1` | Primary text and major headers |
| `smartTextSecondary`| `#8B9298` | Secondary labels, descriptions, and details |
| `signature` | `#B7F34A` | Electric Lime accent for active selection and highlights |
| `available` | `#10B981` | Green status for open bays and available facilities |
| `limited` | `#F59E0B` | Amber status for low bay availability |
| `occupied` | `#EF4444` | Red status indicating occupied slots or closed facilities |
| `aiBlue` | `#3B82F6` | Electric Blue representing AI recommendations |

### 🔤 Typography & Font System
- **Space Grotesk**: Utilized for primary headers, logos, and dashboard metrics.
- **Inter**: Utilized for standard body copy, input forms, and descriptive labels.
- **JetBrains Mono**: Utilized for status codes, booking reference IDs, and technical metrics.

---

## 🧩 Component Library

Located in [`frontend/components/ui/`](frontend/components/ui/):

| Component | Description |
| :--- | :--- |
| **`Header.tsx`** | Floating navigation capsule header with responsive mobile drawer and profile routing |
| **`Button.tsx`** | System-styled buttons supporting `primary`, `secondary`, and `ghost` variants |
| **`IconButton.tsx`**| Circular icon buttons for search, alerts, and navigation |
| **`Card.tsx`** | Standard containers with varying surface elevations (`default`, `elevated`, `outlined`, `flat`) |
| **`Badge.tsx`** | Small tags supporting semantic status color states |
| **`StatusBadge.tsx`**| Animated indicator tag for facility and slot availability |
| **`Input.tsx`** | Standard text inputs with label matching, placeholders, and error validation displays |
| **`Select.tsx`** | Custom styled native selection dropdown selector |
| **`Modal.tsx`** | Overlay dialog supporting custom widths, sizes, and keyboard Escape close |
| **`Drawer.tsx`** | Sliding overlay drawer for side menus and layout panels |
| **`Toast.tsx`** | Success, warning, info, and error notifications popping up at screen corners |
| **`EmptyState.tsx`**| Clean dashed placeholder panel displayed when result arrays are empty |
| **`LoadingSkeleton.tsx`**| Animated pulse skeletons matching mock load routines |
| **`ParkingSlot.tsx`**| Interactive map grid node managing availability and EV charging badge statuses |

---

## 🏗️ Architecture

SmartPark AI 2.0 is designed as a decoupled microservices architecture:

```mermaid
flowchart TD
    User([Driver / Operator]) <-->|React / Next.js| Frontend[Next.js App Server :3000]
    Frontend <-->|REST API / Planned| Backend[Fastify API Gateway :8001]
    Backend <-->|Prisma Client| DB[(PostgreSQL Database)]
    Backend <-->|REST API / Planned| AIEngine[FastAPI Python Engine :8000]
```

### 📂 Directory Structure

```text
├── frontend/             # Next.js App Router Frontend
│   ├── app/              # Page layouts & route definitions
│   ├── components/       # Custom reusable UI components
│   ├── lib/              # Local data adapters, auth service, & mock data
│   └── tailwind.config.ts# Design tokens and theme definition
│
├── backend/              # Fastify Gateway Service
│   ├── src/index.ts      # Server index & configuration
│   ├── prisma/           # Prisma schema definition
│   └── package.json      # Node dependencies (Fastify, Prisma)
│
├── ai-engine/            # FastAPI Python Forecasting Engine
│   ├── app/main.py       # API endpoints & load logic
│   └── requirements.txt  # Python package definitions
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
- Node.js (v18.x or later)
- Python (v3.9 or later)

---

### 2. Frontend Installation (`:3000`)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Backend Setup (`:8001`)
Create a local `.env` inside `/backend` following the `.env.example`:
```env
PORT=8001
DATABASE_URL="postgresql://user:password@localhost:5432/smartpark"
```

Install dependencies:
```bash
cd backend
npm install
npm run dev
```

---

### 4. AI Engine Setup (`:8000`)
Install packages:
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## 📋 Development Roadmap

- [x] Initial design system, tokens, and font structures.
- [x] Core layout viewports and responsive sidebar components.
- [x] Interactive `/map` level selector and mock booking dashboard.
- [x] Operator `/login` & `/signup` interface models.
- [x] User Account `/profile` settings with preference overrides.
- [x] Dynamic `/search` engine with auto-complete suggestions and filters.
- [ ] Connect Fastify API endpoints to Next.js data hooks.
- [ ] Implement database records inside PostgreSQL using Prisma.
- [ ] Integrate FastAPI Python forecasting scripts for occupancy predictions.
- [ ] Support production JWT authentication sessions.