'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Navigation,
  Car,
  Layers,
  TrendingUp,
  Activity,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Sliders,
  DollarSign,
  Info,
  Server,
  Database,
  Radio,
  RefreshCw
} from 'lucide-react';
import { authService } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live telemetry counters & variables
  const [liveOccupancy, setLiveOccupancy] = useState(72);
  const [sensorHeartbeat, setSensorHeartbeat] = useState(true);
  const [simulatedEventsCount, setSimulatedEventsCount] = useState(1480);

  // Preference sliders for interactive AI scoring simulator
  const [prefEvPriority, setPrefEvPriority] = useState(true);
  const [prefBudgetLimit, setPrefBudgetLimit] = useState(90); // price cap per hour
  const [prefDistanceLimit, setPrefDistanceLimit] = useState(150); // max walk distance in meters

  // Selected slot in the Interactive Floor Map
  const [selectedDemoSlot, setSelectedDemoSlot] = useState('S-4');

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(authService.isAuthenticated());

    const interval = setInterval(() => {
      setLiveOccupancy((prev) => {
        const delta = Math.random() > 0.5 ? 2 : -2;
        const next = prev + delta;
        return next > 90 ? 82 : next < 40 ? 55 : next;
      });
      setSensorHeartbeat(prev => !prev);
      setSimulatedEventsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Demo slots layout with detailed telemetry specs
  const demoSlots = [
    {
      id: 'S-1',
      status: 'OCCUPIED',
      ev: false,
      price: 80,
      distance: 40,
      sensorHealth: '98.9%',
      signalStrength: '-72 dBm',
      lockActive: false,
      slotType: 'Standard Space',
    },
    {
      id: 'S-2',
      status: 'AVAILABLE',
      ev: false,
      price: 60,
      distance: 120,
      sensorHealth: '99.4%',
      signalStrength: '-65 dBm',
      lockActive: false,
      slotType: 'Compact Space',
    },
    {
      id: 'S-3',
      status: 'LIMITED',
      ev: true,
      price: 110,
      distance: 30,
      sensorHealth: '97.2%',
      signalStrength: '-78 dBm',
      lockActive: false,
      slotType: 'EV Fast-Charge',
    },
    {
      id: 'S-4',
      status: 'RESERVED',
      ev: true,
      price: 90,
      distance: 70,
      sensorHealth: '99.8%',
      signalStrength: '-58 dBm',
      lockActive: true,
      slotType: 'EV Charge Space',
    },
    {
      id: 'S-5',
      status: 'AVAILABLE',
      ev: true,
      price: 80,
      distance: 85,
      sensorHealth: '99.7%',
      signalStrength: '-60 dBm',
      lockActive: false,
      slotType: 'EV Charge Space',
    },
    {
      id: 'S-6',
      status: 'OCCUPIED',
      ev: false,
      price: 70,
      distance: 190,
      sensorHealth: '99.2%',
      signalStrength: '-70 dBm',
      lockActive: false,
      slotType: 'Standard Space',
    },
  ];

  // AI scoring algorithm simulation based on active sliders
  const calculateScore = (slot: typeof demoSlots[0]) => {
    if (slot.status === 'OCCUPIED') return 0;
    
    let baseScore = 100;
    
    // EV Preference weight
    if (prefEvPriority) {
      if (!slot.ev) baseScore -= 30; // Deduct if user wants EV but slot doesn't have it
    } else {
      if (slot.ev) baseScore -= 5; // Slight deduction if EV charging occupies standard needs
    }

    // Budget Limit check
    if (slot.price > prefBudgetLimit) {
      const diff = slot.price - prefBudgetLimit;
      baseScore -= Math.min(diff * 1.5, 45); // Deduct based on over-budget amount
    }

    // Distance Limit check
    if (slot.distance > prefDistanceLimit) {
      const diff = slot.distance - prefDistanceLimit;
      baseScore -= Math.min(diff * 0.4, 30);
    }

    // Reservation Lock bias
    if (slot.lockActive) {
      baseScore -= 15; // Reserved slots have lower match weight unless user holds the reserve
    }

    return Math.max(10, Math.min(100, Math.round(baseScore)));
  };

  const scoredSlots = demoSlots.map(slot => ({
    ...slot,
    aiScore: calculateScore(slot)
  }));

  // Find the top recommendation
  const topRecommendedSlot = [...scoredSlots]
    .filter(s => s.status !== 'OCCUPIED')
    .sort((a, b) => b.aiScore - a.aiScore)[0] || scoredSlots[1];

  const currentSelectedSlotData = scoredSlots.find(s => s.id === selectedDemoSlot) || scoredSlots[0];

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary font-sans selection:bg-signature selection:text-smartBg relative overflow-x-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#181D21_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-signature/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-aiBlue/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ─────────────────────────────────────────────────────────────
         SECTION 1: PREMIUM HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <header className="mx-auto max-w-5xl w-full bg-smartBg/85 backdrop-blur-md border border-smartBorder rounded-full pointer-events-auto shadow-2xl h-12 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
            </div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-smartTextPrimary group-hover:text-white transition-colors">
              SmartPark<span className="text-signature">.</span>AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Public Navigation">
            {[
              { name: 'Product', href: '#product' },
              { name: 'Telemetry', href: '#telemetry-view' },
              { name: 'Explainable AI', href: '#ai-scoring' },
              { name: 'Architecture', href: '#architecture' },
              { name: 'Features', href: '#features' }
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-smartTextSecondary hover:text-smartTextPrimary px-3 py-1.5 rounded-full transition-colors hover:bg-smartSurface/50"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {mounted && isAuthenticated ? (
              <Link href="/home">
                <Button variant="primary" size="sm" className="h-8 text-[10px] uppercase font-mono px-4 shadow-lg shadow-signature/10">
                  Dashboard
                </Button>
              </Link>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-smartTextSecondary hover:text-smartTextPrimary px-3 py-1.5 cursor-pointer transition-colors">
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" className="h-8 text-[10px] uppercase font-mono px-3">
                    Register
                  </Button>
                </Link>
              </>
            ) : null}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-smartTextSecondary hover:text-smartTextPrimary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative ml-auto w-3/4 max-w-xs h-full bg-smartBg border-l border-smartBorder flex flex-col justify-between p-6 z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-smartBorder pb-4">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">SmartPark.AI</span>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="flex flex-col gap-2">
                  {[
                    { name: 'Product', href: '#product' },
                    { name: 'Telemetry', href: '#telemetry-view' },
                    { name: 'Explainable AI', href: '#ai-scoring' },
                    { name: 'Architecture', href: '#architecture' },
                    { name: 'Features', href: '#features' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 text-smartTextSecondary hover:text-smartTextPrimary hover:bg-smartSurface rounded"
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-t border-smartBorder pt-6">
                {isAuthenticated ? (
                  <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" size="sm" className="w-full h-9 text-[10px] uppercase font-mono">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button variant="secondary" size="sm" className="w-full h-9 text-[10px] uppercase font-mono">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button variant="primary" size="sm" className="w-full h-9 text-[10px] uppercase font-mono">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="h-20" />

      {/* ─────────────────────────────────────────────────────────────
         SECTION 2: PREMIUM HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center" id="product">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-signature/10 border border-signature/30">
            <Sparkles className="h-3 w-3 text-signature" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-signature">
              Next-Gen Predictive Mobility Platform v2.0
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
            PARK SMARTER.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-signature via-signature to-white">
              ARRIVE WITH CONFIDENCE.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-smartTextSecondary max-w-2xl mx-auto font-sans leading-relaxed">
            SmartPark AI orchestrates live telemetry streams, explainable scoring vectors, and real-time reservation locks to remove the friction of urban parking. Know before you go.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link href="/home" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8 shadow-lg shadow-signature/10">
                  Open Platform <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8 shadow-lg shadow-signature/10">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/map" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                    Explore Live Map
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'PLATFORM STATUS', val: 'ONLINE', valColor: 'text-available', extra: 'All systems operational' },
            { label: 'SIMULATED TELEMETRY', val: `${simulatedEventsCount} pings`, valColor: 'text-signature', extra: 'Live event stream' },
            { label: 'RECOMMENDER ETA', val: '18 ms', valColor: 'text-aiBlue', extra: 'FastAPI latency average' },
            { label: 'REAL-TIME CHANNELS', val: `${liveOccupancy}% capacity`, valColor: 'text-white', extra: 'Dynamic SSE telemetry' }
          ].map((m, i) => (
            <Card key={i} variant="elevated" className="text-left p-4 space-y-1">
              <span className="text-[9px] font-mono text-smartTextSecondary block tracking-widest">{m.label}</span>
              <span className={`text-base font-display font-bold uppercase tracking-wider block ${m.valColor}`}>{m.val}</span>
              <span className="text-[9px] font-mono text-smartTextSecondary/60 block">{m.extra}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 3: INTERACTIVE TELEMETRY & LIVE FLOOR GRID
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder" id="telemetry-view">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-signature/10 border border-signature/30 text-signature text-[9px] font-mono uppercase tracking-widest">
              Live Sensor Telemetry Simulation
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
              IoT SENSORS FEEDING INDIVIDUAL BAY LOGS.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              We deploy physical ultrasonic sensors communicating changes instantly. When users book, reservation locks engage, protecting the slot from being overwritten by telemetry simulator loops. Click a slot in the map preview to inspect its telemetry variables.
            </p>

            {/* Simulated Live Stream Feed Console */}
            <Card variant="default" className="font-mono text-xs p-4 space-y-3 bg-black/60 border-smartBorder/80">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-2">
                <span className="text-[10px] text-signature flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full bg-signature ${sensorHeartbeat ? 'animate-ping' : ''}`} />
                  TELEMETRY_PIPELINE: ONLINE
                </span>
                <span className="text-[9px] text-smartTextSecondary">PORT 8001/telemetry</span>
              </div>
              <div className="space-y-1.5 text-[10px] text-smartTextSecondary overflow-y-auto max-h-[140px] scrollbar-none text-left">
                <p className="text-white">{"[SYSTEM] Initialized telemetry listener socket..."}</p>
                <p>{"[INGEST] INCOMING SLOT STATUS: "}<span className="text-available">{"S-2 -> AVAILABLE"}</span>{" (RSSI: -65dBm)"}</p>
                <p>{"[INGEST] INCOMING SLOT STATUS: "}<span className="text-occupied">{"S-1 -> OCCUPIED"}</span>{" (RSSI: -72dBm)"}</p>
                <p className="text-limited">{"[PROTECTION] Lock checked on S-4: Reservation active. Telemetry change ignored."}</p>
                <p>{"[INGEST] BATCH UPLOAD: Completed sensor poll across 6 bays. (Ready)"}</p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card variant="elevated" className="p-6 border-signature/10 bg-smartSurface/70 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/60 pb-4 mb-6">
                <div className="text-left">
                  <span className="text-[9px] font-mono text-signature tracking-widest block uppercase">DECK LEVEL B1</span>
                  <h3 className="text-sm font-display font-bold uppercase text-white">Interactive Facility Operations preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-smartTextSecondary">TELEMETRY POLLING:</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-smartBg border border-smartBorder text-white rounded flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 text-signature animate-spin" />
                    4s INGEST
                  </span>
                </div>
              </div>

              {/* Graphical Layout representing actual parking bays */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {scoredSlots.map((slot) => {
                  const isSelected = selectedDemoSlot === slot.id;
                  let borderClass = 'border-smartBorder';
                  let badgeText = slot.status;
                  let badgeColor = 'bg-smartBg text-smartTextSecondary';

                  if (slot.status === 'AVAILABLE') {
                    borderClass = isSelected ? 'border-available bg-available/5' : 'border-available/40 hover:border-available';
                    badgeColor = 'bg-available/10 border-available/30 text-available';
                  } else if (slot.status === 'OCCUPIED') {
                    borderClass = isSelected ? 'border-occupied bg-occupied/5' : 'border-occupied/20 hover:border-occupied/40';
                    badgeColor = 'bg-occupied/10 border-occupied/30 text-occupied';
                  } else if (slot.status === 'LIMITED') {
                    borderClass = isSelected ? 'border-limited bg-limited/5' : 'border-limited/40 hover:border-limited';
                    badgeColor = 'bg-limited/10 border-limited/30 text-limited';
                  } else if (slot.status === 'RESERVED') {
                    borderClass = isSelected ? 'border-signature bg-signature/5' : 'border-signature/40 hover:border-signature';
                    badgeColor = 'bg-signature/10 border-signature/30 text-signature';
                  }

                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedDemoSlot(slot.id)}
                      className={`p-4 rounded border text-left cursor-pointer transition-all duration-200 ${borderClass} ${
                        isSelected ? 'ring-1 ring-signature/20 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-smartTextSecondary">BAY {slot.id}</span>
                        {slot.ev && <Zap className="h-3 w-3 text-signature" />}
                      </div>
                      <div className="text-xs font-display font-bold text-white mt-1 uppercase tracking-wide">
                        {slot.slotType.split(' ')[0]}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${badgeColor}`}>{badgeText}</span>
                        <span className="text-[9px] font-mono text-smartTextSecondary">₹{slot.price}/hr</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Bay Telemetry Specs */}
              <div className="p-4 bg-smartBg/70 rounded border border-smartBorder grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-left">
                <div>
                  <span className="text-smartTextSecondary text-[9px] block">BAY UUID</span>
                  <span className="text-white block font-bold mt-0.5">{`BAY-09-${currentSelectedSlotData.id}`}</span>
                </div>
                <div>
                  <span className="text-smartTextSecondary text-[9px] block">SENSOR SIGNAL</span>
                  <span className="text-white block font-bold mt-0.5">{currentSelectedSlotData.signalStrength}</span>
                </div>
                <div>
                  <span className="text-smartTextSecondary text-[9px] block">RESERVE LOCK</span>
                  <span className={`block font-bold mt-0.5 ${currentSelectedSlotData.lockActive ? 'text-signature' : 'text-smartTextSecondary'}`}>
                    {currentSelectedSlotData.lockActive ? 'ENGAGED' : 'INACTIVE'}
                  </span>
                </div>
                <div>
                  <span className="text-smartTextSecondary text-[9px] block">SENSOR HEALTH</span>
                  <span className="text-available block font-bold mt-0.5">{currentSelectedSlotData.sensorHealth}</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 4: EXPLAINABLE AI SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder" id="ai-scoring">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7">
            <Card variant="elevated" className="p-6 border-signature/10 bg-smartSurface/70 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3 mb-6">
                <span className="text-[9px] font-mono text-smartTextSecondary tracking-widest uppercase">FASTAPI RECOMENDER INTERACTIVE DEMO</span>
                <span className="text-[9px] font-mono text-signature uppercase px-2 py-0.5 rounded bg-signature/10 border border-signature/30">MATCH PREDICTIONS</span>
              </div>

              {/* Simulation Pref Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white">EV COMPATIBLE</span>
                    <span className="text-[9px] font-mono text-signature font-bold">{prefEvPriority ? 'REQUIRED' : 'IGNORE'}</span>
                  </div>
                  <button
                    onClick={() => setPrefEvPriority(!prefEvPriority)}
                    className={`w-full py-1.5 rounded font-mono text-xs uppercase font-bold border transition-colors ${
                      prefEvPriority ? 'bg-signature/10 border-signature text-signature' : 'bg-smartBg border-smartBorder text-smartTextSecondary hover:text-white'
                    }`}
                  >
                    Toggle EV Needs
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white">MAX PRICE CAP</span>
                    <span className="text-[9px] font-mono text-signature font-bold">₹{prefBudgetLimit}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="120"
                    step="10"
                    value={prefBudgetLimit}
                    onChange={(e) => setPrefBudgetLimit(Number(e.target.value))}
                    className="w-full accent-signature h-1 bg-smartBg rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white">WALK LIMIT</span>
                    <span className="text-[9px] font-mono text-signature font-bold">{prefDistanceLimit} meters</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="10"
                    value={prefDistanceLimit}
                    onChange={(e) => setPrefDistanceLimit(Number(e.target.value))}
                    className="w-full accent-signature h-1 bg-smartBg rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Scored List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-smartTextSecondary uppercase tracking-widest mb-2 text-left">Calculated Recommendation Matrix</h4>
                {scoredSlots.map((slot) => {
                  const isTop = topRecommendedSlot.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className={`p-3 rounded border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                        slot.status === 'OCCUPIED'
                          ? 'bg-smartBg/30 border-smartBorder/40 opacity-40'
                          : isTop
                          ? 'bg-signature/5 border-signature'
                          : 'bg-smartBg/60 border-smartBorder/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          slot.status === 'OCCUPIED' ? 'bg-smartBorder text-smartTextSecondary' : isTop ? 'bg-signature text-smartBg' : 'bg-smartElevated text-white'
                        }`}>
                          {slot.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white uppercase">{slot.slotType}</span>
                            {slot.ev && <Badge variant="signature" className="text-[8px] px-1 py-0 h-auto">EV</Badge>}
                          </div>
                          <div className="text-[10px] text-smartTextSecondary flex items-center gap-2 mt-0.5">
                            <span>₹{slot.price}/hr</span>
                            <span>•</span>
                            <span>{slot.distance} meters away</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {slot.status === 'OCCUPIED' ? (
                          <span className="text-[10px] text-occupied font-bold">OCCUPIED</span>
                        ) : (
                          <>
                            <div className="text-right">
                              <span className="text-[9px] text-smartTextSecondary block">AI MATCH</span>
                              <span className={`font-bold block text-sm ${isTop ? 'text-signature' : 'text-white'}`}>{slot.aiScore}%</span>
                            </div>
                            {isTop && (
                              <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-signature/10 border border-signature/30 text-signature">
                                BEST MATCH
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aiBlue/10 border border-aiBlue/30 text-aiBlue text-[9px] font-mono uppercase tracking-widest">
              Explainable AI Match Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
              DETERMINISTIC RECOMMENDATIONS.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              SmartPark AI's matching microservice evaluates parking facilities and individual bays. We reject black-box algorithms in favor of deterministic preference vector matches. The system generates explanatory tags that explain exactly why a space fits the driver's criteria.
            </p>
            <div className="p-4 bg-smartSurface border border-smartBorder/80 rounded-smart space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-signature" />
                <span className="text-[10px] text-white uppercase tracking-widest font-bold">Explanatory Tags Preview</span>
              </div>
              <ul className="space-y-1 text-[11px] text-smartTextSecondary">
                <li className="flex items-center gap-2"><span className="text-signature">✔</span> EV Charging Matches Vehicle Spec</li>
                <li className="flex items-center gap-2"><span className="text-signature">✔</span> Distance constraints under threshold limit</li>
                <li className="flex items-center gap-2"><span className="text-signature">✔</span> Rate meets configured budget profile</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 5: SYSTEM ARCHITECTURE CREDIBILITY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder" id="architecture">
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aiBlue/10 border border-aiBlue/30 text-aiBlue text-[9px] font-mono uppercase tracking-widest">
            Engineering Blueprint
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
            PRODUCTION-GRADE PLATFORM BLUEPRINT
          </h2>
          <p className="text-xs sm:text-sm text-smartTextSecondary">
            SmartPark AI is designed as a distributed, high-performance architecture ensuring telemetry ingestion doesn't block driver reservation transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <Card variant="default" className="p-6 space-y-4">
            <div className="h-8 w-8 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
              <Server className="h-4 w-4 text-signature" />
            </div>
            <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider">Fastify 5 API Gateway</h4>
            <p className="text-xs text-smartTextSecondary leading-relaxed font-sans">
              Processes authentication, booking state mutations, and telemetry feeds. Secured via JSON Web Tokens and global rate limiting middlewares.
            </p>
            <div className="text-[10px] font-mono text-smartTextSecondary/60 pt-2 border-t border-smartBorder">
              NodeJS / fastify-rate-limit / SSE Broadcast
            </div>
          </Card>

          <Card variant="default" className="p-6 space-y-4">
            <div className="h-8 w-8 rounded-full bg-aiBlue/10 border border-aiBlue/30 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-aiBlue" />
            </div>
            <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider">FastAPI scoring Engine</h4>
            <p className="text-xs text-smartTextSecondary leading-relaxed font-sans">
              Deterministic rule scoring microservice written in Python. Ranks active slots using driver profiles and telemetry distance matrices.
            </p>
            <div className="text-[10px] font-mono text-smartTextSecondary/60 pt-2 border-t border-smartBorder">
              Python 3.9 / FastAPI / Pydantic / Uvicorn
            </div>
          </Card>

          <Card variant="default" className="p-6 space-y-4">
            <div className="h-8 w-8 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
              <Database className="h-4 w-4 text-signature" />
            </div>
            <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider">Supabase & Prisma ORM</h4>
            <p className="text-xs text-smartTextSecondary leading-relaxed font-sans">
              PostgreSQL database layer managing facilities, reservation logs, and telemetry histories. Indexed schema maps transaction locks cleanly.
            </p>
            <div className="text-[10px] font-mono text-smartTextSecondary/60 pt-2 border-t border-smartBorder">
              Prisma Client / Supabase Cloud PG / Cascade Locks
            </div>
          </Card>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 6: PLATFORM FEATURES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder" id="features">
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
            COMPLETE CAPABILITIES MATRIX
          </h2>
          <p className="text-xs sm:text-sm text-smartTextSecondary">
            Everything needed to manage urban parking facilities and optimize driver journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { title: 'Telemetry Streams', desc: 'Real-time telemetry streams from ultrasonic parking sensors.' },
            { title: 'Predictive Intelligence', desc: 'Forecast occupancy demand vectors up to 60 minutes out.' },
            { title: 'Interactive Map Layouts', desc: 'Sleek floor-by-floor 2D SVG grids indicating active bay statuses.' },
            { title: 'Reservation Guard', desc: 'Booked slots ignore incoming telemetry changes to prevent double booking.' },
            { title: 'Explainable AI Match', desc: 'Scoring percentages output clear justification feedback tags.' },
            { title: 'Operator Dashboards', desc: 'Monitor peak occupancy rates, active facility capacities, and telemetry logs.' },
            { title: 'Secure REST & SSE', desc: 'Rate-limited, JWT-enforced JSON API routes alongside SSE broadcasters.' },
            { title: 'Vehicle Profiles', desc: 'Track electric vehicles and automatically route to charge bays.' },
          ].map((item, i) => (
            <Card key={i} variant="default" className="p-5 space-y-3">
              <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white">{item.title}</h4>
              <p className="text-xs text-smartTextSecondary leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 7: FINAL CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-smartBorder">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
            PARK WITH PREDICTIVE INTELLIGENCE NOW
          </h2>
          <p className="text-sm text-smartTextSecondary max-w-md mx-auto">
            Create an account, register your vehicle constraints, and find the perfect parking bay before you arrive.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link href="/home" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8 shadow-lg shadow-signature/10">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8 shadow-lg shadow-signature/10">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 8: FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-smartSurface border-t border-smartBorder py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-smartBorder/40 pb-12 mb-8">
          <div className="col-span-2 space-y-4 text-left">
            <span className="font-display text-sm font-bold uppercase tracking-wider text-smartTextPrimary">
              SmartPark<span className="text-signature">.</span>AI
            </span>
            <p className="text-xs text-smartTextSecondary max-w-sm">
              SmartPark AI 2.0. Intelligent predictive mobility and live telemetry dashboard system.
            </p>
          </div>

          <div className="text-left">
            <h5 className="text-[10px] font-mono uppercase tracking-widest text-white mb-3">PRODUCT</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/search" className="text-smartTextSecondary hover:text-signature">Search</Link></li>
              <li><Link href="/map" className="text-smartTextSecondary hover:text-signature">Live Map</Link></li>
              <li><Link href="/intelligence" className="text-smartTextSecondary hover:text-signature">Intelligence</Link></li>
              <li><Link href="/bookings" className="text-smartTextSecondary hover:text-signature">Reservations</Link></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="text-[10px] font-mono uppercase tracking-widest text-white mb-3">ACCOUNT</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/login" className="text-smartTextSecondary hover:text-signature">Login</Link></li>
              <li><Link href="/signup" className="text-smartTextSecondary hover:text-signature">Sign Up</Link></li>
              <li><Link href="/profile" className="text-smartTextSecondary hover:text-signature">Profile</Link></li>
              <li><Link href="/bookings" className="text-smartTextSecondary hover:text-signature">Bookings</Link></li>
            </ul>
          </div>

          <div className="text-left">
            <h5 className="text-[10px] font-mono uppercase tracking-widest text-white mb-3">OPERATIONS</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/operator" className="text-smartTextSecondary hover:text-signature">Operator</Link></li>
              <li><Link href="/support" className="text-smartTextSecondary hover:text-signature">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-smartTextSecondary/60">
          <span>© SmartPark AI 2.0 • Prototype / Intelligence Preview</span>
          <span>Next.js App Router v14.2.5</span>
        </div>
      </footer>
    </div>
  );
}
