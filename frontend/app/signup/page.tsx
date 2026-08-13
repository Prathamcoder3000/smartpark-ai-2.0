'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, User, Mail, Lock, CheckSquare, AlertCircle } from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { authService } from '../../lib/auth';

export default function SignUpPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Status & Validation States
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Field validation
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

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

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service & Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await authService.signUp({
        name,
        email,
        password,
        confirmPassword,
        agreeToTerms: agreeTerms,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1200);
      } else {
        setApiError(res.error || 'Account creation failed. Please try again.');
      }
    } catch {
      setApiError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                Platform Registration
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-smartTextPrimary">
              Create your <span className="text-signature">SmartPark</span> Account
            </h1>
            <p className="text-xs sm:text-sm font-sans text-smartTextSecondary mt-1.5">
              Gain instant access to real-time space tracking, telemetry, and smart bookings.
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
                    Account Provisioned
                  </h3>
                  <p className="text-xs text-smartTextSecondary max-w-xs font-sans">
                    Welcome aboard, {name}! Your SmartPark profile has been created. Redirecting to live workspace...
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="occupied">ACCOUNT ACTIVE</Badge>
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
                        <span className="font-semibold block">Registration Error</span>
                        {apiError}
                      </div>
                    </motion.div>
                  )}

                  {/* Full Name Input */}
                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      error={errors.name}
                      required
                      autoComplete="name"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="alex@smartpark.ai"
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
                    <label
                      htmlFor="password-signup"
                      className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password-signup"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
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

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label
                      htmlFor="confirm-password-signup"
                      className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password-signup"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      className={`w-full h-9 bg-smartSurface border ${
                        errors.confirmPassword
                          ? 'border-occupied/50 focus:border-occupied/80'
                          : 'border-smartBorder focus:border-signature/60'
                      } rounded-smart px-3 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-[11px] font-sans text-occupied">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex flex-col gap-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                        }}
                        disabled={isLoading}
                        className="h-4 w-4 mt-0.5 rounded bg-smartElevated border-smartBorder text-signature focus:ring-signature/60 focus:ring-offset-smartBg accent-[#B7F34A] cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-sans text-smartTextSecondary group-hover:text-smartTextPrimary transition-colors leading-tight">
                        I agree to the SmartPark AI{' '}
                        <span className="text-smartTextPrimary font-medium">Terms of Service</span> &{' '}
                        <span className="text-smartTextPrimary font-medium">Privacy Policy</span>.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-[11px] font-sans text-occupied pl-6">{errors.terms}</p>
                    )}
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
                        Create Account <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </AnimatePresence>

            {/* Separator / Footer Link */}
            <div className="mt-6 pt-4 border-t border-smartBorder/50 text-center">
              <p className="text-xs font-sans text-smartTextSecondary">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-signature hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-signature rounded px-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </Card>

          {/* Security footnote */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-smartTextSecondary/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-signature/70" /> SECURE REGISTRATION
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> ZERO-TRUST ARCHITECTURE
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
