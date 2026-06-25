import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit3, Trash2, X, Tag } from 'lucide-react';

interface KomoditasItem {
  id: number;
  kode_komoditas: string;
  nama_komoditas: string;
  kategori: string;
  satuan: string;
  harga_acuan: number;
  deskripsi: string | null;
}

export const Komoditas: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<KomoditasItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KomoditasItem | null>(null);
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Pangan');
  const [satuan, setSatuan] = useState('Ton');
  const [harga, setHarga] = useState(0);
  const [deskripsi, setDeskripsi] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/komoditas?page=${currentPage}&search=${searchQuery}`);
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
    setSelectedItem(null);
    setKode('');
    setNama('');
    setKategori('Pangan');
    setSatuan('Ton');
    setHarga(0);
    setDeskripsi('');
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (item: KomoditasItem) => {
    setSelectedItem(item);
    setKode(item.kode_komoditas);
    setNama(item.nama_komoditas);
    setKategori(item.kategori);
    setSatuan(item.satuan);
    setHarga(item.harga_acuan);
    setDeskripsi(item.deskripsi || '');
    setErrors({});
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const payload = {
      kode_komoditas: kode,
      nama_komoditas: nama,
      kategori,
      satuan,
      harga_acuan: harga,
      deskripsi,
    };
    try {
      if (selectedItem) {
        await api.put(`/komoditas/${selectedItem.id}`, payload);
      } else {
        await api.post('/komoditas', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komoditas ini?')) return;
    try {
      await api.delete(`/komoditas/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Komoditas Pertanian</h1>
          <p className="text-xs text-gray-500 mt-1">Daftar jenis hasil bumi, acuan satuan, dan harga pasar regional.</p>
        </div>

        {user?.role !== 'supervisor' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Komoditas
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari komoditas..."
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
                <th className="px-6 py-3 font-semibold">Kode</th>
                <th className="px-6 py-3 font-semibold">Nama Komoditas</th>
                <th className="px-6 py-3 font-semibold">Kategori</th>
                <th className="px-6 py-3 font-semibold">Satuan</th>
                <th className="px-6 py-3 font-semibold">Harga Acuan</th>
                <th className="px-6 py-3 font-semibold">Deskripsi</th>
                {user?.role !== 'supervisor' && <th className="px-6 py-3 text-right font-semibold">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-primary">{item.kode_komoditas}</td>
                  <td className="px-6 py-4 font-semibold">{item.nama_komoditas}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.satuan}</td>
                  <td className="px-6 py-4 font-mono font-semibold">{formatRupiah(item.harga_acuan)}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-400">{item.deskripsi || '-'}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedItem ? 'Edit Komoditas' : 'Komoditas Baru'}</span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Kode Komoditas</label>
                <input
                  type="text"
                  required
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="KMD-PADI"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.kode_komoditas && <span className="text-[10px] text-red-500">{errors.kode_komoditas[0]}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Komoditas</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Padi Sawah"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Pangan">Pangan</option>
                    <option value="Hortikultura">Hortikultura</option>
                    <option value="Perkebunan">Perkebunan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">Satuan</label>
                  <input
                    type="text"
                    required
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    placeholder="Ton atau Kg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Harga Acuan (IDR)</label>
                <input
                  type="number"
                  required
                  value={harga}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs cursor-pointer shadow-md">
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
