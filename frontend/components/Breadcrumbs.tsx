import Link from 'next/link';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://patnafinder.com';

/**
 * Shared breadcrumb bar — matches the Business Details page UI exactly:
 * white bar with bottom border, Home link with icon, chevron separators,
 * gray links that darken on hover and a bold navy current-page label.
 * Also emits BreadcrumbList JSON-LD for SEO (Requirement 10.7).
 *
 * Server-safe (no hooks), so it can be used from server and client pages.
 * Place it right below the hero on pages that have one, or at the very top
 * of the content on pages that don't.
 */
export default function Breadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  // Home is always the first crumb; callers pass the rest of the trail.
  const trail: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];
  const last = trail.length - 1;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && index < last ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={`bg-white border-b border-gray-200 ${className}`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm">
            {trail.map((item, index) => {
              const isLast = index === last;
              const isHome = index === 0;
              return (
                <Fragment key={`${item.label}-${index}`}>
                  {index > 0 && (
                    <li aria-hidden="true" className="text-gray-300 flex items-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                      </svg>
                    </li>
                  )}
                  {!isLast && item.href ? (
                    <li>
                      <Link
                        href={item.href}
                        className={`text-gray-500 hover:text-[#153b78] font-medium transition ${
                          isHome ? 'inline-flex items-center gap-1.5' : ''
                        }`}
                      >
                        {isHome && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"
                            />
                          </svg>
                        )}
                        {item.label}
                      </Link>
                    </li>
                  ) : (
                    <li className="text-[#153b78] font-semibold truncate max-w-[260px]">
                      {item.label}
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* BreadcrumbList Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
