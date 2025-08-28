import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { CreditCard, Plus, Eye, Download } from 'lucide-react';
import { accountsAPI } from '../services/api';
import { formatCurrency, formatAccountNumber } from '../utils/formatters';

const AccountsPage: React.FC = () => {
  const [showBalances, setShowBalances] = useState(true);

  const { data: accountsData, isLoading, error } = useQuery('accounts', accountsAPI.getAll);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002C5F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading accounts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
        <button className="bg-[#002C5F] text-white px-4 py-2 rounded-lg hover:bg-[#003d99] transition-colors">
          Open New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountsData?.data?.accounts?.map((account: any) => (
          <div key={account.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                account.type === 'checking' ? 'bg-blue-100' :
                account.type === 'savings' ? 'bg-green-100' :
                'bg-purple-100'
              }`}>
                <CreditCard size={24} className={
                  account.type === 'checking' ? 'text-blue-600' :
                  account.type === 'savings' ? 'text-green-600' :
                  'text-purple-600'
                } />
              </div>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye size={20} />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{account.accountName}</h3>
            <p className="text-sm text-gray-500 mb-4">{formatAccountNumber(account.accountNumber)}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance</span>
                <span className="font-semibold text-gray-900">
                  {showBalances ? formatCurrency(account.balance) : '••••••'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available</span>
                <span className="font-semibold text-green-600">
                  {showBalances ? formatCurrency(account.availableBalance || account.balance) : '••••••'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {account.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountsPage; 