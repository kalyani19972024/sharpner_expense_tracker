

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, expenseController.addExpense);
router.get('/', authenticate, expenseController.getAllExpenses); 
router.put('/:id', authenticate, expenseController.updateExpense);
router.delete('/:id', authenticate, expenseController.deleteExpense); 
router.get("/download", authenticate, expenseController.downloadExpense);

module.exports = router;


