<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\UserController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('check-admin', [AuthController::class, 'checkAdmin']);
    Route::post('firebase-signup', [AuthController::class, 'firebaseSignup']);
});

// User routes (protected with Firebase auth)
Route::prefix('users')->middleware(['firebase.auth'])->group(function () {
    Route::get('me', [UserController::class, 'me']);
    Route::post('profile', [UserController::class, 'updateProfile']);
    Route::get('bookings', [UserController::class, 'getBookings']);
});

// User routes (public - no auth required)
Route::prefix('users')->group(function () {
    Route::get('by-email/{email}', [UserController::class, 'getByEmail']);
});

// Tour routes
Route::prefix('tours')->group(function () {
    // Public routes
    Route::get('/', [TourController::class, 'index']);
    Route::get('{id}', [TourController::class, 'show']);
    
    // Protected routes (require authentication - admin only in future)
    Route::middleware(['firebase.auth'])->group(function () {
        Route::post('/', [TourController::class, 'store']);
        Route::put('{id}', [TourController::class, 'update']);
        Route::delete('{id}', [TourController::class, 'destroy']);
    });
});

// Booking routes
Route::prefix('bookings')->group(function () {
    // Public routes
    Route::get('/', [BookingController::class, 'index']);
    Route::get('{id}', [BookingController::class, 'show']);
    
    // Protected routes (require authentication)
    Route::middleware(['firebase.auth'])->group(function () {
        Route::post('/', [BookingController::class, 'store']);
        Route::put('{id}', [BookingController::class, 'update']);
        Route::put('{id}/status', [BookingController::class, 'updateStatus']);
        Route::delete('{id}', [BookingController::class, 'destroy']);
    });
});

// Exchange Rate routes (admin only in future)
Route::prefix('exchange-rates')->group(function () {
    // Public routes
    Route::get('/', [ExchangeRateController::class, 'index']);
    Route::get('{id}', [ExchangeRateController::class, 'show']);
    
    // Protected routes (require authentication)
    Route::middleware(['firebase.auth'])->group(function () {
        Route::post('/', [ExchangeRateController::class, 'store']);
        Route::put('{id}', [ExchangeRateController::class, 'update']);
        Route::delete('{id}', [ExchangeRateController::class, 'destroy']);
    });
});
