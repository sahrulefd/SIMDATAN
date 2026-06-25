<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalWorkflow extends Model
{
    protected $table = 'approval_workflows';

    protected $fillable = [
        'model_type',
        'model_id',
        'requester_id',
        'status',
        'reviewer_id',
        'notes',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function model(): MorphTo
    {
        return $this->morphTo();
    }
}
