import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import TransferPage from './pages/TransferPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('🛡️ ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user);
  console.log('🛡️ ProtectedRoute - user details:', user ? {
    _id: user._id,
    username: user.username,
    role: user.role
  } : 'null');
  
  if (loading) {
    console.log('🔄 ProtectedRoute - showing loading spinner');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002C5F]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - not authenticated, redirecting to login');
    console.log('❌ ProtectedRoute - user is null or falsy:', !user);
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ ProtectedRoute - authenticated, rendering children');
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard route - uses its own blue sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Transfer route - uses its own blue sidebar */}
          <Route path="/transfer" element={
            <ProtectedRoute>
              <TransferPage />
            </ProtectedRoute>
          } />
          
          {/* Payments route - uses its own blue sidebar */}
          <Route path="/payments" element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          
          {/* Analytics route - uses its own blue sidebar */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          
          {/* Settings route - uses its own blue sidebar */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Admin route - admin only */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          
          {/* Other protected routes - use AppLayout with old sidebar */}
          <Route path="/accounts" element={
            <ProtectedRoute>
              <AppLayout>
                <AccountsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <AppLayout>
                <TransactionsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App; 