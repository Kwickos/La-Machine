import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Skeleton } from '@/components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Briefs from './pages/Briefs';
import BriefEditor from './pages/BriefEditor';
import ServerConfig from './pages/ServerConfig';
import Statistics from './pages/Statistics';
import Users from './pages/Users';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {isAuthenticated ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="briefs" element={<Briefs />} />
          <Route path="briefs/new" element={<BriefEditor />} />
          <Route path="briefs/:id/edit" element={<BriefEditor />} />
          <Route path="config" element={<ServerConfig />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="users" element={<Users />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

export default App;