<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Komoditas extends Model
{
    protected $table = 'komoditas';

    protected $fillable = [
        'kode_komoditas',
        'nama_komoditas',
        'kategori',
        'satuan',
        'harga_acuan',
        'foto_path',
        'deskripsi',
    ];

    protected $casts = [
        'harga_acuan' => 'double',
    ];

    public function produksiPanen(): HasMany
    {
        return $this->hasMany(ProduksiPanen::class, 'komoditas_id');
    }
}
