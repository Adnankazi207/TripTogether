const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Trip routes
router.route('/')
  .get(protect, getTrips)
  .post(protect, createTrip);

router.post('/join', protect, joinTrip);

router.route('/:id')
  .get(protect, getTrip)
  .delete(protect, deleteTrip)
  .put(protect, updateTrip);

router.post('/:id/photos', protect, uploadPhoto);
router.post('/:id/ai-itinerary', protect, generateAIItinerary);
router.post('/:id/chat', protect, chatWithCoPilot);

// Expense routes inside a trip context
router.route('/:tripId/expenses')
  .get(protect, getExpenses)
  .post(protect, createExpense);

router.route('/:tripId/expenses/:expenseId')
  .delete(protect, deleteExpense);

module.exports = router;
