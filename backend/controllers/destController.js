const Destination = require('../models/Destination');

// Helper to generate destination data on the fly (Gemini + local smart fallbacks)
const generateDestinationData = async (cityName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  let destData = null;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const prompt = `You are a travel database assistant. Generate a travel destination profile for the city/area named "${cityName}" in JSON format. Do not write any markdown codeblock formatting or introductory text, output raw JSON only. The JSON must match this schema:
{
  "title": "${cityName}",
  "country": "Country Name",
  "category": "One of: Adventure, Beach, Cultural, Nature, Urban",
  "description": "A compelling 2-sentence tourist description of the destination.",
  "image": "An Unsplash search image URL related to the city, e.g., https://images.unsplash.com/photo-... or a general high-quality travel image",
  "rating": 4.5,
  "duration": "e.g., 3-5 Days",
  "costIndex": "One of: $, $$, $$$"
}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        }
      );

      if (geminiRes.ok) {
        const resJson = await geminiRes.json();
        let rawText = resJson.candidates[0].content.parts[0].text.trim();
        // Strip markdown if Gemini included it
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        }
        destData = JSON.parse(rawText);
      }
    } catch (err) {
      console.error('[Gemini Dest Generator Error]', err.message);
    }
  }

  // Fallback to high-quality local generator if Gemini isn't set up or fails
  if (!destData) {
    const formattedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
    
    // Smart local database rules for well-known Indian/Global cities
    let country = 'India';
    let category = 'Urban';
    let desc = `${formattedCity} is a wonderful place to visit, rich in local history, culture, and beautiful landmarks.`;
    let rating = 4.2 + Math.random() * 0.7;
    let duration = '3-5 Days';
    let costIndex = '$$';
    let image = 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=600&q=80'; // general India travel

    const lowerCity = cityName.toLowerCase();
    if (lowerCity.includes('surat')) {
      country = 'India';
      category = 'Cultural';
      desc = 'Known as the Diamond City of India, Surat is a bustling commercial center famous for diamonds, textiles, and its delectable street food cuisine.';
      image = 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=600&q=80';
      duration = '2-3 Days';
      costIndex = '$$';
    } else if (lowerCity.includes('ajmer')) {
      country = 'India';
      category = 'Cultural';
      desc = 'Surrounded by the Aravalli Mountains, Ajmer is a sacred pilgrimage town famous for the majestic Ajmer Sharif Dargah and the historic Ana Sagar Lake.';
      image = 'https://images.unsplash.com/photo-1545231027-63b3f1e991f4?auto=format&fit=crop&w=600&q=80';
      duration = '2 Days';
      costIndex = '$';
    } else if (lowerCity.includes('goa')) {
      country = 'India';
      category = 'Beach';
      desc = 'Famous for its pristine sandy beaches, active nightlife, 17th-century Portuguese cathedrals, and lush spice plantations.';
      image = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80';
      duration = '4-6 Days';
      costIndex = '$$$';
    } else if (lowerCity.includes('manali') || lowerCity.includes('shimla') || lowerCity.includes('kasol')) {
      country = 'India';
      category = 'Nature';
      desc = 'A breathtaking valley town nestled in the Himalayas, perfect for adventure trekking, paragliding, and enjoying serene snowy peaks.';
      image = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80';
      duration = '3-5 Days';
      costIndex = '$$';
    } else if (lowerCity.includes('bangalore') || lowerCity.includes('bengaluru')) {
      country = 'India';
      category = 'Urban';
      desc = 'Known as the Silicon Valley of India, Bangalore is a booming technological hub famous for its lush public parks, active craft beer culture, and pleasant year-round weather.';
      image = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80';
      duration = '3-4 Days';
      costIndex = '$$';
    } else if (lowerCity.includes('london')) {
      country = 'United Kingdom';
      category = 'Urban';
      desc = 'The historic capital of the UK, famous for Big Ben, the Tower of London, world-class museums, and beautiful royal parks.';
      image = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80';
      duration = '4-5 Days';
      costIndex = '$$$';
    } else if (lowerCity.includes('tokyo')) {
      country = 'Japan';
      category = 'Urban';
      desc = 'A futuristic metropolis blending neon skyscrapers with historic temples, cherry blossoms, and unmatched culinary experiences.';
      image = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80';
      duration = '5-7 Days';
      costIndex = '$$$';
    } else {
      // General fallbacks based on keyword matches or category mapping
      if (lowerCity.includes('beach') || lowerCity.includes('island') || lowerCity.includes('bali') || lowerCity.includes('maldives') || lowerCity.includes('goa')) {
        category = 'Beach';
        image = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
      } else if (lowerCity.includes('hill') || lowerCity.includes('mountain') || lowerCity.includes('trek') || lowerCity.includes('forest') || lowerCity.includes('nature') || lowerCity.includes('alps')) {
        category = 'Nature';
        image = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';
      } else if (lowerCity.includes('hike') || lowerCity.includes('climb') || lowerCity.includes('camp') || lowerCity.includes('adventure')) {
        category = 'Adventure';
        image = 'https://images.unsplash.com/photo-1527853787696-f7c9ed02a358?auto=format&fit=crop&w=600&q=80';
      } else if (lowerCity.includes('temple') || lowerCity.includes('history') || lowerCity.includes('museum') || lowerCity.includes('culture') || lowerCity.includes('historic')) {
        category = 'Cultural';
        image = 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80';
      } else {
        category = 'Urban';
        image = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80'; // generic modern skyline
      }
    }

    destData = {
      title: formattedCity,
      country,
      category,
      description: desc,
      image,
      rating: parseFloat(rating.toFixed(1)),
      duration,
      costIndex
    };
  }

  // Double check schema enums and bounds
  if (!['$', '$$', '$$$'].includes(destData.costIndex)) {
    destData.costIndex = '$$';
  }
  if (!['Adventure', 'Beach', 'Cultural', 'Nature', 'Urban'].includes(destData.category)) {
    destData.category = 'Urban';
  }
  if (typeof destData.rating !== 'number' || isNaN(destData.rating)) {
    destData.rating = 4.5;
  }
  
  // Format title case nicely
  destData.title = destData.title.charAt(0).toUpperCase() + destData.title.slice(1);

  return destData;
};

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
const getDestinations = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let destinations = await Destination.find(query);

    // If search is provided, but no destinations match, generate one dynamically!
    if (destinations.length === 0 && search && search.trim().length > 2) {
      const cityName = search.trim();
      const newDest = await generateDestinationData(cityName);
      
      if (newDest) {
        // Double check title unique constraint
        const existing = await Destination.findOne({ title: { $regex: new RegExp(`^${newDest.title}$`, 'i') } });
        if (existing) {
          destinations = [existing];
        } else {
          const savedDest = await Destination.create(newDest);
          destinations = [savedDest];
        }
      }
    }

    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single destination by ID
// @route   GET /api/destinations/:id
// @access  Public
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (destination) {
      res.json(destination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI cost saving tips for a city or parameter set
// @route   GET /api/destinations/tips
// @access  Public
const getDestinationTips = async (req, res) => {
  const { city, category, comfort, transit, days } = req.query;

  const apiKey = process.env.GEMINI_API_KEY;
  let tips = null;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      let prompt = '';
      if (city) {
        prompt = `You are a professional budget travel consultant. Provide 3 highly detailed, thorough, and longer bullet points explaining exactly how a traveler can save money on: 1) local transport/transit, 2) cheap eats/traditional street food spots, and 3) sightseeing/entry fees in "${city}". For each point, write a detailed paragraph (3-4 sentences) outlining practical hacks, specific locations, typical price differences in Indian Rupees (₹), and local transit card recommendations. Start each point with a relevant emoji on a new line and separate points with double newlines. Do not output markdown code blocks.`;
      } else {
        prompt = `You are a professional budget travel consultant. Provide 3 highly detailed, thorough, and longer bullet points explaining exactly how a traveler can save money on a ${comfort || 'mid'} comfort level ${category || 'Cultural'} trip lasting ${days || 7} days traveling by ${transit || 'flight'}. For each point, write a detailed paragraph (3-4 sentences) outlining money-saving hacks, typical price differences in Indian Rupees (₹), and specific recommendations matching these trip parameters. Start each point with a relevant emoji on a new line and separate points with double newlines. Do not output markdown code blocks.`;
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        }
      );

      if (geminiRes.ok) {
        const resJson = await geminiRes.json();
        tips = resJson.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.error('[Gemini Tips Error]', err.message);
    }
  }

  if (!tips) {
    // Basic fallback tips if Gemini call fails
    if (city) {
      tips = `📍 Explore local public transport options or shared shuttles instead of airport cabs.\n📍 Taste street food at local tiffin houses and vendor markets to save on meals.\n📍 Look up free walking tours and off-peak entry passes for local historic sites.`;
    } else {
      const budgetTips = {
        Beach: '🏖️ Sunscreen, beach gear, and towels are cheaper to buy locally than pay airlines baggage fees. Rental scooters offer better transport rates than private cabs.',
        Cultural: '🏛️ Look for city history passes or free museum entry days (usually Sundays). Rent local guides at historic monument entry gates for negotiable rates.',
        Urban: '🏙️ Stay slightly outside central downtown cores near metro link tracks to save on lodging. Purchase 3-day or 7-day subway transit tickets.',
        Nature: '🌲 Homestays or eco-cabins provide authentic lodging at lower rates than resorts. Pre-pack snack energy bars and camping utilities.',
        Adventure: '🧗 Rent trekking gears, tents, and boots at basecamp sites instead of checking heavy equipment baggages on commercial flights.'
      };
      tips = budgetTips[category] || `📍 Look for multi-day transit passes.\n📍 Cook simple meals or try street food markets.\n📍 Book entries online in advance to save on fees.`;
    }
  }

  res.json({ tips });
};

module.exports = {
  getDestinations,
  getDestinationById,
  getDestinationTips,
};
