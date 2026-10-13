'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import CategoryBrowser from '@/components/CategoryBrowser';

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  coaching: { icon: '📚', label: 'Coaching Institutes' },
  hospitals: { icon: '🏥', label: 'Hospitals' },
  restaurants: { icon: '🍽️', label: 'Restaurants' },
  cafes: { icon: '☕', label: 'Cafes' },
  dentists: { icon: '🦷', label: 'Dental Clinics' },
  doctors: { icon: '👨‍⚕️', label: 'Doctors' },
  gyms: { icon: '💪', label: 'Gyms & Fitness' },
  hotels: { icon: '🏨', label: 'Hotels' },
  schools: { icon: '🏫', label: 'Schools' },
  lawyers: { icon: '⚖️', label: 'Lawyers' },
};

export default function BestOfCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [categoryData, setCategoryData] = useState<any>(null);
  const [heroStats, setHeroStats] = useState({ total: 0, avgRating: 0, reviewCount: 0 });
  const [areaCounts, setAreaCounts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[categorySlug] || { icon: '🏆', label: categorySlug.replace(/-/g, ' ') };

  useEffect(() => {
    fetchCategoryData();
  }, [categorySlug]);

  async function fetchCategoryData() {
    try {
      // Get categories list
      const categories = await api.getCategories();
      const catList = Array.isArray(categories) ? categories : categories.data || [];
      const cat = catList.find((c: any) => 
        c.slug === categorySlug || 
        c.name?.toLowerCase().includes(categorySlug) ||
        c.slug?.includes(categorySlug)
      );

      if (cat) {
        setCategoryData(cat);
        
        // Fetch businesses for this category to get stats
        try {
          const res: any = await api.getCategoryBusinesses(cat.slug, {
            page: 1,
            per_page: 12,
            sort: 'rating', // Best of Patna shows highest rated
          });
          
          setHeroStats({
            total: res?.stats?.total ?? res?.businesses?.total ?? 0,
            avgRating: Number(res?.stats?.avg_rating ?? 0),
            reviewCount: Number(res?.stats?.review_count ?? 0),
          });
          setAreaCounts(Array.isArray(res?.area_counts) ? res.area_counts : []);
          setTopCategories(Array.isArray(res?.top_categories) ? res.top_categories : []);
        } catch {
          // Stats API failed, continue with empty stats
        }
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setLoading(false);
    }
  }

  // Show CategoryBrowser even while loading - it has its own loading states
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      {!loading && !categoryData ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">{meta.icon}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <a 
              href="/best-of-patna" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F4B400] text-[#062B49] rounded-lg font-semibold hover:bg-[#FFD35A] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Best of Patna
            </a>
          </div>
        </div>
      ) : categoryData ? (
        <CategoryBrowser
          slug={categoryData.slug}
          categoryName={categoryData.name}
          categoryIcon={categoryData.icon || meta.icon}
          heroStats={heroStats}
          areaCounts={areaCounts}
          topCategories={topCategories}
          isBestOfPatna={true}
          defaultSort="rating"
        />
      ) : null}
    </main>
  );
}
