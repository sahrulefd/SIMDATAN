<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. kecamatan
        Schema::create('kecamatan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kecamatan', 50)->unique();
            $table->string('nama_kecamatan', 150);
            $table->timestamps();
        });

        // 2. desa
        Schema::create('desa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kecamatan_id')->constrained('kecamatan')->onDelete('restrict')->onUpdate('cascade');
            $table->string('kode_desa', 50)->unique();
            $table->string('nama_desa', 150);
            $table->timestamps();
        });

        // 3. kelompok_tani
        Schema::create('kelompok_tani', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('desa')->onDelete('restrict')->onUpdate('cascade');
            $table->string('nama_kelompok', 150);
            $table->string('ketua_nama', 150);
            $table->year('tahun_berdiri');
            $table->text('alamat')->nullable();
            $table->timestamps();
        });

        // 4. petani
        Schema::create('petani', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_tani_id')->nullable()->constrained('kelompok_tani')->onDelete('set null')->onUpdate('cascade');
            $table->string('nik', 16)->unique();
            $table->string('nama', 150);
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->date('tanggal_lahir');
            $table->string('nomor_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->string('foto_path', 255)->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->date('tanggal_bergabung')->nullable();
            $table->timestamps();
        });

        // 5. lahan
        Schema::create('lahan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pemilik_petani_id')->constrained('petani')->onDelete('cascade')->onUpdate('cascade');
            $table->string('kode_lahan', 50)->unique();
            $table->string('nama_lahan', 150);
            $table->double('luas_ha', 8, 2);
            $table->enum('status_kepemilikan', ['Milik Sendiri', 'Sewa', 'Bagi Hasil'])->default('Milik Sendiri');
            $table->double('latitude', 10, 8)->nullable();
            $table->double('longitude', 11, 8)->nullable();
            $table->string('foto_path', 255)->nullable();
            $table->string('dokumen_pendukung_path', 255)->nullable();
            $table->timestamps();
        });

        // 6. komoditas
        Schema::create('komoditas', function (Blueprint $table) {
            $table->id();
            $table->string('kode_komoditas', 50)->unique();
            $table->string('nama_komoditas', 150);
            $table->string('kategori', 100);
            $table->string('satuan', 50)->default('Ton');
            $table->double('harga_acuan', 12, 2)->default(0.00);
            $table->string('foto_path', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        // 7. produksi_panen
        Schema::create('produksi_panen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lahan_id')->constrained('lahan')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('komoditas_id')->constrained('komoditas')->onDelete('restrict')->onUpdate('cascade');
            $table->string('musim_tanam', 50);
            $table->year('tahun_tanam');
            $table->date('tanggal_tanam');
            $table->date('tanggal_panen_estimasi');
            $table->date('tanggal_panen_aktual')->nullable();
            $table->enum('status_panen', ['Belum Tanam', 'Sedang Tanam', 'Akan Panen', 'Sudah Panen', 'Gagal Panen'])->default('Belum Tanam');
            $table->double('hasil_panen', 12, 2)->nullable();
            $table->string('satuan', 50)->default('Ton');
            $table->double('produktivitas', 8, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            // composite index for analytics performance
            $table->index(['status_panen', 'tahun_tanam', 'komoditas_id'], 'produksi_analytics_idx');
        });

        // 8. kegiatan_lapangan
        Schema::create('kegiatan_lapangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petugas_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->string('judul', 255);
            $table->enum('tipe_kegiatan', ['Kunjungan', 'Penyuluhan', 'Monitoring'])->default('Monitoring');
            $table->date('tanggal_kegiatan');
            $table->text('catatan')->nullable();
            $table->string('foto_path', 255)->nullable();
            $table->timestamps();
        });

        // 9. dokumen
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id();
            $table->string('nama_dokumen', 255);
            $table->string('tipe_file', 10);
            $table->string('file_path', 255);
            $table->integer('versi')->default(1);
            $table->foreignId('uploaded_by_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->string('model_type', 255)->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->timestamps();
        });

        // 10. approval_workflows
        Schema::create('approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('model_type', 255);
            $table->unsignedBigInteger('model_id');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('status', ['Draft', 'Submit', 'Review', 'Approve', 'Reject'])->default('Draft');
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 11. audit_logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->enum('action', ['Login', 'Logout', 'Tambah', 'Edit', 'Hapus', 'Import', 'Export']);
            $table->string('modul', 100);
            $table->text('deskripsi');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 12. notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->string('title', 255);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->string('type', 50)->default('info');
            $table->timestamps();
        });

        // 13. settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('approval_workflows');
        Schema::dropIfExists('dokumen');
        Schema::dropIfExists('kegiatan_lapangan');
        Schema::dropIfExists('produksi_panen');
        Schema::dropIfExists('komoditas');
        Schema::dropIfExists('lahan');
        Schema::dropIfExists('petani');
        Schema::dropIfExists('kelompok_tani');
        Schema::dropIfExists('desa');
        Schema::dropIfExists('kecamatan');
    }
};
