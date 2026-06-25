import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Download, Upload, ShieldAlert, Check, X } from 'lucide-react';

export const Settings: React.FC = () => {
  const [namaInstansi, setNamaInstansi] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');
  const [tahunAktif, setTahunAktif] = useState('');
  const [tema, setTema] = useState('dark');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const data = response.data;
      setNamaInstansi(data.nama_instansi || '');
      setAlamat(data.alamat || '');
      setKontak(data.kontak || '');
      setTahunAktif(data.tahun_aktif || '');
      setTema(data.tema_sistem || 'dark');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nama_instansi', namaInstansi);
    formData.append('alamat', alamat);
    formData.append('kontak', kontak);
    formData.append('tahun_aktif', tahunAktif);
    formData.append('tema_sistem', tema);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await api.post('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        alert('Pengaturan instansi berhasil disimpan.');
        fetchSettings();
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      // Trigger browser download by redirecting or opening in new window
      const token = localStorage.getItem('access_token');
      const url = `${api.defaults.baseURL}/settings/backup?token=${token}`;
      
      const link = document.createElement('a');
      link.href = url;
      // Append auth header via query or download natively
      window.open(url, '_blank');
    } catch (err) {
      alert('Gagal memproses database backup.');
    }
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) {
      alert('Pilih file SQL backup terlebih dahulu.');
      return;
    }

    if (!confirm('Peringatan: Melakukan restore akan menimpa seluruh database Anda. Apakah Anda yakin?')) return;

    setRestoreLoading(true);
    const formData = new FormData();
    formData.append('backup_file', restoreFile);

    try {
      const response = await api.post('/settings/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        alert('Database berhasil direstore! Halaman akan dimuat ulang.');
        window.location.reload();
      }
    } catch (err) {
      alert('Gagal melakukan restore. Pastikan format file SQL backup sesuai.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl leading-none">Pengaturan Sistem</h1>
        <p className="text-xs text-gray-400 mt-1">Konfigurasi nama instansi dinas, manajemen database, dan pemeliharaan cadangan.</p>
      </div>

      {/* 2. Grid split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Settings Form */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" /> Informasi Instansi Dinas
          </h3>

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Nama Instansi</label>
                <input
                  type="text"
                  required
                  value={namaInstansi}
                  onChange={(e) => setNamaInstansi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Tahun Aktif</label>
                <input
                  type="number"
                  required
                  value={tahunAktif}
                  onChange={(e) => setTahunAktif(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Alamat Dinas</label>
              <textarea
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Kontak / Email</label>
                <input
                  type="text"
                  required
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Tema Sistem</label>
                <select
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="light">Terang (Light)</option>
                  <option value="dark">Gelap (Dark)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Upload Logo Baru</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-primary/20 hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>

        {/* Database Maintenance Panel */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-6">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" /> Database Maintenance
          </h3>

          {/* Backup Action */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Manual Database Backup</h4>
            <p className="text-xs text-gray-500 leading-normal">Unduh cadangan data lengkap berupa file SQL siap pakai.</p>
            <button
              onClick={handleBackup}
              className="w-full py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <Download className="w-4 h-4" /> Ekspor File SQL (.sql)
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Restore Action */}
          <form onSubmit={handleRestoreSubmit} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Restore Database</h4>
            <p className="text-xs text-gray-500 leading-normal">Pulihkan struktur tabel dan data dari file SQL eksternal.</p>
            <input
              type="file"
              required
              accept=".sql"
              onChange={(e) => setRestoreFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-red-500 hover:file:bg-gray-200"
            />
            <button
              type="submit"
              disabled={restoreLoading}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> {restoreLoading ? 'Memulihkan...' : 'Mulai Restore Data'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
