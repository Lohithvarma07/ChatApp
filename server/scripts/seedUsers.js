// server/scripts/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('Missing MONGO_URI');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB ✅', {
      db: mongoose.connection?.db?.databaseName,
      host: mongoose.connection?.host
    });

    // Wipe users and insert 2 accounts
    await User.deleteMany({});
    const pw = await bcrypt.hash('mypassword123', 10);

    const docs = await User.insertMany([
      { name: 'Lohith', email: 'lohith@example.com', passwordHash: pw },
      { name: 'Test User', email: 'test@example.com', passwordHash: await bcrypt.hash('123456', 10) }
    ]);

    console.log('Seeded:', docs.map(d => ({ id: d._id.toString(), email: d.email })));
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed ❌', e);
    process.exit(1);
  }
})();
