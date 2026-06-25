<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExcelController extends Controller
{
    /**
     * Download CSV templates for various modules.
     */
    public function downloadTemplate(string $module): StreamedResponse|JsonResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_' . $module . '.csv"',
        ];

        $columns = [];
        switch ($module) {
            case 'wilayah':
                $columns = ['kode_kecamatan', 'nama_kecamatan', 'kode_desa', 'nama_desa'];
                break;
            case 'petani':
                $columns = ['nik', 'nama', 'jenis_kelamin_L_P', 'tanggal_lahir_YYYY_MM_DD', 'nomor_hp', 'alamat', 'status_aktif_nonaktif', 'kelompok_tani_id'];
                break;
            case 'kelompok':
                $columns = ['nama_kelompok', 'ketua_nama', 'tahun_berdiri', 'alamat', 'desa_id'];
                break;
            case 'lahan':
                $columns = ['pemilik_petani_id', 'kode_lahan', 'nama_lahan', 'luas_ha', 'status_kepemilikan_MilikSendiri_Sewa_BagiHasil', 'latitude', 'longitude'];
                break;
            case 'komoditas':
                $columns = ['kode_komoditas', 'nama_komoditas', 'kategori', 'satuan', 'harga_acuan', 'deskripsi'];
                break;
            case 'produksi':
                $columns = ['lahan_id', 'komoditas_id', 'musim_tanam', 'tahun_tanam', 'tanggal_tanam_YYYY_MM_DD', 'tanggal_panen_estimasi_YYYY_MM_DD', 'status_panen', 'hasil_panen_ton', 'keterangan'];
                break;
            default:
                return response()->json(['success' => false, 'message' => 'Modul template tidak dikenal.'], 400);
        }

        return response()->stream(function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fclose($file);
        }, 200, $headers);
    }

    /**
     * Upload and Validate CSV data, returning a preview highlighting errors.
     */
    public function validateImport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'module' => 'required|in:wilayah,petani,kelompok,lahan,komoditas,produksi',
            'file' => 'required|file|mimes:csv,txt'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $module = $request->module;
        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $rows = [];
        if (($handle = fopen($filePath, 'r')) !== false) {
            $headers = fgetcsv($handle, 1000, ',');
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                if (count($headers) === count($data)) {
                    $rows[] = array_combine($headers, $data);
                }
            }
            fclose($handle);
        }

        $validatedRows = [];
        $isValid = true;

        foreach ($rows as $index => $row) {
            $errors = [];
            
            // Validation rules per module
            if ($module === 'petani') {
                if (empty($row['nik']) || strlen($row['nik']) !== 16) {
                    $errors[] = 'NIK harus tepat 16 digit.';
                }
                if (empty($row['nama'])) {
                    $errors[] = 'Nama wajib diisi.';
                }
                if (!in_array($row['jenis_kelamin_L_P'] ?? '', ['L', 'P'])) {
                    $errors[] = 'Jenis kelamin harus L atau P.';
                }
            } elseif ($module === 'lahan') {
                if (empty($row['kode_lahan'])) {
                    $errors[] = 'Kode lahan wajib diisi.';
                }
                if (!is_numeric($row['luas_ha'] ?? '')) {
                    $errors[] = 'Luas lahan harus berupa angka.';
                }
            } elseif ($module === 'produksi') {
                if (!is_numeric($row['tahun_tanam'] ?? '')) {
                    $errors[] = 'Tahun tanam harus berupa angka tahun.';
                }
            }

            if (count($errors) > 0) {
                $isValid = false;
            }

            $validatedRows[] = [
                'row_number' => $index + 2,
                'data' => $row,
                'is_valid' => count($errors) === 0,
                'errors' => $errors
            ];
        }

        return response()->json([
            'success' => true,
            'module' => $module,
            'is_valid' => $isValid,
            'preview' => $validatedRows
        ]);
    }

    /**
     * Commit validated import rows into the database.
     */
    public function commitImport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'module' => 'required|in:wilayah,petani,kelompok,lahan,komoditas,produksi',
            'data' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $module = $request->module;
        $rows = $request->data;

        try {
            DB::beginTransaction();

            foreach ($rows as $row) {
                if ($module === 'petani') {
                    DB::table('petani')->insert([
                        'nik' => $row['nik'],
                        'nama' => $row['nama'],
                        'jenis_kelamin' => $row['jenis_kelamin_L_P'],
                        'tanggal_lahir' => $row['tanggal_lahir_YYYY_MM_DD'],
                        'nomor_hp' => $row['nomor_hp'] ?? null,
                        'alamat' => $row['alamat'] ?? null,
                        'status' => strtolower($row['status_aktif_nonaktif'] ?? 'aktif') === 'aktif' ? 'aktif' : 'nonaktif',
                        'kelompok_tani_id' => $row['kelompok_tani_id'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } elseif ($module === 'lahan') {
                    DB::table('lahan')->insert([
                        'pemilik_petani_id' => $row['pemilik_petani_id'],
                        'kode_lahan' => $row['kode_lahan'],
                        'nama_lahan' => $row['nama_lahan'],
                        'luas_ha' => $row['luas_ha'],
                        'status_kepemilikan' => $row['status_kepemilikan_MilikSendiri_Sewa_BagiHasil'] ?? 'Milik Sendiri',
                        'latitude' => $row['latitude'] ?? null,
                        'longitude' => $row['longitude'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
                // Add remaining modules inside production mapping...
            }

            DB::commit();

            AuditLog::create([
                'user_id' => Auth::guard('api')->id(),
                'action' => 'Import',
                'modul' => 'Bulk Import',
                'deskripsi' => "Melakukan import bulk data untuk modul: {$module}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json(['success' => true, 'message' => 'Data berhasil diimport ke database.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal mengimport data: ' . $e->getMessage()], 500);
        }
    }
}
