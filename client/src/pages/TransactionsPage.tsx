import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  status: string;
  reference: string;
  createdAt: string;
  accountId: {
    accountNumber: string;
    type: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  totalCredits: number;
  totalDebits: number;
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    'all', 'Grocery Store', 'Gas Station', 'Restaurant', 'Online Purchase', 'ATM Withdrawal',
    'Utility Bill', 'Insurance Payment', 'Phone Bill', 'Internet Service', 'Streaming Service',
    'Coffee Shop', 'Pharmacy', 'Hardware Store', 'Bookstore', 'Clothing Store',
    'Interest Payment', 'Direct Deposit', 'Transfer from Checking', 'Dividend Payment',
    'CD Maturity', 'Investment Return', 'Bonus Payment', 'Tax Refund', 'Insurance Settlement',
    'Royalty Payment', 'Consulting Fee', 'Speaking Engagement', 'Book Sales', 'Music Royalties'
  ];

  const fetchTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getTransactions(page, 20);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (category: string) => {
    if (category.includes('Grocery')) return '🛒';
    if (category.includes('Gas')) return '⛽';
    if (category.includes('Restaurant')) return '🍽️';
    if (category.includes('Online')) return '🛍️';
    if (category.includes('ATM')) return '🏧';
    if (category.includes('Utility')) return '⚡';
    if (category.includes('Insurance')) return '🛡️';
    if (category.includes('Phone')) return '📱';
    if (category.includes('Internet')) return '🌐';
    if (category.includes('Streaming')) return '📺';
    if (category.includes('Coffee')) return '☕';
    if (category.includes('Pharmacy')) return '💊';
    if (category.includes('Hardware')) return '🔧';
    if (category.includes('Book')) return '📚';
    if (category.includes('Clothing')) return '👕';
    if (category.includes('Interest')) return '💰';
    if (category.includes('Deposit')) return '💳';
    if (category.includes('Transfer')) return '🔄';
    if (category.includes('Dividend')) return '📈';
    if (category.includes('Investment')) return '📊';
    if (category.includes('Bonus')) return '🎁';
    if (category.includes('Tax')) return '📋';
    if (category.includes('Royalty')) return '🎵';
    if (category.includes('Consulting')) return '💼';
    if (category.includes('Speaking')) return '🎤';
    if (category.includes('Music')) return '🎼';
    return '💳';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          <button className="btn-secondary flex items-center">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-gray-500">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalTransactions.toLocaleString()}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-500">Total Credits</div>
            <div className="text-2xl font-bold text-green-600">{formatAmount(summary.totalCredits)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-500">Total Debits</div>
            <div className="text-2xl font-bold text-red-600">{formatAmount(summary.totalDebits)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-gray-500">Net Amount</div>
            <div className={`text-2xl font-bold ${summary.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(summary.totalAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTransactionIcon(transaction.category)}</div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.category} • {transaction.accountId?.accountNumber} • {transaction.reference}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{transaction.type}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalTransactions)} of{' '}
                  {pagination.totalTransactions} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage; 