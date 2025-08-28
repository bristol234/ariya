const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema (simplified for script)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  accounts: {
    checking: {
      accountNumber: {
        type: String,
        required: true,
        unique: true
      },
      balance: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    savings: {
      accountNumber: {
        type: String,
        required: true,
        unique: true
      },
      balance: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate account numbers
userSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate checking account number (10 digits)
    this.accounts.checking.accountNumber = '1' + Math.random().toString().slice(2, 11);
    
    // Generate savings account number (10 digits)
    this.accounts.savings.accountNumber = '2' + Math.random().toString().slice(2, 11);
  }
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@cfcu.org',
      password: 'admin123',
      phoneNumber: '+1234567890',
      firstName: 'System',
      lastName: 'Administrator',
      accounts: {
        checking: {
          accountNumber: '1' + Math.random().toString().slice(2, 11),
          balance: 10000
        },
        savings: {
          accountNumber: '2' + Math.random().toString().slice(2, 11),
          balance: 50000
        }
      },
      isAdmin: true,
      isActive: true
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@cfcu.org');
    console.log('Checking Account:', adminUser.accounts.checking.accountNumber);
    console.log('Savings Account:', adminUser.accounts.savings.accountNumber);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
