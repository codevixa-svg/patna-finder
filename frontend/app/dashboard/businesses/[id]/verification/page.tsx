'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userVerificationApi } from '@/lib/userApi';

const DOC_TYPES = [
  { value: 'gst', label: 'GST Certificate' },
  { value: 'fssai', label: 'FSSAI License (food business)' },
  { value: 'trade_license', label: 'Trade License' },
  { value: 'id_proof', label: 'Owner ID Proof (Aadhaar/PAN)' },
  { value: 'signboard_photo', label: 'Signboard Photo' },
  { value: 'address_proof', label: 'Address Proof (bill/agreement)' },
  { value: 'medical_registration', label: 'Medical Registration' },
  { value: 'other', label: 'Other' },
];

export default function BusinessVerificationPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useUserAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docExpiry, setDocExpiry] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { window.location.href = '/dashboard/login'; return; }
    fetchStatus();
  }, [isAuthenticated, id]);

  async function fetchStatus() {
    try {
      const res = await userVerificationApi.getStatus(Number(id));
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function upload() {
    if (!docType) { toast.error('Document type select karein'); return; }
    if (!docFile) { toast.error('File select karein'); return; }
    const fd = new FormData();
    fd.append('doc_type', docType);
    fd.append('file', docFile);
    if (docExpiry) fd.append('expires_at', docExpiry);
    try {
      setBusy(true);
      await userVerificationApi.uploadDocument(Number(id), fd);
      toast.success('Document uploaded! Team review karegi.');
      setDocType(''); setDocFile(null); setDocExpiry('');
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeDoc(docId: number) {
    if (!confirm('Delete this document?')) return;
    try {
      await userVerificationApi.deleteDocument(Number(id), docId);
      toast.success('Deleted');
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed');
    }
  }

  async function requestVerification() {
    try {
      setBusy(true);
      const res = await userVerificationApi.requestVerification(Number(id));
      toast.success(res.message || 'Request submitted!');
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D89E00]"></div>
      </div>
    );
  }

  const isVerified = data?.is_verified;
  const isRequested = !!data?.verification_requested_at;
  const required: string[] = data?.required_docs || [];
  const documents: any[] = data?.documents || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/dashboard/businesses" className="text-[#B58200] hover:text-[#8A6400] text-sm font-medium inline-flex items-center gap-1">
          ← Back to My Businesses
        </Link>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Get Verified by Patna Finder</h1>
          {isVerified ? (
            <div className="flex items-center gap-2 p-3 bg-[#FFF9E5] border border-green-200 rounded-lg">
              <span className="text-2xl">✓</span>
              <div>
                <p className="text-sm font-bold text-[#062B49]">Your business is Verified!</p>
                <p className="text-xs text-[#062B49]">Verified badge public profile par dikh raha hai.</p>
              </div>
            </div>
          ) : isRequested ? (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="text-sm font-bold text-yellow-800">Verification Request Pending</p>
                <p className="text-xs text-yellow-700">Team jaldi hi aapke documents review karke contact karegi.</p>
              </div>
              <button onClick={async () => { await userVerificationApi.cancelRequest(Number(id)); toast.success('Request cancelled'); fetchStatus(); }} className="text-xs text-gray-500 hover:text-red-600 underline">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Verified badge se customers ka trust badhta hai. Documents upload karein aur request bhejein —
                team aapke business ko review karke (address visit / Google details check) verify karegi.
              </p>
              <button
                onClick={requestVerification}
                disabled={busy}
                className="px-5 py-2.5 bg-[#D89E00] text-white rounded-xl text-sm font-bold hover:bg-[#B58200] disabled:opacity-50 transition"
              >
                ✓ Request Verification
              </button>
            </div>
          )}
        </div>

        {/* Required docs checklist */}
        {required.length > 0 && !isVerified && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Aapki category ke liye required documents:</h2>
            <div className="flex flex-wrap gap-2">
              {required.map((type) => {
                const approved = documents.find(d => d.doc_type === type && d.status === 'approved');
                const uploaded = documents.find(d => d.doc_type === type);
                return (
                  <span key={type} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${approved ? 'bg-[#FFF9E5] text-[#062B49] border-green-200' : uploaded ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {approved ? '✓ Approved' : uploaded ? '⏳ Under review' : '○ Pending'} — {type.replace(/_/g, ' ')}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload form */}
        {!isVerified && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Upload Documents</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Type *</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D89E00]">
                  <option value="">Select...</option>
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File (PDF/JPG/PNG, max 5MB) *</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valid Till (license expiry, optional)</label>
                <input type="date" value={docExpiry} onChange={(e) => setDocExpiry(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <button onClick={upload} disabled={busy} className="w-full py-2.5 bg-[#D89E00] text-white rounded-xl text-sm font-bold hover:bg-[#B58200] disabled:opacity-50 transition">
                {busy ? 'Uploading...' : 'Upload Document'}
              </button>
              <p className="text-[11px] text-gray-400">Documents securely store hote hain — sirf Patna Finder team dekh sakti hai.</p>
            </div>
          </div>
        )}

        {/* My documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">My Documents</h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {doc.doc_type_label}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${doc.status === 'approved' ? 'bg-[#FFF4CC] text-[#062B49]' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.original_name}
                      {doc.expires_at && <> • Valid till {doc.expires_at}</>}
                    </p>
                    {doc.review_note && <p className="text-xs text-gray-600 mt-1 italic">Team note: {doc.review_note}</p>}
                  </div>
                  {doc.status === 'pending' && (
                    <button onClick={() => removeDoc(doc.id)} className="text-xs text-gray-400 hover:text-red-600 underline">Delete</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
