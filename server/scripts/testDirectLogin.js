const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testDirectLogin() {
  try {
    console.log('🧪 Testing direct login for Vincent...\n');

    // Step 1: Test direct login (should work like admin)
    console.log('1️⃣ Testing direct login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'Vincent4u',
      password: 'Grant@gabby123'
    });
    
    console.log('✅ Login response:', loginResponse.data);

    // Step 2: Test with a hardcoded OTP (for testing)
    console.log('\n2️⃣ Testing with hardcoded OTP...');
    const otpResponse = await axios.post(`${API_BASE}/auth/verify-otp`, {
      username: 'Vincent4u',
      email: 'bristolsteve88@gmail.com',
      otp: '123456' // This should work for testing
    });
    
    console.log('✅ OTP verification response:', {
      message: otpResponse.data.message,
      hasToken: !!otpResponse.data.token,
      hasUser: !!otpResponse.data.user,
      userData: otpResponse.data.user ? {
        username: otpResponse.data.user.username,
        email: otpResponse.data.user.email,
        firstName: otpResponse.data.user.firstName,
        lastName: otpResponse.data.user.lastName,
        role: otpResponse.data.user.role
      } : null
    });

    console.log('\n🎉 Direct login test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Use the token from the OTP response');
    console.log('2. Test the frontend with this token');
    console.log('3. Check if the authentication flow works');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDirectLogin(); 