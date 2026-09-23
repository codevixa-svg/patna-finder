<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%")
                  ->orWhere('event_type', 'like', "%{$search}%")
                  ->orWhere('organizer', 'like', "%{$search}%");
            });
        }

        if ($request->has('event_type') && $request->event_type && $request->event_type !== 'all') {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $events = $query->latest('event_date')->paginate($request->get('per_page', 20));

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|string|in:kavi-samelan,job-mela,industrial,doctors-camp,it-sector,other',
            'venue' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'event_date' => 'required|date',
            'start_time' => 'nullable|string|max:20',
            'end_time' => 'nullable|string|max:20',
            'organizer' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'featured_image' => 'nullable|string|max:500',
            'registration_url' => 'nullable|url|max:500',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $validated['city'] = $validated['city'] ?? 'Patna';
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['is_active'] = $request->boolean('is_active');

        $event = Event::create($validated);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event,
        ], 201);
    }

    public function show($id)
    {
        $event = Event::findOrFail($id);
        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'sometimes|required|string|in:kavi-samelan,job-mela,industrial,doctors-camp,it-sector,other',
            'venue' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'event_date' => 'sometimes|required|date',
            'start_time' => 'nullable|string|max:20',
            'end_time' => 'nullable|string|max:20',
            'organizer' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'featured_image' => 'nullable|string|max:500',
            'registration_url' => 'nullable|url|max:500',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        if (array_key_exists('is_featured', $validated)) {
            $validated['is_featured'] = $request->boolean('is_featured');
        }
        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event->fresh(),
        ]);
    }

    public function toggleActive($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['is_active' => !$event->is_active]);

        return response()->json([
            'message' => $event->is_active ? 'Event activated' : 'Event deactivated',
            'event' => $event->fresh(),
        ]);
    }

    public function toggleFeature($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['is_featured' => !$event->is_featured]);

        return response()->json([
            'message' => $event->is_featured ? 'Event featured' : 'Event unfeatured',
            'event' => $event->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully',
        ]);
    }
}
