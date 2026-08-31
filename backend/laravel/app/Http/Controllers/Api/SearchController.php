<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return response()->json([
                'businesses' => [],
                'message' => 'Please provide a search query'
            ]);
        }

        $businesses = Business::with(['category', 'area'])
            ->approved()
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('address', 'like', "%{$query}%")
                  ->orWhereHas('category', function($categoryQuery) use ($query) {
                      $categoryQuery->where('name', 'like', "%{$query}%");
                  })
                  ->orWhereHas('area', function($areaQuery) use ($query) {
                      $areaQuery->where('name', 'like', "%{$query}%");
                  });
            })
            ->orderBy('is_featured', 'desc')
            ->orderBy('rating', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'query' => $query,
            'count' => $businesses->count(),
            'businesses' => $businesses
        ]);
    }

    public function popularSearches()
    {
        $popularSearches = [
            'Best Coaching in Patna',
            'Top Dentist in Patna',
            'Best Orthopaedic Doctor',
            'Best Restaurant in Boring Road',
            'Best Gym in Patna',
            'Top Schools in Patna',
            'Best Cafe in Bailey Road',
            'Affordable Gym',
        ];

        return response()->json($popularSearches);
    }
}
