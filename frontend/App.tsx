import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Room } from './pages/Room';
import { PageSpinner } from './components/UI';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageSpinner />;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/room/:id" element={<Room />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;