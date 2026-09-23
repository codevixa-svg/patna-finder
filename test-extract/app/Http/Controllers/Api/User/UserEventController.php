<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserEventController extends Controller
{
    /**
     * Get user's events
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Event::where('user_id', $user->id);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by featured
        if ($request->has('featured') && $request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $events = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    /**
     * Get single event
     */
    public function show($id)
    {
        $user = Auth::user();
        $event = Event::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json(['data' => $event]);
    }

    /**
     * Create new event
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_category' => 'required|string',
            'event_mode' => 'required|in:offline,online,hybrid',
            'venue' => 'required|string',
            'address' => 'nullable|string',
            'area' => 'nullable|string',
            'city' => 'required|string',
            'event_date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'organizer' => 'required|string',
            'price_type' => 'required|in:free,paid',
            'price' => 'nullable|numeric|min:0',
            'registration_url' => 'nullable|url',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['is_active'] = false; // Pending admin approval
        $validated['published_at'] = null;

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Event created successfully. Pending admin approval.',
            'data' => $event,
        ], 201);
    }

    /**
     * Update event
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $event = Event::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'event_category' => 'sometimes|string',
            'event_mode' => 'sometimes|in:offline,online,hybrid',
            'venue' => 'sometimes|string',
            'address' => 'nullable|string',
            'area' => 'nullable|string',
            'city' => 'sometimes|string',
            'event_date' => 'sometimes|date',
            'start_time' => 'sometimes|string',
            'end_time' => 'sometimes|string',
            'organizer' => 'sometimes|string',
            'price_type' => 'sometimes|in:free,paid',
            'price' => 'nullable|numeric|min:0',
            'registration_url' => 'nullable|url',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
        ]);

        // Update slug if title changed
        if (isset($validated['title']) && $validated['title'] !== $event->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => $event,
        ]);
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $event = Event::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Delete images if exists
        if ($event->featured_image) {
            Storage::disk('public')->delete($event->featured_image);
        }
        if ($event->banner_image) {
            Storage::disk('public')->delete($event->banner_image);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }

    /**
     * Upload event image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64
            'type' => 'required|in:featured,banner,gallery',
        ]);

        $imageData = $request->image;
        
        // Remove data:image/png;base64, prefix if exists
        if (strpos($imageData, 'data:image') === 0) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
        }

        $imageData = base64_decode($imageData);
        $imageName = 'events/' . uniqid() . '_' . time() . '.jpg';
        
        Storage::disk('public')->put($imageName, $imageData);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'path' => '/storage/' . $imageName,
            'url' => asset('storage/' . $imageName),
        ]);
    }

    /**
     * Get user's event statistics
     */
    public function stats()
    {
        $user = Auth::user();

        $stats = [
            'total_events' => Event::where('user_id', $user->id)->count(),
            'active_events' => Event::where('user_id', $user->id)->where('is_active', true)->count(),
            'upcoming_events' => Event::where('user_id', $user->id)->upcoming()->count(),
            'total_interested' => Event::where('user_id', $user->id)->sum('interested_count'),
            'total_views' => Event::where('user_id', $user->id)->sum('view_count'),
        ];

        return response()->json(['data' => $stats]);
    }
}
