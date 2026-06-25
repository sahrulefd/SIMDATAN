<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApprovalWorkflow;
use App\Models\ProduksiPanen;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApprovalController extends Controller
{
    /**
     * Display a listing of approval requests.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status'); // e.g. Submit, Review, Approve, Reject
        $role = Auth::guard('api')->user()->role;

        $query = ApprovalWorkflow::query()->with(['requester', 'reviewer', 'model']);

        // Role-based queues
        if ($role === 'supervisor') {
            // Supervisor views submitted or reviewed records
            $query->whereIn('status', ['Submit', 'Review']);
        } elseif ($role === 'admin') {
            // Admin can view anything
            if ($status) {
                $query->where('status', $status);
            }
        } else {
            // Petugas views their own submissions
            $query->where('requester_id', Auth::guard('api')->id());
        }

        return response()->json($query->orderBy('updated_at', 'desc')->paginate(15));
    }

    /**
     * Update the workflow state (Review / Approve / Reject).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $workflow = ApprovalWorkflow::find($id);
        if (!$workflow) {
            return response()->json(['success' => false, 'message' => 'Workflow tidak ditemukan.'], 404);
        }

        $user = Auth::guard('api')->user();
        $role = $user->role;

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:review,approve,reject',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $action = $request->action;
        $notes = $request->notes;

        if ($role === 'petugas') {
            return response()->json(['success' => false, 'message' => 'Petugas Lapangan tidak memiliki akses approval.'], 403);
        }

        if ($role === 'supervisor') {
            if ($action === 'review') {
                $workflow->update([
                    'status' => 'Review',
                    'reviewer_id' => $user->id,
                    'notes' => $notes ?? 'Telah diperiksa oleh Supervisor.'
                ]);
            } elseif ($action === 'reject') {
                $workflow->update([
                    'status' => 'Reject',
                    'reviewer_id' => $user->id,
                    'notes' => $notes ?? 'Ditolak oleh Supervisor.'
                ]);
            } else {
                return response()->json(['success' => false, 'message' => 'Supervisor hanya bisa melakukan Review atau Reject.'], 403);
            }
        }

        if ($role === 'admin') {
            if ($action === 'approve') {
                $workflow->update([
                    'status' => 'Approve',
                    'reviewer_id' => $user->id,
                    'notes' => $notes ?? 'Disetujui oleh Administrator.'
                ]);

                // Update the actual target model status if needed
                if ($workflow->model_type === ProduksiPanen::class) {
                    $produksi = ProduksiPanen::find($workflow->model_id);
                    if ($produksi) {
                        // When approved, we promote status to "Sudah Panen" or keep it, based on record setup
                        // By default, approving makes the yield officially audited
                    }
                }
            } elseif ($action === 'reject') {
                $workflow->update([
                    'status' => 'Reject',
                    'reviewer_id' => $user->id,
                    'notes' => $notes ?? 'Ditolak oleh Administrator.'
                ]);
            } elseif ($action === 'review') {
                $workflow->update([
                    'status' => 'Review',
                    'reviewer_id' => $user->id,
                    'notes' => $notes ?? 'Telah diperiksa oleh Administrator.'
                ]);
            }
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'Edit',
            'modul' => 'Workflow Approval',
            'deskripsi' => "Mengubah status workflow ID {$workflow->id} menjadi {$workflow->status}. Catatan: {$notes}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Workflow berhasil diperbarui ke status: {$workflow->status}.",
            'data' => $workflow
        ]);
    }
}
