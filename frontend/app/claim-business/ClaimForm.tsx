'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitInquiry } from '@/lib/inquiry';

const ROLES = ['Owner', 'Co-owner / Partner', 'Manager', 'Authorized employee', 'Other'];

const EMPTY_FORM = {
  businessName: '',
  listingUrl: '',
  yourName: '',
  email: '',
  phone: '',
  role: ROLES[0],
  proof: '',
  message: '',
};

export default function ClaimForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.businessName.trim()) next.businessName = 'Please enter the business name';
    if (!form.yourName.trim()) next.yourName = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address';
    if (!/^[+\d][\d\s-]{6,14}$/.test(form.phone.trim()))
      next.phone = 'Please enter a valid phone number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { via } = await submitInquiry('Claim Business', {
        Business: form.businessName,
        'Listing URL': form.listingUrl || 'Not provided',
        'Your Name': form.yourName,
        Email: form.email,
        Phone: form.phone,
        Role: form.role,
        'Ownership Proof': form.proof || 'Will be shared on request',
        Notes: form.message || '—',
      });
      setSubmitted(true);
      toast.success(
        via === 'mailto'
          ? 'Opening your email app with the claim pre-filled…'
          : 'Claim request submitted successfully!',
      );
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Claim Request Received!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Our team will verify your ownership and reach out within 1–2 business days.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm(EMPTY_FORM);
          }}
          className="text-amber-600 font-semibold hover:text-amber-700 transition"
        >
          Submit another claim
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <ClaimFormFields form={form} errors={errors} set={set} submitting={submitting} />
    </form>
  );
}

function ClaimFormFields({
  form,
  errors,
  set,
  submitting,
}: {
  form: typeof EMPTY_FORM;
  errors: Record<string, string>;
  set: (key: string, value: string) => void;
  submitting: boolean;
}) {
  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 transition ${
      errors[key] ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="claim-business" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            id="claim-business"
            type="text"
            value={form.businessName}
            onChange={(e) => set('businessName', e.target.value)}
            placeholder="e.g. Sharma Sweets, Boring Road"
            className={inputClass('businessName')}
          />
          {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
        </div>
        <div>
          <label htmlFor="claim-url" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Listing URL <span className="text-gray-400 font-normal">(if known)</span>
          </label>
          <input
            id="claim-url"
            type="text"
            value={form.listingUrl}
            onChange={(e) => set('listingUrl', e.target.value)}
            placeholder="patnafinder.com/business/…"
            className={inputClass('listingUrl')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="claim-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="claim-name"
            type="text"
            value={form.yourName}
            onChange={(e) => set('yourName', e.target.value)}
            placeholder="Full name"
            className={inputClass('yourName')}
          />
          {errors.yourName && <p className="text-xs text-red-500 mt-1">{errors.yourName}</p>}
        </div>
        <div>
          <label htmlFor="claim-role" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Role
          </label>
          <select id="claim-role" value={form.role} onChange={(e) => set('role', e.target.value)} className={inputClass('role')}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="claim-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="claim-email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@business.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="claim-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Business Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="claim-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+91 98XXX XXXXX"
            className={inputClass('phone')}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="claim-proof" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Ownership Proof <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="claim-proof"
          type="text"
          value={form.proof}
          onChange={(e) => set('proof', e.target.value)}
          placeholder="GST number, shop licence, Google Business link…"
          className={inputClass('proof')}
        />
      </div>

      <div>
        <label htmlFor="claim-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Anything Else? <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="claim-message"
          rows={4}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="Anything that helps us verify your claim faster…"
          className={`${inputClass('message')} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-amber-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit Claim Request'}
      </button>
    </>
  );
}
