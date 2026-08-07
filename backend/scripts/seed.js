const Destination = require('../models/Destination');

const destinations = [
  {
    title: 'Paris',
    country: 'France',
    description: 'The City of Light, famous for its romance, Eiffel Tower, world-class art at the Louvre, and café culture.',
    costIndex: '$$',
    rating: 4.8,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    duration: '4-5 Days'
  },
  {
    title: 'Tokyo',
    country: 'Japan',
    description: 'A neon-lit metropolis combining ultra-modern technology, historic temples, and unparalleled sushi culinary experiences.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    duration: '5-7 Days'
  },
  {
    title: 'Bali',
    country: 'Indonesia',
    description: 'A tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.',
    costIndex: '$',
    rating: 4.7,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    duration: '7-10 Days'
  },
  {
    title: 'Rome',
    country: 'Italy',
    description: 'A cosmopolitan city with nearly 3,000 years of globally influential art, architecture, and ruins like the Colosseum.',
    costIndex: '$$',
    rating: 4.8,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  },
  {
    title: 'Reykjavik',
    country: 'Iceland',
    description: 'Gateway to Iceland’s volcanic wonders, hot springs, dramatic waterfalls, and the spectacular Northern Lights.',
    costIndex: '$$$',
    rating: 4.6,
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=800&q=80',
    duration: '5-6 Days'
  },
  {
    title: 'New York City',
    country: 'United States',
    description: 'The Big Apple. Home to Times Square, Broadway, Central Park, and an iconic skyline that never sleeps.',
    costIndex: '$$$',
    rating: 4.7,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    duration: '3-5 Days'
  },
  {
    title: 'Sydney',
    country: 'Australia',
    description: 'Famous for its Opera House, Harbour Bridge, sunny surf culture at Bondi Beach, and vibrant nightlife.',
    costIndex: '$$$',
    rating: 4.8,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    duration: '5-7 Days'
  },
  {
    title: 'Cape Town',
    country: 'South Africa',
    description: 'A port city beneath Table Mountain, offering dramatic coastlines, vineyards, and thrilling safaris nearby.',
    costIndex: '$$',
    rating: 4.7,
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
    duration: '5-6 Days'
  },
  {
    title: 'Cairo',
    country: 'Egypt',
    description: 'Explore the ancient Pyramids of Giza, the Sphinx, and the historic treasures of the Nile River.',
    costIndex: '$',
    rating: 4.5,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  },
  {
    title: 'Banff National Park',
    country: 'Canada',
    description: 'Stunning turquoise lakes, snow-capped peaks of the Canadian Rockies, and endless mountain hiking trails.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    duration: '4-6 Days'
  },
  {
    title: 'Santorini',
    country: 'Greece',
    description: 'Iconic whitewashed houses overlooking the bright blue Aegean Sea, spectacular sunsets, and volcanic beaches.',
    costIndex: '$$$',
    rating: 4.8,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    duration: '3-5 Days'
  },
  {
    title: 'Queenstown',
    country: 'New Zealand',
    description: 'The adventure capital of the world, offering bungee jumping, jet boating, skiing, and stunning lake views.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80',
    duration: '5-7 Days'
  },
  {
    title: 'Cusco',
    country: 'Peru',
    description: 'The former capital of the Inca Empire, gateway to the legendary trail and ancient city of Machu Picchu.',
    costIndex: '$$',
    rating: 4.8,
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
    duration: '4-6 Days'
  },
  {
    title: 'Rio de Janeiro',
    country: 'Brazil',
    description: 'Vibrant city famous for Copacabana and Ipanema beaches, the Christ the Redeemer statue, and Carnival.',
    costIndex: '$$',
    rating: 4.6,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    duration: '4-5 Days'
  },
  {
    title: 'Marrakesh',
    country: 'Morocco',
    description: 'A bustling medieval city with maze-like souks, historic palaces, and spices in the marketplace.',
    costIndex: '$',
    rating: 4.6,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1597212618440-806262de474b?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  },
  {
    title: 'Phuket',
    country: 'Thailand',
    description: 'Thailand’s largest island, boasting golden sand beaches, lively nightlife, and water activities.',
    costIndex: '$',
    rating: 4.5,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    duration: '4-6 Days'
  },
  {
    title: 'Maui',
    country: 'United States',
    description: 'Hawaiian island offering scenic drives along the Road to Hana, surfing, snorkeling, and volcanic crater hikes.',
    costIndex: '$$$',
    rating: 4.8,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    duration: '5-7 Days'
  },
  {
    title: 'Kyoto',
    country: 'Japan',
    description: 'Renowned for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.',
    costIndex: '$$',
    rating: 4.9,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  },
  {
    title: 'Swiss Alps',
    country: 'Switzerland',
    description: 'Majestic snowy summits, traditional alpine villages, and world-class skiing or summer trekking paths.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=800&q=80',
    duration: '4-6 Days'
  },
  {
    title: 'Patagonia',
    country: 'Chile',
    description: 'Dramatic glaciers, turquoise lakes, and the iconic towering granite peaks of Torres del Paine National Park.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    duration: '6-8 Days'
  },
  {
    title: 'Barcelona',
    country: 'Spain',
    description: 'A seaside city with quirky architecture by Antoni Gaudí, mouth-watering tapas, and sunny city beaches.',
    costIndex: '$$',
    rating: 4.7,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&w=800&q=80',
    duration: '4-5 Days'
  },
  {
    title: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Luxury shopping, ultramodern architecture including Burj Khalifa, and a lively, high-end nightlife scene.',
    costIndex: '$$$',
    rating: 4.6,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    duration: '3-5 Days'
  },
  {
    title: 'Costa Rica',
    country: 'Central America',
    description: 'Rainforests, active volcanoes, diverse wildlife (sloths, toucans), and gorgeous beaches lining the Pacific and Caribbean.',
    costIndex: '$$',
    rating: 4.8,
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80',
    duration: '6-8 Days'
  },
  {
    title: 'Siem Reap',
    country: 'Cambodia',
    description: 'Gateway to the ruins of Angkor Wat, the massive stone temple complex built during the Khmer Empire.',
    costIndex: '$',
    rating: 4.8,
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  },
  {
    title: 'Serengeti',
    country: 'Tanzania',
    description: 'Experience the spectacular Great Migration, spotting lions, leopards, elephants, and rhinos on vast African savannas.',
    costIndex: '$$$',
    rating: 4.9,
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    duration: '5-7 Days'
  },
  {
    title: 'Ibiza',
    country: 'Spain',
    description: 'Renowned party capital with famous clubs, alongside quiet sandy coves, pine-clad hills, and historic old towns.',
    costIndex: '$$$',
    rating: 4.5,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    duration: '3-5 Days'
  },
  {
    title: 'Amalfi Coast',
    country: 'Italy',
    description: 'A stunning stretch of mountainous coastline dotted with pastel-colored villages clinging to cliffs above the Mediterranean.',
    costIndex: '$$$',
    rating: 4.8,
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    duration: '4-5 Days'
  },
  {
    title: 'Amsterdam',
    country: 'Netherlands',
    description: 'Famous canal networks, narrow gabled houses, artistic heritage at the Van Gogh museum, and bicycle-friendly streets.',
    costIndex: '$$',
    rating: 4.7,
    category: 'Urban',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    duration: '3-4 Days'
  }
];

const seedDB = async () => {
  try {
    const count = await Destination.countDocuments();
    if (count === 0) {
      console.log('No destinations found. Seeding database with dummy data...');
      await Destination.insertMany(destinations);
      console.log(`Successfully seeded ${destinations.length} travel destinations!`);
    } else {
      console.log(`Database already has ${count} destinations. Seeding skipped.`);
    }
  } catch (error) {
    console.error('Error seeding destinations:', error);
  }
};

module.exports = seedDB;
