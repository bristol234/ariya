import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { OTP } from '../models/OTP';
import { EmailService } from '../services/emailService';

const router = express.Router();

// Login - admin direct, users via OTP
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Admins bypass OTP
    if (user.isAdmin === true) {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        accounts: user.accounts,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      return res.json({ message: 'Login successful', token, user: userResponse });
    }

    // Non-admin: generate OTP and email it
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs for this email
    await OTP.deleteMany({ email: user.email });
    await OTP.create({ email: user.email, code: otpCode, expiresAt, isUsed: false });

    try {
      await EmailService.sendOTP(user.email, user.username, otpCode);
    } catch (emailErr) {
      // Do not block login if email fails; client can retry
      console.error('OTP email send failed:', emailErr);
    }

    return res.json({ message: 'OTP sent to email', otpSent: true, user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP to complete login
router.post('/verify-otp', async (req, res) => {
  try {
    const { username, code } = req.body;
    if (!username || !code) {
      return res.status(400).json({ error: 'Username and code are required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = await OTP.findOne({ email: user.email, code });
    if (!otp) return res.status(400).json({ error: 'Invalid code' });
    if (otp.isUsed) return res.status(400).json({ error: 'Code already used' });
    if (otp.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'Code expired' });

    // Mark OTP used
    otp.isUsed = true;
    await otp.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      accounts: user.accounts,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return res.json({ message: 'Login successful', token, user: userResponse });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, async (req: any, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', auth, async (req: any, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 