import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  CreditCard,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Eye,
  EyeOff,
  Plus,
  Send,
  ArrowDownToLine,
  BarChart3,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountsAPI, transactionsAPI } from '../services/api';

interface Account {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  status: string;
  accountName: string;
  routingNumber: string;
  lastTransactionDate: string;
  monthlyFee: number;
  minimumBalance: number;
  interestRate: number;
  creditLimit?: number;
  availableCredit?: number;
  dueDate?: string;
  minimumPayment?: number;
  rewardsPoints?: number;
}

interface Transaction {
  id: string;
  accountId: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  reference: string;
  merchant: string;
  location: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data.accounts);
      setTotalBalance(response.data.totalBalance);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await transactionsAPI.getTransactions(1, 5);
      setRecentTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const fetchTransactions = async (page: number = 1) => {
    try {
      const response = await transactionsAPI.getTransactions(page, 10);
      setTransactions(response.data.transactions);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalTransactions(response.data.pagination.totalTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await transactionsAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Refresh data function for real-time updates
  const refreshData = () => {
    fetchAccounts();
    fetchRecentTransactions();
    if (activeTab === 'transactions') {
      fetchTransactions(currentPage);
    }
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAccounts(), fetchRecentTransactions()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle tab changes
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions(1);
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    let date: Date;
    if (!dateString) {
      date = new Date();
    } else {
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <CreditCard size={20} />;
      case 'savings': return <DollarSign size={20} />;
      case 'credit': return <TrendingUp size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ?
      <ArrowDownRight size={16} className="text-green-600" /> :
      <ArrowUpRight size={16} className="text-red-600" />;
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#002C5F] to-[#003d99] rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
            <p className="text-blue-100">Here's your financial overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts && accounts.length > 0 ? accounts.map(account => (
          <div key={account.accountNumber || account.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#002C5F] rounded-lg flex items-center justify-center text-white">
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                  <p className="text-sm text-gray-500">{account.accountNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showBalances ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Balance</span>
                <span className="font-semibold text-gray-900">
                  {showBalances ? formatCurrency(account.balance) : '••••••'}
                </span>
              </div>
              {account.type === 'credit' ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Credit</span>
                  <span className="font-semibold text-green-600">
                    {showBalances ? formatCurrency(account.availableCredit || 0) : '••••••'}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">
                    {showBalances ? formatCurrency(account.availableBalance) : '••••••'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002C5F] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading accounts...</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/transfer')}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-[#BE9B4C] rounded-lg flex items-center justify-center mb-2">
              <Send size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Transfer</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-[#002C5F] rounded-lg flex items-center justify-center mb-2">
              <ArrowDownToLine size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Pay Bills</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-2">
              <Plus size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Deposit</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-[#002C5F] hover:text-[#003d99] text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {transactions && transactions.length > 0 ? transactions.slice(0, 5).map((transaction, idx) => (
            <div key={(transaction as any).transactionId || transaction.id || idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.merchant}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </p>
                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
        <button className="bg-[#002C5F] text-white px-4 py-2 rounded-lg hover:bg-[#003d99] transition-colors">
          Open New Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts && accounts.length > 0 ? accounts.map(account => (
          <div key={account.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#002C5F] rounded-lg flex items-center justify-center text-white">
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.accountName}</h3>
                  <p className="text-sm text-gray-500">{account.accountNumber}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {account.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-semibold text-gray-900">{formatCurrency(account.balance)}</span>
              </div>
              {account.type === 'credit' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credit Limit</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(account.creditLimit || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Credit</span>
                    <span className="font-semibold text-green-600">{formatCurrency(account.availableCredit || 0)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Balance</span>
                  <span className="font-semibold text-green-600">{formatCurrency(account.availableBalance)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Routing Number</span>
                <span className="text-sm font-mono text-gray-700">{account.routingNumber}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No accounts found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {transactions.length} of {totalTransactions} transactions (Page {currentPage} of {totalPages})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Filter size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002C5F] focus:border-transparent"
              />
            </div>
            <button className="bg-[#002C5F] text-white px-4 py-2 rounded-lg hover:bg-[#003d99] transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {transactions && transactions.length > 0 ? transactions.map((transaction, idx) => (
            <div key={(transaction as any).transactionId || transaction.id || idx} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.merchant} • {transaction.location}</p>
                    <p className="text-xs text-gray-400">{transaction.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-lg ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last 30 days</span>
          <button
            onClick={() => fetchAnalytics()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh analytics"
          >
            <TrendingUp size={16} className="text-[#002C5F]" />
          </button>
        </div>
      </div>

      {analytics ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalTransactions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-[#002C5F]" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Completed: {analytics.summary.completedTransactions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.summary.totalIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (analytics.summary.totalIncome / (analytics.summary.totalIncome + analytics.summary.totalSpending)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spending</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.summary.totalSpending)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight size={24} className="text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (analytics.summary.totalSpending / (analytics.summary.totalIncome + analytics.summary.totalSpending)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Flow</p>
                  <p className={`text-2xl font-bold ${analytics.summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analytics.summary.netFlow)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${analytics.summary.netFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TrendingUp size={24} className={analytics.summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'} />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${analytics.summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.summary.netFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Types Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h3>
              <div className="space-y-3">
                {analytics.transactionsByType && analytics.transactionsByType.length > 0 ? (
                  analytics.transactionsByType.map((type: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getTypeColor(type._id)}`}></div>
                        <span className="font-medium text-gray-900 capitalize">{type._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{type.count} transactions</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getTypeColor(type._id)}`}
                            style={{ width: `${(type.count / analytics.summary.totalTransactions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No transaction type data available</p>
                )}
              </div>
            </div>

            {/* Monthly Spending Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
              <div className="space-y-3">
                {analytics.monthlySpending && analytics.monthlySpending.length > 0 ? (
                  analytics.monthlySpending.slice(-6).map((month: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {getMonthName(month._id.month)} {month._id.year}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(month.total)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(month.total / Math.max(...analytics.monthlySpending.map((m: any) => m.total))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No monthly spending data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity (Last 30 Days)</h3>
              <span className="text-sm text-gray-500">{analytics.recentActivity.count} transactions</span>
            </div>
            <div className="space-y-3">
              {analytics.recentActivity.transactions && analytics.recentActivity.transactions.length > 0 ? (
                analytics.recentActivity.transactions.map((transaction: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.amount >= 0 ? 
                          <ArrowDownRight size={20} className="text-green-600" /> : 
                          <ArrowUpRight size={20} className="text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description || 'Transaction'}</p>
                        <p className="text-sm text-gray-500">{transaction.merchant || 'Unknown merchant'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </div>

          {/* Top Merchants */}
          {analytics.topMerchants && analytics.topMerchants.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Merchants</h3>
              <div className="space-y-3">
                {analytics.topMerchants.map((merchant: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#002C5F] rounded-lg flex items-center justify-center text-white font-semibold">
                        {merchant._id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{merchant._id}</p>
                        <p className="text-sm text-gray-500">{merchant.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{formatCurrency(merchant.total)}</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(merchant.total / Math.max(...analytics.topMerchants.map((m: any) => m.total))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-gradient-to-r from-[#002C5F] to-[#003d99] rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">💡 Financial Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Spending Pattern</h4>
                <p className="text-sm text-blue-100">
                  {analytics.summary.totalSpending > analytics.summary.totalIncome 
                    ? 'Your spending exceeds your income. Consider reviewing your budget.'
                    : 'Great job! Your income exceeds your spending.'
                  }
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Transaction Activity</h4>
                <p className="text-sm text-blue-100">
                  You've made {analytics.summary.totalTransactions} transactions in the last 30 days, 
                  with {analytics.summary.completedTransactions} completed successfully.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002C5F]"></div>
        </div>
      )}
    </div>
  );

  // Helper functions for analytics
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transfer': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'deposit': return 'bg-purple-500';
      case 'withdrawal': return 'bg-orange-500';
      case 'wire': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1] || 'Unknown';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'accounts':
        return renderAccounts();
      case 'transactions':
        return renderTransactions();
      case 'analytics':
        return renderAnalytics();
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Feature coming soon...</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002C5F]"></div>
      </div>
    );
  }

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
                  if (item.id === 'transfers') {
                    navigate('/transfer');
                  } else if (item.id === 'payments') {
                    navigate('/payments');
                  } else if (item.id === 'analytics') {
                    navigate('/analytics');
                  } else if (item.id === 'settings') {
                    navigate('/settings');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;