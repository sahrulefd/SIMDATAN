import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Edit3, Trash2, ArrowUpRight, Check, X, AlertTriangle, Download } from 'lucide-react';

interface Lahan {
  id: number;
  nama_lahan: string;
  luas_ha: number;
}

interface Komoditas {
  id: number;
  nama_komoditas: string;
  satuan: string;
}

interface ProduksiItem {
  id: number;
  lahan_id: number;
  komoditas_id: number;
  musim_tanam: string;
  tahun_tanam: number;
  tanggal_tanam: string;
  tanggal_panen_estimasi: string;
  tanggal_panen_aktual: string | null;
  status_panen: 'Belum Tanam' | 'Sedang Tanam' | 'Akan Panen' | 'Sudah Panen' | 'Gagal Panen';
  hasil_panen: number | null;
  satuan: string;
  produktivitas: number | null;
  keterangan: string | null;
  lahan?: Lahan;
  komoditas?: Komoditas;
}

export const ProduksiPanen: React.FC = () => {
  const [produksiList, setProduksiList] = useState<ProduksiItem[]>([]);
  const [lahanList, setLahanList] = useState<Lahan[]>([]);
  const [komoditasList, setKomoditasList] = useState<Komoditas[]>([]);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedKomoditas, setSelectedKomoditas] = useState('');
  const [loading, setLoading] = useState(true);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await api.get(`/export/report?module=produksi&format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_produksi_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor laporan.');
    }
  };

  // Form parameters
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduksi, setSelectedProduksi] = useState<ProduksiItem | null>(null);

  // Form Fields
  const [lahanId, setLahanId] = useState('');
  const [komoditasId, setKomoditasId] = useState('');
  const [musimTanam, setMusimTanam] = useState('');
  const [tahunTanam, setTahunTanam] = useState(String(date('Y')));
  const [tanggalTanam, setTanggalTanam] = useState('');
  const [tanggalPanenEstimasi, setTanggalPanenEstimasi] = useState('');
  const [tanggalPanenAktual, setTanggalPanenAktual] = useState('');
  const [statusPanen, setStatusPanen] = useState<any>('Belum Tanam');
  const [hasilPanen, setHasilPanen] = useState('');
  const [satuan, setSatuan] = useState('Ton');
  const [keterangan, setKeterangan] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Helper date function
  function date(format: string): number {
    return new Date().getFullYear();
  }

  const fetchProduksi = async () => {
    setLoading(true);
    try {
      const url = `/produksi-panen?page=${currentPage}&status_panen=${selectedStatus}&komoditas_id=${selectedKomoditas}`;
      const response = await api.get(url);
      setProduksiList(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const lahanRes = await api.get('/lahan');
      setLahanList(lahanRes.data.data || []);

      const komRes = await api.get('/komoditas');
      setKomoditasList(komRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProduksi();
  }, [currentPage, selectedStatus, selectedKomoditas]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const openCreateModal = () => {
    setSelectedProduksi(null);
    setLahanId('');
    setKomoditasId('');
    setMusimTanam('');
    setTahunTanam(String(new Date().getFullYear()));
    setTanggalTanam('');
    setTanggalPanenEstimasi('');
    setTanggalPanenAktual('');
    setStatusPanen('Belum Tanam');
    setHasilPanen('');
    setSatuan('Ton');
    setKeterangan('');
    setValidationErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (item: ProduksiItem) => {
    setSelectedProduksi(item);
    setLahanId(String(item.lahan_id));
    setKomoditasId(String(item.komoditas_id));
    setMusimTanam(item.musim_tanam);
    setTahunTanam(String(item.tahun_tanam));
    setTanggalTanam(item.tanggal_tanam.substring(0, 10));
    setTanggalPanenEstimasi(item.tanggal_panen_estimasi.substring(0, 10));
    setTanggalPanenAktual(item.tanggal_panen_aktual ? item.tanggal_panen_aktual.substring(0, 10) : '');
    setStatusPanen(item.status_panen);
    setHasilPanen(item.hasil_panen ? String(item.hasil_panen) : '');
    setSatuan(item.satuan);
    setKeterangan(item.keterangan || '');
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const payload = {
      lahan_id: lahanId,
      komoditas_id: komoditasId,
      musim_tanam: musimTanam,
      tahun_tanam: tahunTanam,
      tanggal_tanam: tanggalTanam,
      tanggal_panen_estimasi: tanggalPanenEstimasi,
      tanggal_panen_aktual: tanggalPanenAktual || null,
      status_panen: statusPanen,
      hasil_panen: hasilPanen || null,
      satuan,
      keterangan
    };

    try {
      let response;
      if (selectedProduksi) {
        response = await api.put(`/produksi-panen/${selectedProduksi.id}`, payload);
      } else {
        response = await api.post('/produksi-panen', payload);
      }

      if (response.data.success) {
        setShowFormModal(false);
        fetchProduksi();
      }
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setValidationErrors(err.response.data.errors);
      } else {
        alert('Terjadi kesalahan saat menyimpan data.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data produksi ini?')) return;
    try {
      const response = await api.delete(`/produksi-panen/${id}`);
      if (response.data.success) {
        fetchProduksi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl leading-none">Produksi & Panen</h1>
          <p className="text-xs text-gray-400 mt-1">Pencatatan siklus tanam, perkiraan panen, dan tonase produksi lapangan.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-gray-250 dark:border-gray-700"
          >
            <Download className="w-4 h-4" /> Ekspor Excel/CSV
          </button>
          
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Input Produksi
          </button>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-end">
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedKomoditas}
            onChange={(e) => setSelectedKomoditas(e.target.value)}
            className="flex-1 md:w-48 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Komoditas</option>
            {komoditasList.map(c => (
              <option key={c.id} value={c.id}>{c.nama_komoditas}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:w-48 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option value="Belum Tanam">Belum Tanam</option>
            <option value="Sedang Tanam">Sedang Tanam</option>
            <option value="Akan Panen">Akan Panen</option>
            <option value="Sudah Panen">Sudah Panen</option>
            <option value="Gagal Panen">Gagal Panen</option>
          </select>
        </div>
      </div>

      {/* 3. Table lists */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">Lahan</th>
                <th className="px-6 py-3 font-semibold">Komoditas</th>
                <th className="px-6 py-3 font-semibold">Musim Tanam</th>
                <th className="px-6 py-3 font-semibold">Tahun</th>
                <th className="px-6 py-3 font-semibold">Estimasi Panen</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Hasil Panen</th>
                <th className="px-6 py-3 font-semibold">Produktivitas</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produksiList.map((item) => {
                let statusColor = 'text-green-500 bg-green-500/10 border-green-500/20';
                if (item.status_panen === 'Sedang Tanam') statusColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                if (item.status_panen === 'Akan Panen') statusColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                if (item.status_panen === 'Gagal Panen') statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';

                return (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold">{item.lahan ? item.lahan.nama_lahan : 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-400">{item.komoditas ? item.komoditas.nama_komoditas : 'N/A'}</td>
                    <td className="px-6 py-4 text-xs">{item.musim_tanam}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.tahun_tanam}</td>
                    <td className="px-6 py-4 text-xs">{item.tanggal_panen_estimasi.substring(0, 10)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor}`}>
                        {item.status_panen}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {item.hasil_panen !== null ? `${item.hasil_panen} ${item.satuan}` : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-500">
                      {item.produktivitas !== null ? `${item.produktivitas} ${item.satuan}/Ha` : '-'}
                    </td>
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
                  </tr>
                );
              })}
              {produksiList.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">Tidak ada data produksi panen.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedProduksi ? 'Update Riwayat Tanam' : 'Input Siklus Tanam Baru'}</span>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Pilih Lahan</label>
                  <select
                    required
                    value={lahanId}
                    onChange={(e) => setLahanId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih Lahan</option>
                    {lahanList.map(l => (
                      <option key={l.id} value={l.id}>{l.nama_lahan} ({l.luas_ha} Ha)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Komoditas</label>
                  <select
                    required
                    value={komoditasId}
                    onChange={(e) => setKomoditasId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih Komoditas</option>
                    {komoditasList.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_komoditas}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Musim Tanam</label>
                  <input
                    type="text"
                    required
                    value={musimTanam}
                    onChange={(e) => setMusimTanam(e.target.value)}
                    placeholder="Contoh: Musim Hujan I"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Tahun Tanam</label>
                  <input
                    type="number"
                    required
                    value={tahunTanam}
                    onChange={(e) => setTahunTanam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Tanggal Tanam</label>
                  <input
                    type="date"
                    required
                    value={tanggalTanam}
                    onChange={(e) => setTanggalTanam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Estimasi Tanggal Panen</label>
                  <input
                    type="date"
                    required
                    value={tanggalPanenEstimasi}
                    onChange={(e) => setTanggalPanenEstimasi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Status Fase Tanam</label>
                  <select
                    value={statusPanen}
                    onChange={(e) => setStatusPanen(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Belum Tanam">Belum Tanam</option>
                    <option value="Sedang Tanam">Sedang Tanam</option>
                    <option value="Akan Panen">Akan Panen</option>
                    <option value="Sudah Panen">Sudah Panen</option>
                    <option value="Gagal Panen">Gagal Panen</option>
                  </select>
                </div>

                {statusPanen === 'Sudah Panen' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Tanggal Panen Aktual</label>
                    <input
                      type="date"
                      required
                      value={tanggalPanenAktual}
                      onChange={(e) => setTanggalPanenAktual(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {(statusPanen === 'Sudah Panen' || statusPanen === 'Gagal Panen') && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Hasil Produksi (Tonase)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={hasilPanen}
                      onChange={(e) => setHasilPanen(e.target.value)}
                      placeholder="Contoh: 8.50"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Catatan / Deskripsi Laporan</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-lg shadow-primary/20 hover:shadow-none transition-all"
              >
                Submit Data Produksi
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
