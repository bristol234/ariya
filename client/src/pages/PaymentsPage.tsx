import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowDownToLine,
  Home,
  Send,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Plus,
  Repeat
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useNavigate, Link } from 'react-router-dom';

interface Account {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
  availableBalance?: number;
  availableCredit?: number;
  accountName: string;
  status: string;
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pay-bills' | 'scheduled' | 'payees'>('pay-bills');

  // Pay bills form
  const [payBillsForm, setPayBillsForm] = useState({
    fromAccountId: '',
    payeeName: '',
    amount: '',
    date: '',
    description: ''
  });

  // Success/error states
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data.accounts);
      if (response.data.accounts.length > 0) {
        setPayBillsForm(prev => ({ ...prev, fromAccountId: response.data.accounts[0].id }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handlePayBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus({ type: null, message: '' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPaymentStatus({
        type: 'success',
        message: 'Payment submitted successfully!'
      });

      // Reset form
      setPayBillsForm({
        fromAccountId: payBillsForm.fromAccountId,
        payeeName: '',
        amount: '',
        date: '',
        description: ''
      });
    } catch (error: any) {
      setPaymentStatus({
        type: 'error',
        message: 'Payment failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAccountDisplayName = (account: Account) => {
    return `${account.accountName} (${account.accountNumber})`;
  };

  const getAvailableBalance = (account: Account) => {
    if (account.type === 'credit') {
      return account.availableCredit || 0;
    }
    return account.availableBalance || account.balance;
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'transfers', label: 'Transfers', icon: Send },
    { id: 'payments', label: 'Payments', icon: ArrowDownToLine },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#002C5F] text-white">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/Untitledlogo.png" 
                alt="CFCU" 
                className="h-8 w-auto cursor-pointer"
              />
              <span className="font-semibold text-lg">Digital Banking</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="bg-[#003d99] rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-blue-200">Member since {user?.memberSince}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'payments') {
                    // Already on payments page
                  } else if (item.id === 'overview') {
                    navigate('/dashboard');
                  } else if (item.id === 'transfers') {
                    navigate('/transfer');
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.id === 'payments'
                    ? 'bg-[#003d99] text-white' 
                    : 'text-blue-100 hover:bg-[#003d99] hover:bg-opacity-50'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t border-[#003d99]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-[#003d99] hover:bg-opacity-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pay Bills</h1>
            <p className="text-gray-600 mt-1">Manage your bill payments and scheduled payments</p>
          </div>

          {/* Payment Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('pay-bills')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pay-bills'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ArrowDownToLine size={16} className="inline mr-2" />
                  Pay Bills
                </button>
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'scheduled'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Repeat size={16} className="inline mr-2" />
                  Scheduled Payments
                </button>
                <button
                  onClick={() => setActiveTab('payees')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payees'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText size={16} className="inline mr-2" />
                  Manage Payees
                </button>
              </nav>
            </div>

            {/* Payment Forms */}
            <div className="p-6">
              {activeTab === 'pay-bills' && (
                <form onSubmit={handlePayBills} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Account
                      </label>
                      <select
                        value={payBillsForm.fromAccountId}
                        onChange={(e) => setPayBillsForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        required
                      >
                        <option value="">Select account</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {getAccountDisplayName(account)} - {formatCurrency(getAvailableBalance(account))}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payee Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payee Name
                      </label>
                      <input
                        type="text"
                        value={payBillsForm.payeeName}
                        onChange={(e) => setPayBillsForm(prev => ({ ...prev, payeeName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="Company name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={payBillsForm.amount}
                          onChange={(e) => setPayBillsForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={payBillsForm.date}
                        onChange={(e) => setPayBillsForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={payBillsForm.description}
                      onChange={(e) => setPayBillsForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                      placeholder="What's this payment for?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BE9B4C] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#A88B3F] focus:ring-2 focus:ring-[#BE9B4C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Submit Payment'}
                  </button>
                </form>
              )}

              {activeTab === 'scheduled' && (
                <div className="text-center py-12">
                  <Repeat size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Payments</h3>
                  <p className="text-gray-500">Set up recurring payments for your bills.</p>
                </div>
              )}

              {activeTab === 'payees' && (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Payees</h3>
                  <p className="text-gray-500">Add and manage your bill payees.</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {paymentStatus.type && (
            <div className={`p-4 rounded-lg mb-6 ${
              paymentStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {paymentStatus.type === 'success' ? (
                  <CheckCircle className="mr-2" size={20} />
                ) : (
                  <AlertCircle className="mr-2" size={20} />
                )}
                {paymentStatus.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 