'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const LIKED_REVIEWS_KEY = 'patna_liked_review_ids';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
  { value: 'likes', label: 'Most Helpful' },
];

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-600',
  'bg-orange-500',
  'bg-teal-600',
];

interface ReviewMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  average: number;
  distribution: Record<string, number>;
}

const Star = ({
  filled,
  half = false,
  className = 'w-4 h-4',
}: {
  filled: boolean;
  half?: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 20 20"
    className={`${className} ${filled || half ? 'text-amber-400' : 'text-gray-300'}`}
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fill={half ? 'url(#half-star)' : 'currentColor'}
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81h4.161a1 1 0 00.951-.69l1.286-3.958z"
    />
  </svg>
);

const Stars = ({ rating, className }: { rating: number; className?: string }) => (
  <div className={`flex items-center gap-0.5 ${className || ''}`} aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        filled={rating >= star}
        half={rating > star - 1 && rating < star}
      />
    ))}
  </div>
);

export default function BusinessReviews({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Like tracking (client-side guard against duplicate likes)
  const [likedIds, setLikedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LIKED_REVIEWS_KEY) || '[]');
      setLikedIds(Array.isArray(stored) ? stored : []);
    } catch {
      setLikedIds([]);
    }
  }, []);

  const fetchReviews = useCallback(
    async (page: number, sort: string, append = false) => {
      try {
        const res = await api.getReviews(businessId, {
          page,
          per_page: 5,
          sort_by: sort,
        });
        const list = Array.isArray(res) ? res : res?.data || [];
        const nextMeta: ReviewMeta = {
          current_page: res?.meta?.current_page ?? page,
          last_page: res?.meta?.last_page ?? 1,
          per_page: res?.meta?.per_page ?? 5,
          total: res?.meta?.total ?? list.length,
          average: Number(res?.meta?.average ?? 0),
          distribution: res?.meta?.distribution ?? {},
        };

        setReviews((prev) => (append ? [...prev, ...list] : list));
        setMeta(nextMeta);
      } catch {
        if (!append) {
          setReviews([]);
          setMeta(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [businessId],
  );

  useEffect(() => {
    setLoading(true);
    fetchReviews(1, sortBy);
  }, [sortBy, fetchReviews]);

  const loadMore = () => {
    if (!meta || loadingMore) return;
    setLoadingMore(true);
    fetchReviews(meta.current_page + 1, sortBy, true);
  };

  const handleLike = async (review: any) => {
    if (likedIds.includes(review.id)) return;

    // Optimistic update
    setReviews((prev) =>
      prev.map((r) =>
        r.id === review.id ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r,
      ),
    );

    try {
      const res = await api.likeReview(review.id);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, likes_count: res?.likes_count ?? r.likes_count } : r,
        ),
      );

      const next = [...likedIds, review.id];
      setLikedIds(next);
      localStorage.setItem(LIKED_REVIEWS_KEY, JSON.stringify(next));
    } catch {
      // Revert on failure
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, likes_count: Math.max(0, (r.likes_count || 1) - 1) } : r,
        ),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRating) {
      toast.error('Please select a star rating');
      return;
    }
    if (formName.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    if (formContent.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitReview(businessId, {
        author_name: formName.trim(),
        author_email: formEmail.trim() || undefined,
        rating: formRating,
        content: formContent.trim(),
      });

      toast.success('Review submitted! It will appear once approved.');
      setFormRating(0);
      setFormName('');
      setFormEmail('');
      setFormContent('');
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = meta?.total ?? 0;
  const average = meta?.average ?? 0;
  const distribution = meta?.distribution || {};

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>

      {/* Summary + Distribution */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col items-center sm:items-start sm:w-40">
          <span className="text-4xl font-extrabold text-gray-900 leading-none">
            {average > 0 ? average.toFixed(1) : '0.0'}
          </span>
          <Stars rating={average} className="mt-1.5" />
          <span className="text-xs text-gray-500 mt-1">
            {total} {total === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[String(star)] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                <Star filled={true} className="w-3 h-3" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="sm:w-44">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#153b78] text-white text-sm font-semibold hover:bg-[#0f2c5c] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>
      </div>

      {/* Write a Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-xl p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setFormRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    filled={star <= (hoverRating || formRating)}
                    className="w-7 h-7"
                  />
                </button>
              ))}
              {formRating > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formRating - 1]}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                maxLength={255}
                placeholder="e.g. Rahul Kumar"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#153b78]/30 focus:border-[#153b78] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#153b78]/30 focus:border-[#153b78] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={`Share your experience with ${businessName}...`}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#153b78]/30 focus:border-[#153b78] transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formContent.length}/1000
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Sort bar */}
      {total > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing {reviews.length} of {total} reviews
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#153b78]/30 focus:border-[#153b78] transition cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3.5 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-900 font-semibold mb-1">No reviews yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Be the first to share your experience with {businessName}.
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-5 py-2 rounded-lg bg-[#153b78] text-white text-sm font-semibold hover:bg-[#0f2c5c] transition"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const liked = likedIds.includes(review.id);
            const avatarColor =
              AVATAR_COLORS[(review.id || 0) % AVATAR_COLORS.length];

            return (
              <div
                key={review.id}
                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}
                  >
                    {(review.author_name || 'A').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {review.author_name || 'Anonymous'}
                      </span>
                      {review.is_verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 01-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Stars rating={Number(review.rating) || 0} />
                      <span className="text-xs text-gray-400">
                        {review.created_at
                          ? formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-6 mt-2.5 whitespace-pre-line">
                      {review.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <button
                        type="button"
                        onClick={() => handleLike(review)}
                        disabled={liked}
                        aria-label="Helpful"
                        className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${
                          liked
                            ? 'text-[#153b78] cursor-default'
                            : 'text-gray-500 hover:text-[#153b78]'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={liked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10v10M7 10l4.35-6.53a1.5 1.5 0 012.72 1.23L13.5 9H19a1.5 1.5 0 011.45 1.88l-1.6 6.4A2 2 0 0116.9 19H7m0-9H4.5A1.5 1.5 0 003 11.5v7A1.5 1.5 0 004.5 20H7" />
                        </svg>
                        Helpful ({review.likes_count || 0})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More */}
          {meta && meta.current_page < meta.last_page && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
            >
              {loadingMore ? 'Loading...' : 'Load More Reviews'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
