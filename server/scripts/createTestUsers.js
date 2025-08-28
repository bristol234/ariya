const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define User Schema (simplified for the script)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: 'user' },
  memberSince: { type: Date, default: Date.now },
  phone: String,
  dateOfBirth: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  }
});

const User = mongoose.model('User', userSchema);

// Define Account Schema
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  balance: { type: Number, default: 0 },
  routingNumber: { type: String, default: '021000021' },
  status: { type: String, default: 'active' }
});

const Account = mongoose.model('Account', accountSchema);

async function createTestUsers() {
  try {
    console.log('🔧 Creating test users...');

    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demoUser = new User({
      username: 'demo',
      email: 'demo@cfcu.org',
      password: demoPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      memberSince: new Date('2020-01-15'),
      phone: '(615) 555-0123',
      dateOfBirth: '1985-06-15',
      address: {
        street: '123 Main St',
        city: 'Nashville',
        state: 'TN',
        zip: '37212'
      }
    });

    await demoUser.save();
    console.log('✅ Demo user created');

    // Create Vincent user
    const vincentPassword = await bcrypt.hash('Grant@gabby123', 10);
    const vincentUser = new User({
      username: 'vincent4u',
      email: 'bristolsteve8@gmail.com',
      password: vincentPassword,
      firstName: 'Vincent',
      lastName: 'Gill',
      role: 'user',
      memberSince: new Date('2015-03-20'),
      phone: '(615) 555-9876',
      dateOfBirth: '1957-04-12',
      address: {
        street: '456 Music Row',
        city: 'Nashville',
        state: 'TN',
        zip: '37203'
      }
    });

    await vincentUser.save();
    console.log('✅ Vincent user created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@cfcu.org',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      memberSince: new Date('2020-01-01'),
      phone: '(615) 555-0000',
      dateOfBirth: '1985-01-01',
      address: {
        street: '789 Admin Blvd',
        city: 'Nashville',
        state: 'TN',
        zip: '37201'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created');

    // Create accounts for demo user
    const demoChecking = new Account({
      userId: demoUser._id,
      accountNumber: '123456789',
      type: 'checking',
      balance: 2547.89,
      routingNumber: '021000021',
      status: 'active'
    });

    const demoSavings = new Account({
      userId: demoUser._id,
      accountNumber: '987654321',
      type: 'savings',
      balance: 12543.67,
      routingNumber: '021000021',
      status: 'active'
    });

    await demoChecking.save();
    await demoSavings.save();
    console.log('✅ Demo user accounts created');

    // Create accounts for Vincent user
    const vincentChecking = new Account({
      userId: vincentUser._id,
      accountNumber: '111222333',
      type: 'checking',
      balance: 741000.00,
      routingNumber: '021000021',
      status: 'active'
    });

    const vincentSavings = new Account({
      userId: vincentUser._id,
      accountNumber: '444555666',
      type: 'savings',
      balance: 800000.00,
      routingNumber: '021000021',
      status: 'active'
    });

    await vincentChecking.save();
    await vincentSavings.save();
    console.log('✅ Vincent user accounts created');

    console.log('🎉 All test users and accounts created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Demo User: demo / demo123');
    console.log('Vincent User: vincent4u / Grant@gabby123');
    console.log('Admin User: admin / admin123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUsers(); 