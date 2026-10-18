<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Rules\BcryptPassword;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateFounder extends Command
{
    protected $signature = 'app:create-founder';

    protected $description = 'Create the first founder account without default credentials';

    public function handle(): int
    {
        if (User::where('role', 'admin')->exists()) {
            $this->error('A founder already exists. No accounts were changed.');

            return self::FAILURE;
        }

        $data = [
            'name' => $this->ask('Founder name'),
            'email' => $this->ask('Founder email'),
            'password' => $this->secret('Password (at least 12 characters)'),
            'password_confirmation' => $this->secret('Confirm password'),
        ];
        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(12), new BcryptPassword],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->info('Founder account created. Sign in through the administration portal.');

        return self::SUCCESS;
    }
}
