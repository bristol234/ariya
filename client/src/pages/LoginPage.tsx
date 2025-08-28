import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, User, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP state
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Prefill username from URL params (when coming from modal)
  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 Form submitted!');
    e.preventDefault();
    console.log('✅ Form prevented default');
    setIsLoading(true);
    setError('');
    
    console.log('🔐 Login attempt for username:', username);
    console.log('🔐 Password length:', password.length);

    try {
      console.log('📡 Making API call to login...');
      const response = await authAPI.login(username, password);
      
      // Check if OTP is required
      if (response.data.otpSent) {
        console.log('📧 OTP sent, showing OTP input');
        setUserEmail(response.data.user.email);
        setShowOTPInput(true);
        toast.success('OTP sent to your email!');
      } else {
        // Direct login (for admin users)
        const { token, user: userData } = response.data;
        await login(token, userData);
        toast.success('Login successful!');
        
        // Redirect based on user type
        if (userData.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error message:', err.message);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      toast.error('Login failed');
    } finally {
      console.log('🏁 Login attempt completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');

    try {
      console.log('🔐 Verifying OTP for username:', username);
      const response = await authAPI.verifyOTP(username, otpCode);
      const { token, user: userData } = response.data;
      
      await login(token, userData);
      toast.success('Login successful!');
      
      // Redirect to dashboard (regular users)
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('❌ OTP verification error:', err);
      setError(err.response?.data?.error || 'Invalid OTP code. Please try again.');
      toast.error('Invalid OTP code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOTPInput(false);
    setOtpCode('');
    setError('');
  };

  // OTP Input Form
  if (showOTPInput) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-[#002C5F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/">
                  <img 
                    src="/Untitledlogo.png" 
                    alt="Cornerstone Financial Credit Union" 
                    className="h-12 w-auto cursor-pointer"
                  />
                </Link>
              </div>
              <div className="flex items-center">
                <HelpCircle size={24} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Back Button */}
              <button
                onClick={handleBackToLogin}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </button>

              {/* OTP Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Enter Verification Code</h1>
                <p className="text-gray-600 mt-2">
                  We've sent a 6-digit code to <strong>{userEmail}</strong>
                </p>
              </div>

              {/* OTP Form */}
              <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl font-mono tracking-widest"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#002C5F] hover:bg-[#001F4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#002C5F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/Untitledlogo.png" 
                  alt="Cornerstone Financial Credit Union" 
                  className="h-12 w-auto cursor-pointer"
                />
              </Link>
            </div>
            
            {/* Question Mark Icon */}
            <div className="flex items-center">
              <HelpCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Login Modal */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Login Modal */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            {/* Modal Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Digital Banking</h1>
            </div>

            {/* Login Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F] text-gray-900 placeholder-gray-500"
                    placeholder="Enter username"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F] text-gray-900 placeholder-gray-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Username Toggle */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setRememberUsername(!rememberUsername)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#002C5F] focus:ring-offset-2 ${
                    rememberUsername ? 'bg-[#BE9B4C]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      rememberUsername ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label htmlFor="remember-username" className="text-sm text-gray-700">
                  Remember Username
                </label>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#BE9B4C] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#a88a43] focus:outline-none focus:ring-2 focus:ring-[#BE9B4C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Log In'
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-[#002C5F] hover:text-[#003d99] text-sm font-medium"
                >
                  Forgot your username or password?
                </a>
              </div>

              
            </form>


          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Left Side */}
            <div className="flex flex-col space-y-4">
              {/* Navigation Links */}
              <div className="flex flex-wrap space-x-6 text-sm">
                <a href="#" className="text-[#002C5F] hover:text-[#003d99]">Locations</a>
                <a href="#" className="text-[#002C5F] hover:text-[#003d99]">Disclosures</a>
                <a href="#" className="text-[#002C5F] hover:text-[#003d99]">Privacy Policy</a>
                <span className="text-gray-600">Routing # 264080811</span>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white hover:bg-[#003d99] transition-colors">
                  <span className="text-sm font-bold">f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white hover:bg-[#003d99] transition-colors">
                  <span className="text-sm font-bold">X</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white hover:bg-[#003d99] transition-colors">
                  <span className="text-sm">📷</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white hover:bg-[#003d99] transition-colors">
                  <span className="text-sm font-bold">in</span>
                </a>
                <a href="#" className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white hover:bg-[#003d99] transition-colors">
                  <span className="text-sm">▶</span>
                </a>
              </div>

              {/* Copyright and Insurance */}
              <div className="text-sm text-gray-600 max-w-md">
                <p>Cornerstone Financial Credit Union is federally insured by the National Credit Union Administration. Copyright © 2025 Cornerstone Financial Credit Union.</p>
              </div>


            </div>

            {/* Right Side - Regulatory Badges */}
            <div className="flex flex-col space-y-4">
              {/* Equal Housing Opportunity */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <div className="w-4 h-3 bg-white rounded-sm relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-0.5 h-2 bg-gray-700"></div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-700 font-medium">EQUAL HOUSING OPPORTUNITY</span>
              </div>

              {/* NCUA Badge */}
              <div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs">
                <div className="text-center">
                  <p className="text-xs mb-1">Your savings federally insured to at least $250,000</p>
                  <p className="text-lg font-bold mb-1">NCUA</p>
                  <p className="text-xs">National Credit Union Administration, a U.S. Government Agency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage; 