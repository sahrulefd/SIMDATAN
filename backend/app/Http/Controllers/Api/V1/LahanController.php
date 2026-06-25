<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lahan;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LahanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $pemilikId = $request->query('pemilik_petani_id');
        $kecamatanId = $request->query('kecamatan_id');

        $query = Lahan::query()->with(['pemilik.kelompokTani.desa.kecamatan']);

        if ($search) {
            $query->where('nama_lahan', 'like', "%{$search}%")
                  ->orWhere('kode_lahan', 'like', "%{$search}%");
        }

        if ($pemilikId) {
            $query->where('pemilik_petani_id', $pemilikId);
        }

        if ($kecamatanId) {
            $query->whereHas('pemilik.kelompokTani.desa.kecamatan', function($q) use ($kecamatanId) {
                $q->where('id', $kecamatanId);
            });
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Display a listing of land plots optimized for map rendering.
     */
    public function mapMarkers(Request $request): JsonResponse
    {
        $kecamatanId = $request->query('kecamatan_id');
        $komoditasId = $request->query('komoditas_id');

        $query = Lahan::query()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with(['pemilik.kelompokTani.desa.kecamatan', 'produksiPanen' => function($q) {
                $q->orderBy('created_at', 'desc')->limit(1); // load latest crop status
            }]);

        if ($kecamatanId) {
            $query->whereHas('pemilik.kelompokTani.desa.kecamatan', function($q) use ($kecamatanId) {
                $q->where('id', $kecamatanId);
            });
        }

        if ($komoditasId) {
            $query->whereHas('produksiPanen', function($q) use ($komoditasId) {
                $q->where('komoditas_id', $komoditasId);
            });
        }

        $lahans = $query->get()->map(function($lahan) {
            $latestProduksi = $lahan->produksiPanen->first();
            return [
                'id' => $lahan->id,
                'kode_lahan' => $lahan->kode_lahan,
                'nama_lahan' => $lahan->nama_lahan,
                'luas_ha' => $lahan->luas_ha,
                'latitude' => $lahan->latitude,
                'longitude' => $lahan->longitude,
                'pemilik' => $lahan->pemilik ? $lahan->pemilik->nama : 'N/A',
                'kelompok_tani' => $lahan->pemilik && $lahan->pemilik->kelompokTani ? $lahan->pemilik->kelompokTani->nama_kelompok : 'N/A',
                'status_panen' => $latestProduksi ? $latestProduksi->status_panen : 'Belum Tanam',
                'komoditas' => $latestProduksi && $latestProduksi->komoditas ? $latestProduksi->komoditas->nama_komoditas : 'N/A',
                'hasil_panen' => $latestProduksi ? $latestProduksi->hasil_panen : null
            ];
        });

        return response()->json($lahans);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pemilik_petani_id' => 'required|exists:petani,id',
            'kode_lahan' => 'required|string|unique:lahan,kode_lahan',
            'nama_lahan' => 'required|string|max:150',
            'luas_ha' => 'required|numeric|min:0.01',
            'status_kepemilikan' => 'required|in:Milik Sendiri,Sewa,Bagi Hasil',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'foto' => 'nullable|image|max:2048',
            'dokumen' => 'nullable|file|mimes:pdf,docx,xlsx,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto', 'dokumen']);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/lahan');
            $data['foto_path'] = Storage::url($path);
        }

        if ($request->hasFile('dokumen')) {
            $path = $request->file('dokumen')->store('public/dokumen_lahan');
            $data['dokumen_pendukung_path'] = Storage::url($path);
        }

        $lahan = Lahan::create($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Lahan',
            'deskripsi' => "Menambahkan lahan baru: {$lahan->nama_lahan} (Kode: {$lahan->kode_lahan})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Lahan berhasil ditambahkan.', 'data' => $lahan], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $lahan = Lahan::with(['pemilik.kelompokTani.desa.kecamatan', 'produksiPanen.komoditas'])->find($id);
        if (!$lahan) {
            return response()->json(['success' => false, 'message' => 'Lahan tidak ditemukan.'], 404);
        }
        return response()->json($lahan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lahan = Lahan::find($id);
        if (!$lahan) {
            return response()->json(['success' => false, 'message' => 'Lahan tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'pemilik_petani_id' => 'exists:petani,id',
            'kode_lahan' => "string|unique:lahan,kode_lahan,{$id}",
            'nama_lahan' => 'string|max:150',
            'luas_ha' => 'numeric|min:0.01',
            'status_kepemilikan' => 'in:Milik Sendiri,Sewa,Bagi Hasil',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'foto' => 'nullable|image|max:2048',
            'dokumen' => 'nullable|file|mimes:pdf,docx,xlsx,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['foto', 'dokumen', '_method']);

        if ($request->hasFile('foto')) {
            if ($lahan->foto_path) {
                $oldPath = str_replace('/storage/', 'public/', $lahan->foto_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('foto')->store('public/lahan');
            $data['foto_path'] = Storage::url($path);
        }

        if ($request->hasFile('dokumen')) {
            if ($lahan->dokumen_pendukung_path) {
                $oldPath = str_replace('/storage/', 'public/', $lahan->dokumen_pendukung_path);
                Storage::delete($oldPath);
            }
            $path = $request->file('dokumen')->store('public/dokumen_lahan');
            $data['dokumen_pendukung_path'] = Storage::url($path);
        }

        $lahan->update($data);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Lahan',
            'deskripsi' => "Mengedit lahan: {$lahan->nama_lahan} (Kode: {$lahan->kode_lahan})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Lahan berhasil diperbarui.', 'data' => $lahan]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $lahan = Lahan::find($id);
        if (!$lahan) {
            return response()->json(['success' => false, 'message' => 'Lahan tidak ditemukan.'], 404);
        }

        // Delete files
        if ($lahan->foto_path) {
            $oldPath = str_replace('/storage/', 'public/', $lahan->foto_path);
            Storage::delete($oldPath);
        }
        if ($lahan->dokumen_pendukung_path) {
            $oldPath = str_replace('/storage/', 'public/', $lahan->dokumen_pendukung_path);
            Storage::delete($oldPath);
        }

        $lahan->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Lahan',
            'deskripsi' => "Menghapus lahan: {$lahan->nama_lahan}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Lahan berhasil dihapus.']);
    }
}
