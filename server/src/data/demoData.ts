// Shared demo data for the banking application
export interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  availableBalance?: number;
  availableCredit?: number;
  creditLimit?: number;
  status: 'active' | 'inactive' | 'suspended';
  accountName: string;
  routingNumber?: string;
  lastTransactionDate: string;
  monthlyFee: number;
  minimumBalance?: number;
  interestRate: number;
  dueDate?: string;
  minimumPayment?: number;
  rewardsPoints?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'processing' | 'on_hold' | 'failed';
  reference: string;
  merchant: string;
  location: string;
  fee?: number;
  externalDetails?: any;
  wireDetails?: any;
  transferType?: string;
  requiresApproval?: boolean;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DemoUser {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  role: 'user' | 'admin';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  accounts: Account[];
  transactions: Transaction[];
}

// Shared demo users data
export const demoUsers: DemoUser[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@cfcu.org',
    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ',
    firstName: 'Demo',
    lastName: 'User',
    dateOfBirth: '1990-01-01',
    phone: '615-555-0123',
    role: 'user',
    address: {
      street: '123 Main St',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201'
    },
    accounts: [
      {
        id: '1',
        type: 'checking',
        accountNumber: '****1234',
        balance: 2447.89, // Updated after transfer
        availableBalance: 2347.89, // Updated after transfer
        status: 'active',
        accountName: 'Primary Checking',
        routingNumber: '264080811',
        lastTransactionDate: '2025-08-20T01:28:06.687Z', // Updated after transfer
        monthlyFee: 0,
        minimumBalance: 0,
        interestRate: 0.01
      },
      {
        id: '2',
        type: 'savings',
        accountNumber: '****5678',
        balance: 12643.67, // Updated after transfer
        availableBalance: 12643.67, // Updated after transfer
        status: 'active',
        accountName: 'High Yield Savings',
        routingNumber: '264080811',
        lastTransactionDate: '2025-08-20T01:28:06.687Z', // Updated after transfer
        monthlyFee: 0,
        minimumBalance: 100,
        interestRate: 2.15
      },
      {
        id: '3',
        type: 'credit',
        accountNumber: '****9012',
        balance: -1250.00,
        creditLimit: 5000.00,
        availableCredit: 3750.00,
        status: 'active',
        accountName: 'Rewards Credit Card',
        lastTransactionDate: '2024-01-12T15:45:00Z',
        monthlyFee: 0,
        interestRate: 15.99,
        dueDate: '2024-02-15',
        minimumPayment: 25.00,
        rewardsPoints: 1250
      }
    ],
    transactions: [
      {
        id: '1',
        accountId: '1',
        type: 'debit',
        description: 'Grocery Store',
        amount: -85.67,
        date: '2024-01-15T10:30:00Z',
        category: 'Food & Dining',
        status: 'completed',
        reference: 'TXN-001234',
        merchant: 'Kroger',
        location: 'Nashville, TN'
      },
      {
        id: '2',
        accountId: '1',
        type: 'credit',
        description: 'Salary Deposit',
        amount: 2500.00,
        date: '2024-01-14T09:00:00Z',
        category: 'Income',
        status: 'completed',
        reference: 'TXN-001235',
        merchant: 'ABC Company',
        location: 'Direct Deposit'
      },
      {
        id: '3',
        accountId: '2',
        type: 'credit',
        description: 'Interest Payment',
        amount: 12.45,
        date: '2024-01-13T12:00:00Z',
        category: 'Interest',
        status: 'completed',
        reference: 'TXN-001236',
        merchant: 'CFCU Interest',
        location: 'Nashville, TN'
      },
      {
        id: '4',
        accountId: '3',
        type: 'debit',
        description: 'Online Purchase',
        amount: -125.00,
        date: '2024-01-12T15:45:00Z',
        category: 'Shopping',
        status: 'completed',
        reference: 'TXN-001237',
        merchant: 'Amazon.com',
        location: 'Online'
      },
      {
        id: '8',
        accountId: '1',
        type: 'debit',
        description: 'Wire Transfer to Test User - Chase Bank',
        amount: -525.00,
        date: '2025-08-20T08:32:27.335Z',
        category: 'Transfer',
        status: 'processing',
        reference: 'WIRE-1755678747335-fvnu5hals',
        merchant: 'Wire Transfer',
        location: 'External',
        fee: 25,
        requiresApproval: true,
        wireDetails: {
          recipientName: 'Test User',
          recipientBank: 'Chase Bank',
          recipientAccount: '9876543210',
          routingNumber: '021000021',
          swiftCode: 'CHASUS33',
          priority: 'standard',
          transferAmount: 500,
          fee: 25
        },
        transferType: 'wire'
      },
      {
        id: 'TXN-1755653286687-nn5i6cg1w-debit',
        accountId: '1',
        type: 'debit',
        description: 'Test real-time transfer',
        amount: -100,
        date: '2025-08-20T01:28:06.687Z',
        category: 'Transfer',
        status: 'completed',
        reference: 'TXN-1755653286687-nn5i6cg1w',
        merchant: 'Internal Transfer',
        location: 'CFCU',
        fee: 0
      },
      {
        id: 'TXN-1755653286687-nn5i6cg1w-credit',
        accountId: '2',
        type: 'credit',
        description: 'Test real-time transfer',
        amount: 100,
        date: '2025-08-20T01:28:06.687Z',
        category: 'Transfer',
        status: 'completed',
        reference: 'TXN-1755653286687-nn5i6cg1w',
        merchant: 'Internal Transfer',
        location: 'CFCU',
        fee: 0
      }
    ]
  },
  {
    id: '2',
    username: 'vincent4u',
    email: 'bristolsteve8@gmail.com',
    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ',
    firstName: 'Vincent',
    lastName: 'Grant Gill',
    dateOfBirth: '1957-04-12',
    phone: '615-555-0124',
    role: 'user',
    address: {
      street: '456 Music Row',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37203'
    },
    accounts: [
      {
        id: '4',
        type: 'checking',
        accountNumber: '****4321',
        balance: 741000.00,
        availableBalance: 741000.00,
        status: 'active',
        accountName: 'Music Royalties Checking',
        routingNumber: '264080811',
        lastTransactionDate: '2024-01-15T14:30:00Z',
        monthlyFee: 0,
        minimumBalance: 0,
        interestRate: 0.01
      },
      {
        id: '5',
        type: 'savings',
        accountNumber: '****8765',
        balance: 800000.00,
        availableBalance: 800000.00,
        status: 'active',
        accountName: 'High Yield Savings',
        routingNumber: '264080811',
        lastTransactionDate: '2024-01-13T09:15:00Z',
        monthlyFee: 0,
        minimumBalance: 100,
        interestRate: 2.15
      }
    ],
    transactions: [
      {
        id: '5',
        accountId: '4',
        type: 'credit',
        description: 'Music Royalties',
        amount: 50000.00,
        date: '2024-01-15T14:30:00Z',
        category: 'Income',
        status: 'completed',
        reference: 'TXN-001238',
        merchant: 'Music Label',
        location: 'Nashville, TN'
      },
      {
        id: '6',
        accountId: '4',
        type: 'debit',
        description: 'Studio Equipment',
        amount: -2500.00,
        date: '2024-01-14T11:20:00Z',
        category: 'Business',
        status: 'completed',
        reference: 'TXN-001239',
        merchant: 'Studio Supply Co',
        location: 'Nashville, TN'
      },
      {
        id: '7',
        accountId: '5',
        type: 'credit',
        description: 'Interest Payment',
        amount: 3200.00,
        date: '2024-01-13T09:15:00Z',
        category: 'Interest',
        status: 'completed',
        reference: 'TXN-001240',
        merchant: 'CFCU Interest',
        location: 'Nashville, TN'
      }
    ]
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@cfcu.org',
    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ',
    firstName: 'Admin',
    lastName: 'User',
    dateOfBirth: '1985-01-01',
    phone: '615-555-0000',
    role: 'admin',
    address: {
      street: '789 Admin Blvd',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201'
    },
    accounts: [],
    transactions: []
  }
];

// Helper function to find user by username
export const findUserByUsername = (username: string): DemoUser | undefined => {
  return demoUsers.find(user => user.username === username);
};

// Helper function to get user from token
export const getUserFromToken = (req: any): DemoUser | null => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'cfcu-secret-key-2024';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = findUserByUsername(decoded.username);
    return user || null;
  } catch (error) {
    return null;
  }
}; 