const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ensure your User model is at this path

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const ADMIN_SECRET = process.env.ADMIN_SECRET || null; // optional env var to allow admin signup

function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'email and password are required' });
            }

            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = signToken(user);
            const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };

            return res.status(200).json({ token, user: userResponse });
        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async register(req, res) {
        try {
            const { name, email, password, role, adminSecret } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'name, email and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'password must be at least 6 characters' });
            }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Default role is 'student'. Allow creating admin only with ADMIN_SECRET.
            let finalRole = 'student';
            if (role === 'admin') {
                if (ADMIN_SECRET && adminSecret === ADMIN_SECRET) {
                    finalRole = 'admin';
                } else {
                    return res.status(403).json({ message: 'Cannot create admin user' });
                }
            }

            const hashed = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email: email.toLowerCase(),
                password: hashed,
                role: finalRole
            });

            await user.save();

            const token = signToken(user);
            const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };

            return res.status(201).json({ token, user: userResponse });
        } catch (err) {
            console.error('Signup error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = AuthController;