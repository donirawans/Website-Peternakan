<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitRequest;
use Illuminate\Http\Request;

class VisitRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'cattle_id' => 'nullable|integer',
            'cattle_name' => 'nullable|string|max:255',
            'buyer_name' => 'required|string|max:255',
            'buyer_phone' => 'nullable|string|max:50',
            'visit_date' => 'nullable|date',
            'visit_time' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $visitRequest = VisitRequest::create($request->all());

        return response()->json([
            'status' => 201,
            'message' => 'Visit request submitted successfully',
            'data' => $visitRequest,
        ], 201);
    }

    public function index()
    {
        $requests = VisitRequest::orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = VisitRequest::where('is_read', false)->count();

        return response()->json([
            'status' => 200,
            'message' => 'Notifications retrieved',
            'data' => [
                'notifications' => $requests,
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    public function markAsRead($id)
    {
        $visitRequest = VisitRequest::find($id);

        if (!$visitRequest) {
            return response()->json(['status' => 404, 'message' => 'Visit request not found'], 404);
        }

        $visitRequest->is_read = true;
        $visitRequest->save();

        return response()->json([
            'status' => 200,
            'message' => 'Marked as read',
            'data' => $visitRequest,
        ]);
    }

    public function destroy($id)
    {
        $visitRequest = VisitRequest::find($id);

        if (!$visitRequest) {
            return response()->json(['status' => 404, 'message' => 'Visit request not found'], 404);
        }

        $visitRequest->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Notification deleted',
        ]);
    }
}
