<?php

namespace Database\Seeders;

use App\Models\PettyCashCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PettyCashCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            ['name' => 'Sales Revenue', 'type' => 'income', 'color' => '#10B981'],
            ['name' => 'Refunds', 'type' => 'income', 'color' => '#059669'],
            ['name' => 'Interest', 'type' => 'income', 'color' => '#047857'],
            ['name' => 'Other Income', 'type' => 'income', 'color' => '#065F46'],
            
            // Expense Categories
            ['name' => 'Office Supplies', 'type' => 'expense', 'color' => '#EF4444'],
            ['name' => 'Travel', 'type' => 'expense', 'color' => '#DC2626'],
            ['name' => 'Meals & Entertainment', 'type' => 'expense', 'color' => '#B91C1C'],
            ['name' => 'Transportation', 'type' => 'expense', 'color' => '#991B1B'],
            ['name' => 'Utilities', 'type' => 'expense', 'color' => '#7F1D1D'],
            ['name' => 'Maintenance', 'type' => 'expense', 'color' => '#F97316'],
            ['name' => 'Marketing', 'type' => 'expense', 'color' => '#EA580C'],
            ['name' => 'Other Expenses', 'type' => 'expense', 'color' => '#9A3412'],
        ];
        
        foreach ($categories as $category) {
            PettyCashCategory::create($category);
        }
    }
}
