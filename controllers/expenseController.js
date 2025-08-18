const User = require('../models/User');
const Expense = require('../models/Expense');
const  sequelize  = require('../utils/db');
const { Parser } = require("json2csv");




// ✅ Add Expense
exports.addExpense = async (req, res) => {
  const { amount, description, category,note,incomeAmount } = req.body;
  const userId = req.user.id; // From token
  const t = await sequelize.transaction(); // Start a transaction
  
  try {
    const expense = await Expense.create({ amount, description, category, note,UserId: userId },{transaction:t});
     console.log("expense created",expense.amount,expense.id);
    const user = await User.findByPk(userId,{transaction:t});
    console.log("****users found",user.id);
    const updatedTotal = (user.totalExpense || 0) + Number(amount);
     const updatedIncome = (user.income || 0) + Number(incomeAmount);

    await User.update(
  { totalExpense: updatedTotal, income: updatedIncome }, 
  { where: { id: userId }, transaction: t }
  );

    await t.commit();
     res.status(201).json({ expense, totalExpense: updatedTotal , income:updatedIncome});
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

exports.downloadExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user.ispremiumuser) {
      return res.status(403).json({ message: "Only premium users can download expenses" });
    }

    // Fetch all expenses of user
    const expenses = await Expense.findAll({ where: { UserId: userId } });

    // Group by month & year
    const monthlyData = {};
    const yearlyData = {};

    expenses.forEach(exp => {
      const date = new Date(exp.createdAt);
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
      const year = date.getFullYear();

      // Monthly
      if (!monthlyData[month]) {
        monthlyData[month] = { income: user.income || 0, expense: 0, savings: 0 };
      }
      monthlyData[month].expense += Number(exp.amount);
      monthlyData[month].savings = monthlyData[month].income - monthlyData[month].expense;

      // Yearly
      if (!yearlyData[year]) {
        yearlyData[year] = { income: user.income || 0, expense: 0, savings: 0 };
      }
      yearlyData[year].expense += Number(exp.amount);
      yearlyData[year].savings = yearlyData[year].income - yearlyData[year].expense;
    });

    // Convert breakdown to arrays
    const monthlyBreakdown = Object.entries(monthlyData).map(([month, data]) => ({
      type: "monthly",
      period: month,
      income: data.income,
      expense: data.expense,
      savings: data.savings,
    }));

    const yearlyBreakdown = Object.entries(yearlyData).map(([year, data]) => ({
      type: "yearly",
      period: year,
      income: data.income,
      expense: data.expense,
      savings: data.savings,
    }));

    // Raw transactions
    const rawExpenses = expenses.map(exp => ({
      type: "transaction",
      date: exp.createdAt.toISOString().split("T")[0],
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    }));

    // Combine all data
    const finalData = [
      ...rawExpenses,
      ...monthlyBreakdown,
      ...yearlyBreakdown,
    ];

    // Prepare CSV
    const fields = ["type", "period", "date", "amount", "description", "category", "income", "expense", "savings"];
    const parser = new Parser({ fields });
    const csv = parser.parse(finalData);

    res.header("Content-Type", "text/csv");
    res.attachment("expense_report.csv");
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating file" });
  }
};
