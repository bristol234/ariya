import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Demo user data
const demoUser = {
  id: '1',
  username: 'demo',
  email: 'demo@cfcu.org',
  firstName: 'John',
  lastName: 'Doe',
  memberSince: '2020-01-15',
  phone: '(615) 555-0123',
  address: {
    street: '123 Main St',
    city: 'Nashville',
    state: 'TN',
    zip: '37212'
  },
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactorEnabled: false,
      biometricEnabled: true
    }
  }
};

// Get user profile
router.get('/profile', (req: Request, res: Response) => {
  try {
    res.json({ user: demoUser });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('en-US').withMessage('Valid phone number is required'),
  body('address.street').optional().trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('address.city').optional().trim().isLength({ min: 1 }).withMessage('City is required'),
  body('address.state').optional().trim().isLength({ min: 2 }).withMessage('State is required'),
  body('address.zip').optional().trim().isLength({ min: 5 }).withMessage('ZIP code is required')
], (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // In a real app, update the user in database
    // For demo, just return success
    res.json({
      message: 'Profile updated successfully',
      user: { ...demoUser, ...req.body }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', [
  body('notifications.email').optional().isBoolean().withMessage('Email notification must be boolean'),
  body('notifications.sms').optional().isBoolean().withMessage('SMS notification must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notification must be boolean'),
  body('security.twoFactorEnabled').optional().isBoolean().withMessage('Two-factor must be boolean'),
  body('security.biometricEnabled').optional().isBoolean().withMessage('Biometric must be boolean')
], (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // In a real app, update preferences in database
    // For demo, just return success
    res.json({
      message: 'Preferences updated successfully',
      preferences: { ...demoUser.preferences, ...req.body }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard data
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const dashboardData = {
      totalBalance: 15091.56,
      accountCount: 3,
      recentTransactions: 8,
      upcomingPayments: 2,
      creditScore: 750,
      memberSince: '2020-01-15',
      lastLogin: new Date().toISOString(),
      quickActions: [
        { id: '1', name: 'Transfer Money', icon: 'send' },
        { id: '2', name: 'Pay Bills', icon: 'credit-card' },
        { id: '3', name: 'Deposit Check', icon: 'plus' },
        { id: '4', name: 'View Statements', icon: 'file-text' }
      ]
    };

    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications
router.get('/notifications', (req: Request, res: Response) => {
  try {
    const notifications = [
      {
        id: '1',
        type: 'info',
        title: 'Welcome to Digital Banking',
        message: 'Your account has been successfully set up.',
        date: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Payment Processed',
        message: 'Your bill payment of $125.00 has been processed.',
        date: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    ];

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real app, update notification in database
    // For demo, just return success
    res.json({
      message: 'Notification marked as read',
      notificationId: id
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 