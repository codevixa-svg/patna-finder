<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HiddenGem;
use App\Models\Category;
use App\Models\Area;

class HiddenGemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Sample Hidden Gems data for Patna
     */
    public function run(): void
    {
        // Get some categories and areas
        $cafeCategoryId = Category::where('name', 'Cafés')->value('id');
        $restaurantCategoryId = Category::where('name', 'Restaurants')->value('id');
        $boringRoadAreaId = Area::where('name', 'Boring Road')->value('id');
        $kankarbaughAreaId = Area::where('name', 'Kankarbagh')->value('id');

        $hiddenGems = [
            [
                'title' => 'Café Hideout - The Secret Garden Cafe',
                'slug' => 'cafe-hideout-secret-garden',
                'category_id' => $cafeCategoryId,
                'area_id' => $boringRoadAreaId,
                'story' => 'Tucked away in a quiet lane off Boring Road, Café Hideout is Patna\'s best-kept secret for coffee lovers and those seeking a peaceful escape from the city chaos. This cozy café features a beautiful indoor garden with fairy lights, wooden furniture, and vintage décor that creates an enchanting ambiance. The owners, a young couple passionate about specialty coffee, personally curate every blend served here. Their signature cold brew and artisanal pastries have garnered a loyal following among students and remote workers. What makes this place truly special is the book exchange corner, monthly live acoustic sessions, and the warm hospitality that makes you feel at home. Perfect for quiet conversations, productive work sessions, or simply unwinding with a good book.',
                'address' => 'Lane 3, Behind Dujana House, Boring Road, Patna - 800001',
                'latitude' => 25.6093,
                'longitude' => 85.1376,
                'featured_image' => 'cafe-hideout-1.jpg',
                'gallery' => ['cafe-hideout-2.jpg', 'cafe-hideout-3.jpg', 'cafe-hideout-4.jpg'],
                'gmb_place_id' => null, // You'll add real Place IDs later
                'gmb_url' => null,
                'badge' => 'trending',
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 1,
                'tags' => ['cafe', 'coffee', 'cozy', 'quiet', 'books', 'work-friendly'],
                'meta_title' => 'Café Hideout - Secret Garden Cafe in Boring Road, Patna',
                'meta_description' => 'Discover Patna\'s hidden gem café with specialty coffee, cozy ambiance, and peaceful garden setting perfect for work and relaxation.',
            ],
            [
                'title' => 'Bihari Rasoi - Authentic Village Kitchen',
                'slug' => 'bihari-rasoi-authentic-village-kitchen',
                'category_id' => $restaurantCategoryId,
                'area_id' => $kankarbaughAreaId,
                'story' => 'Experience authentic Bihari home-cooked meals at this unassuming eatery that has been serving traditional recipes for over 30 years. Run by the Sharma family, Bihari Rasoi brings the taste of Bihar villages to urban Patna. The menu changes daily based on what\'s fresh in the market, just like how meals are prepared in traditional Bihari households. Their Litti Chokha is legendary - perfectly roasted wheat balls served with smoky eggplant mash and tangy chutney. Other must-tries include Sattu Paratha, Dahi Chura, Khichdi-Papad, and the seasonal Kadhi-Bari. The food is served on traditional brass utensils, adding to the authentic experience. The owners treat every customer like family, often sitting down to chat about the origins of each dish. Despite its modest appearance, this place has hosted food critics, travelers, and locals who swear by its unmatched authenticity.',
                'address' => '12/A, Kankarbagh Colony Main Road, Near Hanuman Mandir, Patna - 800020',
                'latitude' => 25.5941,
                'longitude' => 85.1376,
                'featured_image' => 'bihari-rasoi-1.jpg',
                'gallery' => ['bihari-rasoi-2.jpg', 'bihari-rasoi-3.jpg'],
                'gmb_place_id' => null,
                'gmb_url' => null,
                'badge' => 'popular',
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 2,
                'tags' => ['bihari-food', 'authentic', 'traditional', 'litti-chokha', 'home-cooked'],
                'meta_title' => 'Bihari Rasoi - Authentic Village Kitchen in Kankarbagh, Patna',
                'meta_description' => 'Taste authentic Bihari home-cooked meals and traditional recipes at this 30-year-old hidden gem restaurant in Patna.',
            ],
            [
                'title' => 'The Old Book Café & Library',
                'slug' => 'old-book-cafe-library',
                'category_id' => $cafeCategoryId,
                'area_id' => $boringRoadAreaId,
                'story' => 'A paradise for bibliophiles and coffee enthusiasts, The Old Book Café combines the charm of a used bookstore with a cozy café atmosphere. Located in a restored colonial-era building, this hidden gem houses over 5,000 used books spanning fiction, non-fiction, poetry, and rare Bihari literature. The café section serves excellent masala chai, filter coffee, and light snacks including sandwiches and homemade cookies. What sets this place apart is its book rental system - pay a nominal fee to borrow books or exchange your old books for credits. The ambiance is deliberately kept minimalist with vintage furniture, soft jazz playing in the background, and large windows providing natural light perfect for reading. Regular events include poetry readings, book club meetups, and author interactions. The owner, a retired English professor, personally curates the collection and loves recommending books to visitors.',
                'address' => 'Gandhi Maidan West, Near Income Tax Office, Patna - 800001',
                'latitude' => 25.6120,
                'longitude' => 85.1340,
                'featured_image' => 'old-book-cafe-1.jpg',
                'gallery' => ['old-book-cafe-2.jpg', 'old-book-cafe-3.jpg', 'old-book-cafe-4.jpg'],
                'gmb_place_id' => null,
                'gmb_url' => null,
                'badge' => 'new',
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 3,
                'tags' => ['books', 'library', 'cafe', 'reading', 'quiet', 'vintage'],
                'meta_title' => 'The Old Book Café & Library - Hidden Gem in Patna',
                'meta_description' => 'Discover this charming book café with 5000+ books, coffee, and cozy reading spaces in a restored colonial building.',
            ],
            [
                'title' => 'Rooftop Sunset Point - Golghar View',
                'slug' => 'rooftop-sunset-point-golghar',
                'category_id' => $cafeCategoryId,
                'area_id' => $boringRoadAreaId,
                'story' => 'Few people know about this hidden rooftop café that offers the best sunset views of Patna\'s iconic Golghar monument. Perched on the fourth floor of an old building near Gandhi Maidan, this small café with just 8 tables provides an unobstructed panoramic view of the city skyline. As the sun sets behind Golghar, the entire sky transforms into shades of orange and pink, creating a magical experience. The café serves simple yet delicious snacks - samosas, pakoras, maggi, chai, and cold drinks. But people don\'t come here for the food; they come for the view and the peaceful ambiance. It\'s a favorite spot for photographers, couples, and anyone looking to escape the hustle of the city below. The owner keeps the place deliberately low-key, with no loud music or fancy décor, letting the natural beauty of the sunset be the main attraction.',
                'address' => '4th Floor, Building 23, Gandhi Maidan West, Near Patna Museum, Patna - 800001',
                'latitude' => 25.6132,
                'longitude' => 85.1318,
                'featured_image' => 'rooftop-sunset-1.jpg',
                'gallery' => ['rooftop-sunset-2.jpg', 'rooftop-sunset-3.jpg'],
                'gmb_place_id' => null,
                'gmb_url' => null,
                'badge' => 'trending',
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 4,
                'tags' => ['sunset', 'rooftop', 'view', 'golghar', 'photography', 'romantic'],
                'meta_title' => 'Rooftop Sunset Point - Best Golghar View Café in Patna',
                'meta_description' => 'Experience magical sunsets with stunning Golghar views at this hidden rooftop café in Patna.',
            ],
        ];

        foreach ($hiddenGems as $gem) {
            HiddenGem::create($gem);
        }

        $this->command->info('Hidden Gems seeded successfully!');
    }
}
