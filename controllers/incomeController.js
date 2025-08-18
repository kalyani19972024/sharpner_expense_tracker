
// controllers/incomeController.js
const User = require("../models/User");

exports.addIncome = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware
    const { amount } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update income
    user.income = Number(user.income || 0) + Number(amount);
    await user.save();

    res.json({ success: true, income: user.income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding income" });
  }
};
