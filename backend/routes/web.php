<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 200,
        'message' => 'Kandas REST API Service Online',
    ]);
});

// Route handler untuk menyajikan file storage public di Railway / Vercel
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        abort(404, 'File not found');
    }

    $mimeType = mime_content_type($filePath) ?: 'image/jpeg';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');
