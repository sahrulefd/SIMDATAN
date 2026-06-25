import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { 
  MapPin, 
  Users, 
  Compass, 
  Sprout, 
  TrendingUp, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award,
  CircleAlert
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface KPIStats {
  total_wilayah: number;
  total_petani: number;
  total_kelompok: number;
  total_lahan: number;
  total_komoditas: number;
  total_produksi_ton: number;
}

interface ChartDataItem {
  label: string;
  value: number;
}

interface RankingItem {
  name: string;
  value: number;
  land_name?: string;
  crop_name?: string;
}

export const Dashboard: React.FC = () => {
  const [kpi, setKpi] = useState<KPIStats | null>(null);
  const [charts, setCharts] = useState<{
    produksi_per_tahun: ChartDataItem[];
    produksi_per_bulan: ChartDataItem[];
    produksi_per_wilayah: ChartDataItem[];
    produksi_per_komoditas: ChartDataItem[];
    produksi_per_kelompok: ChartDataItem[];
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    pertumbuhan_produksi_persen: number;
    wilayah_terbaik: string;
    komoditas_terbaik: string;
    kelompok_terbaik: string;
    top_10_lahan: RankingItem[];
    bottom_10_lahan: RankingItem[];
    top_produktivitas: RankingItem[];
    bottom_produktivitas: RankingItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data && response.data.success) {
          setKpi(response.data.kpis);
          setCharts(response.data.charts);
          setAnalytics(response.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !kpi || !charts || !analytics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Chart configs
  const tahunData = {
    labels: charts.produksi_per_tahun.map(c => c.label),
    datasets: [{
      label: 'Produksi (Ton)',
      data: charts.produksi_per_tahun.map(c => c.value),
      backgroundColor: 'rgba(21, 128, 61, 0.75)',
      borderColor: 'rgba(21, 128, 61, 1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const bulanData = {
    labels: charts.produksi_per_bulan.map(c => c.label),
    datasets: [{
      label: 'Produksi Bulanan 2025 (Ton)',
      data: charts.produksi_per_bulan.map(c => c.value),
      fill: true,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 1)',
      tension: 0.3,
      pointRadius: 4
    }]
  };

  const komoditasData = {
    labels: charts.produksi_per_komoditas.map(c => c.label).slice(0, 5),
    datasets: [{
      data: charts.produksi_per_komoditas.map(c => c.value).slice(0, 5),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header and quick growth summary */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl leading-tight">Dashboard Analitik</h1>
          <p className="text-xs text-gray-400 mt-1">Laporan komprehensif data pertanian terintegrasi Dinas Pertanian.</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e]">
          <span className="text-xs text-gray-500">Pertumbuhan Produksi (2024 vs 2025):</span>
          <span className={`text-xs font-bold flex items-center gap-0.5 ${analytics.pertumbuhan_produksi_persen >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {analytics.pertumbuhan_produksi_persen >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(analytics.pertumbuhan_produksi_persen)}%
          </span>
        </div>
      </div>

      {/* 2. KPI Cards list */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Wilayah', value: kpi.total_wilayah, icon: MapPin, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
          { title: 'Total Petani', value: kpi.total_petani, icon: Users, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
          { title: 'Total Kelompok', value: kpi.total_kelompok, icon: Compass, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
          { title: 'Total Lahan', value: kpi.total_lahan, icon: Sprout, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
          { title: 'Total Komoditas', value: kpi.total_komoditas, icon: Sprout, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
          { title: 'Total Yield (Ton)', value: kpi.total_produksi_ton.toLocaleString('id-ID'), icon: TrendingUp, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
        ].map(card => (
          <div key={card.title} className={`p-4 rounded-xl border bg-white dark:bg-[#0c0b1e] flex flex-col justify-between h-28 relative overflow-hidden transition-all hover:scale-[1.02] ${card.color}`}>
            <card.icon className="w-6 h-6 absolute top-4 right-4 opacity-30" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{card.title}</span>
            <span className="text-2xl font-bold font-heading">{card.value}</span>
          </div>
        ))}
      </div>

      {/* 3. Top Rank Achievements banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: 'Wilayah Terbaik', label: analytics.wilayah_terbaik, sub: 'Produksi Tertinggi', icon: MapPin, color: 'border-blue-500/20 bg-blue-500/5' },
          { title: 'Komoditas Terbaik', label: analytics.komoditas_terbaik, sub: 'Hasil Panen Utama', icon: Sprout, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { title: 'Kelompok Terbaik', label: analytics.kelompok_terbaik, sub: 'Kooperasi Terproduktif', icon: Compass, color: 'border-purple-500/20 bg-purple-500/5' }
        ].map(rank => (
          <div key={rank.title} className={`p-4 rounded-xl border flex items-center gap-4 ${rank.color}`}>
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#0e0d29] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-primary">
              <rank.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{rank.title}</span>
              <h4 className="font-heading font-bold text-lg leading-snug">{rank.label}</h4>
              <span className="text-xs text-gray-500">{rank.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2">Produksi Tanam per Tahun</h3>
          <div className="h-64">
            <Bar data={tahunData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2">Top 5 Komoditas</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={komoditasData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="lg:col-span-3 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2">Kurva Produksi Bulanan (Musim Tanam)</h3>
          <div className="h-64">
            <Line data={bulanData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* 5. Productivity and Rankings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Productivity Table */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2"><Award className="w-5 h-5 text-emerald-500" /> Produktivitas Lahan Tertinggi (Ton/Ha)</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs">
                <th className="py-2">Nama Lahan</th>
                <th className="py-2">Komoditas</th>
                <th className="py-2 text-right">Produktivitas</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_produktivitas.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <td className="py-2.5 font-medium">{row.land_name}</td>
                  <td className="py-2.5 text-gray-400">{row.crop_name}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-500">{row.value} Ton/Ha</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Productivity Table */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0b1e] space-y-4">
          <h3 className="font-heading font-bold text-lg border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2"><CircleAlert className="w-5 h-5 text-red-500" /> Produktivitas Lahan Terendah</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs">
                <th className="py-2">Nama Lahan</th>
                <th className="py-2">Komoditas</th>
                <th className="py-2 text-right">Produktivitas</th>
              </tr>
            </thead>
            <tbody>
              {analytics.bottom_produktivitas.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <td className="py-2.5 font-medium">{row.land_name}</td>
                  <td className="py-2.5 text-gray-400">{row.crop_name}</td>
                  <td className="py-2.5 text-right font-bold text-red-500">{row.value} Ton/Ha</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
