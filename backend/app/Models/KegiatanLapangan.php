<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KegiatanLapangan extends Model
{
    protected $table = 'kegiatan_lapangan';

    protected $fillable = [
        'petugas_id',
        'judul',
        'tipe_kegiatan',
        'tanggal_kegiatan',
        'catatan',
        'foto_path',
    ];

    protected $casts = [
        'tanggal_kegiatan' => 'date',
    ];

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
