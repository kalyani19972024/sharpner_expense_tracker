
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.adduser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user and store result
    const user = await User.create({ name, email, password: hashedPassword });

    // 4. Generate JWT token using the created user's ID
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // 5. Send token (and optionally user info) as response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

exports.checkPremiumStatus = async (req, res) => {
  try {
     const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log("$$$$$$$$$$$$$$$", user.ispremiumuser);
    // Match your DB column name (ispremiumuser)
    res.status(200).json({ ispremiumuser: user.ispremiumuser });
    
  } catch (err) {
    console.error('Error checking premium status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


