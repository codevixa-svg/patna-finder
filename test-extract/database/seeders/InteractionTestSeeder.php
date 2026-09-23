<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\BusinessInteraction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * LOCAL-ONLY test seeder (gitignored, never deployed).
 *
 * Inserts REAL rows into the same `business_interactions` table that the public
 * track endpoint (POST /businesses/{slugOrId}/track) writes to — so the
 * analytics dashboard shows genuinely representative data while testing locally.
 *
 * Usage:
 *   php artisan db:seed --class=InteractionTestSeeder
 *
 * Overrides (optional environment variables):
 *   SEED_BIZ_ID=8  SEED_COUNT=25
 *
 * Idempotent: if the business already has interactions it refuses to run so
 * repeated seeding doesn't skew the chart. To start fresh:
 *   php artisan tinker --execute="DB::table('business_interactions')->where('business_id',8)delete();"
 */
class InteractionTestSeeder extends Seeder
{
    public function run(): void
    {
        $businessId = (int) (getenv('SEED_BIZ_ID') ?: 8);
        $count = (int) (getenv('SEED_COUNT') ?: 25);

        $business = Business::find($businessId);
        if (!$business) {
            $this->command->error("Business #{$businessId} not found. Seed a business first (BusinessSeeder).");

            return;
        }

        if (BusinessInteraction::where('business_id', $businessId)->exists()) {
            $this->command->warn("business #{$businessId} already has interactions — skipping (clean first to re-seed.");

            return;
        }

        $events = BusinessInteraction::EVENTS; // view, call, website, whatsapp, directions, share
        $ips = ['127.0.0.1', '103.95.85.11', '182.71.112.44', '49.36.222.10', '106.207.110.18', '2401:4900::1234'];
        $now = now();
        $rows = [];
        $viewCount = 0;

        for ($i = 0; $i < $count; $i++) {
            $event = $events[$i % count($events)];
            // Spread over the last 7 days (mostly business hours, IST) so the dashboard chart has a nice curve.
            $ageHours = ($i % 7) * 24 + ($i % 12); // 0..~167h
            $createdAt = $now->copy()->subHours($ageHours)->subMinutes($i % 60);

            $rows[] = [
                'business_id' => $businessId,
                'event_type' => $event,
                'ip_address' => $ips[$i % count($ips)],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            if ($event === 'view') {
                $viewCount++;
            }
        }

        DB::table('business_interactions')->insert($rows);
        if ($viewCount > 0) {
            $business->increment('view_count', $viewCount);
        }

        $this->command->info("Seeded {$count} real interactions for business #{$businessId} (" . $business->name . ").");
    }
}