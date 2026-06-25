import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit3, Trash2, X, ClipboardList, Calendar, User, Eye } from 'lucide-react';

interface Petugas {
  id: number;
  name: string;
}

interface KegiatanItem {
  id: number;
  judul: string;
  tipe_kegiatan: 'Kunjungan' | 'Penyuluhan' | 'Monitoring';
  tanggal_kegiatan: string;
  catatan: string | null;
  foto_path: string | null;
  petugas?: Petugas;
}

export const KegiatanLapangan: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<KegiatanItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipe, setSelectedTipe] = useState('');
  const [loading, setLoading] = useState(true);

  // Form & View states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KegiatanItem | null>(null);
  
  // Form fields
  const [judul, setJudul] = useState('');
  const [tipeKegiatan, setTipeKegiatan] = useState<'Kunjungan' | 'Penyuluhan' | 'Monitoring'>('Kunjungan');
  const [tanggalKegiatan, setTanggalKegiatan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kegiatan-lapangan?page=${currentPage}&search=${searchQuery}&tipe_kegiatan=${selectedTipe}`);
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
  }, [currentPage, selectedTipe]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setJudul('');
    setTipeKegiatan('Kunjungan');
    setTanggalKegiatan(new Date().toISOString().substring(0, 10));
    setCatatan('');
    setFotoFile(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (item: KegiatanItem) => {
    setSelectedItem(item);
    setJudul(item.judul);
    setTipeKegiatan(item.tipe_kegiatan);
    setTanggalKegiatan(item.tanggal_kegiatan ? item.tanggal_kegiatan.substring(0, 10) : '');
    setCatatan(item.catatan || '');
    setFotoFile(null);
    setErrors({});
    setShowModal(true);
  };

  const openViewModal = (item: KegiatanItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('tipe_kegiatan', tipeKegiatan);
    formData.append('tanggal_kegiatan', tanggalKegiatan);
    formData.append('catatan', catatan);
    if (fotoFile) {
      formData.append('foto', fotoFile);
    }

    try {
      if (selectedItem) {
        formData.append('_method', 'PUT');
        await api.post(`/kegiatan-lapangan/${selectedItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/kegiatan-lapangan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert('Terjadi kesalahan saat menyimpan data.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan lapangan ini?')) return;
    try {
      await api.delete(`/kegiatan-lapangan/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderBadge = (tipe: string) => {
    const colors = {
      Kunjungan: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      Penyuluhan: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      Monitoring: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(colors as any)[tipe]}`}>
        {tipe}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Kegiatan Lapangan</h1>
          <p className="text-xs text-gray-500 mt-1">Laporan aktivitas penyuluhan, monitoring pertanian, dan kunjungan lapangan petugas.</p>
        </div>

        {user?.role !== 'supervisor' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Lapor Kegiatan
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul kegiatan..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <select
          value={selectedTipe}
          onChange={(e) => setSelectedTipe(e.target.value)}
          className="w-full md:w-48 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Tipe</option>
          <option value="Kunjungan">Kunjungan</option>
          <option value="Penyuluhan">Penyuluhan</option>
          <option value="Monitoring">Monitoring</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#0c0b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              {item.foto_path ? (
                <div className="h-44 overflow-hidden relative">
                  <img src={`${BASE_URL}${item.foto_path}`} alt={item.judul} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">{renderBadge(item.tipe_kegiatan)}</div>
                </div>
              ) : (
                <div className="h-44 bg-gray-100 dark:bg-[#0f0e26]/30 flex flex-col items-center justify-center relative text-gray-400">
                  <ClipboardList className="w-10 h-10 mb-1" />
                  <span className="text-xs">Tidak ada dokumentasi foto</span>
                  <div className="absolute top-3 left-3">{renderBadge(item.tipe_kegiatan)}</div>
                </div>
              )}

              <div className="p-5 space-y-3">
                <h3 className="font-heading font-bold text-base leading-snug line-clamp-1">{item.judul}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{item.catatan || 'Tidak ada catatan kegiatan.'}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-900/50">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{item.tanggal_kegiatan.substring(0, 10)}</span>
                  <span className="flex items-center gap-1 font-semibold text-primary"><User className="w-3.5 h-3.5" />{item.petugas?.name}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#0f0e26]/20 border-t border-gray-100 dark:border-gray-900/40 flex items-center justify-between">
              <button onClick={() => openViewModal(item)} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                <Eye className="w-3.5 h-3.5" /> Detail Kegiatan
              </button>

              {(user?.role === 'admin' || item.petugas?.id === user?.id) && (
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-blue-500 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">Tidak ada laporan kegiatan lapangan ditemukan.</div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedItem ? 'Edit Laporan Kegiatan' : 'Lapor Kegiatan Baru'}</span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Penyuluhan Penanaman Padi Unggul"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Tipe Kegiatan</label>
                  <select
                    value={tipeKegiatan}
                    onChange={(e) => setTipeKegiatan(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Kunjungan">Kunjungan</option>
                    <option value="Penyuluhan">Penyuluhan</option>
                    <option value="Monitoring">Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggalKegiatan}
                    onChange={(e) => setTanggalKegiatan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Catatan Kegiatan</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  placeholder="Deskripsikan proses kegiatan, hambatan, dan respons kelompok tani..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Upload Dokumentasi Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200 transition-colors"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs cursor-pointer shadow-md">
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">Detail Kegiatan Lapangan</span>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {selectedItem.foto_path && (
                <div className="rounded-lg overflow-hidden h-56">
                  <img src={`${BASE_URL}${selectedItem.foto_path}`} alt={selectedItem.judul} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {renderBadge(selectedItem.tipe_kegiatan)}
                  <span className="text-xs text-gray-400">{selectedItem.tanggal_kegiatan.substring(0, 10)}</span>
                </div>
                <h2 className="font-heading font-bold text-xl">{selectedItem.judul}</h2>
                <div className="text-sm font-medium text-primary flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  Petugas: {selectedItem.petugas?.name}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-300">
                {selectedItem.catatan || 'Tidak ada catatan kegiatan.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
