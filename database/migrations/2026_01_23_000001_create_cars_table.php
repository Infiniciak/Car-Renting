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
        if (!Schema::hasTable('cars')) {
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
                ->onDelete('set null');

            $table->timestamps();
        });
        } else {
            Schema::table('cars', function (Blueprint $table) {
                $columns = [
                    'year' => fn() => $table->integer('year')->after('model')->nullable(),
                    'type' => fn() => $table->string('type')->after('registration_number')->nullable(),
                    'fuel_type' => fn() => $table->string('fuel_type')->after('type')->nullable(),
                    'transmission' => fn() => $table->string('transmission')->after('fuel_type')->nullable(),
                    'seats' => fn() => $table->integer('seats')->after('transmission')->nullable(),
                    'status' => fn() => $table->string('status')->default('available')->after('seats'),
                    'image_path' => fn() => $table->string('image_path')->nullable()->after('status'),
                    'description' => fn() => $table->text('description')->nullable()->after('image_path'),
                    'insurance_per_day' => fn() => $table->decimal('insurance_per_day', 10, 2)->default(0),
                    'has_gps' => fn() => $table->boolean('has_gps')->default(false),
                    'has_air_conditioning' => fn() => $table->boolean('has_air_conditioning')->default(true),
                    'discount_percentage' => fn() => $table->decimal('discount_percentage', 5, 2)->default(0),
                ];

                foreach ($columns as $name => $callback) {
                    if (!Schema::hasColumn('cars', $name)) {
                        $callback();
                    }
                }
            });
        }
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
