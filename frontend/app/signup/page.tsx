'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, Lock, Cpu, AlertCircle, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Toast } from '../../components/ui/Toast';
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

  // Toast state
  const [toast, setToast] = React.useState<{ isOpen: boolean; message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/home');
    }
  }, [router]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  // Live password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: 'No Password', color: 'bg-smartBorder' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, text: 'Weak Password', color: 'bg-occupied' };
    if (score <= 3) return { score: 65, text: 'Medium Password', color: 'bg-limited' };
    return { score: 100, text: 'Strong Password', color: 'bg-available' };
  };

  const passwordStrength = getPasswordStrength();

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
      newErrors.terms = 'You must agree to the Terms & Conditions';
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
        triggerToast('Registration completed successfully!', 'success');
        setTimeout(() => {
          router.push('/home');
        }, 1200);
      } else {
        setApiError(res.error || 'Account creation failed. Please try again.');
        triggerToast(res.error || 'Signup conflict. Account may already exist.', 'error');
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected network error occurred. Please try again.';
      setApiError(msg);
      triggerToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    triggerToast(`${provider} authentication will be connected in the real authentication phase.`, 'info');
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col justify-between selection:bg-signature selection:text-smartBg relative overflow-x-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#181D21_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-signature/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <div className="w-full fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <header className="mx-auto max-w-5xl w-full bg-smartBg/85 backdrop-blur-md border border-smartBorder rounded-full pointer-events-auto shadow-2xl h-12 flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1.5 group focus:outline-none">
            <div className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-signature" />
            </div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-smartTextPrimary group-hover:text-white transition-colors">
              SmartPark<span className="text-signature">.</span>AI
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[10px] uppercase font-mono font-bold tracking-wider text-smartTextSecondary hover:text-smartTextPrimary transition-colors">
              Back to Home
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="h-8 text-[10px] uppercase font-mono px-3">
                Login
              </Button>
            </Link>
          </div>
        </header>
      </div>

      <div className="h-20" />

      {/* Main Console */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 my-auto items-center">
          
          {/* Form Panel */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-smartSurface border border-smartBorder mb-3 shadow-inner">
                <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-smartTextSecondary">
                  Platform Registration
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                Create your <span className="text-signature">SmartPark</span> Account
              </h1>
              <p className="text-xs sm:text-sm font-sans text-smartTextSecondary mt-1.5">
                Personalize your parking experience and let SmartPark find better spots for you.
              </p>
            </div>

            <Card className="p-6 sm:p-8 border-smartBorder bg-smartSurface/90 backdrop-blur-md shadow-2xl relative overflow-hidden text-left">
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
                      Account Registered Successfully
                    </h3>
                    <p className="text-xs text-smartTextSecondary max-w-xs font-sans">
                      Setting up your smart driver dashboard...
                    </p>
                    <div className="mt-2">
                      <Badge variant="signature">WELCOME ABOARD</Badge>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

                    <div>
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        error={errors.name}
                        required
                        disabled={isLoading}
                        className="bg-smartBg border-smartBorder focus:border-signature/85 focus:ring-1 focus:ring-signature/40 text-smartTextPrimary"
                      />
                    </div>

                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="driver@smartpark.ai"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        error={errors.email}
                        required
                        autoComplete="email"
                        disabled={isLoading}
                        className="bg-smartBg border-smartBorder focus:border-signature/85 focus:ring-1 focus:ring-signature/40 text-smartTextPrimary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label
                        htmlFor="password-input"
                        className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
                      >
                        Password
                      </label>
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
                          className={`w-full h-9 bg-smartBg border ${
                            errors.password
                              ? 'border-occupied/50 focus:border-occupied/80'
                              : 'border-smartBorder focus:border-signature/80 focus:ring-1 focus:ring-signature/40'
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

                      {/* Password strength indicator */}
                      {password && (
                        <div className="space-y-1.5 mt-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-smartTextSecondary">STRENGTH:</span>
                            <span className="text-white font-bold">{passwordStrength.text}</span>
                          </div>
                          <div className="h-1 w-full bg-smartBg rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                          </div>
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="text-[11px] font-sans text-occupied">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        error={errors.confirmPassword}
                        required
                        disabled={isLoading}
                        className="bg-smartBg border-smartBorder focus:border-signature/85 focus:ring-1 focus:ring-signature/40 text-smartTextPrimary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                          }}
                          disabled={isLoading}
                          className="h-4 w-4 mt-0.5 rounded bg-smartElevated border-smartBorder text-signature focus:ring-signature/60 focus:ring-offset-smartBg accent-[#B7F34A] cursor-pointer"
                        />
                        <span className="text-[11px] font-sans text-smartTextSecondary group-hover:text-smartTextPrimary transition-colors leading-snug">
                          I agree to the Terms of Service and Privacy Policy
                        </span>
                      </label>
                      {errors.terms && (
                        <p className="text-[11px] font-sans text-occupied">{errors.terms}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full mt-2 font-semibold shadow-lg text-xs uppercase font-mono tracking-wider"
                    >
                      {!isLoading && (
                        <>
                          Create Account <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>

                    <div className="relative my-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-smartBorder/60"></div>
                      </div>
                      <span className="relative px-3 bg-[#111519] text-[9px] font-mono text-smartTextSecondary uppercase tracking-widest">
                        Or Continue With
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {['Google', 'Apple', 'Microsoft'].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => handleSocialLogin(prov)}
                          className="h-9 rounded bg-[#181D21] border border-smartBorder hover:border-signature/40 hover:text-white transition-colors duration-150 flex items-center justify-center gap-1.5 text-xs text-smartTextSecondary font-sans font-semibold"
                        >
                          {prov === 'Google' && (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.535 0-6.4-2.865-6.4-6.4s2.865-6.4 6.4-6.4c1.782 0 3.32.732 4.474 1.92l3.178-3.178C19.49 2.215 16.037 1 12.24 1 5.756 1 .5 6.256.5 12.75s5.256 11.75 11.74 11.75c7.34 0 11.66-5.16 11.66-11.75 0-.79-.07-1.397-.22-1.965H12.24z"/>
                            </svg>
                          )}
                          {prov === 'Apple' && (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                            </svg>
                          )}
                          {prov === 'Microsoft' && (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
                            </svg>
                          )}
                          {prov}
                        </button>
                      ))}
                    </div>
                  </form>
                )}
              </AnimatePresence>

              <div className="mt-6 pt-4 border-t border-smartBorder/50 text-center">
                <p className="text-xs font-sans text-smartTextSecondary">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-signature hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-signature rounded px-1"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </Card>

            <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-[10px] font-mono text-smartTextSecondary/60">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-signature/70" /> 256-BIT ENCRYPTION
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> ISO 27001 SECURE
              </span>
            </div>
          </div>

          {/* Desktop Visual Panel */}
          <div className="hidden lg:block lg:col-span-6 space-y-6 pl-8">
            <Card variant="elevated" className="border-signature/20 bg-smartSurface/80 backdrop-blur-md p-8 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-6 opacity-[0.012] pointer-events-none">
                <Cpu className="h-48 w-48 text-signature" />
              </div>
              
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-smartTextSecondary">SmartPark Intelligence</span>
                <span className="text-[10px] font-mono text-signature uppercase px-2 py-0.5 rounded bg-signature/10 border border-signature/30">Active Preview</span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-smartBg/85 border border-smartBorder p-4 rounded-smart">
                    <span className="text-[10px] font-mono text-smartTextSecondary block uppercase mb-1">AI Match</span>
                    <span className="text-xl font-bold font-display text-signature">98.4%</span>
                  </div>
                  <div className="bg-smartBg/85 border border-smartBorder p-4 rounded-smart">
                    <span className="text-[10px] font-mono text-smartTextSecondary block uppercase mb-1">Available Bays</span>
                    <span className="text-xl font-bold font-display text-white">24</span>
                  </div>
                  <div className="bg-smartBg/85 border border-smartBorder p-4 rounded-smart">
                    <span className="text-[10px] font-mono text-smartTextSecondary block uppercase mb-1">Walking Distance</span>
                    <span className="text-xl font-bold font-display text-white">2 Min</span>
                  </div>
                  <div className="bg-smartBg/85 border border-smartBorder p-4 rounded-smart">
                    <span className="text-[10px] font-mono text-smartTextSecondary block uppercase mb-1">Hourly Rate</span>
                    <span className="text-xl font-bold font-display text-signature">₹80/hr</span>
                  </div>
                </div>

                <div className="bg-smartBg/60 rounded border border-smartBorder/80 p-4">
                  <span className="text-[10px] font-mono text-smartTextSecondary block uppercase mb-1">AI Recommendation</span>
                  <span className="text-sm font-bold font-display text-white block mt-1">Cyber City Hub</span>
                  <p className="text-xs text-smartTextSecondary mt-2 leading-relaxed font-sans">
                    Live system sensors report peak flow optimization criteria matched for active driver profiles.
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </main>

      <footer className="py-4 text-center text-[10px] font-mono text-smartTextSecondary/50 border-t border-smartBorder/20">
        SMARTPARK AI 2.0 · INTELLIGENT PARKING MANAGEMENT PLATFORM
      </footer>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
