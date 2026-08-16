'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search as SearchIcon,
  X,
  MapPin,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Navigation,
  Star,
  Check,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

import {
  POPULAR_DESTINATIONS,
  RECENT_SEARCHES,
  MOCK_SEARCH_FACILITIES,
  MOCK_SEARCH_SUGGESTIONS,
  SearchFacility,
  SearchFilters,
  SearchSort,
  SearchSuggestion,
} from '../../lib/searchData';

export default function SearchPage() {
  // Search query & suggestion states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeLocationLabel, setActiveLocationLabel] = React.useState('Central Metro');
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Selected details modal
  const [selectedFacility, setSelectedFacility] = React.useState<SearchFacility | null>(null);

  // Filters State
  const [filters, setFilters] = React.useState<SearchFilters>({
    availability: 'ALL',
    evOnly: false,
    coveredOnly: false,
    securityOnly: false,
    maxPrice: 0,
    maxDistance: 0,
  });

  // Sort State
  const [sortOption, setSortOption] = React.useState<SearchSort>('RECOMMENDED');

  // Trigger search handler with simulated loading pulse
  const triggerSearch = (queryText: string) => {
    setSearchQuery(queryText);
    if (queryText.trim()) {
      setActiveLocationLabel(queryText);
    }
    setIsInputFocused(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveLocationLabel('All Locations');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      availability: 'ALL',
      evOnly: false,
      coveredOnly: false,
      securityOnly: false,
      maxPrice: 0,
      maxDistance: 0,
    });
    setSortOption('RECOMMENDED');
  };

  // Dynamic suggestion list based on query
  const suggestionsList: SearchSuggestion[] = React.useMemo(() => {
    if (!searchQuery.trim()) return MOCK_SEARCH_SUGGESTIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_SEARCH_SUGGESTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered & Sorted Facilities
  const processedFacilities = React.useMemo(() => {
    let result = [...MOCK_SEARCH_FACILITIES];

    // Search query text filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.zone.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.shortName.toLowerCase().includes(q)
      );
    }

    // Availability filter
    if (filters.availability === 'AVAILABLE') {
      result = result.filter((f) => f.status === 'AVAILABLE');
    } else if (filters.availability === 'LIMITED') {
      result = result.filter((f) => f.status === 'LIMITED');
    }

    // Feature filters
    if (filters.evOnly) {
      result = result.filter((f) => f.hasEv);
    }
    if (filters.coveredOnly) {
      result = result.filter((f) => f.isCovered);
    }
    if (filters.securityOnly) {
      result = result.filter((f) => f.hasSecurity);
    }

    // Price filter
    if (filters.maxPrice > 0) {
      result = result.filter((f) => f.priceNum <= filters.maxPrice);
    }

    // Distance filter
    if (filters.maxDistance > 0) {
      result = result.filter((f) => f.distanceKm <= filters.maxDistance);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'RECOMMENDED') {
        if (a.isRecommended) return -1;
        if (b.isRecommended) return 1;
        return a.distanceKm - b.distanceKm;
      }
      if (sortOption === 'CLOSEST') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortOption === 'LOWEST_PRICE') {
        return a.priceNum - b.priceNum;
      }
      if (sortOption === 'HIGHEST_AVAILABILITY') {
        return b.availableBays - a.availableBays;
      }
      return 0;
    });

    return result;
  }, [searchQuery, filters, sortOption]);

  // Featured SmartPark recommendation (if available)
  const topRecommended = React.useMemo(() => {
    return MOCK_SEARCH_FACILITIES.find((f) => f.isRecommended) || MOCK_SEARCH_FACILITIES[0];
  }, []);

  // Check active filter count
  const activeFilterCount =
    (filters.availability !== 'ALL' ? 1 : 0) +
    (filters.evOnly ? 1 : 0) +
    (filters.coveredOnly ? 1 : 0) +
    (filters.securityOnly ? 1 : 0) +
    (filters.maxPrice > 0 ? 1 : 0) +
    (filters.maxDistance > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-4">
        {/* -------------------------------------------------- */}
        {/* 1. SEARCH PAGE HEADER */}
        {/* -------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-smartBorder/60 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                Search Parking
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-signature/10 border border-signature/30 text-signature">
                AI ENGINE READY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-smartTextSecondary">
              Find the right parking option before you arrive.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-smartSurface border border-smartBorder px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-smartTextPrimary">
                Live Grid Sync
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* 2. MAIN SEARCH CONSOLE */}
        {/* -------------------------------------------------- */}
        <div className="relative mb-8">
          <Card variant="elevated" padding="lg" className="border-signature/25 relative z-20">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-signature">
                  <SearchIcon className="h-4 w-4" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  placeholder="Search destination, landmark, or parking zone (e.g. Cyber City, Central Metro)..."
                  className="w-full h-11 bg-smartSurface border border-smartBorder/80 rounded-smart pl-10 pr-10 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/50 outline-none focus:border-signature/70 transition-all"
                  aria-label="Search parking destination or facility"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-smartTextSecondary hover:text-smartTextPrimary p-1 rounded-full hover:bg-smartBg"
                    aria-label="Clear search input"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                onClick={() => triggerSearch(searchQuery)}
                className="h-11 px-6 text-xs shrink-0 flex items-center justify-center gap-2"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                Search Parking
              </Button>
            </div>

            {/* Popular Destinations Chips */}
            <div className="mt-4 pt-3 border-t border-smartBorder/40 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-smartTextSecondary mr-1">
                Popular:
              </span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => triggerSearch(dest.name)}
                  className={`text-[11px] font-sans px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                    searchQuery === dest.name
                      ? 'bg-signature/15 border-signature/50 text-signature font-medium'
                      : 'bg-smartSurface/70 border-smartBorder/60 text-smartTextSecondary hover:text-smartTextPrimary hover:border-smartBorder'
                  }`}
                >
                  <MapPin className="h-3 w-3 text-signature/70" />
                  {dest.name}
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-smartTextSecondary mr-1">
                Recent:
              </span>
              {RECENT_SEARCHES.map((term, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => triggerSearch(term)}
                  className="text-[10px] font-mono text-smartTextSecondary/80 hover:text-signature transition-colors underline underline-offset-2"
                >
                  {term}
                </button>
              ))}
            </div>
          </Card>

          {/* -------------------------------------------------- */}
          {/* 3. SEARCH SUGGESTIONS DROPDOWN */}
          {/* -------------------------------------------------- */}
          {isInputFocused && suggestionsList.length > 0 && (
            <>
              {/* Backdrop to dismiss on outside click */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsInputFocused(false)}
              />

              <div className="absolute left-0 right-0 top-full mt-2 bg-smartElevated border border-smartBorder rounded-smart shadow-2xl z-40 overflow-hidden max-h-72 overflow-y-auto">
                <div className="px-3 py-2 border-b border-smartBorder/50 text-[10px] font-mono uppercase text-smartTextSecondary flex items-center justify-between">
                  <span>SmartPark Auto-Suggestions</span>
                  <span>{suggestionsList.length} options</span>
                </div>

                <div className="divide-y divide-smartBorder/40">
                  {suggestionsList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => triggerSearch(item.label)}
                      className="w-full px-4 py-2.5 text-left hover:bg-smartSurface/90 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.type === 'FACILITY' && <MapPin className="h-3.5 w-3.5 text-signature" />}
                        {item.type === 'DESTINATION' && <Navigation className="h-3.5 w-3.5 text-aiBlue" />}
                        {item.type === 'ZONE' && <Sparkles className="h-3.5 w-3.5 text-limited" />}

                        <div>
                          <div className="text-xs font-semibold text-smartTextPrimary group-hover:text-signature transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10px] font-mono text-smartTextSecondary">
                            {item.category}
                          </div>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[9px]">
                        {item.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* 5. SMARTPARK RECOMMENDATION HERO */}
        {/* -------------------------------------------------- */}
        {topRecommended && !searchQuery && (
          <div className="mb-8">
            <Card
              variant="elevated"
              padding="lg"
              className="border-signature/40 bg-gradient-to-r from-smartElevated via-smartSurface to-signature/10 relative overflow-hidden shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="signature" className="px-2.5 py-1 text-[11px] font-bold">
                      <Sparkles className="h-3 w-3 mr-1 inline" />
                      SMARTPARK RECOMMENDED
                    </Badge>
                    <span className="text-xs font-mono font-bold text-signature bg-signature/10 border border-signature/30 px-2 py-0.5 rounded">
                      {topRecommended.confidenceScore} AI Confidence
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-display text-smartTextPrimary">
                      {topRecommended.name}
                    </h2>
                    <p className="text-xs text-smartTextSecondary font-sans">
                      {topRecommended.location} ({topRecommended.zone})
                    </p>
                  </div>

                  {/* Recommendation Reason Bullet Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {topRecommended.recommendationReasons?.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-sans text-smartTextPrimary">
                        <Check className="h-3.5 w-3.5 text-signature shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-smartBorder/40">
                  <div className="text-left md:text-right">
                    <div className="text-xl font-bold font-mono text-signature">
                      {topRecommended.priceFormatted}
                    </div>
                    <div className="text-[11px] text-smartTextSecondary font-mono">
                      {topRecommended.availableBays} bays available • {topRecommended.walkMinutes} min walk
                    </div>
                  </div>

                  <Link href="/map">
                    <Button variant="primary" size="md" className="gap-2 shadow-lg text-xs">
                      View On Live Map
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* 6. FILTERS & 7. SORTING CONTROLS BAR */}
        {/* -------------------------------------------------- */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-smartSurface border border-smartBorder p-4 rounded-smart">
            
            {/* Filter Controls Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary shrink-0 flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-signature" />
                Filters
              </span>

              {/* Availability Filter */}
              <button
                type="button"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    availability: f.availability === 'AVAILABLE' ? 'ALL' : 'AVAILABLE',
                  }))
                }
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 font-sans ${
                  filters.availability === 'AVAILABLE'
                    ? 'bg-available/15 border-available/50 text-available font-semibold'
                    : 'bg-smartElevated border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                High Availability
              </button>

              {/* EV Only Filter */}
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, evOnly: !f.evOnly }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 font-sans flex items-center gap-1.5 ${
                  filters.evOnly
                    ? 'bg-signature/15 border-signature/50 text-signature font-semibold'
                    : 'bg-smartElevated border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                <Zap className="h-3 w-3" />
                EV Ready
              </button>

              {/* Covered Only Filter */}
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, coveredOnly: !f.coveredOnly }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 font-sans flex items-center gap-1.5 ${
                  filters.coveredOnly
                    ? 'bg-signature/15 border-signature/50 text-signature font-semibold'
                    : 'bg-smartElevated border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                <Shield className="h-3 w-3" />
                Covered Parking
              </button>

              {/* 24/7 Security Filter */}
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, securityOnly: !f.securityOnly }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 font-sans flex items-center gap-1.5 ${
                  filters.securityOnly
                    ? 'bg-signature/15 border-signature/50 text-signature font-semibold'
                    : 'bg-smartElevated border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                24/7 Security
              </button>

              {/* Under ₹100 Price Filter */}
              <button
                type="button"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    maxPrice: f.maxPrice === 100 ? 0 : 100,
                  }))
                }
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 font-sans ${
                  filters.maxPrice === 100
                    ? 'bg-signature/15 border-signature/50 text-signature font-semibold'
                    : 'bg-smartElevated border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                Under ₹100/hr
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-smartBorder/40 pt-3 md:pt-0">
              <span className="text-xs font-mono text-smartTextSecondary uppercase flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sort:
              </span>
              <Select
                options={[
                  { value: 'RECOMMENDED', label: 'SmartPark Recommended' },
                  { value: 'CLOSEST', label: 'Closest Distance' },
                  { value: 'LOWEST_PRICE', label: 'Lowest Price' },
                  { value: 'HIGHEST_AVAILABILITY', label: 'Highest Availability' },
                ]}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SearchSort)}
                className="w-48 text-xs"
              />
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* 8. RESULT COUNT / SEARCH STATUS BAR */}
          {/* -------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
            <div className="text-smartTextSecondary font-sans">
              Found <strong className="text-smartTextPrimary font-mono">{processedFacilities.length}</strong> parking facilities near{' '}
              <strong className="text-signature font-mono">{activeLocationLabel}</strong>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-signature bg-signature/10 border border-signature/30 px-2 py-0.5 rounded">
                  {activeFilterCount} active filters
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-smartTextSecondary hover:text-signature underline underline-offset-2 font-sans"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* 11. LOADING STATE */}
        {/* -------------------------------------------------- */}
        {isLoading ? (
          <div className="space-y-4 my-8">
            <LoadingSkeleton variant="rect" height="120px" className="w-full" />
            <LoadingSkeleton variant="rect" height="120px" className="w-full" />
          </div>
        ) : processedFacilities.length === 0 ? (
          /* -------------------------------------------------- */
          /* 10. EMPTY / NO RESULTS STATE */
          /* -------------------------------------------------- */
          <div className="my-8">
            <EmptyState
              title="No parking options match your current filters"
              description="Try adjusting your maximum price, distance radius, or clearing feature toggles to view available parking facilities."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          /* -------------------------------------------------- */
          /* 4. SEARCH RESULTS GRID */
          /* -------------------------------------------------- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedFacilities.map((facility) => (
              <Card
                key={facility.id}
                variant="default"
                padding="md"
                className="hover:border-smartBorder/90 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold font-display text-smartTextPrimary group-hover:text-signature transition-colors">
                          {facility.name}
                        </h3>
                        {facility.isRecommended && (
                          <Badge variant="signature" className="text-[9px]">
                            AI CHOICE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-smartTextSecondary font-sans">
                        {facility.location}
                      </p>
                    </div>

                    <StatusBadge status={facility.status} />
                  </div>

                  {/* Badges & Rating */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs font-bold font-mono text-smartTextPrimary flex items-center gap-1 bg-smartElevated border border-smartBorder px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 text-signature fill-signature" />
                      {facility.rating}
                    </span>

                    {facility.hasEv && <Badge variant="signature">EV CHARGING</Badge>}
                    {facility.isCovered && <Badge variant="default">COVERED</Badge>}
                    {facility.hasSecurity && <Badge variant="outline">24/7 SECURITY</Badge>}
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-smartBorder/40 font-mono text-xs">
                    <div className="bg-smartBg/60 p-2 rounded border border-smartBorder/50">
                      <span className="text-[9px] text-smartTextSecondary block uppercase">Bays Open</span>
                      <span className="font-bold text-smartTextPrimary">
                        {facility.availableBays} <span className="text-[10px] text-smartTextSecondary font-normal">/ {facility.totalBays}</span>
                      </span>
                    </div>

                    <div className="bg-smartBg/60 p-2 rounded border border-smartBorder/50">
                      <span className="text-[9px] text-smartTextSecondary block uppercase">Dist / ETA</span>
                      <span className="font-bold text-smartTextPrimary">
                        {facility.distanceKm} km <span className="text-[10px] text-smartTextSecondary font-normal">({facility.walkMinutes} min)</span>
                      </span>
                    </div>

                    <div className="bg-smartBg/60 p-2 rounded border border-smartBorder/50">
                      <span className="text-[9px] text-smartTextSecondary block uppercase">Hourly Rate</span>
                      <span className="font-bold text-signature">{facility.priceFormatted}</span>
                    </div>
                  </div>

                  {/* AI Availability Forecast tag */}
                  <div className="text-[11px] font-mono text-smartTextSecondary flex items-center gap-1.5 pt-1">
                    <TrendingUp className="h-3 w-3 text-aiBlue shrink-0" />
                    <span>Forecast: <strong className="text-smartTextPrimary">{facility.predictedAvailability}</strong></span>
                  </div>
                </div>

                {/* 9. FACILITY ACTIONS */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-smartBorder/40">
                  <Link href={`/facility/${facility.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs h-8"
                    >
                      View Details
                    </Button>
                  </Link>

                  <Link href="/map">
                    <Button variant="primary" size="sm" className="text-xs h-8 gap-1">
                      View Parking
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* -------------------------------------------------- */}
      {/* FACILITY DETAILS MODAL */}
      {/* -------------------------------------------------- */}
      {selectedFacility && (
        <Modal
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
          title={selectedFacility.name}
          size="lg"
        >
          <div className="space-y-5 text-xs text-smartTextSecondary font-sans">
            <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
              <div>
                <div className="text-sm font-semibold text-smartTextPrimary font-display">
                  {selectedFacility.location}
                </div>
                <div className="text-[11px] font-mono text-smartTextSecondary">
                  {selectedFacility.zone}
                </div>
              </div>
              <StatusBadge status={selectedFacility.status} />
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-1">
                  Available Bays
                </span>
                <span className="text-base font-bold font-mono text-smartTextPrimary">
                  {selectedFacility.availableBays} / {selectedFacility.totalBays}
                </span>
              </div>

              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-1">
                  Occupancy Rate
                </span>
                <span className="text-base font-bold font-mono text-smartTextPrimary">
                  {selectedFacility.occupancyPct}%
                </span>
              </div>

              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-1">
                  Walking Distance
                </span>
                <span className="text-base font-bold font-mono text-smartTextPrimary">
                  {selectedFacility.distanceKm} km ({selectedFacility.walkMinutes} min)
                </span>
              </div>

              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart">
                <span className="text-[9px] font-mono text-smartTextSecondary uppercase block mb-1">
                  Hourly Rate
                </span>
                <span className="text-base font-bold font-mono text-signature">
                  {selectedFacility.priceFormatted}
                </span>
              </div>
            </div>

            {/* AI Prediction Breakdown */}
            <div className="p-3.5 bg-aiBlue/10 border border-aiBlue/30 rounded-smart space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-aiBlue">
                <Sparkles className="h-4 w-4" />
                AI Occupancy Prediction & Stability
              </div>
              <p className="text-xs text-smartTextPrimary">
                {selectedFacility.predictedAvailability}. Predictive confidence score is rated at <strong className="text-signature font-mono">96.8%</strong> based on historical sensor feeds.
              </p>
            </div>

            {/* Amenities List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                Facility Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFacility.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-xs font-sans px-2.5 py-1 rounded bg-smartSurface border border-smartBorder text-smartTextPrimary flex items-center gap-1.5"
                  >
                    <Check className="h-3 w-3 text-signature" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-smartBorder flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFacility(null)}
              >
                Close Window
              </Button>
              <Link href="/map">
                <Button variant="primary" size="sm" className="gap-1.5">
                  Navigate on Live Map
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
