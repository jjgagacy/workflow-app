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
        // 租户发票
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id')->index()->comment('租户');
            $table->enum('invoice_attr', ['individual', 'company'])->default('individual')->comment('发票属性'); // 发票属性：个人，公司
            $table->enum('invoice_type', ['regular', 'vat_special'])->default('regular')->comment('发票类型'); // 发票类型：普通发票，增值税专用发票
            $table->string('invoice_title')->comment('发票抬头'); // 发票抬头
            $table->string('invoice_code')->comment('纳税人识别号'); // 纳税人识别号
            $table->string('account_number')->comment('银行账号'); // 银行账号
            $table->string('opening_bank')->comment('开户行');  // 开户行
            $table->string('tax_no')->comment('税号'); // 税号
            $table->string('telephone')->comment('电话'); // 电话
            $table->string('register_address')->comment('注册地址'); // 注册地址
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
