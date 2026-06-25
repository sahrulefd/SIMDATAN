import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, ShieldAlert, Monitor, Terminal } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface AuditLogItem {
  id: number;
  action: string;
  modul: string;
  deskripsi: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: User;
}

export const AuditLogs: React.FC = () => {
  const [list, setList] = useState<AuditLogItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit-logs?page=${currentPage}&search=${searchQuery}`);
      setList(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading font-bold text-3xl">Audit Trail Logs</h1>
        <p className="text-xs text-gray-500 mt-1">Jejak audit keamanan sistem, riwayat transaksi data, dan mutasi data vital pertanian.</p>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul atau deskripsi log..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Modul</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
                <th className="px-6 py-3 font-semibold">Deskripsi</th>
                <th className="px-6 py-3 font-semibold">IP Address</th>
                <th className="px-6 py-3 font-semibold">Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors text-xs">
                  <td className="px-6 py-4">
                    {item.user ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.user.name}</span>
                        <span className="text-[10px] text-gray-400">{item.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">System / Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">{item.modul}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.action === 'Login' || item.action === 'Tambah' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/10' 
                        : item.action === 'Hapus'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/10'
                    }`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm truncate text-gray-400 font-medium" title={item.deskripsi}>
                    {item.deskripsi}
                  </td>
                  <td className="px-6 py-4 font-mono">{item.ip_address}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada log audit ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="h-14 flex items-center justify-between px-6 border-t border-gray-200 dark:border-gray-800 bg-[#0f0e26]/30">
            <span className="text-xs text-gray-400">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
