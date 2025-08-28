const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models with correct paths
const { User } = require('../dist/models/User');
const { Account } = require('../dist/models/Account');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cfcu-banking';

async function createNewUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'tosin' });
    if (existingUser) {
      console.log('❌ User "tosin" already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash('Tosin@123', 10);
    
    const newUser = new User({
      username: 'tosin',
      email: 'tosinoke0@gmail.com',
      password: hashedPassword,
      firstName: 'Tosin',
      lastName: 'Oke',
      dateOfBirth: '1990-01-01',
      phone: '555-123-4567',
      role: 'user',
      memberSince: new Date().toISOString().split('T')[0],
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      isActive: true
    });

    await newUser.save();
    console.log('✅ User created successfully:', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    // Create account for the user
    const newAccount = new Account({
      userId: newUser._id,
      accountType: 'checking',
      balance: 10000.00,
      currency: 'USD',
      status: 'active',
      accountNumber: '', // Will be auto-generated
      routingNumber: '123456789',
      nickname: 'Main Checking'
    });

    await newAccount.save();
    console.log('✅ Account created successfully:', {
      accountNumber: newAccount.accountNumber,
      balance: newAccount.balance,
      accountType: newAccount.accountType
    });

    // Create some sample transactions
    const { Transaction } = require('../dist/models/Transaction');
    
    const sampleTransactions = [
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'credit',
        amount: 10000.00,
        description: 'Initial deposit',
        category: 'deposit',
        status: 'completed',
        reference: `TXN-${Date.now()}-INIT`
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'debit',
        amount: 250.00,
        description: 'Grocery store purchase',
        category: 'shopping',
        status: 'completed',
        reference: `TXN-${Date.now()}-GROC`
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'credit',
        amount: 5000.00,
        description: 'Salary deposit',
        category: 'income',
        status: 'completed',
        reference: `TXN-${Date.now()}-SAL`
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'debit',
        amount: 150.00,
        description: 'Gas station',
        category: 'transportation',
        status: 'completed',
        reference: `TXN-${Date.now()}-GAS`
      }
    ];

    for (const transaction of sampleTransactions) {
      const newTransaction = new Transaction(transaction);
      await newTransaction.save();
    }

    console.log('✅ Sample transactions created');

    console.log('\n🎉 New user created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Username: tosin');
    console.log('   Password: Tosin@123');
    console.log('   Email: tosinoke0@gmail.com');
    console.log('   Role: user (will require OTP)');
    console.log('\n💰 Account Details:');
    console.log(`   Account Number: ${newAccount.accountNumber}`);
    console.log(`   Balance: $${newAccount.balance.toFixed(2)}`);
    console.log(`   Account Type: ${newAccount.accountType}`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createNewUser();
