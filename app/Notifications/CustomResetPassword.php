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

        // The password broker validates the token and its expiry on submission.
        return URL::route($route, [
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);
    }
}
