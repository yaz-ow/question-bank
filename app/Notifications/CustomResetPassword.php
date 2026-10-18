<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Support\Facades\URL;

class CustomResetPassword extends BaseResetPassword
{
    protected function resetUrl($notifiable)
    {
        $route = $notifiable->role === 'student'
            ? 'password-reset.student'
            : 'password-reset.admin';

        // Never let an incoming Host header choose where a reset token is sent.
        // The password broker validates the token and its expiry on submission.
        return rtrim(config('app.url'), '/').URL::route($route, [
            'token' => $this->token,
            'email' => $notifiable->email,
        ], false);
    }
}
