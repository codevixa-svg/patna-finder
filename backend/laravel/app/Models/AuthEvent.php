<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthEvent extends Model
{
    public const LOGIN_SUCCESS = 'login_success';
    public const LOGIN_FAILED = 'login_failed';
    public const LOCKED_OUT = 'locked_out';
    public const MFA_CHALLENGE = 'mfa_challenge';
    public const MFA_VERIFIED = 'mfa_verified';
    public const MFA_FAILED = 'mfa_failed';
    public const LOGOUT = 'logout';
    public const LOGOUT_ALL = 'logout_all';
    public const PASSWORD_CHANGED = 'password_changed';
    public const MFA_ENABLED = 'mfa_enabled';
    public const MFA_DISABLED = 'mfa_disabled';
    public const TOTP_SETUP = 'totp_setup';
    public const REGISTER = 'register';

    protected $fillable = ['user_id', 'email', 'event', 'ip_address', 'user_agent'];
}
