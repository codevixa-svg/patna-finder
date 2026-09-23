<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->string('doc_type'); // gst, fssai, trade_license, id_proof, signboard_photo, other
            $table->string('doc_name')->nullable(); // Human friendly label
            $table->string('file_path'); // Private storage path (never public)
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reject_reason')->nullable();
            $table->date('expires_at')->nullable(); // License/registration expiry
            $table->timestamp('reminder_sent_at')->nullable(); // 30-day expiry reminder sent
            $table->timestamp('expired_notified_at')->nullable(); // Expired notice sent
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index('expires_at');
            $table->index('doc_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_verification_documents');
    }
};
