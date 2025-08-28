const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define OTP Schema
const otpSchema = new mongoose.Schema({
  email: String,
  username: String,
  otp: String,
  expiresAt: Date,
  isUsed: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 }
});

const OTP = mongoose.model('OTP', otpSchema);

async function testOTP() {
  try {
    console.log('🧪 Testing OTP functionality...\n');

    // Check existing OTPs for Vincent
    console.log('1️⃣ Checking existing OTPs for Vincent4u...');
    const existingOTPs = await OTP.find({ 
      username: 'Vincent4u', 
      email: 'bristolsteve88@gmail.com' 
    });
    
    console.log('Found OTPs:', existingOTPs.length);
    existingOTPs.forEach((otp, index) => {
      console.log(`OTP ${index + 1}:`, {
        otp: otp.otp,
        expiresAt: otp.expiresAt,
        isUsed: otp.isUsed,
        attempts: otp.attempts,
        isExpired: new Date() > otp.expiresAt
      });
    });

    // Test OTP verification
    console.log('\n2️⃣ Testing OTP verification...');
    const testOTP = '123456';
    const otpRecord = await OTP.findOne({ 
      email: 'bristolsteve88@gmail.com', 
      username: 'Vincent4u', 
      isUsed: false 
    });
    
    if (otpRecord) {
      console.log('Found OTP record:', {
        storedOTP: otpRecord.otp,
        testOTP: testOTP,
        match: otpRecord.otp === testOTP,
        isExpired: new Date() > otpRecord.expiresAt,
        attempts: otpRecord.attempts
      });
    } else {
      console.log('No OTP record found');
    }

    // Generate a new OTP for testing
    console.log('\n3️⃣ Generating new OTP...');
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete existing OTPs
    await OTP.deleteMany({ email: 'bristolsteve88@gmail.com', username: 'Vincent4u' });
    
    // Create new OTP
    await OTP.create({
      email: 'bristolsteve88@gmail.com',
      username: 'Vincent4u',
      otp: newOTP,
      expiresAt
    });
    
    console.log('✅ New OTP created:', newOTP);
    console.log('📧 You can now use this OTP to test login:', newOTP);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testOTP(); 