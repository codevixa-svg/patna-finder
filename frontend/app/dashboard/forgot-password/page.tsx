'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userAuthApi } from '@/lib/userApi';
import MfaCodeInput from '@/components/auth/MfaCodeInput';
import toast from 'react-hot-toast';

function ForgotPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => {
      setResendIn((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await userAuthApi.forgotPassword(email);
      
      if (response.success) {
        setChallengeToken(response.challenge_token);
        setEmailMasked(response.email_masked || email);
        setResendIn(response.resend_in || 60);
        
        if (response.dev_code) {
          setDevCode(response.dev_code);
          toast.success(`Dev code: ${response.dev_code}`);
        }
        
        toast.success(response.message);
        setStep('verify');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send reset code';
      setErrors({ email: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyCode = async (otpCode: string) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await userAuthApi.verifyResetOtp(challengeToken, otpCode);
      
      if (response.success) {
        setCode(otpCode);
        toast.success('Code verified! Now set your new password.');
        setStep('reset');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid verification code';
      setErrors({ code: message });
      toast.error(message);
      throw error; // Re-throw to let MfaCodeInput handle it
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password clicked', { password, passwordConfirmation, code, challengeToken });
    
    setLoading(true);
    setErrors({});

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      toast.error('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    console.log('Calling reset password API...');
    
    try {
      const response = await userAuthApi.resetPassword(challengeToken, code, password, passwordConfirmation);
      console.log('Reset password response:', response);
      
      if (response.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/dashboard/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const message = error?.response?.data?.message || 'Failed to reset password';
      const apiErrors = error?.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendIn > 0) return;

    setLoading(true);
    try {
      const response = await userAuthApi.resendResetOtp(challengeToken);
      
      if (response.success) {
        setResendIn(60);
        
        if (response.dev_code) {
          setDevCode(response.dev_code);
          toast.success(`New code sent! Dev code: ${response.dev_code}`);
        } else {
          toast.success('New verification code sent to your email');
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to resend code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-orange-600">Patna Finder</h1>
          </Link>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Reset your password'}
            {step === 'verify' && 'Verify your email'}
            {step === 'reset' && 'Set new password'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                    placeholder="your-email@example.com"
                    required
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending code...
                    </span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/dashboard/login"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-gray-900">{emailMasked}</span>
                </p>
              </div>

              {devCode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    <strong>Dev Mode:</strong> {devCode}
                  </p>
                </div>
              )}

              <MfaCodeInput
                onComplete={handleVerifyCode}
                loading={loading}
                error={errors.code}
              />

              <div className="text-center space-y-3">
                <button
                  onClick={handleResend}
                  disabled={resendIn > 0 || loading}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                </button>

                <div>
                  <button
                    onClick={() => {
                      setStep('email');
                      setErrors({});
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    ← Use a different email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    Email verified! Now set your new password.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                        errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !passwordConfirmation}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/dashboard/login" className="text-orange-600 hover:text-orange-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
