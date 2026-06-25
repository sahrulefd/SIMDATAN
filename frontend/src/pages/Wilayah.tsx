import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Edit3, Trash2, X, MapPin } from 'lucide-react';

interface Kecamatan {
  id: number;
  kode_kecamatan: string;
  nama_kecamatan: string;
}

interface Desa {
  id: number;
  kecamatan_id: number;
  kode_desa: string;
  nama_desa: string;
  kecamatan?: Kecamatan;
}

export const Wilayah: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kecamatan' | 'desa'>('kecamatan');
  const [kecamatans, setKecamatans] = useState<Kecamatan[]>([]);
  const [desas, setDesas] = useState<Desa[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Kecamatan Modal states
  const [showKecModal, setShowKecModal] = useState(false);
  const [selectedKec, setSelectedKec] = useState<Kecamatan | null>(null);
  const [kodeKec, setKodeKec] = useState('');
  const [namaKec, setNamaKec] = useState('');

  // Desa Modal states
  const [showDesaModal, setShowDesaModal] = useState(false);
  const [selectedDesa, setSelectedDesa] = useState<Desa | null>(null);
  const [kecId, setKecId] = useState('');
  const [kodeDesa, setKodeDesa] = useState('');
  const [namaDesa, setNamaDesa] = useState('');

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fetchKecamatan = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kecamatan?search=${searchQuery}`);
      // Endpoint index returns all
      setKecamatans(response.data.data || response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesa = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/desa?search=${searchQuery}`);
      setDesas(response.data.data || response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'kecamatan') {
      fetchKecamatan();
    } else {
      fetchDesa();
    }
  }, [activeTab, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'kecamatan') fetchKecamatan();
    else fetchDesa();
  };

  const openKecCreate = () => {
    setSelectedKec(null);
    setKodeKec('');
    setNamaKec('');
    setErrors({});
    setShowKecModal(true);
  };

  const openKecEdit = (item: Kecamatan) => {
    setSelectedKec(item);
    setKodeKec(item.kode_kecamatan);
    setNamaKec(item.nama_kecamatan);
    setErrors({});
    setShowKecModal(true);
  };

  const handleKecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { kode_kecamatan: kodeKec, nama_kecamatan: namaKec };
      if (selectedKec) {
        await api.put(`/kecamatan/${selectedKec.id}`, payload);
      } else {
        await api.post('/kecamatan', payload);
      }
      setShowKecModal(false);
      fetchKecamatan();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handleKecDelete = async (id: number) => {
    if (!confirm('Hapus kecamatan ini beserta seluruh desa di dalamnya?')) return;
    try {
      await api.delete(`/kecamatan/${id}`);
      fetchKecamatan();
    } catch (err) {
      console.error(err);
    }
  };

  const openDesaCreate = () => {
    setSelectedDesa(null);
    setKecId(kecamatans[0]?.id ? String(kecamatans[0].id) : '');
    setKodeDesa('');
    setNamaDesa('');
    setErrors({});
    setShowDesaModal(true);
  };

  const openDesaEdit = (item: Desa) => {
    setSelectedDesa(item);
    setKecId(String(item.kecamatan_id));
    setKodeDesa(item.kode_desa);
    setNamaDesa(item.nama_desa);
    setErrors({});
    setShowDesaModal(true);
  };

  const handleDesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { kecamatan_id: Number(kecId), kode_desa: kodeDesa, nama_desa: namaDesa };
      if (selectedDesa) {
        await api.put(`/desa/${selectedDesa.id}`, payload);
      } else {
        await api.post('/desa', payload);
      }
      setShowDesaModal(false);
      fetchDesa();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handleDesaDelete = async (id: number) => {
    if (!confirm('Hapus desa ini?')) return;
    try {
      await api.delete(`/desa/${id}`);
      fetchDesa();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Wilayah Kerja</h1>
          <p className="text-xs text-gray-500 mt-1">Kelola hierarki administratif kecamatan dan desa di bawah Dinas Pertanian.</p>
        </div>

        <button
          onClick={activeTab === 'kecamatan' ? openKecCreate : openDesaCreate}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-none transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {activeTab === 'kecamatan' ? 'Tambah Kecamatan' : 'Tambah Desa'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => { setActiveTab('kecamatan'); setSearchQuery(''); }}
          className={`px-6 py-2.5 font-heading font-bold text-sm border-b-2 transition-all ${
            activeTab === 'kecamatan'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Kecamatan
        </button>
        <button
          onClick={() => { setActiveTab('desa'); setSearchQuery(''); }}
          className={`px-6 py-2.5 font-heading font-bold text-sm border-b-2 transition-all ${
            activeTab === 'desa'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Desa / Kelurahan
        </button>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari nama ${activeTab}...`}
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {activeTab === 'kecamatan' ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">Kode Kecamatan</th>
                <th className="px-6 py-3 font-semibold">Nama Kecamatan</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kecamatans.map((kec) => (
                <tr key={kec.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-primary">{kec.kode_kecamatan}</td>
                  <td className="px-6 py-4 font-semibold">{kec.nama_kecamatan}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openKecEdit(kec)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleKecDelete(kec.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">Kode Desa</th>
                <th className="px-6 py-3 font-semibold">Nama Desa</th>
                <th className="px-6 py-3 font-semibold">Induk Kecamatan</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {desas.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-primary">{d.kode_desa}</td>
                  <td className="px-6 py-4 font-semibold">{d.nama_desa}</td>
                  <td className="px-6 py-4 text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {d.kecamatan?.nama_kecamatan || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openDesaEdit(d)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDesaDelete(d.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kecamatan Modal */}
      {showKecModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedKec ? 'Edit Kecamatan' : 'Kecamatan Baru'}</span>
              <button onClick={() => setShowKecModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleKecSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Kode Kecamatan</label>
                <input
                  type="text"
                  required
                  value={kodeKec}
                  onChange={(e) => setKodeKec(e.target.value)}
                  placeholder="KEC-01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.kode_kecamatan && <span className="text-[10px] text-red-500">{errors.kode_kecamatan[0]}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Kecamatan</label>
                <input
                  type="text"
                  required
                  value={namaKec}
                  onChange={(e) => setNamaKec(e.target.value)}
                  placeholder="Ciawi"
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

      {/* Desa Modal */}
      {showDesaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="font-heading font-semibold text-md">{selectedDesa ? 'Edit Desa' : 'Desa Baru'}</span>
              <button onClick={() => setShowDesaModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleDesaSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">Kecamatan Induk</label>
                <select
                  value={kecId}
                  required
                  onChange={(e) => setKecId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatans.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kecamatan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Kode Desa</label>
                <input
                  type="text"
                  required
                  value={kodeDesa}
                  onChange={(e) => setKodeDesa(e.target.value)}
                  placeholder="DES-01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.kode_desa && <span className="text-[10px] text-red-500">{errors.kode_desa[0]}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Nama Desa</label>
                <input
                  type="text"
                  required
                  value={namaDesa}
                  onChange={(e) => setNamaDesa(e.target.value)}
                  placeholder="Pandansari"
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
