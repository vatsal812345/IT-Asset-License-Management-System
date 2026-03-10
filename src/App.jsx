import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetDetails from './components/AssetDetails';
import AssignAsset from './components/AssignAsset';

import AssignmentHistory from './components/AssignmentHistory';
import ReturnAsset from './components/ReturnAsset';
import LicenseList from './components/LicenseList';
import AssignLicense from './components/AssignLicense';
import RegisterLicense from './components/RegisterLicense';
import EmployeeList from './components/EmployeeList';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgetPassword from './components/ForgetPassword';
import VerifyCode from './components/VerifyCode';
import ProfilePage from './components/ProfilePage';
import VendorList from './components/VendorList';
import VendorDetails from './components/VendorDetails';
import ProtectedRoute from './components/ProtectedRoute';

import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import { ThemeProvider } from './context/ThemeContext';

import Maintenance from './components/Maintenance';

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="assets" element={<AssetList />} />
                    <Route path="assets/:id" element={<AssetDetails />} />
                    <Route path="employees" element={<EmployeeList />} />
                    <Route path="history" element={<AssignmentHistory />} />
                    <Route path="licenses" element={<LicenseList />} />
                    <Route path="vendors" element={<VendorList />} />
                    <Route path="vendors/:id" element={<VendorDetails />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="maintenance" element={<Maintenance />} />

                    {/* Management Only Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                      <Route path="assignments" element={<AssignAsset />} />
                      <Route path="assets/:id/assign" element={<AssignAsset />} />
                      <Route path="return-asset" element={<ReturnAsset />} />
                      <Route path="licenses/register" element={<RegisterLicense />} />
                      <Route path="licenses/:id/assign" element={<AssignLicense />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
