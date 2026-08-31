<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use App\Models\User;
use App\Models\Category;
use App\Models\Area;
use Illuminate\Support\Str;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        // Get first user or create one
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'user@test.com',
                'password' => bcrypt('password'),
                'phone' => '9876543210',
            ]);
        }

        // Get categories and areas
        $categories = Category::all();
        $areas = Area::all();

        if ($categories->isEmpty() || $areas->isEmpty()) {
            $this->command->error('Please run CategorySeeder and AreaSeeder first!');
            return;
        }

        $businesses = [
            [
                'name' => 'ABC Digital Solutions',
                'tagline' => 'Your Growth, Our Strategy',
                'short_description' => 'Leading digital marketing agency in Patna offering SEO, Social Media, and Web Development services.',
                'description' => 'ABC Digital Solutions is a full-service digital marketing agency based in Patna. We specialize in SEO, Social Media Marketing, Google Ads, Content Marketing, Website Development and more. Our mission is to help businesses establish a strong online presence and achieve measurable growth through innovative digital strategies.',
                'established_year' => 2018,
                'phone' => '9876543210',
                'email' => 'info@abcdigital.com',
                'website' => 'https://www.abcdigital.com',
                'whatsapp' => '9876543210',
                'address' => 'Boring Road, Near Patna Junction',
                'city' => 'Patna',
                'state' => 'Bihar',
                'pincode' => '800001',
                'landmark' => 'Near ICICI Bank',
                'opening_hours' => json_encode([
                    'monday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '18:00'],
                    'tuesday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '18:00'],
                    'wednesday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '18:00'],
                    'thursday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '18:00'],
                    'friday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '18:00'],
                    'saturday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '14:00'],
                    'sunday' => ['is_open' => false, 'open_time' => '09:00', 'close_time' => '18:00'],
                ]),
                'services' => json_encode([
                    ['name' => 'SEO Services', 'description' => 'Complete SEO optimization', 'price' => '₹15,000/month', 'active' => true],
                    ['name' => 'Social Media Marketing', 'description' => 'Facebook, Instagram management', 'price' => '₹10,000/month', 'active' => true],
                    ['name' => 'Website Development', 'description' => 'Custom website design', 'price' => '₹25,000', 'active' => true],
                ]),
                'social_links' => json_encode([
                    'facebook' => ['enabled' => true, 'url' => 'https://facebook.com/abcdigital'],
                    'instagram' => ['enabled' => true, 'url' => 'https://instagram.com/abcdigital'],
                    'linkedin' => ['enabled' => true, 'url' => 'https://linkedin.com/company/abcdigital'],
                ]),
                'status' => 'approved',
                'is_verified' => true,
                'rating' => 4.8,
                'review_count' => 45,
                'view_count' => 1250,
            ],
            [
                'name' => 'Patna Cafe & Restaurant',
                'tagline' => 'Taste of Bihar',
                'short_description' => 'Authentic Bihari cuisine and multi-cuisine restaurant serving delicious food since 2015.',
                'description' => 'Patna Cafe & Restaurant is your destination for authentic Bihari food and multi-cuisine delicacies. We serve traditional litti chokha, sattu paratha, and modern continental dishes. Our cozy ambiance and friendly staff make every meal memorable.',
                'established_year' => 2015,
                'phone' => '9123456789',
                'email' => 'info@patnacafe.com',
                'whatsapp' => '9123456789',
                'address' => 'Fraser Road, Patna',
                'city' => 'Patna',
                'state' => 'Bihar',
                'pincode' => '800001',
                'landmark' => 'Opposite Gandhi Maidan',
                'opening_hours' => json_encode([
                    'monday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '22:00'],
                    'tuesday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '22:00'],
                    'wednesday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '22:00'],
                    'thursday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '22:00'],
                    'friday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '22:00'],
                    'saturday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '23:00'],
                    'sunday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '23:00'],
                ]),
                'services' => json_encode([
                    ['name' => 'Litti Chokha', 'description' => 'Traditional Bihari dish', 'price' => '₹80', 'active' => true],
                    ['name' => 'Sattu Paratha', 'description' => 'Healthy breakfast option', 'price' => '₹60', 'active' => true],
                    ['name' => 'Continental Meals', 'description' => 'Multi-cuisine options', 'price' => '₹200-500', 'active' => true],
                ]),
                'social_links' => json_encode([
                    'facebook' => ['enabled' => true, 'url' => 'https://facebook.com/patnacafe'],
                    'instagram' => ['enabled' => true, 'url' => 'https://instagram.com/patnacafe'],
                ]),
                'status' => 'approved',
                'is_verified' => true,
                'is_featured' => true,
                'rating' => 4.5,
                'review_count' => 230,
                'view_count' => 3500,
            ],
            [
                'name' => 'Wellness Gym & Fitness Center',
                'tagline' => 'Your Fitness Journey Starts Here',
                'short_description' => 'Modern gym facility with professional trainers, latest equipment, and personalized fitness programs.',
                'description' => 'Wellness Gym & Fitness Center is Patna\'s premier fitness destination offering state-of-the-art equipment, certified personal trainers, group fitness classes, yoga sessions, and nutrition counseling. Whether you\'re a beginner or an athlete, we have programs tailored for everyone.',
                'established_year' => 2020,
                'phone' => '8765432109',
                'email' => 'contact@wellnessgym.com',
                'website' => 'https://wellnessgym.com',
                'whatsapp' => '8765432109',
                'address' => 'Kankarbagh Main Road',
                'city' => 'Patna',
                'state' => 'Bihar',
                'pincode' => '800020',
                'landmark' => 'Near Kankarbagh Thana',
                'opening_hours' => json_encode([
                    'monday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'tuesday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'wednesday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'thursday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'friday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'saturday' => ['is_open' => true, 'open_time' => '05:00', 'close_time' => '22:00'],
                    'sunday' => ['is_open' => true, 'open_time' => '06:00', 'close_time' => '20:00'],
                ]),
                'services' => json_encode([
                    ['name' => 'Personal Training', 'description' => 'One-on-one fitness coaching', 'price' => '₹3,000/month', 'active' => true],
                    ['name' => 'Group Classes', 'description' => 'Zumba, Aerobics, CrossFit', 'price' => '₹2,000/month', 'active' => true],
                    ['name' => 'Yoga Sessions', 'description' => 'Morning and evening yoga', 'price' => '₹1,500/month', 'active' => true],
                    ['name' => 'Nutrition Counseling', 'description' => 'Diet planning and guidance', 'price' => '₹1,000/month', 'active' => true],
                ]),
                'social_links' => json_encode([
                    'facebook' => ['enabled' => true, 'url' => 'https://facebook.com/wellnessgym'],
                    'instagram' => ['enabled' => true, 'url' => 'https://instagram.com/wellnessgym'],
                    'youtube' => ['enabled' => true, 'url' => 'https://youtube.com/@wellnessgym'],
                ]),
                'status' => 'approved',
                'is_verified' => true,
                'rating' => 4.9,
                'review_count' => 87,
                'view_count' => 2100,
            ],
            [
                'name' => 'Tech Solutions India',
                'tagline' => 'Innovative IT Services',
                'short_description' => 'Complete IT solutions provider offering software development, cloud services, and IT consulting.',
                'description' => 'Tech Solutions India is a leading IT services company specializing in custom software development, mobile app development, cloud migration, cybersecurity, and IT infrastructure management. We help businesses transform digitally with cutting-edge technology solutions.',
                'established_year' => 2019,
                'phone' => '7654321098',
                'email' => 'hello@techsolutions.in',
                'website' => 'https://techsolutions.in',
                'whatsapp' => '7654321098',
                'address' => 'Patliputra Colony',
                'city' => 'Patna',
                'state' => 'Bihar',
                'pincode' => '800013',
                'opening_hours' => json_encode([
                    'monday' => ['is_open' => true, 'open_time' => '09:30', 'close_time' => '18:30'],
                    'tuesday' => ['is_open' => true, 'open_time' => '09:30', 'close_time' => '18:30'],
                    'wednesday' => ['is_open' => true, 'open_time' => '09:30', 'close_time' => '18:30'],
                    'thursday' => ['is_open' => true, 'open_time' => '09:30', 'close_time' => '18:30'],
                    'friday' => ['is_open' => true, 'open_time' => '09:30', 'close_time' => '18:30'],
                    'saturday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '16:00'],
                    'sunday' => ['is_open' => false, 'open_time' => '09:30', 'close_time' => '18:30'],
                ]),
                'services' => json_encode([
                    ['name' => 'Software Development', 'description' => 'Custom applications', 'price' => 'Starting ₹50,000', 'active' => true],
                    ['name' => 'Mobile App Development', 'description' => 'iOS and Android apps', 'price' => 'Starting ₹75,000', 'active' => true],
                    ['name' => 'Cloud Services', 'description' => 'AWS, Azure migration', 'price' => 'Contact for quote', 'active' => true],
                ]),
                'status' => 'pending',
                'rating' => 0,
                'review_count' => 0,
                'view_count' => 150,
            ],
            [
                'name' => 'Style Studio Salon',
                'tagline' => 'Where Beauty Meets Art',
                'short_description' => 'Premium unisex salon offering haircuts, styling, spa treatments, and beauty services.',
                'description' => 'Style Studio Salon is a modern unisex salon providing professional hair care, skin care, and beauty treatments. Our experienced stylists use premium products to give you the perfect look for any occasion. We specialize in bridal makeup, hair coloring, keratin treatments, and spa therapies.',
                'established_year' => 2021,
                'phone' => '6543210987',
                'email' => 'info@stylestudio.com',
                'whatsapp' => '6543210987',
                'address' => 'Exhibition Road, Patna',
                'city' => 'Patna',
                'state' => 'Bihar',
                'pincode' => '800001',
                'landmark' => 'Near Hotel Maurya',
                'opening_hours' => json_encode([
                    'monday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'tuesday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'wednesday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'thursday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'friday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'saturday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                    'sunday' => ['is_open' => true, 'open_time' => '10:00', 'close_time' => '20:00'],
                ]),
                'services' => json_encode([
                    ['name' => 'Haircut & Styling', 'description' => 'Men and women haircuts', 'price' => '₹300-800', 'active' => true],
                    ['name' => 'Hair Coloring', 'description' => 'Professional coloring services', 'price' => '₹1,500-5,000', 'active' => true],
                    ['name' => 'Bridal Makeup', 'description' => 'Complete bridal package', 'price' => '₹15,000-25,000', 'active' => true],
                    ['name' => 'Spa & Massage', 'description' => 'Relaxing spa treatments', 'price' => '₹1,000-3,000', 'active' => true],
                ]),
                'social_links' => json_encode([
                    'facebook' => ['enabled' => true, 'url' => 'https://facebook.com/stylestudio'],
                    'instagram' => ['enabled' => true, 'url' => 'https://instagram.com/stylestudio'],
                ]),
                'status' => 'approved',
                'is_verified' => true,
                'rating' => 4.7,
                'review_count' => 156,
                'view_count' => 2800,
            ],
        ];

        foreach ($businesses as $businessData) {
            // Get random category and area
            $category = $categories->random();
            $area = $areas->random();

            Business::create([
                'user_id' => $user->id,
                'name' => $businessData['name'],
                'slug' => Str::slug($businessData['name']) . '-' . Str::random(6),
                'category_id' => $category->id,
                'area_id' => $area->id,
                'tagline' => $businessData['tagline'] ?? null,
                'short_description' => $businessData['short_description'] ?? null,
                'description' => $businessData['description'] ?? null,
                'established_year' => $businessData['established_year'] ?? null,
                'phone' => $businessData['phone'] ?? null,
                'email' => $businessData['email'] ?? null,
                'website' => $businessData['website'] ?? null,
                'whatsapp' => $businessData['whatsapp'] ?? null,
                'address' => $businessData['address'] ?? null,
                'city' => $businessData['city'] ?? 'Patna',
                'state' => $businessData['state'] ?? 'Bihar',
                'pincode' => $businessData['pincode'] ?? null,
                'landmark' => $businessData['landmark'] ?? null,
                'opening_hours' => $businessData['opening_hours'] ?? null,
                'services' => $businessData['services'] ?? null,
                'social_links' => $businessData['social_links'] ?? null,
                'status' => $businessData['status'] ?? 'pending',
                'is_verified' => $businessData['is_verified'] ?? false,
                'is_featured' => $businessData['is_featured'] ?? false,
                'rating' => $businessData['rating'] ?? 0,
                'review_count' => $businessData['review_count'] ?? 0,
                'view_count' => $businessData['view_count'] ?? 0,
            ]);
        }

        $this->command->info('Sample businesses created successfully!');
    }
}
