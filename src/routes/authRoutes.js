const express = require('express');
const AuthController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../utils/validators');

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', validateSignup, (req, res) => authController.register(req, res));
router.post('/login', validateLogin, (req, res) => authController.login(req, res));

module.exports = router;
