<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Dokumen extends Model
{
    protected $table = 'dokumen';

    protected $fillable = [
        'nama_dokumen',
        'tipe_file',
        'file_path',
        'versi',
        'uploaded_by_id',
        'model_type',
        'model_id',
    ];

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    public function model(): MorphTo
    {
        return $this->morphTo();
    }
}
