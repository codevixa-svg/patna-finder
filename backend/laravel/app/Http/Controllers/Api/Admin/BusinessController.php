<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BusinessOwnerWelcome;
use App\Mail\BusinessVerificationMail;
use App\Models\Business;
use App\Models\BusinessVerificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with(['category', 'area', 'user']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('area_id') && $request->area_id) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        // Owner ne "Get Verified" request bheji hai
        if ($request->boolean('requested')) {
            $query->whereNotNull('verification_requested_at')->orderBy('verification_requested_at');
        }

        // Re-verification due (1 saal purane verified businesses)
        if ($request->boolean('reverify_due')) {
            $query->where('is_verified', true)
                ->whereNotNull('reverify_due_at')
                ->whereDate('reverify_due_at', '<=', now());
        }

        $businesses = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($businesses);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'owner_email' => 'required|email',
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'area_id' => 'required|exists:areas,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'tagline' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),

            'phone' => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'whatsapp' => 'nullable|string|max:20',

            'address' => 'nullable|string',
            'address_line2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string|max:10',
            'country' => 'nullable|string',
            'landmark' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'opening_hours' => 'nullable',
            'services' => 'nullable',
            'gallery' => 'nullable',
            'videos' => 'nullable',
            'social_links' => 'nullable',
            'amenities' => 'nullable',

            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'featured_image' => 'nullable|string',

            'status' => 'sometimes|in:pending,approved,rejected,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Auto-create user from owner_email and create business in a transaction
        $ownerEmail = $request->owner_email;
        $user = null;
        $business = null;
        $newUserCreated = false;

        \DB::transaction(function () use ($request, $data, $ownerEmail, &$user, &$business, &$newUserCreated) {
            $user = \App\Models\User::where('email', $ownerEmail)->first();

            if (!$user) {
                // Create new user account atomically with forceFill for guarded fields
                $user = new \App\Models\User();
                $user->forceFill([
                    'name' => $request->name, // Use business name temporarily
                    'email' => $ownerEmail,
                    'password' => \Hash::make(\Str::random(32)), // Random secure password
                    'role' => 'user',
                    'is_active' => true,
                    'email_verified_at' => now(), // Pre-verified by admin
                ])->save();
                
                $newUserCreated = true;
            }
            
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(6);
            $data['user_id'] = $user->id; // Use the real owner's ID

            if (!isset($data['status'])) {
                $data['status'] = 'approved';
            }

            $business = Business::create($data);
        });

        // Send welcome email to new users
        if ($newUserCreated === true) {
            try {
                Mail::to($user->email)->send(new BusinessOwnerWelcome($business->fresh(['category', 'area']), $user));
                Log::info("Welcome email sent to {$user->email} for business {$business->name}");
            } catch (\Throwable $e) {
                Log::error("Failed to send welcome email to {$user->email}: {$e->getMessage()}");
            }
        }

        return response()->json([
            'message' => 'Business created successfully!' . ($newUserCreated ? ' Welcome email sent to owner.' : ''),
            'business' => $business->load(['category', 'area']),
        ], 201);
    }

    public function show($id)
    {
        $business = Business::with(['category', 'area', 'user', 'reviews', 'faqs', 'awards'])->findOrFail($id);
        return response()->json($business);
    }

    public function update(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'area_id' => 'sometimes|exists:areas,id',
            'description' => 'sometimes|nullable|string',
            'short_description' => 'sometimes|nullable|string|max:500',
            'tagline' => 'sometimes|nullable|string|max:255',
            'established_year' => 'sometimes|nullable|integer|min:1800|max:' . date('Y'),

            'phone' => 'sometimes|nullable|string|max:20',
            'alternate_phone' => 'sometimes|nullable|string|max:20',
            'email' => 'sometimes|nullable|email|max:255',
            'website' => 'sometimes|nullable|url|max:500',
            'whatsapp' => 'sometimes|nullable|string|max:20',
            'inquiry_email' => 'sometimes|nullable|email',
            'inquiry_preference' => 'sometimes|in:email,phone,whatsapp',

            'address' => 'sometimes|nullable|string',
            'address_line2' => 'sometimes|nullable|string',
            'city' => 'sometimes|nullable|string|max:100',
            'state' => 'sometimes|nullable|string|max:100',
            'pincode' => 'sometimes|nullable|string|max:10',
            'country' => 'sometimes|nullable|string',
            'landmark' => 'sometimes|nullable|string',
            'latitude' => 'sometimes|nullable|numeric',
            'longitude' => 'sometimes|nullable|numeric',
            'google_map_location' => 'sometimes|nullable|string',

            'opening_hours' => 'sometimes|nullable',
            'services' => 'sometimes|nullable',
            'gallery' => 'sometimes|nullable',
            'videos' => 'sometimes|nullable',
            'social_links' => 'sometimes|nullable',
            'amenities' => 'sometimes|nullable',

            'logo' => 'sometimes|nullable|string',
            'cover_image' => 'sometimes|nullable|string',
            'featured_image' => 'sometimes|nullable|string',

            'status' => 'sometimes|in:pending,approved,rejected,suspended',
            'is_verified' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'is_sponsored' => 'sometimes|boolean',
            'is_trending' => 'sometimes|boolean',
            'is_popular' => 'sometimes|boolean',
            'is_hidden_gem' => 'sometimes|boolean',
            
            'meta_title' => 'sometimes|nullable|string|max:255',
            'meta_description' => 'sometimes|nullable|string|max:500',
        ]);

        $business->update($validated);

        return response()->json([
            'message' => 'Business updated successfully',
            'business' => $business->fresh()->load(['category', 'area']),
        ]);
    }

    public function approve($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Business approved successfully',
            'business' => $business,
        ]);
    }

    public function reject(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $business->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Business rejected',
            'business' => $business,
        ]);
    }

    public function feature($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_featured' => !$business->is_featured]);

        return response()->json([
            'message' => $business->is_featured ? 'Business featured' : 'Business unfeatured',
            'business' => $business,
        ]);
    }

    /**
     * Verify a business — only after admin has personally checked it
     * (e.g. visited the business address or matched it with Google details).
     * Requires a verification method and a note describing what was checked.
     */
    public function verify(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $request->validate([
            'method' => 'required|in:onsite_visit,google_details,phone_call,documents',
            'note' => 'required|string|min:5|max:1000',
        ]);

        $business->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
            'verification_method' => $request->method,
            'verification_note' => $request->note,
            'verification_level' => Business::levelForMethod($request->method),
            'reverify_due_at' => now()->addYear()->toDateString(),
            'reverify_notified_at' => null,
            'verification_requested_at' => null, // queue se clear
        ]);

        BusinessVerificationLog::create([
            'business_id' => $business->id,
            'admin_id' => $request->user()->id,
            'action' => 'verified',
            'method' => $request->method,
            'note' => $request->note,
        ]);

        $methodLabel = BusinessVerificationLog::methodLabels()[$request->method];

        $this->notifyOwner($business, 'verified', $methodLabel, $request->note);

        return response()->json([
            'message' => "Business verified ({$methodLabel})",
            'business' => $business->fresh(['verifiedByUser']),
        ]);
    }

    /**
     * Remove verification from a business. A reason is mandatory so the
     * owner knows why the badge was taken away.
     */
    public function unverify(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $request->validate([
            'note' => 'required|string|min:5|max:1000',
        ]);

        $business->update([
            'is_verified' => false,
            'verified_at' => null,
            'verified_by' => null,
            'verification_method' => null,
            'verification_note' => null,
            'verification_level' => null,
            'reverify_due_at' => null,
            'reverify_notified_at' => null,
        ]);

        BusinessVerificationLog::create([
            'business_id' => $business->id,
            'admin_id' => $request->user()->id,
            'action' => 'unverified',
            'method' => null,
            'note' => $request->note,
        ]);

        $this->notifyOwner($business, 'unverified', '', $request->note);

        return response()->json([
            'message' => 'Business verification removed',
            'business' => $business->fresh(),
        ]);
    }

    /**
     * Full audit trail of verify / unverify actions for this business.
     */
    public function verificationLogs($id)
    {
        $business = Business::findOrFail($id);

        $logs = $business->verificationLogs()->with('admin:id,name,email')->get();

        return response()->json([
            'logs' => $logs->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'method' => $log->method,
                'method_label' => $log->method_label,
                'note' => $log->note,
                'admin_name' => $log->admin?->name ?? 'System',
                'created_at' => $log->created_at?->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Send the owner an email about the verification change.
     * Failures are swallowed so the API response never breaks because of mail.
     */
    private function notifyOwner(Business $business, string $action, string $methodLabel = '', ?string $note = null): void
    {
        $email = $business->email ?: $business->user?->email;

        if (!$email) {
            return;
        }

        try {
            Mail::to($email)->send(new BusinessVerificationMail($business->fresh(), $action, $methodLabel, $note));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public function toggleTrending($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_trending' => !$business->is_trending]);

        return response()->json([
            'message' => $business->is_trending ? 'Business set as trending' : 'Business removed from trending',
            'business' => $business,
        ]);
    }

    public function toggleSponsored($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_sponsored' => !$business->is_sponsored]);

        return response()->json([
            'message' => $business->is_sponsored ? 'Business set as sponsored' : 'Sponsorship removed',
            'business' => $business,
        ]);
    }

    public function destroy($id)
    {
        $business = Business::findOrFail($id);
        $business->delete();

        return response()->json([
            'message' => 'Business deleted successfully',
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:approve,reject,feature,unfeature,delete',
        ]);

        $businesses = Business::whereIn('id', $request->ids);
        $count = $businesses->count();

        switch ($request->action) {
            case 'approve':
                $businesses->update(['status' => 'approved']);
                break;
            case 'reject':
                $businesses->update(['status' => 'rejected']);
                break;
            case 'feature':
                $businesses->update(['is_featured' => true]);
                break;
            case 'unfeature':
                $businesses->update(['is_featured' => false]);
                break;
            case 'delete':
                $businesses->delete();
                break;
        }

        return response()->json([
            'message' => ucfirst($request->action) . " applied to {$count} businesses",
            'affected' => $count,
        ]);
    }
}
