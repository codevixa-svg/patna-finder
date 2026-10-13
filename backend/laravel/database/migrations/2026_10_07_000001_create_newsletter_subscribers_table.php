<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Newsletter subscribers — collected from the footer, blog and events
     * newsletter forms, managed (and mailed) from the admin panel.
     */
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->string('source')->default('footer'); // footer | blog | events | admin
            $table->string('status')->default('active'); // active | unsubscribed
            $table->string('token', 64)->unique();       // unsubscribe link token
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
