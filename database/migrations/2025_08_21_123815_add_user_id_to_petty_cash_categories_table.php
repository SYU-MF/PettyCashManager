<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if user_id column already exists
        if (!Schema::hasColumn('petty_cash_categories', 'user_id')) {
            Schema::table('petty_cash_categories', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade')->after('id');
            });
        }
        
        // Get the first user ID to assign existing categories to
        $firstUserId = \Illuminate\Support\Facades\DB::table('users')->first()?->id;
        
        if ($firstUserId) {
            // Update existing categories to belong to the first user
            \Illuminate\Support\Facades\DB::table('petty_cash_categories')
                ->whereNull('user_id')
                ->update(['user_id' => $firstUserId]);
        }
        
        // Make user_id non-nullable after updating existing records
        if (Schema::hasColumn('petty_cash_categories', 'user_id')) {
            Schema::table('petty_cash_categories', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('petty_cash_categories', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
