<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessInteraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * GMB-style performance analytics for the business owner's dashboard:
 * profile views, call clicks, website clicks, whatsapp clicks, direction
 * requests and shares — with period comparison and daily time series.
 */
class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $range = in_array((int) $request->get('range'), [7, 30, 90])
            ? (int) $request->get('range')
            : 30;
        $businessId = $request->get('business_id');

        $businesses = Business::where('user_id', $user->id)
            ->when($businessId, function ($query) use ($businessId) {
                $query->where('id', $businessId);
            })
            ->get(['id', 'name', 'slug', 'view_count']);

        $events = BusinessInteraction::EVENTS;

        $emptyTotals = array_fill_keys($events, 0);

        if ($businesses->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'range' => $range,
                    'totals' => $emptyTotals,
                    'previous' => $emptyTotals,
                    'changes' => array_fill_keys($events, null),
                    'daily' => [],
                    'businesses' => [],
                ],
            ]);
        }

        $ids = $businesses->pluck('id');

        // Current period window and the equally sized previous window.
        $start = now()->subDays($range - 1)->startOfDay();
        $end = now()->endOfDay();
        $prevStart = $start->copy()->subDays($range);

        // Aggregate per business + event, bucketed by IST calendar day
        // (created_at is stored in UTC; IST = UTC + 5:30 = +19800 seconds).
        $rows = BusinessInteraction::selectRaw(
            'business_id, event_type, DATE(created_at + INTERVAL 19800 SECOND) as day, COUNT(*) as total'
        )
            ->whereIn('business_id', $ids)
            ->whereBetween('created_at', [$prevStart, $end])
            ->groupBy('business_id', 'event_type', 'day')
            ->get();

        $currentStartDay = $start->timezone('Asia/Kolkata')->toDateString();

        $currentTotals = array_fill_keys($events, 0);
        $previousTotals = array_fill_keys($events, 0);
        $dailyMap = [];
        $perBusiness = [];

        foreach ($ids as $id) {
            $perBusiness[$id] = array_fill_keys($events, 0);
        }

        foreach ($rows as $row) {
            $type = $row->event_type;
            if (!in_array($type, $events)) {
                continue;
            }

            $total = (int) $row->total;

            if ($row->day >= $currentStartDay) {
                $currentTotals[$type] += $total;
                $perBusiness[$row->business_id][$type] += $total;

                if (!isset($dailyMap[$row->day][$type])) {
                    $dailyMap[$row->day][$type] = 0;
                }
                $dailyMap[$row->day][$type] += $total;
            } else {
                $previousTotals[$type] += $total;
            }
        }

        // Continuous daily series (zero-filled) for the chart.
        $daily = [];
        for ($i = 0; $i < $range; $i++) {
            $day = $start->copy()->timezone('Asia/Kolkata')->addDays($i)->toDateString();
            $entry = ['date' => $day];
            foreach ($events as $type) {
                $entry[$type] = $dailyMap[$day][$type] ?? 0;
            }
            $daily[] = $entry;
        }

        // Percentage change vs previous period (null when not computable).
        $changes = [];
        foreach ($events as $type) {
            $prev = $previousTotals[$type];
            $cur = $currentTotals[$type];
            $changes[$type] = $prev > 0
                ? round((($cur - $prev) / $prev) * 100, 1)
                : ($cur > 0 ? 100.0 : null);
        }

        $businessRows = $businesses->map(function ($business) use ($perBusiness) {
            return [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'all_time_views' => (int) $business->view_count,
                'totals' => $perBusiness[$business->id] ?? array_fill_keys(
                    BusinessInteraction::EVENTS,
                    0
                ),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'range' => $range,
                'totals' => $currentTotals,
                'previous' => $previousTotals,
                'changes' => $changes,
                'daily' => $daily,
                'businesses' => $businessRows,
            ],
        ]);
    }
}
