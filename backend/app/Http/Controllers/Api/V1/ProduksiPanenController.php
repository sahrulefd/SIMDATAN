<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProduksiPanen;
use App\Models\ApprovalWorkflow;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProduksiPanenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $lahanId = $request->query('lahan_id');
        $komoditasId = $request->query('komoditas_id');
        $statusPanen = $request->query('status_panen');
        $tahunTanam = $request->query('tahun_tanam');
        $kecamatanId = $request->query('kecamatan_id');

        $query = ProduksiPanen::query()->with(['lahan.pemilik.kelompokTani.desa.kecamatan', 'komoditas']);

        if ($lahanId) {
            $query->where('lahan_id', $lahanId);
        }

        if ($komoditasId) {
            $query->where('komoditas_id', $komoditasId);
        }

        if ($statusPanen) {
            $query->where('status_panen', $statusPanen);
        }

        if ($tahunTanam) {
            $query->where('tahun_tanam', $tahunTanam);
        }

        if ($kecamatanId) {
            $query->whereHas('lahan.pemilik.kelompokTani.desa.kecamatan', function($q) use ($kecamatanId) {
                $q->where('id', $kecamatanId);
            });
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lahan_id' => 'required|exists:lahan,id',
            'komoditas_id' => 'required|exists:komoditas,id',
            'musim_tanam' => 'required|string|max:50',
            'tahun_tanam' => 'required|integer|min:2000|max:2099',
            'tanggal_tanam' => 'required|date',
            'tanggal_panen_estimasi' => 'required|date|after_or_equal:tanggal_tanam',
            'tanggal_panen_aktual' => 'nullable|date|after_or_equal:tanggal_tanam',
            'status_panen' => 'required|in:Belum Tanam,Sedang Tanam,Akan Panen,Sudah Panen,Gagal Panen',
            'hasil_panen' => 'nullable|numeric|min:0',
            'satuan' => 'required|string|max:50',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $produksi = ProduksiPanen::create($request->all());

        // Automatically initialize an Approval Workflow
        $status = 'Draft';
        if (Auth::guard('api')->user()->role === 'petugas') {
            $status = 'Submit'; // Petugas automatically submits it
        }

        ApprovalWorkflow::create([
            'model_type' => ProduksiPanen::class,
            'model_id' => $produksi->id,
            'requester_id' => Auth::guard('api')->id(),
            'status' => $status,
            'notes' => 'Pendaftaran riwayat tanam/produksi baru.'
        ]);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Produksi Panen',
            'deskripsi' => "Menambahkan produksi panen baru: Lahan ID {$produksi->lahan_id}, Komoditas ID {$produksi->komoditas_id} (Status: {$produksi->status_panen})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Data produksi berhasil disimpan.', 'data' => $produksi], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $produksi = ProduksiPanen::with(['lahan.pemilik.kelompokTani.desa.kecamatan', 'komoditas', 'workflows.requester', 'workflows.reviewer'])->find($id);
        if (!$produksi) {
            return response()->json(['success' => false, 'message' => 'Data produksi tidak ditemukan.'], 404);
        }
        return response()->json($produksi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $produksi = ProduksiPanen::find($id);
        if (!$produksi) {
            return response()->json(['success' => false, 'message' => 'Data produksi tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'lahan_id' => 'exists:lahan,id',
            'komoditas_id' => 'exists:komoditas,id',
            'musim_tanam' => 'string|max:50',
            'tahun_tanam' => 'integer|min:2000|max:2099',
            'tanggal_tanam' => 'date',
            'tanggal_panen_estimasi' => 'date|after_or_equal:tanggal_tanam',
            'tanggal_panen_aktual' => 'nullable|date|after_or_equal:tanggal_tanam',
            'status_panen' => 'in:Belum Tanam,Sedang Tanam,Akan Panen,Sudah Panen,Gagal Panen',
            'hasil_panen' => 'nullable|numeric|min:0',
            'satuan' => 'string|max:50',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Productivity is auto-calculated on saving event in model!
        $produksi->update($request->all());

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Edit',
            'modul' => 'Produksi Panen',
            'deskripsi' => "Mengedit produksi panen: ID {$produksi->id} (Status: {$produksi->status_panen})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Data produksi berhasil diperbarui.', 'data' => $produksi]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $produksi = ProduksiPanen::find($id);
        if (!$produksi) {
            return response()->json(['success' => false, 'message' => 'Data produksi tidak ditemukan.'], 404);
        }

        $produksi->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Produksi Panen',
            'deskripsi' => "Menghapus produksi panen: ID {$id}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Data produksi berhasil dihapus.']);
    }
}
