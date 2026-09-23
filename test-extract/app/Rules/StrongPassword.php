<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

/**
 * AWS IAM-style password policy:
 * - Minimum 8 characters (12+ recommended)
 * - At least one uppercase letter, one lowercase letter, one number,
 *   and one special character
 * - Must not contain the email address local-part
 */
class StrongPassword implements Rule
{
    protected string $message = 'Password must be 8+ characters and include uppercase, lowercase, a number, and a special character.';

    public function __construct(protected ?string $email = null) {}

    public function passes($attribute, $value): bool
    {
        if (!is_string($value) || strlen($value) < 8 || strlen($value) > 128) {
            $this->message = 'Password must be at least 8 characters (maximum 128).';
            return false;
        }
        if (!preg_match('/[A-Z]/', $value)) {
            $this->message = 'Password must include at least one uppercase letter.';
            return false;
        }
        if (!preg_match('/[a-z]/', $value)) {
            $this->message = 'Password must include at least one lowercase letter.';
            return false;
        }
        if (!preg_match('/\d/', $value)) {
            $this->message = 'Password must include at least one number.';
            return false;
        }
        if (!preg_match('/[^A-Za-z0-9]/', $value)) {
            $this->message = 'Password must include at least one special character (e.g. !@#$%).';
            return false;
        }

        // Must not contain the email local part (e.g. "john" in john@x.com).
        // Report a SPECIFIC message for this case — the generic complexity message
        // misleads users whose password already meets every complexity rule.
        if ($this->email) {
            $local = strtolower(strtok($this->email, '@') ?: '');
            if ($local && strlen($local) >= 3 && str_contains(strtolower($value), $local)) {
                $this->message = 'Password must not contain your email address or username.';
                return false;
            }
        }

        return true;
    }

    public function message(): string
    {
        return $this->message;
    }
}
