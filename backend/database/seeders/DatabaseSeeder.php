<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Cattle;
use App\Models\FarmSetting;
use App\Models\BankAccount;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@kandas.com'], [
            'name' => 'Admin Kandas',
            'password' => bcrypt('kandas2026'),
            'role' => 'admin',
        ]);

        User::firstOrCreate(['email' => 'staff@kandas.com'], [
            'name' => 'Ahmad Danial',
            'password' => bcrypt('staff2026'),
            'role' => 'staff',
        ]);

        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Cattle::truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $cattles = [
            [
                'ear_tag' => 'PD-01',
                'name' => 'Pedet Limousin Super',
                'breed' => 'Limousin',
                'gender' => 'Jantan',
                'age_phase' => 'Pedetan',
                'weight' => 180,
                'price' => 16500000,
                'status' => 'Tersedia',
                'feed_pattern' => 'Susu Formula + Rumput',
                'care_notes' => 'Vaksin lengkap, aktif',
                'media_urls' => [
                    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
                    'https://images.unsplash.com/photo-1596733430284-f7437764b14d?w=800',
                    'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=800',
                ]
            ],
            [
                'ear_tag' => 'BK-02',
                'name' => 'Bakalan Simental',
                'breed' => 'Simental',
                'gender' => 'Jantan',
                'age_phase' => 'Bakalan',
                'weight' => 325,
                'price' => 21500000,
                'status' => 'Booked',
                'feed_pattern' => 'Rumput Gajah + Konsentrat',
                'care_notes' => 'Dalam masa penggemukan',
                'media_urls' => [
                    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800',
                    'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800',
                    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800',
                ]
            ],
            [
                'ear_tag' => 'SQ-03',
                'name' => 'Sapi PO Siap Qurban',
                'breed' => 'PO',
                'gender' => 'Jantan',
                'age_phase' => 'Siap Qurban',
                'weight' => 450,
                'price' => 28000000,
                'status' => 'Terjual',
                'feed_pattern' => 'Konsentrat Tinggi',
                'care_notes' => 'Lunas, siap kirim',
                'media_urls' => [
                    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800',
                    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800',
                    'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800',
                ]
            ],
        ];

        foreach ($cattles as $c) {
            Cattle::create($c);
        }

        FarmSetting::firstOrCreate([], [
            'farm_name' => 'Kandang Dastro',
            'tagline' => 'Dari Pedetan Sampai Sapi Qurban, Semua Ada di Sini',
            'description' => 'Sedia bibit pedet lepas sapih, bakalan penggemukan, hingga sapi dewasa siap Qurban. Dirawat telaten dengan pakan hijauan segar harian—bebas survei dan cek kondisi fisik langsung di kandang.',
            'whatsapp_number' => '6281234567890',
            'visiting_hours' => 'Senin - Minggu (07:00 - 17:00 WIB)',
            'address' => 'Jalan Pringgadani, Cikeusal Lor, Ketanggungan, Brebes',
            'google_maps_url' => 'https://maps.app.goo.gl/CCwcvjEQEoJ8MLq87',
            'truck_access_note' => 'Bisa dilalui truk engkel dan double, parkir luas tersedia',
        ]);

        BankAccount::firstOrCreate(['account_number' => '1234567890'], [
            'bank_name' => 'BCA',
            'account_holder' => 'Kandang Dastro',
            'is_active' => true,
        ]);
    }
}
