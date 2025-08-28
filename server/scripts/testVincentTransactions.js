const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String
});

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  accountId: mongoose.Schema.Types.ObjectId,
  type: String,
  amount: Number,
  description: String,
  category: String,
  status: String,
  reference: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

async function testVincentTransactions() {
  try {
    console.log('🔍 Testing Vincent\'s transaction data...');
    
    // Find Vincent user
    const vincent = await User.findOne({ username: 'Vincent4u' });
    if (!vincent) {
      console.log('❌ Vincent user not found');
      return;
    }
    
    console.log('✅ Found Vincent user:', vincent.username);
    
    // Get transaction count
    const totalTransactions = await Transaction.countDocuments({ userId: vincent._id });
    console.log(`📊 Total transactions: ${totalTransactions}`);
    
    // Test pagination
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find({ userId: vincent._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`📄 Page ${page} (${limit} transactions):`);
    transactions.forEach((txn, index) => {
      console.log(`${index + 1}. ${txn.description} - $${txn.amount} (${txn.type}) - ${txn.createdAt.toDateString()}`);
    });
    
    // Test summary
    const summaryResult = await Transaction.aggregate([
      { $match: { userId: vincent._id } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCredits: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          totalDebits: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, { $abs: '$amount' }, 0] } }
        }
      }
    ]);
    
    const summary = summaryResult[0] || { totalAmount: 0, totalCredits: 0, totalDebits: 0 };
    console.log('\n💰 Transaction Summary:');
    console.log(`Total Amount: $${summary.totalAmount.toLocaleString()}`);
    console.log(`Total Credits: $${summary.totalCredits.toLocaleString()}`);
    console.log(`Total Debits: $${summary.totalDebits.toLocaleString()}`);
    
    // Test date range
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const recentTransactions = await Transaction.countDocuments({
      userId: vincent._id,
      createdAt: { $gte: twoYearsAgo }
    });
    
    console.log(`\n📅 Transactions in last 2 years: ${recentTransactions}`);
    
  } catch (error) {
    console.error('❌ Error testing transactions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testVincentTransactions(); 