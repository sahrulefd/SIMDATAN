<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KegiatanLapangan;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class KegiatanLapanganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $tipeKegiatan = $request->query('tipe_kegiatan');
        $petugasId = $request->query('petugas_id');

        $query = KegiatanLapangan::query()->with('petugas');

        if ($search) {
            $query->where('judul', 'like', "%{$search}%")
                  ->orWhere('catatan', 'like', "%{$search}%");
        }

        if ($tipeKegiatan) {
            $query->where('tipe_kegiatan', $tipeKegiatan);
        }

        if ($petugasId) {
            $query->where('petugas_id', $petugasId);
        }

        return response()->json($query->orderBy('tanggal_kegiatan', 'desc')->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'tipe_kegiatan' => 'required|in:Kunjungan,Penyuluhan,Monitoring',
            'tanggal_kegiatan' => 'required|date',
            'catatan' => 'nullable|string',
            'foto' => 'nullable|image|max:3072', // max 3MB
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except('foto');
        $data['petugas_id'] = Auth::guard('api')->id();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/kegiatan');
            $data['foto_path'] = Storage::url($path);
        }

        $kegiatan = KegiatanLapangan::create($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Kegiatan Lapangan',
            'deskripsi' => "Menambahkan kegiatan lapangan baru: {$kegiatan->judul}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kegiatan lapangan berhasil didaftarkan.', 'data' => $kegiatan], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $kegiatan = KegiatanLapangan::with('petugas')->find($id);
        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Kegiatan lapangan tidak ditemukan.'], 404);
        }
        return response()->json($kegiatan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $kegiatan = KegiatanLapangan::find($id);
        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Kegiatan lapangan tidak ditemukan.'], 404);
        }

        // Author protection: only author or admin can update
        if ($kegiatan->petugas_id !== Auth::guard('api')->id() && Auth::guard('api')->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak untuk mengedit data ini.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'string|max:255',
            'tipe_kegiatan' => 'in:Kunjungan,Penyuluhan,Monitoring',
            'tanggal_kegiatan' => 'date',
            'catatan' => 'nullable|string',
            'foto' => 'nullable|image|max:3072',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto', '_method']);

        if ($request->hasFile('foto')) {
            if ($kegiatan->foto_path) {
                $oldPath = str_replace('/storage/', 'public/', $kegiatan->foto_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('foto')->store('public/kegiatan');
            $data['foto_path'] = Storage::url($path);
        }

        $kegiatan->update($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Kegiatan Lapangan',
            'deskripsi' => "Mengedit kegiatan lapangan: {$kegiatan->judul}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kegiatan lapangan berhasil diperbarui.', 'data' => $kegiatan]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $kegiatan = KegiatanLapangan::find($id);
        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Kegiatan lapangan tidak ditemukan.'], 404);
        }

        if ($kegiatan->petugas_id !== Auth::guard('api')->id() && Auth::guard('api')->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki hak untuk menghapus data ini.'], 403);
        }

        if ($kegiatan->foto_path) {
            $oldPath = str_replace('/storage/', 'public/', $kegiatan->foto_path);
            Storage::delete($oldPath);
        }

        $kegiatan->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Kegiatan Lapangan',
            'deskripsi' => "Menghapus kegiatan lapangan: {$kegiatan->judul}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kegiatan lapangan berhasil dihapus.']);
    }
}
