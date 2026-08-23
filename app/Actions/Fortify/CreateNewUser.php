<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    /** Usernames are emails: registration takes email + password, nothing else. */
    public function create(array $input): User
    {
        Validator::make($input, [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ])->validate();

        return User::create([
            'name' => strstr($input['email'], '@', true) ?: $input['email'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);
    }
}
