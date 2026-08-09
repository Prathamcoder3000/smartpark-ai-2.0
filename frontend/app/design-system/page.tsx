'use client';

import * as React from 'react';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge, ParkingStatusType } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { AIInsight } from '../../components/ui/AIInsight';
import { ParkingSlot, ParkingSlotState } from '../../components/ui/ParkingSlot';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Tooltip } from '../../components/ui/Tooltip';
import { LoadingSkeleton, LoadingCard } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Toast, ToastType } from '../../components/ui/Toast';
import {
  Sparkles,
  Info,
  Layers,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  User,
  Sliders,
  Move
} from 'lucide-react';

export default function DesignSystemPage() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = React.useState('all');

  // Input states
  const [searchValue, setSearchValue] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('opt-2');

  // Parking slots state
  const [slots, setSlots] = React.useState<Array<{ id: string; state: ParkingSlotState }>>([
    { id: 'A1', state: 'AVAILABLE' },
    { id: 'A2', state: 'AVAILABLE' },
    { id: 'A3', state: 'LIMITED' },
    { id: 'A4', state: 'OCCUPIED' },
    { id: 'A5', state: 'AVAILABLE' },
    { id: 'B1', state: 'RESERVED' },
    { id: 'B2', state: 'AVAILABLE' },
    { id: 'B3', state: 'OCCUPIED' },
    { id: 'B4', state: 'OCCUPIED' },
    { id: 'B5', state: 'AVAILABLE' },
  ]);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);

  // Overlay states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  // Toast state
  const [toast, setToast] = React.useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const handleSlotClick = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const newState = slot.state === 'SELECTED' ? 'AVAILABLE' : 'SELECTED';
          if (newState === 'SELECTED') {
            setSelectedSlotId(id);
            showToast(`Parking slot ${id} selected for reservation`, 'success');
          } else {
            setSelectedSlotId(null);
            showToast(`Deselected slot ${id}`, 'info');
          }
          return { ...slot, state: newState };
        }
        if (slot.state === 'SELECTED') {
          return { ...slot, state: 'AVAILABLE' };
        }
        return slot;
      })
    );
  };

  const resetSlots = () => {
    setSlots([
      { id: 'A1', state: 'AVAILABLE' },
      { id: 'A2', state: 'AVAILABLE' },
      { id: 'A3', state: 'LIMITED' },
      { id: 'A4', state: 'OCCUPIED' },
      { id: 'A5', state: 'AVAILABLE' },
      { id: 'B1', state: 'RESERVED' },
      { id: 'B2', state: 'AVAILABLE' },
      { id: 'B3', state: 'OCCUPIED' },
      { id: 'B4', state: 'OCCUPIED' },
      { id: 'B5', state: 'AVAILABLE' },
    ]);
    setSelectedSlotId(null);
    showToast('Parking slots reset to default values', 'info');
  };

  const tabsItems = [
    { id: 'all', label: 'All Modules' },
    { id: 'tokens', label: '01-03 Tokens' },
    { id: 'controls', label: '04-05 Controls' },
    { id: 'status', label: '06-07 Status/Metrics' },
    { id: 'parking', label: '08-09 Spatial/AI' },
    { id: 'system', label: '10-12 Shell/Motion' },
  ];

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-24 selection:bg-signature selection:text-smartBg">
      {/* Centered Floating capsule navigation */}
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* Banner Section */}
        <section className="relative overflow-hidden border border-smartBorder bg-smartSurface rounded-smart-lg p-6 sm:p-10 mb-8 spatial-grid-dots">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Compass className="h-44 w-44 text-smartTextSecondary" />
          </div>
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-semibold tracking-widest text-signature uppercase font-mono">
              INTERNAL DESIGN LAB
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-white mt-2">
              SmartPark AI 2.0 visual specification
            </h1>
            <p className="text-xs sm:text-sm text-smartTextSecondary mt-3 font-sans leading-relaxed">
              This sandbox houses the building blocks and visual properties of our smart mobility-tech stack. Use it to audit visual consistency, spacing parameters, interactive states, and layout responsiveness.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <Badge variant="signature">Electric Lime (#B7F34A)</Badge>
              <Badge variant="ai">Predictive Model Active</Badge>
              <Badge variant="outline">Responsive Foundation v2.0</Badge>
            </div>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <div className="mb-10 sticky top-20 z-20 py-2 border-b border-smartBorder bg-smartBg/90 backdrop-blur">
          <Tabs tabs={tabsItems} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* ─── 01 BRAND IDENTITY ─── */}
        {(activeTab === 'all' || activeTab === 'tokens') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">01 / BRAND</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Visual Positioning
              </h2>
            </div>
            <Card variant="default" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-between pl-2">
                <div>
                  <h3 className="font-display font-semibold text-sm text-smartTextPrimary uppercase">
                    SmartPark AI Corporation
                  </h3>
                  <p className="text-xs font-mono text-signature mt-1">&ldquo;Parking, before you arrive.&rdquo;</p>
                  <p className="text-xs text-smartTextSecondary mt-4 leading-relaxed">
                    Designed to mimic premium, precision infrastructure platforms. Spacing relies on clear mathematical layout offsets. Elements align to geometric grids representing parking slot markings and spatial zones.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-smartTextSecondary bg-smartBg border border-smartBorder p-2 rounded">
                  <Info className="h-3.5 w-3.5 text-aiBlue" />
                  Accent colors are restricted. Pure black is avoided.
                </div>
              </div>
              <div className="bg-smartBg/60 border border-smartBorder rounded p-4 flex flex-col justify-center gap-3">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Core Directives</span>
                <ul className="text-xs flex flex-col gap-2 text-smartTextSecondary">
                  <li className="flex gap-2"><span className="text-signature">✓</span> Spatial layout geometry</li>
                  <li className="flex gap-2"><span className="text-signature">✓</span> Restrained signature accent highlights</li>
                  <li className="flex gap-2"><span className="text-signature">✓</span> Explicit vehicle wireframe visualizations</li>
                </ul>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 02 COLORS ─── */}
        {(activeTab === 'all' || activeTab === 'tokens') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">02 / COLORS</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Color Palette & Tokens
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[
                { name: 'Bg Color', hex: '#0A0C0E', class: 'bg-[#0A0C0E]' },
                { name: 'Surface', hex: '#111519', class: 'bg-[#111519]' },
                { name: 'Elevated', hex: '#181D21', class: 'bg-[#181D21]' },
                { name: 'Border', hex: '#282F34', class: 'bg-[#282F34]' },
                { name: 'Signature', hex: '#B7F34A', class: 'bg-[#B7F34A]' },
                { name: 'AI Blue', hex: '#3B82F6', class: 'bg-[#3B82F6]' },
                { name: 'Available', hex: '#10B981', class: 'bg-[#10B981]' },
                { name: 'Limited', hex: '#F59E0B', class: 'bg-[#F59E0B]' },
                { name: 'Occupied', hex: '#EF4444', class: 'bg-[#EF4444]' },
              ].map((swatch) => (
                <div key={swatch.name} className="border border-smartBorder rounded bg-smartSurface p-2 flex flex-col justify-between h-24">
                  <div className={`h-8 w-full rounded-sm border border-smartBorder/40 ${swatch.class}`} />
                  <div>
                    <span className="text-[10px] font-semibold text-smartTextPrimary block">{swatch.name}</span>
                    <span className="text-[8px] font-mono text-smartTextSecondary block">{swatch.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 03 TYPOGRAPHY ─── */}
        {(activeTab === 'all' || activeTab === 'tokens') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">03 / TYPOGRAPHY</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Font Scale Hierarchy
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col justify-between h-40">
                <div>
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Space Grotesk (Brand & Titles)</span>
                  <h3 className="font-display text-lg font-bold text-smartTextPrimary mt-2 leading-snug">
                    Predictive Urban Parking Systems
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-smartTextSecondary/60">font-display · Light/Bold</span>
              </Card>
              <Card className="flex flex-col justify-between h-40">
                <div>
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Inter (Interface & Copy)</span>
                  <p className="font-sans text-xs text-smartTextSecondary mt-2 leading-relaxed">
                    UI controls, labels, layout descriptions, and forms default to the Inter font stack to ensure optimized contrast, readability, and scale.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-smartTextSecondary/60">font-sans · Regular/SemiBold</span>
              </Card>
              <Card className="flex flex-col justify-between h-40">
                <div>
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase">JetBrains Mono (Technical Logs)</span>
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between border-b border-smartBorder/20 pb-0.5 text-xs">
                      <span className="text-smartTextSecondary">LATENCY:</span>
                      <span className="font-mono text-signature">12.4ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-smartTextSecondary">COORDINATES:</span>
                      <span className="font-mono text-smartTextPrimary">19.043, 72.822</span>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-smartTextSecondary/60">font-mono · Regular/Bold</span>
              </Card>
            </div>
          </section>
        )}

        {/* ─── 04 CONTROLS ─── */}
        {(activeTab === 'all' || activeTab === 'controls') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">04 / CONTROLS</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Button States
              </h2>
            </div>
            <Card variant="default" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Primary CTAs</span>
                <Button variant="primary">Confirm Spot</Button>
                <Button variant="primary" isLoading>Processing</Button>
                <Button variant="primary" disabled>Locked State</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Secondary Outline</span>
                <Button variant="secondary">Change Route</Button>
                <Button variant="secondary" isLoading>Recalculating</Button>
                <Button variant="secondary" disabled>Unavailable</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Ghost Utility</span>
                <Button variant="ghost">Cancel Booking</Button>
                <Button variant="ghost" isLoading>Aborting</Button>
                <Button variant="ghost" disabled>Action Disabled</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Danger / Emergency</span>
                <Button variant="danger">Release Bay</Button>
                <Button variant="danger" isLoading>Releasing</Button>
                <Button variant="danger" disabled>Locked</Button>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 05 FORMS ─── */}
        {(activeTab === 'all' || activeTab === 'controls') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">05 / FORMS</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Inputs & Selections
              </h2>
            </div>
            <Card variant="default" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Standard Input Fields</span>
                <Input
                  label="Destination Center"
                  placeholder="Enter target hub, mall, or office"
                  helperText="Recommended based on walking proximity"
                />
                <Input
                  label="Terminal Slot Error"
                  value="Z99"
                  error="Slot code does not exist on level 2"
                  onChange={() => {}}
                />
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Search Controls</span>
                <SearchInput
                  placeholder="Search parking facilities..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue('')}
                />
                <div className="text-xs text-smartTextSecondary/80 bg-smartBg border border-smartBorder p-3 rounded font-mono">
                  State: <span className="text-signature">{searchValue || '[Empty]'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Dropdown Selectors</span>
                <Select
                  label="Active Floor Selection"
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  options={[
                    { value: 'opt-1', label: 'Level 1: Ground Operations' },
                    { value: 'opt-2', label: 'Level 2: Intelligent Slots' },
                    { value: 'opt-3', label: 'Level 3: EV Charging Hub' },
                  ]}
                />
                <div className="text-xs text-smartTextSecondary/80 bg-smartBg border border-smartBorder p-3 rounded font-mono">
                  Active key: <span className="text-aiBlue">{selectValue}</span>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 06 STATUS ─── */}
        {(activeTab === 'all' || activeTab === 'status') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">06 / STATUS</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Visual Chips & Badges
              </h2>
            </div>
            <Card variant="default" className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Semantic Badge Types</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="signature">Signature</Badge>
                  <Badge variant="ai">AI System</Badge>
                </div>
              </div>
              <div className="border-l border-smartBorder/60 pl-6 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Parking Availability Badges</span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="AVAILABLE" />
                  <StatusBadge status="LIMITED" />
                  <StatusBadge status="OCCUPIED" />
                  <StatusBadge status="RESERVED" />
                  <StatusBadge status="CLOSED" />
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 07 METRICS ─── */}
        {(activeTab === 'all' || activeTab === 'status') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">07 / METRICS</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Numerical Telemetry
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Available Spaces"
                value="42"
                trend={{ value: '+4 (last hour)', direction: 'up' }}
                unit="/ 120 slots"
              />
              <MetricCard
                label="Utilization Rate"
                value="68.2"
                trend={{ value: '1.2% delta', direction: 'down' }}
                unit="%"
              />
              <MetricCard
                label="Current tariff"
                value="₹30"
                trend={{ value: 'Tariff Stable', direction: 'neutral' }}
                unit="/ hr"
              />
              <MetricCard
                label="ETA congestion"
                value="08:15"
                trend={{ value: '8 min arrival', direction: 'up' }}
                unit="mins"
              />
            </div>
          </section>
        )}

        {/* ─── 08 PARKING ─── */}
        {(activeTab === 'all' || activeTab === 'parking') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">08 / PARKING</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Bay Geometry Layout
              </h2>
            </div>
            <Card variant="default">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-semibold font-display text-smartTextPrimary uppercase">
                    Level 2 Bay Simulator
                  </h3>
                  <p className="text-[11px] text-smartTextSecondary mt-0.5">Click slots to switch state triggers.</p>
                </div>
                <IconButton variant="surface" size="sm" onClick={resetSlots} title="Reset simulation states">
                  <RotateCcw className="h-3.5 w-3.5" />
                </IconButton>
              </div>

              <div className="bg-smartBg/40 border border-smartBorder/40 rounded p-6 flex flex-col gap-6 items-center">
                <div className="w-full">
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-3">North Corridor Lanes</span>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {slots.slice(0, 5).map((slot) => (
                      <ParkingSlot key={slot.id} id={slot.id} state={slot.state} onClick={handleSlotClick} />
                    ))}
                  </div>
                </div>
                <div className="w-full border-t border-smartBorder/20 pt-4">
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-3">Central Corridors</span>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {slots.slice(5, 10).map((slot) => (
                      <ParkingSlot key={slot.id} id={slot.id} state={slot.state} onClick={handleSlotClick} />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 09 INTELLIGENCE ─── */}
        {(activeTab === 'all' || activeTab === 'parking') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">09 / INTELLIGENCE</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                AI Decision Support Panel
              </h2>
            </div>
            <div className="max-w-xl mx-auto">
              <AIInsight
                title="Level 2 Central Plaza Option"
                recommendation="Assigned as optimal based on simulated occupancy logs and proximity."
                confidence="96.2%"
                durationMinutes="8 min travel"
                ratePerHour="₹30/hr"
                demandTrend="Warning: Live sensor logs show a 14% occupancy climb in central sectors."
                reasons={[
                  'Short walking distance to elevators',
                  'Optimized lane accessibility routing',
                ]}
                onAction={() => showToast('Dispatched simulated route payload to device.', 'success')}
              />
            </div>
          </section>
        )}

        {/* ─── 10 NAVIGATION ─── */}
        {(activeTab === 'all' || activeTab === 'system') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">10 / NAVIGATION</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Floating Shell Layout
              </h2>
            </div>
            <Card variant="default">
              <p className="text-xs text-smartTextSecondary leading-relaxed mb-4">
                The global shell uses a centered floating capsule design with absolute spatial grids, blur effects, active spring layout indicators, and fully-responsive layout parameters. Look at the top of this viewport to observe the active capsule.
              </p>
              <div className="border border-smartBorder bg-smartBg/60 rounded p-4 flex items-center justify-between text-xs font-mono text-smartTextSecondary">
                <span>Height: 48px</span>
                <span>Backdrop Blur: blur-xl</span>
                <span>Responsive breakpoint: md (768px) drawer toggle</span>
              </div>
            </Card>
          </section>
        )}

        {/* ─── 11 FEEDBACK ─── */}
        {(activeTab === 'all' || activeTab === 'system') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">11 / FEEDBACK & STATES</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Overlays, Skeletons, & Alerts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="flex flex-col justify-between h-48">
                <div>
                  <h3 className="text-xs font-semibold uppercase font-display text-smartTextPrimary">
                    Trigger Dialog Overlays
                  </h3>
                  <p className="text-xs text-smartTextSecondary mt-2 leading-relaxed">
                    Fire modal dialogs and details sliding drawers equipped with focus traps, escape key listeners, and custom animations.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Open Modal Box</Button>
                  <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>Open Sidebar Drawer</Button>
                </div>
              </Card>

              <Card className="flex flex-col justify-between h-48">
                <div>
                  <h3 className="text-xs font-semibold uppercase font-display text-smartTextPrimary">
                    Notification Systems
                  </h3>
                  <p className="text-xs text-smartTextSecondary mt-2 leading-relaxed">
                    Deploy interactive system alerts at the viewport threshold indicating action responses.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => showToast('Operation completed successfully', 'success')}>Success</Button>
                  <Button variant="ghost" size="sm" onClick={() => showToast('Tariff updates available', 'warning')}>Warning</Button>
                  <Button variant="ghost" size="sm" onClick={() => showToast('Server link timed out', 'error')}>Error</Button>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Loading Skeleton Layout</span>
                <LoadingCard />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Empty States</span>
                <EmptyState
                  title="No reservations found"
                  description="Adjust active parameters to scan predictions in alternative sectors."
                  actionText="Reset search"
                  onAction={() => showToast('Filters cleared', 'info')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase">Error / Network Failures</span>
                <ErrorState
                  title="Map system sync failed"
                  description="A communication exception occurred connecting to spatial service arrays."
                  onRetry={() => showToast('Attempting service link rebuild...', 'info')}
                />
              </div>
            </div>
          </section>
        )}

        {/* ─── 12 MOTION ─── */}
        {(activeTab === 'all' || activeTab === 'system') && (
          <section className="mb-16 border-t border-smartBorder/40 pt-8 animate-fade-in">
            <div className="mb-6">
              <span className="text-[10px] font-mono text-signature font-semibold uppercase tracking-widest">12 / MOTION</span>
              <h2 className="text-base font-display font-semibold text-smartTextPrimary uppercase tracking-wider mt-1">
                Spatial Visual Simulations
              </h2>
            </div>
            <Card variant="flat" className="p-6 relative overflow-hidden bg-gradient-to-br from-smartSurface to-smartBg border border-smartBorder">
              <div className="absolute top-0 right-0 h-full w-1/3 bg-signature/5 pointer-events-none skew-x-12 blur-3xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-signature" />
                    <span className="font-display font-medium text-sm text-smartTextPrimary uppercase">
                      Isometric structural mock
                    </span>
                  </div>
                  <p className="text-xs text-smartTextSecondary leading-relaxed">
                    Simulates interactive structural views. Operators can toggle layouts, inspect wireframes, and orbit physical grid references.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">CSS isometric transform</Badge>
                    <Badge variant="outline">Framer Motion transition</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center p-6 bg-smartBg/60 border border-smartBorder rounded-smart relative h-48 overflow-hidden select-none group">
                  <div className="absolute inset-0 spatial-grid opacity-20 group-hover:scale-105 transition-transform duration-700" />
                  
                  <div className="relative w-48 h-32 transform rotate-x-60 -rotate-z-45 flex flex-col gap-4 items-center justify-center transition-transform duration-500 hover:translate-y-[-5px]">
                    <div className="absolute h-16 w-32 bg-smartElevated/85 border border-aiBlue/50 rounded flex items-center justify-center shadow-2xl translate-y-[-24px] backdrop-blur-sm">
                      <span className="text-[10px] font-mono text-aiBlue">LEVEL 3: VIP</span>
                    </div>
                    <div className="absolute h-16 w-32 bg-[#1b2229]/95 border border-signature rounded flex items-center justify-center shadow-xl translate-y-[0px] backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-mono text-signature font-bold">LEVEL 2: SIMULATOR</span>
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-available animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-occupied" />
                          <span className="h-1.5 w-1.5 rounded-full bg-signature" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute h-16 w-32 bg-smartSurface/80 border border-smartBorder rounded flex items-center justify-center shadow-md translate-y-[24px] backdrop-blur-sm">
                      <span className="text-[10px] font-mono text-smartTextSecondary">LEVEL 1: ACTIVE</span>
                    </div>
                  </div>

                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-smartTextSecondary bg-smartBg border border-smartBorder px-1.5 py-0.5 rounded">
                    PERSPECTIVE SIM
                  </span>
                </div>
              </div>
            </Card>
          </section>
        )}
      </main>

      {/* Global Interactive Overlays */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          showToast('Modal card dismissed', 'info');
        }}
        title="Interactive Reservation Portal"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-smartTextSecondary leading-relaxed">
            This modal panel displays transaction configurations or reservation summaries. It has standard backdrop blurring and keyboard traps.
          </p>
          <div className="bg-smartBg border border-smartBorder p-4 rounded-smart flex flex-col gap-2 font-sans">
            <div className="flex justify-between text-xs">
              <span className="text-smartTextSecondary">Estimated Tariff:</span>
              <span className="font-mono text-smartTextPrimary font-semibold">₹30.00 / hour</span>
            </div>
            <div className="flex justify-between text-xs border-t border-smartBorder/40 pt-2">
              <span className="text-smartTextSecondary">Arrival Window:</span>
              <span className="font-mono text-signature font-semibold">18:30 (8 min remaining)</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 border-t border-smartBorder/40 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => {
              setIsModalOpen(false);
              showToast('Reservation confirm packet dispatched!', 'success');
            }}>
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          showToast('Sidebar panel retracted', 'info');
        }}
        title="SmartPark Spot Telemetry"
      >
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-mono text-signature uppercase tracking-wider">Spot ID</span>
            <h4 className="text-xl font-display font-semibold text-smartTextPrimary">FACILITY BAY B1</h4>
            <p className="text-xs text-smartTextSecondary mt-0.5">Reserved under active AI predicted slot allocation.</p>
          </div>

          <div className="flex flex-col gap-4 bg-smartBg/60 p-4 border border-smartBorder rounded-smart">
            <h5 className="text-xs font-semibold uppercase text-smartTextSecondary tracking-wider">Live Metrics</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-smartTextSecondary font-sans">Confidence</span>
                <span className="font-mono text-sm font-semibold text-smartTextPrimary">92%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-smartTextSecondary font-sans">Sensor Status</span>
                <span className="font-mono text-sm font-semibold text-available">ONLINE</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-smartTextSecondary font-sans">Proximity</span>
                <span className="font-mono text-sm font-semibold text-smartTextPrimary">240 meters</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-smartTextSecondary font-sans">Hourly charge</span>
                <span className="font-mono text-sm font-semibold text-smartTextPrimary">₹30/hr</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary" className="w-full" onClick={() => {
              setIsDrawerOpen(false);
              showToast('Route coordinates sent to map navigator', 'success');
            }}>
              Begin Route Navigation
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setIsDrawerOpen(false)}>
              Dismiss Details
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Global Interactive System Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
