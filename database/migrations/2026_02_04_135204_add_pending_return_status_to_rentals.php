<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE rentals
            DROP CONSTRAINT IF EXISTS rentals_status_check;
        ");

        DB::statement("
            ALTER TABLE rentals
            ADD CONSTRAINT rentals_status_check
            CHECK (status IN ('reserved', 'active', 'completed', 'cancelled', 'early_return', 'pending_return'))
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE rentals
            DROP CONSTRAINT IF EXISTS rentals_status_check;
        ");

        DB::statement("
            ALTER TABLE rentals
            ADD CONSTRAINT rentals_status_check
            CHECK (status IN ('reserved', 'active', 'completed', 'cancelled', 'early_return'))
        ");
    }
};
