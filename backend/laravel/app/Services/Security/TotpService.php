<?php

namespace App\Services\Security;

/**
 * RFC 6238 TOTP implementation (Google Authenticator / AWS Authenticator compatible).
 * Self-contained — no external packages required.
 */
class TotpService
{
    public const PERIOD = 30;   // seconds
    public const DIGITS = 6;
    public const WINDOW = 1;    // accept ±1 step for clock drift

    /**
     * Generate a random Base32 secret (160-bit, like AWS Cognito TOTP secrets).
     */
    public function generateSecret(int $length = 32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Verify a 6-digit code against the secret (±WINDOW steps).
     */
    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\D/', '', $code) ?? '';
        if (strlen($code) !== self::DIGITS) {
            return false;
        }

        $timestamp = time();
        for ($i = -self::WINDOW; $i <= self::WINDOW; $i++) {
            if (hash_equals($this->at($secret, $timestamp + ($i * self::PERIOD)), $code)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Compute the TOTP code valid at the given timestamp.
     */
    public function at(string $secret, int $timestamp): string
    {
        $counter = intdiv($timestamp, self::PERIOD);
        $binaryKey = $this->base32Decode($secret);
        $counterBinary = pack('N*', 0, $counter);
        $hash = hash_hmac('sha1', $counterBinary, $binaryKey, true);

        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;
        $truncated = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        ) % (10 ** self::DIGITS);

        return str_pad((string) $truncated, self::DIGITS, '0', STR_PAD_LEFT);
    }

    /**
     * otpauth:// URI for authenticator apps / QR codes.
     */
    public function otpauthUri(string $secret, string $email, string $issuer = 'Patna Finder'): string
    {
        return sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d',
            rawurlencode($issuer),
            rawurlencode($email),
            $secret,
            rawurlencode($issuer),
            self::DIGITS,
            self::PERIOD
        );
    }

    private function base32Decode(string $b32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $b32 = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $b32) ?? '');
        $bits = '';
        for ($i = 0, $n = strlen($b32); $i < $n; $i++) {
            $pos = strpos($alphabet, $b32[$i]);
            if ($pos === false) continue;
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $bytes = '';
        foreach (str_split($bits, 8) as $chunk) {
            if (strlen($chunk) === 8) {
                $bytes .= chr(bindec($chunk));
            }
        }
        return $bytes;
    }
}
