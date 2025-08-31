require('dotenv').config();
const mongoose = require('mongoose');

const updateVincentBalances = async () => {
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
    const user = await User.findOne({ username: 'Vincent4u' });
    if (!user) {
      console.log('❌ User Vincent4u not found');
      return;
    }

    console.log('👤 Updating user: Vincent4u...');
    console.log('💰 Current balances:');
    console.log('   Checking: $', user.accounts.checking.balance || 0);
    console.log('   Savings: $', user.accounts.savings.balance || 0);

    // Update balances to requested amounts
    user.accounts.checking.balance = 741811.04;
    user.accounts.savings.balance = 1034.20;
    user.updatedAt = new Date();

    await user.save();
    
    console.log('✅ User updated successfully!');
    console.log('💰 New balances:');
    console.log('   Checking: $741,811.04');
    console.log('   Savings: $1,034.20');
    console.log('🎉 Vincent4u balances updated!');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateVincentBalances();
