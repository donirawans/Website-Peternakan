<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number',
        'cattle_id',
        'buyer_name',
        'buyer_phone',
        'buyer_address',
        'total_amount',
        'dp_amount',
        'payment_method',
        'status',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'dp_amount' => 'integer',
        'transaction_date' => 'date',
    ];

    public function cattle()
    {
        return $this->belongsTo(Cattle::class);
    }
}
