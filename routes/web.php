<?php

use App\Http\Controllers\PettyCashController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [PettyCashController::class, 'index'])->name('dashboard');
    Route::get('reports', [PettyCashController::class, 'reports'])->name('reports');
    
    // Petty Cash Transaction Routes
    Route::post('transactions', [PettyCashController::class, 'store'])->name('transactions.store');
    Route::put('transactions/{transaction}', [PettyCashController::class, 'update'])->name('transactions.update');
    Route::delete('transactions/{transaction}', [PettyCashController::class, 'destroy'])->name('transactions.destroy');
    
    // Petty Cash Category Routes
    Route::post('categories', [PettyCashController::class, 'storeCategory'])->name('categories.store');
    Route::put('categories/{category}', [PettyCashController::class, 'updateCategory'])->name('categories.update');
    Route::delete('categories/{category}', [PettyCashController::class, 'destroyCategory'])->name('categories.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
