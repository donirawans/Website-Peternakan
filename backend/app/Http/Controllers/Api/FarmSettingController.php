<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarmSetting;
use Illuminate\Http\Request;

class FarmSettingController extends Controller
{
    private function formatFullUrl($url)
    {
        if (empty($url) || !is_string($url)) {
            return $url;
        }
        if (str_starts_with($url, 'blob:') || str_starts_with($url, 'data:')) {
            return $url;
        }
        if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
            $url = asset(ltrim($url, '/'));
        }
        if (str_contains($url, 'railway.app') || config('app.env') === 'production' || request()->server('HTTP_X_FORWARDED_PROTO') === 'https') {
            $url = str_replace('http://', 'https://', $url);
        }
        return $url;
    }

    private function transformSettings(FarmSetting $settings)
    {
        $h1 = $settings->hero_image_1 ?: ($settings->landing['hero_image_1'] ?? '');
        $h2 = $settings->hero_image_2 ?: ($settings->landing['hero_image_2'] ?? '');
        $h3 = $settings->hero_image_3 ?: ($settings->landing['hero_image_3'] ?? '');

        $settings->hero_image_1 = $this->formatFullUrl($h1);
        $settings->hero_image_2 = $this->formatFullUrl($h2);
        $settings->hero_image_3 = $this->formatFullUrl($h3);

        if (is_array($settings->landing)) {
            $landing = $settings->landing;
            $landing['hero_image_1'] = $settings->hero_image_1;
            $landing['hero_image_2'] = $settings->hero_image_2;
            $landing['hero_image_3'] = $settings->hero_image_3;
            $settings->landing = $landing;
        }

        return $settings;
    }

    public function getSettings()
    {
        $settings = FarmSetting::first();

        if ($settings) {
            $settings = $this->transformSettings($settings);
        }

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
            'hero_image_1' => 'nullable|string|max:1000',
            'hero_image_2' => 'nullable|string|max:1000',
            'hero_image_3' => 'nullable|string|max:1000',
            'landing' => 'nullable|array',
        ]);

        // Keluarkan field `landing` terpisah (array) supaya tidak ditimpa jadi string
        $settingsData = $validatedData;
        unset($settingsData['landing']);

        // Sinkronkan hero_image dari root payload maupun landing payload
        $hero1 = $request->input('hero_image_1') ?: $request->input('landing.hero_image_1');
        $hero2 = $request->input('hero_image_2') ?: $request->input('landing.hero_image_2');
        $hero3 = $request->input('hero_image_3') ?: $request->input('landing.hero_image_3');

        if ($hero1 !== null) $settingsData['hero_image_1'] = $this->formatFullUrl($hero1);
        if ($hero2 !== null) $settingsData['hero_image_2'] = $this->formatFullUrl($hero2);
        if ($hero3 !== null) $settingsData['hero_image_3'] = $this->formatFullUrl($hero3);

        $settings = FarmSetting::updateOrCreate(['id' => 1], $settingsData);

        if ($request->has('landing')) {
            $landingData = $request->input('landing');
            if (is_array($landingData)) {
                // Pastikan hero images tersinkron juga di dalam JSON landing dengan full URL
                if (isset($settingsData['hero_image_1'])) $landingData['hero_image_1'] = $settingsData['hero_image_1'];
                if (isset($settingsData['hero_image_2'])) $landingData['hero_image_2'] = $settingsData['hero_image_2'];
                if (isset($settingsData['hero_image_3'])) $landingData['hero_image_3'] = $settingsData['hero_image_3'];
            }
            $settings->landing = $landingData;
            $settings->save();
        }

        $settings->refresh();
        $settings = $this->transformSettings($settings);

        return response()->json([
            'status' => 200,
            'message' => 'Settings saved successfully',
            'data' => $settings,
        ]);
    }
}
