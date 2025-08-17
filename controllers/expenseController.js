const User = require('../models/User');
const Expense = require('../models/Expense');
const  sequelize  = require('../utils/db');




// ✅ Add Expense
exports.addExpense = async (req, res) => {
  const { amount, description, category,note } = req.body;
  const userId = req.user.id; // From token
  const t = await sequelize.transaction(); // Start a transaction
  
  try {
    const expense = await Expense.create({ amount, description, category, note,UserId: userId },{transaction:t});
     console.log("expense created",expense.amount,expense.id);
    const user = await User.findByPk(userId,{transaction:t});
    console.log("****users found",user.id);
    const updatedTotal = (user.totalExpense || 0) + Number(amount);
   
    await User.update({ totalExpense: updatedTotal }, { where: { id: userId }, transaction: t });

    await t.commit();
     res.status(201).json({ expense, totalExpense: updatedTotal});
  } catch (error) {
    await t.rollback();
    console.error('Transaction failed:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// ✅ Get All Expenses of Logged-in User
exports.getAllExpenses = async (req, res) => {
  const userId = req.user.id;
//console.log('req.user:', req.user);

  try {
    console.log('Fetching expenses for userId:', userId);
    const expenses = await Expense.findAll({ where: { userId } });
    console.log('Expenses found:', expenses);
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// ✅ Update Expense
exports.updateExpense = async (req, res) => {
  const { amount, description, category, note } = req.body;
   const { id } = req.params;
  // const expenseId = req.params.id;
  // const userId = req.user.userId;

  try {
    const expense = await Expense.findOne({ where: { id, userId: req.user.id } });

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    expense.note = note;

    await expense.save();
   
    res.status(200).json({ message: 'Expense updated successfully', expense });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// ✅ Delete Expense
exports.deleteExpense = async (req, res) => {
  // const expenseId = req.params.id;
  // const userId = req.user.userId;
  const t = await sequelize.transaction(); // Start a transaction
  const { id } = req.params;


  try {
     //console.log("➡️ Deleting expense ID:", id, "for user:", req.user.id);
      // Step 1: Find the expense for this user
    const expense = await Expense.findOne({ where: { id, UserId: req.user.id}, transaction: t });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: 'Expense not found or not yours' });
    }

    const amountToDeduct = Number(expense.amount);
     await Expense.destroy({ where: { id, userId: req.user.id } },{transaction:t});

      // Step 3: Update user's totalExpense
    const user = await User.findByPk(req.user.id, { transaction: t });
    const updatedTotal = (user.totalExpense ) - amountToDeduct;

    await user.update(
      { totalExpense: updatedTotal },
      { transaction: t }
    );

    await t.commit();
    
    return res.status(200).json({ message: 'Expense deleted' });
  
  } catch (error) {
     if (!t.finished) {
      await t.rollback();
    }
    console.error('Delete expense failed:', error);
    res.status(500).json({ error: 'Failed to delete expense', details: error.message  });
  }
};
