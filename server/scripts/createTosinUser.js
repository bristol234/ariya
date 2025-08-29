require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const createTosinUser = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema inline
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      isAdmin: { type: Boolean, default: false },
      accounts: {
        checking: {
          accountNumber: { type: String, required: true },
          balance: { type: Number, default: 0 },
          currency: { type: String, default: 'USD' }
        },
        savings: {
          accountNumber: { type: String, required: true },
          balance: { type: Number, default: 0 },
          currency: { type: String, default: 'USD' }
        }
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'tosin123' });
    if (existingUser) {
      console.log('⚠️  User tosin123 already exists');
      console.log('📧 Email:', existingUser.email);
      console.log('💰 Checking account balances...');
      console.log('   Checking: $', existingUser.accounts.checking.balance);
      console.log('   Savings: $', existingUser.accounts.savings.balance);
      return;
    }

    console.log('👤 Creating new user: tosin123...');

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('emmy@123', saltRounds);

    // Create user
    const newUser = new User({
      username: 'tosin123',
      email: 'bristolsteve8@gmail.com',
      password: hashedPassword,
      firstName: 'Tosin',
      lastName: 'Test',
      phoneNumber: '+1234567890',
      isActive: true,
      isAdmin: false,
      accounts: {
        checking: {
          accountNumber: 'CHK' + Math.random().toString().slice(2, 10),
          balance: 5000.00,
          currency: 'USD'
        },
        savings: {
          accountNumber: 'SAV' + Math.random().toString().slice(2, 10),
          balance: 15000.00,
          currency: 'USD'
        }
      }
    });

    await newUser.save();
    console.log('✅ User tosin123 created successfully!');
    console.log('📧 Email: bristolsteve8@gmail.com');
    console.log('🔑 Password: emmy@123');
    console.log('💰 Initial balances:');
    console.log('   Checking: $5,000.00');
    console.log('   Savings: $15,000.00');

    // Create some sample transactions
    console.log('📊 Creating sample transactions...');
    
    const transactionSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      transactionId: { type: String, required: true, unique: true },
      type: { type: String, required: true },
      status: { type: String, required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      fromAccount: {
        type: { type: String },
        accountNumber: { type: String }
      },
      toAccount: {
        type: { type: String },
        accountNumber: { type: String }
      },
      description: { type: String },
      merchant: { type: String },
      fees: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      processedAt: { type: Date }
    });

    const Transaction = mongoose.model('Transaction', transactionSchema);
    
    const sampleTransactions = [
      {
        userId: newUser._id,
        transactionId: 'TXN' + Math.random().toString().slice(2, 12),
        type: 'deposit',
        status: 'completed',
        amount: 5000.00,
        fromAccount: { type: 'checking', accountNumber: newUser.accounts.checking.accountNumber },
        description: 'Initial checking account deposit',
        fees: 0
      },
      {
        userId: newUser._id,
        transactionId: 'TXN' + Math.random().toString().slice(2, 12),
        type: 'deposit',
        status: 'completed',
        amount: 15000.00,
        fromAccount: { type: 'savings', accountNumber: newUser.accounts.savings.accountNumber },
        description: 'Initial savings account deposit',
        fees: 0
      },
      {
        userId: newUser._id,
        transactionId: 'TXN' + Math.random().toString().slice(2, 12),
        type: 'transfer',
        status: 'completed',
        amount: 500.00,
        fromAccount: { type: 'checking', accountNumber: newUser.accounts.checking.accountNumber },
        toAccount: { type: 'savings', accountNumber: newUser.accounts.savings.accountNumber },
        description: 'Transfer from checking to savings',
        fees: 0
      },
      {
        userId: newUser._id,
        transactionId: 'TXN' + Math.random().toString().slice(2, 12),
        type: 'purchase',
        status: 'completed',
        amount: -150.00,
        fromAccount: { type: 'checking', accountNumber: newUser.accounts.checking.accountNumber },
        description: 'Online purchase - Amazon',
        merchant: 'Amazon',
        fees: 0
      },
      {
        userId: newUser._id,
        transactionId: 'TXN' + Math.random().toString().slice(2, 12),
        type: 'withdrawal',
        status: 'completed',
        amount: -200.00,
        fromAccount: { type: 'checking', accountNumber: newUser.accounts.checking.accountNumber },
        description: 'ATM withdrawal',
        fees: 2.50
      }
    ];

    for (const transactionData of sampleTransactions) {
      const transaction = new Transaction(transactionData);
      await transaction.save();
    }

    console.log('✅ Created 5 sample transactions');
    console.log('🎉 User tosin123 is ready for testing!');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTosinUser();
