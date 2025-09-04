const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, createdAt: 1 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ message: err.message });
  }
};
