import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Check,
  X,
  Pause
} from 'lucide-react';

interface Transaction {
  _id?: string;
  id?: string;
  accountId?: string;
  type: 'debit' | 'credit' | 'wire_transfer' | 'transfer';
  description: string;
  amount: number;
  date?: string;
  createdAt?: string;
  category?: string;
  status: 'completed' | 'pending' | 'processing' | 'on_hold' | 'failed';
  reference?: string;
  merchant?: string;
  location?: string;
  fee?: number;
  fees?: number;
  externalDetails?: any;
  wireDetails?: any;
  transferType?: string;
  requiresApproval?: boolean;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  } | string;
  username?: string;
  userFullName?: string;
  email?: string;
  recipientDetails?: {
    name: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    bankAddress?: string;
  };
  fromAccount?: {
    type: string;
    accountNumber: string;
  };
  transactionId?: string;
  currency?: string;
}

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  pendingApprovals: number;
  completedToday: number;
  failedToday: number;
  totalAmountProcessed: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch wire transfers (pending for approval)
      const wireTransfersResponse = await fetch('http://localhost:5001/api/admin/wire-transfers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const wireTransfersData = await wireTransfersResponse.json();
      setPendingTransactions(wireTransfersData.wires || []);

      // Fetch all transactions
      const allResponse = await fetch('http://localhost:5001/api/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const allData = await allResponse.json();
      setAllTransactions(allData.transactions || []);

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`http://localhost:5001/api/admin/wire-transfers/${transactionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || undefined
        })
      });

      if (response.ok) {
        // Refresh data
        await fetchAdminData();
        setSelectedTransaction(null);
        setAdminNotes('');
        alert(`Transaction status updated to ${status}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'on_hold':
        return <Pause className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#002C5F] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage transactions and user accounts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-[#002C5F]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-[#002C5F]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wire Transfer Approvals */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Wire Transfer Approvals</h2>
            <p className="text-gray-600 mt-1">Wire transfers pending admin approval</p>
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No wire transfers pending approval</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTransactions.map((transaction) => (
                    <tr key={transaction._id || transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {typeof transaction.userId === 'object' ? transaction.userId.username : transaction.username}
                          </div>
                          <div className="text-sm text-gray-500">{typeof transaction.userId === 'object' ? transaction.userId.email : transaction.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.recipientDetails?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.recipientDetails?.accountNumber || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.recipientDetails?.bankName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Routing: {transaction.recipientDetails?.routingNumber || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        {transaction.fees && (
                          <div className="text-sm text-gray-500">Fee: ${transaction.fees}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt || transaction.date || '').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-[#002C5F] hover:text-[#001a3d]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
            <p className="text-gray-600 mt-1">Complete transaction history</p>
          </div>

          {allTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTransactions.slice(0, 20).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {typeof transaction.userId === 'object' ? `${transaction.userId.firstName} ${transaction.userId.lastName}` : (transaction.userFullName || transaction.username || 'N/A')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof transaction.userId === 'object' ? transaction.userId.username : (transaction.username || 'N/A')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.merchant}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        {transaction.fee && (
                          <div className="text-sm text-gray-500">Fee: ${transaction.fee}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date || '').toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Wire Transfer Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{typeof selectedTransaction.userId === 'object' ? selectedTransaction.userId.username : (selectedTransaction.username || 'N/A')}</p>
                  <p className="text-sm text-gray-500">{typeof selectedTransaction.userId === 'object' ? selectedTransaction.userId.email : (selectedTransaction.email || 'N/A')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.recipientDetails?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Account: {selectedTransaction.recipientDetails?.accountNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Details</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.recipientDetails?.bankName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Routing: {selectedTransaction.recipientDetails?.routingNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Address: {selectedTransaction.recipientDetails?.bankAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900">${Math.abs(selectedTransaction.amount).toLocaleString()}</p>
                  {selectedTransaction.fees && (
                    <p className="text-sm text-gray-500">Fee: ${selectedTransaction.fees}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.description || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#002C5F] focus:border-[#002C5F] sm:text-sm"
                    rows={3}
                    placeholder="Add notes (optional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedTransaction(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction._id || selectedTransaction.id || '', 'pending')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Pending
                </button>
                
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction._id || selectedTransaction.id || '', 'on_hold')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200 disabled:opacity-50"
                >
                  <Pause className="w-4 h-4 inline mr-1" />
                  Hold
                </button>
                
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction._id || selectedTransaction.id || '', 'failed')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Reject
                </button>
                
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction._id || selectedTransaction.id || '', 'completed')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 