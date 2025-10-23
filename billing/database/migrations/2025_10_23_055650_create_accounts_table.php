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
        // 账户表
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('email', 64)->index()->comment('邮箱');
            $table->string('name', 32)->comment('账户姓名');
            $table->dateTime('email_verified_at')->nullable()->comment('邮箱验证日期');
            $table->enum('status', ['normal', 'freeze'])->default('normal')->comment('账户状态');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
