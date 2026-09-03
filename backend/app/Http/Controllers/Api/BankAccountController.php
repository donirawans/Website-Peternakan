<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function getActive()
    {
        $accounts = BankAccount::where('is_active', true)->get();
        return response()->json([
            'status' => 200,
            'message' => 'Active bank accounts retrieved',
            'data' => $accounts,
        ]);
    }

    public function index()
    {
        $accounts = BankAccount::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 200,
            'message' => 'Bank accounts retrieved',
            'data' => $accounts,
        ]);
    }

    public function show($id)
    {
        $account = BankAccount::find($id);
        if (!$account) {
            return response()->json(['status' => 404, 'message' => 'Bank account not found'], 404);
        }
        return response()->json([
            'status' => 200,
            'message' => 'Bank account found',
            'data' => $account,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:100',
            'account_holder' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $account = BankAccount::create($request->all());

        return response()->json([
            'status' => 201,
            'message' => 'Bank account created successfully',
            'data' => $account,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $account = BankAccount::find($id);
        if (!$account) {
            return response()->json(['status' => 404, 'message' => 'Bank account not found'], 404);
        }

        $request->validate([
            'bank_name' => 'sometimes|string|max:100',
            'account_number' => 'sometimes|string|max:100',
            'account_holder' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $account->update($request->all());

        return response()->json([
            'status' => 200,
            'message' => 'Bank account updated successfully',
            'data' => $account,
        ]);
    }

    public function destroy($id)
    {
        $account = BankAccount::find($id);
        if (!$account) {
            return response()->json(['status' => 404, 'message' => 'Bank account not found'], 404);
        }

        $account->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Bank account deleted successfully',
        ]);
    }
}
