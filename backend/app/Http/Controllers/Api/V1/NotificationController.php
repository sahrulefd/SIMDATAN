<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ProduksiPanen;
use App\Models\ApprovalWorkflow;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get user notifications and run dynamic reminder check.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Run checking algorithm to automatically compile notifications
        $this->scanAndGenerateReminders($user);

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $notification = Notification::where('user_id', Auth::guard('api')->id())->find($id);
        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        $notification->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    /**
     * Mark all user notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        Notification::where('user_id', Auth::guard('api')->id())->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    /**
     * Scans database to insert missing warnings/reminders.
     */
    protected function scanAndGenerateReminders($user): void
    {
        $today = date('Y-m-d');

        // 1. Panen Terlambat Reminder
        // Harvest estimation date passed but status is still 'Sedang Tanam' or 'Akan Panen'
        $lateHarvests = ProduksiPanen::whereIn('status_panen', ['Sedang Tanam', 'Akan Panen'])
            ->where('tanggal_panen_estimasi', '<', $today)
            ->get();

        foreach ($lateHarvests as $item) {
            $msg = "Lahan {$item->lahan->nama_lahan} dengan komoditas {$item->komoditas->nama_komoditas} diestimasikan panen pada {$item->tanggal_panen_estimasi->format('d-m-Y')}. Silakan periksa status riwayat tanam.";
            
            // Check if already notified
            $exists = Notification::where('user_id', $user->id)
                ->where('title', 'Estimasi Panen Terlambat')
                ->where('message', $msg)
                ->exists();

            if (!$exists) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Estimasi Panen Terlambat',
                    'message' => $msg,
                    'type' => 'warning'
                ]);
            }
        }

        // 2. Produksi Belum Diinput
        // Status 'Sudah Panen' but hasil_panen is null
        $emptyHarvests = ProduksiPanen::where('status_panen', 'Sudah Panen')
            ->whereNull('hasil_panen')
            ->get();

        foreach ($emptyHarvests as $item) {
            $msg = "Lahan {$item->lahan->nama_lahan} sudah panen, namun hasil produksi tonase belum diinput.";
            
            $exists = Notification::where('user_id', $user->id)
                ->where('title', 'Produksi Belum Diinput')
                ->where('message', $msg)
                ->exists();

            if (!$exists) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Produksi Belum Diinput',
                    'message' => $msg,
                    'type' => 'info'
                ]);
            }
        }

        // 3. Approval Pending Warning (For Supervisor / Admin)
        if (in_array($user->role, ['supervisor', 'admin'])) {
            $pendingCount = ApprovalWorkflow::where('status', $user->role === 'supervisor' ? 'Submit' : 'Review')->count();
            if ($pendingCount > 0) {
                $msg = "Terdapat {$pendingCount} pengajuan produksi tani baru yang menunggu persetujuan/review Anda.";
                
                // Only write one alert per day to avoid spamming
                $exists = Notification::where('user_id', $user->id)
                    ->where('title', 'Persetujuan Pending')
                    ->whereDate('created_at', date('Y-m-d'))
                    ->exists();

                if (!$exists) {
                    Notification::create([
                        'user_id' => $user->id,
                        'title' => 'Persetujuan Pending',
                        'message' => $msg,
                        'type' => 'danger'
                    ]);
                }
            }
        }
    }
}
