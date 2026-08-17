'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { authService } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Status & Validation States
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showForgotNotice, setShowForgotNotice] = React.useState(false);

  // Field validation
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setShowForgotNotice(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await authService.login({
        email,
        password,
        rememberMe,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/home');
        }, 1200);
      } else {
        setApiError(res.error || 'Authentication failed. Please try again.');
      }
    } catch {
      setApiError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotNotice(true);
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col justify-between selection:bg-signature selection:text-smartBg">
      {/* SmartPark Navigation Header */}
      <Header />

      {/* Main Authentication Console */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Subtle grid pattern background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#282F34_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 my-auto">
          {/* Header branding / badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-smartSurface border border-smartBorder mb-3 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-smartTextSecondary">
                Identity & Access Console
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-smartTextPrimary">
              Welcome back to <span className="text-signature">SmartPark</span>
            </h1>
            <p className="text-xs sm:text-sm font-sans text-smartTextSecondary mt-1.5">
              Sign in to manage AI parking nodes, occupancy data, and live analytics.
            </p>
          </div>

          <Card className="p-6 sm:p-8 border-smartBorder bg-smartSurface/90 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Top status indicator line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-smartBorder via-signature/50 to-smartBorder" />

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center flex flex-col items-center justify-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-signature/15 border border-signature/40 flex items-center justify-center text-signature mb-1">
                    <CheckCircle2 className="h-6 w-6 animate-bounce" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-smartTextPrimary">
                    Authentication Successful
                  </h3>
                  <p className="text-xs text-smartTextSecondary max-w-xs font-sans">
                    Session token issued. Redirecting to your intelligent dashboard...
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="occupied">OPERATOR VERIFIED</Badge>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {/* Global API Error Notice */}
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-smart bg-occupied/10 border border-occupied/30 text-occupied text-xs font-sans flex items-start gap-2.5"
                      role="alert"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Authentication Error</span>
                        {apiError}
                      </div>
                    </motion.div>
                  )}

                  {/* Forgot Password Information Notice */}
                  {showForgotNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-smart bg-signature/10 border border-signature/30 text-smartTextPrimary text-xs font-sans flex items-start gap-2.5"
                    >
                      <KeyRound className="h-4 w-4 text-signature shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-signature">Password Recovery Demo</span>
                        Password recovery will be connected to the secure backend auth system later.
                      </div>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="operator@smartpark.ai"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      error={errors.email}
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input with Show/Hide toggle */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password-input"
                        className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-sans text-signature hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-signature rounded px-1"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        className={`w-full h-9 bg-smartSurface border ${
                          errors.password
                            ? 'border-occupied/50 focus:border-occupied/80'
                            : 'border-smartBorder focus:border-signature/60'
                        } rounded-smart pl-3 pr-10 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isLoading}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-smartTextSecondary hover:text-smartTextPrimary focus:outline-none p-1 rounded transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] font-sans text-occupied">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded bg-smartElevated border-smartBorder text-signature focus:ring-signature/60 focus:ring-offset-smartBg accent-[#B7F34A] cursor-pointer"
                      />
                      <span className="text-xs font-sans text-smartTextSecondary group-hover:text-smartTextPrimary transition-colors">
                        Remember this session
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full mt-2 font-semibold shadow-lg"
                  >
                    {!isLoading && (
                      <>
                        Sign In <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </AnimatePresence>

            {/* Separator / Footer Link */}
            <div className="mt-6 pt-4 border-t border-smartBorder/50 text-center">
              <p className="text-xs font-sans text-smartTextSecondary">
                Don&apos;t have an operator account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-signature hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-signature rounded px-1"
                >
                  Create an Account
                </Link>
              </p>
            </div>
          </Card>

          {/* Security footnote */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-smartTextSecondary/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-signature/70" /> 256-BIT ENCRYPTION
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> ISO 27001 SECURE
            </span>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="py-4 text-center text-[10px] font-mono text-smartTextSecondary/50 border-t border-smartBorder/20">
        SMARTPARK AI 2.0 · INTELLIGENT PARKING MANAGEMENT PLATFORM
      </footer>
    </div>
  );
}
