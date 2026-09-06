'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitInquiry } from '@/lib/inquiry';

const SUBJECTS = [
  'General enquiry',
  'List / claim a business',
  'Advertising & partnerships',
  'Report an issue',
  'Feedback & suggestions',
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address';
    if (form.phone.trim() && !/^[+\d][\d\s-]{6,14}$/.test(form.phone.trim()))
      next.phone = 'Please enter a valid phone number';
    if (form.message.trim().length < 10)
      next.message = 'Message should be at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { via } = await submitInquiry('Contact', {
        Name: form.name,
        Email: form.email,
        Phone: form.phone || 'Not provided',
        Subject: form.subject,
        Message: form.message,
      });
      setSubmitted(true);
      toast.success(
        via === 'mailto'
          ? 'Opening your email app with the message pre-filled…'
          : 'Message sent successfully!',
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Your message is on its way. Our team will get back to you within 24–48 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
          }}
          className="text-amber-600 font-semibold hover:text-amber-700 transition"
        >
          Send another message
        </button>
      </div>
    );
  }

  return <ContactFormFields form={form} errors={errors} submitting={submitting} set={set} onSubmit={handleSubmit} />;
}

function ContactFormFields({
  form,
  errors,
  submitting,
  set,
  onSubmit,
}: {
  form: { name: string; email: string; phone: string; subject: string; message: string };
  errors: Record<string, string>;
  submitting: boolean;
  set: (key: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 transition ${
      errors[key] ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Rahul Kumar"
            className={inputClass('name')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>
      <PhoneSubjectFields form={form} errors={errors} set={set} inputClass={inputClass} />
      <MessageField form={form} errors={errors} set={set} inputClass={inputClass} />
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-amber-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}


function PhoneSubjectFields({
  form,
  errors,
  set,
  inputClass,
}: {
  form: { phone: string; subject: string };
  errors: Record<string, string>;
  set: (key: string, value: string) => void;
  inputClass: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Phone Number <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+91 98XXX XXXXX"
          className={inputClass('phone')}
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Subject
        </label>
        <select
          id="contact-subject"
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
          className={inputClass('subject')}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function MessageField({
  form,
  errors,
  set,
  inputClass,
}: {
  form: { message: string };
  errors: Record<string, string>;
  set: (key: string, value: string) => void;
  inputClass: (key: string) => string;
}) {
  return (
    <div>
      <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
        Message <span className="text-red-500">*</span>
      </label>
      <textarea
        id="contact-message"
        rows={5}
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
        placeholder="How can we help you?"
        className={`${inputClass('message')} resize-y`}
      />
      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
    </div>
  );
}
