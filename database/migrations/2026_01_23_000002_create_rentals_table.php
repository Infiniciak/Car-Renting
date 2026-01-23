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
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();

            // Kto wypożyczył
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Jaki samochód
            $table->foreignId('car_id')
                ->constrained('cars')
                ->onDelete('cascade');

            // Punkt początkowy (skąd wypożyczył)
            $table->foreignId('rental_point_start_id')
                ->constrained('rental_points')
                ->onDelete('cascade');

            // Punkt końcowy (gdzie oddał) - nullable bo może jeszcze nie oddał
            $table->foreignId('rental_point_end_id')
                ->nullable()
                ->constrained('rental_points')
                ->onDelete('set null');

            // Daty
            $table->dateTime('start_date'); // kiedy wypożyczył
            $table->dateTime('planned_end_date'); // kiedy planował oddać
            $table->dateTime('actual_end_date')->nullable(); // kiedy faktycznie oddał

            // Finansowe
            $table->decimal('distance_km', 10, 2)->default(0); // odległość między punktami
            $table->decimal('base_price', 10, 2); // cena bazowa (dni * price_per_day)
            $table->decimal('insurance_price', 10, 2)->default(0); // koszt ubezpieczenia
            $table->decimal('distance_fee', 10, 2)->default(0); // opłata za odległość
            $table->decimal('discount_amount', 10, 2)->default(0); // rabat z promocji
            $table->decimal('total_price', 10, 2); // końcowa cena
            $table->decimal('refund_amount', 10, 2)->default(0); // zwrot przy wcześniejszym zwrocie

            // Status wypożyczenia
            $table->string('status')->default('active');

            // Które to wypożyczenie użytkownika
            $table->integer('user_rental_count')->default(1);

            // Dodatkowe informacje
            $table->text('notes')->nullable(); // uwagi
            $table->text('cancellation_reason')->nullable(); // powód anulowania

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
