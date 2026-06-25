<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ProduksiPanen extends Model
{
    protected $table = 'produksi_panen';

    protected $fillable = [
        'lahan_id',
        'komoditas_id',
        'musim_tanam',
        'tahun_tanam',
        'tanggal_tanam',
        'tanggal_panen_estimasi',
        'tanggal_panen_aktual',
        'status_panen',
        'hasil_panen',
        'satuan',
        'produktivitas',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_tanam' => 'date',
        'tanggal_panen_estimasi' => 'date',
        'tanggal_panen_aktual' => 'date',
        'hasil_panen' => 'double',
        'produktivitas' => 'double',
    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically calculate productivity index on saving (creating or updating)
        static::saving(function (ProduksiPanen $model) {
            if ($model->status_panen === 'Sudah Panen' && !is_null($model->hasil_panen)) {
                $lahan = Lahan::find($model->lahan_id);
                if ($lahan && $lahan->luas_ha > 0) {
                    $model->produktivitas = round($model->hasil_panen / $lahan->luas_ha, 2);
                }
            } else {
                $model->produktivitas = null;
            }
        });
    }

    public function lahan(): BelongsTo
    {
        return $this->belongsTo(Lahan::class, 'lahan_id');
    }

    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    public function workflows(): MorphMany
    {
        return $this->morphMany(ApprovalWorkflow::class, 'model');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Dokumen::class, 'model');
    }
}
