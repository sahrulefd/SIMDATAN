<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KelompokTani;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class KelompokTaniController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $desaId = $request->query('desa_id');

        $query = KelompokTani::query()->with('desa.kecamatan');

        if ($search) {
            $query->where('nama_kelompok', 'like', "%{$search}%")
                  ->orWhere('ketua_nama', 'like', "%{$search}%");
        }

        if ($desaId) {
            $query->where('desa_id', $desaId);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'desa_id' => 'required|exists:desa,id',
            'nama_kelompok' => 'required|string|max:150',
            'ketua_nama' => 'required|string|max:150',
            'tahun_berdiri' => 'required|integer|min:1900|max:2099',
            'alamat' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $kelompok = KelompokTani::create($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Kelompok Tani',
            'deskripsi' => "Menambahkan kelompok tani baru: {$kelompok->nama_kelompok}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kelompok Tani berhasil ditambahkan.', 'data' => $kelompok], 201);
    }

    /**
     * Display the specified resource along with member and yield aggregation.
     */
    public function show(int $id): JsonResponse
    {
        $kelompok = KelompokTani::with(['desa.kecamatan', 'petani'])->find($id);
        if (!$kelompok) {
            return response()->json(['success' => false, 'message' => 'Kelompok Tani tidak ditemukan.'], 404);
        }

        // Aggregate calculations for "Detail Produksi Kelompok"
        $farmerIds = $kelompok->petani->pluck('id');

        $totalLahan = DB::table('lahan')
            ->whereIn('pemilik_petani_id', $farmerIds)
            ->count();

        $totalLuas = DB::table('lahan')
            ->whereIn('pemilik_petani_id', $farmerIds)
            ->sum('luas_ha');

        $totalProduksi = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->whereIn('lahan.pemilik_petani_id', $farmerIds)
            ->where('produksi_panen.status_panen', '=', 'Sudah Panen')
            ->sum('produksi_panen.hasil_panen');

        // Commodity breakdown for the group
        $produksiPerKomoditas = DB::table('produksi_panen')
            ->join('lahan', 'produksi_panen.lahan_id', '=', 'lahan.id')
            ->join('komoditas', 'produksi_panen.komoditas_id', '=', 'komoditas.id')
            ->whereIn('lahan.pemilik_petani_id', $farmerIds)
            ->where('produksi_panen.status_panen', '=', 'Sudah Panen')
            ->select('komoditas.nama_komoditas', DB::raw('SUM(produksi_panen.hasil_panen) as total_yield'))
            ->groupBy('komoditas.nama_komoditas')
            ->get();

        return response()->json([
            'kelompok' => $kelompok,
            'stat_produksi' => [
                'total_anggota' => $kelompok->petani->count(),
                'total_lahan' => $totalLahan,
                'total_luas_ha' => round($totalLuas, 2),
                'total_produksi_ton' => round($totalProduksi, 2),
                'produksi_komoditas' => $produksiPerKomoditas
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $kelompok = KelompokTani::find($id);
        if (!$kelompok) {
            return response()->json(['success' => false, 'message' => 'Kelompok Tani tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'desa_id' => 'exists:desa,id',
            'nama_kelompok' => 'string|max:150',
            'ketua_nama' => 'string|max:150',
            'tahun_berdiri' => 'integer|min:1900|max:2099',
            'alamat' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $kelompok->update($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Kelompok Tani',
            'deskripsi' => "Mengedit kelompok tani: {$kelompok->nama_kelompok}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kelompok Tani berhasil diperbarui.', 'data' => $kelompok]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $kelompok = KelompokTani::find($id);
        if (!$kelompok) {
            return response()->json(['success' => false, 'message' => 'Kelompok Tani tidak ditemukan.'], 404);
        }

        // Dissociate members
        DB::table('petani')->where('kelompok_tani_id', $id)->update(['kelompok_tani_id' => null]);

        $kelompok->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Kelompok Tani',
            'deskripsi' => "Menghapus kelompok tani: {$kelompok->nama_kelompok}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Kelompok Tani berhasil dihapus.']);
    }
}
