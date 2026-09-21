import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  MessageCircle,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';
import ContactForm from './ContactForm';
import FaqAccordion from './FaqAccordion';

export const metadata: Metadata = {
  title: 'Contact Us | Patna Finder',
  description:
    'Get in touch with the Patna Finder team — questions, feedback, partnerships or support, we would love to hear from you.',
  alternates: { canonical: '/contact' },
};

const CONTACT_CARDS = [
  {
    title: 'Call Us',
    lines: ['+91 98765 43210', 'Mon - Sat, 9:00 AM - 6:00 PM'],
    icon: <Phone className="w-5 h-5" />,
  },
  {
    title: 'Email Us',
    lines: ['hello@patnafinder.com', 'We reply within 24 hours'],
    icon: <Mail className="w-5 h-5" />,
  },
  {
    title: 'Visit Us',
    lines: ['Boring Road, Patna, Bihar', 'India - 800001'],
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    title: 'Support',
    lines: ['support@patnafinder.com', 'For business & technical support'],
    icon: <MessageCircle className="w-5 h-5" />,
  },
];

const FAQS = [
  {
    q: 'How can I list my business on Patna Finder?',
    a: 'Simply click on "Add Your Business", fill in your business details, and our team will verify and publish your listing — usually within 24-48 hours. Listing is completely free.',
  },
  {
    q: 'How quickly will I get a response?',
    a: 'We reply to all emails and messages within 24 hours on working days. For urgent business or technical support, mention "URGENT" in your subject line.',
  },
  {
    q: 'Is there any charge to list a business?',
    a: 'No. Basic business listings on Patna Finder are completely free forever. We also offer optional premium features like featured placement and highlights for extra visibility.',
  },
  {
    q: 'Can I collaborate for events or promotions?',
    a: 'Absolutely! We love collaborating with local businesses, event organisers and community groups. Email us at hello@patnafinder.com with your proposal and we will get back to you.',
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-14 md:pb-20">
          <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </li>
              <li className="text-white font-medium">Contact Us</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Contact <span className="text-[#F4B400]">Us</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-[#FFF4CC]/90 leading-relaxed max-w-xl">
                We&rsquo;d love to hear from you! Get in touch with us for any queries,
                suggestions, partnerships or support.
              </p>
            </div>

            <p className="font-script text-3xl md:text-4xl text-[#F4B400] -rotate-3 self-start lg:self-end leading-tight text-center lg:text-right">
              Let&rsquo;s Build a Better
              <br />
              Patna Together
            </p>
          </div>
        </div>
      </section>
      {/* ── Contact Info Cards ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-[#F7F9FC] rounded-2xl p-7 text-center hover:shadow-lg hover:-translate-y-1 transition"
            >
              <span className="w-12 h-12 rounded-full bg-[#F4B400] text-white flex items-center justify-center mx-auto">
                {card.icon}
              </span>
              <h2 className="mt-4 font-bold text-[#102A43]">{card.title}</h2>
              <p className="mt-1.5 text-sm font-semibold text-[#062B49]">{card.lines[0]}</p>
              <p className="mt-1 text-xs text-gray-500">{card.lines[1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + Quote/Location ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#F4B400]">
              <span className="h-px w-8 bg-[#F4B400]" aria-hidden="true" />
              Send Us a Message
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#102A43]">Get in Touch</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill out the form below and our team will get back to you as soon as possible.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          {/* Quote image + location */}
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden h-64 md:h-72 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80"
                alt="Sunset over the river in Patna"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 font-script text-2xl md:text-3xl text-white leading-snug">
                &ldquo;A stronger Patna is built through stronger connections.&rdquo;
              </p>
            </div>

            {/* Location card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#FFF4CC] text-[#F4B400] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-[#102A43]">Our Location</h3>
              </div>

              {/* Map */}
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 h-56 relative">
                <iframe
                  title="Patna Finder office location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=85.05%2C25.58%2C85.20%2C25.65&layer=mapnik&marker=25.6135%2C85.1350"
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 bg-[#F7F9FC] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-white text-[#F4B400] flex items-center justify-center shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-bold text-sm text-[#102A43]">Visit Our Office</p>
                    <p className="text-xs text-gray-500">Boring Road, Patna, Bihar - 800001</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Boring+Road+Patna+Bihar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#062B49] text-[#062B49] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#062B49] hover:text-white transition shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <span className="block w-10 h-1 rounded-full bg-[#F4B400]" aria-hidden="true" />
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#102A43]">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-gray-600">Quick answers to common questions.</p>
        <FaqAccordion faqs={FAQS} />
      </section>

      {/* ── Still have questions CTA ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#FFF4CC] rounded-3xl px-6 py-10 md:px-12 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#102A43]">
              Still have questions?
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              We&rsquo;re here to help! Reach out to us anytime and we&rsquo;ll get back to you.
            </p>
          </div>
          <Link
            href="mailto:hello@patnafinder.com"
            className="inline-flex items-center gap-2 bg-[#062B49] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0B3A63] transition shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Us
          </Link>
        </div>
      </section>
    </main>
  );
}

