<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VerificationDocumentController extends Controller
{
    /**
     * Owner's documents for one of their own businesses.
     */
    public function index(Request $request, $businessId)
    {
        $business = $this->findOwnedBusiness($request, $businessId);

        return response()->json([
            'is_verified' => (bool) $business->is_verified,
            'verification_requested_at' => $business->verification_requested_at?->toIso8601String(),
            'verification_level' => $business->verification_level,
            'required_docs' => $business->category?->required_docs ?? [],
            'documents' => $business->verificationDocuments()
                ->with('reviewer:id,name')
                ->get()
                ->map(fn ($doc) => $this->serialize($doc)),
        ]);
    }

    /**
     * Owner uploads a verification document themselves.
     */
    public function store(Request $request, $businessId)
    {
        $business = $this->findOwnedBusiness($request, $businessId);

        $request->validate([
            'doc_type' => 'required|in:' . implode(',', array_keys(BusinessVerificationDocument::DOC_TYPES)),
            'doc_name' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:5120',
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
            'message' => 'Document uploaded. Patna Finder team review karega.',
            'document' => $this->serialize($doc),
        ], 201);
    }

    /**
     * Owner removes their own document (only while pending).
     */
    public function destroy(Request $request, $businessId, $docId)
    {
        $business = $this->findOwnedBusiness($request, $businessId);
        $doc = BusinessVerificationDocument::where('business_id', $business->id)->findOrFail($docId);

        if ($doc->status !== 'pending') {
            return response()->json(['message' => 'Reviewed documents delete nahi kar sakte'], 422);
        }

        Storage::disk('local')->delete($doc->file_path);
        $doc->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    /**
     * Owner clicks "Get Verified" — appears in admin queue.
     */
    public function requestVerification(Request $request, $businessId)
    {
        $business = $this->findOwnedBusiness($request, $businessId);

        if ($business->is_verified) {
            return response()->json(['message' => 'Business already verified'], 422);
        }

        $business->update(['verification_requested_at' => now()]);

        return response()->json([
            'message' => 'Verification request submitted! Team aapke business ka review karegi.',
            'verification_requested_at' => $business->verification_requested_at->toIso8601String(),
        ]);
    }

    public function cancelRequest(Request $request, $businessId)
    {
        $business = $this->findOwnedBusiness($request, $businessId);

        $business->update(['verification_requested_at' => null]);

        return response()->json(['message' => 'Verification request cancelled']);
    }

    private function findOwnedBusiness(Request $request, $businessId): Business
    {
        return Business::where('user_id', $request->user()->id)->findOrFail($businessId);
    }

    private function serialize(BusinessVerificationDocument $doc): array
    {
        return [
            'id' => $doc->id,
            'doc_type' => $doc->doc_type,
            'doc_type_label' => $doc->doc_type_label,
            'doc_name' => $doc->doc_name,
            'original_name' => $doc->original_name,
            'mime_type' => $doc->mime_type,
            'file_size' => $doc->file_size,
            'status' => $doc->status,
            'review_note' => $doc->review_note,
            'expires_at' => $doc->expires_at?->toDateString(),
            'days_until_expiry' => $doc->days_until_expiry,
            'reviewed_by_name' => $doc->reviewer?->name,
            'reviewed_at' => $doc->reviewed_at?->toIso8601String(),
            'created_at' => $doc->created_at?->toIso8601String(),
        ];
    }
}
