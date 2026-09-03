<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 401,
                'message' => 'Invalid email or password',
            ], 401);
        }

        $token = Str::random(80);
        $user->api_token = hash('sha256', $token);
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'photo_url' => $user->photo_url,
                ],
            ],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'admin',
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'User registered successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => 200,
            'message' => 'Profile retrieved',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'photo_url' => $user->photo_url,
                ],
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'photo_url' => 'sometimes|string|max:500',
        ]);

        $user = $request->user();
        $user->fill($request->only(['name', 'email', 'photo_url']));
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'photo_url' => $user->photo_url,
                ],
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'status' => 400,
                'message' => 'Old password is incorrect',
            ], 400);
        }

        $user->password = bcrypt($request->new_password);
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'Password changed successfully',
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->api_token = null;
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'Logged out successfully',
        ]);
    }
}
