'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminAuthApi } from '@/lib/adminApi';
import MfaCodeInput from '@/components/auth/MfaCodeInput';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── OTP Verification Step ──
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [devCode, setDevCode] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => {
      if (Math.floor(Date.now() / 1000) >= lockUntil) {
        setLockUntil(0);
        setError('');
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  const lockRemaining = lockUntil > 0 ? Math.max(0, lockUntil - Math.floor(Date.now() / 1000)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Send OTP to email after email+password verification
      const response = await adminAuthApi.loginWithOtp(email, password);
      
      // OTP sent successfully
      setChallengeToken(response.challenge_token);
      setEmailMasked(response.email_masked || email);
      setResendIn(response.resend_in || 60);
      setDevCode(response.dev_code || '');
      setStep('otp');
    } catch (err: any) {
      console.error('Login error:', err);
      const status = err.response?.status;
      if (status === 423 && err.response?.data?.retry_after_seconds) {
        setLockUntil(Math.floor(Date.now() / 1000) + err.response.data.retry_after_seconds);
        setError(err.response?.data?.error || 'Account temporarily locked.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setOtpError('');
    setOtpLoading(true);

    try {
      // Step 2: Verify OTP code
      const response = await adminAuthApi.verifyOtp(challengeToken, code);
      login(response.user, response.token);
      router.push('/admin');
    } catch (err: any) {
      console.error('OTP error:', err);
      setOtpError(
        err.response?.data?.errors?.code?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid verification code'
      );
      // OTP expired → back to credentials
      if (err.response?.status === 410 || err.response?.status === 404) {
        setTimeout(() => backToCredentials(), 1800);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpError('');
    try {
      const response = await adminAuthApi.resendOtp(challengeToken);
      setResendIn(response.resend_in || 60);
      setDevCode(response.dev_code || '');
      setOtpError('');
    } catch (err: any) {
      const retryIn = err.response?.data?.resend_in;
      if (retryIn) setResendIn(retryIn);
      setOtpError(err.response?.data?.error || 'Could not resend code. Please wait and try again.');
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setOtpError('');
    setPassword('');
  };

  const lockMinutes = Math.floor(lockRemaining / 60);
  const lockSeconds = lockRemaining % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] flex items-center justify-center p-4">
      {/* Floating Shapes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D89E00]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#F4B400] to-[#D89E00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D89E00]/30">
              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-base">Patna Finder Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {step === 'otp' ? (
            /* ───────── Step 2: OTP Verification ───────── */
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
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
                disabled={otpLoading}
                error={otpError}
              />

              {otpLoading && (
                <p className="text-center text-sm text-blue-600 mt-4 font-medium">Verifying code...</p>
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
                  disabled={resendIn > 0 || otpLoading}
                  className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </div>
          ) : (
          /* ───────── Step 1: Credentials ───────── */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            {/* Account Lockout Banner (AWS Cognito adaptive lockout) */}
            {lockRemaining > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 px-4 py-3 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold">Account temporarily locked</p>
                    <p className="mt-0.5">Too many failed attempts. Try again in <span className="font-mono font-bold">{lockMinutes}:{String(lockSeconds).padStart(2, '0')}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && lockRemaining === 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder="admin@patnafinder.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
          )}
        </div>

        {/* Back to Site */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Patna Finder
          </a>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secured with SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
