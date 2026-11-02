'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  RotateCcw,
  Send,
  Settings,
} from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Khojya branded unsubscribe page.
 *
 * Two flows share the same centre card:
 *  - One-click: newsletter emails link here with ?token=… — the page
 *    auto-unsubscribes and shows a success/error panel in the card.
 *  - Manual: the email form posts { email } to the public unsubscribe
 *    endpoint. "Subscribe Again" flips the card into subscribe mode.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'unsubscribe' | 'subscribe';
type FormMessage = { type: 'success' | 'error'; text: string } | null;
type TokenPanel = { status: 'success' | 'error'; text: string } | null;

/** Left-column benefit cards (copy matches the reference design). */
const BENEFIT_CARDS = [
  {
    icon: Mail,
    tile: 'bg-red-50 text-red-500',
    title: 'Stop Promotional Emails',
    desc: 'No more promotional offers, marketing emails or business recommendations.',
  },
  {
    icon: CalendarDays,
    tile: 'bg-blue-50 text-blue-500',
    title: 'No Event Notifications',
    desc: "You won't receive event updates, new business listings or local recommendations.",
  },
  {
    icon: Settings,
    tile: 'bg-amber-50 text-amber-500',
    title: 'Your Account Stays Safe',
    desc: 'Unsubscribing from emails will not delete your account. You can still use Khojya anytime.',
  },
];

/** Checklist inside the "Still Want to Stay Connected?" card. */
const CONNECT_POINTS = [
  'Receive only important updates',
  'Choose specific categories',
  'Get event alerts only',
  'Stay updated with best places in Patna',
];

function EnvelopeIllustration() {
  return (
    <svg
      viewBox="0 0 360 220"
      className="mx-auto w-full max-w-[300px]"
      fill="none"
      aria-hidden="true"
    >
      {/* Soft decorative blobs + leaves */}
      <ellipse cx="180" cy="120" rx="150" ry="82" fill="#FDF2F4" />
      <path d="M44 118c-14 8-23 22-24 42 19-6 30-21 32-40" fill="#DDEDD8" />
      <path d="M318 128c15 8 24 23 25 43-19-6-31-22-33-41" fill="#DDEDD8" />

      {/* Dashed trail + paper plane */}
      <path
        d="M248 42c30 4 56 15 74 33"
        stroke="#F4B400"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <path d="M318 64l26-11-9 26-6-11-11-4z" fill="#F4B400" />

      {/* Small background envelope */}
      <rect x="50" y="62" width="44" height="31" rx="5" stroke="#062B49" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M51 68l21 15 21-15" stroke="#062B49" strokeOpacity="0.3" strokeWidth="2" />

      {/* Main envelope */}
      <rect x="106" y="76" width="152" height="102" rx="12" fill="#FFFFFF" stroke="#062B49" strokeWidth="4" />
      <path
        d="M110 86l72 53 72-53"
        stroke="#062B49"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M110 170l52-45M254 170l-52-45" stroke="#062B49" strokeOpacity="0.22" strokeWidth="3" />

      {/* Red X badge */}
      <circle cx="258" cy="170" r="26" fill="#EF4444" />
      <path d="M249 161l18 18M267 161l-18 18" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [mode, setMode] = useState<Mode>('unsubscribe');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  // Token result — set only after the API resolves, so the loading state is
  // derived (token present + no result yet) instead of set inside the effect.
  const [tokenPanel, setTokenPanel] = useState<TokenPanel>(null);
  // After a token flow the user can still fall back to the email form.
  const [useEmailForm, setUseEmailForm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await api.unsubscribeNewsletter({ token });
        if (!cancelled) {
          setTokenPanel({
            status: 'success',
            text:
              res?.message ||
              'You have been unsubscribed from the Khojya newsletter.',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setTokenPanel({
            status: 'error',
            text:
              error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const scrollToCard = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const switchToSubscribe = () => {
    setMode('subscribe');
    setFormMessage(null);
    setUseEmailForm(true);
    setTokenPanel(null);
    scrollToCard();
  };

  const switchToUnsubscribeForm = () => {
    setMode('unsubscribe');
    setFormMessage(null);
    setUseEmailForm(true);
    setTokenPanel(null);
    scrollToCard();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setFormMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    setFormMessage(null);

    try {
      const res =
        mode === 'unsubscribe'
          ? await api.unsubscribeNewsletter({ email: trimmed })
          : await api.subscribeNewsletter(trimmed, 'unsubscribe-page');

      setFormMessage({
        type: 'success',
        text:
          res?.message ||
          (mode === 'unsubscribe'
            ? 'You have been unsubscribed from the Khojya newsletter.'
            : 'Subscribed! The latest Patna news will land in your inbox.'),
      });
      setEmail('');
    } catch (error) {
      setFormMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // One-click token flow: show the status panel unless the user opted for the form.
  const showTokenPanel = Boolean(token) && !useEmailForm;
  const tokenStatus = showTokenPanel ? (tokenPanel?.status ?? 'loading') : null;

  return (
    <main className="bg-[#F7F9FC]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#062B49]">
        <Image
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80"
          alt="Patna city skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#041F35]/95 via-[#062B49]/85 to-[#062B49]/55" />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 md:pb-36 md:pt-16 lg:px-8 lg:pb-44">
          {/* Breadcrumb (white, overlays the hero like the reference design) */}
          <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-[#F4B400]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"
                    />
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </li>
              <li className="font-medium text-white">Unsubscribe</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                <span className="text-[#F4B400]">Unsubscribe</span> from Our Updates
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#FFF4CC]/90 md:text-lg">
                We&rsquo;re sorry to see you go! If you no longer wish to receive
                emails from Khojya, you can easily unsubscribe below.
              </p>
            </div>

            {/* Script accent — right side (matches the About hero) */}
            <div className="hidden shrink-0 text-right lg:block">
              <p className="font-script text-3xl leading-snug text-[#D7E7F5] xl:text-4xl">
                Same City,
                <br />
                More Possibilities<span className="text-[#F4B400]">&hearts;</span>
              </p>
              <svg
                viewBox="0 0 180 12"
                className="ml-auto mt-2 w-40 text-[#F4B400]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 8c30-6 60-6 87-2 28 4 58 2 87-3" />
              </svg>
            </div>
          </div>
        </div>

        {/* White wave transition into the content area */}
        <svg
          className="absolute bottom-0 left-0 w-full text-[#F7F9FC]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,62 C240,100 480,18 720,38 C960,58 1200,100 1440,46 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 pb-4 sm:px-6 lg:-mt-24 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
          {/* Left — benefit cards (below the form card on mobile) */}
          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:pt-8">
            {BENEFIT_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(8,28,58,0.05)]"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.tile}`}
                >
                  <card.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#062B49]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Centre — main card */}
          <div
            ref={cardRef}
            className="order-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_15px_45px_rgba(8,28,58,0.10)] lg:order-2 lg:-mt-36"
          >
            {/* Branded card header — navy strip with the gold Khojya mark */}
            <div className="relative overflow-hidden bg-[#062B49] px-6 py-4 sm:px-8">
              <div
                className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#F4B400]/15 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4B400] to-[#D89E00] shadow-sm">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-extrabold text-white">
                      Khojya
                    </p>
                    <p className="text-[11px] text-white/60">Newsletter Preferences</p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 sm:inline-block">
                  Secure
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
            <EnvelopeIllustration />

            {/* One-click token flow — status panel replaces the form */}
            {tokenStatus && (
              <div className="mt-6 text-center" aria-live="polite">
                {tokenStatus === 'loading' ? (
                  <>
                    <Loader2
                      className="mx-auto h-10 w-10 animate-spin text-[#F4B400]"
                      aria-hidden="true"
                    />
                    <h2 className="mt-4 text-xl font-extrabold text-[#062B49]">
                      Unsubscribing&hellip;
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Please wait while we update your subscription.
                    </p>
                  </>
                ) : (
                  <>
                    <span
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                        tokenStatus === 'success'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {tokenStatus === 'success' ? (
                        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="h-7 w-7" aria-hidden="true" />
                      )}
                    </span>
                    <h2 className="mt-4 text-xl font-extrabold text-[#062B49]">
                      {tokenStatus === 'success'
                        ? 'You\u2019re unsubscribed'
                        : 'Something went wrong'}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {tokenPanel?.text}
                    </p>
                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={switchToUnsubscribeForm}
                        className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Unsubscribe with email instead
                      </button>
                      <Link
                        href="/"
                        className="w-full rounded-xl bg-[#F4B400] py-2.5 text-sm font-bold text-[#062B49] transition hover:bg-[#FFD35A]"
                      >
                        Back to home
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Manual form (default landing state + post-token fallback) */}
            {!tokenStatus && (
              <>
                <h2 className="mt-6 text-center text-2xl font-extrabold text-[#062B49]">
                  {mode === 'unsubscribe'
                    ? 'Unsubscribe from Emails'
                    : 'Subscribe Again'}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-gray-500">
                  {mode === 'unsubscribe'
                    ? 'Enter your email address below to stop receiving promotional emails, newsletters and updates from Khojya.'
                    : 'Enter your email address below and we\u2019ll start sending you the latest Patna news, events and offers again.'}
                </p>

                <form onSubmit={handleSubmit} className="mt-6" noValidate>
                  <label
                    htmlFor="unsubscribe-email"
                    className="block text-sm font-bold text-[#062B49]"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative mt-2">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="unsubscribe-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400]/30"
                    />
                  </div>

                  {formMessage && (
                    <p
                      role="status"
                      className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                        formMessage.type === 'success'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {formMessage.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4B400] py-3.5 text-sm font-bold text-[#062B49] transition hover:bg-[#FFD35A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : mode === 'unsubscribe' ? (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    )}
                    {mode === 'unsubscribe' ? 'Unsubscribe Now' : 'Subscribe Now'}
                  </button>

                  <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Lock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </span>
                    <p className="text-xs leading-relaxed text-gray-600">
                      {mode === 'unsubscribe'
                        ? 'We respect your privacy. Your email will be removed from our mailing list and you will no longer receive future emails from us.'
                        : 'We respect your privacy. Your email is only used for the Khojya newsletter and you can unsubscribe anytime.'}
                    </p>
                  </div>
                </form>
              </>
            )}
            </div>
          </div>

          {/* Right — side cards */}
          <div className="order-3 flex flex-col gap-4 lg:pt-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(8,28,58,0.05)]">
              <h3 className="text-base font-extrabold text-[#062B49]">
                Still Want to Stay Connected?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                You can manage your email preferences instead of unsubscribing
                completely.
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {CONNECT_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                      <Check className="h-3 w-3 text-white" aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#062B49] py-2.5 text-sm font-bold text-[#062B49] transition hover:bg-[#062B49] hover:text-white"
              >
                Manage Preferences
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <RotateCcw className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </span>
                <h3 className="text-base font-extrabold text-[#062B49]">
                  Changed Your Mind?
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                You can resubscribe anytime and start receiving our latest
                updates again.
              </p>
              <button
                type="button"
                onClick={switchToSubscribe}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#F4B400] bg-white py-2.5 text-sm font-bold text-[#062B49] transition hover:bg-[#FFF9E5]"
              >
                Subscribe Again
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proudly Patna band ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F9FC] via-[#FFF8E7] to-[#FDE9B8] pt-14">
        <p
          aria-hidden="true"
          className="font-script pointer-events-none absolute right-[8%] top-6 -rotate-6 text-center text-3xl leading-tight text-[#D89E00] xl:text-4xl"
        >
          Proudly
          <br />
          Patna
          <br />
          Always <span className="text-[#F4B400]">♥</span>
        </p>
        <Image
          src="/images/footer-png.png"
          alt=""
          width={2167}
          height={726}
          sizes="100vw"
          className="pointer-events-none w-full translate-y-[8%] select-none"
          aria-hidden="true"
        />
      </section>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={<div className="min-h-[60vh] bg-[#F7F9FC]" aria-busy="true" />}
    >
      <UnsubscribeContent />
    </Suspense>
  );
}







