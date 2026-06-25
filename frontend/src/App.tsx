import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GisMap } from './pages/GisMap';
import { Petani } from './pages/Petani';
import { KelompokTani } from './pages/KelompokTani';
import { Wilayah } from './pages/Wilayah';
import { Lahan } from './pages/Lahan';
import { Komoditas } from './pages/Komoditas';
import { ProduksiPanen } from './pages/ProduksiPanen';
import { KegiatanLapangan } from './pages/KegiatanLapangan';
import { Approval } from './pages/Approval';
import { Dokumen } from './pages/Dokumen';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { Users } from './pages/Users';

const AppContent: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#080710]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          token ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gis" element={<GisMap />} />
                <Route path="/petani" element={<Petani />} />
                <Route path="/kelompok-tani" element={<KelompokTani />} />
                <Route path="/wilayah" element={<Wilayah />} />
                <Route path="/lahan" element={<Lahan />} />
                <Route path="/komoditas" element={<Komoditas />} />
                <Route path="/produksi-panen" element={<ProduksiPanen />} />
                <Route path="/kegiatan-lapangan" element={<KegiatanLapangan />} />
                <Route path="/approvals" element={<Approval />} />
                <Route path="/dokumen" element={<Dokumen />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                
                {/* Fallback to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
