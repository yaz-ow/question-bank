<?php

namespace Tests\Feature;

use Tests\TestCase;

class LoginRouteTest extends TestCase
{
    #[\PHPUnit\Framework\Attributes\Test]
    public function login_route_exists()
    {
        $response = $this->get('/login/admin');
        $response->assertOk();
    }
}