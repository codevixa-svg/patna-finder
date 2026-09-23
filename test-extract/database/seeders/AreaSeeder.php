<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use Illuminate\Support\Str;

class AreaSeeder extends Seeder
{
    /**
     * Seed Patna areas with descriptions, banner images (Unsplash),
     * approximate coordinates and SEO meta — same pattern as EventSeeder.
     */
    public function run(): void
    {
        $areas = [
            [
                'name' => 'Boring Road',
                'description' => 'One of Patna\'s busiest commercial and educational hubs, lined with coaching institutes, book shops, cafes and showrooms.',
                'banner_image' => 'https://images.unsplash.com/photo-1489516408517-0c0a15662682?w=800',
                'meta_title' => 'Top Businesses in Boring Road, Patna',
                'meta_description' => 'Discover coaching centres, restaurants, clinics and shops in Boring Road, Patna.',
                'latitude' => 25.6127,
                'longitude' => 85.1350,
            ],
            [
                'name' => 'Kankarbagh',
                'description' => 'A vast residential-cum-commercial colony famous for its markets, eateries, hospitals and the lively Kankarbagh main market.',
                'banner_image' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
                'meta_title' => 'Top Businesses in Kankarbagh, Patna',
                'meta_description' => 'Find markets, doctors, gyms and restaurants in Kankarbagh, Patna.',
                'latitude' => 25.5941,
                'longitude' => 85.1376,
            ],
            [
                'name' => 'Patliputra',
                'description' => 'An upscale modern locality with wide roads, premium apartments, schools and popular hangout spots near the Patliputra sports complex.',
                'banner_image' => 'https://images.unsplash.com/photo-1449824913935-59a10b27613d?w=800',
                'meta_title' => 'Top Businesses in Patliputra, Patna',
                'meta_description' => 'Explore premium cafes, gyms, schools and services in Patliputra, Patna.',
                'latitude' => 25.6093,
                'longitude' => 85.1044,
            ],
            [
                'name' => 'Bailey Road',
                'description' => 'The arterial road of Patna connecting Gandhi Maidan to Danapur, dotted with hospitals, hotels, malls and the Bihar Museum.',
                'banner_image' => 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800',
                'meta_title' => 'Top Businesses on Bailey Road, Patna',
                'meta_description' => 'Hotels, hospitals, malls and eateries along Bailey Road, Patna.',
                'latitude' => 25.6187,
                'longitude' => 85.1105,
            ],
            [
                'name' => 'Rajendra Nagar',
                'description' => 'A well-planned residential area known for Rajendra Nagar Terminal railway station, parks and family-run businesses.',
                'banner_image' => 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
                'meta_title' => 'Top Businesses in Rajendra Nagar, Patna',
                'meta_description' => 'Local shops, parks and services in Rajendra Nagar, Patna.',
                'latitude' => 25.6022,
                'longitude' => 85.1440,
            ],
            [
                'name' => 'Danapur',
                'description' => 'A rapidly growing suburb on the western edge of Patna, home to the Danapur cantonment, markets and new residential projects.',
                'banner_image' => 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
                'meta_title' => 'Top Businesses in Danapur, Patna',
                'meta_description' => 'Markets, showrooms and services in Danapur, Patna.',
                'latitude' => 25.6287,
                'longitude' => 85.0517,
            ],
            [
                'name' => 'Ashok Rajpath',
                'description' => 'The heritage corridor of Patna running past Patna College, Patna Medical College and the historic Ashok Rajpath market.',
                'banner_image' => 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
                'meta_title' => 'Top Businesses on Ashok Rajpath, Patna',
                'meta_description' => 'Heritage markets, colleges and clinics on Ashok Rajpath, Patna.',
                'latitude' => 25.6200,
                'longitude' => 85.1400,
            ],
            [
                'name' => 'Fraser Road',
                'description' => 'Central Patna\'s commercial spine near Gandhi Maidan with banks, showrooms, offices and buzzing street food corners.',
                'banner_image' => 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
                'meta_title' => 'Top Businesses on Fraser Road, Patna',
                'meta_description' => 'Banks, showrooms and offices on Fraser Road, Patna.',
                'latitude' => 25.6093,
                'longitude' => 85.1376,
            ],
            [
                'name' => 'Patna City',
                'description' => 'The old city area around Gulbi Ghat and Padri Ki Haveli, famous for its wholesale markets, Marwari community and heritage lanes.',
                'banner_image' => 'https://images.unsplash.com/photo-1523531294919-4bfd72523d1e?w=800',
                'meta_title' => 'Top Businesses in Patna City',
                'meta_description' => 'Wholesale markets and heritage spots in old Patna City.',
                'latitude' => 25.6093,
                'longitude' => 85.1700,
            ],
            [
                'name' => 'Kurji',
                'description' => 'A calm residential pocket between Kankarbagh and Digha known for Kurji Market, quality schools and neighbourhood clinics.',
                'banner_image' => 'https://images.unsplash.com/photo-1568607918870-9cc50bcc5798?w=800',
                'meta_title' => 'Top Businesses in Kurji, Patna',
                'meta_description' => 'Schools, markets and clinics in Kurji, Patna.',
                'latitude' => 25.6280,
                'longitude' => 85.1220,
            ],
            [
                'name' => 'Digha',
                'description' => 'A riverside locality on the Ganga with Digha Ghat, peaceful colonies and emerging cafes along Bailey Road extension.',
                'banner_image' => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
                'meta_title' => 'Top Businesses in Digha, Patna',
                'meta_description' => 'Riverside cafes, parks and services in Digha, Patna.',
                'latitude' => 25.6320,
                'longitude' => 85.0840,
            ],
            [
                'name' => 'Anisabad',
                'description' => 'A growing residential area in north-west Patna with affordable housing, local markets and easy highway access.',
                'banner_image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
                'meta_title' => 'Top Businesses in Anisabad, Patna',
                'meta_description' => 'Local shops and services in Anisabad, Patna.',
                'latitude' => 25.6395,
                'longitude' => 85.1170,
            ],
            [
                'name' => 'Phulwari Sharif',
                'description' => 'A historic town on Patna\'s outskirts known for its Sufi heritage, educational institutions and growing connectivity.',
                'banner_image' => 'https://images.unsplash.com/photo-1564769625905-50e93615e595?w=800',
                'meta_title' => 'Top Businesses in Phulwari Sharif, Patna',
                'meta_description' => 'Heritage sites and local businesses in Phulwari Sharif, Patna.',
                'latitude' => 25.5980,
                'longitude' => 85.0600,
            ],
            [
                'name' => 'Khagaul',
                'description' => 'A quiet township west of Danapur with railway colonies, local bazaars and riverside views of the Sone canal belt.',
                'banner_image' => 'https://images.unsplash.com/photo-1494522855150-592a88be0500?w=800',
                'meta_title' => 'Top Businesses in Khagaul, Patna',
                'meta_description' => 'Bazaars and local services in Khagaul, Patna.',
                'latitude' => 25.6260,
                'longitude' => 85.0360,
            ],
            [
                'name' => 'Gandhi Maidan',
                'description' => 'The heart of Patna — the historic Gandhi Maidan grounds surrounded by malls, hotels, offices and the famous Golghar.',
                'banner_image' => 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
                'meta_title' => 'Top Businesses near Gandhi Maidan, Patna',
                'meta_description' => 'Malls, hotels and eateries around Gandhi Maidan, Patna.',
                'latitude' => 25.6152,
                'longitude' => 85.1380,
            ],
            [
                'name' => 'Gardanibagh',
                'description' => 'A green, low-density neighbourhood near the Anisabad bend, known for its nurseries, quiet streets and budget eateries.',
                'banner_image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
                'meta_title' => 'Top Businesses in Gardanibagh, Patna',
                'meta_description' => 'Nurseries and local businesses in Gardanibagh, Patna.',
                'latitude' => 25.6080,
                'longitude' => 85.1200,
            ],
            [
                'name' => 'Bankipore',
                'description' => 'One of Patna\'s oldest neighbourhoods along the Ganga, home to the Bankipore Club, Patna High Court and colonial-era buildings.',
                'banner_image' => 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
                'meta_title' => 'Top Businesses in Bankipore, Patna',
                'meta_description' => 'Heritage buildings and services in Bankipore, Patna.',
                'latitude' => 25.6110,
                'longitude' => 85.1300,
            ],
            [
                'name' => 'Sri Krishnapuri',
                'description' => 'A well-connected central locality with doctors\' clinics, coaching centres and the popular Sri Krishnapuri market.',
                'banner_image' => 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800',
                'meta_title' => 'Top Businesses in Sri Krishnapuri, Patna',
                'meta_description' => 'Clinics, coaching centres and markets in Sri Krishnapuri, Patna.',
                'latitude' => 25.6100,
                'longitude' => 85.1280,
            ],
            [
                'name' => 'Kankarbagh Colony',
                'description' => 'The sprawling colony stretch of Kankarbagh with its famous main market, parks and endless food options.',
                'banner_image' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
                'meta_title' => 'Top Businesses in Kankarbagh Colony, Patna',
                'meta_description' => 'Markets, food joints and services in Kankarbagh Colony, Patna.',
                'latitude' => 25.5930,
                'longitude' => 85.1420,
            ],
            [
                'name' => 'Budh Marg',
                'description' => 'A short but busy central road linking Bailey Road to Gandhi Maidan, packed with showrooms, banks and sweet shops.',
                'banner_image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                'meta_title' => 'Top Businesses on Budh Marg, Patna',
                'meta_description' => 'Showrooms and banks on Budh Marg, Patna.',
                'latitude' => 25.6170,
                'longitude' => 85.1330,
            ],
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(
                ['slug' => Str::slug($area['name'])],
                [
                    'name' => $area['name'],
                    'description' => $area['description'],
                    'banner_image' => $area['banner_image'],
                    'meta_title' => $area['meta_title'],
                    'meta_description' => $area['meta_description'],
                    'latitude' => $area['latitude'],
                    'longitude' => $area['longitude'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Areas seeded successfully with banner images!');
    }
}
