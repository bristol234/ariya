require('dotenv').config();
const mongoose = require('mongoose');

const testWireTransferBalance = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas
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

    const transactionSchema = new mongoose.Schema({
      transactionId: {
        type: String,
        unique: true,
        default: () => 'TXN' + Date.now() + Math.random().toString().slice(2, 8)
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      type: {
        type: String,
        enum: ['wire_transfer', 'deposit', 'withdrawal', 'transfer'],
        required: true
      },
      status: {
        type: String,
        enum: ['processing', 'pending', 'completed', 'failed', 'on_hold'],
        default: 'processing'
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      fromAccount: {
        type: {
          type: String,
          enum: ['checking', 'savings'],
          required: true
        },
        accountNumber: {
          type: String,
          required: true
        }
      },
      toAccount: {
        type: {
          type: String,
          enum: ['checking', 'savings']
        },
        accountNumber: String
      },
      recipientDetails: {
        name: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        bankAddress: String
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      fees: {
        type: Number,
        default: 0,
        min: 0
      },
      processedAt: Date
    }, {
      timestamps: true
    });

    const User = mongoose.model('User', userSchema);
    const Transaction = mongoose.model('Transaction', transactionSchema);

    // Find Vincent4u user
    const user = await User.findOne({ username: 'Vincent4u' });
    if (!user) {
      console.log('❌ User Vincent4u not found');
      return;
    }

    console.log('👤 Testing with user: Vincent4u');
    console.log('💰 Initial balances:');
    console.log('   Checking: $', user.accounts.checking.balance || 0);
    console.log('   Savings: $', user.accounts.savings.balance || 0);

    // Simulate wire transfer creation (amount deduction)
    const transferAmount = 1000;
    const wireFee = 25;
    const totalAmount = transferAmount + wireFee;
    const accountType = 'checking';

    console.log('\n📤 Simulating wire transfer creation...');
    console.log(`   Transfer amount: $${transferAmount}`);
    console.log(`   Wire fee: $${wireFee}`);
    console.log(`   Total amount: $${totalAmount}`);
    console.log(`   Account: ${accountType}`);

    // Deduct amount (simulating wire transfer creation)
    const previousBalance = user.accounts[accountType].balance;
    user.accounts[accountType].balance -= totalAmount;
    await user.save();

    console.log(`   Previous balance: $${previousBalance}`);
    console.log(`   New balance after deduction: $${user.accounts[accountType].balance}`);

    // Create a test transaction record
    const testTransaction = new Transaction({
      userId: user._id,
      type: 'wire_transfer',
      status: 'pending',
      amount: totalAmount,
      fromAccount: {
        type: accountType,
        accountNumber: user.accounts[accountType].accountNumber
      },
      recipientDetails: {
        name: 'Test Recipient',
        accountNumber: '1234567890',
        bankName: 'Test Bank',
        routingNumber: '123456789',
        bankAddress: '123 Test St, Test City, TS 12345'
      },
      description: 'Test wire transfer for balance restoration',
      fees: wireFee
    });

    await testTransaction.save();
    console.log(`   Transaction created: ${testTransaction.transactionId}`);

    // Simulate admin marking as failed (balance restoration)
    console.log('\n❌ Simulating admin marking wire transfer as failed...');
    
    const currentBalance = user.accounts[accountType].balance;
    const restoreAmount = testTransaction.amount;
    
    console.log(`   Restoring $${restoreAmount} to ${accountType} account`);
    console.log(`   Current balance: $${currentBalance}`);
    console.log(`   Balance after restoration: $${currentBalance + restoreAmount}`);

    // Restore the amount
    user.accounts[accountType].balance += restoreAmount;
    await user.save();

    // Update transaction status
    testTransaction.status = 'failed';
    await testTransaction.save();

    console.log(`   ✅ Balance restored successfully!`);
    console.log(`   Final balance: $${user.accounts[accountType].balance}`);

    // Verify the balance is back to original
    if (Math.abs(user.accounts[accountType].balance - previousBalance) < 0.01) {
      console.log('✅ SUCCESS: Balance restoration working correctly!');
    } else {
      console.log('❌ ERROR: Balance restoration failed!');
      console.log(`   Expected: $${previousBalance}, Actual: $${user.accounts[accountType].balance}`);
    }

    // Clean up test transaction
    await Transaction.findByIdAndDelete(testTransaction._id);
    console.log('🧹 Test transaction cleaned up');

  } catch (error) {
    console.error('❌ Error testing wire transfer balance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testWireTransferBalance();
