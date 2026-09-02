<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// "09:00" -> "09:00" | "2:30 PM" -> "14:30" | invalid -> null
$to24h = function ($time) {
    $s = trim((string) $time);
    if ($s === '') {
        return null;
    }
    if (preg_match('/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i', $s, $m)) {
        $h = (int) $m[1];
        $min = (int) $m[2];
        $ap = strtoupper($m[3] ?? '');
        if ($ap === 'PM' && $h < 12) { $h += 12; }
        if ($ap === 'AM' && $h === 12) { $h = 0; }
        return sprintf('%02d:%02d', $h, $min);
    }
    return null;
};

$rows = DB::table('businesses')->select('id', 'name', 'opening_hours')->get();
$fixed = 0;
$skipped = 0;

foreach ($rows as $row) {
    $raw = $row->opening_hours;
    if ($raw === null || trim((string) $raw) === '') {
        $skipped++;
        continue;
    }

    $hours = $raw;
    // Decode until we get an array (handles double-encoded JSON)
    for ($i = 0; $i < 3 && is_string($hours); $i++) {
        $decoded = json_decode($hours, true);
        $hours = (json_last_error() === JSON_ERROR_NONE) ? $decoded : null;
    }
    if (!is_array($hours)) {
        echo "SKIP #{$row->id} ({$row->name}): unparseable opening_hours\n";
        $skipped++;
        continue;
    }

    // Normalize every day to the canonical format
    $normalized = [];
    foreach ($hours as $day => $dayHours) {
        if (!is_array($dayHours)) {
            continue;
        }
        $isOpen = array_key_exists('is_open', $dayHours)
            ? (bool) $dayHours['is_open']
            : !($dayHours['closed'] ?? false);
        $normalized[strtolower($day)] = [
            'is_open'    => $isOpen,
            'open_time'  => $to24h($dayHours['open_time'] ?? $dayHours['open'] ?? null),
            'close_time' => $to24h($dayHours['close_time'] ?? $dayHours['close'] ?? null),
        ];
    }

    $encoded = json_encode($normalized);
    if ($encoded !== $raw) {
        DB::table('businesses')->where('id', $row->id)->update(['opening_hours' => $encoded]);
        $fixed++;
        echo "FIXED #{$row->id} ({$row->name})\n";
    } else {
        echo "OK    #{$row->id} ({$row->name})\n";
    }
}

echo "\nDone. {$fixed} repaired, {$skipped} skipped.\n";

