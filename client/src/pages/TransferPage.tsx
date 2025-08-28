import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  User,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  Home,
  Send,
  ArrowDownToLine,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountsAPI, transactionsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useNavigate, Link } from 'react-router-dom';
import WireTransferSuccessModal from '../components/WireTransferSuccessModal';

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

interface TransferHistory {
  id: string;
  accountId: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  merchant: string;
}

const TransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'internal' | 'external' | 'wire'>('internal');
  const [showHistory, setShowHistory] = useState(false);

  // Internal transfer form
  const [internalForm, setInternalForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  });

  // External transfer form
  const [externalForm, setExternalForm] = useState({
    fromAccountId: '',
    recipientName: '',
    recipientEmail: '',
    recipientAccount: '',
    amount: '',
    description: '',
    transferType: 'zelle' as 'zelle' | 'ach' | 'wire'
  });

  // Wire transfer form
  const [wireForm, setWireForm] = useState({
    fromAccountId: '',
    recipientName: '',
    recipientBank: '',
    recipientBankAddress: '', // <-- Add this line
    recipientAccount: '',
    routingNumber: '',
    swiftCode: '',
    amount: '',
    description: '',
    priority: 'standard' as 'standard' | 'priority'
  });

  // Success/error states
  const [transferStatus, setTransferStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Transfer summary states
  const [showTransferSummary, setShowTransferSummary] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    transferId: string;
    message: string;
    amount: number;
    fee: number;
    totalAmount: number;
    estimatedDelivery: string;
    fromAccount: string;
    toAccount?: string;
    recipientName?: string;
    recipientBank?: string;
    recipientBankAddress?: string; // <-- Add this line
    transferType?: string;
    estimatedProcessingTime?: string;
    receiptPath?: string;
  } | null>(null);
  const [transferSummary, setTransferSummary] = useState<{
    type: 'internal' | 'external' | 'wire';
    fromAccount: Account | null;
    toAccount?: Account | null;
    recipientName?: string;
    recipientEmail?: string;
    recipientAccount?: string;
    recipientBank?: string;
    recipientBankAddress?: string;
    routingNumber?: string;
    swiftCode?: string;
    amount: number;
    description: string;
    transferType?: 'zelle' | 'ach' | 'wire';
    priority?: 'standard' | 'priority';
    fee: number;
    estimatedDelivery: string;
  } | null>(null);

  // External bank accounts management
  const [externalBanks, setExternalBanks] = useState<Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    status: 'pending' | 'verified' | 'failed';
    trialDeposits?: Array<{ amount: number; date: string; status: 'pending' | 'completed' }>;
  }>>([]);
  const [showAddExternalBank, setShowAddExternalBank] = useState(false);
  const [newExternalBank, setNewExternalBank] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings'
  });

  useEffect(() => {
    fetchAccounts();
    fetchTransferHistory();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      const accountsData = response.data?.accounts || [];
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setInternalForm(prev => ({ ...prev, fromAccountId: accountsData[0].id }));
        setExternalForm(prev => ({ ...prev, fromAccountId: accountsData[0].id }));
        setWireForm(prev => ({ ...prev, fromAccountId: accountsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      const response = await transactionsAPI.getTransferHistory({ limit: 10 });
      setTransferHistory(response.data?.history || []);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      setTransferHistory([]);
    }
  };

  // Calculate transfer fees and delivery times
  const calculateTransferDetails = (type: 'internal' | 'external' | 'wire', transferType?: 'zelle' | 'ach' | 'wire', priority?: 'standard' | 'priority') => {
    if (type === 'internal') {
      return { fee: 0, estimatedDelivery: 'Immediate' };
    } else if (type === 'external') {
      const fees = { zelle: 0, ach: 3, wire: 25 };
      const deliveryTimes = { zelle: 'Within minutes', ach: '1-3 business days', wire: 'Same day delivery' };
      return {
        fee: fees[transferType || 'zelle'],
        estimatedDelivery: deliveryTimes[transferType || 'zelle']
      };
    } else if (type === 'wire') {
      const wireFees = { standard: 25, priority: 35 };
      return {
        fee: wireFees[priority || 'standard'],
        estimatedDelivery: priority === 'priority' ? 'Same day delivery' : '1-2 business days'
      };
    }
    return { fee: 0, estimatedDelivery: 'Unknown' };
  };

  // Show transfer summary before processing
  const showSummary = (type: 'internal' | 'external' | 'wire') => {
    let summary: any = null;

    if (type === 'internal') {
      const fromAccount = accounts.find(acc => acc.id === internalForm.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === internalForm.toAccountId);
      const { fee, estimatedDelivery } = calculateTransferDetails('internal');

      summary = {
        type: 'internal' as const,
        fromAccount,
        toAccount,
        amount: parseFloat(internalForm.amount),
        description: internalForm.description,
        fee,
        estimatedDelivery
      };
    } else if (type === 'external') {
      const fromAccount = accounts.find(acc => acc.id === externalForm.fromAccountId);
      const { fee, estimatedDelivery } = calculateTransferDetails('external', externalForm.transferType);

      summary = {
        type: 'external' as const,
        fromAccount,
        recipientName: externalForm.recipientName,
        recipientEmail: externalForm.recipientEmail,
        recipientAccount: externalForm.recipientAccount,
        amount: parseFloat(externalForm.amount),
        description: externalForm.description,
        transferType: externalForm.transferType,
        fee,
        estimatedDelivery
      };
    } else if (type === 'wire') {
      const fromAccount = accounts.find(acc => acc.id === wireForm.fromAccountId);
      const { fee, estimatedDelivery } = calculateTransferDetails('wire', undefined, wireForm.priority);

      summary = {
        type: 'wire' as const,
        fromAccount,
        recipientName: wireForm.recipientName,
        recipientBank: wireForm.recipientBank,
        recipientBankAddress: wireForm.recipientBankAddress, // <-- Add this line
        recipientAccount: wireForm.recipientAccount,
        routingNumber: wireForm.routingNumber,
        swiftCode: wireForm.swiftCode,
        amount: parseFloat(wireForm.amount),
        description: wireForm.description,
        priority: wireForm.priority,
        fee,
        estimatedDelivery
      };
    }

    if (summary) {
      setTransferSummary(summary);
      setShowTransferSummary(true);
    }
  };

  // Process transfer after summary confirmation
  const processTransfer = async () => {
    if (!transferSummary) return;

    setLoading(true);
    setTransferStatus({ type: null, message: '' });
    setShowTransferSummary(false);

    try {
      let response: any;

      if (transferSummary.type === 'internal') {
        response = await transactionsAPI.internalTransfer({
          fromAccountId: transferSummary.fromAccount!.id,
          toAccountId: transferSummary.toAccount!.id,
          amount: transferSummary.amount,
          description: transferSummary.description
        });
      } else if (transferSummary.type === 'external') {
        response = await transactionsAPI.externalTransfer({
          fromAccountId: transferSummary.fromAccount!.id,
          recipientName: transferSummary.recipientName!,
          recipientEmail: transferSummary.recipientEmail,
          recipientAccount: transferSummary.recipientAccount,
          amount: transferSummary.amount,
          description: transferSummary.description,
          transferType: transferSummary.transferType!
        });
      } else if (transferSummary.type === 'wire') {
        response = await transactionsAPI.wireTransfer({
          fromAccountType: (transferSummary.fromAccount!.type as 'checking' | 'savings'),
          fromAccountId: transferSummary.fromAccount!.id,
          recipientName: transferSummary.recipientName!,
          recipientBankName: transferSummary.recipientBank!,
          recipientBankAddress: transferSummary.recipientBankAddress!,
          recipientAccountNumber: transferSummary.recipientAccount!,
          recipientRoutingNumber: transferSummary.routingNumber!,
          swiftCode: transferSummary.swiftCode,
          priority: transferSummary.priority!,
          amount: transferSummary.amount,
          description: transferSummary.description
        });
      }

      if (response && response.data) {
        const data = response.data;

        // Set success details for modal
        if (transferSummary.type === 'wire') {
          setSuccessDetails({
            transferId: data.transferId || 'N/A',
            message: data.message,
            amount: transferSummary.amount,
            fee: data.fee || transferSummary.fee,
            totalAmount: data.totalAmount || (transferSummary.amount + transferSummary.fee),
            estimatedDelivery: data.estimatedDelivery || transferSummary.estimatedDelivery,
            fromAccount: transferSummary.fromAccount?.accountName || 'Unknown',
            toAccount: transferSummary.toAccount?.accountName,
            recipientName: transferSummary.recipientName,
            recipientBank: transferSummary.recipientBank,
            recipientBankAddress: transferSummary.recipientBankAddress, // <-- Add this line
            transferType: transferSummary.transferType,
            estimatedProcessingTime: data.estimatedProcessingTime || '30 minutes to 1 hour',
            receiptPath: data.receiptPath || ''
          });

          // Show wire transfer success modal
          setShowSuccessModal(true);
        } else {
          // For other transfer types, show regular success message
          setSuccessDetails({
            transferId: data.transferId || 'N/A',
            message: data.message,
            amount: transferSummary.amount,
            fee: data.fee || transferSummary.fee,
            totalAmount: data.totalAmount || (transferSummary.amount + transferSummary.fee),
            estimatedDelivery: data.estimatedDelivery || transferSummary.estimatedDelivery,
            fromAccount: transferSummary.fromAccount?.accountName || 'Unknown',
            toAccount: transferSummary.toAccount?.accountName,
            recipientName: transferSummary.recipientName,
            recipientBank: transferSummary.recipientBank,
            recipientBankAddress: transferSummary.recipientBankAddress, // <-- Add this line for consistency
            transferType: transferSummary.transferType
          });

          // Show success modal
          setShowSuccessModal(true);
        }

        // Reset forms
        resetForms();

        // Refresh data
        fetchAccounts();
        fetchTransferHistory();
      }
    } catch (error: any) {
      setTransferStatus({
        type: 'error',
        message: error.response?.data?.error || 'Transfer failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset all forms
  const resetForms = () => {
    setInternalForm({
      fromAccountId: internalForm.fromAccountId,
      toAccountId: '',
      amount: '',
      description: ''
    });
    setExternalForm({
      fromAccountId: externalForm.fromAccountId,
      recipientName: '',
      recipientEmail: '',
      recipientAccount: '',
      amount: '',
      description: '',
      transferType: 'zelle'
    });
    setWireForm({
      fromAccountId: wireForm.fromAccountId,
      recipientName: '',
      recipientBank: '',
      recipientBankAddress: '', // <-- Add this line
      recipientAccount: '',
      routingNumber: '',
      swiftCode: '',
      amount: '',
      description: '',
      priority: 'standard'
    });
  };

  // Add external bank account
  const handleAddExternalBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to add external bank
      const newBank = {
        id: Date.now().toString(),
        bankName: newExternalBank.bankName,
        accountNumber: newExternalBank.accountNumber,
        routingNumber: newExternalBank.routingNumber,
        accountType: newExternalBank.accountType,
        status: 'pending' as const,
        trialDeposits: [
          { amount: 0.01, date: new Date().toISOString(), status: 'pending' as const },
          { amount: 0.02, date: new Date().toISOString(), status: 'pending' as const }
        ]
      };

      setExternalBanks(prev => [...prev, newBank]);
      setNewExternalBank({
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking'
      });
      setShowAddExternalBank(false);

      setTransferStatus({
        type: 'success',
        message: 'External bank account added successfully. Trial deposits will be made within 1-2 business days for verification.'
      });
    } catch (error: any) {
      setTransferStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to add external bank account.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    showSummary('internal');
  };

  const handleExternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    showSummary('external');
  };

  const handleWireTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    showSummary('wire');
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
                  if (item.id === 'transfers') {
                    // Already on transfer page
                  } else if (item.id === 'overview') {
                    navigate('/dashboard');
                  } else {
                    // For other items, navigate to dashboard with specific tab
                    navigate('/dashboard');
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${item.id === 'transfers'
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
            <h1 className="text-2xl font-bold text-gray-900">Transfer Money</h1>
            <p className="text-gray-600 mt-1">Move money between accounts or send to others</p>
          </div>

          {/* Transfer Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('internal')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'internal'
                    ? 'border-[#BE9B4C] text-[#002C5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <ArrowLeftRight size={16} className="inline mr-2" />
                  Internal Transfer
                </button>
                <button
                  onClick={() => setActiveTab('external')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'external'
                    ? 'border-[#BE9B4C] text-[#002C5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  External Transfer
                </button>
                <button
                  onClick={() => setActiveTab('wire')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'wire'
                    ? 'border-[#BE9B4C] text-[#002C5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Send size={16} className="inline mr-2" />
                  Wire Transfer
                </button>
              </nav>
            </div>

            {/* Transfer Forms */}
            <div className="p-6">
              {activeTab === 'internal' ? (
                <form onSubmit={handleInternalTransfer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Account
                      </label>
                      <select
                        value={internalForm.fromAccountId}
                        onChange={(e) => setInternalForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
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

                    {/* To Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Account
                      </label>
                      <select
                        value={internalForm.toAccountId}
                        onChange={(e) => setInternalForm(prev => ({ ...prev, toAccountId: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        required
                      >
                        <option value="">Select account</option>
                        {accounts
                          .filter(account => account.id !== internalForm.fromAccountId)
                          .map(account => (
                            <option key={account.id} value={account.id}>
                              {getAccountDisplayName(account)}
                            </option>
                          ))}
                      </select>
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
                          value={internalForm.amount}
                          onChange={(e) => setInternalForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                          placeholder="0.00"
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
                        value={internalForm.description}
                        onChange={(e) => setInternalForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="What's this transfer for?"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BE9B4C] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#A88B3F] focus:ring-2 focus:ring-[#BE9B4C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Complete Transfer'}
                  </button>
                </form>
              ) : activeTab === 'external' ? (
                <form onSubmit={handleExternalTransfer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Account
                      </label>
                      <select
                        value={externalForm.fromAccountId}
                        onChange={(e) => setExternalForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
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

                    {/* Transfer Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer Type
                      </label>
                      <select
                        value={externalForm.transferType}
                        onChange={(e) => setExternalForm(prev => ({ ...prev, transferType: e.target.value as 'zelle' | 'ach' | 'wire' }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        required
                      >
                        <option value="zelle">Zelle (Instant)</option>
                        <option value="ach">ACH Transfer (1-3 days)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recipient Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={externalForm.recipientName}
                        onChange={(e) => setExternalForm(prev => ({ ...prev, recipientName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="Full name"
                        required
                      />
                    </div>

                    {/* Recipient Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        value={externalForm.recipientEmail}
                        onChange={(e) => setExternalForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="email@example.com"
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
                          value={externalForm.amount}
                          onChange={(e) => setExternalForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                          placeholder="0.00"
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
                        value={externalForm.description}
                        onChange={(e) => setExternalForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="What's this transfer for?"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BE9B4C] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#A88B3F] focus:ring-2 focus:ring-[#BE9B4C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Send Transfer'}
                  </button>
                </form>

              ) : (
                <form onSubmit={handleWireTransfer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Account
                      </label>
                      <select
                        value={wireForm.fromAccountId}
                        onChange={(e) => setWireForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
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

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={wireForm.priority}
                        onChange={(e) => setWireForm(prev => ({ ...prev, priority: e.target.value as 'standard' | 'priority' }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        required
                      >
                        <option value="standard">Standard Wire</option>
                        <option value="priority">Priority Wire</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recipient Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={wireForm.recipientName}
                        onChange={(e) => setWireForm(prev => ({ ...prev, recipientName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="Full name"
                        required
                      />
                    </div>

                    {/* Recipient Bank */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Bank
                      </label>
                      <input
                        type="text"
                        value={wireForm.recipientBank}
                        onChange={(e) => setWireForm(prev => ({ ...prev, recipientBank: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="Bank name"
                        required
                      />
                    </div>
                  </div>

                  {/* Recipient Bank Address */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Bank Address
                    </label>
                    <input
                      type="text"
                      value={wireForm.recipientBankAddress}
                      onChange={(e) => setWireForm(prev => ({ ...prev, recipientBankAddress: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                      placeholder="Bank address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={wireForm.recipientAccount}
                        onChange={(e) => setWireForm(prev => ({ ...prev, recipientAccount: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="Account number"
                        required
                      />
                    </div>

                    {/* Routing Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={wireForm.routingNumber}
                        onChange={(e) => setWireForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="9-digit routing number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SWIFT Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SWIFT Code (International)
                      </label>
                      <input
                        type="text"
                        value={wireForm.swiftCode}
                        onChange={(e) => setWireForm(prev => ({ ...prev, swiftCode: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                        placeholder="SWIFT/BIC code"
                      />
                    </div>

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
                          value={wireForm.amount}
                          onChange={(e) => setWireForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={wireForm.description}
                      onChange={(e) => setWireForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                      placeholder="What's this wire transfer for?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#BE9B4C] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#A88B3F] focus:ring-2 focus:ring-[#BE9B4C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Send Wire Transfer'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Status Message */}
          {transferStatus.type && (
            <div className={`p-4 rounded-lg mb-6 ${transferStatus.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
              <div className="flex items-center">
                {transferStatus.type === 'success' ? (
                  <CheckCircle className="mr-2" size={20} />
                ) : (
                  <AlertCircle className="mr-2" size={20} />
                )}
                {transferStatus.message}
              </div>
            </div>
          )}

          {/* Transfer History */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Recent Transfers</h3>
                {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {showHistory && (
              <div className="p-6">
                {transferHistory.length > 0 ? (
                  <div className="space-y-4">
                    {transferHistory.map((transfer) => (
                      <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transfer.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {transfer.type === 'credit' ? (
                              <ArrowLeftRight className="text-green-600" size={20} />
                            ) : (
                              <ArrowLeftRight className="text-red-600" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transfer.description}</p>
                            <p className="text-sm text-gray-500">{transfer.merchant}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(transfer.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transfer.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transfer.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transfer.amount))}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transfer.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {transfer.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowLeftRight className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No transfer history yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Summary Modal */}
      {showTransferSummary && transferSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transfer Summary</h3>
              <button
                onClick={() => setShowTransferSummary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Transfer Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transfer Type:</span>
                <span className="font-medium text-gray-900">
                  {transferSummary.type === 'internal' ? 'Internal Transfer' :
                    transferSummary.type === 'external' ? 'External Transfer' : 'Wire Transfer'}
                </span>
              </div>

              {/* From Account */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">From:</span>
                <span className="font-medium text-gray-900">
                  {transferSummary.fromAccount?.accountName} (****{transferSummary.fromAccount?.accountNumber.slice(-4)})
                </span>
              </div>

              {/* To Account / Recipient */}
              {transferSummary.type === 'internal' ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="font-medium text-gray-900">
                    {transferSummary.toAccount?.accountName} (****{transferSummary.toAccount?.accountNumber.slice(-4)})
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipient:</span>
                  <span className="font-medium text-gray-900">{transferSummary.recipientName}</span>
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-lg text-gray-900">
                  {formatCurrency(transferSummary.amount)}
                </span>
              </div>

              {/* Fee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fee:</span>
                <span className="font-medium text-gray-900">
                  {transferSummary.fee > 0 ? formatCurrency(transferSummary.fee) : 'Free'}
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Total:</span>
                <span className="font-semibold text-lg text-gray-900">
                  {formatCurrency(transferSummary.amount + transferSummary.fee)}
                </span>
              </div>

              {/* Description */}
              {transferSummary.description && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="font-medium text-gray-900">{transferSummary.description}</span>
                </div>
              )}

              {/* Estimated Delivery */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Delivery:</span>
                <span className="font-medium text-gray-900">{transferSummary.estimatedDelivery}</span>
              </div>

              {/* Show Recipient Bank Address for wire transfers */}
              {transferSummary.type === 'wire' && transferSummary.recipientBankAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipient Bank Address:</span>
                  <span className="font-medium text-gray-900">{transferSummary.recipientBankAddress}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTransferSummary(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#BE9B4C] text-white rounded-lg font-medium hover:bg-[#A88B3F] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add External Bank Modal */}
      {showAddExternalBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add External Bank Account</h3>
              <button
                onClick={() => setShowAddExternalBank(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExternalBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={newExternalBank.bankName}
                  onChange={(e) => setNewExternalBank(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={newExternalBank.accountNumber}
                  onChange={(e) => setNewExternalBank(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                  placeholder="Account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={newExternalBank.routingNumber}
                  onChange={(e) => setNewExternalBank(prev => ({ ...prev, routingNumber: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                  placeholder="9-digit routing number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={newExternalBank.accountType}
                  onChange={(e) => setNewExternalBank(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002C5F] focus:border-[#002C5F]"
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> We'll make two small trial deposits ($0.01 and $0.02) to verify your account.
                  This process takes 1-2 business days. You'll need to confirm these amounts to complete verification.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExternalBank(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#002C5F] text-white rounded-lg font-medium hover:bg-[#001f4d] disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* External Bank Accounts Management */}
      {activeTab === 'external' && (
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">External Bank Accounts</h3>
              <button
                onClick={() => setShowAddExternalBank(true)}
                className="bg-[#002C5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#001f4d]"
              >
                Add External Bank
              </button>
            </div>
          </div>

          <div className="p-6">
            {externalBanks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No external bank accounts added yet.</p>
                <p className="text-sm">Add an external bank account to make transfers easier.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {externalBanks.map((bank) => (
                  <div key={bank.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{bank.bankName}</h4>
                        <p className="text-sm text-gray-600">
                          Account: ****{bank.accountNumber.slice(-4)} |
                          Routing: {bank.routingNumber} |
                          Type: {bank.accountType}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bank.status === 'verified' ? 'bg-green-100 text-green-800' :
                            bank.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {bank.status === 'verified' ? 'Verified' :
                              bank.status === 'pending' ? 'Pending Verification' : 'Failed'}
                          </span>
                        </div>
                      </div>
                      {bank.status === 'pending' && bank.trialDeposits && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Trial deposits:</p>
                          <p className="text-xs font-medium">$0.01 and $0.02</p>
                          <p className="text-xs text-gray-500">1-2 business days</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Success Modal */}
      {showSuccessModal && successDetails && (
        <>
          {/* Wire Transfer Success Modal */}
          {successDetails.transferType === 'wire' && successDetails.estimatedProcessingTime && (
            <WireTransferSuccessModal
              isOpen={showSuccessModal}
              onClose={() => setShowSuccessModal(false)}
              transferData={{
                transferId: successDetails.transferId,
                recipientName: successDetails.recipientName || '',
                recipientBank: successDetails.recipientBank || '',
                recipientBankAddress: successDetails.recipientBankAddress || '', // <-- Add this line
                amount: successDetails.amount,
                fee: successDetails.fee,
                totalAmount: successDetails.totalAmount,
                estimatedProcessingTime: successDetails.estimatedProcessingTime,
                receiptPath: successDetails.receiptPath || ''
              }}
            />
          )}

          {/* Regular Transfer Success Modal */}
          {successDetails.transferType !== 'wire' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Successful!</h3>
                  <p className="text-sm text-gray-600 mb-6">{successDetails.message}</p>
                </div>

                <div className="space-y-3 bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transfer ID:</span>
                    <span className="font-mono text-sm text-gray-900">{successDetails.transferId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">From Account:</span>
                    <span className="font-medium text-gray-900">{successDetails.fromAccount}</span>
                  </div>

                  {successDetails.toAccount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">To Account:</span>
                      <span className="font-medium text-gray-900">{successDetails.toAccount}</span>
                    </div>
                  )}

                  {successDetails.recipientName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recipient:</span>
                      <span className="font-medium text-gray-900">{successDetails.recipientName}</span>
                    </div>
                  )}

                  {successDetails.recipientBank && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">{successDetails.recipientBank}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(successDetails.amount)}</span>
                  </div>

                  {successDetails.fee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fee:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(successDetails.fee)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-900">Total:</span>
                    <span className="font-semibold text-lg text-gray-900">{formatCurrency(successDetails.totalAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium text-gray-900">{successDetails.estimatedDelivery}</span>
                  </div>

                  {/* Optional: Add recipientBankAddress to the regular success modal if you want to display it there */}
                  {successDetails.recipientBankAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recipient Bank Address:</span>
                      <span className="font-medium text-gray-900">{successDetails.recipientBankAddress}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full px-4 py-2 bg-[#002C5F] text-white rounded-lg font-medium hover:bg-[#001F4A]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransferPage;