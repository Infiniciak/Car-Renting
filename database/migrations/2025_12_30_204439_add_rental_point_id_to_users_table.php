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
    Schema::table('users', function (Blueprint $table) {
        // Dodajemy klucz obcy. nullable(), bo zwykły 'user' nie musi mieć punktu.
        $table->foreignId('rental_point_id')
              ->nullable()
              ->constrained('rental_points')
              ->onDelete('set null'); 
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['rental_point_id']);
        $table->dropColumn('rental_point_id');
    });
}
};
