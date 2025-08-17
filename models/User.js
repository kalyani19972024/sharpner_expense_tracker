
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');


const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
 totalExpense: {
    type: DataTypes.FLOAT,
    defaultValue: 0
 },
 ispremiumuser : {
    type: DataTypes.BOOLEAN ,
    defaultValue:false
 },
 income: {
  type: DataTypes.FLOAT,
  defaultValue: 0
}
});

module.exports = User;
