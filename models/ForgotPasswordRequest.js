
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
//const{ User }= require('../models/User');
const { v4: uuidv4 } = require('uuid');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});



module.exports = ForgotPasswordRequest;