<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class BcryptPassword implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (config('hashing.driver') !== 'bcrypt' || ! is_string($value)) {
            return;
        }

        // Bcrypt has a byte limit, so character-count validation is insufficient for UTF-8.
        if (strlen($value) > 72) {
            $fail('كلمة المرور طويلة جدًا؛ قلّل عدد الأحرف أو الرموز.');
        }
        if (str_contains($value, "\0")) {
            $fail('كلمة المرور تحتوي على رمز غير صالح.');
        }
    }
}
