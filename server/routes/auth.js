// server/routes/auth.js
const express = require('express');
const router = express.Router();

// ✅ import the controller correctly
const authController = require('../controllers/authController');

// Optional debug: uncomment if you still have issues
// console.log('auth controller keys:', Object.keys(authController));

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
