'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userAuthApi } from '@/lib/userApi';
import MfaCodeInput from '@/components/auth/MfaCodeInput';

function DashboardLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useUserAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Step: 'credentials' or 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState('');
  const [lockUntil, setLockUntil] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => {
      if (Math.floor(Date.now() / 1000) >= lockUntil) {
        setLockUntil(0);
        setErrors({});
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  const lockRemaining = lockUntil > 0 ? Math.max(0, lockUntil - Math.floor(Date.now() / 1000)) : 0;
  const lockMinutes = Math.floor(lockRemaining / 60);
  const lockSeconds = lockRemaining % 60;

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Login with email + password, then auto-request OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Step 1: Verify credentials
      const response = await userAuthApi.login(formData.email, formData.password);
      
      if (response.mfa_required) {
        // User has 2FA enabled - show their existing MFA
        setChallengeToken(response.challenge_token);
        setEmailMasked(response.email_masked || formData.email);
        setResendIn(response.resend_in || 60);
        setDevCode(response.dev_code || '');
        setStep('otp');
        return;
      }

      // If no MFA, automatically send OTP after successful credential check
      if (response.success) {
        // Request OTP
        const otpResponse = await userAuthApi.loginWithOtp(formData.email);
        setChallengeToken(otpResponse.challenge_token);
        setEmailMasked(otpResponse.email_masked || formData.email);
        setResendIn(otpResponse.resend_in || 60);
        setDevCode(otpResponse.dev_code || '');
        setStep('otp');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 423 && error.response?.data?.retry_after_seconds) {
        setLockUntil(Math.floor(Date.now() / 1000) + error.response.data.retry_after_seconds);
        setErrors({ general: error.response?.data?.message || 'Account temporarily locked.' });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Login failed. Please check your credentials.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setMfaError('');
    setMfaLoading(true);

    try {
      const response = await userAuthApi.verifyOtp(challengeToken, code);
      if (response.success) {
        login(response.data.user, response.data.token);
        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error('OTP error:', err);
      setMfaError(
        err.response?.data?.message ||
        'Invalid OTP code'
      );
      if (err.response?.status === 410) {
        setTimeout(() => backToCredentials(), 1800);
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const handleResend = async () => {
    setMfaError('');
    try {
      const response = await userAuthApi.resendOtp(challengeToken);
      setResendIn(60);
      if (response.dev_code) setDevCode(response.dev_code);
    } catch (err: any) {
      const retryIn = err.response?.data?.resend_in;
      if (retryIn) setResendIn(retryIn);
      setMfaError(err.response?.data?.message || 'Could not resend code. Please wait and try again.');
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setChallengeToken('');
    setMfaError('');
    setFormData((f) => ({ ...f, password: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F4B400] to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Patna <span className="text-orange-500">Finder</span></h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">
            {redirectTo === '/dashboard/add-business'
              ? 'Login to add your business listing'
              : 'Login to manage your business listings'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 'otp' ? (
            /* ───────── Step 2: OTP Verification ───────── */
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 rounded-2xl mb-4">
                  <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600 text-sm mb-1">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-gray-900 font-semibold text-base">{emailMasked}</p>
                <p className="text-gray-500 text-xs mt-2">Please check your inbox and enter the code below</p>
              </div>

              {devCode && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-xs text-blue-700">
                    Local dev mode — email is logged, not sent. Your code:
                  </p>
                  <p className="text-xl font-bold tracking-[0.4em] text-blue-800 mt-1">{devCode}</p>
                </div>
              )}

              <MfaCodeInput
                onComplete={handleOtpComplete}
                disabled={mfaLoading}
                error={mfaError}
              />

              {mfaLoading && (
                <p className="text-center text-sm text-orange-600 mt-4 font-medium">Verifying code...</p>
              )}

              <div className="flex items-center justify-between mt-6 text-sm">
                <button
                  type="button"
                  onClick={backToCredentials}
                  className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendIn > 0 || mfaLoading}
                  className="text-orange-500 hover:text-orange-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </div>
          ) : (
            /* ───────── Step 1: Email & Password ───────── */
            <>
              {errors.general && (
                <div className={`mb-4 p-3 border rounded-lg ${
                  lockRemaining > 0
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  {lockRemaining > 0 ? (
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Account temporarily locked.</span>{' '}
                      Too many failed attempts. Try again in{' '}
                      <span className="font-mono font-bold">{lockMinutes}:{String(lockSeconds).padStart(2, '0')}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">{errors.general}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12 ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-orange-500 hover:text-orange-600 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockRemaining > 0}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500">After clicking login, OTP will be sent to your email</span>
                  </div>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/dashboard/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                Register Now
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
      <DashboardLoginPageContent />
    </Suspense>
  );
}
