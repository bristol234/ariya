const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  accounts: {
    checking: { accountNumber: String, balance: { type: Number, default: 0 } },
    savings: { accountNumber: String, balance: { type: Number, default: 0 } }
  },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isNew) {
    this.accounts.checking.accountNumber = '1' + Math.random().toString().slice(2, 11);
    this.accounts.savings.accountNumber = '2' + Math.random().toString().slice(2, 11);
  }
  next();
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const args = process.argv.slice(2);
    const username = args[0] || 'john.doe';
    const email = args[1] || 'john.doe@example.com';
    const password = args[2] || 'password123';
    const firstName = args[3] || 'John';
    const lastName = args[4] || 'Doe';
    const phoneNumber = args[5] || '+1234567890';
    const checkingBalance = parseFloat(args[6]) || 5000;
    const savingsBalance = parseFloat(args[7]) || 10000;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.username);
      return;
    }

    const newUser = new User({
      username, email, password, phoneNumber, firstName, lastName,
      accounts: {
        checking: { accountNumber: '', balance: checkingBalance },
        savings: { accountNumber: '', balance: savingsBalance }
      }
    });

    await newUser.save();

    console.log('User created successfully!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Email:', email);
    console.log('Checking Account:', newUser.accounts.checking.accountNumber);
    console.log('Savings Account:', newUser.accounts.savings.accountNumber);

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createUser(); 