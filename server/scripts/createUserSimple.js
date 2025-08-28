const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simple User Schema for the script
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  memberSince: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Simple Account Schema for the script
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true, length: 9 },
  type: { type: String, enum: ['checking', 'savings', 'credit'], required: true },
  accountName: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  availableBalance: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'frozen', 'closed'], default: 'active' },
  routingNumber: { type: String, required: true, length: 9 },
  monthlyFee: { type: Number, default: 0 },
  minimumBalance: { type: Number, default: 0 },
  interestRate: { type: Number, default: 0 },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

// Generate unique 9-digit account number
const generateUniqueAccountNumber = async () => {
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    const existingAccount = await Account.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }
  
  return accountNumber;
};

// Create user with accounts
const createUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username: userData.username }, { email: userData.email }] 
    });
    
    if (existingUser) {
      console.log(`❌ User with username '${userData.username}' or email '${userData.email}' already exists`);
      return null;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    console.log(`✅ User created: ${userData.username}`);

    // Create accounts for the user
    const accounts = [];
    
    if (userData.accounts) {
      for (const accountData of userData.accounts) {
        const accountNumber = await generateUniqueAccountNumber();
        
        const account = new Account({
          userId: user._id,
          accountNumber,
          ...accountData,
          routingNumber: '264080811'
        });
        
        await account.save();
        accounts.push(account);
        console.log(`✅ Account created: ${accountData.type} - ${accountNumber}`);
      }
    }

    return { user, accounts };
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return null;
  }
};

// Example usage
const createExampleUsers = async () => {
  await connectDB();

  const users = [
    {
      username: 'demo',
      email: 'demo@cfcu.org',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-06-15',
      phone: '(615) 555-0123',
      role: 'user',
      memberSince: '2020-01-15',
      address: {
        street: '123 Main St',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37212'
      },
      accounts: [
        {
          type: 'checking',
          accountName: 'Primary Checking',
          balance: 2547.89,
          availableBalance: 2447.89,
          monthlyFee: 0,
          minimumBalance: 0,
          interestRate: 0.01,
          isPrimary: true
        },
        {
          type: 'savings',
          accountName: 'High Yield Savings',
          balance: 12543.67,
          availableBalance: 12543.67,
          monthlyFee: 0,
          minimumBalance: 100,
          interestRate: 2.15,
          isPrimary: false
        }
      ]
    },
    {
      username: 'vincent4u',
      email: 'bristolsteve8@gmail.com',
      password: 'Grant@gabby123',
      firstName: 'Vincent',
      lastName: 'Gill',
      dateOfBirth: '1957-04-12',
      phone: '(615) 555-9876',
      role: 'user',
      memberSince: '2015-03-20',
      address: {
        street: '456 Music Row',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37203'
      },
      accounts: [
        {
          type: 'checking',
          accountName: 'Primary Checking',
          balance: 741000.00,
          availableBalance: 741000.00,
          monthlyFee: 0,
          minimumBalance: 0,
          interestRate: 0.01,
          isPrimary: true
        },
        {
          type: 'savings',
          accountName: 'High Yield Savings',
          balance: 800000.00,
          availableBalance: 800000.00,
          monthlyFee: 0,
          minimumBalance: 100,
          interestRate: 2.15,
          isPrimary: false
        }
      ]
    },
    {
      username: 'admin',
      email: 'admin@cfcu.org',
      password: 'password',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: '1985-01-01',
      phone: '(615) 555-0000',
      role: 'admin',
      memberSince: '2020-01-01',
      address: {
        street: '789 Admin Blvd',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37201'
      },
      accounts: []
    }
  ];

  console.log('🚀 Starting user creation...\n');

  for (const userData of users) {
    const result = await createUser(userData);
    if (result) {
      console.log(`✅ Successfully created user: ${userData.username}`);
      if (result.accounts.length > 0) {
        console.log(`   📊 Created ${result.accounts.length} account(s)`);
        result.accounts.forEach(account => {
          console.log(`   💳 ${account.type}: ${account.accountNumber}`);
        });
      }
    }
    console.log('');
  }

  console.log('🎉 User creation completed!');
  process.exit(0);
};

// Run the script
createExampleUsers().catch(console.error); 