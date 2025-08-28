import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  BarChart3,
  CreditCard,
  ArrowLeftRight,
  FileText,
  Settings,
  User,
  Shield,
  HelpCircle,
  Phone
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview of your accounts'
    },
    {
      name: 'Accounts',
      href: '/accounts',
      icon: CreditCard,
      description: 'Manage your accounts'
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: FileText,
      description: 'View transaction history'
    },
    {
      name: 'Transfer',
      href: '/transfer',
      icon: ArrowLeftRight,
      description: 'Transfer between accounts'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Update your profile'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ];

  const supportLinks = [
    {
      name: 'Security Center',
      href: '#',
      icon: Shield,
      description: 'Security settings and tips'
    },
    {
      name: 'Help & Support',
      href: '#',
      icon: HelpCircle,
      description: 'Get help and support'
    },
    {
      name: 'Contact Us',
      href: '#',
      icon: Phone,
      description: 'Reach our support team'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn-primary text-sm py-2">
              Transfer Money
            </button>
            <button className="w-full btn-secondary text-sm py-2">
              Pay Bills
            </button>
            <button className="w-full btn-secondary text-sm py-2">
              Deposit Check
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Banking</h3>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                title={item.description}
              >
                <item.icon size={20} className="mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Support & Security */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Support & Security</h3>
          <nav className="space-y-1">
            {supportLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="sidebar-link"
                title={item.description}
              >
                <item.icon size={20} className="mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Account Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Balance:</span>
              <span className="font-semibold text-gray-900">$15,797.64</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accounts:</span>
              <span className="font-semibold text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credit Score:</span>
              <span className="font-semibold text-success-600">785</span>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-6 bg-primary-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield size={16} className="text-primary-600" />
            <span className="text-sm font-semibold text-primary-900">Security Status</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-gray-700">Two-factor authentication enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-gray-700">Last login: Today 10:30 AM</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <span className="text-gray-700">Biometric login available</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 