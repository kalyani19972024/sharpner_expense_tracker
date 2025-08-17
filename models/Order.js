
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../utils/db'); // adjust path if needed


const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  paymentId: Sequelize.STRING,
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Order;
