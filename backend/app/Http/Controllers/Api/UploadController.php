<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $folder = $request->input('folder', 'uploads');
        // Hanya izinkan nama folder alfanumerik dan underscore
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $folder)) {
            $folder = 'uploads';
        }

        $files = [];
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            if (!is_array($files)) {
                $files = [$files];
            }
        } elseif ($request->hasFile('file')) {
            $files = [$request->file('file')];
        }

        if (empty($files)) {
            return response()->json([
                'status' => 422,
                'message' => 'Tidak ada file yang diunggah. Kirimkan file melalui field "files" atau "file".',
            ], 422);
        }

        $request->validate([
            'files.*' => 'file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:51200',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:51200',
        ]);

        $urls = [];

        foreach ($files as $file) {
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = time() . '_' . uniqid() . '.' . $extension;
            $path = $file->storeAs($folder, $filename, 'public');
            $fullUrl = asset('storage/' . $path);
            $urls[] = $fullUrl;
        }

        return response()->json([
            'status' => 201,
            'message' => 'File berhasil diunggah',
            'data' => [
                'url' => $urls[0] ?? '',
                'urls' => $urls,
            ],
        ], 201);
    }
}
