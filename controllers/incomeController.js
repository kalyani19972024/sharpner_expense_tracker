
// controllers/dashboardController.js
const Expense = require('../models/Expense');
const User = require('../models/User');

exports.getDashboardEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const expenses = await Expense.findAll({ where: { userId } });

    // format expenses
    const entries = expenses.map(e => ({
      date: e.createdAt.toISOString().split('T')[0],
      description: e.description,
      category: e.category,
      amount: e.amount,
      type: 'Expense'
    }));

    // add one monthly income entry from Users table
    if (user.income > 0) {
      const now = new Date();
      entries.push({
        date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,
        description: "Monthly Income",
        category: "Salary",
        amount: user.income,
        type: 'Income'
      });
    }

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load entries' });
  }
};
