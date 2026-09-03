<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cattle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class CattleController extends Controller
{
    public function index(Request $request)
    {
        $query = Cattle::query();

        $status = $request->input('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($request->filled('category')) {
            $query->where('age_phase', $request->category);
        }
        if ($request->filled('breed')) {
            $query->where('breed', $request->breed);
        }
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ear_tag', 'like', "%{$search}%")
                  ->orWhere('care_notes', 'like', "%{$search}%");
            });
        }

        $cattle = $query->orderBy('id', 'desc')->get()->map(function ($c) {
            $media = is_array($c->media_urls) ? $c->media_urls : (json_decode($c->media_urls, true) ?: []);
            $images = array_values(array_filter($media, fn($u) => !str_ends_with($u, '.mp4') && !str_ends_with($u, '.webm') && !str_contains($u, 'video')));
            $videos = array_values(array_filter($media, fn($u) => str_ends_with($u, '.mp4') || str_ends_with($u, '.webm') || str_contains($u, 'video')));

            $c->images = count($images) > 0 ? $images : $media;
            $c->video_url = $videos[0] ?? null;
            $c->foto = $images[0] ?? ($media[0] ?? null);
            $c->harga = $c->price;
            $c->bobot = $c->weight;
            $c->kelamin = $c->gender;
            $c->fase = $c->age_phase;
            return $c;
        });

        return response()->json([
            'status' => 200,
            'message' => 'Cattle retrieved successfully',
            'data' => $cattle,
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = Cattle::query();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('age_phase', $request->category);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ear_tag', 'like', "%{$search}%");
            });
        }

        $cattle = $query->orderBy('created_at', 'desc')->get();

        $totalStok = Cattle::count();
        $tersedia = Cattle::where('status', 'Tersedia')->count();
        $booked = Cattle::where('status', 'Booked')->count();
        $terjualBulanIni = Cattle::where('status', 'Terjual')
            ->whereMonth('updated_at', now()->month)
            ->count();

        return response()->json([
            'status' => 200,
            'message' => 'Cattle retrieved successfully',
            'data' => $cattle,
            'stats' => [
                'total_stok' => $totalStok,
                'tersedia' => $tersedia,
                'booked' => $booked,
                'terjual_bulan_ini' => $terjualBulanIni,
            ],
        ]);
    }

    public function show($id)
    {
        $cattle = Cattle::find($id);

        if (!$cattle) {
            return response()->json(['status' => 404, 'message' => 'Cattle not found'], 404);
        }

        return response()->json([
            'status' => 200,
            'message' => 'Cattle found',
            'data' => $cattle,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ear_tag' => 'required|string|max:100|unique:cattle,ear_tag',
            'name' => 'required|string|max:255',
            'breed' => 'nullable|string|max:100',
            'gender' => 'nullable|string|max:20',
            'age_phase' => 'nullable|string|max:100',
            'weight' => 'nullable|integer',
            'price' => 'nullable|integer',
            'status' => 'nullable|string|max:50',
            'feed_pattern' => 'nullable|string',
            'care_notes' => 'nullable|string',
            'media_urls' => 'nullable',
            'images' => 'nullable',
            'video_url' => 'nullable|string',
        ]);

        $data = $request->all();
        $media = [];

        if ($request->has('images')) {
            $imgs = $request->input('images');
            if (is_array($imgs)) {
                $media = array_merge($media, $imgs);
            } elseif (is_string($imgs)) {
                $decoded = json_decode($imgs, true);
                $media = array_merge($media, is_array($decoded) ? $decoded : [$imgs]);
            }
        }

        if ($request->has('media_urls')) {
            $urls = $request->input('media_urls');
            if (is_array($urls)) {
                $media = array_merge($media, $urls);
            } elseif (is_string($urls)) {
                $decoded = json_decode($urls, true);
                $media = array_merge($media, is_array($decoded) ? $decoded : [$urls]);
            }
        }

        if ($request->filled('video_url')) {
            $media[] = $request->input('video_url');
        }

        $data['media_urls'] = array_values(array_unique(array_filter($media)));

        $cattle = Cattle::create($data);

        return response()->json([
            'status' => 201,
            'message' => 'Cattle created successfully',
            'data' => $cattle,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $cattle = Cattle::find($id);

        if (!$cattle) {
            return response()->json(['status' => 404, 'message' => 'Cattle not found'], 404);
        }

        $request->validate([
            'ear_tag' => ['sometimes', 'string', 'max:100', Rule::unique('cattle', 'ear_tag')->ignore($id)],
            'name' => 'sometimes|string|max:255',
            'breed' => 'nullable|string|max:100',
            'gender' => 'nullable|string|max:20',
            'age_phase' => 'nullable|string|max:100',
            'weight' => 'nullable|integer',
            'price' => 'nullable|integer',
            'status' => 'nullable|string|max:50',
            'feed_pattern' => 'nullable|string',
            'care_notes' => 'nullable|string',
            'media_urls' => 'nullable',
            'images' => 'nullable',
            'video_url' => 'nullable|string',
        ]);

        $data = $request->all();

        if ($request->has('images') || $request->has('media_urls') || $request->has('video_url')) {
            $media = [];

            if ($request->has('images')) {
                $imgs = $request->input('images');
                if (is_array($imgs)) {
                    $media = array_merge($media, $imgs);
                } elseif (is_string($imgs)) {
                    $decoded = json_decode($imgs, true);
                    $media = array_merge($media, is_array($decoded) ? $decoded : [$imgs]);
                }
            }

            if ($request->has('media_urls')) {
                $urls = $request->input('media_urls');
                if (is_array($urls)) {
                    $media = array_merge($media, $urls);
                } elseif (is_string($urls)) {
                    $decoded = json_decode($urls, true);
                    $media = array_merge($media, is_array($decoded) ? $decoded : [$urls]);
                }
            }

            if ($request->filled('video_url')) {
                $media[] = $request->input('video_url');
            }

            $data['media_urls'] = array_values(array_unique(array_filter($media)));
        }

        $cattle->update($data);

        return response()->json([
            'status' => 200,
            'message' => 'Cattle updated successfully',
            'data' => $cattle,
        ]);
    }

    public function destroy($id)
    {
        $cattle = Cattle::find($id);

        if (!$cattle) {
            return response()->json(['status' => 404, 'message' => 'Cattle not found'], 404);
        }

        $this->deleteMediaFiles($cattle);

        $cattle->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Cattle deleted successfully',
        ]);
    }

    /**
     * Delete associated media files from public storage.
     */
    private function deleteMediaFiles(Cattle $cattle): void
    {
        $mediaUrls = $cattle->media_urls;

        if (is_string($mediaUrls)) {
            $mediaUrls = json_decode($mediaUrls, true) ?: [];
        }

        if (!is_array($mediaUrls) || empty($mediaUrls)) {
            return;
        }

        foreach ($mediaUrls as $url) {
            if (!is_string($url) || $url === '') {
                continue;
            }

            $path = parse_url($url, PHP_URL_PATH) ?? '';
            $path = urldecode($path);

            // Only remove files that live inside the public storage "uploads" directory.
            if (preg_match('#^/storage/(.+)$#', $path, $m)) {
                $relative = $m[1];
                if (Storage::disk('public')->exists($relative)) {
                    Storage::disk('public')->delete($relative);
                }
            }
        }
    }
}
