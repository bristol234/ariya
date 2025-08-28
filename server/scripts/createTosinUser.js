const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cfcu-banking';

async function createTosinUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas directly
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true, trim: true, lowercase: true },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true },
      password: { type: String, required: true, minlength: 6 },
      firstName: { type: String, required: true, trim: true, maxlength: 50 },
      lastName: { type: String, required: true, trim: true, maxlength: 50 },
      dateOfBirth: { type: String, required: true },
      phone: { type: String, required: true, trim: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      memberSince: { type: String, required: true },
      address: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true, maxlength: 2 },
        zipCode: { type: String, required: true, trim: true, maxlength: 10 }
      },
      isActive: { type: Boolean, default: true },
      lastLogin: Date,
      passwordResetToken: String,
      passwordResetExpires: Date
    }, { timestamps: true });

    const accountSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      accountType: { type: String, required: true, enum: ['checking', 'savings', 'credit'] },
      balance: { type: Number, required: true, default: 0 },
      currency: { type: String, default: 'USD' },
      status: { type: String, enum: ['active', 'inactive', 'frozen'], default: 'active' },
      accountNumber: { type: String, required: true, unique: true },
      routingNumber: { type: String, required: true },
      nickname: { type: String, trim: true },
      interestRate: { type: Number, default: 0 },
      monthlyFee: { type: Number, default: 0 },
      minimumBalance: { type: Number, default: 0 }
    }, { timestamps: true });

    const transactionSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
      type: { type: String, required: true, enum: ['credit', 'debit'] },
      amount: { type: Number, required: true },
      description: { type: String, required: true, trim: true },
      category: { type: String, required: true, trim: true },
      status: { type: String, enum: ['completed', 'pending', 'processing', 'on_hold', 'failed'], default: 'completed' },
      reference: { type: String, required: true, unique: true },
      merchant: { type: String, required: true, trim: true },
      location: { type: String, trim: true },
      fee: { type: Number, default: 0 }
    }, { timestamps: true });

    // Create models
    const User = mongoose.model('User', userSchema);
    const Account = mongoose.model('Account', accountSchema);
    const Transaction = mongoose.model('Transaction', transactionSchema);

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'tosin' });
    if (existingUser) {
      console.log('❌ User "tosin" already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new user with hashed password
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

    // Generate unique account number
    const generateAccountNumber = () => {
      return Math.floor(100000000 + Math.random() * 900000000).toString();
    };

    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const existingAccount = await Account.findOne({ accountNumber });
      if (!existingAccount) {
        isUnique = true;
      }
    }

    // Create account for the user
    const newAccount = new Account({
      userId: newUser._id,
      accountType: 'checking',
      balance: 10000.00,
      currency: 'USD',
      status: 'active',
      accountNumber: accountNumber,
      routingNumber: '123456789',
      nickname: 'Main Checking'
    });

    await newAccount.save();
    console.log('✅ Account created successfully:', {
      accountNumber: newAccount.accountNumber,
      balance: newAccount.balance,
      accountType: newAccount.accountType
    });

    // Create sample transactions
    const sampleTransactions = [
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'credit',
        amount: 10000.00,
        description: 'Initial deposit',
        category: 'deposit',
        status: 'completed',
        reference: `TXN-${Date.now()}-INIT`,
        merchant: 'CFCU Bank'
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'debit',
        amount: 250.00,
        description: 'Grocery store purchase',
        category: 'shopping',
        status: 'completed',
        reference: `TXN-${Date.now()}-GROC`,
        merchant: 'Walmart'
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'credit',
        amount: 5000.00,
        description: 'Salary deposit',
        category: 'income',
        status: 'completed',
        reference: `TXN-${Date.now()}-SAL`,
        merchant: 'Employer'
      },
      {
        userId: newUser._id,
        accountId: newAccount._id,
        type: 'debit',
        amount: 150.00,
        description: 'Gas station',
        category: 'transportation',
        status: 'completed',
        reference: `TXN-${Date.now()}-GAS`,
        merchant: 'Shell'
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

createTosinUser();
