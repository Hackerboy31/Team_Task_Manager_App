const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDashboardMetrics } = require('../controllers/dashboardController');

const router = express.Router();
router.get('/metrics', verifyToken, getDashboardMetrics);

module.exports = router;
