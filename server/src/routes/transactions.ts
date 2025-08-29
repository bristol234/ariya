import express from 'express';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { EmailService } from '../services/emailService';

const router = express.Router();

// Get user's transactions with pagination
router.get('/', auth, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalTransactions / limit);

    // Get paginated transactions
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics data
router.get('/analytics', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments({ userId });
    const completedTransactions = await Transaction.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    const pendingTransactions = await Transaction.countDocuments({ 
      userId, 
      status: 'pending' 
    });

    // Get recent transactions (last 30 days)
    const recentTransactions = await Transaction.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    // Calculate total spending and income
    const spending = await Transaction.aggregate([
      { $match: { userId, amount: { $lt: 0 }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);

    const income = await Transaction.aggregate([
      { $match: { userId, amount: { $gt: 0 }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get transactions by type
    const transactionsByType = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly spending for the last 6 months
    const monthlySpending = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          amount: { $lt: 0 }, 
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: { $abs: '$amount' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top merchants
    const topMerchants = await Transaction.aggregate([
      { $match: { userId, merchant: { $exists: true, $ne: null } } },
      { $group: { _id: '$merchant', count: { $sum: 1 }, total: { $sum: { $abs: '$amount' } } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      analytics: {
        summary: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          totalSpending: spending[0]?.total || 0,
          totalIncome: income[0]?.total || 0,
          netFlow: (income[0]?.total || 0) - (spending[0]?.total || 0)
        },
        recentActivity: {
          count: recentTransactions.length,
          transactions: recentTransactions.slice(0, 5)
        },
        transactionsByType,
        monthlySpending,
        topMerchants
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create wire transfer
router.post('/wire-transfer', auth, async (req: any, res) => {
  try {
    const {
      amount,
      fromAccountType,
      recipientName,
      recipientAccountNumber,
      recipientBankName,
      recipientRoutingNumber,
      recipientBankAddress,
      description
    } = req.body;

    // Validate required fields
    if (
      !amount ||
      !fromAccountType ||
      !recipientName ||
      !recipientAccountNumber ||
      !recipientBankName ||
      !recipientRoutingNumber ||
      !recipientBankAddress
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Validate account type
    if (!['checking', 'savings'].includes(fromAccountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    // Get user with fresh data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check account balance
    const accountBalance = user.accounts[fromAccountType as keyof typeof user.accounts].balance;
    if (accountBalance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Calculate wire transfer fee (example: $25 for domestic wire transfers)
    const wireTransferFee = 25;
    const totalAmount = amount + wireTransferFee;

    // Check if user has enough balance including fee
    if (accountBalance < totalAmount) {
      return res.status(400).json({
        error: `Insufficient funds. Required: $${totalAmount.toFixed(2)} (Amount: $${amount.toFixed(2)} + Fee: $${wireTransferFee.toFixed(2)})`
      });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: user._id,
      type: 'wire_transfer',
      status: 'pending', // Set to pending for admin approval
      amount: totalAmount,
      fromAccount: {
        type: fromAccountType,
        accountNumber: user.accounts[fromAccountType as keyof typeof user.accounts].accountNumber
      },
      recipientDetails: {
        name: recipientName,
        accountNumber: recipientAccountNumber,
        bankName: recipientBankName,
        routingNumber: recipientRoutingNumber,
        bankAddress: recipientBankAddress
      },
      description: description || `Wire transfer to ${recipientName}`,
      fees: wireTransferFee
    });

    await transaction.save();

    // Deduct amount from user's account
    user.accounts[fromAccountType as keyof typeof user.accounts].balance -= totalAmount;
    await user.save();

    // Send email notification
    try {
      await EmailService.sendTransactionNotification(
        user.email,
        user.username,
        transaction
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the transaction if email fails
    }

    res.status(201).json({
      message: 'Wire transfer initiated successfully',
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        fees: transaction.fees,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Create wire transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:transactionId', auth, async (req: any, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel transaction (only if status is processing)
router.post('/:transactionId/cancel', auth, async (req: any, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'processing') {
      return res.status(400).json({ error: 'Transaction cannot be cancelled' });
    }

    // Update transaction status
    transaction.status = 'failed';
    await transaction.save();

    // Refund the amount to user's account
    const user = await User.findById(req.user._id);
    if (user) {
      const accountType = transaction.fromAccount.type;
      user.accounts[accountType as keyof typeof user.accounts].balance += transaction.amount;
      await user.save();

      // Send email notification
      await EmailService.sendTransactionNotification(
        user.email,
        user.username,
        transaction
      );
    }

    res.json({
      message: 'Transaction cancelled successfully',
      transaction
    });

  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transfer history (minimal placeholder to satisfy frontend)
router.get('/transfers/history', auth, async (req: any, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const items = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      history: items.map(t => {
        let createdAtString = '';
        if (t.createdAt instanceof Date && !isNaN(t.createdAt.getTime())) {
          createdAtString = t.createdAt.toISOString();
        } else if (typeof t.createdAt === 'string' && !isNaN(new Date(t.createdAt).getTime())) {
          createdAtString = new Date(t.createdAt).toISOString();
        } else {
          createdAtString = '';
        }
        return {
          id: t.transactionId,
          type: t.type,
          status: t.status,
          amount: t.amount,
          description: t.description,
          createdAt: createdAtString,
          fromAccountType: t.fromAccount?.type,
          fromAccountLast4: (t.fromAccount?.accountNumber || '').slice(-4),
          recipient: t.recipientDetails?.name || null,
          bank: t.recipientDetails?.bankName || null
        };
      })
    });
  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transaction details by reference id
router.get('/details/:transactionId', auth, async (req: any, res) => {
  try {
    const { transactionId } = req.params;
    const t = await Transaction.findOne({ transactionId, userId: req.user._id });
    if (!t) return res.status(404).json({ error: 'Transaction not found' });
    res.json({
      transaction: {
        id: t.transactionId,
        type: t.type,
        status: t.status,
        amount: t.amount,
        fees: t.fees || 0,
        total: t.amount,
        description: t.description,
        createdAt: (t.createdAt && !isNaN(new Date(t.createdAt).getTime()))
          ? new Date(t.createdAt).toISOString()
          : '',
        fromAccount: {
          type: t.fromAccount?.type,
          accountNumber: t.fromAccount?.accountNumber,
          accountName: t.fromAccount?.type === 'checking' ? 'Simply Streaming Checking' : 'High Yield Savings'
        },
        toAccount: t.toAccount ? {
          type: t.toAccount?.type,
          accountNumber: t.toAccount?.accountNumber,
          accountName: t.toAccount?.type === 'checking' ? 'Simply Streaming Checking' : 'High Yield Savings'
        } : undefined,
        recipient: t.recipientDetails || null,
        receiptUrl: `/api/transactions/${t.transactionId}/receipt`
      }
    });
  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Internal transfer between user's own accounts
router.post('/transfer/internal', auth, async (req: any, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    // Our client sends account IDs as 'checking' or 'savings'
    const validIds = ['checking', 'savings'];
    const transferAmount = Number(amount);

    if (!validIds.includes(fromAccountId) || !validIds.includes(toAccountId) || fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Invalid accounts for transfer' });
    }
    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const fromBal = user.accounts[fromAccountId as 'checking' | 'savings'].balance;
    if (fromBal < transferAmount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Perform transfer
    user.accounts[fromAccountId as 'checking' | 'savings'].balance -= transferAmount;
    user.accounts[toAccountId as 'checking' | 'savings'].balance += transferAmount;
    await user.save();

    // Create a single transaction record for history
    const txn = new Transaction({
      userId: user._id,
      type: 'transfer',
      status: 'completed',
      amount: transferAmount,
      currency: 'USD',
      fromAccount: {
        type: fromAccountId,
        accountNumber: user.accounts[fromAccountId as 'checking' | 'savings'].accountNumber
      },
      toAccount: {
        type: toAccountId,
        accountNumber: user.accounts[toAccountId as 'checking' | 'savings'].accountNumber
      },
      description: description || `Internal transfer ${fromAccountId} -> ${toAccountId}`,
      fees: 0
    });
    await txn.save();

    return res.json({
      message: 'Transfer completed successfully',
      transfer: {
        reference: txn.transactionId,
        amount: transferAmount,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Internal transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// External transfer (simple: deduct from selected account and mark completed)
router.post('/transfer/external', auth, async (req: any, res) => {
  try {
    const { fromAccountId, recipientName, amount, description } = req.body;
    const validIds = ['checking', 'savings'];
    const transferAmount = Number(amount);
    if (!validIds.includes(fromAccountId)) {
      return res.status(400).json({ error: 'Invalid from account' });
    }
    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.accounts[fromAccountId as 'checking' | 'savings'].balance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    user.accounts[fromAccountId as 'checking' | 'savings'].balance -= transferAmount;
    await user.save();

    const txn = new Transaction({
      userId: user._id,
      type: 'transfer',
      status: 'completed',
      amount: transferAmount,
      currency: 'USD',
      fromAccount: {
        type: fromAccountId,
        accountNumber: user.accounts[fromAccountId as 'checking' | 'savings'].accountNumber
      },
      description: description || `External transfer to ${recipientName}`,
      fees: 0
    });
    await txn.save();

    return res.json({
      message: 'External transfer completed successfully',
      transfer: {
        reference: txn.transactionId,
        amount: transferAmount,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('External transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
