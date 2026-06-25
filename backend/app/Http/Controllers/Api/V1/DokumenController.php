<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DokumenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $modelType = $request->query('model_type');
        $modelId = $request->query('model_id');

        $query = Dokumen::query()->with('uploadedBy');

        if ($search) {
            $query->where('nama_dokumen', 'like', "%{$search}%");
        }

        if ($modelType && $modelId) {
            $query->where('model_type', $modelType)->where('model_id', $modelId);
        }

        return response()->json($query->orderBy('nama_dokumen', 'asc')->orderBy('versi', 'desc')->paginate(15));
    }

    /**
     * Store a newly created resource in storage (supports versioning).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nama_dokumen' => 'required|string|max:255',
            'dokumen_file' => 'required|file|mimes:pdf,docx,xlsx,jpg,png|max:5120', // max 5MB
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $file = $request->file('dokumen_file');
        $extension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . Str::slug($request->nama_dokumen) . '.' . $extension;
        $path = $file->storeAs('public/vault', $fileName);

        // Check versioning: if document with same name and model exists, increment version
        $latestDoc = Dokumen::where('nama_dokumen', $request->nama_dokumen)
            ->where('model_type', $request->model_type)
            ->where('model_id', $request->model_id)
            ->orderBy('versi', 'desc')
            ->first();

        $version = $latestDoc ? $latestDoc->versi + 1 : 1;

        $dokumen = Dokumen::create([
            'nama_dokumen' => $request->nama_dokumen,
            'tipe_file' => strtoupper($extension),
            'file_path' => Storage::url($path),
            'versi' => $version,
            'uploaded_by_id' => Auth::guard('api')->id(),
            'model_type' => $request->model_type,
            'model_id' => $request->model_id,
        ]);

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Tambah',
            'modul' => 'Dokumen',
            'deskripsi' => "Mengupload dokumen baru: {$dokumen->nama_dokumen} (Versi: {$version})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil diupload.', 'data' => $dokumen], 201);
    }

    /**
     * Preview / Download document.
     */
    public function download(int $id): BinaryFileResponse|JsonResponse
    {
        $dokumen = Dokumen::find($id);
        if (!$dokumen) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak ditemukan.'], 404);
        }

        $path = str_replace('/storage/', 'public/', $dokumen->file_path);
        if (!Storage::exists($path)) {
            return response()->json(['success' => false, 'message' => 'File tidak ditemukan di server.'], 404);
        }

        $absolutePath = storage_path('app/' . $path);

        return response()->download($absolutePath, $dokumen->nama_dokumen . '.' . strtolower($dokumen->tipe_file));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $dokumen = Dokumen::find($id);
        if (!$dokumen) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak ditemukan.'], 404);
        }

        $path = str_replace('/storage/', 'public/', $dokumen->file_path);
        Storage::delete($path);

        $dokumen->delete();

        AuditLog::create([
            'user_id' => Auth::guard('api')->id(),
            'action' => 'Hapus',
            'modul' => 'Dokumen',
            'deskripsi' => "Menghapus dokumen: {$dokumen->nama_dokumen} (Versi: {$dokumen->versi})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil dihapus.']);
    }
}
