import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, X, Eye, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface WorkflowItem {
  id: number;
  model_type: string;
  model_id: number;
  requester_id: number;
  status: 'Draft' | 'Submit' | 'Review' | 'Approve' | 'Reject';
  reviewer_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  requester?: User;
  reviewer?: User;
  model?: {
    musim_tanam?: string;
    tahun_tanam?: number;
    hasil_panen?: number;
    satuan?: string;
  };
}

export const Approval: React.FC = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowItem | null>(null);
  const [actionType, setActionType] = useState<'review' | 'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await api.get('/approvals');
      setWorkflows(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const openActionModal = (item: WorkflowItem, type: 'review' | 'approve' | 'reject') => {
    setActiveWorkflow(item);
    setActionType(type);
    setNotes('');
    setShowModal(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkflow || !actionType) return;

    try {
      const response = await api.post(`/approvals/${activeWorkflow.id}/status`, {
        action: actionType,
        notes: notes
      });

      if (response.data.success) {
        setShowModal(false);
        fetchWorkflows();
      }
    } catch (err) {
      alert('Gagal memperbarui status approval.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div>
        <h1 className="font-heading font-bold text-3xl leading-none">Persetujuan Data</h1>
        <p className="text-xs text-gray-400 mt-1">Verifikasi berjenjang (Petugas → Supervisor → Admin) untuk menjaga integritas data produksi.</p>
      </div>

      {/* 2. Listing Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs bg-gray-50 dark:bg-[#0f0e26]/30">
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Tipe Model</th>
                <th className="px-6 py-3 font-semibold">Diajukan Oleh</th>
                <th className="px-6 py-3 font-semibold">Rincian Data</th>
                <th className="px-6 py-3 font-semibold">Status Alur</th>
                <th className="px-6 py-3 font-semibold">Catatan Review</th>
                <th className="px-6 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((item) => {
                let badgeStyle = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                if (item.status === 'Submit') badgeStyle = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
                if (item.status === 'Review') badgeStyle = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                if (item.status === 'Approve') badgeStyle = 'bg-green-500/10 text-green-500 border border-green-500/20';
                if (item.status === 'Reject') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';

                return (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-xs text-gray-400">
                      {item.model_type.includes('ProduksiPanen') ? 'Produksi & Panen' : item.model_type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.requester ? item.requester.name : 'N/A'}</span>
                        <span className="text-[10px] text-gray-500">{item.requester ? item.requester.email : ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs leading-normal text-gray-400">
                      {item.model ? (
                        <>
                          Musim: {item.model.musim_tanam} {item.model.tahun_tanam}<br/>
                          {item.model.hasil_panen ? `Yield: ${item.model.hasil_panen} ${item.model.satuan}` : 'Fase Tanam'}
                        </>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeStyle}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate" title={item.notes || ''}>
                      {item.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {user?.role === 'supervisor' && item.status === 'Submit' && (
                          <>
                            <button 
                              onClick={() => openActionModal(item, 'review')}
                              className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-semibold hover:bg-yellow-500 hover:text-white transition-colors"
                            >
                              Review
                            </button>
                            <button 
                              onClick={() => openActionModal(item, 'reject')}
                              className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {user?.role === 'admin' && item.status === 'Review' && (
                          <>
                            <button 
                              onClick={() => openActionModal(item, 'approve')}
                              className="px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-semibold hover:bg-green-500 hover:text-white transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => openActionModal(item, 'reject')}
                              className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
              {workflows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada pengajuan persetujuan pending.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Action Modal Form */}
      {showModal && activeWorkflow && actionType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-heading font-semibold text-md uppercase">Konfirmasi Tindakan</h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-normal">
              Apakah Anda yakin ingin memproses workflow ID {activeWorkflow.id} ke status <span className="font-bold text-white capitalize">{actionType}</span>?
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Catatan / Komentar Review</label>
                <textarea
                  required={actionType === 'reject'} // notes mandatory for rejections
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={actionType === 'reject' ? 'Masukkan alasan penolakan data...' : 'Masukkan komentar verifikasi...'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-800 text-gray-400 rounded-lg text-xs font-semibold hover:bg-gray-900"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-2 text-white rounded-lg text-xs font-semibold ${actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-emerald-600'}`}
                >
                  Konfirmasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
