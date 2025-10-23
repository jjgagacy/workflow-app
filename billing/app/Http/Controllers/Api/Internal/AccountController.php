<?php
namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;

class AccountController extends Controller
{
    public function inFreeze()
    {
        return response()->api(['in_freeze' => false], '账户状态正常');
    }
}
