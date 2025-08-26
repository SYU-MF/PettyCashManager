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
        // Categories are now user-specific, so we don't seed global categories.
        // Users will create their own categories through the application interface.
        // This seeder is kept for potential future use or testing purposes.
    }
}
