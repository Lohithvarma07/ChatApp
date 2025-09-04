// server/seed.js (only if you use it)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB ✅');

    await User.deleteMany({});
    await User.insertMany([
      { name: 'Alice', email: 'Anu@example.com', password: '123456' },
      { name: 'Bob',   email: 'Ravi@example.com',   password: '123456' },
    ]);

    console.log('Seeded users ✅');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed ❌', e);
    process.exit(1);
  }
})();
