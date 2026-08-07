const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Destination = require('../models/Destination');

// Helper to generate a unique 6-character uppercase alphanumeric code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to check if a user has collaborative access to a trip
const isAuthorized = (trip, userId) => {
  if (!trip) return false;
  const ownerId = trip.user && trip.user._id ? trip.user._id.toString() : (trip.user ? trip.user.toString() : '');
  const isMember = trip.members && trip.members.some(m => {
    if (!m) return false;
    const memberId = m._id ? m._id.toString() : m.toString();
    return memberId === userId;
  });
  return ownerId === userId || isMember;
};

// ==========================================
// TRIP CONTROLLERS
// ==========================================

// @desc    Get user's trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ $or: [{ user: req.user.id }, { members: req.user.id }] })
      .populate('destination')
      .sort({ startDate: 1 }); // Sort by upcoming trips
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { destinationId, startDate, endDate, budget, notes, customDestination } = req.body;

    if (!startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'Please provide all required dates and budget' });
    }

    let finalDestinationId = destinationId;

    // If custom destination is requested, find or create it
    if (!finalDestinationId && customDestination) {
      const { title, country, category, image } = customDestination;
      
      if (!title || !category) {
        return res.status(400).json({ message: 'Custom destination requires a name and category' });
      }

      // Default high-quality travel images based on category
      const defaultImages = {
        Beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        Nature: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
        Adventure: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=800&q=80',
        Cultural: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
        Urban: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80'
      };

      const destImage = image || defaultImages[category] || defaultImages['Urban'];

      // Find if destination already exists (case-insensitive)
      let destination = await Destination.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
      
      if (!destination) {
        destination = await Destination.create({
          title: title.trim(),
          country: (country || 'Unknown').trim(),
          category,
          image: destImage,
          rating: 4.8,
          description: `A beautiful travel plan to ${title.trim()} (${(country || 'Unknown').trim()}). Explore local cultural heritage, urban environments, scenic sights, and enjoy custom adventures.`
        });
      }
      
      finalDestinationId = destination._id;
    }

    if (!finalDestinationId) {
      return res.status(400).json({ message: 'A valid destination or custom destination is required' });
    }

    // Verify destination exists
    const destination = await Destination.findById(finalDestinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Selected destination does not exist' });
    }

    let inviteCode = generateInviteCode();
    let codeExists = await Trip.findOne({ inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Trip.findOne({ inviteCode });
    }

    const trip = await Trip.create({
      user: req.user.id,
      destination: finalDestinationId,
      startDate,
      endDate,
      budget,
      notes,
      inviteCode,
      members: [req.user.id],
    });

    // Populate destination details to send back to frontend
    const populatedTrip = await Trip.findById(trip._id).populate('destination');

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a trip and its expenses
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Make sure trip belongs to logged in user
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete all associated expenses first
    await Expense.deleteMany({ trip: trip._id });
    
    // Delete the trip
    await Trip.findByIdAndDelete(trip._id);

    res.json({ message: 'Trip and associated expenses removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('destination')
      .populate('members', 'name email')
      .populate('user', 'name email');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Lazy generation for older trips that do not have invite codes or members
    let needsSave = false;
    if (!trip.inviteCode) {
      let inviteCode = generateInviteCode();
      let codeExists = await Trip.findOne({ inviteCode });
      while (codeExists) {
        inviteCode = generateInviteCode();
        codeExists = await Trip.findOne({ inviteCode });
      }
      trip.inviteCode = inviteCode;
      needsSave = true;
    }

    if (!trip.members || trip.members.length === 0) {
      const ownerId = trip.user && trip.user._id ? trip.user._id : trip.user;
      trip.members = [ownerId];
      needsSave = true;
    }

    if (needsSave) {
      await trip.save();
      await trip.populate('members', 'name email');
      await trip.populate('user', 'name email');
    }

    const tripObj = trip.toObject();

    // Fetch live weather from OpenWeatherMap if title is set and API key is loaded
    const city = trip.destination?.title;
    const apiKey = process.env.WEATHER_API_KEY;
    if (city && apiKey && apiKey !== 'your_openweathermap_api_key_here') {
      try {
        // 1. Fetch current weather
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          tripObj.liveWeather = {
            temp: Math.round(weatherData.main.temp),
            skies: weatherData.weather[0].main,
            desc: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            wind: weatherData.wind.speed,
            iconCode: weatherData.weather[0].icon,
          };
        }

        // 2. Fetch 5-day forecast
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          const dailyForecasts = [];
          for (let i = 0; i < forecastData.list.length; i += 8) {
            const item = forecastData.list[i];
            dailyForecasts.push({
              date: item.dt_txt,
              temp: Math.round(item.main.temp),
              temp_min: Math.round(item.main.temp_min),
              temp_max: Math.round(item.main.temp_max),
              skies: item.weather[0].main,
              desc: item.weather[0].description,
              humidity: item.main.humidity,
              wind: item.wind.speed,
              iconCode: item.weather[0].icon,
            });
          }
          tripObj.liveForecast = dailyForecasts;
        }
      } catch (weatherErr) {
        console.error('[Weather API Error]', weatherErr.message);
      }
    }

    // Fallback Mock Forecast Generation if OpenWeatherMap forecast fetch failed or key is missing
    if (!tripObj.liveForecast) {
      const mockPics = {
        Beach: { skies: 'Sunny', temp: 31, icon: '☀️', desc: 'clear sky' },
        Nature: { skies: 'Clear', temp: 19, icon: '☀️', desc: 'scattered clouds' },
        Adventure: { skies: 'Cloudy', temp: 16, icon: '☁️', desc: 'broken clouds' },
        Cultural: { skies: 'Partly Cloudy', temp: 22, icon: '⛅', desc: 'few clouds' },
        Urban: { skies: 'Overcast', temp: 24, icon: '🌥️', desc: 'overcast clouds' },
      };
      const catInfo = mockPics[trip.destination?.category] || mockPics['Urban'];
      
      const mockDays = [];
      const startDate = new Date(trip.startDate);
      for (let i = 0; i < 5; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        mockDays.push({
          date: d.toISOString(),
          temp: catInfo.temp + (i % 2 === 0 ? i : -i),
          skies: catInfo.skies,
          desc: catInfo.desc,
          humidity: 60 + i * 2,
          wind: 3.5 + i * 0.5,
          mockIcon: catInfo.icon,
        });
      }
      tripObj.liveForecast = mockDays;
    }

    res.json(tripObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a trip (itinerary, packing list, notes, budget)
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { budget, notes, itinerary, packingList, startDate, endDate, customDestination } = req.body;

    if (budget !== undefined) trip.budget = budget;
    if (notes !== undefined) trip.notes = notes;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (itinerary !== undefined) trip.itinerary = itinerary;
    if (packingList !== undefined) trip.packingList = packingList;

    if (customDestination) {
      const { title, country, category, image } = customDestination;
      const dest = await Destination.findById(trip.destination);
      if (dest) {
        if (title !== undefined) dest.title = title.trim();
        if (country !== undefined) dest.country = (country || 'Unknown').trim();
        if (category !== undefined) dest.category = category;
        if (image !== undefined && image) dest.image = image;
        await dest.save();
      }
    }

    const updatedTrip = await trip.save();
    
    // Populate destination details to send back to frontend
    const populatedTrip = await Trip.findById(updatedTrip._id).populate('destination');

    res.json(populatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// EXPENSE CONTROLLERS
// ==========================================

// @desc    Get all expenses for a specific trip
// @route   GET /api/trips/:tripId/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Make sure trip belongs to user
    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const expenses = await Expense.find({ trip: req.params.tripId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an expense to a trip
// @route   POST /api/trips/:tripId/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const tripId = req.params.tripId;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check ownership
    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const expense = await Expense.create({
      trip: tripId,
      title,
      amount,
      category,
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/trips/:tripId/expenses/:expenseId
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    // Verify trip ownership
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Double check that expense belongs to the trip
    if (expense.trip.toString() !== tripId) {
      return res.status(400).json({ message: 'Expense does not belong to this trip' });
    }

    await Expense.findByIdAndDelete(expenseId);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a trip by invite code
// @route   POST /api/trips/join
// @access  Private
const joinTrip = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const trip = await Trip.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip room not found' });
    }

    const alreadyMember = trip.user.toString() === req.user.id || (trip.members && trip.members.some(m => m.toString() === req.user.id));
    
    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    trip.members.push(req.user.id);
    await trip.save();

    const populated = await Trip.findById(trip._id).populate('destination');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/add a photo to a shared trip gallery
// @route   POST /api/trips/:id/photos
// @access  Private
const uploadPhoto = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Photo URL is required' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    trip.photos.push({
      url,
      uploadedBy: req.user.name || 'Friend',
    });

    const updatedTrip = await trip.save();
    res.status(201).json(updatedTrip.photos[updatedTrip.photos.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI Itinerary suggestions using Google Gemini 1.5 Flash
// @route   POST /api/trips/:id/ai-itinerary
// @access  Private
const generateAIItinerary = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('destination');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const city = trip.destination?.title || 'Destination';
    const country = trip.destination?.country || 'Unknown';
    const category = trip.destination?.category || 'Urban';
    
    const s = new Date(trip.startDate);
    const e = new Date(trip.endDate);
    const diff = Math.abs(e - s);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    const apiKey = process.env.GEMINI_API_KEY;

    let aiResponseText = null;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `Suggest a day-by-day travel itinerary for a ${days}-day trip to ${city} (${country}). The trip category is ${category}. Return a JSON array of objects representing days. Each day should contain a "day" number and a list of "activities". Each activity must have "time" (e.g., "10:00 AM"), "activity" name, and "desc" description. Format strictly as JSON without markdown wrappers or other commentary.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiResponseText = geminiData.candidates[0].content.parts[0].text;
        }
      } catch (geminiErr) {
        console.error('[Gemini API Error]', geminiErr.message);
      }
    }

    let parsedItinerary = null;

    if (aiResponseText) {
      try {
        parsedItinerary = JSON.parse(aiResponseText.trim());
      } catch (parseErr) {
        console.error('[AI JSON Parse Error] raw text:', aiResponseText);
      }
    }

    if (!parsedItinerary) {
      const cityDb = {
        surat: [
          { time: '09:00 AM', activity: 'Explore Surat Castle (Old Fort)', desc: 'Discover the rich historical fortress built on the Tapi River bank.' },
          { time: '01:30 PM', activity: 'Lunch at Ring Road & Gopi Talav', desc: 'Indulge in Surti delicacies like Locho and Ghari by the scenic lake gardens.' },
          { time: '05:00 PM', activity: 'Dumas Beach Sunset Walk', desc: 'Stroll along the unique black sand beach and taste local spicy tomato bhajiya.' },
          { time: '09:00 AM', activity: 'Sarthana Nature Park & Zoo', desc: 'Spot local wildlife and migratory birds along the nature trails.' },
          { time: '02:00 PM', activity: 'Science Centre & Aquarium visit', desc: 'Explore interactive museums and the multi-species marine aquarium.' },
          { time: '06:00 PM', activity: 'Shop at Textile Market & Dutch Garden', desc: 'Purchase famous Surti silk and relax in the beautiful Dutch cemetery gardens.' }
        ],
        ajmer: [
          { time: '09:00 AM', activity: 'Visit holy Ajmer Sharif Dargah', desc: 'Pay respects at the world-renowned shrine of Khwaja Moinuddin Chishti.' },
          { time: '01:00 PM', activity: 'Explore Adhai Din Ka Jhonpra', desc: 'Admire the ancient ruins and remarkable Indo-Islamic architectural pillars.' },
          { time: '04:30 PM', activity: 'Ana Sagar Lake Boating', desc: 'Sail during golden hour and relax around the beautiful Daulat Bagh pavilions.' },
          { time: '09:30 AM', activity: 'Taragarh Fort Hike', desc: 'Walk up the steep hill to explore one of India\'s oldest hill fort ruins.' },
          { time: '02:00 PM', activity: 'Nareli Jain Temple Sightseeing', desc: 'Admire the modern marble architecture and multiple shrines on the hillside.' },
          { time: '07:00 PM', activity: 'Dine at local Rajasthani dhaba', desc: 'Enjoy authentic Dal Baati Churma and local sweet Lassi.' }
        ],
        delhi: [
          { time: '09:30 AM', activity: 'Visit Red Fort & Jama Masjid', desc: 'Explore Shah Jahan\'s majestic red sandstone palace and India\'s largest mosque.' },
          { time: '01:30 PM', activity: 'Street Food Feast in Chandni Chowk', desc: 'Taste legendary Paranthe, Chaat, and Jalebi in old Delhi\'s lanes.' },
          { time: '05:00 PM', activity: 'India Gate & Rajpath Walk', desc: 'Pay respects at the war memorial and view the illuminated Rashtrapati Bhavan.' },
          { time: '09:00 AM', activity: 'Qutub Minar & Mehrauli Archeological Park', desc: 'Admire the tallest brick minaret in the world and ruins from Delhi sultanates.' },
          { time: '02:00 PM', activity: 'Lotus Temple & Humayun\'s Tomb', desc: 'Visit the architectural masterpiece tomb and the serene Bahai house of worship.' },
          { time: '07:00 PM', activity: 'Shop & Dine at Connaught Place', desc: 'Explore the Georgian-style circular avenues, designer stores, and trendy cafes.' }
        ],
        paris: [
          { time: '09:00 AM', activity: 'Eiffel Tower Summit Access', desc: 'Take the elevator to the top floor for breathtaking panoramic views of Paris.' },
          { time: '01:00 PM', activity: 'Louvre Museum Tour', desc: 'Skip the line to see the Mona Lisa, Winged Victory, and ancient relics.' },
          { time: '05:30 PM', activity: 'Seine River Cruise & Notre-Dame', desc: 'Sail past historic bridges and admire the gothic architecture of the cathedral.' },
          { time: '10:00 AM', activity: 'Walk the Champs-Élysées & Arc de Triomphe', desc: 'Explore the famous shopping avenue and climb the arch for central views.' },
          { time: '02:00 PM', activity: 'Montmartre & Sacré-Cœur Basilica', desc: 'Stroll the cobblestone streets of the artists\' quarter and visit the white basilica.' },
          { time: '07:30 PM', activity: 'Bistro Dinner in Saint-Germain-des-Prés', desc: 'Savor classic French cuisine (steak frites, crème brûlée) in a historic cafe.' }
        ]
      };

      const cityKey = city.trim().toLowerCase();
      let dayActivitiesSource = [];

      if (cityDb[cityKey]) {
        dayActivitiesSource = cityDb[cityKey];
      } else {
        const templates = {
          Beach: [
            { time: '09:00 AM', activity: `Morning Swim at ${city} Coast`, desc: `Enjoy early warm waves and sunbathing on the beach of ${city}.` },
            { time: '01:30 PM', activity: `${city} Oceanfront Lunch`, desc: 'Savor fresh grilled seafood catches of the day.' },
            { time: '05:30 PM', activity: 'Sunset Catamaran Cruise', desc: `Sail along the coastline of ${city} to watch a scenic sunset.` }
          ],
          Nature: [
            { time: '08:30 AM', activity: `${city} Mountain Trail Hike`, desc: `Follow scenic wilderness trails to lookouts over ${city}.` },
            { time: '01:30 PM', activity: 'Lakefront Forest Picnic', desc: 'Unwind under canopy shades with locally packed fresh bites.' },
            { time: '06:00 PM', activity: 'Campfire & Local Stargazing', desc: 'Observe clear night constellations and tell stories by the fire.' }
          ],
          Adventure: [
            { time: '09:00 AM', activity: `Extreme Sports in ${city}`, desc: `Try high-altitude ziplining, climbing, or rafting around ${city}.` },
            { time: '02:00 PM', activity: 'Off-Road ATV Expedition', desc: `Ride rugged trails through the wild terrain of ${city}.` },
            { time: '07:00 PM', activity: 'Geothermal hot springs soak', desc: 'Relax and soothe muscles in natural thermal pools.' }
          ],
          Cultural: [
            { time: '09:30 AM', activity: `Tour of Historic ${city} Landmarks`, desc: `Explore ancient heritage temples, monuments, and palaces of ${city}.` },
            { time: '02:00 PM', activity: `${city} Local Art Museum`, desc: 'Admire traditional paintings, historical artifacts, and craft workshops.' },
            { time: '07:30 PM', activity: `Traditional Folk Show & Dinner`, desc: `Experience cultural dances while tasting authentic ${city} cuisine.` }
          ],
          Urban: [
            { time: '10:00 AM', activity: `Downtown ${city} Walking Tour`, desc: `Discover modern architecture, main avenues, and shopping districts of ${city}.` },
            { time: '01:30 PM', activity: `Cafe Hopping in Old Town ${city}`, desc: 'Taste artisanal coffees and regional snacks in popular neighborhood cafes.' },
            { time: '07:30 PM', activity: `Rooftop Dinner overlooking ${city}`, desc: `Savor premium dining with panoramic views of the ${city} skyline.` }
          ]
        };
        dayActivitiesSource = templates[category] || templates['Urban'];
      }

      parsedItinerary = [];
      const itemsPerDay = 3;
      for (let d = 1; d <= days; d++) {
        const dayActivities = [];
        for (let i = 0; i < itemsPerDay; i++) {
          const srcIdx = ((d - 1) * itemsPerDay + i) % dayActivitiesSource.length;
          const act = dayActivitiesSource[srcIdx];
          dayActivities.push({
            time: act.time,
            activity: act.activity,
            desc: act.desc
          });
        }
        parsedItinerary.push({ day: d, activities: dayActivities });
      }
    }

    res.json(parsedItinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with AI Co-Pilot for a specific trip
// @route   POST /api/trips/:id/chat
// @access  Private
const chatWithCoPilot = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const trip = await Trip.findById(req.params.id).populate('destination');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const city = trip.destination?.title || 'Destination';
    const country = trip.destination?.country || 'Unknown';
    const category = trip.destination?.category || 'Urban';
    const s = new Date(trip.startDate);
    const e = new Date(trip.endDate);
    const diff = Math.abs(e - s);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    const apiKey = process.env.GEMINI_API_KEY;

    let aiResponseText = null;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const systemPrompt = `You are Antigravity, a professional AI travel co-pilot for TripTogether. The user is asking about their upcoming trip to ${city} (${country}), which is a ${days}-day ${category} trip. Answer user queries contextually, suggesting routes, packing tips, places to visit, and local foods. Use clear formatting, bullet points, and maintain a friendly and enthusiastic tone. Keep your responses relatively concise.`;

        // Format history for Gemini API from the client request
        const contents = [];
        if (history && history.length > 0) {
          history.forEach(msg => {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          });
        }
        
        // Add current user query
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiResponseText = geminiData.candidates[0].content.parts[0].text;
        } else {
          console.error('[Gemini API Response Error]', await geminiRes.text());
        }
      } catch (geminiErr) {
        console.error('[Gemini Chat Error]', geminiErr.message);
      }
    }

    // Fallback response generator if Gemini failed or isn't set up
    if (!aiResponseText) {
      const lowerMsg = message.toLowerCase();
      const cityKey = city.toLowerCase().trim();

      if (lowerMsg.includes('route') || lowerMsg.includes('transit') || lowerMsg.includes('how to reach') || lowerMsg.includes('go to')) {
        if (cityKey.includes('surat')) {
          aiResponseText = `🗺️ **Best Routes & Transit for Surat:**\n\n* **By Air:** Surat International Airport (STV) is well-connected to major Indian cities. Alternatively, fly to Mumbai (BOM) and take a 3-hour train.\n* **By Train:** Surat Railway Station is a major junction on the Western Railway zone. Superfast trains like Shatabdi and Vande Bharat connect it to Mumbai, Ahmedabad, and Delhi.\n* **Local Commute:** Use auto-rickshaws, app-based cabs (Uber/Ola), or the clean BRTS bus network to travel within the city.`;
        } else if (cityKey.includes('ajmer')) {
          aiResponseText = `🗺️ **Best Routes & Transit for Ajmer:**\n\n* **By Air:** The nearest airport is Kishangarh Airport (25 km away), or Jaipur International Airport (135 km away). Take a taxi or bus from Jaipur.\n* **By Train:** Ajmer Junction is highly connected. Superfast trains (including Shatabdi and Vande Bharat) link it directly to Delhi, Jaipur, Ahmedabad, and Mumbai.\n* **Local Commute:** Cycle-rickshaws and auto-rickshaws are the most convenient ways to navigate the busy narrow alleys around Dargah Bazaar.`;
        } else if (cityKey.includes('delhi')) {
          aiResponseText = `🗺️ **Best Routes & Transit for Delhi:**\n\n* **By Air:** Indira Gandhi International Airport (DEL) is one of the largest global hubs.\n* **By Train:** NDLS (New Delhi), ODLS (Old Delhi), and HNZM (Hazrat Nizamuddin) stations connect to all of India.\n* **Local Commute:** Use the **Delhi Metro**—it is fast, air-conditioned, and covers almost every tourist attraction. Taxis and autos are also widely available.`;
        } else if (cityKey.includes('paris')) {
          aiResponseText = `🗺️ **Best Routes & Transit for Paris:**\n\n* **By Air:** Charles de Gaulle (CDG) or Orly (ORY) airports. Take the RER B train to enter the city center.\n* **Local Metro:** The Paris Métro is exceptionally dense and fast. Purchase a *Navigo* card or day-pass.\n* **Walking & Cycling:** Paris is highly pedestrian-friendly. Rent a *Vélib'* public share bike for a scenic cruise.`;
        } else {
          aiResponseText = `🗺️ **Transit Advice for ${city}:**\n\n* **By Air/Train:** Search for the nearest terminal/junction. Booking tickets at least 3 weeks early is recommended.\n* **Local Travel:** Rely on licensed local taxis or public transport. Always download offline Google Maps of the area beforehand.`;
        }
      } else if (lowerMsg.includes('place') || lowerMsg.includes('visit') || lowerMsg.includes('sight') || lowerMsg.includes('see')) {
        if (cityKey.includes('surat')) {
          aiResponseText = `🏛️ **Top Attractions in Surat:**\n\n1. **Surat Castle (Old Fort):** Built in the 16th century, offering great historical insights.\n2. **Dumas Beach:** Famous for its unique black sand and delicious street food stalls.\n3. **Gopi Talav:** A beautiful lake urban park perfect for boating and evening light shows.\n4. **Dutch Garden:** Ancient cemetery gardens displaying grand colonial mausoleums.`;
        } else if (cityKey.includes('ajmer')) {
          aiResponseText = `🏛️ **Top Attractions in Ajmer:**\n\n1. **Ajmer Sharif Dargah:** The magnificent, peaceful shrine of Sufi saint Moinuddin Chishti.\n2. **Ana Sagar Lake:** A huge artificial lake surrounded by scenic marble pavilions (Baradari).\n3. **Adhai Din Ka Jhonpra:** A historic mosque showing intricate carved pillars.\n4. **Taragarh Fort:** Ruins on top of the hill offering stunning vistas of the entire city.`;
        } else if (cityKey.includes('delhi')) {
          aiResponseText = `🏛️ **Top Attractions in Delhi:**\n\n1. **Red Fort & Qutub Minar:** Iconic monuments detailing the Mughal and Sultanate eras.\n2. **Humayun's Tomb:** A gorgeous garden tomb that inspired the Taj Mahal.\n3. **Lotus Temple:** A beautiful lotus-shaped Bahai house of worship.\n4. **Chandni Chowk:** A bustling bazaar offering sensory street walks and ancient markets.`;
        } else if (cityKey.includes('paris')) {
          aiResponseText = `🏛️ **Top Attractions in Paris:**\n\n1. **Eiffel Tower:** The iconic iron lattice tower; book summit tickets in advance!\n2. **Louvre Museum:** The world's largest art museum, home to the Mona Lisa.\n3. **Sacré-Cœur & Montmartre:** High-altitude white basilica overlooking a bohemian artist district.\n4. **Seine River Cruise:** Best enjoyed at night when the city landmarks light up.`;
        } else {
          aiResponseText = `🏛️ **Top Suggestions for ${city}:**\n\nSince this is a **${category}** trip, you should:\n* Search for top-rated historical monuments or natural viewpoints in ${city}.\n* Check out walking tours of the old town/city center.\n* Visit the central public parks or scenic spots during sunset.`;
        }
      } else if (lowerMsg.includes('food') || lowerMsg.includes('eat') || lowerMsg.includes('dine') || lowerMsg.includes('dish')) {
        if (cityKey.includes('surat')) {
          aiResponseText = `🍔 **Must-Try Cuisine in Surat:**\n\n* **Surti Locho:** A steamed, spicy chickpea flour snack topped with sev and green chutney.\n* **Undhiyu:** A rich vegetable casserole cooked upside down in earthen pots.\n* **Ghari:** A sweet dessert made of puri dough, mawa, pistachios, and ghee.\n* **Dumas Tomato Bhajiya:** Hot, spicy tomato fritters served on the beach.`;
        } else if (cityKey.includes('ajmer')) {
          aiResponseText = `🍔 **Must-Try Cuisine in Ajmer:**\n\n* **Sohan Halwa:** A rich, sticky, nut-filled traditional sweet Ajmer is famous for.\n* **Dal Baati Churma:** The ultimate Rajasthani meal of lentils, baked wheat balls, and sweet crumbs.\n* **Kadhi Kachori:** Crispy fried pastries crushed and topped with spicy yogurt curry.\n* **Mughlai Dishes:** Delicious Biryani and kebabs around the Dargah lanes.`;
        } else if (cityKey.includes('delhi')) {
          aiResponseText = `🍔 **Must-Try Cuisine in Delhi:**\n\n* **Butter Chicken:** The creamy, tomato-based classic invented right in Delhi (Moti Mahal).\n* **Chole Bhature:** Fluffy fried bread served with spicy chickpeas.\n* **Chandni Chowk Chaat:** Tangy golgappas, dahi bhalla, and aloo tikki.\n* **Paranthas:** Visit Gali Paranthe Wali in Old Delhi for deep-fried stuffed flatbreads.`;
        } else if (cityKey.includes('paris')) {
          aiResponseText = `🍔 **Must-Try Cuisine in Paris:**\n\n* **Croissants & Pain au Chocolat:** Freshly baked from a neighborhood *Boulangerie*.\n* **Steak Frites:** Sizzling steak served with golden French fries in a traditional bistro.\n* **Macarons:** Delicate almond meringue cookies from Ladurée or Pierre Hermé.\n* **Crêpes:** Thin pancakes filled with Nutella or ham-and-cheese from street stalls.`;
        } else {
          aiResponseText = `🍔 **Local Cuisine in ${city}:**\n\n* Search for the signature regional dish of ${city}.\n* Visit local food streets or night markets for authentic flavors.\n* Check out high-rated traditional diners for a complete cultural meal.`;
        }
      } else if (lowerMsg.includes('pack') || lowerMsg.includes('bag') || lowerMsg.includes('checklist') || lowerMsg.includes('clothing')) {
        aiResponseText = `🎒 **Packing Tips for your ${days}-day ${category} trip to ${city}:**\n\n1. **Comfortable Footwear:** Essential for walking tours, historical trails, or transit stations.\n2. **Weather-appropriate Clothing:** Pack lightweight cottons for summer/humid beach trips, or layers/sweaters for cool evenings.\n3. **Power Bank & Adapters:** Keep your phone fully charged for photos, translation, and GPS navigation.\n4. **Mini First-Aid & Hydration:** Keep a reusable water bottle and essential medicines handy.`;
      } else if (lowerMsg.includes('weather') || lowerMsg.includes('temp') || lowerMsg.includes('rain') || lowerMsg.includes('hot') || lowerMsg.includes('cold') || lowerMsg.includes('season')) {
        aiResponseText = `☀️ **Weather Advice for ${city}:**\n\n* Check the local forecast before departing. Since this is a **${category}** trip, weather changes can impact outdoor activities.\n* Bring appropriate gear: an umbrella or raincoat if traveling during monsoon seasons, or high SPF sunscreen and sunglasses for warm sunny regions.`;
      } else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay') || lowerMsg.includes('resort') || lowerMsg.includes('hostel') || lowerMsg.includes('accommodation')) {
        aiResponseText = `🏨 **Accommodation suggestions for ${city}:**\n\n* **Location is Key:** Choose lodging close to the city center or near a subway/transit hub to minimize commute time.\n* **Read reviews:** Make sure your hotel has 24/7 check-in, free Wi-Fi, and positive feedback from other travelers.\n* For a **${category}** trip, look for stays that match your style (e.g. cozy beachfront stays, mountain cabins, or boutique urban rooms).`;
      } else if (lowerMsg.includes('shop') || lowerMsg.includes('market') || lowerMsg.includes('buy') || lowerMsg.includes('souvenir')) {
        aiResponseText = `🛍️ **Shopping guide for ${city}:**\n\n* **Local Markets:** Visit the central bazaars and street markets of ${city} for authentic handcrafts, textiles, and spices.\n* **Bargaining:** When visiting street stalls, friendly bargaining is common practice. Start at 60-70% of the quoted price.\n* **Souvenirs:** Look for local specialties (like Surti sarees in Surat, Rajasthani crafts in Ajmer, or Parisian perfumes in Paris).`;
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('help') || lowerMsg.includes('who are you')) {
        aiResponseText = `🤖 **Hello! I am your AI Travel Co-Pilot.**\n\nI am ready to help you with your upcoming **${days}-day** trip to **${city}**!\n\nAsk me anything! For example:\n* 🗺️ *"What are the best routes to reach ${city}?"*\n* 🏛️ *"What are the top places to visit in ${city}?"*\n* 🍔 *"What local foods should I try?"*\n* 🎒 *"What should I pack for this trip?"*\n* ☀️ *"What is the weather like?"*`;
      } else {
        // Dynamic advice fallback for any general query
        aiResponseText = `🤖 **AI Co-Pilot advice for ${city}:**\n\nI am running in travel assistant mode for your trip to ${city}.\n\nWhile I am specialized in local attractions, packing lists, transit routes, and local cuisine, here is some general advice:\n* Since this is a **${category}** adventure, prioritize activities that align with this vibe (e.g., booking local outdoor gear, historical tours, or central city rentals).\n* Always check regional tourist offices for seasonal festivals or entry timings.\n* Feel free to ask me more specific questions about transit, food, attractions, or packing!`;
      }
    }

    res.json({ text: aiResponseText });
  } catch (error) {
    console.error('[Co-Pilot Error Stack]', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/share user's live location
// @route   POST /api/trips/:id/location
// @access  Private
const updateLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Initialize locations array if it doesn't exist
    if (!trip.locations) {
      trip.locations = [];
    }

    // Check if user already sharing location
    const existingIndex = trip.locations.findIndex(
      (loc) => loc.user.toString() === req.user.id
    );

    if (existingIndex > -1) {
      // Update existing
      trip.locations[existingIndex].latitude = latitude;
      trip.locations[existingIndex].longitude = longitude;
      trip.locations[existingIndex].updatedAt = Date.now();
    } else {
      // Push new
      trip.locations.push({
        user: req.user.id,
        userName: req.user.name || 'Group Member',
        latitude,
        longitude,
        updatedAt: Date.now(),
      });
    }

    await trip.save();
    res.json(trip.locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stop sharing live location
// @route   DELETE /api/trips/:id/location
// @access  Private
const stopSharingLocation = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!isAuthorized(trip, req.user.id)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (trip.locations) {
      trip.locations = trip.locations.filter(
        (loc) => loc.user.toString() !== req.user.id
      );
      await trip.save();
    }

    res.json(trip.locations || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrips,
  createTrip,
  deleteTrip,
  updateTrip,
  getTrip,
  getExpenses,
  createExpense,
  deleteExpense,
  joinTrip,
  uploadPhoto,
  generateAIItinerary,
  chatWithCoPilot,
  updateLiveLocation,
  stopSharingLocation,
};
