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
        // 支付订单表
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no', 64)->index()->comment('订单号'); // 订单号
            $table->uuid('tenant_id')->index()->comment('租户');
            $table->bigInteger('account_id')->index()->comment('账户id'); // 账户id
            $table->decimal('total_amount', 15, 2)->default(0)->comment('总金额'); // 总金额
            $table->decimal('discount_amount', 15, 2)->default(0)->comment('优惠金额'); // 优惠金额
            $table->decimal('payable_amount', 15, 2)->default(0)->comment('应付金额'); // 应付金额
            $table->decimal('paid_amount', 15, 2)->default(0)->comment('已付金额'); // 已付金额
            $table->string('currency', 8)->default('CNY')->comment('货币代码'); // 货币代码
            $table->string('order_status', 16)->default('pending')->comment('订单状态'); // 订单状态: pending, paid, cancelled, refunded, failed

            $table->jsonb('items')->comment('商品JSON信息'); // 商品信息
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
        Schema::dropIfExists('orders');
    }
};
