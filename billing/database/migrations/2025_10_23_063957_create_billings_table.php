<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 租户账单订阅表
        Schema::create('billings', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id')->index()->comment('租户');
            $table->boolean('billing_enabled')->default(false)->comment('是否开启账单');
            $table->boolean('can_replace_logo')->default(false)->comment('是否可以替换logo');
            $table->integer('knowledge_rate_limit')->comment('知识调用限制');
            $table->jsonb('subscriptions')->nullable();
            $table->jsonb('members')->nullable();
            $table->jsonb('apps')->nullable();
            $table->jsonb('vector_space')->nullable();
            $table->jsonb('documents_upload_quota')->nullable();
            $table->jsonb('annotation_quota_limit')->nullable();
            $table->jsonb('docs_processing')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
