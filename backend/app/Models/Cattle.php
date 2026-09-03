<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cattle extends Model
{
    protected $fillable = [
        'ear_tag',
        'name',
        'breed',
        'gender',
        'age_phase',
        'weight',
        'price',
        'status',
        'kondisi',
        'feed_pattern',
        'care_notes',
        'media_urls'
    ];

    protected $casts = [
        'media_urls' => 'array',
        'weight' => 'integer',
        'price' => 'integer',
    ];
}
