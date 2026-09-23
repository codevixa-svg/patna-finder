'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Globe,
  Users,
  Store,
  ShieldCheck,
  Scale,
  Copyright,
  Megaphone,
  AlertTriangle,
  FileX,
  Gavel,
  RefreshCw,
  Phone,
  Heart,
  ChevronDown,
  MapPin,
} from 'lucide-react';

const SECTIONS: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: string[];
}[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: FileText,
    body: [
      'Welcome to Patna Finder. By accessing or using patnafinder.com (the "Platform"), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, please stop using the Platform.',
    ],
  },
  {
    id: 'use-of-the-platform',
    title: '2. Use of the Platform',
    icon: Globe,
    body: [
      'Patna Finder is a local discovery platform. You may browse business listings, read and submit reviews, and discover events and areas across the city for personal, non-commercial use.',
      'You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else\'s use of the Platform.',
    ],
  },
  {
    id: 'user-accounts',
    title: '3. User Accounts',
    icon: Users,
    body: [
      'You must be at least 13 years old to use Patna Finder. Business owner accounts require accurate registration details.',
      'You are responsible for keeping your account credentials confidential and for all activity that happens under your account.',
    ],
  },
  {
    id: 'business-listings',
    title: '4. Business Listings',
    icon: Store,
    body: [
      'Business information submitted to the Platform must be accurate, lawful and not misleading. Listings submitted for review are placed in a pending state until approved by our team.',
      'We may edit, reject, suspend or remove any listing that violates these terms, is duplicated, inaccurate, or reported to us by the rightful owner.',
      'Claiming a business requires reasonable proof of ownership or authorisation. False ownership claims may result in permanent account suspension.',
    ],
  },
  {
    id: 'content-guidelines',
    title: '5. Content Guidelines',
    icon: ShieldCheck,
    body: [
      'Reviews must be based on genuine first-hand experience. Fake reviews, paid reviews, review swapping, or reviews intended to harm a competitor are strictly prohibited.',
      'We may remove content that is defamatory, hateful, obscene, invasive of privacy, or otherwise in violation of these terms, and suspend accounts that repeatedly violate review guidelines.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable Use',
    icon: Scale,
    body: [
      'You agree NOT to: scrape or harvest data from the Platform at scale; attempt to gain unauthorised access to our systems; interfere with the Platform\'s operation; impersonate any person or business; or use the Platform for any unlawful purpose.',
    ],
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property',
    icon: Copyright,
    body: [
      'The Platform\'s design, branding, code and content are owned by Patna Finder or its licensors. Business owners retain ownership of the content they submit, but grant us a non-exclusive, worldwide licence to display it on the Platform.',
    ],
  },
  {
    id: 'advertising-third-party',
    title: '8. Advertising & Third-Party Content',
    icon: Megaphone,
    body: [
      'Sponsored and featured placements are clearly labelled. We are not responsible for the products or services advertised by third parties on the Platform.',
    ],
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    icon: AlertTriangle,
    body: [
      'The Platform is provided on an "as is" and "as available" basis. While we work hard to keep listings accurate and up to date, we do not warrant that all information is complete, current, or error-free.',
      'Always verify critical details (such as medical, legal or financial advice) directly with the business before making decisions.',
    ],
  },
  {
    id: 'limitation-of-liability',
    title: '10. Limitation of Liability',
    icon: FileX,
    body: [
      'To the maximum extent permitted by law, Patna Finder shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Platform.',
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law',
    icon: Gavel,
    body: [
      'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Patna, Bihar.',
    ],
  },
  {
    id: 'changes-to-terms',
    title: '12. Changes to These Terms',
    icon: RefreshCw,
    body: [
      'We may revise these Terms of Use from time to time. Continued use of the Platform after changes are published constitutes acceptance of the revised terms.',
    ],
  },
];

export type LegalSection = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: string[];
};

export type LegalContentProps = {
  breadcrumbLabel: string;
  titleGold: string;
  titleWhite: string;
  subtitle: string;
  tagline: string;
  helpText: string;
  sections: LegalSection[];
  readMoreLabel: string;
};

export default function TermsContent() {
  return (
    <LegalContent
      breadcrumbLabel="Terms of Use"
      titleGold="Terms of"
      titleWhite="Use"
      subtitle="Please read these terms carefully before using Patna Finder."
      tagline="A trusted local platform for a better Patna"
      helpText="Have questions about our Terms of Use? We're here to help."
      readMoreLabel="Read Full Terms"
      sections={SECTIONS}
    />
  );
}

export function LegalContent({
  breadcrumbLabel,
  titleGold,
  titleWhite,
  subtitle,
  tagline,
  helpText,
  sections,
  readMoreLabel,
}: LegalContentProps) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ===== Hero ===== */}
      <section className="relative bg-[#062B49] text-white overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 h-28 opacity-[0.14] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cg fill='%23ffffff'%3E%3Crect x='0' y='70' width='60' height='50'/%3E%3Crect x='70' y='40' width='40' height='80'/%3E%3Crect x='120' y='60' width='70' height='60'/%3E%3Crect x='200' y='30' width='45' height='90'/%3E%3Crect x='255' y='75' width='80' height='45'/%3E%3Crect x='345' y='50' width='55' height='70'/%3E%3Crect x='410' y='65' width='90' height='55'/%3E%3Crect x='510' y='35' width='40' height='85'/%3E%3Crect x='560' y='70' width='75' height='50'/%3E%3Crect x='645' y='45' width='50' height='75'/%3E%3Crect x='705' y='60' width='85' height='60'/%3E%3Crect x='800' y='30' width='42' height='90'/%3E%3Crect x='852' y='70' width='70' height='50'/%3E%3Crect x='932' y='50' width='55' height='70'/%3E%3Crect x='997' y='65' width='80' height='55'/%3E%3Crect x='1087' y='40' width='45' height='80'/%3E%3Crect x='1140' y='70' width='60' height='50'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-300 mb-10 mt-20">
            <Link href="/" className="hover:text-[#F4B400] transition">
              Home
            </Link>
            <span className="text-gray-500">›</span>
            <span className="text-[#F4B400]">{breadcrumbLabel}</span>
          </nav>

          <div className="md:flex md:items-end md:justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-[#F4B400]">{titleGold}</span>{' '}
                <span className="text-white">{titleWhite}</span>
              </h1>
              <p className="mt-4 text-gray-300 text-base sm:text-lg max-w-xl">
                {subtitle}
              </p>
              <p className="mt-6 text-sm text-gray-400">{tagline}</p>
            </div>
            <div className="mt-8 md:mt-0 md:text-right shrink-0">
              <p className="inline-flex items-center gap-2 text-[#F4B400] italic font-serif text-lg sm:text-xl">
                Patna City,
                <span className="inline-flex items-center gap-1 not-italic">
                  Our Passion <Heart className="w-4 h-4 fill-[#F4B400] text-[#F4B400]" />
                </span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 border border-gray-600/60 rounded-full px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F4B400]" /> Patna, Bihar, India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Body ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-10">
          {/* ---- Left column: TOC + Need Help ---- */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6 mb-10 lg:mb-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-[#062B49] uppercase tracking-wide mb-4">
                On this page
              </h2>
              <ol className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        activeId === s.id
                          ? 'bg-[#062B49]/5 text-[#062B49] font-semibold border-l-2 border-[#F4B400]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#062B49]'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 ${
                          activeId === s.id
                            ? 'bg-[#F4B400] text-[#062B49]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span>{s.title.replace(/^\d+\.\s*/, '')}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {/* Need Help card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F4B400]/15 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5 text-[#F4B400]" />
              </div>
              <h3 className="text-lg font-bold text-[#062B49]">Need Help?</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{helpText}</p>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center justify-center w-full bg-[#F4B400] hover:bg-[#d9a000] text-[#062B49] text-sm font-bold rounded-full px-5 py-3 transition"
              >
                Contact Us <span className="ml-1">→</span>
              </Link>
            </div>
          </aside>

          {/* ---- Right column: section cards ---- */}
          <div className="space-y-5">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 scroll-mt-24"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#062B49]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#062B49] mb-2">
                        {section.title}
                      </h2>
                      <div className="space-y-3">
                        {section.body.map((para, i) => (
                          <p key={i} className="text-sm text-gray-600 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Read full terms button */}
            <div className="text-center pt-2">
              <button
                onClick={() => scrollTo(SECTIONS[0].id)}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#F4B400] text-[#062B49] text-sm font-semibold rounded-full px-6 py-3 shadow-sm transition"
              >
                Read {readMoreLabel} <ChevronDown className="w-4 h-4 text-[#F4B400]" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
