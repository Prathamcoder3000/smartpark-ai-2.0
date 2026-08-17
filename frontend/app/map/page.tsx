'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Plus,
  Minus,
  Crosshair,
  MapPin,
  Zap,
  Shield,
  CarFront,
  Layers,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  SlidersHorizontal,
  ArrowLeft,
  Star,
} from 'lucide-react';

import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ParkingSlot } from '../../components/ui/ParkingSlot';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { Drawer } from '../../components/ui/Drawer';
import { Toast } from '../../components/ui/Toast';

import {
  MAP_FACILITIES,
  MAP_AI_RECOMMENDATION,
  MAP_POPULAR_DESTINATIONS,
  MAP_FILTER_OPTIONS,
  MAP_ZONE_OPTIONS,
  MapFacility,
  MapFilter,
  ParkingFloor,
  MapParkingSlot,
  SlotState,
} from '../../lib/liveMapData';

// ─── Types ────────────────────────────────────────────────────

type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastVariant;
}

// ─── Helpers ──────────────────────────────────────────────────

function getStatusColor(status: MapFacility['status']): string {
  switch (status) {
    case 'AVAILABLE': return '#10B981';
    case 'LIMITED':   return '#F59E0B';
    case 'OCCUPIED':  return '#EF4444';
  }
}

function getOccupancyBarColor(status: MapFacility['status']): string {
  switch (status) {
    case 'AVAILABLE': return 'bg-available';
    case 'LIMITED':   return 'bg-limited';
    case 'OCCUPIED':  return 'bg-occupied';
  }
}

function getOccupancyPercent(facility: MapFacility): number {
  return Math.round(((facility.totalBays - facility.availableBays) / facility.totalBays) * 100);
}

function getSlotDisplayState(
  slot: MapParkingSlot,
  selectedSlotId: string | null
): SlotState {
  if (
    slot.id === selectedSlotId &&
    slot.state !== 'OCCUPIED' &&
    slot.state !== 'RESERVED'
  ) {
    return 'SELECTED';
  }
  return slot.state;
}

function applyFilter(facilities: MapFacility[], filter: MapFilter): MapFacility[] {
  switch (filter) {
    case 'AVAILABLE':
      return facilities.filter((f) => f.status === 'AVAILABLE');
    case 'EV_READY':
      return facilities.filter((f) => f.evCharging);
    case 'COVERED':
      return facilities.filter((f) => f.covered);
    case 'LOWEST_PRICE':
      return [...facilities].sort((a, b) => a.ratePerHourNum - b.ratePerHourNum);
    default:
      return facilities;
  }
}

// ─── Sub-components ───────────────────────────────────────────

interface FacilityMarkerProps {
  facility: MapFacility;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}

const FacilityMarker: React.FC<FacilityMarkerProps> = ({
  facility,
  isSelected,
  isRecommended,
  onClick,
}) => {
  const color = getStatusColor(facility.status);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Select parking facility: ${facility.name}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signature group"
      style={{ left: `${facility.mapPosition.x}%`, top: `${facility.mapPosition.y}%` }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring for recommended facility */}
      {isRecommended && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: '#B7F34A' }}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <motion.span
          layoutId="markerRing"
          className="absolute -inset-2 rounded-full border-2 border-signature"
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      )}

      {/* Marker body */}
      <div
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-lg transition-all duration-200 ${
          isSelected
            ? 'border-signature bg-smartElevated'
            : isRecommended
            ? 'border-signature/60 bg-smartElevated'
            : 'border-smartBorder bg-smartSurface group-hover:border-smartBorder/80 group-hover:bg-smartElevated'
        }`}
      >
        {/* Status dot */}
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Name chip */}
        <span className="text-[10px] font-semibold font-display text-smartTextPrimary whitespace-nowrap leading-none">
          {facility.shortName}
        </span>

        {/* Recommended lime tag */}
        {isRecommended && (
          <span className="text-[8px] font-bold font-mono text-signature leading-none">
            ★ AI
          </span>
        )}
      </div>

      {/* Price + bay chip below marker */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex items-center gap-1 bg-smartBg/90 border border-smartBorder/70 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 whitespace-nowrap">
        <span className="text-[9px] font-mono font-bold text-signature">
          {facility.ratePerHour}
        </span>
        <span className="text-[9px] font-mono text-smartTextSecondary">
          · {facility.availableBays} free
        </span>
      </div>
    </motion.button>
  );
};

// ─── Map Road Network (SVG) ───────────────────────────────────

const MapRoadNetwork: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
    className="absolute inset-0 w-full h-full"
    aria-hidden="true"
  >
    {/* ── City blocks (background fills between roads) ── */}
    {/* Upper left block */}
    <rect x="0" y="0" width="32" height="38" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />
    {/* Upper center block */}
    <rect x="33.5" y="0" width="31" height="38" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />
    {/* Upper right block */}
    <rect x="66" y="0" width="34" height="38" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />
    {/* Middle left block */}
    <rect x="0" y="39.5" width="32" height="25" fill="#111519" fillOpacity="0.35" stroke="#282F34" strokeWidth="0.15" />
    {/* Center block */}
    <rect x="33.5" y="39.5" width="31" height="25" fill="#111519" fillOpacity="0.35" stroke="#282F34" strokeWidth="0.15" />
    {/* Middle right block */}
    <rect x="66" y="39.5" width="34" height="25" fill="#111519" fillOpacity="0.35" stroke="#282F34" strokeWidth="0.15" />
    {/* Lower left block */}
    <rect x="0" y="66" width="32" height="34" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />
    {/* Lower center block */}
    <rect x="33.5" y="66" width="31" height="34" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />
    {/* Lower right block */}
    <rect x="66" y="66" width="34" height="34" fill="#111519" fillOpacity="0.45" stroke="#282F34" strokeWidth="0.15" />

    {/* ── Sub-structures (building outlines inside blocks) ── */}
    <rect x="3" y="4" width="12" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="18" y="4" width="10" height="8" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="3" y="16" width="8" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="14" y="16" width="14" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="36" y="4" width="12" height="14" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="52" y="6" width="10" height="8" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="36" y="22" width="10" height="12" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="50" y="20" width="12" height="14" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="70" y="4" width="16" height="12" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="88" y="4" width="8" height="20" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="70" y="20" width="14" height="15" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="3" y="42" width="18" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="3" y="56" width="10" height="7" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="36" y="42" width="12" height="20" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="52" y="44" width="10" height="16" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="68" y="42" width="14" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="86" y="42" width="10" height="18" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="68" y="56" width="12" height="7" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="3" y="70" width="14" height="16" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="20" y="70" width="10" height="10" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="3" y="88" width="24" height="8" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="36" y="70" width="16" height="20" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="56" y="72" width="8" height="14" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="36" y="92" width="12" height="6" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="68" y="70" width="18" height="22" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="90" y="72" width="8" height="12" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />
    <rect x="68" y="94" width="20" height="4" rx="0.5" fill="none" stroke="#282F34" strokeWidth="0.25" />

    {/* ── Main arterial roads ── */}
    {/* Horizontal main: y=38.75 */}
    <line x1="0" y1="38.75" x2="100" y2="38.75" stroke="#282F34" strokeWidth="1.4" />
    {/* Horizontal main: y=65.25 */}
    <line x1="0" y1="65.25" x2="100" y2="65.25" stroke="#282F34" strokeWidth="1.4" />
    {/* Vertical main: x=32.75 */}
    <line x1="32.75" y1="0" x2="32.75" y2="100" stroke="#282F34" strokeWidth="1.4" />
    {/* Vertical main: x=65.75 */}
    <line x1="65.75" y1="0" x2="65.75" y2="100" stroke="#282F34" strokeWidth="1.4" />

    {/* ── Minor connector roads ── */}
    {/* Horizontal connector mid-upper: y=22, from x=32.75 to x=65.75 */}
    <line x1="32.75" y1="22" x2="65.75" y2="22" stroke="#282F34" strokeWidth="0.6" strokeDasharray="1 0.8" />
    {/* Horizontal connector lower: y=82, full width */}
    <line x1="0" y1="82" x2="65.75" y2="82" stroke="#282F34" strokeWidth="0.6" strokeDasharray="1 0.8" />
    {/* Vertical connector: x=16, from y=38.75 to y=65.25 */}
    <line x1="16" y1="38.75" x2="16" y2="65.25" stroke="#282F34" strokeWidth="0.6" strokeDasharray="1 0.8" />
    {/* Vertical connector: x=49, from y=38.75 to y=65.25 */}
    <line x1="49" y1="38.75" x2="49" y2="65.25" stroke="#282F34" strokeWidth="0.6" strokeDasharray="1 0.8" />
    {/* Vertical connector: x=82, from y=38.75 to y=100 */}
    <line x1="82" y1="38.75" x2="82" y2="100" stroke="#282F34" strokeWidth="0.6" strokeDasharray="1 0.8" />

    {/* ── Road centerlines (dashed white) ── */}
    <line x1="0" y1="38.75" x2="100" y2="38.75" stroke="#F4F6F1" strokeWidth="0.12" strokeDasharray="2 2" strokeOpacity="0.08" />
    <line x1="0" y1="65.25" x2="100" y2="65.25" stroke="#F4F6F1" strokeWidth="0.12" strokeDasharray="2 2" strokeOpacity="0.08" />
    <line x1="32.75" y1="0" x2="32.75" y2="100" stroke="#F4F6F1" strokeWidth="0.12" strokeDasharray="2 2" strokeOpacity="0.08" />
    <line x1="65.75" y1="0" x2="65.75" y2="100" stroke="#F4F6F1" strokeWidth="0.12" strokeDasharray="2 2" strokeOpacity="0.08" />

    {/* ── District labels ── */}
    <text x="4" y="13" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">CYBER CITY DISTRICT</text>
    <text x="36" y="12" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">METRO CENTER</text>
    <text x="68" y="12" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">TECH PARK ZONE</text>
    <text x="4" y="54" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">CORRIDOR WEST</text>
    <text x="68" y="54" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">FINANCIAL PLAZA</text>
    <text x="4" y="88" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">OUTER RING WEST</text>
    <text x="36" y="88" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">COMMERCIAL SOUTH</text>
    <text x="68" y="88" fontSize="2.2" fill="#8B9298" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.5" textAnchor="start">FINANCIAL SOUTH</text>
  </svg>
);

// ─── Map Legend ───────────────────────────────────────────────

const MapLegend: React.FC = () => (
  <div className="bg-smartSurface/90 border border-smartBorder/80 rounded-smart p-3 backdrop-blur-md shadow-xl min-w-[140px]">
    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-smartTextSecondary block mb-2">
      MAP LEGEND
    </span>
    <div className="flex flex-col gap-1.5">
      {[
        { color: '#10B981', label: 'Available' },
        { color: '#F59E0B', label: 'Limited' },
        { color: '#EF4444', label: 'Occupied / Full' },
        { color: '#B7F34A', label: 'AI Recommended' },
        { color: '#3B82F6', label: 'Intelligence Data' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-sans text-smartTextSecondary">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── AI Recommendation Panel ──────────────────────────────────

interface AIRecPanelProps {
  onSelectFacility: (id: string) => void;
}

const AIRecPanel: React.FC<AIRecPanelProps> = ({ onSelectFacility }) => {
  const rec = MAP_AI_RECOMMENDATION;

  return (
    <div className="bg-smartElevated border border-smartBorder rounded-smart-lg p-4 relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-aiBlue via-signature to-transparent" />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-aiBlue" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-aiBlue uppercase">
              AI Recommendation
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-signature bg-signature/10 border border-signature/30 px-1.5 py-0.5 rounded">
            {rec.confidence}
          </span>
        </div>

        {/* Facility name */}
        <button
          type="button"
          onClick={() => onSelectFacility(rec.facilityId)}
          className="text-left w-full group"
          aria-label={`Select recommended facility: ${rec.facilityName}`}
        >
          <span className="text-sm font-semibold font-display text-smartTextPrimary group-hover:text-white transition-colors leading-snug block">
            {rec.facilityName}
          </span>
        </button>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[9px] text-smartTextSecondary block uppercase tracking-wider">Walk ETA</span>
            <span className="font-bold text-smartTextPrimary">{rec.walkMinutes} min</span>
          </div>
          <div>
            <span className="text-[9px] text-smartTextSecondary block uppercase tracking-wider">Rate</span>
            <span className="font-bold text-signature">{rec.ratePerHour}</span>
          </div>
        </div>

        {/* Reasons */}
        <ul className="space-y-1.5" role="list">
          {rec.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-smartTextSecondary font-sans">
              <Check className="h-3 w-3 text-signature shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        {/* Availability note */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-smartTextSecondary border-t border-smartBorder/60 pt-2.5">
          <Info className="h-3 w-3 text-aiBlue shrink-0" />
          <span>{rec.predictedAvailabilityWindow}</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelectFacility(rec.facilityId)}
          className="w-full text-[11px] uppercase tracking-wider font-semibold"
        >
          View Recommended Facility
        </Button>
      </div>
    </div>
  );
};

// ─── Facility Details Panel ───────────────────────────────────

interface FacilityDetailsPanelProps {
  facility: MapFacility;
  isRecommended: boolean;
  onViewParking: () => void;
  onClose: () => void;
}

const FacilityDetailsPanel: React.FC<FacilityDetailsPanelProps> = ({
  facility,
  isRecommended,
  onViewParking,
  onClose,
}) => {
  const occupancyPct = getOccupancyPercent(facility);

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isRecommended && (
            <span className="text-[9px] font-mono font-bold text-signature bg-signature/10 border border-signature/30 px-1.5 py-0.5 rounded uppercase tracking-wider block mb-1.5 w-fit">
              ★ AI RECOMMENDED
            </span>
          )}
          <h3 className="text-sm font-bold font-display text-smartTextPrimary leading-snug">
            {facility.name}
          </h3>
          <p className="text-[11px] text-smartTextSecondary font-sans mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {facility.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={facility.status} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Deselect facility"
            className="text-smartTextSecondary hover:text-smartTextPrimary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-smartTextSecondary">{facility.availableBays} bays free of {facility.totalBays}</span>
          <span className="text-smartTextPrimary font-bold">{occupancyPct}% filled</span>
        </div>
        <div className="w-full bg-smartBorder/50 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getOccupancyBarColor(facility.status)}`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Core stats grid */}
      <div className="grid grid-cols-3 gap-2 bg-smartBg/60 border border-smartBorder/40 rounded-smart p-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">Distance</span>
          <span className="font-mono text-sm font-bold text-smartTextPrimary">{facility.distanceKm} km</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">Walk ETA</span>
          <span className="font-mono text-sm font-bold text-aiBlue">{facility.walkMinutes} min</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">Rate</span>
          <span className="font-mono text-sm font-bold text-signature">{facility.ratePerHour}</span>
        </div>
      </div>

      {/* Amenity badges */}
      <div className="flex flex-wrap gap-1.5">
        {facility.evCharging && (
          <div className="flex items-center gap-1 text-[10px] font-mono bg-signature/10 border border-signature/30 text-signature px-2 py-0.5 rounded">
            <Zap className="h-2.5 w-2.5" />EV Charging
          </div>
        )}
        {facility.covered && (
          <div className="flex items-center gap-1 text-[10px] font-mono bg-aiBlue/10 border border-aiBlue/30 text-aiBlue px-2 py-0.5 rounded">
            <Layers className="h-2.5 w-2.5" />Covered
          </div>
        )}
        {facility.security24x7 && (
          <div className="flex items-center gap-1 text-[10px] font-mono bg-available/10 border border-available/30 text-available px-2 py-0.5 rounded">
            <Shield className="h-2.5 w-2.5" />24/7 Security
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {facility.tags.map((tag, i) => (
          <Badge key={i} variant="outline" className="text-[9px] font-mono">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Predicted availability */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-smartTextSecondary bg-smartBg/60 border border-smartBorder/40 rounded p-2.5">
        <Info className="h-3 w-3 text-aiBlue shrink-0" />
        <span>{facility.predictedAvailability}</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-smartTextSecondary">
        <Star className="h-3 w-3 text-limited fill-limited" />
        <span className="font-bold text-smartTextPrimary">{facility.rating}</span>
        <span>/ 5.0 community rating</span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={onViewParking}
          className="flex-1 text-xs uppercase tracking-wider font-semibold"
        >
          <CarFront className="h-3.5 w-3.5 shrink-0" />
          View Bays
        </Button>
        
        <Link href={`/facility/${
          ({
            'fac-01': 'cyber-city-hub',
            'fac-02': 'metro-central-garage',
            'fac-03': 'techpark-parking',
            'fac-04': 'financial-plaza-deck'
          }[facility.id] || facility.id)
        }`} className="flex-1">
          <Button
            variant="secondary"
            size="md"
            className="w-full text-xs uppercase tracking-wider font-semibold"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

// ─── Floor Slot Grid ──────────────────────────────────────────

interface FloorSlotGridProps {
  floor: ParkingFloor;
  selectedSlotId: string | null;
  onSlotClick: (slotId: string) => void;
}

const FloorSlotGrid: React.FC<FloorSlotGridProps> = ({
  floor,
  selectedSlotId,
  onSlotClick,
}) => (
  <div className="space-y-4">
    {/* Floor summary bar */}
    <div className="flex items-center justify-between bg-smartBg/60 border border-smartBorder/40 rounded-smart p-3">
      <div>
        <span className="text-xs font-semibold font-display text-smartTextPrimary">{floor.label}</span>
        <p className="text-[10px] text-smartTextSecondary font-sans mt-0.5">{floor.description}</p>
      </div>
      <div className="text-right">
        <span className="text-lg font-mono font-bold text-signature">{floor.availableCount}</span>
        <span className="text-[10px] font-mono text-smartTextSecondary block">/{floor.totalCount} free</span>
      </div>
    </div>

    {/* Slot grid */}
    <div className="flex flex-wrap justify-center gap-3">
      {floor.slots.map((slot) => (
        <ParkingSlot
          key={slot.id}
          id={slot.id.split('-').pop() ?? slot.id}
          state={getSlotDisplayState(slot, selectedSlotId)}
          onClick={
            slot.state !== 'OCCUPIED' && slot.state !== 'RESERVED'
              ? () => onSlotClick(slot.id)
              : undefined
          }
        />
      ))}
    </div>

    {/* Slot legend */}
    <div className="flex flex-wrap gap-3 justify-center text-[10px] font-mono text-smartTextSecondary border-t border-smartBorder/40 pt-3">
      {[
        { color: 'bg-available', label: 'Available' },
        { color: 'bg-limited', label: 'Limited' },
        { color: 'bg-occupied', label: 'Occupied' },
        { color: 'bg-aiBlue', label: 'Reserved' },
        { color: 'bg-signature', label: 'Selected' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Page Component ──────────────────────────────────────

export default function LiveMapPage() {
  const router = useRouter();
  // ── Search & filter state ─────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MapFilter>('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');

  // ── Map interaction state ─────────────────────────────────
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // ── Drawer (floor/slot view) state ────────────────────────
  const [isFloorDrawerOpen, setIsFloorDrawerOpen] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState('B1');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // ── Mobile panel state ───────────────────────────────────
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // ── Toast state ──────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (message: string, type: ToastVariant = 'success') => {
      setToast({ isOpen: true, message, type });
    },
    []
  );

  // ── Derived: filtered facilities (also used for marker visibility) ─
  const filteredFacilities = useMemo(() => {
    const bySearch = MAP_FACILITIES.filter((f) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.zone.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    const byZone =
      selectedZone === 'ALL'
        ? bySearch
        : bySearch.filter((f) => f.zone.includes(selectedZone));
    return applyFilter(byZone, activeFilter);
  }, [searchQuery, activeFilter, selectedZone]);

  // ── Derived: selected facility object ─────────────────────
  const selectedFacility = useMemo(
    () =>
      selectedFacilityId
        ? MAP_FACILITIES.find((f) => f.id === selectedFacilityId) ?? null
        : null,
    [selectedFacilityId]
  );

  // ── Derived: current floor object ────────────────────────
  const currentFloor = useMemo(
    () =>
      selectedFacility?.floors.find((fl) => fl.id === activeFloorId) ??
      selectedFacility?.floors[0] ??
      null,
    [selectedFacility, activeFloorId]
  );

  // ── Derived: selected slot object ────────────────────────
  const selectedSlot = useMemo(
    () =>
      selectedSlotId && currentFloor
        ? currentFloor.slots.find((s) => s.id === selectedSlotId) ?? null
        : null,
    [selectedSlotId, currentFloor]
  );

  // ── Handlers ─────────────────────────────────────────────

  const handleMarkerClick = useCallback((facilityId: string) => {
    setSelectedFacilityId((prev) => {
      const next = prev === facilityId ? null : facilityId;
      return next;
    });
    setActiveFloorId('B1');
    setSelectedSlotId(null);
    setIsMobilePanelOpen(true);
  }, []);

  const handleDeselectFacility = useCallback(() => {
    setSelectedFacilityId(null);
    setSelectedSlotId(null);
    setIsMobilePanelOpen(false);
  }, []);

  const handleViewParking = useCallback(() => {
    if (!selectedFacility) return;
    setActiveFloorId(selectedFacility.floors[0]?.id ?? 'B1');
    setSelectedSlotId(null);
    setIsFloorDrawerOpen(true);
  }, [selectedFacility]);

  const handleFloorChange = useCallback((floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedSlotId(null);
  }, []);

  const handleSlotClick = useCallback(
    (slotId: string) => {
      setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
    },
    []
  );

  const handleReserveSlot = useCallback(() => {
    if (!selectedFacility || !selectedSlotId) return;
    const map: Record<string, string> = {
      'fac-01': 'cyber-city-hub',
      'fac-02': 'metro-central-garage',
      'fac-03': 'techpark-parking',
      'fac-04': 'financial-plaza-deck'
    };
    const slug = map[selectedFacility.id] || selectedFacility.id;
    router.push(`/reserve?facility=${slug}&slot=${selectedSlotId}&floor=${activeFloorId}`);
  }, [selectedFacility, selectedSlotId, activeFloorId, router]);

  const handleCloseDrawer = useCallback(() => {
    setIsFloorDrawerOpen(false);
    setSelectedSlotId(null);
  }, []);

  // Zoom controls
  const ZOOM_STEPS = [1, 1.35, 1.75] as const;
  const zoomIdx = ZOOM_STEPS.findIndex((z) => z === zoomLevel);

  const handleZoomIn = useCallback(() => {
    const next = ZOOM_STEPS[Math.min(zoomIdx + 1, ZOOM_STEPS.length - 1)];
    if (next !== undefined) setZoomLevel(next);
  }, [zoomIdx]);

  const handleZoomOut = useCallback(() => {
    const next = ZOOM_STEPS[Math.max(zoomIdx - 1, 0)];
    if (next !== undefined) setZoomLevel(next);
  }, [zoomIdx]);

  const handleRecenter = useCallback(() => setZoomLevel(1), []);

  // ── Floor tab options ─────────────────────────────────────
  const floorTabs = useMemo(
    () =>
      (selectedFacility?.floors ?? []).map((fl) => ({
        id: fl.id,
        label: `${fl.id} (${fl.availableCount} free)`,
      })),
    [selectedFacility]
  );

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col selection:bg-signature selection:text-smartBg">
      {/* Spatial background grid */}
      <div className="fixed inset-0 spatial-grid-dots opacity-25 pointer-events-none z-0" />

      {/* Navigation */}
      <Header />

      {/* ── Page title strip ──────────────────────────────── */}
      <div className="relative z-10 bg-smartSurface/80 border-b border-smartBorder/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-signature">
              LIVE PARKING MAP
            </span>
          </div>
          <span className="text-smartBorder hidden sm:block">|</span>
          <span className="text-[10px] font-mono text-smartTextSecondary hidden sm:block">
            Metro Central District
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="text-smartTextSecondary hidden md:block">
            Showing{' '}
            <span className="text-smartTextPrimary font-bold">
              {filteredFacilities.length}
            </span>{' '}
            of {MAP_FACILITIES.length} facilities
          </span>
          <span className="text-available font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-available animate-pulse" />
            100% SENSORS ACTIVE
          </span>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────── */}
      <div className="relative z-10 flex flex-1 overflow-hidden h-[calc(100vh-7rem)]">

        {/* ── DESKTOP SIDEBAR ───────────────────────────── */}
        <aside
          className="hidden md:flex flex-col w-[360px] lg:w-[400px] shrink-0 border-r border-smartBorder/60 bg-smartBg/80 backdrop-blur-md overflow-y-auto"
          aria-label="Parking search and facility details panel"
        >
          <div className="p-4 space-y-4">

            {/* Search console */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-smartBorder/60 pb-3">
                <Search className="h-3.5 w-3.5 text-signature shrink-0" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-smartTextPrimary">
                  Destination Search
                </span>
              </div>

              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by name, location, or zone…"
              />

              {/* Zone select */}
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full h-9 bg-smartSurface border border-smartBorder rounded-smart px-3 text-xs font-sans text-smartTextPrimary outline-none focus:border-signature/60 transition-colors"
                aria-label="Filter by zone"
              >
                {MAP_ZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Popular destinations */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-smartTextSecondary uppercase tracking-wider">
                  Popular:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MAP_POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setSearchQuery(dest)}
                      className={`text-[10px] px-2.5 py-1 rounded border transition-colors font-sans ${
                        searchQuery === dest
                          ? 'bg-signature/15 border-signature text-signature'
                          : 'bg-smartSurface/70 border-smartBorder/60 text-smartTextSecondary hover:text-smartTextPrimary hover:border-smartBorder'
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-smartTextSecondary uppercase tracking-wider">
                Filter Facilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MAP_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveFilter(opt.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-sans font-medium ${
                      activeFilter === opt.id
                        ? 'bg-signature text-smartBg border-signature'
                        : 'bg-smartSurface border-smartBorder/70 text-smartTextSecondary hover:text-smartTextPrimary hover:border-smartBorder'
                    }`}
                    aria-pressed={activeFilter === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-smartBorder/60" />

            {/* Facility details panel (when selected) */}
            <AnimatePresence mode="wait">
              {selectedFacility ? (
                <motion.div
                  key={selectedFacility.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <FacilityDetailsPanel
                    facility={selectedFacility}
                    isRecommended={
                      selectedFacility.id === MAP_AI_RECOMMENDATION.facilityId
                    }
                    onViewParking={handleViewParking}
                    onClose={handleDeselectFacility}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="ai-rec"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <AIRecPanel onSelectFacility={handleMarkerClick} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* ── MAP CANVAS ────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden bg-smartBg">
          {/* Background dot grid */}
          <div className="absolute inset-0 spatial-grid-dots opacity-40 pointer-events-none" />

          {/* Scalable map content */}
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* SVG Road Network */}
            <MapRoadNetwork />

            {/* Facility markers */}
            {filteredFacilities.map((facility) => (
              <FacilityMarker
                key={facility.id}
                facility={facility}
                isSelected={selectedFacilityId === facility.id}
                isRecommended={facility.id === MAP_AI_RECOMMENDATION.facilityId}
                onClick={() => handleMarkerClick(facility.id)}
              />
            ))}

            {/* No results indicator on map */}
            {filteredFacilities.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-2">
                  <SlidersHorizontal className="h-8 w-8 text-smartTextSecondary mx-auto" />
                  <p className="text-sm font-semibold text-smartTextPrimary">No facilities match filters</p>
                  <p className="text-xs text-smartTextSecondary">Adjust your search or zone selection</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Map Controls (top-right, not scaled) ── */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <IconButton
              variant="surface"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomIdx >= ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              variant="surface"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomIdx <= 0}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" />
            </IconButton>
            <div className="h-px bg-smartBorder/60 mx-1" />
            <IconButton
              variant="surface"
              size="sm"
              onClick={handleRecenter}
              aria-label="Recenter and reset zoom"
              title="Recenter map"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </IconButton>
          </div>

          {/* ── Map Legend (bottom-left, not scaled) ── */}
          <div className="absolute bottom-4 left-4 z-20">
            <MapLegend />
          </div>

          {/* ── Zoom level indicator ── */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <span className="text-[9px] font-mono text-smartTextSecondary bg-smartSurface/80 border border-smartBorder/60 px-2 py-1 rounded backdrop-blur-sm">
              {Math.round(zoomLevel * 100)}% ZOOM · METRO CENTRAL
            </span>
          </div>

          {/* ── Mobile bottom search strip ── */}
          <div className="absolute top-4 left-4 right-16 z-20 md:hidden">
            <div className="bg-smartSurface/90 border border-smartBorder/80 rounded-smart p-2 backdrop-blur-md flex items-center gap-2 shadow-xl">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search parking…"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                className="shrink-0 h-9 w-9 flex items-center justify-center bg-smartElevated border border-smartBorder rounded-smart text-smartTextSecondary hover:text-smartTextPrimary transition-colors"
                aria-label="Open filters panel"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Mobile filter pills ── */}
          <div className="absolute top-[4.5rem] left-4 right-4 z-20 md:hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {MAP_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveFilter(opt.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 transition-all font-sans font-medium ${
                    activeFilter === opt.id
                      ? 'bg-signature text-smartBg border-signature'
                      : 'bg-smartSurface/90 border-smartBorder/70 text-smartTextSecondary backdrop-blur-sm'
                  }`}
                  aria-pressed={activeFilter === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FACILITY CARD (slides up from bottom) ── */}
      <AnimatePresence>
        {selectedFacility && isMobilePanelOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-smartElevated border-t border-smartBorder rounded-t-[16px] shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-smartBorder" />
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Close button */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-signature">
                  Selected Facility
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobilePanelOpen(false)}
                  aria-label="Close facility panel"
                  className="text-smartTextSecondary hover:text-smartTextPrimary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <FacilityDetailsPanel
                facility={selectedFacility}
                isRecommended={
                  selectedFacility.id === MAP_AI_RECOMMENDATION.facilityId
                }
                onViewParking={handleViewParking}
                onClose={handleDeselectFacility}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOOR & SLOT DRAWER ──────────────────────────── */}
      <Drawer
        isOpen={isFloorDrawerOpen}
        onClose={handleCloseDrawer}
        title={selectedFacility?.name ?? 'Parking Bay Selection'}
      >
        {selectedFacility && (
          <div className="space-y-6 -mt-2">

            {/* Back button strip */}
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex items-center gap-1.5 text-[11px] font-mono text-smartTextSecondary hover:text-smartTextPrimary transition-colors -ml-1"
              aria-label="Back to map"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to map
            </button>

            {/* Facility summary header */}
            <div className="bg-smartBg/60 border border-smartBorder/40 rounded-smart p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold font-display text-smartTextPrimary leading-snug truncate">
                  {selectedFacility.shortName}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-smartTextSecondary">
                  <span>{selectedFacility.ratePerHour}</span>
                  <span>·</span>
                  <span>{selectedFacility.walkMinutes} min walk</span>
                </div>
              </div>
              <StatusBadge status={selectedFacility.status} />
            </div>

            {/* Selected slot confirmation — shown when a slot is picked */}
            <AnimatePresence>
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="bg-signature/10 border border-signature/50 rounded-smart-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-signature" />
                      <span className="text-xs font-bold font-display text-signature uppercase tracking-wider">
                        Slot Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-smartTextSecondary uppercase block">Facility</span>
                        <span className="font-semibold text-smartTextPrimary">{selectedFacility.shortName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-smartTextSecondary uppercase block">Floor</span>
                        <span className="font-semibold text-smartTextPrimary">{activeFloorId}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-smartTextSecondary uppercase block">Slot ID</span>
                        <span className="font-semibold text-smartTextPrimary">{selectedSlot.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-smartTextSecondary uppercase block">Rate</span>
                        <span className="font-semibold text-signature">{selectedFacility.ratePerHour}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleReserveSlot}
                        className="flex-1 text-[11px] uppercase tracking-wider font-semibold"
                      >
                        Reserve Slot
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSlotId(null)}
                        className="text-[11px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floor selector tabs */}
            {floorTabs.length > 0 && (
              <Tabs
                tabs={floorTabs}
                activeTab={activeFloorId}
                onChange={handleFloorChange}
              />
            )}

            {/* Slot grid for current floor */}
            {currentFloor ? (
              <FloorSlotGrid
                floor={currentFloor}
                selectedSlotId={selectedSlotId}
                onSlotClick={handleSlotClick}
              />
            ) : (
              <div className="text-center py-8 text-smartTextSecondary text-xs">
                No floor data available.
              </div>
            )}

            {/* Empty floor state */}
            {currentFloor && currentFloor.availableCount === 0 && (
              <div className="bg-occupied/10 border border-occupied/30 rounded-smart p-3 text-xs text-occupied font-mono text-center">
                This floor is currently at full capacity. Check another floor.
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ── Toast notification ──────────────────────────── */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        duration={5000}
      />
    </div>
  );
}
