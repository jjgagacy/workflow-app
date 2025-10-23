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
        Schema::create('payment_channels', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 32)->comment('支付渠道'); // 支付渠道：alipay, wechat, stripe, paypal
            $table->string('channel_name', 32)->comment('渠道名称'); // 渠道名称
            $table->jsonb('configs')->comment('渠道配置JSON'); // 渠道配置JSON，加密存储
            $table->boolean('enabled')->default(false)->comment('是否启用'); // 是否启用
            $table->integer('sort_order')->default(0)->comment('排序'); // 排序
            $table->json('support_currencies')->nullable()->comment('支持的货币'); // 支持的货币
            $table->json('support_methods')->nullable()->comment('支持的支付方式'); // 支持的支付方式
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_channels');
    }
};
