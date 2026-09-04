<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * List all active events
     * GET /api/v1/events
     */
    public function index(Request $request)
    {
        $query = Event::active()->ordered();

        // Filter upcoming only (default: show upcoming so the section always looks fresh)
        if (!$request->has('past') || !$request->boolean('past')) {
            $query->upcoming();
        }

        // Filter by event type
        if ($request->has('event_type') && $request->event_type) {
            $query->where('event_type', $request->event_type);
        }

        // Filter featured
        if ($request->has('is_featured') && $request->boolean('is_featured')) {
            $query->featured();
        }

        $perPage = $request->get('per_page', 12);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Get latest active events for the homepage slider
     * GET /api/v1/events/latest
     */
    public function latest()
    {
        $events = Event::active()
            ->ordered()
            ->take(10)
            ->get();

        return response()->json($events);
    }

    /**
     * Get a single event by slug
     * GET /api/v1/events/{slug}
     */
    public function show($slug)
    {
        $event = Event::where('slug', $slug)
            ->active()
            ->firstOrFail();

        return response()->json($event);
    }
}
