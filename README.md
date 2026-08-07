# TripTogether - Complete Travel Planner Web App

Welcome to **TripTogether**! This is a premium travel planning web application built using the MERN stack (MongoDB, Express, React, Node.js). It helps to user plan trips, calculate budgets in Indian Rupees (₹), collaborate with friends in real-time, and get smart cost-saving tips powered by Gemini AI.

Below is the detailed explaining of each and every functionality of the website.

---

## Core Website Functionalities

### 1. Landing Home Page & Interactive UI
The landing page of TripTogether is designed to be extremely premium and SaaS-like. It have beautiful colors, modern typography, and smooth transitions that attracts the user attention.
* **3D Perspective Tilts**: The key feature cards uses 3D perspective wraps. When you hover the mouse near a card, it tilts slightly in 3D space (`rotateX` and `rotateY`) and glows with a subtle shadow highlight.
* **Parallax Zoom Cards**: In the "Trending Escapes" section, hovering over destination cards makes the Unsplash photos zoom slowly (`scale(1.08)`), making the page feel responsive and alive.
* **Responsive Layout**: The entire home page is fully formatted for mobile and tablet screens. On mobile, the search bar wraps vertically and the dashboard statistics stack nicely so nothing overflows.

### 2. Advanced Travel Budget Planner (in Rupees ₹)
This page is a highly logical financial tool that helps you calculate all estimated costs before you decide to book a trip.
* **Currency**: All rates and outputs are calculated and displayed in Indian Rupees (₹), not dollars, which is very helpful for Indian travelers.
* **Comfort Tiers**: Pre-set defaults are available for Budget (~₹3,200/day), Mid-Range (~₹9,400/day), and Luxury (~₹32,500/day) trip styles.
* **Custom Allowances Toggle**: If the user wants to fine-tune daily rates, they can check the "Enable Manual Adjustments" box. This opens 4 range sliders to customize the exact daily cost for Lodging, Food, Local Transport, and Activities.
* **Mode of Transit Selector**: Users can choose between Flight, Train, or Car. 
  * If Flight or Train is selected, it multiplies the ticket cost per traveler.
  * If Car is selected, it treats it as a flat fuel/rental cost shared for the whole group, which is very logical!
* **Download PDF Summary**: Instead of copying text, users can click the "Download PDF Summary" button. This dynamically generates a premium, clean PDF report containing a crimson header band, overview parameters grid, alternating table rows, and a formatted AI Tips card. Emojis are automatically sanitized to prevent PDF font rendering bugs.

### 3. City Search & Dynamic AI Cost-Saving Tips
Inside the budget planner, you do not have to plan by generic categories. You can lookup specific areas.
* **Gemini Auto-Seeding**: Type any city (e.g. Bangalore, Manali, Geneva, Paris) in the search bar. If the city is new, our backend fetches destination information, categories, and matching Unsplash photos using Gemini AI, then saves it to the database automatically.
* **Dynamic AI Tips**: When you change your stay duration, category, comfort level, transit mode, or city, a `useEffect` hook triggers a request to `/api/destinations/tips`. It calls Gemini AI to return 3 highly detailed, longer bullet points (3-4 sentences each) explaining exactly how to save money on local transport, cheap eats, and sightseeing in that specific area. You can also click the "Refresh" button to fetch new tips.

### 4. Trips Planner Dashboard & Edit Trip Details
The Dashboard is the central hub where you manage your planned trips and join group rooms.
* **Trip Creation**: Create custom trips by defining the destination name, country, category, start date, end date, budget limit, image (upload base64 file or paste URL), and itinerary notes.
* **✏️ Edit Details Button**: If you are the owner of the trip, you will see an "Edit Details" button. Clicking this opens the modal pre-filled with the current trip parameters. You can save changes to budget, notes, dates, or destination name, which updates the database via a `PUT` request.
* **Budget Status Meters**: A progress bar shows how much you spent against your total budget. It lights up green (Safe), yellow (Caution: >75% used), or red (Alert: Over budget).
* **Invite Codes**: Every trip generates a unique 6-character room code (e.g. AJM-X12). Copy and share this code with friends so they can join your trip room.

### 5. Live Collaboration Rooms & Itinerary Timelines
Once you click "Manage Trip", you enter the collaborative workspace.
* **Daily Timeline**: Add scheduled events, boarding times, hotel check-ins, and local tour notes.
* **Group Checklists**: Add packing list items or flight tasks. Group members can check items off live.
* **Collaborative Photo Gallery**: Upload travel pictures directly into a shared gallery.
* **Expense Manager**: Log category expenses (Food, Lodging, Transit). The total is updated dynamically on the dashboard.

---
