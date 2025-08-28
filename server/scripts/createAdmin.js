const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define User Schema (simplified for the script)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Delete existing admin user if exists
    await User.deleteOne({ username: 'admin' });
    console.log('🗑️  Deleted existing admin user');
    
    // Create new admin user
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
    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Credentials: admin / admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin(); 