// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/authMiddleware');

// POST /auth/register  (auto-login: returns token too)
async function register(req, res) {
  try {
    const name = (req.body?.name || '').trim();
    const email = (req.body?.email || '').toLowerCase().trim();
    const password = (req.body?.password || '').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken({ id: user._id, email: user.email });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const email = (req.body?.email || '').toLowerCase().trim();
    const password = (req.body?.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id, email: user.email });
    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login };
