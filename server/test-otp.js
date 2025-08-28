const axios = require('axios');

async function testOTP() {
  try {
    console.log('Testing OTP login...');
    
    // Step 1: Request OTP
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'Vincent4u',
      password: 'Grant@gabby1234'
    });
    
    console.log('Login response:', loginResponse.data);
    
    // Step 2: Try to verify with a common OTP (this will fail, but we can see the error)
    try {
      const verifyResponse = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        username: 'Vincent4u',
        code: '123456'
      });
      console.log('Verify response:', verifyResponse.data);
    } catch (error) {
      console.log('Verify error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testOTP();
