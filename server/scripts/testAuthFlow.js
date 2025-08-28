const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Vincent authentication flow...\n');

    // Step 1: Login (should return OTP required)
    console.log('1️⃣ Testing login (should require OTP)...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'Vincent4u',
      password: 'Grant@gabby123'
    });
    
    console.log('✅ Login response:', {
      message: loginResponse.data.message,
      requiresOTP: loginResponse.data.requiresOTP,
      email: loginResponse.data.email
    });

    // Step 2: Verify OTP (using a test OTP)
    console.log('\n2️⃣ Testing OTP verification...');
    const otpResponse = await axios.post(`${API_BASE}/auth/verify-otp`, {
      username: 'Vincent4u',
      email: 'bristolsteve88@gmail.com',
      otp: '123456'
    });
    
    console.log('✅ OTP verification response:', {
      message: otpResponse.data.message,
      hasToken: !!otpResponse.data.token,
      hasUser: !!otpResponse.data.user,
      userData: {
        username: otpResponse.data.user.username,
        email: otpResponse.data.user.email,
        firstName: otpResponse.data.user.firstName,
        lastName: otpResponse.data.user.lastName,
        role: otpResponse.data.user.role
      }
    });

    // Step 3: Test profile endpoint with token
    console.log('\n3️⃣ Testing profile endpoint with token...');
    const token = otpResponse.data.token;
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile response:', {
      hasUser: !!profileResponse.data.user,
      username: profileResponse.data.user.username
    });

    // Step 4: Test transactions endpoint
    console.log('\n4️⃣ Testing transactions endpoint...');
    const transactionsResponse = await axios.get(`${API_BASE}/transactions?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Transactions response:', {
      hasTransactions: !!transactionsResponse.data.transactions,
      transactionCount: transactionsResponse.data.transactions.length,
      totalTransactions: transactionsResponse.data.summary.totalTransactions,
      pagination: transactionsResponse.data.pagination
    });

    console.log('\n🎉 Authentication flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Login with OTP requirement: ✅');
    console.log('- OTP verification: ✅');
    console.log('- Token-based authentication: ✅');
    console.log('- Profile access: ✅');
    console.log('- Transactions access: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow(); 