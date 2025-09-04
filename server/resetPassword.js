
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error('Missing MONGO_URI');

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];       
    const newPass = process.argv[3];

    if (!email || !newPass) {
      console.log('Usage: node resetPassword.js <email> <newPassword>');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found for email:', email);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(newPass, 10);
    user.passwordHash = passwordHash;
    await user.save();

    console.log(`Password reset for ${email} ✅`);
    process.exit(0);
  } catch (e) {
    console.error('Reset failed ❌', e);
    process.exit(1);
  }
})();
