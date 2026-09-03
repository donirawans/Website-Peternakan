<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Cattle;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('cattle')->latest()->get();

        $lunas = Transaction::where('status', 'Lunas');
        $dpTerbayar = Transaction::where('status', 'DP Terbayar');

        $totalRevenue = (clone $lunas)->sum('total_amount') + (clone $dpTerbayar)->sum('dp_amount');
        $soldCount = (clone $lunas)->count();
        $pendingCount = $dpTerbayar->count();
        $potentialPendingAmount = Transaction::where('status', 'DP Terbayar')
            ->selectRaw('SUM(total_amount - dp_amount) as remaining')
            ->value('remaining') ?? 0;
        $avgTransaction = Transaction::where('status', 'Lunas')->avg('total_amount') ?? 0;

        return response()->json([
            'status' => 200,
            'message' => 'Transactions retrieved',
            'data' => $transactions,
            'summary' => [
                'total_revenue' => (int) $totalRevenue,
                'sold_count' => $soldCount,
                'pending_count' => $pendingCount,
                'potential_pending_amount' => (int) $potentialPendingAmount,
                'avg_transaction' => (int) round($avgTransaction),
            ],
        ]);
    }

    public function show($id)
    {
        $transaction = Transaction::with('cattle')->find($id);
        if (!$transaction) {
            return response()->json(['status' => 404, 'message' => 'Transaction not found'], 404);
        }
        return response()->json([
            'status' => 200,
            'message' => 'Transaction found',
            'data' => $transaction,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cattle_id' => 'required|exists:cattle,id',
            'buyer_name' => 'required|string|max:255',
            'buyer_phone' => 'nullable|string|max:50',
            'buyer_address' => 'nullable|string|max:500',
            'total_amount' => 'required|integer|min:1',
            'dp_amount' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|max:100',
            'status' => 'required|string|in:Lunas,DP Terbayar,Menunggu Konfirmasi',
            'transaction_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $invoiceNumber = '#INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

        $transaction = Transaction::create([
            'invoice_number' => $invoiceNumber,
            'cattle_id' => $request->cattle_id,
            'buyer_name' => $request->buyer_name,
            'buyer_phone' => $request->buyer_phone,
            'buyer_address' => $request->buyer_address,
            'total_amount' => $request->total_amount,
            'dp_amount' => $request->dp_amount ?? 0,
            'payment_method' => $request->payment_method,
            'status' => $request->status,
            'transaction_date' => $request->transaction_date ?? now()->toDateString(),
            'notes' => $request->notes,
        ]);

        $cattle = Cattle::find($request->cattle_id);
        if ($cattle) {
            if ($request->status === 'Lunas') {
                $cattle->update(['status' => 'Terjual']);
            } elseif ($request->status === 'DP Terbayar') {
                $cattle->update(['status' => 'Booked']);
            }
        }

        $transaction->load('cattle');

        return response()->json([
            'status' => 201,
            'message' => 'Transaction created successfully',
            'data' => $transaction,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['status' => 404, 'message' => 'Transaction not found'], 404);
        }

        $request->validate([
            'buyer_name' => 'sometimes|string|max:255',
            'buyer_phone' => 'nullable|string|max:50',
            'buyer_address' => 'nullable|string|max:500',
            'total_amount' => 'sometimes|integer|min:1',
            'dp_amount' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|max:100',
            'status' => 'sometimes|string|in:Lunas,DP Terbayar,Menunggu Konfirmasi',
            'transaction_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->reconcileCattleStatus($transaction->cattle_id);

        $transaction->load('cattle');

        return response()->json([
            'status' => 200,
            'message' => 'Transaction updated successfully',
            'data' => $transaction,
        ]);
    }

    public function destroy($id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['status' => 404, 'message' => 'Transaction not found'], 404);
        }

        $cattleId = $transaction->cattle_id;
        $transaction->delete();

        $this->reconcileCattleStatus($cattleId);

        return response()->json([
            'status' => 200,
            'message' => 'Transaction deleted successfully',
        ]);
    }

    /**
     * Recompute a cattle's status based on its live transactions so it never
     * stays 'Terjual'/'Booked' after the supporting transaction is changed or removed.
     */
    private function reconcileCattleStatus($cattleId): void
    {
        $cattle = Cattle::find($cattleId);
        if (!$cattle) {
            return;
        }

        $hasLunas = Transaction::where('cattle_id', $cattleId)
            ->where('status', 'Lunas')
            ->exists();
        $hasDp = Transaction::where('cattle_id', $cattleId)
            ->where('status', 'DP Terbayar')
            ->exists();

        $newStatus = $hasLunas ? 'Terjual' : ($hasDp ? 'Booked' : 'Tersedia');

        if ($cattle->status !== $newStatus) {
            $cattle->update(['status' => $newStatus]);
        }
    }

    public function summary()
    {
        $lunas = Transaction::where('status', 'Lunas');
        $dpTerbayar = Transaction::where('status', 'DP Terbayar');

        $totalRevenue = (clone $lunas)->sum('total_amount') + (clone $dpTerbayar)->sum('dp_amount');
        $soldCount = (clone $lunas)->count();
        $pendingCount = $dpTerbayar->count();
        $potentialPendingAmount = Transaction::where('status', 'DP Terbayar')
            ->selectRaw('SUM(total_amount - dp_amount) as remaining')
            ->value('remaining') ?? 0;
        $avgTransaction = Transaction::where('status', 'Lunas')->avg('total_amount') ?? 0;

        return response()->json([
            'status' => 200,
            'message' => 'Summary retrieved',
            'data' => [
                'total_revenue' => (int) $totalRevenue,
                'sold_count' => $soldCount,
                'pending_count' => $pendingCount,
                'potential_pending_amount' => (int) $potentialPendingAmount,
                'avg_transaction' => (int) round($avgTransaction),
            ],
        ]);
    }
}
