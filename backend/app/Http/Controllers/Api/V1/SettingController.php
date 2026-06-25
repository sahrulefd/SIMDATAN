<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SettingController extends Controller
{
    /**
     * Get all settings values.
     */
    public function getSettings(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Update settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nama_instansi' => 'string|max:255',
            'logo' => 'nullable|image|max:2048',
            'alamat' => 'string',
            'kontak' => 'string',
            'tahun_aktif' => 'integer|min:2000|max:2099',
            'tema_sistem' => 'in:light,dark'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        foreach ($request->except('logo') as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('public/settings');
            Setting::updateOrCreate(['key' => 'logo_path'], ['value' => Storage::url($path)]);
        }

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Settings',
            'deskripsi' => 'Mengubah konfigurasi sistem instansi.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Pengaturan berhasil diperbarui.']);
    }

    /**
     * Compile database tables and stream SQL backup file.
     */
    public function backupDatabase(Request $request): BinaryFileResponse|JsonResponse
    {
        if (Auth::guard('api')->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya administrator yang bisa melakukan backup.'], 403);
        }

        $tables = DB::select('SHOW TABLES');
        $dbNameKey = 'Tables_in_' . env('DB_DATABASE', 'simdatan_db');
        $sqlDump = "-- SIMDATAN DATABASE BACKUP\n-- Generated on " . date('Y-m-d H:i:s') . "\n\n";
        $sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$dbNameKey;

            // DDL: Structure
            $createTableStmt = DB::select("SHOW CREATE TABLE `{$tableName}`")[0]->{'Create Table'};
            $sqlDump .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sqlDump .= $createTableStmt . ";\n\n";

            // DML: Rows
            $rows = DB::table($tableName)->get();
            foreach ($rows as $row) {
                $rowArray = (array)$row;
                $escapedValues = array_map(function($val) {
                    if (is_null($val)) return 'NULL';
                    return "'" . addslashes($val) . "'";
                }, $rowArray);

                $columns = implode('`, `', array_keys($rowArray));
                $values = implode(', ', $escapedValues);

                $sqlDump .= "INSERT INTO `{$tableName}` (`{$columns}`) VALUES ({$values});\n";
            }
            $sqlDump .= "\n";
        }

        $sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";

        $fileName = 'backup_' . date('Y_m_d_His') . '.sql';
        Storage::disk('local')->put('backups/' . $fileName, $sqlDump);
        $absolutePath = storage_path('app/backups/' . $fileName);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Export',
            'modul' => 'Backup',
            'deskripsi' => "Membuat manual database backup: {$fileName}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->download($absolutePath, $fileName);
    }

    /**
     * Parse and run SQL backup scripts to restore database.
     */
    public function restoreDatabase(Request $request): JsonResponse
    {
        if (Auth::guard('api')->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya administrator yang bisa melakukan restore.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'backup_file' => 'required|file' // SQL format
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $file = $request->file('backup_file');
        $sqlContent = file_get_contents($file->getRealPath());

        // Split queries by semicolon (excluding comment lines)
        $queries = explode(";\n", $sqlContent);

        try {
            DB::beginTransaction();
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');

            foreach ($queries as $rawQuery) {
                $query = trim($rawQuery);
                if (!empty($query) && !str_starts_with($query, '--')) {
                    DB::statement($query);
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            DB::commit();

            AuditLog::create([
                'user_id' => Auth::guard('api')->id(),
                'action' => 'Import',
                'modul' => 'Restore',
                'deskripsi' => 'Melakukan database restore dari file SQL.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json(['success' => true, 'message' => 'Database berhasil direstore. Silakan muat ulang halaman.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal melakukan restore: ' . $e->getMessage()], 500);
        }
    }
}
