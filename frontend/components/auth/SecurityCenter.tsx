'use client';

import { useEffect, useState } from 'react';

interface SecurityEvent {
  id: number;
  event: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SecurityData {
  mfa_enabled: boolean;
  totp_enabled: boolean;
  active_tokens: number;
  last_login: { at: string | null; ip: string | null; user_agent: string | null };
  events: SecurityEvent[];
}

type Api = {
  securityOverview: () => Promise<any>;
  toggleMfa: (enabled: boolean) => Promise<any>;
  logoutAll: () => Promise<any>;
  totpSetup?: () => Promise<any>;
  totpConfirm?: (code: string) => Promise<any>;
  totpDisable?: () => Promise<any>;
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  login_success: { label: 'Sign-in successful', color: 'bg-green-100 text-green-700' },
  login_failed: { label: 'Failed sign-in attempt', color: 'bg-red-100 text-red-700' },
  locked_out: { label: 'Account locked (brute-force)', color: 'bg-red-100 text-red-700' },
  mfa_challenge: { label: '2FA challenge issued', color: 'bg-blue-100 text-blue-700' },
  mfa_verified: { label: '2FA verified', color: 'bg-green-100 text-green-700' },
  mfa_failed: { label: '2FA code failed', color: 'bg-red-100 text-red-700' },
  logout: { label: 'Signed out', color: 'bg-gray-100 text-gray-600' },
  logout_all: { label: 'Signed out from all devices', color: 'bg-amber-100 text-amber-700' },
  password_changed: { label: 'Password changed', color: 'bg-purple-100 text-purple-700' },
  mfa_enabled: { label: '2FA enabled', color: 'bg-green-100 text-green-700' },
  mfa_disabled: { label: '2FA disabled', color: 'bg-amber-100 text-amber-700' },
  totp_setup: { label: 'Authenticator setup started', color: 'bg-blue-100 text-blue-700' },
  register: { label: 'Account created', color: 'bg-blue-100 text-blue-700' },
};

function extract(data: any): SecurityData {
  const d = data?.data ?? data;
  return {
    mfa_enabled: !!d.mfa_enabled,
    totp_enabled: !!d.totp_enabled,
    active_tokens: d.active_tokens ?? 1,
    last_login: d.last_login ?? {},
    events: d.events ?? [],
  };
}

export default function SecurityCenter({
  api,
  supportsTotp = false,
  onChanged,
}: {
  api: Api;
  supportsTotp?: boolean;
  onChanged?: () => void;
}) {
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpBusy, setTotpBusy] = useState(false);
  const [totpError, setTotpError] = useState('');

  const load = async () => {
    try {
      const data = await api.securityOverview();
      setSecurity(extract(data));
    } catch {
      setSecurity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleToggleMfa = async () => {
    if (!security) return;
    setToggling(true);
    try {
      await api.toggleMfa(!security.mfa_enabled);
      await load();
      onChanged?.();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update 2FA setting');
    } finally {
      setToggling(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Sign out from all other devices? You will stay signed in here.')) return;
    setSigningOutAll(true);
    try {
      await api.logoutAll();
      await load();
      onChanged?.();
    } catch {
      alert('Could not sign out other devices');
    } finally {
      setSigningOutAll(false);
    }
  };

  const startTotp = async () => {
    setShowTotpModal(true);
    setTotpError('');
    setTotpCode('');
    setTotpBusy(true);
    try {
      const data = await api.totpSetup?.();
      const d = data?.data ?? data;
      setTotpSecret(d.secret);
      setTotpUri(d.otpauth_url);
    } catch {
      setTotpError('Could not start setup. Try again.');
    } finally {
      setTotpBusy(false);
    }
  };

  const confirmTotp = async () => {
    setTotpBusy(true);
    setTotpError('');
    try {
      await api.totpConfirm?.(totpCode);
      setShowTotpModal(false);
      await load();
      onChanged?.();
    } catch (err: any) {
      setTotpError(
        err.response?.data?.errors?.code?.[0] ||
        err.response?.data?.error ||
        'Invalid code. Try again.'
      );
      setTotpCode('');
    } finally {
      setTotpBusy(false);
    }
  };

  const disableTotp = async () => {
    if (!confirm('Remove the authenticator app? Email OTP verification will remain active.')) return;
    try {
      await api.totpDisable?.();
      await load();
      onChanged?.();
    } catch {
      alert('Could not remove authenticator app');
    }
  };

  if (loading) {
    return <div className="bg-gray-50 rounded-xl p-6 animate-pulse text-sm text-gray-400">Loading security settings...</div>;
  }

  return (
    <div className="space-y-4">

      {/* ── MFA Status ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${security?.mfa_enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <svg className={`w-5 h-5 ${security?.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {security?.totp_enabled
                  ? 'Authenticator app active'
                  : security?.mfa_enabled
                    ? 'Email OTP active — a 6-digit code is emailed on every sign-in'
                    : 'Add an extra layer of protection to your account'}
              </p>
              {supportsTotp && (
                <p className="text-xs text-gray-400 mt-1">
                  Methods:{' '}
                  <span className={`font-semibold ${security?.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`}>Email OTP {security?.mfa_enabled ? 'ON' : 'OFF'}</span>
                  {' • '}
                  <span className={`font-semibold ${security?.totp_enabled ? 'text-green-600' : 'text-gray-400'}`}>Authenticator App {security?.totp_enabled ? 'ON' : 'OFF'}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {supportsTotp && !security?.totp_enabled && (
              <button onClick={startTotp} className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                Set up app
              </button>
            )}
            {supportsTotp && security?.totp_enabled && (
              <button onClick={disableTotp} className="text-xs font-semibold text-red-500 hover:text-red-600 whitespace-nowrap">
                Remove app
              </button>
            )}
            <button
              onClick={handleToggleMfa}
              disabled={toggling}
              aria-label="Toggle 2FA"
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                security?.mfa_enabled ? 'bg-green-500' : 'bg-gray-300'
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  security?.mfa_enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Sessions ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Active Sessions</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {security?.active_tokens ?? 1} active session(s) across your devices
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            disabled={signingOutAll}
            className="text-xs font-semibold text-red-500 hover:text-red-600 whitespace-nowrap disabled:opacity-50"
          >
            {signingOutAll ? 'Signing out...' : 'Sign out all devices'}
          </button>
        </div>
      </div>


      {/* ── Activity Log (CloudTrail-style audit) ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Recent Security Activity</h3>
        {security?.events?.length ? (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {security.events.map((ev) => {
              const meta = EVENT_LABELS[ev.event] ?? { label: ev.event, color: 'bg-gray-100 text-gray-600' };
              return (
                <div key={ev.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate hidden sm:block">
                      {ev.ip_address}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {new Date(ev.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No activity recorded yet.</p>
        )}
      </div>

      {/* ── TOTP Setup Modal ── */}
      {showTotpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Set Up Authenticator</h3>
            <p className="text-xs text-gray-500 mb-4">
              Open Google Authenticator / Authy / Microsoft Authenticator and add this key:
            </p>

            {totpBusy && !totpSecret ? (
              <p className="text-center text-sm text-gray-400 py-6">Generating secure key...</p>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mb-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Secret Key</p>
                  <p className="font-mono font-bold text-gray-900 text-sm break-all select-all">{totpSecret}</p>
                </div>

                {totpUri && (
                  <div className="text-center mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(totpUri)}`}
                      alt="Authenticator QR code"
                      className="mx-auto rounded-lg border border-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Scan QR or enter the key manually</p>
                  </div>
                )}

                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter the 6-digit code from your app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-xl font-mono font-bold tracking-[0.5em] border-2 border-gray-300 rounded-xl py-2.5 focus:border-blue-500 focus:outline-none mb-1"
                />
                {totpError && <p className="text-xs text-red-600 mb-1">{totpError}</p>}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowTotpModal(false)}
                    className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmTotp}
                    disabled={totpCode.length !== 6 || totpBusy}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {totpBusy ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

