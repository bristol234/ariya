const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  memberSince: Date,
  phone: String,
  dateOfBirth: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  }
});

const User = mongoose.model('User', userSchema);

// Define Account Schema
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  balance: { type: Number, default: 0 },
  routingNumber: { type: String, default: '021000021' },
  status: { type: String, default: 'active' }
});

const Account = mongoose.model('Account', accountSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, default: 'completed' },
  reference: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Generate random transaction data
const generateTransactionData = (accountId, accountType, startDate, endDate) => {
  const transactions = [];
  const categories = {
    checking: [
      'Grocery Store', 'Gas Station', 'Restaurant', 'Online Purchase', 'ATM Withdrawal',
      'Utility Bill', 'Insurance Payment', 'Phone Bill', 'Internet Service', 'Streaming Service',
      'Coffee Shop', 'Pharmacy', 'Hardware Store', 'Bookstore', 'Clothing Store'
    ],
    savings: [
      'Interest Payment', 'Direct Deposit', 'Transfer from Checking', 'Dividend Payment',
      'CD Maturity', 'Investment Return', 'Bonus Payment', 'Tax Refund', 'Insurance Settlement',
      'Royalty Payment', 'Consulting Fee', 'Speaking Engagement', 'Book Sales', 'Music Royalties'
    ]
  };

  const descriptions = {
    checking: [
      'Walmart', 'Shell Gas', 'McDonald\'s', 'Amazon.com', 'Bank ATM',
      'Nashville Electric', 'State Farm', 'AT&T', 'Comcast', 'Netflix',
      'Starbucks', 'CVS Pharmacy', 'Home Depot', 'Barnes & Noble', 'Target'
    ],
    savings: [
      'CFCU Interest', 'Salary Deposit', 'Internal Transfer', 'Investment Dividend',
      'CD Maturity', 'Portfolio Return', 'Annual Bonus', 'IRS Refund', 'Insurance Claim',
      'Music Royalty', 'Consulting Work', 'Conference Speech', 'Book Sales', 'Song Royalty'
    ]
  };

  const currentDate = new Date(startDate);
  const endDateTime = new Date(endDate);
  
  while (currentDate <= endDateTime) {
    // Generate 1-3 transactions per day
    const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const categoryIndex = Math.floor(Math.random() * categories[accountType].length);
      const descriptionIndex = Math.floor(Math.random() * descriptions[accountType].length);
      
      let amount;
      if (accountType === 'checking') {
        // Checking account transactions (mostly debits)
        amount = Math.random() > 0.3 ? 
          -(Math.random() * 200 + 10) : // Debit
          (Math.random() * 5000 + 1000); // Credit
      } else {
        // Savings account transactions (mostly credits)
        amount = Math.random() > 0.2 ? 
          (Math.random() * 10000 + 1000) : // Credit
          -(Math.random() * 5000 + 1000); // Debit
      }

      const transaction = {
        userId: null, // Will be set later
        accountId: accountId,
        type: amount > 0 ? 'credit' : 'debit',
        amount: Math.round(amount * 100) / 100,
        description: descriptions[accountType][descriptionIndex],
        category: categories[accountType][categoryIndex],
        status: 'completed',
        reference: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      };
      
      transactions.push(transaction);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return transactions;
};

async function createVincentAccount() {
  try {
    console.log('🔧 Creating Vincent Grant Gill account...');
    
    // Delete existing user if exists
    await User.deleteOne({ username: 'Vincent4u' });
    console.log('🗑️  Deleted existing Vincent user');
    
    // Create new user
    const password = await bcrypt.hash('Grant@gabby123', 10);
    const vincentUser = new User({
      username: 'Vincent4u',
      email: 'bristolsteve88@gmail.com',
      password: password,
      firstName: 'Vincent',
      lastName: 'Grant Gill',
      role: 'user',
      memberSince: new Date('2015-03-20'),
      phone: '(615) 555-9876',
      dateOfBirth: '1957-04-12',
      address: {
        street: '456 Music Row',
        city: 'Nashville',
        state: 'TN',
        zip: '37203'
      }
    });

    await vincentUser.save();
    console.log('✅ Vincent user created');

    // Create checking account
    const checkingAccount = new Account({
      userId: vincentUser._id,
      accountNumber: '111222333',
      type: 'checking',
      balance: 741000.00,
      routingNumber: '021000021',
      status: 'active'
    });

    await checkingAccount.save();
    console.log('✅ Checking account created with balance: $741,000');

    // Create savings account
    const savingsAccount = new Account({
      userId: vincentUser._id,
      accountNumber: '444555666',
      type: 'savings',
      balance: 1800000.00,
      routingNumber: '021000021',
      status: 'active'
    });

    await savingsAccount.save();
    console.log('✅ Savings account created with balance: $1,800,000');

    // Generate transaction history for the past 2 years
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);

    console.log('📊 Generating transaction history...');

    // Generate checking account transactions
    const checkingTransactions = generateTransactionData(
      checkingAccount._id, 
      'checking', 
      startDate, 
      endDate
    );

    // Generate savings account transactions
    const savingsTransactions = generateTransactionData(
      savingsAccount._id, 
      'savings', 
      startDate, 
      endDate
    );

    // Set userId for all transactions
    const allTransactions = [...checkingTransactions, ...savingsTransactions].map(txn => ({
      ...txn,
      userId: vincentUser._id
    }));

    // Insert transactions in batches
    const batchSize = 100;
    for (let i = 0; i < allTransactions.length; i += batchSize) {
      const batch = allTransactions.slice(i, i + batchSize);
      await Transaction.insertMany(batch);
    }

    console.log(`✅ Created ${allTransactions.length} transactions`);
    console.log(`📅 Transaction period: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    console.log('\n🎉 Vincent Grant Gill account created successfully!');
    console.log('\n📋 Account Details:');
    console.log('Username: Vincent4u');
    console.log('Password: Grant@gabby123');
    console.log('Email: bristolsteve88@gmail.com');
    console.log('DOB: April 12, 1957');
    console.log('Member Since: 2015');
    console.log('Checking Balance: $741,000');
    console.log('Savings Balance: $1,800,000');
    console.log(`Transaction History: ${allTransactions.length} transactions over 2 years`);

  } catch (error) {
    console.error('❌ Error creating Vincent account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createVincentAccount(); 