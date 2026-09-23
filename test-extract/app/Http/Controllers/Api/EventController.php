<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * List all events with filters
     * GET /api/v1/events
     */
    public function index(Request $request)
    {
        $query = Event::active();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%")
                  ->orWhere('organizer', 'like', "%{$search}%");
            });
        }

        // Filter by event category
        if ($request->has('event_category') && $request->event_category) {
            $query->where('event_category', $request->event_category);
        }

        // Filter by event mode (offline, online, hybrid)
        if ($request->has('event_mode') && $request->event_mode) {
            $query->where('event_mode', $request->event_mode);
        }

        // Filter by area
        if ($request->has('area') && $request->area) {
            $query->where('area', $request->area);
        }

        // Filter by price type
        if ($request->has('price_type') && $request->price_type) {
            $query->where('price_type', $request->price_type);
        }

        // Date filters
        if ($request->has('date_filter')) {
            switch ($request->date_filter) {
                case 'today':
                    $query->today();
                    break;
                case 'this_weekend':
                    $query->thisWeekend();
                    break;
                case 'this_week':
                    $startOfWeek = now()->startOfWeek();
                    $endOfWeek = now()->endOfWeek();
                    $query->whereBetween('event_date', [$startOfWeek, $endOfWeek]);
                    break;
                case 'next_week':
                    $startOfNextWeek = now()->addWeek()->startOfWeek();
                    $endOfNextWeek = now()->addWeek()->endOfWeek();
                    $query->whereBetween('event_date', [$startOfNextWeek, $endOfNextWeek]);
                    break;
                case 'this_month':
                    $query->whereMonth('event_date', now()->month)
                          ->whereYear('event_date', now()->year);
                    break;
                case 'custom':
                    if ($request->has('start_date') && $request->has('end_date')) {
                        $query->whereBetween('event_date', [$request->start_date, $request->end_date]);
                    }
                    break;
                case 'upcoming':
                default:
                    $query->upcoming();
                    break;
            }
        } else {
            // Default: show upcoming events
            $query->upcoming();
        }

        // Filter featured
        if ($request->has('is_featured') && $request->boolean('is_featured')) {
            $query->featured();
        }

        // Filter trending
        if ($request->has('is_trending') && $request->boolean('is_trending')) {
            $query->trending();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'date');
        switch ($sortBy) {
            case 'popular':
                $query->popular();
                break;
            case 'date_desc':
                $query->orderBy('event_date', 'desc');
                break;
            case 'date_asc':
            case 'date':
            default:
                $query->ordered();
                break;
        }

        $perPage = $request->get('per_page', 12);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Get trending events
     * GET /api/v1/events/trending
     */
    public function trending()
    {
        $events = Event::active()
            ->trending()
            ->upcoming()
            ->ordered()
            ->limit(10)
            ->get();

        return response()->json(['data' => $events]);
    }

    /**
     * Get featured events
     * GET /api/v1/events/featured
     */
    public function featured()
    {
        $events = Event::active()
            ->featured()
            ->upcoming()
            ->ordered()
            ->limit(10)
            ->get();

        return response()->json(['data' => $events]);
    }

    /**
     * Get popular events (most interested)
     * GET /api/v1/events/popular
     */
    public function popular()
    {
        $events = Event::active()
            ->upcoming()
            ->popular()
            ->limit(10)
            ->get();

        return response()->json(['data' => $events]);
    }

    /**
     * Get latest events
     * GET /api/v1/events/latest
     */
    public function latest()
    {
        $events = Event::active()
            ->upcoming()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['data' => $events]);
    }

    /**
     * Get a single event by slug or ID
     * GET /api/v1/events/{slugOrId}
     */
    public function show($slugOrId)
    {
        // Check if parameter is numeric (ID) or string (slug)
        if (is_numeric($slugOrId)) {
            $event = Event::where('id', $slugOrId)
                ->active()
                ->firstOrFail();
        } else {
            $event = Event::where('slug', $slugOrId)
                ->active()
                ->firstOrFail();
        }

        // Increment view count
        $event->incrementViews();

        return response()->json(['data' => $event]);
    }

    /**
     * Mark user as interested in event
     * POST /api/v1/events/{id}/interested
     */
    public function markInterested($id)
    {
        $event = Event::findOrFail($id);
        $event->incrementInterested();

        return response()->json([
            'message' => 'Marked as interested',
            'interested_count' => $event->interested_count,
        ]);
    }

    /**
     * Remove interested mark
     * DELETE /api/v1/events/{id}/interested
     */
    public function removeInterested($id)
    {
        $event = Event::findOrFail($id);
        $event->decrementInterested();

        return response()->json([
            'message' => 'Removed from interested',
            'interested_count' => $event->interested_count,
        ]);
    }

    /**
     * Get event categories with counts
     * GET /api/v1/events/categories
     */
    public function categories()
    {
        $categories = Event::active()
            ->upcoming()
            ->select('event_category', DB::raw('count(*) as count'))
            ->whereNotNull('event_category')
            ->groupBy('event_category')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Get event areas with counts
     * GET /api/v1/events/areas
     */
    public function areas()
    {
        $areas = Event::active()
            ->upcoming()
            ->select('area', DB::raw('count(*) as count'))
            ->whereNotNull('area')
            ->groupBy('area')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json(['data' => $areas]);
    }

    /**
     * Get upcoming events count by category
     * GET /api/v1/events/stats
     */
    public function stats()
    {
        $stats = [
            'total_upcoming' => Event::active()->upcoming()->count(),
            'total_attendees' => Event::active()->sum('interested_count'),
            'featured_count' => Event::active()->featured()->upcoming()->count(),
            'free_events' => Event::active()->upcoming()->free()->count(),
            'paid_events' => Event::active()->upcoming()->paid()->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
