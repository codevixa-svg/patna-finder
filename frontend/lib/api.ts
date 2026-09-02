const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Base URL without the /api/v1 suffix — used to build storage/asset URLs
export const API_BASE_URL = API_URL.replace(/\/api\/v1\/?$/, '');

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Categories
  getCategories: async () => {
    return fetchJson(`${API_URL}/categories`);
  },

  // Areas
  getAreas: async () => {
    return fetchJson(`${API_URL}/areas`);
  },

  getArea: async (slug: string) => {
    return fetchJson(`${API_URL}/areas/${slug}`);
  },

  getAreaBusinesses: async (slug: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchJson(`${API_URL}/areas/${slug}/businesses${queryString}`);
  },

  // Businesses
  getBusinesses: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchJson(`${API_URL}/businesses${queryString}`);
  },

  getTrendingBusinesses: async () => {
    return fetchJson(`${API_URL}/businesses/trending`);
  },

  getFeaturedBusinesses: async () => {
    return fetchJson(`${API_URL}/businesses/featured`);
  },

  getHiddenGems: async () => {
    return fetchJson(`${API_URL}/businesses/hidden-gems`);
  },

  getBusiness: async (slug: string) => {
    return fetchJson(`${API_URL}/businesses/${slug}`);
  },

  getNearbyBusinesses: async (slug: string) => {
    return fetchJson(`${API_URL}/businesses/${slug}/nearby`);
  },

  submitBusiness: async (data: any) => {
    return fetchJson(`${API_URL}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Reviews
  getLatestReviews: async () => {
    return fetchJson(`${API_URL}/reviews/latest`);
  },

  getReviews: async (slug: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchJson(`${API_URL}/businesses/${slug}/reviews${queryString}`);
  },

  submitReview: async (slug: string, data: any) => {
    return fetchJson(`${API_URL}/businesses/${slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  likeReview: async (id: number) => {
    return fetchJson(`${API_URL}/reviews/${id}/like`, { method: 'POST' });
  },

  // Blog
  getBlogPosts: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchJson(`${API_URL}/blog${queryString}`);
  },

  getLatestBlogPosts: async () => {
    return fetchJson(`${API_URL}/blog/latest`);
  },

  getBlogPost: async (slug: string) => {
    return fetchJson(`${API_URL}/blog/${slug}`);
  },

  // Search
  search: async (query: string) => {
    return fetchJson(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  },

  getPopularSearches: async () => {
    return fetchJson(`${API_URL}/popular-searches`);
  },
};
