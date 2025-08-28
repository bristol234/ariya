const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createVincentUser = async () => {
  try {
    console.log('🚀 Starting Vincent4u user creation...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await mongoose.connection.db.collection('users').findOne({ username: 'Vincent4u' });
    if (existingUser) {
      console.log('User Vincent4u already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Grant@gabby1234', saltRounds);

    // Generate account numbers
    const checkingAccountNumber = '1' + Math.random().toString().slice(2, 11);
    const savingsAccountNumber = '2' + Math.random().toString().slice(2, 11);

    // Create user document
    const userDoc = {
      username: 'Vincent4u',
      email: 'bristolsteve88@gmail.com',
      password: hashedPassword,
      firstName: 'Vincent',
      lastName: 'Grant Gill',
      phoneNumber: '+1234567890',
      dateOfBirth: '1957-04-12',
      memberSince: '2015-01-01',
      isAdmin: false,
      isActive: true,
      role: 'user',
      accounts: {
        checking: {
          accountNumber: checkingAccountNumber,
          balance: 741000,
          type: 'checking',
          name: 'Simply Streaming Checking'
        },
        savings: {
          accountNumber: savingsAccountNumber,
          balance: 1800000,
          type: 'savings',
          name: 'High Yield Savings'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user
    const result = await mongoose.connection.db.collection('users').insertOne(userDoc);
    console.log('✅ Vincent4u user created successfully');
    console.log('📊 User ID:', result.insertedId);
    console.log('💰 Checking Account:', checkingAccountNumber, '- $741,000');
    console.log('💰 Savings Account:', savingsAccountNumber, '- $1,800,000');

    // Create transaction history
    console.log('📈 Creating transaction history...');
    
    const transactionTypes = ['deposit', 'withdrawal', 'transfer', 'wire_transfer', 'payment'];
    const descriptions = [
      'Salary deposit',
      'Online purchase',
      'Utility bill payment',
      'Restaurant payment',
      'Gas station purchase',
      'Grocery store purchase',
      'Insurance payment',
      'Phone bill payment',
      'Internet service payment',
      'Credit card payment',
      'Investment transfer',
      'ATM withdrawal',
      'Direct deposit',
      'Check deposit',
      'Wire transfer',
      'Online transfer',
      'Bill payment',
      'Subscription payment',
      'Medical payment',
      'Home improvement purchase'
    ];

    const merchants = [
      'Walmart',
      'Amazon',
      'Target',
      'Costco',
      'Shell',
      'Exxon',
      'McDonald\'s',
      'Starbucks',
      'Netflix',
      'Spotify',
      'Verizon',
      'AT&T',
      'Comcast',
      'State Farm',
      'Geico',
      'Home Depot',
      'Lowe\'s',
      'Best Buy',
      'Apple Store',
      'Microsoft'
    ];

    const transactions = [];
    const now = new Date();
    const tenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 10, 1);

    // Generate transactions for the past 10 months
    for (let i = 0; i < 150; i++) {
      const randomDate = new Date(tenMonthsAgo.getTime() + Math.random() * (now.getTime() - tenMonthsAgo.getTime()));
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.floor(Math.random() * 5000) + 10; // $10 to $5000
      const accountType = Math.random() > 0.5 ? 'checking' : 'savings';
      const status = Math.random() > 0.1 ? 'completed' : 'pending'; // 90% completed, 10% pending

      const transaction = {
        userId: result.insertedId,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        type: transactionType,
        status: status,
        amount: transactionType === 'withdrawal' ? -amount : amount,
        currency: 'USD',
        fromAccount: accountType === 'checking' ? checkingAccountNumber : savingsAccountNumber,
        toAccount: transactionType === 'transfer' ? (accountType === 'checking' ? savingsAccountNumber : checkingAccountNumber) : undefined,
        description: description,
        merchant: merchant,
        category: transactionType,
        location: 'Nashville, TN',
        reference: `REF${Math.floor(Math.random() * 1000000)}`,
        createdAt: randomDate,
        updatedAt: randomDate
      };

      transactions.push(transaction);
    }

    // Insert all transactions
    if (transactions.length > 0) {
      let successCount = 0;
      for (const transaction of transactions) {
        try {
          await mongoose.connection.db.collection('transactions').insertOne(transaction);
          successCount++;
        } catch (error) {
          console.log(`⚠️ Transaction ${successCount + 1} failed:`, error.message);
        }
      }
      console.log(`✅ Created ${successCount} transaction records for Vincent4u`);
    }

    console.log('🎉 Vincent4u user setup complete!');
    console.log('📧 Email: bristolsteve88@gmail.com');
    console.log('👤 Username: Vincent4u');
    console.log('🔑 Password: Grant@gabby1234');
    console.log('💰 Checking Balance: $741,000');
    console.log('💰 Savings Balance: $1,800,000');
    console.log('📅 Member Since: 2015');

  } catch (error) {
    console.error('❌ Error creating Vincent4u user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createVincentUser();
