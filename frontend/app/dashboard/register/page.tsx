'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  Lock,
  Mail,
  Phone,
  Search,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userAuthApi } from '@/lib/userApi';

/**
 * Register page — layout mirrors the approved "Join Patna Finder" design:
 * navy + gold brand panel (city photo + gold Patna skyline) on the left and a
 * white form card on the right. All colours stay on the site tokens defined in
 * globals.css / tailwind.config.js (navy #081C3A, gold #F4B400, text #102A43,
 * muted #486581 / #829AB1, borders #D9E2EC / #E1E8F0).
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

/**
 * Password policy checklist (mirrors the backend StrongPassword rule).
 * Order matters: the list renders as a 2-column grid that fills row by row, so
 * interleaving it keeps the design's column pairing (8+ / Uppercase / Lowercase
 * on the left, Number / Special char / Not-your-email on the right).
 */
const PASSWORD_CHECKLIST = [
  { key: 'length', label: '8+ characters' },
  { key: 'number', label: 'Number (0-9)' },
  { key: 'uppercase', label: 'Uppercase (A-Z)' },
  { key: 'special', label: 'Special char (!@#$%)' },
  { key: 'lowercase', label: 'Lowercase (a-z)' },
  { key: 'notEmail', label: 'Not your email/username' },
] as const;

/** Score → label / bar / text colours used by the strength meter. */
const STRENGTH_LEVELS = [
  { label: 'Very Weak', bar: 'bg-[#D9E2EC]', text: 'text-[#829AB1]' },
  { label: 'Weak', bar: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', bar: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'Good', bar: 'bg-[#F4B400]', text: 'text-[#B77A00]' },
  { label: 'Strong', bar: 'bg-[#16A34A]', text: 'text-[#16A34A]' },
  { label: 'Very Strong', bar: 'bg-[#15803D]', text: 'text-[#15803D]' },
];

/** Dial codes offered next to the phone field (India first, matching the brand). */
const DIAL_CODES = ['+91', '+1', '+44', '+61', '+971'];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUserAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [dialCode, setDialCode] = useState('+91');
  const [socialNotice, setSocialNotice] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  // ── Password strength scoring ──
  // Mirrors the backend StrongPassword rule, including the
  // "must not contain your email local-part" policy.
  const emailLocalPart = formData.email.split('@')[0]?.toLowerCase() ?? '';
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
    notEmail: !(
      emailLocalPart.length >= 3 &&
      formData.password.toLowerCase().includes(emailLocalPart)
    ),
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthScore = formData.password
    ? Math.min(passedChecks + (formData.password.length >= 12 ? 1 : 0), 5)
    : 0;
  const strength = STRENGTH_LEVELS[strengthScore];
  /** Checklist opens while the user types (or focuses) the password field. */
  const showPasswordHints = Boolean(formData.password) || passwordFocused;


  const validateForm = () => {
    const newErrors: FieldErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[0-9 ()+-]{10,15}$/.test(formData.phone.replace(/ /g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    // Password validation (AWS IAM-style strong password policy)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (e.g. !@#$%)';
    }

    // Must not contain the email local part (mirrors backend StrongPassword rule)
    if (
      !newErrors.password &&
      emailLocalPart.length >= 3 &&
      formData.password.toLowerCase().includes(emailLocalPart)
    ) {
      newErrors.password = 'Password must not contain your email address or username';
    }

    // Password confirmation validation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await userAuthApi.register(
        formData.name,
        formData.email,
        formData.password,
        formData.password_confirmation,
        // The dial code lives in its own control, so it is prefixed here.
        formData.phone ? `${dialCode} ${formData.phone.trim()}` : undefined
      );

      if (response.success) {
        login(response.data.user, response.data.token);
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const apiError = error as {
        response?: { data?: { errors?: FieldErrors; message?: string } };
      };
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
      } else {
        setErrors({
          general: apiError.response?.data?.message || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Social sign-up is not wired to a provider yet: the buttons are rendered to
   * match the design and explain that email sign-up is the available path,
   * instead of pretending to authenticate the visitor.
   */
  const handleSocial = (provider: 'Google' | 'Facebook') => {
    setSocialNotice(
      `${provider} sign-up is not available yet. Please create your account with your email address.`
    );
  };


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#EDF2F8]">
      {/* ── City photo, full-bleed behind the whole page ── */}
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
        {/* ── Brand panel ── */}
        <section className="hidden lg:flex lg:w-[56%] lg:flex-col lg:justify-between lg:py-1">
          <div className="max-w-[620px]">
            <Link href="/" className="inline-flex items-center gap-3.5" aria-label="Patna Finder home">
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
              Join <span className="text-[#F4B400]">Patna Finder</span>
            </h1>
            <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-white/85">
              Create your account and explore the best businesses, services and places in Patna.
            </p>

            <div className="mt-2 flex justify-end pr-4">
              <p className="font-script -rotate-[6deg] text-right text-[24px] leading-[1.15] text-[#F4B400]">
                Same City
                <br />
                More Possibilities <span className="text-[#FFC107]">♥</span>
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
            <span className="block font-heading text-[32px] font-extrabold leading-[0.7] text-[#F4B400]" aria-hidden="true">
              &ldquo;
            </span>
            <p className="mt-2 text-[13px] leading-relaxed text-white/85">
              Let&apos;s explore, support and build a better Patna together.
            </p>
            <span className="mt-3 block h-[3px] w-[78px] rounded-full bg-[#F4B400]" aria-hidden="true" />
          </div>
        </section>


        {/* ── Form panel ── */}
        <section className="w-full lg:flex lg:w-[44%] lg:items-center lg:justify-center">
          <div className="w-full max-w-[560px]">
            {/* Compact brand lockup for small screens */}
            <Link href="/" className="mb-4 inline-flex items-center gap-3 lg:hidden" aria-label="Patna Finder home">
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
                <p className="text-[13px] text-[#334E68]">Already have an account?</p>
                <Link
                  href="/dashboard/login"
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border-[1.5px] border-[#F4B400] bg-white px-3.5 text-[13px] font-semibold text-[#B77A00] transition hover:bg-[#FFF8E1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B400]"
                >
                  Login
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <h1 className="mt-3 text-[24px] font-extrabold leading-tight text-[#0B2447] sm:text-[26px]">
                Create Your Account
              </h1>
              <p className="mt-1 text-[13px] text-[#486581]">
                Join Patna Finder and discover a smarter, better Patna.
              </p>

              {errorText(errors.general) && (
                <div className="mt-3.5 flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
                  <p className="text-[12.5px] text-red-700">{errorText(errors.general)}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]"
                      aria-hidden="true"
                    />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={inputClass({ error: !!errors.name })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <FieldError message={errors.name} />
                </div>

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
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex h-[38px] w-[88px] flex-shrink-0 items-center rounded-[9px] border border-[#DDE3EA] bg-white pl-2.5 transition hover:border-[#BCCCDC] focus-within:border-[#F4B400] focus-within:ring-2 focus-within:ring-[#F4B400]/25">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#829AB1]" aria-hidden="true" />
                      <select
                        aria-label="Country dial code"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="h-full w-full cursor-pointer appearance-none bg-transparent pl-1.5 pr-4 text-[13px] text-[#102A43] outline-none"
                      >
                        {DIAL_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-1.5 h-4 w-4 text-[#829AB1]"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className={inputClass({ error: !!errors.phone, icon: false })}
                      placeholder="98765 43210"
                    />
                  </div>
                  <FieldError message={errors.phone} />
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
                      autoComplete="new-password"
                      value={formData.password}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={inputClass({ error: !!errors.password, trailing: true })}
                      placeholder="Min 8 chars, A-Z, a-z, 0-9 & symbol"
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

                  {/* Strength meter + policy checklist (mirrors the backend StrongPassword rule) */}
                  {showPasswordHints && (
                    <>
                      <div className="mt-2 flex items-center gap-2.5">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#E1E8F0]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}
                            style={{ width: `${(strengthScore / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`whitespace-nowrap text-[11.5px] font-semibold ${strength.text}`}>
                          Strength: {strength.label}
                        </span>
                      </div>

                      <ul className="mt-2 grid grid-cols-1 gap-x-5 gap-y-1 rounded-[8px] bg-[#EAF7EF] p-2.5 sm:grid-cols-2">
                        {PASSWORD_CHECKLIST.map(({ key, label }) => {
                          const passed = passwordChecks[key];
                          return (
                            <li key={key} className="flex items-center gap-1.5 text-[11.5px]">
                              <span
                                className={[
                                  'flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full',
                                  passed
                                    ? 'bg-[#16A34A] text-white'
                                    : 'border border-[#BCCCDC] bg-white text-transparent',
                                ].join(' ')}
                                aria-hidden="true"
                              >
                                <Check className="h-[9px] w-[9px]" strokeWidth={3.5} />
                              </span>
                              <span className={passed ? 'text-[#102A43]' : 'text-[#829AB1]'}>{label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  <FieldError message={errors.password} />
                </div>


                <div>
                  <label htmlFor="password_confirmation" className={labelClass}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]"
                      aria-hidden="true"
                    />
                    <input
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password_confirmation}
                      onChange={(e) => {
                        setFormData({ ...formData, password_confirmation: e.target.value });
                        if (errors.password_confirmation)
                          setErrors({ ...errors, password_confirmation: undefined });
                      }}
                      className={inputClass({ error: !!errors.password_confirmation, trailing: true })}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#829AB1] transition hover:bg-[#F7F9FC] hover:text-[#081C3A]"
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {formData.password_confirmation &&
                    formData.password === formData.password_confirmation && (
                      <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-medium text-[#16A34A]">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Passwords match
                      </p>
                    )}
                  <FieldError message={errors.password_confirmation} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#F4B400] px-6 text-[14px] font-bold text-[#081C3A] shadow-[0_14px_28px_-14px_rgba(244,180,0,0.95)] transition hover:bg-[#FFC107] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#081C3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-3.5 flex items-center gap-3.5">
                <span className="h-px flex-1 bg-[#E1E8F0]" aria-hidden="true" />
                <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#829AB1]">or</span>
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
                By creating an account, you agree to our{' '}
                <Link href="/terms-of-use" className="font-medium text-[#1D4ED8] underline underline-offset-2">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="font-medium text-[#1D4ED8] underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

