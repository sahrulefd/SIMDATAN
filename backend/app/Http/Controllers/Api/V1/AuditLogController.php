<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $action = $request->query('action');
        $modul = $request->query('modul');

        $query = AuditLog::query()->with('user');

        if ($search) {
            $query->where('deskripsi', 'like', "%{$search}%");
        }

        if ($action) {
            $query->where('action', $action);
        }

        if ($modul) {
            $query->where('modul', $modul);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(25));
    }
}
