import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let business;
  let nearbyBusinesses = [];
  
  try {
    business = await api.getBusiness(slug);
    nearbyBusinesses = await api.getNearbyBusinesses(slug);
  } catch (error) {
    notFound();
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-amber-400 text-lg md:text-2xl' : 'text-gray-300 text-lg md:text-2xl'}>
        ★
      </span>
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-r from-blue-900 to-blue-700">
        {business.cover_image ? (
          <Image src={business.cover_image} alt={business.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl md:text-9xl">🏢</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Business Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 md:-mt-32 relative z-10">
        <div className="glass rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8">
            {/* Logo */}
            {business.logo && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex-shrink-0">
                <Image src={business.logo} alt={business.name} width={128} height={128} className="object-cover w-full h-full" />
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                {business.is_verified && (
                  <span className="badge badge-verified text-xs md:text-sm">✓ Verified</span>
                )}
                {business.is_featured && (
                  <span className="badge badge-featured text-xs md:text-sm">⭐ Featured</span>
                )}
                {business.is_trending && (
                  <span className="badge text-xs md:text-sm" style={{ background: '#FEF3C7', color: '#92400E' }}>🔥 Trending</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 break-words">{business.name}</h1>
              
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="flex">{renderStars(business.rating)}</div>
                <span className="text-lg md:text-2xl font-bold text-gray-900">{business.rating.toFixed(1)}</span>
                <span className="text-sm md:text-base text-gray-600">({business.review_count} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4 text-sm md:text-base text-gray-700 mb-5 md:mb-6">
                <span className="flex items-center gap-1.5 md:gap-2 break-words">
                  📁 <strong>{business.category.name}</strong>
                </span>
                <span className="flex items-center gap-1.5 md:gap-2 break-words">
                  📍 <strong>{business.area.name}</strong>
                </span>
                <span className="flex items-center gap-1.5 md:gap-2">
                  👁️ <strong>{business.view_count} views</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="btn-primary flex items-center justify-center gap-2 text-sm md:text-base px-4 py-2.5 md:px-6 md:py-3">
                    📞 Call Now
                  </a>
                )}
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm md:text-base">
                    💬 WhatsApp
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm md:text-base">
                    🌐 Website
                  </a>
                )}
                <button className="bg-gray-100 text-gray-900 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm md:text-base">
                  💾 Save
                </button>
                <button className="bg-gray-100 text-gray-900 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm md:text-base">
                  🔗 Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-16 md:pb-20">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* About */}
            {business.description && (
              <div className="card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words">{business.description}</p>
              </div>
            )}

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <div className="card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {business.amenities.map((amenity: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm md:text-base">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm md:text-base">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {business.awards && business.awards.length > 0 && (
              <div className="card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">🏆 Awards & Recognition</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {business.awards.map((award: any) => (
                    <div key={award.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-amber-50 rounded-xl">
                      <div className="text-3xl md:text-4xl">🏆</div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm md:text-base break-words">{award.award_name}</div>
                        <div className="text-xs md:text-sm text-gray-600">{award.award_year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Customer Reviews</h2>
                <button className="btn-primary text-sm md:text-base px-4 py-2 md:px-6 md:py-3 self-start sm:self-auto">Write Review</button>
              </div>

              {business.reviews && business.reviews.length > 0 ? (
                <div className="space-y-5 md:space-y-6">
                  {business.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-5 md:pb-6 last:border-0">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                          {review.author_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                            <div>
                              <div className="font-bold text-gray-900 text-sm md:text-base">{review.author_name}</div>
                              <div className="flex gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs md:text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words">{review.content}</p>
                          {review.is_verified && (
                            <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No reviews yet. Be the first to review!</p>
              )}
            </div>

            {/* FAQs */}
            {business.faqs && business.faqs.length > 0 && (
              <div className="card p-4 sm:p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3 md:space-y-4">
                  {business.faqs.map((faq: any) => (
                    <details key={faq.id} className="group">
                      <summary className="flex justify-between items-center cursor-pointer p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition gap-3">
                        <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.question}</span>
                        <span className="text-amber-500 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                      </summary>
                      <div className="p-3 md:p-4 text-gray-700 text-sm md:text-base break-words">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
            {/* Contact Info */}
            <div className="card p-4 sm:p-5 md:p-6 lg:sticky lg:top-24">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Contact Information</h3>
              <div className="space-y-3 md:space-y-4">
                {business.address && (
                  <div className="flex gap-2.5 md:gap-3">
                    <span className="text-xl md:text-2xl">📍</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Address</div>
                      <div className="text-gray-600 text-sm md:text-base break-words">{business.address}</div>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="flex gap-2.5 md:gap-3">
                    <span className="text-xl md:text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Phone</div>
                      <a href={`tel:${business.phone}`} className="text-amber-500 hover:underline text-sm md:text-base">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                {business.email && (
                  <div className="flex gap-2.5 md:gap-3">
                    <span className="text-xl md:text-2xl">📧</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Email</div>
                      <a href={`mailto:${business.email}`} className="text-amber-500 hover:underline text-sm md:text-base break-all">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
                {business.opening_hours && (
                  <div className="flex gap-2.5 md:gap-3">
                    <span className="text-xl md:text-2xl">🕐</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Opening Hours</div>
                      <div className="text-xs md:text-sm text-gray-600 mt-2 space-y-1">
                        {Object.entries(business.opening_hours).map(([day, hours]: [string, any]) => (
                          <div key={day} className="flex justify-between gap-2">
                            <span className="capitalize">{day}</span>
                            <span className="flex-shrink-0">{hours.open} - {hours.close}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {business.latitude && business.longitude && (
                <div className="mt-5 md:mt-6">
                  <div className="h-40 md:h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm md:text-base">Map View</span>
                  </div>
                  <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 px-4 md:py-3 rounded-xl transition text-sm md:text-base">
                    Get Directions →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Businesses */}
        {nearbyBusinesses.length > 0 && (
          <div className="pb-16 md:pb-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 md:mb-8">Nearby Businesses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {nearbyBusinesses.map((nearby: any) => (
                <Link key={nearby.id} href={`/business/${nearby.slug}`} className="card p-4 sm:p-5 md:p-6 group">
                  <h3 className="font-bold text-base md:text-lg group-hover:text-amber-500 transition break-words">{nearby.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{nearby.category.name}</p>
                  <p className="text-xs text-gray-500 mt-2">{nearby.distance?.toFixed(2)} km away</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
