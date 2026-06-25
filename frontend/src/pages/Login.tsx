import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Sun, Moon, ArrowRight, ShieldCheck, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png';

export const Login: React.FC = () => {
  const { login, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password parameters
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        navigate('/');
      } else {
        setErrorMsg('Email atau password salah, atau akun Anda nonaktif.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#040d08] transition-colors duration-200">
      
      {/* 1. Branding Panel */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 bg-gradient-to-br from-primary to-green-950 text-white select-none">
        <div className="flex items-center">
          <img src={logo} alt="SIMDATAN Logo" className="h-16 w-auto object-contain bg-white p-3 rounded-xl shadow-lg border border-emerald-500/20" />
        </div>

        <div className="my-16 max-w-lg space-y-6">
          <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight">
            Sistem Informasi Manajemen Data Pertanian
          </h1>
          <p className="text-emerald-100/70 text-sm md:text-base leading-relaxed">
            Centralized agricultural intelligence database for Dinas Pertanian. Track harvests, coordinate regions, manage cooperative farmers groups, and map land properties seamlessly in real-time.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-emerald-200/50">
          <span>&copy; 2026 Dinas Pertanian. All rights reserved.</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Enterprise Grade Security</span>
        </div>
      </div>

      {/* 2. Form Panel */}
      <div className="w-full md:w-[480px] flex flex-col justify-center p-8 md:p-16 bg-white dark:bg-[#06140c] border-l border-gray-100 dark:border-gray-800 relative">
        
        {/* Float theme selector */}
        <button 
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-full max-w-sm mx-auto space-y-8">
          <div>
            <h2 className="font-heading font-bold text-2xl leading-none">Selamat Datang</h2>
            <p className="text-xs text-gray-400 mt-2">Silakan masuk menggunakan kredensial instansi Anda.</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-xs flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Email Instansi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@simdatan.go.id"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-900"
                />
                <span className="text-xs text-gray-500">Ingat Saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading ? 'Masuk...' : 'Masuk Ke Panel'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 3. Password Reset Dialog Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#0c1e14] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <span className="font-heading font-semibold text-md">Pemulihan Akun</span>
                <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 py-2">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2.5 items-start leading-relaxed">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">Akses Pemulihan Terbatas</span>
                    Silakan hubungi Administrator Utama Dinas Pertanian Daerah melalui email resmi ke <strong className="underline">admin@simdatan.go.id</strong> untuk melakukan reset kata sandi Anda secara manual.
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Tutup Dialog
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
