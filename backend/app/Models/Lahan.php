<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lahan extends Model
{
    protected $table = 'lahan';

    protected $fillable = [
        'pemilik_petani_id',
        'kode_lahan',
        'nama_lahan',
        'luas_ha',
        'status_kepemilikan',
        'latitude',
        'longitude',
        'foto_path',
        'dokumen_pendukung_path',
    ];

    protected $casts = [
        'luas_ha' => 'double',
        'latitude' => 'double',
        'longitude' => 'double',
    ];

    public function pemilik(): BelongsTo
    {
        return $this->belongsTo(Petani::class, 'pemilik_petani_id');
    }

    public function produksiPanen(): HasMany
    {
        return $this->hasMany(ProduksiPanen::class, 'lahan_id');
    }
}
