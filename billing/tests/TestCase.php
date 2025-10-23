<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected $internalApiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->internalApiKey = env('INTERNAL_API_KEY', '');
    }

    protected function withInternalApiKey()
    {
        return $this->withHeaders([
            'X-API-Key' => $this->internalApiKey
        ]);
    }
}
