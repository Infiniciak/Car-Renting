<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // Użytkownik
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Powiązane wypożyczenie (nullable - bo nie każda transakcja to wypożyczenie)
            $table->foreignId('rental_id')
                ->nullable()
                ->constrained('rentals')
                ->onDelete('set null');

            // Punkt wypożyczenia
            $table->foreignId('rental_point_id')
                ->nullable()
                ->constrained('rental_points')
                ->onDelete('set null');

            // Typ transakcji: rental, refund, balance_add, insurance, discount
            $table->string('type');

            // Kwota
            $table->decimal('amount', 10, 2);

            // Saldo użytkownika po transakcji
            $table->decimal('balance_after', 10, 2);

            // Opis
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
