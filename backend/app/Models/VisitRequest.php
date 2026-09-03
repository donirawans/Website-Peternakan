<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitRequest extends Model
{
    protected $fillable = [
        'cattle_id',
        'cattle_name',
        'buyer_name',
        'buyer_phone',
        'visit_date',
        'visit_time',
        'notes',
        'is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'visit_date' => 'date',
    ];
}
