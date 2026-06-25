<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Export system reports in CSV/Excel, JSON formats.
     */
    public function exportReport(Request $request): StreamedResponse|JsonResponse
    {
        $module = $request->query('module', 'produksi'); // produksi, produktivitas, petani, kelompok, lahan, komoditas, wilayah
        $format = $request->query('format', 'csv'); // csv, json
        
        // Filters
        $kecamatanId = $request->query('kecamatan_id');
        $komoditasId = $request->query('komoditas_id');
        $tahun = $request->query('tahun');

        $query = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('petani', 'lahan.pemilik_petani_id', '=', 'petani.id')
            ->join('kelompok_tani', 'petani.kelompok_tani_id', '=', 'kelompok_tani.id')
            ->join('desa', 'kelompok_tani.desa_id', '=', 'desa.id')
            ->join('kecamatan', 'desa.kecamatan_id', '=', 'kecamatan.id')
            ->join('komoditas', 'produksi_panen.komoditas_id', '=', 'komoditas.id');

        if ($kecamatanId) {
            $query->where('kecamatan.id', $kecamatanId);
        }

        if ($komoditasId) {
            $query->where('komoditas.id', $komoditasId);
        }

        if ($tahun) {
            $query->where('produksi_panen.tahun_tanam', $tahun);
        }

        // Apply selections based on reporting context
        if ($module === 'produktivitas') {
            $query->select(
                'lahan.kode_lahan',
                'lahan.nama_lahan',
                'lahan.luas_ha',
                'komoditas.nama_komoditas',
                'produksi_panen.musim_tanam',
                'produksi_panen.tahun_tanam',
                'produksi_panen.hasil_panen',
                'produksi_panen.produktivitas',
                'kecamatan.nama_kecamatan'
            );
        } else {
            $query->select(
                'produksi_panen.id',
                'lahan.nama_lahan',
                'petani.nama as pemilik',
                'komoditas.nama_komoditas',
                'produksi_panen.musim_tanam',
                'produksi_panen.tahun_tanam',
                'produksi_panen.status_panen',
                'produksi_panen.hasil_panen',
                'produksi_panen.produktivitas',
                'kecamatan.nama_kecamatan'
            );
        }

        $data = $query->get()->map(function($item) {
            return (array)$item;
        })->toArray();

        // Log audit
        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Export',
            'modul' => 'Reports',
            'deskripsi' => "Mengekspor laporan {$module} dengan format {$format}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        if ($format === 'json') {
            return response()->json([
                'success' => true,
                'module' => $module,
                'total_records' => count($data),
                'records' => $data
            ]);
        }

        // CSV/Excel stream
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="report_' . $module . '_' . date('Ymd_His') . '.csv"',
        ];

        return response()->stream(function() use ($data) {
            $file = fopen('php://output', 'w');
            if (count($data) > 0) {
                // Write column headers
                fputcsv($file, array_keys($data[0]));
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            } else {
                fputcsv($file, ['No Records Found']);
            }
            fclose($file);
        }, 200, $headers);
    }
}
