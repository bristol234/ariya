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

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testPassword() {
  try {
    console.log('🔍 Testing password comparison...');
    
    const user = await User.findOne({ username: 'demo' });
    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }
    
    console.log('✅ Found demo user');
    console.log('🔑 Testing password: demo123');
    
    const isValid = await user.comparePassword('demo123');
    console.log(`Password comparison result: ${isValid}`);
    
    if (isValid) {
      console.log('✅ Password comparison working correctly');
    } else {
      console.log('❌ Password comparison failed');
      
      // Let's create a new user with a known password
      console.log('🔄 Creating new test user...');
      const testPassword = await bcrypt.hash('test123', 10);
      const testUser = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      });
      
      await testUser.save();
      console.log('✅ Test user created with password: test123');
    }

  } catch (error) {
    console.error('❌ Error testing password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPassword(); 