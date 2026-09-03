<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CattleController;
use App\Http\Controllers\Api\FarmSettingController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\VisitRequestController;
use App\Http\Controllers\Api\UploadController;

Route::prefix('v1')->group(function () {

    // ── PUBLIC ROUTES ──────────────────────────────────────────
    Route::post('public/login', [AuthController::class, 'login']);
    Route::post('public/register', [AuthController::class, 'register']);

    Route::get('public/cattles', [CattleController::class, 'index']);
    Route::get('public/cattles/{id}', [CattleController::class, 'show']);
    Route::get('public/katalog', [CattleController::class, 'index']);
    Route::get('katalog', [CattleController::class, 'index']);
    Route::get('cattle', [CattleController::class, 'index']);

    Route::get('public/settings', [FarmSettingController::class, 'getSettings']);

    Route::get('public/bank-accounts', [BankAccountController::class, 'getActive']);
    Route::get('public/bank-accounts/active', [BankAccountController::class, 'getActive']);

    Route::post('public/visit-requests', [VisitRequestController::class, 'store']);

    // ── ADMIN ROUTES (protected) ──────────────────────────────
    Route::middleware('admin.auth')->group(function () {

        // Profile
        Route::get('admin/profile', [AuthController::class, 'profile']);
        Route::put('admin/profile', [AuthController::class, 'updateProfile']);
        Route::put('admin/profile/password', [AuthController::class, 'changePassword']);

        // Cattle CRUD
        Route::get('admin/cattles', [CattleController::class, 'adminIndex']);
        Route::get('admin/cattles/{id}', [CattleController::class, 'show']);
        Route::post('admin/cattles', [CattleController::class, 'store']);
        Route::put('admin/cattles/{id}', [CattleController::class, 'update']);
        Route::delete('admin/cattles/{id}', [CattleController::class, 'destroy']);

        // Farm Settings
        Route::get('admin/settings', [FarmSettingController::class, 'getSettings']);
        Route::put('admin/settings', [FarmSettingController::class, 'upsertSettings']);

        // Bank Accounts
        Route::get('admin/bank-accounts', [BankAccountController::class, 'index']);
        Route::get('admin/bank-accounts/{id}', [BankAccountController::class, 'show']);
        Route::post('admin/bank-accounts', [BankAccountController::class, 'store']);
        Route::put('admin/bank-accounts/{id}', [BankAccountController::class, 'update']);
        Route::delete('admin/bank-accounts/{id}', [BankAccountController::class, 'destroy']);

        // Transactions
        Route::get('admin/transactions', [TransactionController::class, 'index']);
        Route::get('admin/transactions/summary', [TransactionController::class, 'summary']);
        Route::get('admin/transactions/{id}', [TransactionController::class, 'show']);
        Route::post('admin/transactions', [TransactionController::class, 'store']);
        Route::put('admin/transactions/{id}', [TransactionController::class, 'update']);
        Route::delete('admin/transactions/{id}', [TransactionController::class, 'destroy']);

        // Notifications (visit requests)
        Route::get('admin/notifications', [VisitRequestController::class, 'index']);
        Route::put('admin/notifications/{id}/read', [VisitRequestController::class, 'markAsRead']);
        Route::delete('admin/notifications/{id}', [VisitRequestController::class, 'destroy']);

        // Upload
        Route::post('admin/upload', [UploadController::class, 'upload']);
    });
});
