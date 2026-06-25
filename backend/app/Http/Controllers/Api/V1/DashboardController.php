<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregate cards stats and charts datasets.
     */
    public function index(Request $request): JsonResponse
    {
        // 1. KPI Cards
        $totalWilayah = DB::table('kecamatan')->count();
        $totalPetani = DB::table('petani')->count();
        $totalKelompok = DB::table('kelompok_tani')->count();
        $totalLahan = DB::table('lahan')->count();
        $totalKomoditas = DB::table('komoditas')->count();
        $totalProduksi = DB::table('produksi_panen')
            ->where('status_panen', 'Sudah Panen')
            ->sum('hasil_panen');

        // 2. Charts: Produksi per Tahun
        $produksiPerTahun = DB::table('produksi_panen')
            ->where('status_panen', 'Sudah Panen')
            ->select('tahun_tanam as label', DB::raw('SUM(hasil_panen) as value'))
            ->groupBy('tahun_tanam')
            ->orderBy('tahun_tanam')
            ->get();

        // 3. Charts: Produksi per Bulan (for active/recent year)
        $recentYear = date('Y') - 1; // default to 2025/2026
        $dbDriver = DB::getDriverName();
        if ($dbDriver === 'sqlite') {
            $monthExpr = 'strftime("%m", tanggal_panen_aktual)';
        } else {
            $monthExpr = 'MONTH(tanggal_panen_aktual)';
        }

        $produksiPerBulan = DB::table('produksi_panen')
            ->where('status_panen', 'Sudah Panen')
            ->whereYear('tanggal_panen_aktual', $recentYear)
            ->select(DB::raw("$monthExpr as label_month"), DB::raw('SUM(hasil_panen) as value'))
            ->groupBy(DB::raw($monthExpr))
            ->orderBy(DB::raw($monthExpr))
            ->get()
            ->map(function($item) {
                $monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                return [
                    'label' => $monthNames[intval($item->label_month)] ?? 'N/A',
                    'value' => round($item->value, 2)
                ];
            });

        // 4. Charts: Produksi per Wilayah (Kecamatan)
        $produksiPerWilayah = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('petani', 'lahan.pemilik_petani_id', '=', 'petani.id')
            ->join('kelompok_tani', 'petani.kelompok_tani_id', '=', 'kelompok_tani.id')
            ->join('desa', 'kelompok_tani.desa_id', '=', 'desa.id')
            ->join('kecamatan', 'desa.kecamatan_id', '=', 'kecamatan.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('kecamatan.nama_kecamatan as label', DB::raw('SUM(produksi_panen.hasil_panen) as value'))
            ->groupBy('kecamatan.nama_kecamatan')
            ->orderBy('value', 'desc')
            ->get();

        // 5. Charts: Produksi per Komoditas
        $produksiPerKomoditas = DB::table('produksi_panen')
            ->join('komoditas', 'produksi_panen.komoditas_id', '=', 'komoditas.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('komoditas.nama_komoditas as label', DB::raw('SUM(produksi_panen.hasil_panen) as value'))
            ->groupBy('komoditas.nama_komoditas')
            ->orderBy('value', 'desc')
            ->get();

        // 6. Charts: Produksi per Kelompok
        $produksiPerKelompok = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('petani', 'lahan.pemilik_petani_id', '=', 'petani.id')
            ->join('kelompok_tani', 'petani.kelompok_tani_id', '=', 'kelompok_tani.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('kelompok_tani.nama_kelompok as label', DB::raw('SUM(produksi_panen.hasil_panen) as value'))
            ->groupBy('kelompok_tani.nama_kelompok')
            ->orderBy('value', 'desc')
            ->limit(10)
            ->get();

        // 7. Growths (Pertumbuhan 2025 vs 2024)
        $yield2024 = DB::table('produksi_panen')->where('status_panen', 'Sudah Panen')->where('tahun_tanam', 2024)->sum('hasil_panen');
        $yield2025 = DB::table('produksi_panen')->where('status_panen', 'Sudah Panen')->where('tahun_tanam', 2025)->sum('hasil_panen');
        $growth = 0.00;
        if ($yield2024 > 0) {
            $growth = round((($yield2025 - $yield2024) / $yield2024) * 100, 2);
        }

        // 8. Rankings
        $bestWilayah = $produksiPerWilayah->first() ? $produksiPerWilayah->first()->label : 'N/A';
        $bestKomoditas = $produksiPerKomoditas->first() ? $produksiPerKomoditas->first()->label : 'N/A';
        $bestKelompok = $produksiPerKelompok->first() ? $produksiPerKelompok->first()->label : 'N/A';

        $top10Produksi = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('lahan.nama_lahan as name', DB::raw('SUM(produksi_panen.hasil_panen) as value'))
            ->groupBy('lahan.id', 'lahan.nama_lahan')
            ->orderBy('value', 'desc')
            ->limit(10)
            ->get();

        $bottom10Produksi = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('lahan.nama_lahan as name', DB::raw('SUM(produksi_panen.hasil_panen) as value'))
            ->groupBy('lahan.id', 'lahan.nama_lahan')
            ->orderBy('value', 'asc')
            ->limit(10)
            ->get();

        $topProduktivitas = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('komoditas', 'produksi_panen.komoditas_id', '=', 'komoditas.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('lahan.nama_lahan as land_name', 'komoditas.nama_komoditas as crop_name', 'produksi_panen.produktivitas as value')
            ->orderBy('value', 'desc')
            ->limit(10)
            ->get();

        $bottomProduktivitas = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('komoditas', 'produksi_panen.komoditas_id', '=', 'komoditas.id')
            ->where('produksi_panen.status_panen', 'Sudah Panen')
            ->select('lahan.nama_lahan as land_name', 'komoditas.nama_komoditas as crop_name', 'produksi_panen.produktivitas as value')
            ->orderBy('value', 'asc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'kpis' => [
                'total_wilayah' => $totalWilayah,
                'total_petani' => $totalPetani,
                'total_kelompok' => $totalKelompok,
                'total_lahan' => $totalLahan,
                'total_komoditas' => $totalKomoditas,
                'total_produksi_ton' => round($totalProduksi, 2),
            ],
            'charts' => [
                'produksi_per_tahun' => $produksiPerTahun,
                'produksi_per_bulan' => $produksiPerBulan,
                'produksi_per_wilayah' => $produksiPerWilayah,
                'produksi_per_komoditas' => $produksiPerKomoditas,
                'produksi_per_kelompok' => $produksiPerKelompok
            ],
            'analytics' => [
                'pertumbuhan_produksi_persen' => $growth,
                'wilayah_terbaik' => $bestWilayah,
                'komoditas_terbaik' => $bestKomoditas,
                'kelompok_terbaik' => $bestKelompok,
                'top_10_lahan' => $top10Produksi,
                'bottom_10_lahan' => $bottom10Produksi,
                'top_produktivitas' => $topProduktivitas,
                'bottom_produktivitas' => $bottomProduktivitas
            ]
        ]);
    }
}
