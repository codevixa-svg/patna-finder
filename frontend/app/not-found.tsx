import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-extrabold text-amber-400 mb-4">404</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-10">
          The page you are looking for doesn’t exist or may have moved. Let’s get you back on
          track.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="bg-amber-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-md"
          >
            Go Home
          </Link>
          <Link
            href="/businesses"
            className="bg-white text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition border border-gray-200"
          >
            Explore Businesses
          </Link>
        </div>
        <div className="mt-10 text-sm text-gray-500">
          Popular links:{' '}
          <Link href="/explore" className="text-amber-600 hover:underline">
            Explore
          </Link>
          {' · '}
          <Link href="/categories" className="text-amber-600 hover:underline">
            Categories
          </Link>
          {' · '}
          <Link href="/best-of-patna" className="text-amber-600 hover:underline">
            Best Of Patna
          </Link>
          {' · '}
          <Link href="/blog" className="text-amber-600 hover:underline">
            Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
