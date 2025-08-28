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
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Target,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountsAPI, transactionsAPI } from '../services/api';
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

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [spendingAnalysis, setSpendingAnalysis] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'spending' | 'trends'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, spendingRes] = await Promise.all([
        accountsAPI.getAll(),
        transactionsAPI.getSpendingAnalysis({ period: '30' })
      ]);

      if (accountsRes.data) {
        setAccounts(accountsRes.data.accounts);
      }

      if (spendingRes.data) {
        setSpendingAnalysis(spendingRes.data.spendingByCategory || []);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const totalBalance = accounts.reduce((sum, account) => sum + getAvailableBalance(account), 0);
  const totalSpending = spendingAnalysis.reduce((sum, category) => sum + category.amount, 0);

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
                  if (item.id === 'analytics') {
                    // Already on analytics page
                  } else if (item.id === 'overview') {
                    navigate('/dashboard');
                  } else if (item.id === 'transfers') {
                    navigate('/transfer');
                  } else if (item.id === 'payments') {
                    navigate('/payments');
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.id === 'analytics'
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
            <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-gray-600 mt-1">Track your spending, analyze trends, and manage your finances</p>
          </div>

          {/* Analytics Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 size={16} className="inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('spending')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'spending'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <PieChart size={16} className="inline mr-2" />
                  Spending Analysis
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'trends'
                      ? 'border-[#BE9B4C] text-[#002C5F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp size={16} className="inline mr-2" />
                  Trends
                </button>
              </nav>
            </div>

            {/* Analytics Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-[#002C5F] to-[#003d99] rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-200 text-sm">Total Balance</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                        </div>
                        <Wallet size={32} className="text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-200 text-sm">Total Spending</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
                        </div>
                        <TrendingDown size={32} className="text-red-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-200 text-sm">Accounts</p>
                          <p className="text-2xl font-bold">{accounts.length}</p>
                        </div>
                        <CreditCard size={32} className="text-green-200" />
                      </div>
                    </div>
                  </div>

                  {/* Account Balances */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
                    <div className="space-y-4">
                      {accounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#002C5F] rounded-lg flex items-center justify-center text-white">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{account.accountName}</p>
                              <p className="text-sm text-gray-500">{account.accountNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(getAvailableBalance(account))}
                            </p>
                            <p className="text-sm text-gray-500">{account.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'spending' && (
                <div className="space-y-6">
                  {/* Spending by Category */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category (Last 30 Days)</h3>
                    {spendingAnalysis.length > 0 ? (
                      <div className="space-y-4">
                        {spendingAnalysis.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#002C5F] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {category.category.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{category.category}</p>
                                <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of total</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-red-600">
                                -{formatCurrency(category.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PieChart size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No spending data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  {/* Monthly Trends */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <TrendingUp size={24} className="text-green-600" />
                          <h4 className="font-semibold text-gray-900">Income Trend</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">This Month</span>
                            <span className="font-semibold text-green-600">+$2,500</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Month</span>
                            <span className="font-semibold text-green-600">+$2,400</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Change</span>
                            <span className="font-semibold text-green-600">+4.2%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <TrendingDown size={24} className="text-red-600" />
                          <h4 className="font-semibold text-gray-900">Spending Trend</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">This Month</span>
                            <span className="font-semibold text-red-600">-$1,200</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Month</span>
                            <span className="font-semibold text-red-600">-$1,350</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Change</span>
                            <span className="font-semibold text-green-600">-11.1%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Goals */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">Emergency Fund</h4>
                            <p className="text-sm text-gray-500">Target: $10,000</p>
                          </div>
                          <Target size={24} className="text-[#002C5F]" />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-[#002C5F] h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">$7,500 saved</span>
                          <span className="text-gray-600">75%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 