<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KelompokTani extends Model
{
    protected $table = 'kelompok_tani';

    protected $fillable = [
        'desa_id',
        'nama_kelompok',
        'ketua_nama',
        'tahun_berdiri',
        'alamat',
    ];

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    public function petani(): HasMany
    {
        return $this->hasMany(Petani::class, 'kelompok_tani_id');
    }
}
