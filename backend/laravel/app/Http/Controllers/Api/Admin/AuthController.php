<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Admin Login
     * POST /api/v1/admin/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is admin
        if (!$user->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Check if account is active
        if (!$user->is_active) {
            return response()->json([
                'error' => 'Your account has been deactivated.',
            ], 403);
        }

        // Update last login
        $user->updateLastLogin();

        // Create token
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->permissions,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get Authenticated Admin User
     * GET /api/v1/admin/me
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'permissions' => $user->permissions,
            'avatar' => $user->avatar,
            'is_super_admin' => $user->isSuperAdmin(),
            'is_admin' => $user->isAdmin(),
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Logout
     * POST /api/v1/admin/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Change Password
     * POST /api/v1/admin/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
