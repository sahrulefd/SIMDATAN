<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Petani extends Model
{
    protected $table = 'petani';

    protected $fillable = [
        'kelompok_tani_id',
        'nik',
        'nama',
        'jenis_kelamin',
        'tanggal_lahir',
        'nomor_hp',
        'alamat',
        'foto_path',
        'status',
        'tanggal_bergabung',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_bergabung' => 'date',
    ];

    public function kelompokTani(): BelongsTo
    {
        return $this->belongsTo(KelompokTani::class, 'kelompok_tani_id');
    }

    public function lahan(): HasMany
    {
        return $this->hasMany(Lahan::class, 'pemilik_petani_id');
    }
}
