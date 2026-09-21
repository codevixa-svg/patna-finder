import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CalendarDays,
  Eye,
  Gem,
  HeartHandshake,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import TestimonialCarousel from '@/components/TestimonialCarousel';

export const metadata = {
  title: 'About Us | Patna Finder — Our Story, Mission & Team',
  description:
    'Discover the story, mission and people behind Patna Finder — a platform built to connect, support and grow the vibrant community of Patna.',
};

/** Small green uppercase section label with a leading dash line. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#F4B400]">
      <span className="h-px w-8 bg-[#F4B400]" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function AboutPage() {
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
          {/* Breadcrumb (white, overlays the hero like the reference design) */}
          <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
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
              <li className="text-white font-medium">About Us</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                About <span className="text-[#F4B400]">Patna</span> Finder
              </h1>
              <p className="mt-5 text-base md:text-lg text-[#FFF4CC]/90 leading-relaxed max-w-xl">
                Discover the story, mission and people behind Patna Finder — a platform built to
                connect, support and grow the vibrant community of Patna.
              </p>
            </div>

            {/* Script accent — right side */}
            <div className="hidden lg:block text-right shrink-0">
              <p className="font-script text-3xl xl:text-4xl text-[#D7E7F5] leading-snug">
                Patna,
                <br />
                Our Pride,
                <br />
                Our People,
                <br />
                Our Stories
              </p>
              <svg
                viewBox="0 0 180 12"
                className="ml-auto mt-2 w-40 text-[#F4B400]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 8c30-6 60-6 87-2 28 4 58 2 87-3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionLabel>Our Story</SectionLabel>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#102A43]">
              Building a Stronger Patna Together
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Patna Finder was born out of a simple idea — to create a trusted and easy-to-use
              platform that connects people with the best businesses, services, events and stories
              from Patna. We saw a need for a local platform that not only helps users discover
              great places but also supports local businesses and showcases the true spirit of
              our city.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              From popular cafés and coaching institutes to hospitals, event venues and hidden
              gems, Patna Finder brings everything together in one place. Our goal is to make it
              easier for everyone — residents, students, professionals and visitors — to explore,
              connect and grow with Patna.
            </p>
            <Link
              href="/explore"
              className="mt-8 inline-flex items-center gap-2 bg-[#062B49] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0B3A63] transition"
            >
              Our Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative pb-14">
            <Image
              src="https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80"
              alt="Heritage monument of Patna surrounded by greenery"
              width={900}
              height={620}
              className="w-full h-[340px] md:h-[420px] object-cover rounded-2xl"
            />
            {/* Floating quote card */}
            <div className="absolute -bottom-2 right-0 md:right-4 max-w-[290px] bg-[#FFF4CC] rounded-2xl p-5 shadow-xl">
              <div className="flex gap-3">
                <span className="text-[#F4B400] text-4xl leading-none font-serif" aria-hidden="true">
                  &ldquo;
                </span>
                <p className="text-sm font-semibold text-[#102A43] leading-relaxed">
                  A platform for people, by the people, to make Patna shine brighter.
                </p>
              </div>
              <p className="mt-2 text-xs font-medium text-gray-500 pl-9">— Team Patna Finder</p>
            </div>
            {/* Script accent — bottom left */}
            <p className="font-script absolute -bottom-10 left-4 text-2xl text-[#F4B400] -rotate-3">
              More Than a City,
              <br />
              A Community
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values / Commitment + Stats ───────────────── */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {[
            {
              icon: Users,
              title: 'Our Mission',
              text: 'To connect people with the best businesses, services and opportunities in Patna.',
            },
            {
              icon: Eye,
              title: 'Our Vision',
              text: 'To become the most trusted and comprehensive local directory platform for Patna and beyond.',
            },
            {
              icon: Gem,
              title: 'Our Values',
              text: 'Trust, community, innovation and local growth drive everything we do.',
            },
            {
              icon: HeartHandshake,
              title: 'Our Commitment',
              text: 'To support local businesses, promote city events and help Patna grow together.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#EFF7F1] rounded-2xl p-6 text-center">
              <span className="w-12 h-12 rounded-full bg-[#F4B400] text-white flex items-center justify-center mx-auto">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-[#102A43]">{title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}

          {/* Stats panel */}
          <div className="md:col-span-2 bg-[#0B3A63] rounded-2xl p-6 md:p-8 grid grid-cols-2 gap-6 content-center">
            {[
              { icon: Store, value: '1,250+', label: 'Businesses Listed' },
              { icon: Users, value: '100K+', label: 'Happy Users' },
              { icon: CalendarDays, value: '500+', label: 'Events Covered' },
              { icon: Star, value: '4.8', label: 'Average Rating' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-white/10 text-[#F4B400] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-xl md:text-2xl font-extrabold text-white">{value}</span>
                  <span className="block text-xs md:text-sm text-[#D7E7F5]/80">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Patna Finder ─────────────────────────────────────────────── */}
      <section className="bg-[#F4FAF6] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=900&q=80"
              alt="Sunset over the river ghats with boats"
              width={900}
              height={640}
              className="w-full h-[320px] md:h-[420px] object-cover rounded-2xl"
            />
            <p className="font-script absolute bottom-8 left-6 text-2xl md:text-3xl text-white leading-snug -rotate-3 drop-shadow-md">
              Local Businesses,
              <br />
              Stronger Patna,
              <br />
              Brighter Tomorrow
            </p>
            <svg
              viewBox="0 0 180 10"
              className="absolute bottom-3 left-10 w-40 text-[#F4B400]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 6c30-5 60-5 87-2 28 3 58 1 87-3" />
            </svg>
          </div>

          <div>
            <SectionLabel>Why Patna Finder</SectionLabel>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-[#102A43]">
              More Than Just a Directory
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We are more than a listing platform. We are a community-driven initiative that
              celebrates the people, places and possibilities of Patna.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-7">
              {[
                { icon: MapPin, title: 'Local Focus', text: 'Everything you need, all about Patna.' },
                {
                  icon: CalendarDays,
                  title: 'Events & Updates',
                  text: 'Stay informed about the latest happenings.',
                },
                { icon: ShieldCheck, title: 'Verified Listings', text: 'Trusted and updated information.' },
                { icon: TrendingUp, title: 'Support Local', text: 'Help local businesses grow.' },
                {
                  icon: Users,
                  title: 'Community Driven',
                  text: 'Built for and by the Patna community.',
                },
                {
                  icon: Send,
                  title: 'Easy to Use',
                  text: 'Simple, fast and user-friendly experience.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4">
                  <span className="w-10 h-10 rounded-xl bg-[#FFF4CC] text-[#F4B400] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-[#102A43]">{title}</span>
                    <span className="block mt-0.5 text-sm text-gray-500 leading-relaxed">{text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet Our Team ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43]">Meet Our Team</h2>
          <span className="block w-10 h-1 mt-3 rounded-full bg-[#F4B400]" aria-hidden="true" />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Rahul Kumar',
                role: 'Founder & CEO',
                bio: 'A passionate entrepreneur working to showcase the best of Patna.',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              },
              {
                name: 'Priya Singh',
                role: 'Content & Community',
                bio: 'Loves exploring local stories, events and connecting with the community.',
                avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
              },
              {
                name: 'Aman Verma',
                role: 'Tech & Product',
                bio: 'Building digital solutions for a stronger and smarter Patna.',
                avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
              },
            ].map((member) => (
              <div
                key={member.name}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-[#102A43]">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                <a
                  href="https://www.linkedin.com/company/patna-finder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  className="mt-4 inline-flex w-8 h-8 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] items-center justify-center hover:bg-[#0A66C2] hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                  </svg>
                </a>
              </div>
            ))}

            {/* Join the journey card */}
            <div className="bg-[#FFF4CC] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <span className="w-12 h-12 rounded-full bg-[#F4B400] text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-[#102A43] leading-snug">
                Want to be a part of our journey?
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                We&rsquo;re always open to collaborations, suggestions and partnerships.
              </p>
              <a
                href="mailto:hello@patnafinder.com"
                className="mt-5 inline-flex items-center gap-2 border border-[#062B49] text-[#062B49] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#062B49] hover:text-white transition"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── What People Say ──────────────────────────────────────────────── */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#102A43]">What People Say</h2>
          <span className="block w-10 h-1 mt-3 rounded-full bg-[#F4B400]" aria-hidden="true" />
          <TestimonialCarousel />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden bg-[#FFF4CC] rounded-3xl px-6 py-12 md:px-12 md:py-14 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          {/* Skyline line-art */}
          <svg
            viewBox="0 0 220 90"
            className="hidden lg:block w-44 shrink-0 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M2 88V60h10v28M12 88V48h12v40M24 88V30h8v58M32 88V44h12v44M44 88V22h10v66M54 88V50h10v38M64 88V36h12v52M76 88V56h10v32M86 88V40h12v48M98 88V26h10v62M108 88V52h12v36M120 88V34h10v54M130 88V58h12v30M142 88V42h10v46M152 88V24h12v64M164 88V54h10v34M174 88V38h12v50M186 88V60h10v28M196 88V46h12v42M208 88V64h10v24" />
          </svg>

          <div className="text-center lg:text-left flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#102A43]">
              Let&rsquo;s Build a Brighter Patna Together
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              List your business, explore opportunities and be a part of our growing community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
            <Link
              href="/dashboard/add-business"
              className="inline-flex items-center gap-2 bg-[#062B49] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0B3A63] transition"
            >
              <Plus className="w-4 h-4" />
              Add Your Business
            </Link>
            <p className="font-script text-2xl text-[#F4B400] -rotate-3 text-center leading-snug">
              Same City,
              <br />
              Bigger Possibilities
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
