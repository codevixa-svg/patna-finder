'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userSubscriptionApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    period: 'month',
    features: [
      'Up to 3 business listings',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'month',
    features: [
      'Unlimited business listings',
      'Advanced analytics',
      'Featured on homepage',
      'Priority support',
    ],
    highlight: true,
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/dashboard/login'); return; }
    fetchCurrentPlan();
  }, [isAuthenticated, mounted, router]);

  async function fetchCurrentPlan() {
    try {
      setLoading(true);
      const data = await userSubscriptionApi.getCurrentPlan();
      setCurrentPlan(data.plan || 'free');
      setExpiresAt(data.expires_at);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePurchase(plan: PlanInfo) {
    if (currentPlan === plan.id && expiresAt && new Date(expiresAt) > new Date()) {
      toast.error('You already have an active ' + plan.name + ' plan');
      return;
    }

    setPurchasing(plan.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setPurchasing(null);
        return;
      }

      const orderData = await userSubscriptionApi.createOrder(plan.id);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'Patna Finder',
        description: plan.name + ' Plan - ' + plan.price + '/month',
        order_id: orderData.order_id,
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
          contact: orderData.user?.phone || '',
        },
        theme: {
          color: '#f97316',
        },
        handler: async function (response: any) {
          try {
            const verifyData = await userSubscriptionApi.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success(verifyData.message);
            setCurrentPlan(verifyData.plan);
            setExpiresAt(verifyData.expires_at);
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPurchasing(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPurchasing(null);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPurchasing(null);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create order');
      setPurchasing(null);
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) return;
    try {
      const data = await userSubscriptionApi.cancel();
      toast.success(data.message);
      setCurrentPlan('free');
      setExpiresAt(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const isCurrentPlan = (planId: string) => currentPlan === planId;
  const isPlanActive = (planId: string) => currentPlan === planId && expiresAt && new Date(expiresAt) > new Date();

  return (
    <DashboardLayout
      pageTitle="Billing & Packages"
      pageSubtitle="Manage your subscription and billing"
      showSaveButton={false}
    >
      <div className="p-4 sm:p-6 lg:p-8">

        {/* Current Plan Banner */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 sm:p-6 lg:p-8 text-white mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Current Plan</p>
              <h2 className="text-2xl sm:text-3xl font-bold capitalize">{currentPlan} Plan</h2>
              {expiresAt && (
                <p className="text-blue-100 text-sm mt-1 sm:mt-2">
                  {new Date(expiresAt) > new Date()
                    ? `Active until ${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : 'Expired'}
                </p>
              )}
              {currentPlan === 'free' && (
                <p className="text-blue-100 text-sm mt-1 sm:mt-2">1 business listing allowed</p>
              )}
            </div>
            <div className="text-center sm:text-right">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                ₹{currentPlan === 'basic' ? '499' : currentPlan === 'premium' ? '999' : '0'}
              </p>
              <p className="text-blue-100 text-sm">per month</p>
            </div>
          </div>
          {currentPlan !== 'free' && expiresAt && new Date(expiresAt) > new Date() && (
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <button
                onClick={handleCancel}
                className="text-sm text-blue-100 hover:text-white underline transition"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

          {/* Free Plan */}
          <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 border-2 border-gray-200">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Free</h4>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Get started for free</p>
            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹0</span>
              <span className="text-gray-600 text-sm">/month</span>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1 business listing
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic analytics
              </li>
            </ul>
            {isCurrentPlan('free') ? (
              <button className="w-full py-2.5 sm:py-3 bg-blue-50 text-blue-600 font-semibold rounded-lg text-sm cursor-default">
                Current Plan
              </button>
            ) : (
              <button className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm" disabled>
                Downgrade
              </button>
            )}
          </div>

          {/* Basic Plan */}
          <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 border-2 border-gray-200 hover:border-orange-500 transition">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Basic</h4>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Perfect for small businesses</p>
            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹499</span>
              <span className="text-gray-600 text-sm">/month</span>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Up to 3 business listings
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic analytics
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email support
              </li>
            </ul>
            {isPlanActive('basic') ? (
              <button className="w-full py-2.5 sm:py-3 bg-blue-50 text-blue-600 font-semibold rounded-lg text-sm cursor-default">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(PLANS[0])}
                disabled={purchasing === 'basic'}
                className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm disabled:opacity-50"
              >
                {purchasing === 'basic' ? 'Processing...' : 'Choose Basic'}
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 sm:p-6 lg:p-8 text-white relative md:scale-105 shadow-xl md:z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-900 px-3 sm:px-4 py-1 rounded-full text-xs font-bold">POPULAR</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Premium</h4>
            <p className="text-orange-100 text-xs sm:text-sm mb-4 sm:mb-6">Best for growing businesses</p>
            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold">₹999</span>
              <span className="text-orange-100 text-sm">/month</span>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited business listings
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Featured on homepage
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
            {isPlanActive('premium') ? (
              <button className="w-full py-2.5 sm:py-3 bg-white/20 text-white font-semibold rounded-lg text-sm cursor-default backdrop-blur">
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(PLANS[1])}
                disabled={purchasing === 'premium'}
                className="w-full py-2.5 sm:py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition text-sm disabled:opacity-50"
              >
                {purchasing === 'premium' ? 'Processing...' : 'Choose Premium'}
              </button>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Payment Information</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Payments are processed securely via Razorpay. We do not store your card details.
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Supports UPI, Credit/Debit Cards, Net Banking, and Wallets.
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Subscription auto-renews monthly. Cancel anytime before renewal.
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
