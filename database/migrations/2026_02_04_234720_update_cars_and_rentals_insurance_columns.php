<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            if (!Schema::hasColumn('cars', 'insurance_per_day')) {
                $table->decimal('insurance_per_day', 8, 2)->default(0)->after('price_per_day');
            }
        });

        Schema::table('rentals', function (Blueprint $table) {
            if (!Schema::hasColumn('rentals', 'use_extra_insurance')) {
                $table->boolean('use_extra_insurance')->default(false)->after('insurance_price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn('insurance_per_day');
        });

        Schema::table('rentals', function (Blueprint $table) {
            $table->dropColumn('use_extra_insurance');
        });
    }
};
