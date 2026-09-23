<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\VerificationDocumentStatusMail;
use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class VerificationDocumentController extends Controller
{
    /**
     * All documents of a business (admin view).
     */
    public function index($businessId)
    {
        $business = Business::findOrFail($businessId);

        return response()->json([
            'documents' => $business->verificationDocuments()
                ->with('uploader:id,name')
                ->get()
                ->map(fn ($doc) => $this->serialize($doc)),
            'required_docs' => $business->category?->required_docs ?? [],
        ]);
    }

    /**
     * Upload a verification document (stored privately — never public URL).
     */
    public function store(Request $request, $businessId)
    {
        $business = Business::findOrFail($businessId);

        $request->validate([
            'doc_type' => 'required|in:' . implode(',', array_keys(BusinessVerificationDocument::DOC_TYPES)),
            'doc_name' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:5120', // 5MB
            'expires_at' => 'nullable|date|after:today',
        ]);

        $file = $request->file('file');
        $path = $file->storeAs(
            "verification-docs/{$business->id}",
            uniqid() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName()),
            'local'
        );

        $doc = BusinessVerificationDocument::create([
            'business_id' => $business->id,
            'doc_type' => $request->doc_type,
            'doc_name' => $request->doc_name,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
            'expires_at' => $request->expires_at,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $this->serialize($doc),
        ], 201);
    }

    /**
     * Approve or reject a document with a note.
     */
    public function review(Request $request, $businessId, $docId)
    {
        $doc = BusinessVerificationDocument::where('business_id', $businessId)->findOrFail($docId);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:1000',
            'expires_at' => 'nullable|date',
        ]);

        $doc->update([
            'status' => $request->status,
            'review_note' => $request->review_note,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'expires_at' => $request->expires_at ?? $doc->expires_at,
            'expired_notified_at' => null,
        ]);

        // Notify owner about the review outcome
        $this->notifyOwner($doc->business, $doc);

        return response()->json([
            'message' => "Document {$request->status}",
            'document' => $this->serialize($doc->fresh()),
        ]);
    }

    /**
     * Secure private download — admin only, streamed with original name.
     */
    public function download($businessId, $docId)
    {
        $doc = BusinessVerificationDocument::where('business_id', $businessId)->findOrFail($docId);

        if (! Storage::disk('local')->exists($doc->file_path)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        return Storage::disk('local')->download($doc->file_path, $doc->original_name);
    }

    public function destroy($businessId, $docId)
    {
        $doc = BusinessVerificationDocument::where('business_id', $businessId)->findOrFail($docId);

        Storage::disk('local')->delete($doc->file_path);
        $doc->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }

    /**
     * Approved documents expiring within 30 days (or expired) — admin queue.
     */
    public function expiring()
    {
        $docs = BusinessVerificationDocument::with('business:id,name,slug')
            ->where('status', 'approved')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(30))
            ->orderBy('expires_at')
            ->get();

        return response()->json([
            'documents' => $docs->map(fn ($doc) => [
                'id' => $doc->id,
                'business_id' => $doc->business_id,
                'business_name' => $doc->business?->name,
                'doc_type_label' => $doc->doc_type_label,
                'expires_at' => $doc->expires_at?->toDateString(),
                'days_left' => $doc->days_until_expiry,
                'is_expired' => $doc->days_until_expiry < 0,
            ]),
        ]);
    }

    private function serialize(BusinessVerificationDocument $doc): array
    {
        return [
            'id' => $doc->id,
            'business_id' => $doc->business_id,
            'doc_type' => $doc->doc_type,
            'doc_type_label' => $doc->doc_type_label,
            'doc_name' => $doc->doc_name,
            'original_name' => $doc->original_name,
            'mime_type' => $doc->mime_type,
            'file_size' => $doc->file_size,
            'status' => $doc->status,
            'reject_reason' => $doc->reject_reason ?? $doc->review_note,
            'review_note' => $doc->review_note,
            'expires_at' => $doc->expires_at?->toDateString(),
            'days_until_expiry' => $doc->days_until_expiry,
            'uploaded_by_name' => $doc->uploader?->name,
            'reviewed_at' => $doc->reviewed_at?->toIso8601String(),
            'created_at' => $doc->created_at?->toIso8601String(),
        ];
    }

    private function notifyOwner(Business $business, BusinessVerificationDocument $doc): void
    {
        $email = $business->email ?: $business->user?->email;

        if (!$email) {
            return;
        }

        try {
            Mail::to($email)->send(new VerificationDocumentStatusMail($business->fresh(), $doc->fresh()));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
