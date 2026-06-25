<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Perform global search across all modules.
     */
    public function globalSearch(Request $request): JsonResponse
    {
        $query = $request->query('query');
        if (empty($query) || strlen($query) < 2) {
            return response()->json([
                'petani' => [],
                'kelompok_tani' => [],
                'lahan' => [],
                'komoditas' => []
            ]);
        }

        $petani = DB::table('petani')
            ->where('nama', 'like', "%{$query}%")
            ->orWhere('nik', 'like', "%{$query}%")
            ->select('id', 'nama as title', 'nik as subtitle', DB::raw("'petani' as type"))
            ->limit(5)
            ->get();

        $kelompok = DB::table('kelompok_tani')
            ->where('nama_kelompok', 'like', "%{$query}%")
            ->orWhere('ketua_nama', 'like', "%{$query}%")
            ->select('id', 'nama_kelompok as title', 'ketua_nama as subtitle', DB::raw("'kelompok' as type"))
            ->limit(5)
            ->get();

        $lahan = DB::table('lahan')
            ->where('nama_lahan', 'like', "%{$query}%")
            ->orWhere('kode_lahan', 'like', "%{$query}%")
            ->select('id', 'nama_lahan as title', 'kode_lahan as subtitle', DB::raw("'lahan' as type"))
            ->limit(5)
            ->get();

        $komoditas = DB::table('komoditas')
            ->where('nama_komoditas', 'like', "%{$query}%")
            ->orWhere('kategori', 'like', "%{$query}%")
            ->select('id', 'nama_komoditas as title', 'kategori as subtitle', DB::raw("'komoditas' as type"))
            ->limit(5)
            ->get();

        return response()->json([
            'petani' => $petani,
            'kelompok_tani' => $kelompok,
            'lahan' => $lahan,
            'komoditas' => $komoditas
        ]);
    }
}
