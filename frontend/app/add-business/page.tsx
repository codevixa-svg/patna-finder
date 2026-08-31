'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AddBusinessPage() {
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    area_id: '',
    description: '',
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    whatsapp: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [cats, ars] = await Promise.all([
        api.getCategories(),
        api.getAreas(),
      ]);
      setCategories(cats);
      setAreas(ars);
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.submitBusiness(formData);
      setSuccess(true);
      setFormData({
        name: '',
        category_id: '',
        area_id: '',
        description: '',
        owner_name: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        whatsapp: '',
      });
    } catch (err: any) {
      setError('Failed to submit business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Add Your Business</h1>
          <p className="text-xl text-gray-800">
            List your business for FREE and get discovered by thousands of potential customers
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {success ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Submission Successful!</h2>
            <p className="text-gray-600 mb-8">
              Your business listing has been submitted successfully. Our team will review it and publish within 24-48 hours.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="btn-primary"
            >
              Submit Another Business
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-2xl font-bold mb-6">Business Information</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Dr. Sharma's Dental Clinic"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Area *
                </label>
                <select
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Area</option>
                  {areas.map((area: any) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Full business address"
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Tell us about your business..."
              ></textarea>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">What happens next?</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Your listing will be reviewed by our team</li>
                    <li>• We'll verify the information provided</li>
                    <li>• Your business will be live within 24-48 hours</li>
                    <li>• You'll receive a confirmation email</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Business Listing'}
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              By submitting, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        )}
      </section>

      {/* Benefits */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">Why List on Patna Finder?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Reach Local Customers</h3>
              <p className="text-gray-600">Get discovered by thousands searching for services in Patna</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💯</div>
              <h3 className="text-xl font-bold mb-2">Build Trust</h3>
              <p className="text-gray-600">Verified badge and customer reviews build credibility</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
              <p className="text-gray-600">Analytics and insights to understand your audience</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
