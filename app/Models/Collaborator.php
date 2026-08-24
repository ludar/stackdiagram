<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Collaborator extends Model
{
    protected $fillable = ['user_id', 'email', 'role', 'invited_by'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
