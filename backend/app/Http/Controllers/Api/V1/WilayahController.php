<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use App\Models\Desa;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WilayahController extends Controller
{
    // =========================================================================
    // KECAMATAN CRUD
    // =========================================================================

    public function indexKecamatan(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $query = Kecamatan::query()->with('desa');

        if ($search) {
            $query->where('nama_kecamatan', 'like', "%{$search}%")
                  ->orWhere('kode_kecamatan', 'like', "%{$search}%");
        }

        return response()->json($query->paginate(15));
    }

    public function storeKecamatan(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_kecamatan' => 'required|string|unique:kecamatan,kode_kecamatan',
            'nama_kecamatan' => 'required|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $kecamatan = Kecamatan::create($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Wilayah - Kecamatan',
            'deskripsi' => "Menambahkan kecamatan baru: {$kecamatan->nama_kecamatan}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kecamatan berhasil ditambahkan.', 'data' => $kecamatan], 201);
    }

    public function showKecamatan(int $id): JsonResponse
    {
        $kecamatan = Kecamatan::with('desa')->find($id);
        if (!$kecamatan) {
            return response()->json(['success' => false, 'message' => 'Kecamatan tidak ditemukan.'], 404);
        }
        return response()->json($kecamatan);
    }

    public function updateKecamatan(Request $request, int $id): JsonResponse
    {
        $kecamatan = Kecamatan::find($id);
        if (!$kecamatan) {
            return response()->json(['success' => false, 'message' => 'Kecamatan tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_kecamatan' => "string|unique:kecamatan,kode_kecamatan,{$id}",
            'nama_kecamatan' => 'string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $kecamatan->update($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Wilayah - Kecamatan',
            'deskripsi' => "Mengedit kecamatan: {$kecamatan->nama_kecamatan}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kecamatan berhasil diperbarui.', 'data' => $kecamatan]);
    }

    public function destroyKecamatan(Request $request, int $id): JsonResponse
    {
        $kecamatan = Kecamatan::find($id);
        if (!$kecamatan) {
            return response()->json(['success' => false, 'message' => 'Kecamatan tidak ditemukan.'], 404);
        }

        if ($kecamatan->desa()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus kecamatan yang memiliki desa aktif.'], 400);
        }

        $kecamatan->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Wilayah - Kecamatan',
            'deskripsi' => "Menghapus kecamatan: {$kecamatan->nama_kecamatan}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kecamatan berhasil dihapus.']);
    }

    // =========================================================================
    // DESA CRUD
    // =========================================================================

    public function indexDesa(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $kecamatanId = $request->query('kecamatan_id');
        $query = Desa::query()->with('kecamatan');

        if ($kecamatanId) {
            $query->where('kecamatan_id', $kecamatanId);
        }

        if ($search) {
            $query->where('nama_desa', 'like', "%{$search}%")
                  ->orWhere('kode_desa', 'like', "%{$search}%");
        }

        return response()->json($query->paginate(15));
    }

    public function storeDesa(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kecamatan_id' => 'required|exists:kecamatan,id',
            'kode_desa' => 'required|string|unique:desa,kode_desa',
            'nama_desa' => 'required|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $desa = Desa::create($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Wilayah - Desa',
            'deskripsi' => "Menambahkan desa baru: {$desa->nama_desa}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Desa berhasil ditambahkan.', 'data' => $desa], 201);
    }

    public function showDesa(int $id): JsonResponse
    {
        $desa = Desa::with('kecamatan')->find($id);
        if (!$desa) {
            return response()->json(['success' => false, 'message' => 'Desa tidak ditemukan.'], 404);
        }
        return response()->json($desa);
    }

    public function updateDesa(Request $request, int $id): JsonResponse
    {
        $desa = Desa::find($id);
        if (!$desa) {
            return response()->json(['success' => false, 'message' => 'Desa tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kecamatan_id' => 'exists:kecamatan,id',
            'kode_desa' => "string|unique:desa,kode_desa,{$id}",
            'nama_desa' => 'string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $desa->update($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Wilayah - Desa',
            'deskripsi' => "Mengedit desa: {$desa->nama_desa}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Desa berhasil diperbarui.', 'data' => $desa]);
    }

    public function destroyDesa(Request $request, int $id): JsonResponse
    {
        $desa = Desa::find($id);
        if (!$desa) {
            return response()->json(['success' => false, 'message' => 'Desa tidak ditemukan.'], 404);
        }

        if ($desa->kelompokTani()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus desa yang memiliki kelompok tani aktif.'], 400);
        }

        $desa->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Wilayah - Desa',
            'deskripsi' => "Menghapus desa: {$desa->nama_desa}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Desa berhasil dihapus.']);
    }
}
