<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Short-lived MFA login challenges (like AWS Cognito sessions).
     * Created after successful password check, before second factor is verified.
     */
    public function up(): void
    {
        Schema::create('login_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('token', 128)->unique()->comment('Random challenge token handed to the client');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('method', 20)->comment('email_otp | totp');
            $table->string('code_hash')->nullable()->comment('Hashed email OTP code');
            $table->timestamp('otp_sent_at')->nullable()->comment('For resend throttling');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at')->nullable()->useCurrent();
            $table->timestamp('consumed_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_challenges');
    }
};
