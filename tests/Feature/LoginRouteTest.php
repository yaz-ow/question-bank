<?php

namespace Tests\Feature;

use Tests\TestCase;

class LoginRouteTest extends TestCase
{
    /** @test */
    public function login_route_exists()
    {
        $response = $this->get('/login/admin');
        $response->assertOk();
    }
}