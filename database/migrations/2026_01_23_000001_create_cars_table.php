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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('brand'); // marka (np. BMW, Tesla)
            $table->string('model'); // model (np. X5, Model 3)
            $table->integer('year'); // rok produkcji
            $table->string('registration_number')->unique(); // numer rejestracyjny
            $table->string('type'); // typ (sedan, SUV, electric, hatchback)
            $table->string('fuel_type'); // typ paliwa (petrol, diesel, electric, hybrid)
            $table->string('transmission'); // skrzynia biegów (manual, automatic)
            $table->integer('seats'); // liczba miejsc
            $table->decimal('price_per_day', 10, 2); // cena za dzień
            $table->decimal('insurance_per_day', 10, 2)->default(0); // ubezpieczenie za dzień
            $table->string('status')->default('available'); // dostępny/wypożyczony/w serwisie (available/rented/maintenance)
            $table->string('image_path')->nullable(); // zdjęcie samochodu
            $table->text('description')->nullable(); // opis samochodu
            $table->boolean('has_gps')->default(false);
            $table->boolean('has_air_conditioning')->default(true);
            $table->decimal('discount_percentage', 5, 2)->default(0); // promocja % (dla pracownika punktu)

            // Klucz obcy - w którym punkcie jest samochód
            $table->foreignId('rental_point_id')
                ->nullable()
                ->constrained('rental_points')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
