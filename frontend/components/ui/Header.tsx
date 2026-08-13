'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, Search, Map, Sparkles } from 'lucide-react';
import { IconButton } from './IconButton';
import { Button } from './Button';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Live Map', href: '/map', highlight: true },
    { label: 'Intelligence', href: '/predictions' },
    { label: 'Bookings', href: '/bookings' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      {/* Floating Capsule Header Container */}
      <div className="w-full fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <header className="mx-auto max-w-5xl w-full bg-smartBg/75 backdrop-blur-xl border border-smartBorder rounded-full pointer-events-auto shadow-2xl h-12 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-1.5 group focus:outline-none">
              <div className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
              </div>
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-smartTextPrimary group-hover:text-white transition-colors">
                SmartPark<span className="text-signature">.</span>AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Global desktop navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[10px] font-sans font-semibold uppercase tracking-wider px-3.5 py-1.5 transition-colors rounded-full focus:outline-none focus-visible:text-smartTextPrimary ${
                    isActive
                      ? 'text-smartTextPrimary'
                      : item.highlight
                      ? 'text-signature hover:text-signature/85'
                      : 'text-smartTextSecondary hover:text-smartTextPrimary'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {item.highlight && <Map className="h-3 w-3 shrink-0" />}
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="navActiveUnderline"
                      className="absolute inset-0 bg-smartSurface border border-smartBorder rounded-full z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Area Actions */}
          <div className="flex items-center gap-1">
            {/* Quick Access to Lab / Design System */}
            <Link href="/design-system" className="hidden lg:inline-flex">
              <span className="text-[9px] font-mono text-smartTextSecondary hover:text-signature transition-colors px-2 py-1 bg-smartSurface/50 rounded border border-smartBorder/45 cursor-pointer">
                LAB v2.0
              </span>
            </Link>

            {/* Search Trigger */}
            <Link href="/search">
              <IconButton
                variant="ghost"
                size="sm"
                className={`h-8 w-8 ${pathname === '/search' ? 'bg-smartSurface border border-smartBorder text-signature' : ''}`}
                aria-label="Search places"
              >
                <Search className={`h-3.5 w-3.5 ${pathname === '/search' ? 'text-signature' : 'text-smartTextSecondary'}`} />
              </IconButton>
            </Link>

            {/* Notifications Trigger */}
            <div className="relative">
              <IconButton variant="ghost" size="sm" className="h-8 w-8" aria-label="View notifications">
                <Bell className="h-3.5 w-3.5 text-smartTextSecondary" />
              </IconButton>
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signature ring-1 ring-smartBg" />
            </div>

            {/* Profile Avatar */}
            <Link href="/profile">
              <IconButton
                variant="ghost"
                size="sm"
                className={`h-8 w-8 ${pathname === '/profile' ? 'bg-smartSurface border border-smartBorder text-signature' : ''}`}
                aria-label="Account profile"
              >
                <User className={`h-3.5 w-3.5 ${pathname === '/profile' ? 'text-signature' : 'text-smartTextSecondary'}`} />
              </IconButton>
            </Link>

            {/* Mobile Hamburger menu */}
            <IconButton
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </IconButton>
          </div>
        </header>
      </div>

      {/* Spacer to prevent overlap in non-absolute screens (e.g. standard content pages) */}
      <div className="h-20 w-full shrink-0 select-none pointer-events-none" />

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative ml-auto w-4/5 max-w-sm h-full bg-smartBg border-l border-smartBorder flex flex-col justify-between p-6 z-10"
            >
              <div className="flex flex-col gap-6">
                {/* Brand */}
                <div className="flex items-center justify-between border-b border-smartBorder/45 pb-4">
                  <span className="font-display text-sm font-semibold uppercase tracking-wider text-smartTextPrimary">
                    SmartPark<span className="text-signature">.</span>AI
                  </span>
                  <IconButton variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-3" aria-label="Global mobile navigation">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-xs font-sans font-semibold uppercase tracking-wider py-2 px-3 rounded border border-transparent hover:border-smartBorder/40 transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'text-signature bg-smartSurface border-smartBorder/60'
                            : item.highlight
                            ? 'text-signature/95'
                            : 'text-smartTextSecondary hover:text-smartTextPrimary'
                        }`}
                      >
                        {item.highlight && <Map className="h-3.5 w-3.5" />}
                        {item.label}
                      </Link>
                    );
                  })}
                  
                  {/* Lab Link on Mobile */}
                  <Link
                    href="/design-system"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-sans font-semibold uppercase tracking-wider py-2 px-3 rounded border border-transparent text-smartTextSecondary hover:text-smartTextPrimary transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Internal Lab
                  </Link>
                </nav>
              </div>

              {/* Mobile Footer Info */}
              <div className="border-t border-smartBorder/40 pt-4 flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-1.5 rounded-smart hover:bg-smartSurface transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-smartSurface border border-smartBorder flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-signature" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-smartTextPrimary">Pratham</div>
                    <div className="text-[9px] text-smartTextSecondary">Active Operator Session</div>
                  </div>
                </Link>
                <div className="text-[9px] font-mono text-smartTextSecondary/60 mt-2">
                  SMARTPARK AI V2.0.0 · USER ACCOUNT
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

Header.displayName = 'Header';
