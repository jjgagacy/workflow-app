<?php
namespace Tests\Feature\Api;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountTest extends TestCase
{
    public function test_account_in_freeze()
    {
        $response = $this->withInternalApiKey()->get('/api/account/in-freeze');
        $response->assertStatus(200);
    }
}
