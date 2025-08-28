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

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    // Update admin user
    adminUser.isAdmin = true;
    adminUser.isActive = true;
    
    // Add account structure if missing
    if (!adminUser.accounts) {
      adminUser.accounts = {
        checking: {
          accountNumber: '1' + Math.random().toString().slice(2, 11),
          balance: 10000
        },
        savings: {
          accountNumber: '2' + Math.random().toString().slice(2, 11),
          balance: 50000
        }
      };
    }

    await adminUser.save();

    console.log('Admin user updated successfully!');
    console.log('Username: admin');
    console.log('Admin: Yes');
    console.log('Active: Yes');
    console.log('Checking Account:', adminUser.accounts.checking.accountNumber);
    console.log('Savings Account:', adminUser.accounts.savings.accountNumber);

  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdmin();
