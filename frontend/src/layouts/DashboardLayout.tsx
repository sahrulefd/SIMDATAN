import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.png';
import defaultAvatar from '../assets/default_avatar.png';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Sprout, 
  TrendingUp, 
  FileText, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  Settings, 
  ShieldAlert, 
  Compass, 
  DatabaseBackup,
  AlertTriangle
} from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: 'info' | 'warning' | 'danger';
  created_at: string;
}

interface SearchResultItem {
  id: number;
  title: string;
  subtitle: string;
  type: 'petani' | 'kelompok' | 'lahan' | 'komoditas';
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    petani: SearchResultItem[];
    kelompok_tani: SearchResultItem[];
    lahan: SearchResultItem[];
    komoditas: SearchResultItem[];
  }>({ petani: [], kelompok_tani: [], lahan: [], komoditas: [] });
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n: NotificationItem) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  // Global search trigger
  useEffect(() => {
    const triggerSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ petani: [], kelompok_tani: [], lahan: [], komoditas: [] });
        return;
      }
      try {
        const response = await api.get(`/search?query=${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    const delayDebounce = setTimeout(triggerSearch, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'GIS Pemetaan', path: '/gis', icon: Map, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Data Petani', path: '/petani', icon: Users, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Kelompok Tani', path: '/kelompok-tani', icon: Compass, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Wilayah Kerja', path: '/wilayah', icon: Map, roles: ['admin'] },
    { name: 'Lahan Pertanian', path: '/lahan', icon: Sprout, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Komoditas', path: '/komoditas', icon: Sprout, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Produksi Panen', path: '/produksi-panen', icon: TrendingUp, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Kegiatan Lapangan', path: '/kegiatan-lapangan', icon: FileText, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Persetujuan Data', path: '/approvals', icon: ShieldAlert, roles: ['admin', 'supervisor'] },
    { name: 'Vault Dokumen', path: '/dokumen', icon: FileText, roles: ['admin', 'supervisor', 'petugas'] },
    { name: 'Audit Trail Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['admin'] },
    { name: 'Backup & Settings', path: '/settings', icon: DatabaseBackup, roles: ['admin'] },
    { name: 'Manajemen Pengguna', path: '/users', icon: Users, roles: ['admin'] },
  ];

  const handleSearchResultClick = (type: string, id: number) => {
    setSearchQuery('');
    setSearchResults({ petani: [], kelompok_tani: [], lahan: [], komoditas: [] });
    if (type === 'petani') navigate(`/petani?id=${id}`);
    else if (type === 'kelompok') navigate(`/kelompok-tani?id=${id}`);
    else if (type === 'lahan') navigate(`/lahan?id=${id}`);
    else if (type === 'komoditas') navigate(`/komoditas?id=${id}`);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#040d08] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-[#06140c] border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-primary/10 dark:bg-primary/5">
          <Link to="/dashboard" className="flex items-center">
            <img src={logo} alt="SIMDATAN Logo" className="h-9 w-auto object-contain bg-white px-2 py-1.5 rounded-lg shadow-sm border border-gray-100" />
          </Link>
          <button className="lg:hidden p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map((link) => {
            if (link.roles.includes(user?.role || '')) {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <link.icon className="w-4 h-4 flex-shrink-0" />
                  {link.name}
                </Link>
              );
            }
            return null;
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-primary/5 dark:bg-[#06140c]/50">
          <div className="flex items-center gap-3 animate-fade-in">
            <Link to="/profile" className="flex items-center gap-3 flex-1 overflow-hidden hover:opacity-80 transition-opacity" title="Lihat Profil Saya">
              <img 
                src={defaultAvatar} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-primary/20 bg-white shadow-sm flex-shrink-0"
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold truncate leading-tight">{user?.name}</h4>
                <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
              </div>
            </Link>
            <button 
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        
        {/* Header toolbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#06140c] border-b border-gray-200 dark:border-gray-800">
          
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <button className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search box */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari petani, lahan, komoditas..."
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />

              {/* Floating search autocomplete box */}
              {searchQuery.trim().length >= 2 && (
                <div className="absolute top-12 left-0 right-0 z-50 max-h-96 overflow-y-auto bg-white dark:bg-[#0c1e14] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-2 space-y-3">
                  {['petani', 'kelompok_tani', 'lahan', 'komoditas'].map((sectionKey) => {
                    const items = (searchResults as any)[sectionKey] || [];
                    if (items.length === 0) return null;
                    return (
                      <div key={sectionKey}>
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">{sectionKey.replace('_', ' ')}</h5>
                        {items.map((item: SearchResultItem) => (
                          <div
                            key={item.id}
                            onClick={() => handleSearchResultClick(item.type, item.id)}
                            className="flex flex-col px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-gray-400">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {Object.values(searchResults).flat().length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">Tidak ada hasil cocok.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right tool buttons */}
          <div className="flex items-center gap-4">
            
            {/* Theme selector */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification trigger center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification drop area */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 bg-white dark:bg-[#0c1e14] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-3 flex flex-col max-h-96">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="font-heading font-semibold text-sm">Notifikasi Lapangan</span>
                    <button onClick={markAllAsRead} className="text-xs text-primary font-medium hover:underline">Baca Semua</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-lg border text-xs flex gap-2.5 ${n.is_read ? 'bg-gray-50/50 border-gray-100 dark:bg-gray-900/10 dark:border-gray-800/50' : 'bg-green-50/10 border-emerald-500/20 dark:bg-primary/5 dark:border-emerald-500/10'}`}
                      >
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${n.type === 'danger' ? 'text-red-500' : n.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                        <div>
                          <h6 className="font-semibold">{n.title}</h6>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-6 text-center text-gray-500">Tidak ada notifikasi aktif.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="hidden md:flex flex-col text-right leading-none hover:opacity-85 transition-opacity" title="Lihat Profil Saya">
              <span className="text-sm font-semibold">{user?.name}</span>
              <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
            </Link>

          </div>

        </header>

        {/* Content workspace scroll area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#040d08]">
          {children}
        </main>

      </div>

    </div>
  );
};
