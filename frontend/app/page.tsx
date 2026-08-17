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
  DollarSign
} from 'lucide-react';
import { authService } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulated live telemetry state
  const [liveOccupancy, setLiveOccupancy] = useState(72);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(authService.isAuthenticated());

    const interval = setInterval(() => {
      setLiveOccupancy((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next > 95 ? 90 : next < 45 ? 50 : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Demo interactive bay slot selector
  const [selectedDemoSlot, setSelectedDemoSlot] = useState('S-2');
  const demoSlots = [
    { id: 'S-1', status: 'OCCUPIED' },
    { id: 'S-2', status: 'AVAILABLE' },
    { id: 'S-3', status: 'LIMITED' },
    { id: 'S-4', status: 'RESERVED' },
    { id: 'S-5', status: 'AVAILABLE' },
    { id: 'S-6', status: 'OCCUPIED' },
  ];

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary font-sans selection:bg-signature selection:text-smartBg relative overflow-x-hidden">
      {/* Background Spatial Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#181D21_1px,transparent_1px)] [background-size:32px_32px] opacity-35 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-signature/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[1200px] right-0 w-[500px] h-[500px] bg-aiBlue/5 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* ─────────────────────────────────────────────────────────────
         SECTION 1: PREMIUM NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <header className="mx-auto max-w-5xl w-full bg-smartBg/75 backdrop-blur-xl border border-smartBorder rounded-full pointer-events-auto shadow-2xl h-12 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group focus:outline-none">
            <div className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
            </div>
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-smartTextPrimary group-hover:text-white transition-colors">
              SmartPark<span className="text-signature">.</span>AI
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Public Navigation">
            {['Product', 'Intelligence', 'How It Works', 'Features'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-smartTextSecondary hover:text-smartTextPrimary px-3 py-1.5 rounded transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {mounted && isAuthenticated ? (
              <Link href="/home">
                <Button variant="primary" size="sm" className="h-8 text-[10px] uppercase font-mono px-4 shadow-lg shadow-signature/10">
                  Open SmartPark
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
                    Get Started
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

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative ml-auto w-4/5 max-w-sm h-full bg-smartBg border-l border-smartBorder flex flex-col justify-between p-6 z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-smartBorder/45 pb-4">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">SmartPark.AI</span>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="flex flex-col gap-3">
                  {['Product', 'Intelligence', 'How It Works', 'Features'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-sans font-bold uppercase tracking-wider py-2 px-3 text-smartTextSecondary hover:text-smartTextPrimary"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-t border-smartBorder/40 pt-6">
                {isAuthenticated ? (
                  <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" size="sm" className="w-full h-9 text-[10px] uppercase font-mono">
                      Open SmartPark
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
                        Get Started
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
         SECTION 2: HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center" id="product">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signature/10 border border-signature/30">
            <Sparkles className="h-3 w-3 text-signature" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-signature">
              Predictive Mobility Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
            Park Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-signature via-signature to-white">
              Arrive with Confidence.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-smartTextSecondary max-w-2xl mx-auto font-sans leading-relaxed">
            SmartPark AI combines live parking availability telemetry, predictive intelligence, and personalized recommendations to help drivers locate and reserve the perfect parking spot before they arrive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link href="/home" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/home" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                    Explore Platform
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Spatial Hero Visualization */}
        <div className="mt-12 max-w-5xl mx-auto relative rounded-smart bg-gradient-to-b from-smartSurface to-smartBg border border-smartBorder/80 p-1 sm:p-2 shadow-2xl">
          <div className="rounded-smart bg-smartBg p-4 sm:p-6 text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-smartBorder/55 pb-4 mb-6 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-signature block">AI TELEMETRY VIEW</span>
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Live System Operations Preview</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-smartTextSecondary">FLOW RATE:</span> <span className="text-signature">998 vehicles/hr</span>
                </div>
                <div>
                  <span className="text-smartTextSecondary">OCCUPANCY:</span> <span className="text-aiBlue">{liveOccupancy}%</span>
                </div>
              </div>
            </div>

            {/* Virtual Grid Occupancy Graphic */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {demoSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedDemoSlot(slot.id)}
                  className={`p-4 rounded border font-mono text-center cursor-pointer transition-all duration-200 ${
                    selectedDemoSlot === slot.id
                      ? 'bg-signature/10 border-signature text-signature shadow-md'
                      : slot.status === 'AVAILABLE'
                      ? 'bg-smartSurface border-available/30 hover:border-available text-available'
                      : slot.status === 'OCCUPIED'
                      ? 'bg-smartSurface/50 border-smartBorder text-smartTextSecondary/40 cursor-not-allowed'
                      : slot.status === 'LIMITED'
                      ? 'bg-smartSurface border-limited/30 hover:border-limited text-limited'
                      : 'bg-smartSurface border-occupied/30 hover:border-occupied text-occupied'
                  }`}
                >
                  <div className="text-[10px] text-smartTextSecondary">BAY {slot.id}</div>
                  <div className="text-xs font-bold mt-1">{slot.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 3: LIVE PARKING INTELLIGENCE VISUAL
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45" id="intelligence">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aiBlue/10 border border-aiBlue/30 text-aiBlue text-[10px] font-mono uppercase tracking-widest">
              Live Intelligence Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-tight">
              Real-time Predictions.<br />
              Zero Search Effort.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              SmartPark constantly processes incoming telemetry to build high-accuracy demand vectors, walking durations, and rate optimizations.
            </p>
            <div className="space-y-3 font-mono text-xs text-smartTextSecondary">
              <div className="flex items-center justify-between border-b border-smartBorder/40 pb-2">
                <span>CONFIDENCE FACTOR</span>
                <span className="text-signature">98.4%</span>
              </div>
              <div className="flex items-center justify-between border-b border-smartBorder/40 pb-2">
                <span>ACTIVE BAYS</span>
                <span className="text-white">24 available</span>
              </div>
              <div className="flex items-center justify-between border-b border-smartBorder/40 pb-2">
                <span>WALKING ETA</span>
                <span className="text-white">2 mins</span>
              </div>
              <div className="flex items-center justify-between border-b border-smartBorder/40 pb-2">
                <span>HOURLY RATE</span>
                <span className="text-signature">₹80/hr</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card variant="elevated" className="border-signature/20 bg-smartSurface/80 backdrop-blur-md p-6">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-smartTextSecondary">AI Match Recommendation</span>
                <span className="text-[10px] font-mono text-signature uppercase px-2 py-0.5 rounded bg-signature/10 border border-signature/30">BEST MATCH</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold uppercase tracking-wider text-white">Cyber City Hub</h3>
                  <p className="text-xs text-smartTextSecondary">Tower C Entrance • 420m away</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-smartBg p-3 rounded border border-smartBorder">
                    <span className="text-[9px] text-smartTextSecondary block">AVAILABILITY</span>
                    <span className="text-xs font-bold font-mono text-available block mt-1">HIGH</span>
                  </div>
                  <div className="bg-smartBg p-3 rounded border border-smartBorder">
                    <span className="text-[9px] text-smartTextSecondary block">WALK TIME</span>
                    <span className="text-xs font-bold font-mono text-white block mt-1">2 MIN</span>
                  </div>
                  <div className="bg-smartBg p-3 rounded border border-smartBorder">
                    <span className="text-[9px] text-smartTextSecondary block">HOURLY PRICE</span>
                    <span className="text-xs font-bold font-mono text-signature block mt-1">₹80</span>
                  </div>
                </div>

                <div className="bg-smartBg/60 rounded border border-smartBorder/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-4 w-4 text-signature" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white">AI PREDICTIVE DISPATCH</span>
                  </div>
                  <p className="text-xs text-smartTextSecondary leading-relaxed">
                    "Occupancy is forecast to remain under 80% for the next 45 minutes. Recommendation confidence matches criteria vector."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 4: PROBLEM -> SOLUTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45">
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white">
            REDEFINING MOBILITY LOGISTICS
          </h2>
          <p className="text-xs sm:text-sm text-smartTextSecondary">
            The friction of traditional parking spaces vs the fluid intelligence of SmartPark AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="default" className="border-occupied/20 bg-smartSurface/50 p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-occupied border-b border-occupied/20 pb-3">
              TRADITIONAL PARKING
            </h3>
            <ul className="space-y-4 text-sm text-smartTextSecondary font-sans">
              <li className="flex items-start gap-3">
                <span className="text-occupied mt-1">✕</span>
                <span>Uncertain availability forces manual searching upon arrival</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-occupied mt-1">✕</span>
                <span>Unnecessary cruising increases traffic emission levels</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-occupied mt-1">✕</span>
                <span>Wasted minutes looking for slots under severe time pressure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-occupied mt-1">✕</span>
                <span>Unpredictable parking rates and surprise demand spikes</span>
              </li>
            </ul>
          </Card>

          <Card variant="default" className="border-signature/20 bg-smartSurface/55 p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-signature border-b border-signature/20 pb-3">
              SMARTPARK AI PLATFORM
            </h3>
            <ul className="space-y-4 text-sm text-smartTextSecondary font-sans">
              <li className="flex items-start gap-3">
                <span className="text-signature mt-1">✓</span>
                <span>Live availability streams guide you straight to empty slots</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signature mt-1">✓</span>
                <span>Predictive algorithms calculate availability 60 minutes out</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signature mt-1">✓</span>
                <span>Personalized ranking aligns with budget, walking preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signature mt-1">✓</span>
                <span>Transparent billing and advance reservation options</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 5: HOW SMARTPARK WORKS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45" id="how-it-works">
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white">
            HOW IT WORKS
          </h2>
          <p className="text-xs sm:text-sm text-smartTextSecondary">
            Four simple phases from location input to seamless parking arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {[
            { step: '01', title: 'SEARCH', desc: "Enter your destination and tell SmartPark where you're heading." },
            { step: '02', title: 'PREDICT', desc: "Our engine forecasts occupancy levels based on historic telemetry." },
            { step: '03', title: 'RECOMMEND', desc: "SmartPark highlights and ranks the most optimal locations for your arrival." },
            { step: '04', title: 'PARK', desc: "Follow directions or pre-book slots to secure your space before arriving." },
          ].map((item) => (
            <div key={item.step} className="space-y-4 relative">
              <div className="font-mono text-3xl font-bold text-signature/20">{item.step}</div>
              <h4 className="text-sm font-display font-bold uppercase tracking-wider text-white">{item.title}</h4>
              <p className="text-xs text-smartTextSecondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 6: SMARTPARK INTELLIGENCE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-signature/10 border border-signature/30">
              <Cpu className="h-3.5 w-3.5 text-signature" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-signature">
                Occupancy Forecasting
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
              PARKING THAT THINKS AHEAD.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              By monitoring incoming telemetry streams, occupancy shifts, price sensitivity, and distance factors, SmartPark provides optimal recommendations that align with your schedules.
            </p>
            <div>
              <Link href="/intelligence">
                <Button variant="secondary" size="md" className="text-xs uppercase font-mono">
                  Explore Intelligence <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <Card variant="elevated" className="border-smartBorder/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase">MATCH SUMMARY</span>
                <span className="text-[10px] font-mono text-available">STABLE MATCH</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="border border-smartBorder/60 p-3 rounded">
                  <span className="text-smartTextSecondary block mb-1">SCORE</span>
                  <span className="text-sm font-bold text-signature">98.4%</span>
                </div>
                <div className="border border-smartBorder/60 p-3 rounded">
                  <span className="text-smartTextSecondary block mb-1">OCCUPANCY</span>
                  <span className="text-sm font-bold text-available">HIGH AVAILABILITY</span>
                </div>
                <div className="border border-smartBorder/60 p-3 rounded">
                  <span className="text-smartTextSecondary block mb-1">WALK DISTANCE</span>
                  <span className="text-sm font-bold text-white">2 MINS</span>
                </div>
                <div className="border border-smartBorder/60 p-3 rounded">
                  <span className="text-smartTextSecondary block mb-1">HOURLY COST</span>
                  <span className="text-sm font-bold text-signature">₹80/hr</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 7: LIVE MAP EXPERIENCE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 rounded-smart border border-smartBorder/60 bg-smartSurface/50 p-4 relative overflow-hidden">
            {/* Mock Map Preview Graphics */}
            <div className="h-64 rounded bg-smartBg border border-smartBorder/80 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#1E2328_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
              {/* Mock map elements */}
              <div className="absolute top-1/4 left-1/4 h-8 w-20 bg-smartSurface/80 border border-smartBorder rounded flex items-center justify-center text-[9px] font-mono">
                METRO GARAGE
              </div>
              <div className="absolute bottom-1/3 right-1/4 h-8 w-24 bg-signature/10 border border-signature/40 rounded flex items-center justify-center text-[9px] font-mono text-signature">
                CYBER CITY HUB
              </div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-signature/30 border border-signature flex items-center justify-center animate-ping" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-signature border border-white" />
            </div>

            {/* Map Filters Overlay mock */}
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-none font-mono text-[9px]">
              <span className="px-2.5 py-1 rounded bg-available/10 border border-available/30 text-available uppercase">AVAILABLE</span>
              <span className="px-2.5 py-1 rounded bg-limited/10 border border-limited/30 text-limited uppercase">LIMITED</span>
              <span className="px-2.5 py-1 rounded bg-occupied/10 border border-occupied/30 text-occupied uppercase">OCCUPIED</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aiBlue/10 border border-aiBlue/30 text-aiBlue text-[10px] font-mono uppercase tracking-widest">
              Live Map Preview
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-tight">
              SEE THE PARKING LANDSCAPE BEFORE YOU ARRIVE.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              Navigate with confidence. Open our high-precision live map view to instantly explore occupancies, rate indices, and floor capacities across your city.
            </p>
            <div>
              <Link href="/map">
                <Button variant="secondary" size="md" className="text-xs uppercase font-mono">
                  Explore Live Map <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 8: PERSONALIZED PARKING
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-signature/10 border border-signature/30">
              <Sliders className="h-3.5 w-3.5 text-signature" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-signature">
                Driver Personalization
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
              PERSONALIZED PARKING.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              Every driver is unique. Tell SmartPark your preferences, and watch recommendations automatically re-rank based on distance bounds, EV charging slots, and budget priorities.
            </p>
            <div>
              <Link href="/signup">
                <Button variant="secondary" size="md" className="text-xs uppercase font-mono">
                  Create Your Profile <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <Card variant="elevated" className="border-smartBorder/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase">User Preference Vector</span>
                <span className="text-[10px] font-mono text-signature">OPTIMIZED</span>
              </div>
              <div className="space-y-4 font-mono text-xs text-smartTextSecondary">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>WALKING DISTANCE</span>
                    <span className="text-white">HIGH PRIORITY</span>
                  </div>
                  <div className="h-1.5 w-full bg-smartBg rounded overflow-hidden">
                    <div className="h-full bg-signature" style={{ width: '90%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>EV CHARGING PREFERENCE</span>
                    <span className="text-white">HIGH PRIORITY</span>
                  </div>
                  <div className="h-1.5 w-full bg-smartBg rounded overflow-hidden">
                    <div className="h-full bg-signature" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>COVERED PARKING</span>
                    <span className="text-white">HIGH PRIORITY</span>
                  </div>
                  <div className="h-1.5 w-full bg-smartBg rounded overflow-hidden">
                    <div className="h-full bg-signature" style={{ width: '80%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>PRICE SENSITIVITY</span>
                    <span className="text-white">MEDIUM</span>
                  </div>
                  <div className="h-1.5 w-full bg-smartBg rounded overflow-hidden">
                    <div className="h-full bg-signature" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 9: FOR PARKING OPERATORS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <Card variant="default" className="border-smartBorder/60 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-signature" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white">OPERATOR ANALYTICS ENGINE</span>
                </div>
                <span className="text-[10px] font-mono text-signature">PREVIEW CONSOLE</span>
              </div>

              <div className="grid grid-cols-3 gap-4 font-mono text-center">
                <div className="bg-smartBg/60 p-3 rounded border border-smartBorder">
                  <span className="text-[9px] text-smartTextSecondary block">MARGIN TREND</span>
                  <span className="text-xs font-bold text-available block mt-1">+14.2%</span>
                </div>
                <div className="bg-smartBg/60 p-3 rounded border border-smartBorder">
                  <span className="text-[9px] text-smartTextSecondary block">REVENUE INDEX</span>
                  <span className="text-xs font-bold text-signature block mt-1">₹42.8k</span>
                </div>
                <div className="bg-smartBg/60 p-3 rounded border border-smartBorder">
                  <span className="text-[9px] text-smartTextSecondary block">ACTIVE SPOTS</span>
                  <span className="text-xs font-bold text-white block mt-1">1,248</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aiBlue/10 border border-aiBlue/30 text-aiBlue text-[10px] font-mono uppercase tracking-widest">
              Operator Panel Preview
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-tight">
              ONE INTELLIGENT CONTROL CENTER FOR OPERATIONS.
            </h2>
            <p className="text-sm text-smartTextSecondary leading-relaxed">
              Empower your facility management. Monitor live occupancies, track peak pricing margins, manage operational alerts, and utilize AI insights to maximize space yields.
            </p>
            <div>
              <Link href="/operator">
                <Button variant="secondary" size="md" className="text-xs uppercase font-mono">
                  Explore Operator Console <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 10: PRODUCT CAPABILITIES GRID
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-smartBorder/45" id="features">
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white">
            PLATFORM CAPABILITIES
          </h2>
          <p className="text-xs sm:text-sm text-smartTextSecondary">
            The full suite of intelligent parking features in one unified ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'LIVE AVAILABILITY', desc: 'Real-time telemetry streams from high-accuracy parking sensors.' },
            { title: 'PREDICTIVE INTELLIGENCE', desc: 'Forecast occupancy demand vectors up to 60 minutes out.' },
            { title: 'SMART SEARCH', desc: 'Find spots based on landmark entrances and walk times.' },
            { title: 'DIGITAL PASSES', desc: 'Instant QR credentials and directions sent straight to your device.' },
            { title: 'PERSONALIZED MATCH', desc: 'Optimal spot recommendations aligned to your preference priorities.' },
            { title: 'OPERATOR ANALYTICS', desc: 'Revenue forecasting, pricing optimization, and yield indicators.' },
            { title: 'TELEMETRY NOTIFICATIONS', desc: 'Receive real-time alerts regarding reservations and slots.' },
            { title: 'SMART RESERVATIONS', desc: 'Secure parking reservations before starting your journey.' },
          ].map((item) => (
            <Card key={item.title} variant="default" className="border-smartBorder/80 p-5 space-y-3">
              <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white">{item.title}</h4>
              <p className="text-xs text-smartTextSecondary leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 11: FINAL CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-smartBorder/45">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
            YOUR NEXT PARKING SPOT<br />
            SHOULDN'T BE A GUESS.
          </h2>
          <p className="text-sm text-smartTextSecondary max-w-md mx-auto">
            Find it faster. Choose smarter. Arrive with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link href="/home" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                  Open SmartPark
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs uppercase font-mono px-8">
                    Get Started Now
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
         SECTION 12: FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-smartSurface border-t border-smartBorder/75 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-smartBorder/40 pb-12 mb-8">
          <div className="col-span-2 space-y-4">
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-smartTextPrimary">
              SmartPark<span className="text-signature">.</span>AI
            </span>
            <p className="text-xs text-smartTextSecondary max-w-sm">
              SmartPark AI 2.0. Intelligent predictive mobility and live telemetry dashboard system.
            </p>
          </div>

          <div>
            <h5 className="text-[10px] font-mono uppercase tracking-widest text-white mb-3">PRODUCT</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/search" className="text-smartTextSecondary hover:text-signature">Search</Link></li>
              <li><Link href="/map" className="text-smartTextSecondary hover:text-signature">Live Map</Link></li>
              <li><Link href="/intelligence" className="text-smartTextSecondary hover:text-signature">Intelligence</Link></li>
              <li><Link href="/bookings" className="text-smartTextSecondary hover:text-signature">Reservations</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-mono uppercase tracking-widest text-white mb-3">ACCOUNT</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link href="/login" className="text-smartTextSecondary hover:text-signature">Login</Link></li>
              <li><Link href="/signup" className="text-smartTextSecondary hover:text-signature">Sign Up</Link></li>
              <li><Link href="/profile" className="text-smartTextSecondary hover:text-signature">Profile</Link></li>
              <li><Link href="/bookings" className="text-smartTextSecondary hover:text-signature">Bookings</Link></li>
            </ul>
          </div>

          <div>
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
