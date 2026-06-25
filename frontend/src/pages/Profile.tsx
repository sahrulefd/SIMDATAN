import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, KeyRound, Shield, Calendar, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import defaultAvatar from '../assets/default_avatar.png';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password Anda berhasil diperbarui.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Gagal mengganti password.' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal mengubah password. Periksa kembali password saat ini.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Profil Saya</h1>
        <p className="text-gray-500 dark:text-gray-400">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-white dark:bg-[#0c0b1e] border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
          <img 
            src={defaultAvatar} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover border-2 border-primary mb-4 bg-white shadow-md"
          />
          <h2 className="font-heading font-bold text-lg">{user?.name}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mt-2 uppercase tracking-wide">
            <Shield className="w-3 h-3" />
            {user?.role}
          </span>
          <div className="w-full border-t border-gray-100 dark:border-gray-800 my-4"></div>
          <div className="w-full space-y-3.5 text-left text-sm">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>Joined June 2026</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white dark:bg-[#0c0b1e] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2.5 mb-6">
            <KeyRound className="w-5 h-5 text-primary" />
            Ganti Password
          </h3>

          {message && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 text-sm mb-6 border ${
                message.type === 'success'
                  ? 'bg-green-50/10 border-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password Saat Ini
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/95 focus:ring-2 focus:ring-primary/25 disabled:opacity-50 shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
