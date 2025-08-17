
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const{ User }= require('../models/User');


const Expense = sequelize.define('Expense', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }, // new field:
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
});

module.exports = Expense;
