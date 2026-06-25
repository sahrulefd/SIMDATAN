import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, X, FileText, Download, FileArchive, ImageIcon, FileSpreadsheet } from 'lucide-react';

interface Uploader {
  id: number;
  name: string;
}

interface DokumenItem {
  id: number;
  nama_dokumen: string;
  tipe_file: string;
  file_path: string;
  versi: number;
  created_at: string;
  uploaded_by?: Uploader;
}

export const Dokumen: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<DokumenItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [namaDokumen, setNamaDokumen] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dokumen?page=${currentPage}&search=${searchQuery}`);
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

  const openCreateModal = () => {
    setNamaDokumen('');
    setFile(null);
    setErrors({});
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!file) {
      setErrors({ dokumen_file: ['File dokumen wajib diisi.'] });
      return;
    }

    const formData = new FormData();
    formData.append('nama_dokumen', namaDokumen);
    formData.append('dokumen_file', file);

    try {
      await api.post('/dokumen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert('Terjadi kesalahan saat mengunggah dokumen.');
      }
    }
  };

  const handleDownload = async (item: DokumenItem) => {
    try {
      // Direct window redirect to download endpoint to force download stream
      const token = localStorage.getItem('access_token');
      window.open(`http://127.0.0.1:8000/api/v1/dokumen/${item.id}/download?token=${token}`, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini beserta seluruh versinya?')) return;
    try {
      await api.delete(`/dokumen/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFileIcon = (type: string) => {
    const ext = type.toUpperCase();
    if (['PDF'].includes(ext)) return <FileText className="w-8 h-8 text-red-500" />;
    if (['XLSX', 'XLS', 'CSV'].includes(ext)) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    if (['JPG', 'PNG', 'JPEG'].includes(ext)) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    return <FileArchive className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Vault Dokumen</h1>
          <p className="text-xs text-gray-500 mt-1">Penyimpanan terpusat dokumen pendukung, surat keputusan, sertifikat lahan, dan regulasi pertanian.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload Dokumen
        </button>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokumen..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#0c0b1e] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
            <div className="p-3 bg-gray-50 dark:bg-[#0f0e26]/30 rounded-xl flex-shrink-0 flex items-center justify-center">
              {getFileIcon(item.tipe_file)}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-sm leading-snug truncate" title={item.nama_dokumen}>
                    {item.nama_dokumen}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/10 uppercase">
                    v{item.versi}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase">{item.tipe_file} Document</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-900/50">
                <span className="text-[10px] text-gray-400">Oleh: {item.uploaded_by?.name || 'Petugas'}</span>
                
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(item)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-primary transition-colors cursor-pointer" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors cursor-pointer" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">Tidak ada dokumen di dalam vault.</div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">Upload Dokumen Baru</span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Dokumen</label>
                <input
                  type="text"
                  required
                  value={namaDokumen}
                  onChange={(e) => setNamaDokumen(e.target.value)}
                  placeholder="Sertifikat Lahan Kelompok Maju"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">File Dokumen (PDF, Word, Excel, Image)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.xlsx,.xls,.jpg,.png,.jpeg"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200 transition-colors"
                />
                {errors.dokumen_file && <span className="text-[10px] text-red-500 mt-1 block">{errors.dokumen_file[0]}</span>}
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs cursor-pointer shadow-md">
                Simpan ke Vault
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
