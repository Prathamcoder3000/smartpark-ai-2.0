'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MetricCard } from '../components/ui/MetricCard';
import { ParkingSlot } from '../components/ui/ParkingSlot';
import { AIInsight } from '../components/ui/AIInsight';
import { Sparkles, MapPin, Gauge, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  const [demoSlotState, setDemoSlotState] = React.useState<'AVAILABLE' | 'SELECTED'>('AVAILABLE');

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-12 selection:bg-signature selection:text-smartBg relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 spatial-grid-dots opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-signature/5 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Floating navigation capsule */}
      <Header />

      {/* Hero / Visual Centerpiece Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-20 relative z-10">
        
        {/* Brand Tagline Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="signature" className="px-3 py-1 text-[11px] font-mono tracking-widest bg-signature/5 border-signature/20">
            Now Live: Phase 2 Visual Foundation
          </Badge>
        </div>

        {/* Hero Title and Positioning */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
            Parking, <span className="text-signature">before</span> you arrive.
          </h1>
          <p className="font-sans text-sm sm:text-base lg:text-lg text-smartTextSecondary max-w-2xl mx-auto mt-6 leading-relaxed">
            SmartPark AI is a premium, spatial mobility intelligence platform that predicts, manages, and secures urban parking bays in real time before your wheels hit the pavement.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/design-system">
              <Button variant="primary" size="lg" className="text-xs uppercase tracking-wider font-semibold">
                Explore Design Showcase
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg" className="text-xs uppercase tracking-wider font-semibold">
                Developer Wiki
              </Button>
            </a>
          </div>
        </div>

        {/* Core Centerpiece Layout - Two-Column Split Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-24">
          
          {/* Column Left: Visual Centerpiece (Interactive Parking Bay Layout) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-smartSurface/70 border border-smartBorder rounded-smart-lg p-6 sm:p-8 spatial-grid-lines relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Cpu className="h-48 w-48 text-smartTextSecondary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature">
                    Live Platform Simulation
                  </span>
                  <h2 className="text-sm font-semibold font-display text-smartTextPrimary uppercase tracking-wider mt-0.5">
                    Spatial Facility Grid
                  </h2>
                </div>
                <StatusBadge status="AVAILABLE" />
              </div>

              <p className="text-xs text-smartTextSecondary max-w-md leading-relaxed mb-6 font-sans">
                Below is a live interactive simulation of Level 2 central parking bays. Tap an available spot to trigger client-side reservation telemetry tracking.
              </p>

              {/* Bay Layout Grid */}
              <div className="bg-smartBg/65 border border-smartBorder/50 rounded-smart p-6 flex flex-col items-center justify-center gap-6">
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  <ParkingSlot id="A1" state="OCCUPIED" />
                  <ParkingSlot 
                    id="A2" 
                    state={demoSlotState} 
                    onClick={() => {
                      setDemoSlotState(prev => prev === 'AVAILABLE' ? 'SELECTED' : 'AVAILABLE');
                    }} 
                  />
                  <ParkingSlot id="A3" state="LIMITED" />
                  <ParkingSlot id="A4" state="RESERVED" />
                </div>
                
                <div className="text-[10px] font-mono text-smartTextSecondary bg-smartSurface/65 border border-smartBorder/30 px-3 py-1.5 rounded">
                  {demoSlotState === 'SELECTED' ? (
                    <span className="text-signature font-semibold">
                      Telemetry: Spot A2 Selected. Payload ready for booking dispatch.
                    </span>
                  ) : (
                    <span>Click spot &ldquo;A2&rdquo; to test slot active state dynamics.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Micro Specs Footer inside Card */}
            <div className="grid grid-cols-3 gap-4 border-t border-smartBorder/60 pt-4 mt-8 text-center">
              <div>
                <span className="text-[9px] uppercase text-smartTextSecondary block">Latency</span>
                <span className="font-mono text-xs font-semibold text-smartTextPrimary">12ms response</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-smartTextSecondary block">Accuracy</span>
                <span className="font-mono text-xs font-semibold text-smartTextPrimary">98.8% confidence</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-smartTextSecondary block">Protocol</span>
                <span className="font-mono text-xs font-semibold text-signature">R3F Spatial v2</span>
              </div>
            </div>
          </div>

          {/* Column Right: AI Decision Interface */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* AI Predictive Insight Card */}
            <AIInsight 
              title="Central Plaza Level 2"
              recommendation="Recommended based on your target arrival window (18:30) and walking distance parameters."
              confidence="94.6%"
              durationMinutes="6 min away"
              ratePerHour="₹35/hr"
              demandTrend="Operator notice: Demand is increasing. Predictive routing has allocated spot A4 as optimal."
              reasons={[
                'Estimated walking time to main entrance: 90 seconds',
                'Rate guaranteed for next 90 minutes',
                'Historical sensor trends indicate low immediate congestion'
              ]}
              actionText="Initiate Booking Route"
              onAction={() => alert('Simulator: Predictive route coordinates dispatched to virtual map.')}
            />

            {/* Quick Metrics Overlay */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="Region Availability" 
                value="42" 
                unit="bays open"
                trend={{ value: 'Stable', direction: 'neutral' }}
              />
              <MetricCard 
                label="Zone Demand Index" 
                value="1.42" 
                unit="x normal"
                trend={{ value: 'Rising', direction: 'up' }}
              />
            </div>
          </div>
        </section>

        {/* Product Information Section: What, Why, How? */}
        <section className="border-t border-smartBorder/50 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: WHAT IS IT */}
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded bg-signature/10 border border-signature/30 flex items-center justify-center text-signature mb-2">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="font-display font-medium text-base text-smartTextPrimary">
                What is SmartPark?
              </h3>
              <p className="text-xs text-smartTextSecondary leading-relaxed">
                SmartPark is an automotive-focused smart parking infrastructure layer. By mapping structural grid layouts and using prediction logic, it manages parking capacity at an enterprise scale.
              </p>
            </div>

            {/* Column 2: WHY IT MATTERS */}
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded bg-aiBlue/10 border border-aiBlue/30 flex items-center justify-center text-aiBlue mb-2">
                <Gauge className="h-4 w-4" />
              </div>
              <h3 className="font-display font-medium text-base text-smartTextPrimary">
                Why does it matter?
              </h3>
              <p className="text-xs text-smartTextSecondary leading-relaxed">
                Urban congestion increases fuel consumption and travel delays. SmartPark solves the &ldquo;last mile&rdquo; problem by allocating reservations predictively, reducing dwell times by up to 22%.
              </p>
            </div>

            {/* Column 3: WHAT MAKES IT INTELLIGENT */}
            <div className="flex flex-col gap-3">
              <div className="h-8 w-8 rounded bg-limited/10 border border-limited/30 flex items-center justify-center text-limited mb-2">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="font-display font-medium text-base text-smartTextPrimary">
                Why is it intelligent?
              </h3>
              <p className="text-xs text-smartTextSecondary leading-relaxed">
                Rather than relying on retroactive loops, our systems run predictive modeling based on peak hour variables, vehicle telemetry logs, and sensor array coordinates.
              </p>
            </div>

          </div>
        </section>

        {/* Premium Footer Foundation */}
        <footer className="border-t border-smartBorder/50 mt-16 pt-8 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-smartTextPrimary">
              SmartPark<span className="text-signature">.</span>AI
            </span>
            <p className="text-[10px] text-smartTextSecondary mt-1">
              © {new Date().getFullYear()} SmartPark Technologies, Inc. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-smartTextSecondary">
            <Link href="/design-system" className="hover:text-signature transition-colors">
              Internal Lab
            </Link>
            <span>·</span>
            <span className="opacity-50">API status: online</span>
            <span>·</span>
            <span className="opacity-50">Version: 2.0.0 Stable</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
