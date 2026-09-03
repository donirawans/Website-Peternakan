<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarmSetting;
use Illuminate\Http\Request;

class FarmSettingController extends Controller
{
    public function getSettings()
    {
        $settings = FarmSetting::first();

        return response()->json([
            'status' => 200,
            'message' => 'Settings retrieved',
            'data' => $settings,
        ]);
    }

    public function upsertSettings(Request $request)
    {
        $validatedData = $request->validate([
            'farm_name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'whatsapp_number' => 'nullable|string|max:50',
            'visiting_hours' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'google_maps_url' => 'nullable|string',
            'truck_access_note' => 'nullable|string',
            'landing' => 'nullable|array',
        ]);

        // Keluarkan field `landing` terpisah (array) supaya tidak ditimpa jadi string
        $settingsData = $validatedData;
        unset($settingsData['landing']);

        $settings = FarmSetting::updateOrCreate(['id' => 1], $settingsData);

        if ($request->has('landing')) {
            $settings->landing = $request->input('landing');
            $settings->save();
        }

        $settings->refresh();

        return response()->json([
            'status' => 200,
            'message' => 'Settings saved successfully',
            'data' => $settings,
        ]);
    }
}
