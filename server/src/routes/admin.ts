import express from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { auth, adminAuth } from '../middleware/auth';
import { EmailService } from '../services/emailService';

const router = express.Router();

// Get all users
router.get('/users', auth, adminAuth, async (req: any, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
      checkingBalance = 0,
      savingsBalance = 0
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !phoneNumber || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
      accounts: {
        checking: {
          balance: checkingBalance
        },
        savings: {
          balance: savingsBalance
        }
      }
    });

    await newUser.save();

    // Return user data without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      accounts: newUser.accounts,
      isAdmin: newUser.isAdmin,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions
router.get('/transactions', auth, adminAuth, async (req: any, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status
router.put('/transactions/:transactionId/status', auth, adminAuth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status || !['processing', 'pending', 'completed', 'failed', 'on_hold'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction status
    transaction.status = status;
    if (status === 'completed') {
      transaction.processedAt = new Date();
    }
    await transaction.save();

    // Get user for email notification
    const user = await User.findById(transaction.userId);
    if (user) {
      // Send email notification
      await EmailService.sendTransactionNotification(
        user.email,
        transaction,
        user.username
      );
    }

    res.json({
      message: 'Transaction status updated successfully',
      transaction
    });

  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, adminAuth, async (req: any, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const processingTransactions = await Transaction.countDocuments({ status: 'processing' });

    // Calculate total balances
    const users = await User.find({});
    const totalCheckingBalance = users.reduce((sum, user) => sum + user.accounts.checking.balance, 0);
    const totalSavingsBalance = users.reduce((sum, user) => sum + user.accounts.savings.balance, 0);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTransactions,
        pendingTransactions,
        processingTransactions,
        totalCheckingBalance,
        totalSavingsBalance
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all wire transfers
router.get('/wire-transfers', auth, adminAuth, async (req, res) => {
  try {
    const wires = await Transaction.find({ type: 'wire_transfer' })
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ wires });
  } catch (error) {
    console.error('Get wire transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update wire transfer status
router.patch('/wire-transfers/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // 'hold', 'pending', 'failed', 'completed'
    const { id } = req.params;
    
    const txn = await Transaction.findById(id);
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If status is being changed to completed, deduct the amount from user's account
    if (status === 'completed' && txn.status !== 'completed') {
      const user = await User.findById(txn.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get the account type from the transaction
      const accountType = txn.fromAccount?.type;
      if (!accountType || !['checking', 'savings'].includes(accountType)) {
        return res.status(400).json({ error: 'Invalid account type' });
      }

      // Check if user has sufficient balance
      const accountBalance = user.accounts[accountType as keyof typeof user.accounts].balance;
      if (accountBalance < txn.amount) {
        return res.status(400).json({ error: 'Insufficient funds in user account' });
      }

      // Deduct the amount from user's account
      user.accounts[accountType as keyof typeof user.accounts].balance -= txn.amount;
      await user.save();
    }

    // Update transaction status
    txn.status = status;
    if (status === 'completed') {
      txn.processedAt = new Date();
    }
    await txn.save();

    // Notify user
    const user = await User.findById(txn.userId);
    if (user) {
      try {
        await EmailService.sendTransactionNotification(user.email, txn, user.username);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.json({ success: true, txn });
  } catch (error) {
    console.error('Update wire transfer status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;