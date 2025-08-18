
const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');

router.post('/income/add', auth, incomeController.addIncome);

module.exports = router;
