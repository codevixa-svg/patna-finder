import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#011f37] text-white mt-20 overflow-hidden">

      {/* =========================================================
          MAIN FOOTER CONTENT
      ========================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[1.5fr_1fr_1.1fr_1.15fr_1.4fr_0.8fr] gap-x-8 gap-y-10">

          {/* =====================================================
              BRAND
          ===================================================== */}
          <div className="col-span-2 md:col-span-3 xl:col-span-1">

            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-5"
              aria-label="Patna Finder Home"
            >

              {/* Logo */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#F4B400"
                />

                <circle
                  cx="12"
                  cy="9.2"
                  r="2.5"
                  fill="#062B49"
                />
              </svg>

              <span className="leading-[1.05]">
                <span className="block text-lg font-extrabold tracking-wide text-white">
                  PATNA
                </span>

                <span className="block text-base font-semibold tracking-[0.28em] text-[#CBD5E1]">
                  FINDER
                </span>
              </span>

            </Link>


            <p className="text-[#A9B8C7] text-sm leading-relaxed mb-6 max-w-xs">
              Patna Finder helps you discover the best businesses,
              services and hidden gems in Patna.
            </p>


            {/* Social Icons */}
            <div className="flex items-center gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="
                  w-9 h-9
                  rounded-full
                  border border-[#31516B]
                  flex items-center justify-center
                  text-[#CBD5E1]
                  hover:border-[#F4B400]
                  hover:text-[#F4B400]
                  hover:bg-[#F4B400]/10
                  transition-all
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>


              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="
                  w-9 h-9
                  rounded-full
                  border border-[#31516B]
                  flex items-center justify-center
                  text-[#CBD5E1]
                  hover:border-[#F4B400]
                  hover:text-[#F4B400]
                  hover:bg-[#F4B400]/10
                  transition-all
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.644-.07-1.689-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>


              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="
                  w-9 h-9
                  rounded-full
                  border border-[#31516B]
                  flex items-center justify-center
                  text-[#CBD5E1]
                  hover:border-[#F4B400]
                  hover:text-[#F4B400]
                  hover:bg-[#F4B400]/10
                  transition-all
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>


              {/* X */}
              <a
                href="#"
                aria-label="X"
                className="
                  w-9 h-9
                  rounded-full
                  border border-[#31516B]
                  flex items-center justify-center
                  text-[#CBD5E1]
                  hover:border-[#F4B400]
                  hover:text-[#F4B400]
                  hover:bg-[#F4B400]/10
                  transition-all
                "
              >
                <span className="text-sm font-bold">
                  𝕏
                </span>
              </a>


              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="
                  w-9 h-9
                  rounded-full
                  border border-[#31516B]
                  flex items-center justify-center
                  text-[#CBD5E1]
                  hover:border-[#F4B400]
                  hover:text-[#F4B400]
                  hover:bg-[#F4B400]/10
                  transition-all
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>

            </div>

          </div>


          {/* =====================================================
              QUICK LINKS
          ===================================================== */}
          <div>

            <h3 className="text-[15px] font-bold text-white mb-5">
              Quick Links
            </h3>

            <ul className="space-y-2.5 text-sm text-[#A9B8C7]">

              <li>
                <Link href="/" className="hover:text-[#F4B400] transition">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/explore" className="hover:text-[#F4B400] transition">
                  Explore
                </Link>
              </li>

              <li>
                <Link href="/categories" className="hover:text-[#F4B400] transition">
                  Categories
                </Link>
              </li>

              <li>
                <Link href="/best-of-patna" className="hover:text-[#F4B400] transition">
                  Best Of Patna
                </Link>
              </li>

              <li>
                <Link href="/events" className="hover:text-[#F4B400] transition">
                  Events
                </Link>
              </li>

              <li>
                <Link href="/blog" className="hover:text-[#F4B400] transition">
                  Blog
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-[#F4B400] transition">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-[#F4B400] transition">
                  Contact Us
                </Link>
              </li>

            </ul>

          </div>


          {/* =====================================================
              TOP CATEGORIES
          ===================================================== */}
          <div>

            <h3 className="text-[15px] font-bold text-white mb-5">
              Top Categories
            </h3>

            <ul className="space-y-2.5 text-sm text-[#A9B8C7]">

              <li>
                <Link
                  href="/categories/coaching-institutes"
                  className="hover:text-[#F4B400] transition"
                >
                  Coaching Institutes
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/dentists"
                  className="hover:text-[#F4B400] transition"
                >
                  Dentists
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/doctors"
                  className="hover:text-[#F4B400] transition"
                >
                  Doctors
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/hospitals"
                  className="hover:text-[#F4B400] transition"
                >
                  Hospitals
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/restaurants"
                  className="hover:text-[#F4B400] transition"
                >
                  Restaurants
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/gyms"
                  className="hover:text-[#F4B400] transition"
                >
                  Gyms
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/lawyers"
                  className="hover:text-[#F4B400] transition"
                >
                  Lawyers
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/cafes"
                  className="hover:text-[#F4B400] transition"
                >
                  Cafes
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/schools"
                  className="hover:text-[#F4B400] transition"
                >
                  Schools
                </Link>
              </li>

            </ul>

          </div>


          {/* =====================================================
              FOR BUSINESSES
          ===================================================== */}
          <div>

            <h3 className="text-[15px] font-bold text-white mb-5">
              For Businesses
            </h3>

            <ul className="space-y-2.5 text-sm text-[#A9B8C7]">

              <li>
                <Link
                  href="/add-business"
                  className="hover:text-[#F4B400] transition"
                >
                  Add Business
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/login"
                  className="hover:text-[#F4B400] transition"
                >
                  Business Login
                </Link>
              </li>

              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[#F4B400] transition"
                >
                  Why List With Us?
                </Link>
              </li>

              <li>
                <Link
                  href="/advertise"
                  className="hover:text-[#F4B400] transition"
                >
                  Business Guidelines
                </Link>
              </li>

              <li>
                <Link
                  href="/businesses"
                  className="hover:text-[#F4B400] transition"
                >
                  Featured Listings
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#F4B400] transition"
                >
                  Contact Support
                </Link>
              </li>

            </ul>

          </div>


          {/* =====================================================
              NEWSLETTER
          ===================================================== */}
          <div className="col-span-2 md:col-span-3 xl:col-span-1 max-w-sm">

            <h3 className="text-[15px] font-bold text-white mb-3">
              Newsletter
            </h3>

            <p className="text-[#A9B8C7] text-sm leading-relaxed mb-4">
              Stay updated with the latest news, events and offers in Patna.
            </p>

            <div className="space-y-3">

              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                className="
                  w-full
                  bg-white
                  text-[#102A43]
                  text-sm
                  rounded-lg
                  px-4
                  py-3
                  placeholder-[#94A3B8]
                  border border-transparent
                  outline-none
                  focus:border-[#F4B400]
                  focus:ring-2
                  focus:ring-[#F4B400]/20
                  transition
                "
              />

              <button
                type="button"
                className="
                  w-full
                  bg-[#F4B400]
                  text-[#062B49]
                  py-3
                  rounded-lg
                  font-bold
                  text-sm
                  hover:bg-[#FFD35A]
                  hover:-translate-y-0.5
                  transition-all
                  shadow-lg
                  shadow-[#F4B400]/10
                "
              >
                Subscribe
              </button>

            </div>

          </div>


          {/* =====================================================
              PATNA ACCENT
          ===================================================== */}
          <div className="hidden xl:flex col-span-1 items-center justify-end pb-6">

            <p className="text-[#F4B400] text-[30px] leading-[1.05] -rotate-6 text-center font-script">
              Proudly
              <br />
              Patna,
              <br />
              Always ♥
            </p>

          </div>

        </div>


        {/* =========================================================
            BOTTOM BAR
        ========================================================= */}
        <div
          className="
            border-t
            border-white/10
            mt-12
            pt-5
            pb-5
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
            text-xs
            text-[#94A3B8]
          "
        >

          <p>
            © {year} Patna Finder. All Rights Reserved.
          </p>

          <div className="flex items-center gap-3">

            <Link
              href="/terms-of-use"
              className="hover:text-[#F4B400] transition"
            >
              Terms of Use
            </Link>

            <span
              className="text-[#31516B]"
              aria-hidden="true"
            >
              |
            </span>

            <Link
              href="/privacy-policy"
              className="hover:text-[#F4B400] transition"
            >
              Privacy Policy
            </Link>

          </div>

        </div>

      </div>


      {/* =========================================================
          PATNA GOLDEN SKYLINE
          PNG: 2137 × 365
          Transparent background
      ========================================================= */}
      <div
        className="
          relative
          w-full
          h-[100px]
          sm:h-[140px]
          md:h-[180px]
          lg:h-[200px]
          -mt-1
          overflow-visible
          pointer-events-none
          select-none
        "
        aria-hidden="true"
      >

        <Image
          src="/images/footer-png.png"
          alt=""
          width={2137}
          height={365}
          sizes="100vw"
          priority
          className="
            absolute
            left-0
            bottom-0
            w-full
            h-auto
            object-cover
            object-bottom
            opacity-30
          "
        />

      </div>


      {/* =========================================================
          SUBTLE GOLD GLOW
      ========================================================= */}
      <div
        className="
          absolute
          bottom-0
          left-1/2
          -translate-x-1/2
          w-[70%]
          h-32
          bg-[#F4B400]/5
          blur-3xl
          pointer-events-none
        "
        aria-hidden="true"
      />

    </footer>
  );
}