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
        // 退款表
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id')->index()->comment('租户');
            $table->bigInteger('payment_id')->comment('原支付记录ID');
            $table->bigInteger('order_id')->comment('订单ID');
            $table->string('refund_no', 64)->index()->comment('退款单号');
            $table->decimal('amount', 15, 2)->comment('退款金额');
            $table->string('reason')->comment('退款原因');
            $table->string('status', 32)->default('pending')->comment('状态'); // pending, processing, succeeded, failed
            $table->string('third_party_refund_no', 128)->comment('第三方退款单号');
            $table->jsonb('third_party_response')->comment('第三方退款返回信息');
            $table->dateTime('refunded_at')->comment('退款成功时间');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
