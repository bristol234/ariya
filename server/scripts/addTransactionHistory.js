const mongoose = require('mongoose');
require('dotenv').config();

const addTransactionHistory = async () => {
  try {
    console.log('🚀 Starting transaction history creation for Vincent4u...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the Vincent4u user
    const user = await mongoose.connection.db.collection('users').findOne({ username: 'Vincent4u' });
    if (!user) {
      console.log('❌ User Vincent4u not found');
      return;
    }

    console.log('✅ Found Vincent4u user:', user._id);
    console.log('💰 Checking Account:', user.accounts.checking.accountNumber, '- $', user.accounts.checking.balance.toLocaleString());
    console.log('💰 Savings Account:', user.accounts.savings.accountNumber, '- $', user.accounts.savings.balance.toLocaleString());

    // Check if transactions already exist
    const existingTransactions = await mongoose.connection.db.collection('transactions').countDocuments({ userId: user._id });
    if (existingTransactions > 0) {
      console.log(`⚠️ User already has ${existingTransactions} transactions. Deleting existing transactions...`);
      await mongoose.connection.db.collection('transactions').deleteMany({ userId: user._id });
      console.log('✅ Deleted existing transactions');
    }

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
    
    // Create a more realistic distribution of dates over the past 10 months
    const daysInRange = Math.floor((now.getTime() - tenMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate transactions for the past 10 months with better date distribution
    for (let i = 0; i < 150; i++) {
      // Distribute transactions more evenly across the time period
      const dayOffset = Math.floor((i / 150) * daysInRange) + Math.floor(Math.random() * 3); // Add some randomness
      const randomDate = new Date(tenMonthsAgo.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
      
      // Add some time randomness within the day
      randomDate.setHours(Math.floor(Math.random() * 24));
      randomDate.setMinutes(Math.floor(Math.random() * 60));
      randomDate.setSeconds(Math.floor(Math.random() * 60));
      
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.floor(Math.random() * 5000) + 10; // $10 to $5000
      const accountType = Math.random() > 0.5 ? 'checking' : 'savings';
      const status = Math.random() > 0.1 ? 'completed' : 'pending'; // 90% completed, 10% pending

      const transaction = {
        userId: user._id,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}${i}`,
        type: transactionType,
        status: status,
        amount: transactionType === 'withdrawal' ? -amount : amount,
        currency: 'USD',
        fromAccount: accountType === 'checking' ? user.accounts.checking.accountNumber : user.accounts.savings.accountNumber,
        toAccount: transactionType === 'transfer' ? (accountType === 'checking' ? user.accounts.savings.accountNumber : user.accounts.checking.accountNumber) : undefined,
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

    console.log('🎉 Transaction history creation complete!');
    console.log('📧 Email: bristolsteve88@gmail.com');
    console.log('👤 Username: Vincent4u');
    console.log('🔑 Password: Grant@gabby1234');
    console.log('💰 Checking Balance: $741,000');
    console.log('💰 Savings Balance: $1,800,000');
    console.log('📅 Member Since: 2015');

  } catch (error) {
    console.error('❌ Error creating transaction history:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTransactionHistory();
