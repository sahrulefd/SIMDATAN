import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Eye, 
  ArrowLeft, 
  FileSpreadsheet, 
  Upload, 
  X, 
  AlertCircle 
} from 'lucide-react';

interface KelompokTani {
  id: number;
  nama_kelompok: string;
}

interface PetaniItem {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nomor_hp: string;
  alamat: string;
  foto_path: string | null;
  status: 'aktif' | 'nonaktif';
  tanggal_bergabung: string;
  kelompok_tani?: KelompokTani;
}

export const Petani: React.FC = () => {
  const { user } = useAuth();
  
  // Data lists
  const [petaniList, setPetaniList] = useState<PetaniItem[]>([]);
  const [kelompokList, setKelompokList] = useState<KelompokTani[]>([]);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelompok, setSelectedKelompok] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail / Form Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPetani, setSelectedPetani] = useState<PetaniItem | null>(null);
  
  // Form fields
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [kelompokTaniId, setKelompokTaniId] = useState('');
  const [tanggalBergabung, setTanggalBergabung] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Load list of farmers
  const fetchPetani = async () => {
    setLoading(true);
    try {
      const url = `/petani?page=${currentPage}&search=${searchQuery}&kelompok_tani_id=${selectedKelompok}&status=${selectedStatus}`;
      const response = await api.get(url);
      setPetaniList(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load kelompok tani options
  const fetchKelompok = async () => {
    try {
      const response = await api.get('/kelompok-tani');
      setKelompokList(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPetani();
  }, [currentPage, selectedKelompok, selectedStatus]);

  useEffect(() => {
    fetchKelompok();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPetani();
  };

  const openCreateModal = () => {
    setSelectedPetani(null);
    setNik('');
    setNama('');
    setJenisKelamin('L');
    setTanggalLahir('');
    setNomorHp('');
    setAlamat('');
    setStatus('aktif');
    setKelompokTaniId('');
    setTanggalBergabung('');
    setFotoFile(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (item: PetaniItem) => {
    setSelectedPetani(item);
    setNik(item.nik);
    setNama(item.nama);
    setJenisKelamin(item.jenis_kelamin);
    setTanggalLahir(item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '');
    setNomorHp(item.nomor_hp || '');
    setAlamat(item.alamat || '');
    setStatus(item.status);
    setKelompokTaniId(item.kelompok_tani?.id ? String(item.kelompok_tani.id) : '');
    setTanggalBergabung(item.tanggal_bergabung ? item.tanggal_bergabung.substring(0, 10) : '');
    setFotoFile(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // NIK validation
    if (nik.length !== 16) {
      setValidationErrors({ nik: ['NIK harus tepat 16 digit.'] });
      return;
    }

    const formData = new FormData();
    formData.append('nik', nik);
    formData.append('nama', nama);
    formData.append('jenis_kelamin', jenisKelamin);
    formData.append('tanggal_lahir', tanggalLahir);
    formData.append('nomor_hp', nomorHp);
    formData.append('alamat', alamat);
    formData.append('status', status);
    if (kelompokTaniId) formData.append('kelompok_tani_id', kelompokTaniId);
    if (tanggalBergabung) formData.append('tanggal_bergabung', tanggalBergabung);
    if (fotoFile) formData.append('foto', fotoFile);

    try {
      let response;
      if (selectedPetani) {
        // Laravel spoofing for PUT request with files upload
        formData.append('_method', 'PUT');
        response = await api.post(`/petani/${selectedPetani.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/petani', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        setShowFormModal(false);
        fetchPetani();
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
    if (!confirm('Apakah Anda yakin ingin menghapus data petani ini?')) return;
    try {
      const response = await api.delete(`/petani/${id}`);
      if (response.data.success) {
        fetchPetani();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header and Add Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl leading-none">Manajemen Petani</h1>
          <p className="text-xs text-gray-400 mt-1">Registrasi petani dan pengelolaan riwayat keanggotaan kelompok.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Petani
        </button>
      </div>

      {/* 2. Filters & Searches */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIK atau nama petani..."
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Kelompok</option>
            {kelompokList.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

      </div>

      {/* 3. Farmer Listing Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">NIK</th>
                <th className="px-6 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-3 font-semibold">Gender</th>
                <th className="px-6 py-3 font-semibold">Kelompok Tani</th>
                <th className="px-6 py-3 font-semibold">HP</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {petaniList.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs">{item.nik}</td>
                  <td className="px-6 py-4 font-semibold">{item.nama}</td>
                  <td className="px-6 py-4">{item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.kelompok_tani ? item.kelompok_tani.nama_kelompok : 'Belum Berkelompok'}</td>
                  <td className="px-6 py-4 text-xs">{item.nomor_hp || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'aktif' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {item.status}
                    </span>
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
              {petaniList.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data petani ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
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

      {/* 4. Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedPetani ? 'Edit Profil Petani' : 'Registrasi Petani Baru'}</span>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nomor NIK (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="320102..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {validationErrors.nik && <span className="text-[10px] text-red-500">{validationErrors.nik[0]}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Petani"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {validationErrors.nama && <span className="text-[10px] text-red-500">{validationErrors.nama[0]}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Nomor HP</label>
                  <input
                    type="text"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Kelompok Tani</label>
                  <select
                    value={kelompokTaniId}
                    onChange={(e) => setKelompokTaniId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Belum Berkelompok</option>
                    {kelompokList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={tanggalBergabung}
                    onChange={(e) => setTanggalBergabung(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Alamat Lengkap</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Upload Foto Profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-primary hover:file:bg-gray-200 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-lg shadow-primary/20 hover:shadow-none transition-all"
              >
                {selectedPetani ? 'Simpan Perubahan' : 'Daftarkan Petani'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
