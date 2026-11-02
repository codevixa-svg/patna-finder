'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  Lock,
  Mail,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userAuthApi } from '@/lib/userApi';
import MfaCodeInput from '@/components/auth/MfaCodeInput';

/**
 * Login page — mirrors the register page layout: a full-bleed Patna photo
 * behind the whole screen, the navy + gold brand panel on the left and a white
 * form card on the right. Colours stay on the register page's tokens (navy
 * #081C3A, gold #F4B400, text #102A43 / #0B2447, muted #486581 / #829AB1,
 * borders #DDE3EA / #E1E8F0).
 */

/** Laravel validation errors can arrive as an array; keep only the first message. */
const errorText = (message?: unknown) =>
  Array.isArray(message) ? message[0] : typeof message === 'string' ? message : '';

/** Shape of the client-side (and API) field error bag. */
type FieldErrors = Record<string, string | string[] | undefined>;

/** Shared input styling (icon spacing + an optional trailing slot for the eye toggle). */
const inputClass = ({
  error,
  icon = true,
  trailing = false,
}: {
  error?: boolean;
  icon?: boolean;
  trailing?: boolean;
}) =>
  [
    'h-[38px] w-full rounded-[9px] border bg-white text-[13.5px] text-[#102A43] outline-none transition',
    'placeholder:text-[#9AA5B1] focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/25',
    icon ? 'pl-10' : 'pl-3.5',
    trailing ? 'pr-10' : 'pr-3.5',
    error ? 'border-red-400 bg-red-50/60' : 'border-[#DDE3EA] hover:border-[#BCCCDC]',
  ].join(' ');

const labelClass = 'mb-0.5 block text-[12.5px] font-semibold text-[#102A43]';

const socialButtonClass =
  'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-[9px] border border-[#DDE3EA] bg-white px-3 text-[12.5px] font-medium text-[#102A43] transition hover:border-[#BCCCDC] hover:bg-[#F7F9FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B400] xl:text-[13.5px]';

/** Inline validation message (also normalises Laravel's array-shaped errors). */
function FieldError({ message }: { message?: unknown }) {
  const text = errorText(message);
  if (!text) return null;
  return (
    <p className="mt-1 flex items-start gap-1.5 text-[12px] text-red-600">
      <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}

/** Gold pin + monument brand mark (same mark the company logo uses). */
function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`relative flex flex-shrink-0 items-center justify-center ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M12 22.5s7.4-6.6 7.4-12.2A7.4 7.4 0 0 0 4.6 10.3C4.6 15.9 12 22.5 12 22.5Z" />
      </svg>
      <Landmark className="relative h-[42%] w-[42%]" />
    </span>
  );
}

/** Google mark — inline official 4-colour logo (no extra dependency needed). */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

/** Facebook mark — inline so we don't pull in another icon package. */
function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.684 4.533-4.684 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.49 0-1.955.928-1.955 1.879v2.278h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"
      />
    </svg>
  );
}

/** Marketing highlights shown on the desktop brand panel. */
const BRAND_HIGHLIGHTS = [
  {
    icon: Search,
    title: 'Discover',
    copy: 'Find the best businesses and services in Patna.',
  },
  {
    icon: Star,
    title: 'Save Favorites',
    copy: 'Bookmark places you love.',
  },
  {
    icon: Bell,
    title: 'Get Updates',
    copy: 'Stay informed about new businesses, events and offers.',
  },
  {
    icon: Users,
    title: 'Be Part of Our Community',
    copy: 'Help make Patna a better, more connected city.',
  },
];

function DashboardLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useUserAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [socialNotice, setSocialNotice] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Step: 'credentials' or 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState('');
  const [lockUntil, setLockUntil] = useState(0);
  // Last observed epoch-second while a lock is active (Date.now() must not be
  // called during render — the lock countdown ticks through the effect below).
  const [lockNow, setLockNow] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => {
      const ts = Math.floor(Date.now() / 1000);
      setLockNow(ts);
      if (ts >= lockUntil) {
        setLockUntil(0);
        setErrors({});
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  const lockRemaining = lockUntil > 0 ? Math.max(0, lockUntil - lockNow) : 0;
  const lockMinutes = Math.floor(lockRemaining / 60);
  const lockSeconds = lockRemaining % 60;

  const validateForm = () => {
    const newErrors: FieldErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Login with email + password, then auto-request OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Step 1: Verify credentials
      const response = await userAuthApi.login(formData.email, formData.password);

      if (response.mfa_required) {
        // User has 2FA enabled - show their existing MFA
        setChallengeToken(response.challenge_token);
        setEmailMasked(response.email_masked || formData.email);
        setResendIn(response.resend_in || 60);
        setDevCode(response.dev_code || '');
        setStep('otp');
        return;
      }

      // If no MFA, automatically send OTP after successful credential check
      if (response.success) {
        // Request OTP with password
        const otpResponse = await userAuthApi.loginWithOtp(formData.email, formData.password);
        setChallengeToken(otpResponse.challenge_token);
        setEmailMasked(otpResponse.email_masked || formData.email);
        setResendIn(otpResponse.resend_in || 60);
        setDevCode(otpResponse.dev_code || '');
        setStep('otp');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const apiError = error as {
        response?: {
          status?: number;
          data?: { retry_after_seconds?: number; message?: string; errors?: FieldErrors };
        };
      };
      if (apiError.response?.status === 423 && apiError.response.data?.retry_after_seconds) {
        const ts = Math.floor(Date.now() / 1000);
        setLockNow(ts);
        setLockUntil(ts + apiError.response.data.retry_after_seconds);
        setErrors({ general: apiError.response.data.message || 'Account temporarily locked.' });
      } else if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      } else {
        setErrors({
          general: apiError.response?.data?.message || 'Login failed. Please check your credentials.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setMfaError('');
    setMfaLoading(true);

    try {
      const response = await userAuthApi.verifyOtp(challengeToken, code);
      if (response.success) {
        login(response.data.user, response.data.token);
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      console.error('OTP error:', error);
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      setMfaError(apiError.response?.data?.message || 'Invalid OTP code');
      if (apiError.response?.status === 410) {
        setTimeout(() => backToCredentials(), 1800);
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const handleResend = async () => {
    setMfaError('');
    try {
      const response = await userAuthApi.resendOtp(challengeToken);
      setResendIn(60);
      if (response.dev_code) setDevCode(response.dev_code);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { resend_in?: number; message?: string } } };
      const retryIn = apiError.response?.data?.resend_in;
      if (retryIn) setResendIn(retryIn);
      setMfaError(
        apiError.response?.data?.message || 'Could not resend code. Please wait and try again.'
      );
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setChallengeToken('');
    setMfaError('');
    setFormData((f) => ({ ...f, password: '' }));
  };

  /**
   * Social sign-in is not wired to a provider yet: the buttons are rendered to
   * match the register layout and explain that email login is the available
   * path, instead of pretending to authenticate the visitor.
   */
  const handleSocial = (provider: 'Google' | 'Facebook') => {
    setSocialNotice(`${provider} sign-in is not available yet. Please log in with your email address.`);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#EDF2F8]">
      {/* City photo, full-bleed behind the whole page */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/patna-monument1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Navy wash keeps the brand copy readable */}
        <div className="absolute inset-0 " />
        {/* Soft light veil on the right so the white form card keeps a clean backing */}
        <div className="absolute inset-y-0 right-0 hidden w-[48%]  lg:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1700px] flex-col gap-5 px-4 pb-24 pt-5 sm:px-6 lg:flex-row lg:items-stretch lg:gap-10 lg:px-10 lg:pb-[92px] lg:pt-4 xl:gap-16 xl:px-16">
        {/* Brand panel */}
        <section className="hidden lg:flex lg:w-[56%] lg:flex-col lg:justify-between lg:py-1">
          <div className="max-w-[620px]">
            <Link href="/" className="inline-flex items-center gap-3.5" aria-label="Khojya home">
              <BrandMark className="h-[58px] w-[58px] text-[#F4B400]" />
              <span className="leading-none">
                <span className="block font-heading text-[26px] font-extrabold tracking-[0.05em] text-white">
                  PATNA
                </span>
                <span className="block font-heading text-[16px] font-extrabold tracking-[0.4em] text-white">
                  FINDER
                </span>
                <span className="mt-1 block text-[12px] text-white/80">Discover Patna&apos;s Best</span>
              </span>
            </Link>

            <h1 className="mt-6 text-[34px] font-extrabold leading-[1.1] tracking-tight text-white xl:text-[40px]">
              Login to <span className="text-[#F4B400]">Khojya</span>
            </h1>
            <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-white/85">
              {redirectTo === '/dashboard/add-business'
                ? 'Login to add your business listing to Khojya.'
                : 'Login to manage your listings, favorites and updates — all in one place.'}
            </p>

            <div className="mt-2 flex justify-end pr-4">
              <p className="font-script -rotate-[6deg] text-right text-[24px] leading-[1.15] text-[#F4B400]">
                Same City
                <br />
                More Possibilities <span className="text-[#FFC107]">&#9829;</span>
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {BRAND_HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#FFC107]">
                    <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                  </span>
                  <span className="pt-0.5">
                    <span className="block text-[13.5px] font-semibold text-[#F4B400]">{title}</span>
                    <span className="mt-0.5 block max-w-[440px] text-[12.5px] leading-relaxed text-white/85">
                      {copy}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-[460px] pb-1">
            <span
              className="block font-heading text-[32px] font-extrabold leading-[0.7] text-[#F4B400]"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="mt-2 text-[13px] leading-relaxed text-white/85">
              Let&apos;s explore, support and build a better Patna together.
            </p>
            <span className="mt-3 block h-[3px] w-[78px] rounded-full bg-[#F4B400]" aria-hidden="true" />
          </div>
        </section>

        {/* Form panel */}
        <section className="w-full lg:flex lg:w-[44%] lg:items-center lg:justify-center">
          <div className="w-full max-w-[560px]">
            {/* Compact brand lockup for small screens */}
            <Link href="/" className="mb-4 inline-flex items-center gap-3 lg:hidden" aria-label="Khojya home">
              <BrandMark className="h-10 w-10 text-[#F4B400]" />
              <span className="leading-none">
                <span className="block font-heading text-[19px] font-extrabold tracking-[0.04em] text-white">
                  PATNA
                </span>
                <span className="block font-heading text-[12.5px] font-extrabold tracking-[0.34em] text-white">
                  FINDER
                </span>
                <span className="mt-1 block text-[11px] text-white/80">Discover Patna&apos;s Best</span>
              </span>
            </Link>

            <div className="rounded-[20px] border border-white/80 bg-white p-4 shadow-[0_30px_70px_-30px_rgba(8,28,58,0.45)] sm:p-5 xl:p-6">
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <p className="text-[13px] text-[#334E68]">Don&apos;t have an account?</p>
                <Link
                  href="/dashboard/register"
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border-[1.5px] border-[#F4B400] bg-white px-3.5 text-[13px] font-semibold text-[#B77A00] transition hover:bg-[#FFF8E1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B400]"
                >
                  Register
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {step === 'otp' && (
                <div>
                  <h1 className="mt-3 text-[24px] font-extrabold leading-tight text-[#0B2447] sm:text-[26px]">
                    Verify Your Email
                  </h1>
                  <p className="mt-1 text-[13px] text-[#486581]">
                    We&apos;ve sent a 6-digit verification code to{' '}
                    <span className="font-semibold text-[#102A43]">{emailMasked}</span>
                  </p>
                  <p className="mt-1 text-[12px] text-[#829AB1]">
                    Please check your inbox and enter the code below.
                  </p>

                  {devCode && (
                    <div className="mt-3.5 rounded-[8px] border border-[#BED8F0] bg-[#EEF5FD] p-3 text-center">
                      <p className="text-[12px] text-[#1D4ED8]">
                        Local dev mode — email is logged, not sent. Your code:
                      </p>
                      <p className="mt-1 text-xl font-bold tracking-[0.4em] text-[#1E3A8A]">{devCode}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <MfaCodeInput onComplete={handleOtpComplete} disabled={mfaLoading} error={mfaError} />
                  </div>

                  {mfaLoading && (
                    <p className="mt-4 text-center text-[12.5px] font-medium text-[#B77A00]">
                      Verifying code...
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between text-[13px]">
                    <button
                      type="button"
                      onClick={backToCredentials}
                      className="inline-flex items-center gap-1 font-medium text-[#486581] transition hover:text-[#081C3A]"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Back to login
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0 || mfaLoading}
                      className="font-semibold text-[#B77A00] transition hover:text-[#8A5D00] disabled:cursor-not-allowed disabled:text-[#9AA5B1]"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
              )}

              {step !== 'otp' && (
                <>
                  <h1 className="mt-3 text-[24px] font-extrabold leading-tight text-[#0B2447] sm:text-[26px]">
                    Welcome Back
                  </h1>
                  <p className="mt-1 text-[13px] text-[#486581]">
                    {redirectTo === '/dashboard/add-business'
                      ? 'Login to add your business listing'
                      : 'Login to manage your business listings'}
                  </p>

                  {errorText(errors.general) && (
                    <div
                      className={`mt-3.5 flex items-start gap-2 rounded-[8px] border p-3 ${
                        lockRemaining > 0 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <AlertCircle
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          lockRemaining > 0 ? 'text-amber-500' : 'text-red-500'
                        }`}
                        aria-hidden="true"
                      />
                      {lockRemaining > 0 ? (
                        <p className="text-[12.5px] text-amber-800">
                          <span className="font-semibold">Account temporarily locked.</span>{' '}
                          Too many failed attempts. Try again in{' '}
                          <span className="font-mono font-bold">
                            {lockMinutes}:{String(lockSeconds).padStart(2, '0')}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[12.5px] text-red-700">{errorText(errors.general)}</p>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]"
                          aria-hidden="true"
                        />
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          className={inputClass({ error: !!errors.email })}
                          placeholder="you@example.com"
                        />
                      </div>
                      <FieldError message={errors.email} />
                    </div>

                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]"
                          aria-hidden="true"
                        />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                          className={inputClass({ error: !!errors.password, trailing: true })}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#829AB1] transition hover:bg-[#F7F9FC] hover:text-[#081C3A]"
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <FieldError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[12.5px]">
                      <label className="flex cursor-pointer items-center gap-2 text-[#486581]">
                        <input type="checkbox" className="h-4 w-4 rounded border-[#C4CFDB] accent-[#F4B400]" />
                        Remember me
                      </label>
                      <Link
                        href="/dashboard/forgot-password"
                        className="font-semibold text-[#B77A00] transition hover:text-[#8A5D00]"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || lockRemaining > 0}
                      className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#F4B400] px-6 text-[14px] font-bold text-[#081C3A] shadow-[0_14px_28px_-14px_rgba(244,180,0,0.95)] transition hover:bg-[#FFC107] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#081C3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Login to Dashboard
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-3.5 flex items-center gap-3.5">
                    <span className="h-px flex-1 bg-[#E1E8F0]" aria-hidden="true" />
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#829AB1]">
                      or
                    </span>
                    <span className="h-px flex-1 bg-[#E1E8F0]" aria-hidden="true" />
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button type="button" onClick={() => handleSocial('Google')} className={socialButtonClass}>
                      <GoogleMark />
                      Continue with Google
                    </button>
                    <button type="button" onClick={() => handleSocial('Facebook')} className={socialButtonClass}>
                      <FacebookMark />
                      Continue with Facebook
                    </button>
                  </div>

                  {socialNotice && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[12px] text-[#B77A00]" role="status">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      <span>{socialNotice}</span>
                    </p>
                  )}

                  <p className="mt-3.5 text-[12px] leading-relaxed text-[#486581]">
                    After you log in, we&apos;ll email a one-time code to verify it&apos;s you — enter it on
                    the next screen to reach your dashboard.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#EDF2F8]">
          <Loader2 className="h-8 w-8 animate-spin text-[#F4B400]" aria-hidden="true" />
        </div>
      }
    >
      <DashboardLoginPageContent />
    </Suspense>
  );
}




