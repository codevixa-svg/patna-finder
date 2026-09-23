<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogPost;
use Illuminate\Support\Carbon;

class BlogPostSeeder extends Seeder
{
    /**
     * Seed the Patna Pulse blog with published posts featuring
     * Unsplash cover images — same pattern as EventSeeder.
     */
    public function run(): void
    {
        $posts = [
            [
                'title' => 'Patna Metro: What Commuters Can Expect in 2026',
                'slug' => 'patna-metro-what-commuters-can-expect',
                'excerpt' => 'Corridor updates, station list, expected fares and how the Patna Metro will change daily commutes across Boring Road, Bailey Road and Gandhi Maidan.',
                'content' => "<p>Patna's long-awaited Metro project has entered its most exciting phase. With trial runs progressing on the priority corridor, daily commuters are finally starting to picture a city without endless traffic jams on Bailey Road.</p><h2>The Two Corridors</h2><p>Phase 1 connects Danapur to Patna University along the east-west corridor, while the north-south corridor links Gandhi Maidan with the railway stations beyond the Ganga. Together they will cover the city's most congested stretches.</p><h2>Stations Near Landmarks</h2><p>Key stations are planned near Patna Junction, Gandhi Maidan, PMCH and Sachivalaya, making the Metro instantly useful for office-goers, students and hospital visitors alike.</p><h2>Fares and Timings</h2><p>Expected fares start around ₹10 for short hops, with smart cards offering discounts. Trains are planned from 6 AM to 10 PM at 10-minute frequency during peak hours.</p><p>Patna Finder will keep updating station-wise business guides as each station opens — so your favourite litti-chokha stop is never more than a walk away from the Metro.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800',
                'image_alt' => 'Modern metro train running through an Indian city at dusk',
                'author_name' => 'Priya Sharma',
                'author_bio' => 'Priya covers urban development and civic infrastructure in Bihar. She has reported on Patna\'s growth story for over six years.',
                'reading_time' => 5,
                'category' => 'News',
                'tags' => ['patna-metro', 'transport', 'infrastructure', 'patna'],
                'view_count' => 4820,
                'meta_title' => 'Patna Metro 2026: Routes, Stations, Fares & Timings',
                'meta_description' => 'Complete guide to the Patna Metro: corridors, station list near Gandhi Maidan and Boring Road, expected fares and timings.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(2),
            ],
            [
                'title' => 'Chhath Puja in Patna: A Complete Guide for 2025',
                'slug' => 'chhath-puja-in-patna-complete-guide',
                'excerpt' => 'From Ganga Ghats to local ponds — where to offer Arghya, how to navigate road closures, and the best vantage points during Chhath Puja in Patna.',
                'content' => "<p>Chhath Puja transforms Patna like no other festival. Every ghat along the Ganga — from Gulbi Ghat to Digha Ghat — glows with thousands of diyas as devotees offer Arghya to Surya Dev.</p><h2>Best Ghats in Patna</h2><p>Ganga Ghat near Gandhi Maidan, Kali Ghat, Digha Ghat and Patna City's Gulbi Ghat draw the biggest crowds. For a quieter experience, local ponds in Kankarbagh and Rajendra Nagar are excellent alternatives.</p><h2>Getting Around</h2><p>Expect diversions around all major ghats on the evening of Sandhya Arghya. Autos and e-rickshaws stay plentiful but agree on fares in advance. The elderly should be dropped as close to the ghat as possible.</p><h2>What to Carry</h2><p>Carry water, a torch, and a small mat. Vendors sell thekua, sugarcane and coconut baskets around every ghat — buying locally supports families who depend on this festive economy.</p><p>Chhath is Patna at its most beautiful — devotion, discipline and community spirit on full display.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
                'image_alt' => 'Devotees offering prayers with diya lamps by the river at dusk',
                'author_name' => 'Ankit Kumar',
                'author_bio' => 'Ankit is a Patna-based culture writer who documents festivals, food and everyday life in Bihar.',
                'reading_time' => 6,
                'category' => 'Festivals',
                'tags' => ['chhath-puja', 'festivals', 'patna', 'ganga'],
                'view_count' => 6210,
                'meta_title' => 'Chhath Puja 2025 in Patna: Ghats, Timings & Travel Guide',
                'meta_description' => 'Where to celebrate Chhath Puja in Patna: best Ganga ghats, road diversions, and tips for devotees.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(5),
            ],
            [
                'title' => 'The Ultimate Litti Chokha Trail Through Patna',
                'slug' => 'ultimate-litti-chokha-trail-patna',
                'excerpt' => 'Five legendary stops where Patna does litti chokha right — smoky baatis, fiery chokha and ghee that deserves its own medal.',
                'content' => "<p>Litti chokha is Patna's soul food. Spherical whole-wheat baatis stuffed with sattu, roasted over coal and drowned in ghee — paired with mashed brinjal, potato and tomato chokha. Here's our trail across the city.</p><h2>Stop 1: The Old City Classic</h2><p>Start in Patna City where generations-old stalls serve litti with pure-desi-ghee generosity. Reach early — they sell out by noon.</p><h2>Stop 2: Kankarbagh Corner Shop</h2><p>The Kankarbagh main market belt has a small counter famous for its smoky baatis and garlic-heavy chokha. Cash only, worth every rupee.</p><h2>Stop 3: Boring Road Bistro Twist</h2><p>A modern cafe on Boring Road serves litti platters with curd and pickle flights — a fusion take that somehow respects the original.</p><h2>Pro Tips</h2><p>Ask for extra tomato chokha, always eat within minutes of roasting, and never judge a stall by its size. The smallest counters often make the best litti.</p><p>Drop your favourite litti spot in the comments and we'll add it to the Patna Finder map.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
                'image_alt' => 'Traditional Indian food platter with roasted bread balls and mash',
                'author_name' => 'Rohini Sinha',
                'author_bio' => 'Rohini is a food writer hunting down Bihar\'s best street food, one gali at a time.',
                'reading_time' => 4,
                'category' => 'Food',
                'tags' => ['litti-chokha', 'street-food', 'food', 'patna'],
                'view_count' => 5150,
                'meta_title' => 'Best Litti Chokha in Patna: 5 Legendary Stops',
                'meta_description' => 'From Patna City to Boring Road — the best places for litti chokha in Patna, with pro tips.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(8),
            ],
            [
                'title' => '10 Weekend Getaways Around Patna You Can Actually Do',
                'slug' => 'weekend-getaways-around-patna',
                'excerpt' => 'Rajgir, Nalanda, Bodh Gaya, Valmiki Tiger Reserve — quick escapes from Patna that fit perfectly into a weekend, with travel times and tips.',
                'content' => "<p>Patna sits at the centre of some of India's most historic landscapes. Pack a bag on Saturday morning and you can be standing where Buddha walked by lunch.</p><h2>Day Trips Under 3 Hours</h2><p>Rajgir's hot springs and hill ropeway make an easy morning trip. Nalanda's ruins pair perfectly with it. Bodh Gaya's Mahabodhi Temple deserves a full day — the 5 AM serenity is unmatched.</p><h2>For Nature Lovers</h2><p>The Valmiki Tiger Reserve is a longer haul but worth an overnight stay. Closer home, the Bhagalpur dolphin sanctuary offers something few cities can claim.</p><h2>Practical Tips</h2><p>Start early — roads are clearest before 8 AM. Book return tickets in advance for Sunday evenings, and keep a buffer for the Danapur-Digha stretch traffic.</p><p>Wherever you go, come back hungry — nothing beats homecoming litti.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                'image_alt' => 'Scenic winding road with hills on a sunny weekend morning',
                'author_name' => 'Aditya Raj',
                'author_bio' => 'Aditya writes travel guides and weekend itineraries focused on Bihar and eastern India.',
                'reading_time' => 7,
                'category' => 'Lifestyle',
                'tags' => ['travel', 'weekend', 'rajgir', 'nalanda', 'bodh-gaya'],
                'view_count' => 3940,
                'meta_title' => '10 Weekend Getaways from Patna with Travel Times',
                'meta_description' => 'Best weekend trips from Patna: Rajgir, Nalanda, Bodh Gaya and more — with distances and tips.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(11),
            ],
            [
                'title' => 'How to Choose the Right Coaching Institute on Boring Road',
                'slug' => 'choose-right-coaching-institute-boring-road',
                'excerpt' => 'Faculty, batch size, fees and demo classes — a practical checklist for students and parents navigating Patna\'s biggest coaching hub.',
                'content' => "<p>Boring Road is to Patna what Kota is to Rajasthan — almost. Dozens of institutes promise IIT and NEET glory, but how do you pick the right one?</p><h2>Check the Faculty, Not the Banners</h2><p>Meet the actual teachers who will take your batch. Institutes often advertise star faculty who only teach top batches. Ask specifically about the section you will join.</p><h2>Batch Size Matters</h2><p>A batch of 40 with doubt-clearing sessions beats a batch of 200 with a famous name. Ask how doubts are handled between classes.</p><h2>Ask for a Demo Week</h2><p>Most reputed institutes on Boring Road and Kankarbagh offer demo classes. Sit through a full week before paying fees — chemistry between teacher and student shows quickly.</p><h2>Read the Fee Structure Carefully</h2><p>Watch for instalment terms, refund policies and scholarship criteria. Get everything in writing.</p><p>Patna Finder lists verified coaching institutes with real reviews — filter by Boring Road and compare before you enrol.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
                'image_alt' => 'Students studying together in a bright classroom',
                'author_name' => 'Neha Gupta',
                'author_bio' => 'Neha guides students and parents through education choices in Bihar, from schools to competitive exam coaching.',
                'reading_time' => 5,
                'category' => 'Education',
                'tags' => ['coaching', 'education', 'boring-road', 'jee', 'neet'],
                'view_count' => 4480,
                'meta_title' => 'How to Pick a Coaching Institute in Patna (Boring Road Guide)',
                'meta_description' => 'A practical checklist for choosing coaching institutes on Boring Road: faculty, batch size, fees and demo classes.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(14),
            ],
            [
                'title' => 'Ganga Utsav 2025: What to See at Gandhi Ghat This Year',
                'slug' => 'ganga-utsav-2025-gandhi-ghat-guide',
                'excerpt' => 'Cultural performances, boat rides, Ganga Aarti timings and the best photo spots at Patna\'s biggest river festival.',
                'content' => "<p>Ganga Utsav turns Gandhi Ghat into Patna's most vibrant riverside venue for three days — folk music, sand art, boat rides and the spectacular evening aarti.</p><h2>Event Highlights</h2><p>Expect Bhojpuri folk concerts, local artisan stalls, and the much-photographed sand art installations on the riverbed. The cultural evenings start at 6 PM daily.</p><h2>Boat Rides and Aarti</h2><p>Evening boat rides run from 4:30 PM — book at the counter early because sunset slots fill fast. The Ganga Aarti with lamps and conch shells begins at 6:30 PM; the ghat steps offer the best view.</p><h2>Getting There</h2><p>Gandhi Ghat is a 10-minute walk from Gandhi Maidan. Expect traffic diversions — autos from Fraser Road drop you closest. Carry water and wear comfortable shoes for the steps.</p><p>Entry is free, crowds are large, and the atmosphere is unforgettable. Reach by 5:30 PM for the full experience.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
                'image_alt' => 'Crowd celebrating a riverside festival with lights at dusk',
                'author_name' => 'Ankit Kumar',
                'author_bio' => 'Ankit is a Patna-based culture writer who documents festivals, food and everyday life in Bihar.',
                'reading_time' => 4,
                'category' => 'Events',
                'tags' => ['ganga-utsav', 'events', 'gandhi-ghat', 'patna'],
                'view_count' => 2760,
                'meta_title' => 'Ganga Utsav 2025 at Gandhi Ghat: Timings & Guide',
                'meta_description' => 'Ganga Utsav 2025 in Patna: cultural performances, boat rides, aarti timings and travel tips.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(17),
            ],
            [
                'title' => 'One Day in Patna: The Perfect Tourist Itinerary',
                'slug' => 'one-day-in-patna-tourist-itinerary',
                'excerpt' => 'Golghar at sunrise, Bihar Museum by noon, Patna Sahib in the evening — a tight but rewarding one-day plan for visitors.',
                'content' => "<p>Got 24 hours in Patna? This itinerary covers the city's essential sights without exhausting you.</p><h2>Sunrise: Golghar</h2><p>Climb the granary's spiral steps by 7 AM. The 360-degree Ganga view in morning light is Patna's best photo op, and the crowd is minimal.</p><h2>Morning: Bihar Museum</h2><p>By 10 AM, head to the Bihar Museum on Bailey Road — world-class galleries on Bihar's history and art. Keep two hours; the museum shop is worth a browse.</p><h2>Lunch Near Gandhi Maidan</h2><p>Fraser Road and Exhibition Road belt has everything from Bihari thalis to quick biryani. Ask for local specials — Postia kachori is a classic.</p><h2>Evening: Patna Sahib &amp; Ganga Ghat</h2><p>Drive to Takht Sri Patna Sahib by 4:30 PM, then end the day with the Ganga Aarti at Gandhi Ghat. Peaceful, photogenic, and deeply Patna.</p><h2>Getting Around</h2><p>Book a cab for the full day — most spots are within 8 km. Auto-haggling works, but for a day trip a fixed cab is easier.</p>",
                'featured_image' => 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
                'image_alt' => 'Historic Indian landmark glowing in warm evening light',
                'author_name' => 'Aditya Raj',
                'author_bio' => 'Aditya writes travel guides and weekend itineraries focused on Bihar and eastern India.',
                'reading_time' => 6,
                'category' => 'Tourism',
                'tags' => ['tourism', 'itinerary', 'golghar', 'bihar-museum', 'patna-sahib'],
                'view_count' => 7330,
                'meta_title' => 'One Day in Patna: Perfect Tourist Itinerary (2025)',
                'meta_description' => 'The best one-day Patna itinerary: Golghar, Bihar Museum, Patna Sahib and Ganga Ghat with timings and travel tips.',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(20),
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::updateOrCreate(
                ['slug' => $post['slug']],
                $post
            );
        }

        $this->command->info('Blog posts seeded successfully with images!');
    }
}