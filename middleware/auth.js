const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ✅ import Sequelize model

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined') {
      return res.status(401).json({ message: 'Token missing or invalid' });
    }

    const decoded = jwt.verify(token,  process.env.JWT_SECRET); // ⚠️ replace with process.env.JWT_SECRET if using env

  
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // ✅ Sequelize instance with associations

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
