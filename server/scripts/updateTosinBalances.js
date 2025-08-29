require('dotenv').config();
const mongoose = require('mongoose');

const updateTosinBalances = async () => {
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

    // Find and update the user
    const user = await User.findOne({ username: 'tosin123' });
    if (!user) {
      console.log('❌ User tosin123 not found');
      return;
    }

    console.log('👤 Updating user: tosin123...');
    console.log('💰 Current balances:');
    console.log('   Checking: $', user.accounts.checking.balance || 0);
    console.log('   Savings: $', user.accounts.savings.balance || 0);

    // Update missing required fields and balances
    user.phoneNumber = user.phoneNumber || '+1234567890';
    user.accounts.checking.accountNumber = user.accounts.checking.accountNumber || 'CHK' + Math.random().toString().slice(2, 10);
    user.accounts.savings.accountNumber = user.accounts.savings.accountNumber || 'SAV' + Math.random().toString().slice(2, 10);
    user.accounts.checking.balance = 5000.00;
    user.accounts.savings.balance = 15000.00;
    user.updatedAt = new Date();

    await user.save();
    
    console.log('✅ User updated successfully!');
    console.log('💰 New balances:');
    console.log('   Checking: $5,000.00');
    console.log('   Savings: $15,000.00');
    console.log('📱 Phone: +1234567890');
    console.log('🎉 User tosin123 is ready for testing!');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateTosinBalances();
