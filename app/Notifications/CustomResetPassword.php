<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomResetPassword extends BaseResetPassword
{
    /**
     * Get the reset URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function resetUrl($notifiable)
    {
        if (property_exists($notifiable, 'role')) {
            if ($notifiable->role === 'student') {
                return URL::temporarySignedRoute(
                    'password-reset.student', Carbon::now()->addMinutes(60), ['token' => $this->token]
                );
            } elseif (in_array($notifiable->role, ['instructor', 'admin'])) {
                return URL::temporarySignedRoute(
                    'password-reset.admin', Carbon::now()->addMinutes(60), ['token' => $this->token]
                );
            }
        }

        // Fallback to student route if role is not recognized
        return URL::temporarySignedRoute(
            'password-reset.student', Carbon::now()->addMinutes(60), ['token' => $this->token]
        );
    }
}