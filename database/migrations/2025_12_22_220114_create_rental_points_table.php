<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('rental_points', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('address');
        $table->string('city');
        $table->string('postal_code');
        $table->boolean('has_charging_station')->default(false);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_points');
    }
};
