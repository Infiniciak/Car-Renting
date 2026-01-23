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
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();

            // Unikalny kod
            $table->string('code')->unique();

            // Kwota doładowania
            $table->decimal('amount', 10, 2);

            // Czy kod został użyty
            $table->boolean('used')->default(false);

            // Kto użył kodu (nullable - dopóki nie użyty)
            $table->foreignId('used_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // Kiedy użyto kodu
            $table->timestamp('used_at')->nullable();

            // Kto utworzył kod
            $table->foreignId('created_by_admin_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Data wygaśnięcia
            $table->timestamp('expires_at')->nullable();

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
        Schema::dropIfExists('promo_codes');
    }
};
