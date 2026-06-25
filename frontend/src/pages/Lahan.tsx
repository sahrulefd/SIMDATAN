import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Edit3, Trash2, MapPin, X, AlertCircle } from 'lucide-react';

interface Petani {
  id: number;
  nama: string;
}

interface LahanItem {
  id: number;
  pemilik_petani_id: number;
  kode_lahan: string;
  nama_lahan: string;
  luas_ha: number;
  status_kepemilikan: 'Milik Sendiri' | 'Sewa' | 'Bagi Hasil';
  latitude: number | null;
  longitude: number | null;
  foto_path: string | null;
  dokumen_pendukung_path: string | null;
  pemilik?: Petani;
}

export const Lahan: React.FC = () => {
  const [lahanList, setLahanList] = useState<LahanItem[]>([]);
  const [petaniList, setPetaniList] = useState<Petani[]>([]);
  const [kecamatans, setKecamatans] = useState<{ id: number; nama_kecamatan: string }[]>([]);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [loading, setLoading] = useState(true);

  // Form parameters
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedLahan, setSelectedLahan] = useState<LahanItem | null>(null);

  // Form Fields
  const [pemilikPetaniId, setPemilikPetaniId] = useState('');
  const [kodeLahan, setKodeLahan] = useState('');
  const [namaLahan, setNamaLahan] = useState('');
  const [luasHa, setLuasHa] = useState('');
  const [statusKepemilikan, setStatusKepemilikan] = useState<'Milik Sendiri' | 'Sewa' | 'Bagi Hasil'>('Milik Sendiri');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [dokumenFile, setDokumenFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const fetchLahan = async () => {
    setLoading(true);
    try {
      const url = `/lahan?page=${currentPage}&search=${searchQuery}&kecamatan_id=${selectedKecamatan}`;
      const response = await api.get(url);
      setLahanList(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const petRes = await api.get('/petani');
      setPetaniList(petRes.data.data || []);

      const kecRes = await api.get('/kecamatan');
      setKecamatans(kecRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLahan();
  }, [currentPage, selectedKecamatan]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLahan();
  };

  const openCreateModal = () => {
    setSelectedLahan(null);
    setPemilikPetaniId('');
    setKodeLahan('LHN-' + Math.floor(100 + Math.random() * 900));
    setNamaLahan('');
    setLuasHa('');
    setStatusKepemilikan('Milik Sendiri');
    setLatitude('');
    setLongitude('');
    setFotoFile(null);
    setDokumenFile(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (item: LahanItem) => {
    setSelectedLahan(item);
    setPemilikPetaniId(String(item.pemilik_petani_id));
    setKodeLahan(item.kode_lahan);
    setNamaLahan(item.nama_lahan);
    setLuasHa(String(item.luas_ha));
    setStatusKepemilikan(item.status_kepemilikan);
    setLatitude(item.latitude ? String(item.latitude) : '');
    setLongitude(item.longitude ? String(item.longitude) : '');
    setFotoFile(null);
    setDokumenFile(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = new FormData();
    formData.append('pemilik_petani_id', pemilikPetaniId);
    formData.append('kode_lahan', kodeLahan);
    formData.append('nama_lahan', namaLahan);
    formData.append('luas_ha', luasHa);
    formData.append('status_kepemilikan', statusKepemilikan);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    if (fotoFile) formData.append('foto', fotoFile);
    if (dokumenFile) formData.append('dokumen', dokumenFile);

    try {
      let response;
      if (selectedLahan) {
        formData.append('_method', 'PUT');
        response = await api.post(`/lahan/${selectedLahan.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/lahan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        setShowFormModal(false);
        fetchLahan();
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
    if (!confirm('Apakah Anda yakin ingin menghapus lahan ini?')) return;
    try {
      const response = await api.delete(`/lahan/${id}`);
      if (response.data.success) {
        fetchLahan();
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
          <h1 className="font-heading font-bold text-3xl leading-none">Lahan Pertanian</h1>
          <p className="text-xs text-gray-400 mt-1">Registrasi aset lahan, pendataan luas, dan titik koordinat pemetaan.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Lahan
        </button>
      </div>

      {/* 2. Search & Filters */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode lahan atau nama..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <select
          value={selectedKecamatan}
          onChange={(e) => setSelectedKecamatan(e.target.value)}
          className="w-full md:w-48 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatans.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kecamatan}</option>
          ))}
        </select>

      </div>

      {/* 3. Table list */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">Kode Lahan</th>
                <th className="px-6 py-3 font-semibold">Nama Lahan</th>
                <th className="px-6 py-3 font-semibold">Pemilik (Petani)</th>
                <th className="px-6 py-3 font-semibold">Luas (Ha)</th>
                <th className="px-6 py-3 font-semibold">Status Kepemilikan</th>
                <th className="px-6 py-3 font-semibold">Koordinat (Lat / Lng)</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lahanList.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-primary">{item.kode_lahan}</td>
                  <td className="px-6 py-4 font-semibold">{item.nama_lahan}</td>
                  <td className="px-6 py-4">{item.pemilik ? item.pemilik.nama : 'N/A'}</td>
                  <td className="px-6 py-4 font-bold">{item.luas_ha} Ha</td>
                  <td className="px-6 py-4 text-gray-400">{item.status_kepemilikan}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : 'Belum Dipetakan'}
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
              ))}
              {lahanList.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data lahan ditemukan.</td>
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
              <span className="font-heading font-semibold text-md">{selectedLahan ? 'Edit Informasi Lahan' : 'Tambah Lahan Baru'}</span>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Kode Lahan (Unique)</label>
                  <input
                    type="text"
                    required
                    value={kodeLahan}
                    onChange={(e) => setKodeLahan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nama Lahan</label>
                  <input
                    type="text"
                    required
                    value={namaLahan}
                    onChange={(e) => setNamaLahan(e.target.value)}
                    placeholder="Contoh: Sawah Hilir"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Pemilik Lahan (Petani)</label>
                  <select
                    required
                    value={pemilikPetaniId}
                    onChange={(e) => setPemilikPetaniId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih Petani</option>
                    {petaniList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Luas Lahan (Hektar / Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={luasHa}
                    onChange={(e) => setLuasHa(e.target.value)}
                    placeholder="Contoh: 1.50"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Status Kepemilikan</label>
                  <select
                    value={statusKepemilikan}
                    onChange={(e) => setStatusKepemilikan(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Milik Sendiri">Milik Sendiri</option>
                    <option value="Sewa">Sewa</option>
                    <option value="Bagi Hasil">Bagi Hasil</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-6.612345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="106.812345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Upload Foto Lahan</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Sertifikat / Dokumen Pendukung (PDF/PNG/JPG)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,image/*"
                  onChange={(e) => setDokumenFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-lg shadow-primary/20 hover:shadow-none transition-all"
              >
                {selectedLahan ? 'Simpan Perubahan' : 'Daftarkan Lahan'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
