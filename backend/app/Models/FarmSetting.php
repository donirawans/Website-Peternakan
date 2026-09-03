<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmSetting extends Model
{
    protected $table = 'farm_settings';

    protected $fillable = [
        'farm_name',
        'tagline',
        'description',
        'whatsapp_number',
        'visiting_hours',
        'address',
        'google_maps_url',
        'truck_access_note',
        'hero_image_1',
        'hero_image_2',
        'hero_image_3',
        'landing',
    ];

    protected $casts = [
        'landing' => 'array',
    ];
}
