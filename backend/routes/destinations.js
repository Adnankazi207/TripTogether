const express = require('express');
const router = express.Router();
const { getDestinations, getDestinationById, getDestinationTips } = require('../controllers/destController');

router.get('/', getDestinations);
router.get('/tips', getDestinationTips);
router.get('/:id', getDestinationById);

module.exports = router;
