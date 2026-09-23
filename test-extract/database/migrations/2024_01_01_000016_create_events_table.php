<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Government Events - Admin managed recent events for Patna / Bihar
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('event_type')->default('other')->comment('kavi-samelan, job-mela, industrial, doctors-camp, it-sector, other');
            $table->string('venue')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->default('Patna');
            $table->date('event_date');
            $table->string('start_time')->nullable();
            $table->string('end_time')->nullable();
            $table->string('organizer')->nullable()->comment('e.g. Bihar Government');
            $table->string('department')->nullable();
            $table->string('featured_image')->nullable();
            $table->string('registration_url')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('event_date');
            $table->index('event_type');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
