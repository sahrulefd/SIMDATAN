<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Petani;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PetaniController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $kelompokTaniId = $request->query('kelompok_tani_id');
        $status = $request->query('status');

        $query = Petani::query()->with('kelompokTani.desa.kecamatan');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($kelompokTaniId) {
            $query->where('kelompok_tani_id', $kelompokTaniId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:petani,nik',
            'nama' => 'required|string|max:150',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'nomor_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'foto' => 'nullable|image|max:2048', // max 2MB
            'kelompok_tani_id' => 'nullable|exists:kelompok_tani,id',
            'status' => 'required|in:aktif,nonaktif',
            'tanggal_bergabung' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except('foto');

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/petani');
            $data['foto_path'] = Storage::url($path);
        }

        $petani = Petani::create($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Petani',
            'deskripsi' => "Menambahkan petani baru: {$petani->nama} (NIK: {$petani->nik})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Petani berhasil ditambahkan.', 'data' => $petani], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $petani = Petani::with(['kelompokTani.desa.kecamatan', 'lahan.produksiPanen'])->find($id);
        if (!$petani) {
            return response()->json(['success' => false, 'message' => 'Petani tidak ditemukan.'], 404);
        }
        return response()->json($petani);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $petani = Petani::find($id);
        if (!$petani) {
            return response()->json(['success' => false, 'message' => 'Petani tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nik' => "string|size:16|unique:petani,nik,{$id}",
            'nama' => 'string|max:150',
            'jenis_kelamin' => 'in:L,P',
            'tanggal_lahir' => 'date',
            'nomor_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'foto' => 'nullable|image|max:2048',
            'kelompok_tani_id' => 'nullable|exists:kelompok_tani,id',
            'status' => 'in:aktif,nonaktif',
            'tanggal_bergabung' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto', '_method']);

        if ($request->hasFile('foto')) {
            // Delete old photo
            if ($petani->foto_path) {
                $oldPath = str_replace('/storage/', 'public/', $petani->foto_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('foto')->store('public/petani');
            $data['foto_path'] = Storage::url($path);
        }

        $petani->update($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Petani',
            'deskripsi' => "Mengedit petani: {$petani->nama} (NIK: {$petani->nik})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Petani berhasil diperbarui.', 'data' => $petani]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $petani = Petani::find($id);
        if (!$petani) {
            return response()->json(['success' => false, 'message' => 'Petani tidak ditemukan.'], 404);
        }

        // Delete photo if exists
        if ($petani->foto_path) {
            $oldPath = str_replace('/storage/', 'public/', $petani->foto_path);
            Storage::delete($oldPath);
        }

        $petani->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Petani',
            'deskripsi' => "Menghapus petani: {$petani->nama}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Petani berhasil dihapus.']);
    }
}
