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

import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  return (
    <ToastProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetList />} />
            <Route path="assets/:id" element={<AssetDetails />} />
            <Route path="assignments" element={<AssignAsset />} />
            <Route path="assets/:id/assign" element={<AssignAsset />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="return-asset" element={<ReturnAsset />} />
            <Route path="history" element={<AssignmentHistory />} />
            <Route path="licenses" element={<LicenseList />} />
            <Route path="licenses/register" element={<RegisterLicense />} />
            <Route path="licenses/:id/assign" element={<AssignLicense />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </ToastProvider>
  );
};

export default App;
