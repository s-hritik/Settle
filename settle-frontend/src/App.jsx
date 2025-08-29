import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import CreateGroupPage from './pages/CreateGroupPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage';
import SettleUpPage from './pages/SettleUpPage.jsx'; 
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AppProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/groups" element={<GroupsPage />} />
                    <Route path="/groups/:groupId" element={<GroupDetailPage />} />
                    <Route path="/create-group" element={<CreateGroupPage />} />
                    <Route path="/add-expense" element={<AddExpensePage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settle" element={<SettleUpPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;