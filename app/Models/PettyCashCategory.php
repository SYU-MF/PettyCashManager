<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PettyCashCategory extends Model
{
    protected $fillable = [
        'name',
        'type',
        'color',
    ];

    protected $casts = [
        'type' => 'string',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(PettyCashTransaction::class, 'category_id');
    }
}
