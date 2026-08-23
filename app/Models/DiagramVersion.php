<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagramVersion extends Model
{
    public $timestamps = false;

    protected $fillable = ['seq', 'doc', 'author_id', 'created_at'];

    protected function casts(): array
    {
        return [
            'doc' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
