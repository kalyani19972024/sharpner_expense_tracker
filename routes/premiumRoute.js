
const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const authMiddleware = require('../middleware/auth');

router.get('/leaderboard', authMiddleware, premiumController.getLeaderboard);
router.get('/status', authMiddleware, premiumController.checkPremiumStatus);

module.exports = router;
