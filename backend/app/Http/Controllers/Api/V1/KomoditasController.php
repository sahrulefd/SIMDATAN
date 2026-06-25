<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Komoditas;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class KomoditasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $kategori = $request->query('kategori');

        $query = Komoditas::query();

        if ($search) {
            $query->where('nama_komoditas', 'like', "%{$search}%")
                  ->orWhere('kode_komoditas', 'like', "%{$search}%");
        }

        if ($kategori) {
            $query->where('kategori', $kategori);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_komoditas' => 'required|string|unique:komoditas,kode_komoditas',
            'nama_komoditas' => 'required|string|max:150',
            'kategori' => 'required|string|max:100',
            'satuan' => 'required|string|max:50',
            'harga_acuan' => 'required|numeric|min:0',
            'foto' => 'nullable|image|max:2048',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except('foto');

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/komoditas');
            $data['foto_path'] = Storage::url($path);
        }

        $komoditas = Komoditas::create($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Komoditas',
            'deskripsi' => "Menambahkan komoditas baru: {$komoditas->nama_komoditas} (Kode: {$komoditas->kode_komoditas})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Komoditas berhasil ditambahkan.', 'data' => $komoditas], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $komoditas = Komoditas::find($id);
        if (!$komoditas) {
            return response()->json(['success' => false, 'message' => 'Komoditas tidak ditemukan.'], 404);
        }
        return response()->json($komoditas);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $komoditas = Komoditas::find($id);
        if (!$komoditas) {
            return response()->json(['success' => false, 'message' => 'Komoditas tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_komoditas' => "string|unique:komoditas,kode_komoditas,{$id}",
            'nama_komoditas' => 'string|max:150',
            'kategori' => 'string|max:100',
            'satuan' => 'string|max:50',
            'harga_acuan' => 'numeric|min:0',
            'foto' => 'nullable|image|max:2048',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto', '_method']);

        if ($request->hasFile('foto')) {
            if ($komoditas->foto_path) {
                $oldPath = str_replace('/storage/', 'public/', $komoditas->foto_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('foto')->store('public/komoditas');
            $data['foto_path'] = Storage::url($path);
        }

        $komoditas->update($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Komoditas',
            'deskripsi' => "Mengedit komoditas: {$komoditas->nama_komoditas} (Kode: {$komoditas->kode_komoditas})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Komoditas berhasil diperbarui.', 'data' => $komoditas]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $komoditas = Komoditas::find($id);
        if (!$komoditas) {
            return response()->json(['success' => false, 'message' => 'Komoditas tidak ditemukan.'], 404);
        }

        if ($komoditas->foto_path) {
            $oldPath = str_replace('/storage/', 'public/', $komoditas->foto_path);
            Storage::delete($oldPath);
        }

        $komoditas->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Komoditas',
            'deskripsi' => "Menghapus komoditas: {$komoditas->nama_komoditas}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Komoditas berhasil dihapus.']);
    }
}
