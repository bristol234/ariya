const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  isAdmin: Boolean,
  isActive: Boolean,
  accounts: {
    checking: { accountNumber: String, balance: Number },
    savings: { accountNumber: String, balance: Number }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('-password');
    
    console.log('\nUsers in database:');
    console.log('==================');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Checking: ${user.accounts.checking.accountNumber} ($${user.accounts.checking.balance})`);
      console.log(`   Savings: ${user.accounts.savings.accountNumber} ($${user.accounts.savings.balance})`);
      console.log(`   Created: ${user.createdAt}`);
    });

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

listUsers();
