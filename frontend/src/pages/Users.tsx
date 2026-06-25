import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Edit3, Trash2, Key, Check, X, ShieldAlert, Users as UsersIcon } from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'petugas';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export const Users: React.FC = () => {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'petugas'>('petugas');
  const [isActive, setIsActive] = useState(true);

  const [validationErrors, setValidationErrors] = useState<any>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?search=${searchQuery}`);
      if (response.data && response.data.data) {
        setUsersList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('petugas');
    setIsActive(true);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank for no change
    setRole(user.role);
    setIsActive(user.is_active);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const payload: any = {
      name,
      email,
      role,
      is_active: isActive
    };

    if (!selectedUser) {
      // Create mode
      if (!password) {
        setValidationErrors({ password: ['Password wajib diisi untuk pengguna baru.'] });
        return;
      }
      payload.password = password;
    } else {
      // Edit mode (password optional)
      if (password) {
        payload.password = password;
      }
    }

    try {
      let response;
      if (selectedUser) {
        response = await api.put(`/users/${selectedUser.id}`, payload);
      } else {
        response = await api.post('/users', payload);
      }

      if (response.data.success) {
        setShowFormModal(false);
        fetchUsers();
        alert(selectedUser ? 'Data pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan.');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setValidationErrors(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Terjadi kesalahan saat menyimpan data.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) return;
    try {
      const response = await api.delete(`/users/${id}`);
      if (response.data.success) {
        fetchUsers();
        alert('Pengguna berhasil dihapus.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl leading-none">Manajemen Pengguna</h1>
          <p className="text-xs text-gray-400 mt-1">Daftar hak akses sistem internal dinas: Admin, Supervisor, dan Petugas Lapangan.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* 2. Filters & Searches */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button type="submit" className="px-4 py-1.5 rounded-lg bg-primary hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer">
            Cari
          </button>
        </form>

        <button 
          onClick={fetchUsers} 
          className="text-xs text-primary font-semibold hover:underline"
        >
          Muat Ulang Data
        </button>
      </div>

      {/* 3. User Grid / Table List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Hak Akses / Role</th>
                <th className="px-6 py-3 font-semibold">Status Akun</th>
                <th className="px-6 py-3 font-semibold">Terakhir Login</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-gray-400">Memuat data pengguna...</td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-gray-400">Tidak ada pengguna terdaftar.</td>
                </tr>
              ) : (
                usersList.map((user) => {
                  let roleColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                  if (user.role === 'admin') roleColor = 'text-red-500 bg-red-500/10 border-red-500/20';
                  if (user.role === 'supervisor') roleColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';

                  return (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.substring(0, 2)}
                        </div>
                        {user.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColor}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${user.is_active ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {user.last_login_at ? user.last_login_at.substring(0, 19).replace('T', ' ') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
                            title="Edit User / Reset Password"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-1 rounded bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Form Modal (Create / Edit & Password Reset) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0b1e] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-lg flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary" />
                {selectedUser ? 'Edit User / Reset Password' : 'Tambah User Baru'}
              </span>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Pengguna..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {validationErrors.name && (
                  <span className="text-[10px] text-red-500 block mt-0.5">{validationErrors.name[0]}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Email Instansi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@simdatan.go.id"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {validationErrors.email && (
                  <span className="text-[10px] text-red-500 block mt-0.5">{validationErrors.email[0]}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 flex justify-between">
                  <span>{selectedUser ? 'Password Baru (Reset)' : 'Password Awal'}</span>
                  {selectedUser && <span className="text-[10px] text-gray-400 font-normal">Biarkan kosong jika tidak diubah</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={selectedUser ? "Masukkan password baru untuk reset" : "Minimal 6 karakter..."}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {validationErrors.password && (
                  <span className="text-[10px] text-red-500 block mt-0.5">{validationErrors.password[0]}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Hak Akses (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="petugas">Petugas Lapangan</option>
                    <option value="supervisor">Supervisor Dinas</option>
                    <option value="admin">Administrator Utama</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Status Akun</label>
                  <select
                    value={isActive ? 'aktif' : 'nonaktif'}
                    onChange={(e) => setIsActive(e.target.value === 'aktif')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="aktif">Aktif Terdaftar</option>
                    <option value="nonaktif">Dinonaktifkan</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  {selectedUser ? 'Simpan & Reset' : 'Simpan User'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
