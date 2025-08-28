import express from 'express';
import { auth } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// GET /api/accounts - return current user's accounts
router.get('/', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('accounts');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Normalize response to match frontend expectations
    const accounts = [
      {
        id: 'checking',
        type: 'checking',
        accountNumber: user.accounts.checking.accountNumber,
        balance: user.accounts.checking.balance,
        availableBalance: user.accounts.checking.balance,
        status: 'active',
        accountName: 'Simply Streaming Checking'
      },
      {
        id: 'savings',
        type: 'savings',
        accountNumber: user.accounts.savings.accountNumber,
        balance: user.accounts.savings.balance,
        availableBalance: user.accounts.savings.balance,
        status: 'active',
        accountName: 'High Yield Savings'
      }
    ];

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 