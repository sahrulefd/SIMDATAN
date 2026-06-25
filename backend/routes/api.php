<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WilayahController;
use App\Http\Controllers\Api\V1\PetaniController;
use App\Http\Controllers\Api\V1\KelompokTaniController;
use App\Http\Controllers\Api\V1\LahanController;
use App\Http\Controllers\Api\V1\KomoditasController;
use App\Http\Controllers\Api\V1\ProduksiPanenController;
use App\Http\Controllers\Api\V1\KegiatanLapanganController;
use App\Http\Controllers\Api\V1\DokumenController;
use App\Http\Controllers\Api\V1\ApprovalController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\ExcelController;
use App\Http\Controllers\Api\V1\ReportController;

Route::prefix('v1')->group(function () {
    
    // Auth Routes (Public)
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

    // Protected API Routes
    Route::middleware('auth:api')->group(function () {
        
        // Auth Routes (Protected)
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/refresh', [AuthController::class, 'refresh']);
        Route::post('auth/change-password', [AuthController::class, 'changePassword']);

        // Dashboard Stats
        Route::get('dashboard/stats', [DashboardController::class, 'index']);

        // Global Search
        Route::get('search', [SearchController::class, 'globalSearch']);

        // Wilayah CRUD
        Route::get('kecamatan', [WilayahController::class, 'indexKecamatan']);
        Route::post('kecamatan', [WilayahController::class, 'storeKecamatan']);
        Route::get('kecamatan/{id}', [WilayahController::class, 'showKecamatan']);
        Route::put('kecamatan/{id}', [WilayahController::class, 'updateKecamatan']);
        Route::delete('kecamatan/{id}', [WilayahController::class, 'destroyKecamatan']);

        Route::get('desa', [WilayahController::class, 'indexDesa']);
        Route::post('desa', [WilayahController::class, 'storeDesa']);
        Route::get('desa/{id}', [WilayahController::class, 'showDesa']);
        Route::put('desa/{id}', [WilayahController::class, 'updateDesa']);
        Route::delete('desa/{id}', [WilayahController::class, 'destroyDesa']);

        // Kelompok Tani CRUD
        Route::apiResource('kelompok-tani', KelompokTaniController::class);

        // Petani CRUD
        Route::apiResource('petani', PetaniController::class);

        // Lahan CRUD & GIS Marker
        Route::get('lahan/map-markers', [LahanController::class, 'mapMarkers']);
        Route::apiResource('lahan', LahanController::class);

        // Komoditas CRUD
        Route::apiResource('komoditas', KomoditasController::class);

        // Produksi Panen CRUD
        Route::apiResource('produksi-panen', ProduksiPanenController::class);

        // Kegiatan Lapangan CRUD
        Route::apiResource('kegiatan-lapangan', KegiatanLapanganController::class);

        // Approval Workflows
        Route::get('approvals', [ApprovalController::class, 'index']);
        Route::post('approvals/{id}/status', [ApprovalController::class, 'updateStatus']);

        // Document Management Vault
        Route::get('dokumen', [DokumenController::class, 'index']);
        Route::post('dokumen', [DokumenController::class, 'store']);
        Route::get('dokumen/{id}/download', [DokumenController::class, 'download']);
        Route::delete('dokumen/{id}', [DokumenController::class, 'destroy']);

        // Notification Center
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // Audit Logs
        Route::get('audit-logs', [AuditLogController::class, 'index']);

        // Import & Export Spreadsheet utilities
        Route::get('import/template/{module}', [ExcelController::class, 'downloadTemplate']);
        Route::post('import/validate', [ExcelController::class, 'validateImport']);
        Route::post('import/commit', [ExcelController::class, 'commitImport']);
        Route::get('export/report', [ReportController::class, 'exportReport']);

        // System Settings & Database Backup/Restore
        Route::get('settings', [SettingController::class, 'getSettings']);
        Route::post('settings', [SettingController::class, 'updateSettings']);
        Route::get('settings/backup', [SettingController::class, 'backupDatabase']);
        Route::post('settings/restore', [SettingController::class, 'restoreDatabase']);

        // User Management (Admin only)
        Route::apiResource('users', UserController::class);

    });
});
