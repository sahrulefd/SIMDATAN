import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit3, Trash2, X, Compass, User } from 'lucide-react';

interface Desa {
  id: number;
  nama_desa: string;
}

interface KelompokTaniItem {
  id: number;
  nama_kelompok: string;
  ketua_nama: string;
  tahun_berdiri: number;
  alamat: string;
  desa?: Desa;
}

export const KelompokTani: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<KelompokTaniItem[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KelompokTaniItem | null>(null);
  const [namaKelompok, setNamaKelompok] = useState('');
  const [ketuaNama, setKetuaNama] = useState('');
  const [tahunBerdiri, setTahunBerdiri] = useState(new Date().getFullYear());
  const [alamat, setAlamat] = useState('');
  const [desaId, setDesaId] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kelompok-tani?page=${currentPage}&search=${searchQuery}`);
      setList(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesa = async () => {
    try {
      const response = await api.get('/desa');
      setDesaList(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    fetchDesa();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setNamaKelompok('');
    setKetuaNama('');
    setTahunBerdiri(new Date().getFullYear());
    setAlamat('');
    setDesaId('');
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (item: KelompokTaniItem) => {
    setSelectedItem(item);
    setNamaKelompok(item.nama_kelompok);
    setKetuaNama(item.ketua_nama);
    setTahunBerdiri(item.tahun_berdiri);
    setAlamat(item.alamat || '');
    setDesaId(item.desa?.id ? String(item.desa.id) : '');
    setErrors({});
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      nama_kelompok: namaKelompok,
      ketua_nama: ketuaNama,
      tahun_berdiri: tahunBerdiri,
      alamat: alamat,
      desa_id: desaId ? Number(desaId) : null,
    };

    try {
      if (selectedItem) {
        await api.put(`/kelompok-tani/${selectedItem.id}`, payload);
      } else {
        await api.post('/kelompok-tani', payload);
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
    if (!confirm('Apakah Anda yakin ingin menghapus kelompok tani ini?')) return;
    try {
      await api.delete(`/kelompok-tani/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Kelompok Tani</h1>
          <p className="text-xs text-gray-500 mt-1">Pembinaan dan manajemen data organisasi kelompok tani.</p>
        </div>

        {user?.role !== 'supervisor' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Kelompok
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kelompok tani..."
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
                <th className="px-6 py-3 font-semibold">Nama Kelompok</th>
                <th className="px-6 py-3 font-semibold">Nama Ketua</th>
                <th className="px-6 py-3 font-semibold">Tahun Berdiri</th>
                <th className="px-6 py-3 font-semibold">Desa / Wilayah</th>
                <th className="px-6 py-3 font-semibold">Alamat</th>
                {user?.role !== 'supervisor' && <th className="px-6 py-3 text-right font-semibold">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-primary">{item.nama_kelompok}</td>
                  <td className="px-6 py-4 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {item.ketua_nama}
                  </td>
                  <td className="px-6 py-4">{item.tahun_berdiri}</td>
                  <td className="px-6 py-4 text-gray-400">{item.desa ? item.desa.nama_desa : '-'}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate">{item.alamat || '-'}</td>
                  {user?.role !== 'supervisor' && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(item)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada kelompok tani ditemukan.</td>
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedItem ? 'Edit Kelompok Tani' : 'Kelompok Tani Baru'}</span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Kelompok Tani</label>
                <input
                  type="text"
                  required
                  value={namaKelompok}
                  onChange={(e) => setNamaKelompok(e.target.value)}
                  placeholder="Kelompok Tani Makmur"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nama_kelompok && <span className="text-[10px] text-red-500">{errors.nama_kelompok[0]}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Ketua Kelompok</label>
                <input
                  type="text"
                  required
                  value={ketuaNama}
                  onChange={(e) => setKetuaNama(e.target.value)}
                  placeholder="Budi Setiawan"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Tahun Berdiri</label>
                  <input
                    type="number"
                    required
                    value={tahunBerdiri}
                    onChange={(e) => setTahunBerdiri(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">Desa / Kelurahan</label>
                  <select
                    value={desaId}
                    required
                    onChange={(e) => setDesaId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih Desa</option>
                    {desaList.map(d => (
                      <option key={d.id} value={d.id}>{d.nama_desa}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Alamat Lengkap</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2.5}
                  placeholder="Kampung Tani Raya No. 4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-lg shadow-primary/10 cursor-pointer"
              >
                {selectedItem ? 'Simpan Perubahan' : 'Buat Kelompok Tani'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
