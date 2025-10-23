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
        // 用于接收第三方支付回调
        Schema::create('payment_notifications', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('payment_id')->comment('原支付记录ID');
            $table->string('channel', 32)->comment('支付渠道'); // 支付渠道：alipay, wechat, stripe, paypal
            $table->jsonb('notification_data')->comment('原始通知数据');
            $table->boolean('processed')->default(false)->comment('是否已处理');
            $table->string('process_result', 16)->comment('处理结果'); // success, failed
            $table->string('process_message')->comment('处理消息');
            $table->dateTime('processed_at')->comment('处理完成时间');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_notifications');
    }
};
