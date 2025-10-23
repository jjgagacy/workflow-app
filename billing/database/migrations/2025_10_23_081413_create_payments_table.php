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
        // 支付表
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->integer('order_id')->index()->comment('订单id');
            $table->uuid('tenant_id')->index()->comment('租户');
            $table->string('payment_no', 64)->comment('支付系统流水号'); // 支付系统流水号
            $table->string('channel', 32)->comment('支付渠道'); // 支付渠道：alipay, wechat, stripe, paypal
            $table->string('method', 16)->comment('支付方式'); // 支付方式：app, web, qrcode...

            $table->decimal('amount', 15, 2)->comment('支付金额'); // 支付金额
            $table->string('currency', 8)->default('CNY')->comment('货币代码'); // 货币代码

            $table->string('status', 16)->default('pending')->comment('支付状态'); // 支付状态：pending, processing, succeeded, failed, cancelled, refunded

            $table->string('third_party_trade_no', 128)->comment('第三方支付交易号'); // 第三方支付交易号
            $table->jsonb('third_party_response')->comment('第三方支付返回的原始响应'); // 第三方支付返回的原始响应
            $table->dateTime('expired_at')->comment('过期时间'); // 过期时间
            $table->dateTime('paid_at')->nullable()->comment('支付时间'); // 支付时间

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
