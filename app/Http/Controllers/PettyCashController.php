<?php

namespace App\Http\Controllers;

use App\Models\PettyCashCategory;
use App\Models\PettyCashTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PettyCashController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        $transactions = PettyCashTransaction::with('category')
            ->forUser($user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $categories = PettyCashCategory::all();
        
        $totalIncome = PettyCashTransaction::forUser($user->id)
            ->income()
            ->sum('amount');
            
        $totalExpenses = PettyCashTransaction::forUser($user->id)
            ->expense()
            ->sum('amount');
            
        $balance = $totalIncome - $totalExpenses;
        
        $recentTransactions = PettyCashTransaction::with('category')
            ->forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        return Inertia::render('dashboard', [
            'transactions' => $transactions,
            'categories' => $categories,
            'summary' => [
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'balance' => $balance,
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
    
    public function reports(): Response
    {
        $user = Auth::user();
        
        $transactions = PettyCashTransaction::with('category')
            ->forUser($user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $categories = PettyCashCategory::all();
        
        return Inertia::render('reports', [
            'transactions' => $transactions,
            'categories' => $categories,
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'used_by' => 'nullable|string|max:255',
            'category_id' => 'required|exists:petty_cash_categories,id',
            'transaction_type' => 'required|in:income,expense',
            'date' => 'required|date',
            'receipt' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        $validated['user_id'] = Auth::id();
        
        // Handle receipt file upload
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
            $validated['receipt_path'] = $receiptPath;
        }
        
        PettyCashTransaction::create($validated);
        
        return Redirect::back()->with('success', 'Transaction added successfully!');
    }
    
    public function update(Request $request, PettyCashTransaction $transaction)
    {
        // Ensure user can only update their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'used_by' => 'nullable|string|max:255',
            'category_id' => 'required|exists:petty_cash_categories,id',
            'transaction_type' => 'required|in:income,expense',
            'date' => 'required|date',
            'receipt' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        // Handle receipt file upload
        if ($request->hasFile('receipt')) {
            // Delete old receipt if exists
            if ($transaction->receipt_path && Storage::disk('public')->exists($transaction->receipt_path)) {
                Storage::disk('public')->delete($transaction->receipt_path);
            }
            
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
            $validated['receipt_path'] = $receiptPath;
        }
        
        $transaction->update($validated);
        
        return Redirect::back()->with('success', 'Transaction updated successfully!');
    }
    
    public function destroy(PettyCashTransaction $transaction)
    {
        // Ensure user can only delete their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }
        
        // Delete receipt file if exists
        if ($transaction->receipt_path && Storage::disk('public')->exists($transaction->receipt_path)) {
            Storage::disk('public')->delete($transaction->receipt_path);
        }
        
        $transaction->delete();
        
        return Redirect::back()->with('success', 'Transaction deleted successfully!');
    }
    
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);
        
        PettyCashCategory::create($validated);
        
        return Redirect::back()->with('success', 'Category created successfully!');
    }
    
    public function updateCategory(Request $request, PettyCashCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);
        
        $category->update($validated);
        
        return Redirect::back()->with('success', 'Category updated successfully!');
    }
    
    public function destroyCategory(PettyCashCategory $category)
    {
        // Check if category has transactions
        if ($category->transactions()->count() > 0) {
            return Redirect::back()->with('error', 'Cannot delete category with existing transactions.');
        }
        
        $category->delete();
        
        return Redirect::back()->with('success', 'Category deleted successfully!');
    }
}
