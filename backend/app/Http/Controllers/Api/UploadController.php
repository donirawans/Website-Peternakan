<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:51200',
        ]);

        $urls = [];

        foreach ($request->file('files') as $file) {
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads', $filename, 'public');
            $urls[] = asset('storage/' . $path);
        }

        return response()->json([
            'status' => 201,
            'message' => 'Files uploaded successfully',
            'data' => [
                'urls' => $urls,
            ],
        ], 201);
    }
}
