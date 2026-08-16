'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  Phone,
  Mail,
  User,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  SUPPORT_CATEGORIES,
  MOCK_FAQS,
  MOCK_CONTACT_OPTIONS,
  SupportCategoryType
} from '../../lib/supportData';
import { MOCK_FACILITY_DETAILS } from '../../lib/facilityData';

export default function SupportPage() {
  // Support state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<SupportCategoryType | 'ALL'>('ALL');
  
  // Accordion expanded FAQ items
  const [expandedFaqIds, setExpandedFaqIds] = React.useState<Record<string, boolean>>({});

  // Issue report form state
  const [issueType, setIssueType] = React.useState('');
  const [facility, setFacility] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Toast
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Toggle FAQ item expansion
  const toggleFaq = (id: string) => {
    setExpandedFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Clear search field helper
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Filtered FAQs computed properties
  const filteredFaqs = React.useMemo(() => {
    return MOCK_FAQS.filter((faq) => {
      // Category filter
      if (selectedCategory !== 'ALL' && faq.category !== selectedCategory) {
        return false;
      }
      // Search term query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  // Form submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!issueType) {
      errors.issueType = 'Please select an issue type.';
    }
    if (!facility) {
      errors.facility = 'Please specify a facility.';
    }
    if (!description.trim() || description.length < 10) {
      errors.description = 'Description must be at least 10 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerToast('Please correct form errors before submitting.', 'error');
      return;
    }

    // Success simulation
    setFormErrors({});
    setIssueType('');
    setFacility('');
    setDescription('');
    triggerToast('Report saved in prototype mode.', 'success');
  };

  // Form facility dropdown list
  const facilityOptions = React.useMemo(() => {
    return MOCK_FACILITY_DETAILS.map((fac) => ({
      value: fac.id,
      label: fac.name
    }));
  }, []);

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-smartBorder/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-signature" />
              SMARTPARK SUPPORT
            </h1>
            <p className="text-xs sm:text-sm text-smartTextSecondary">
              Find answers, resolve parking issues, and get help when you need it.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-smartSurface border border-smartBorder px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-mono">
              <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
              <span>Ops Center Live</span>
            </div>
          </div>
        </div>

        {/* HERO SEARCH SECTION */}
        <div className="relative">
          <Card variant="elevated" padding="lg" className="border-signature/25 bg-gradient-to-r from-smartElevated via-smartSurface to-signature/5">
            <div className="max-w-2xl mx-auto space-y-4 text-center py-4">
              <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                Search our Help Guides
              </h2>
              
              {/* Search bar */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-smartTextSecondary">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type keywords (e.g. parking, booking, AI, payments, operator)..."
                  className="w-full h-10 bg-smartBg border border-smartBorder rounded-smart pl-10 pr-10 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none focus:border-signature/60 transition-colors duration-150"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-smartTextSecondary hover:text-signature"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="text-[10px] font-mono text-smartTextSecondary">
                Try searching: <span className="text-smartTextPrimary">parking</span>, <span className="text-smartTextPrimary">cancelling</span>, or <span className="text-smartTextPrimary">AI predictions</span>
              </div>
            </div>
          </Card>
        </div>

        {/* WORKSPACE CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT: CATEGORIES & QUICK LINKS */}
          <div className="space-y-6">
            
            {/* QUICK HELP CATEGORIES */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-smartTextSecondary">
                Filter by Category
              </h3>
              
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`text-left text-xs px-3 py-2 rounded border uppercase font-mono font-bold transition-all shrink-0 w-auto md:w-full ${
                    selectedCategory === 'ALL'
                      ? 'bg-signature border-signature text-smartBg'
                      : 'bg-smartSurface border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                  }`}
                >
                  All Categories
                </button>
                {SUPPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left text-xs px-3 py-2 rounded border uppercase font-mono font-bold transition-all shrink-0 w-auto md:w-full ${
                      selectedCategory === cat.id
                        ? 'bg-signature border-signature text-smartBg'
                        : 'bg-smartSurface border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* COMMON TASKS QUICK NAVIGATION */}
            <Card variant="default" className="space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-smartTextSecondary border-b border-smartBorder/60 pb-1.5">
                Common Tasks
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-xs font-mono font-bold uppercase">
                <Link href="/search" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>FIND PARKING</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
                <Link href="/map" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>VIEW LIVE MAP</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
                <Link href="/bookings" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>MY BOOKINGS</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
                <Link href="/profile" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>MY PROFILE</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
                <Link href="/notifications" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>NOTIFICATIONS</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
                <Link href="/intelligence" className="flex items-center justify-between p-2 rounded bg-smartBg border border-smartBorder hover:border-signature/40 hover:text-signature transition-colors">
                  <span>AI FORECASTS</span>
                  <ChevronRight className="h-3.5 w-3.5 text-signature" />
                </Link>
              </div>
            </Card>

            {/* SYSTEM STATUS CARD */}
            <Card variant="default" className="space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-smartTextSecondary">
                SUPPORT STATUS
              </h3>
              
              <div className="divide-y divide-smartBorder/45 text-xs font-mono">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-smartTextSecondary uppercase">Support Desk</span>
                  <span className="font-bold text-available uppercase">ONLINE</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-smartTextSecondary uppercase">Parking Grid</span>
                  <span className="font-bold text-available uppercase">ONLINE</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-smartTextSecondary uppercase">Booking Layer</span>
                  <span className="font-bold text-signature uppercase">PROTOTYPE</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-smartTextSecondary uppercase">AI Engine</span>
                  <span className="font-bold text-signature uppercase">PROTOTYPE</span>
                </div>
              </div>
            </Card>

          </div>

          {/* RIGHT: FAQs, ISSUE SUBMISSION FORM & DIRECT CONTACTS */}
          <div className="md:col-span-2 space-y-6">
            
            {/* COMMON QUESTIONS / ACCORDION */}
            <Card variant="default" className="space-y-4">
              <div className="border-b border-smartBorder/60 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                  COMMON QUESTIONS
                </h3>
                {selectedCategory !== 'ALL' && (
                  <Badge variant="signature" className="text-[8px] uppercase font-mono">
                    Category: {selectedCategory}
                  </Badge>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="py-6">
                  <EmptyState
                    title="No matching help articles found"
                    description={`We couldn't find any FAQs matching keywords: "${searchQuery}".`}
                    actionText="Clear Search"
                    onAction={handleClearSearch}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = !!expandedFaqIds[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className="bg-smartBg/60 border border-smartBorder/60 rounded-smart overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={isExpanded}
                          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-smartTextPrimary hover:bg-smartSurface/50 transition-colors focus:outline-none focus:bg-smartSurface"
                        >
                          <span className="pr-4">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-smartTextSecondary shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-smartTextSecondary shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs text-smartTextSecondary leading-relaxed border-t border-smartBorder/40 bg-smartSurface/20">
                            <p className="mb-2">{faq.answer}</p>
                            <Badge variant="outline" className="text-[8px] font-mono tracking-widest uppercase">
                              {faq.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* REPORT A PARKING ISSUE FORM */}
            <Card variant="default" className="space-y-4">
              <div className="border-b border-smartBorder/60 pb-3">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                  REPORT A PARKING ISSUE
                </h3>
                <p className="text-[10px] text-smartTextSecondary">
                  Log operational issues with sensor readings or barriers
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Issue Type */}
                  <Select
                    label="Issue Type"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    placeholder="Select issue type..."
                    options={[
                      { value: 'Facility Full', label: 'Facility Full' },
                      { value: 'Slot Unavailable', label: 'Slot Unavailable' },
                      { value: 'Incorrect Availability', label: 'Incorrect Availability' },
                      { value: 'Entry/Exit Issue', label: 'Entry/Exit Issue' },
                      { value: 'Payment Issue', label: 'Payment Issue' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />

                  {/* Facility selection */}
                  <Select
                    label="Affected Facility"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    placeholder="Select facility..."
                    options={facilityOptions}
                  />

                </div>

                {/* Validation warnings inline */}
                {(formErrors.issueType || formErrors.facility) && (
                  <div className="text-[11px] font-sans text-occupied space-y-1">
                    {formErrors.issueType && <p>• {formErrors.issueType}</p>}
                    {formErrors.facility && <p>• {formErrors.facility}</p>}
                  </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="issue-description" className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary">
                    Description & Observations
                  </label>
                  <textarea
                    id="issue-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide details about the issue (minimum 10 characters)..."
                    className="w-full bg-smartSurface border border-smartBorder rounded-smart p-3 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none focus:border-signature/60 transition-colors duration-150"
                  />
                  {formErrors.description && (
                    <p className="text-[11px] font-sans text-occupied">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="text-xs h-9 gap-1.5 px-5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    SUBMIT REPORT
                  </Button>
                </div>
              </form>
            </Card>

            {/* CONTACT CHANNEL GRID */}
            <Card variant="default" className="space-y-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/60 pb-3">
                CONTACT SUPPORT
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_CONTACT_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3.5 bg-smartBg/60 border border-smartBorder/50 rounded-smart flex flex-col justify-between space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <strong className="text-smartTextPrimary block">{opt.name}</strong>
                      <p className="text-[11px] text-smartTextSecondary leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-smartBorder/35 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-smartTextSecondary uppercase">
                        {opt.details}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => triggerToast('Support channel available after backend integration.', 'info')}
                        className="text-[9px] h-7"
                      >
                        {opt.actionText}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </div>

      </main>

      {/* TOAST NOTIFICATION */}
      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        type={toastType}
      />
    </div>
  );
}
