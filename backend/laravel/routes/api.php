<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\HiddenGemController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\BusinessController as AdminBusinessController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\AreaController as AdminAreaController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Api\Admin\HiddenGemController as AdminHiddenGemController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\User\AuthController as UserAuthController;
use App\Http\Controllers\Api\User\BusinessController as UserBusinessController;
use App\Http\Controllers\Api\User\DashboardController as UserDashboardController;
use App\Http\Controllers\Api\User\SubscriptionController as UserSubscriptionController;
use App\Http\Controllers\Api\Admin\SubscriptionController as AdminSubscriptionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public API Routes
Route::prefix('v1')->group(function () {
    
    // Search
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/popular-searches', [SearchController::class, 'popularSearches']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/categories/{slug}/businesses', [CategoryController::class, 'businesses']);

    // Areas
    Route::get('/areas', [AreaController::class, 'index']);
    Route::get('/areas/{slug}', [AreaController::class, 'show']);
    Route::get('/areas/{slug}/businesses', [AreaController::class, 'businesses']);

    // Businesses
    Route::get('/businesses', [BusinessController::class, 'index']);
    Route::get('/businesses/trending', [BusinessController::class, 'trending']);
    Route::get('/businesses/featured', [BusinessController::class, 'featured']);
    Route::get('/businesses/hidden-gems', [BusinessController::class, 'hiddenGems']);
    Route::post('/businesses', [BusinessController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/businesses/{slug}', [BusinessController::class, 'show']);
    Route::get('/businesses/{slug}/nearby', [BusinessController::class, 'nearby']);

    // Hidden Gems (Admin Managed)
    Route::get('/hidden-gems', [HiddenGemController::class, 'index']);
    Route::get('/hidden-gems/latest', [HiddenGemController::class, 'latest']);
    Route::get('/hidden-gems/featured', [HiddenGemController::class, 'featured']);
    Route::get('/hidden-gems/{slug}', [HiddenGemController::class, 'show']);
    Route::post('/hidden-gems/{slug}/like', [HiddenGemController::class, 'like']);
    Route::post('/hidden-gems/{slug}/share', [HiddenGemController::class, 'share']);

    // Reviews
    Route::get('/businesses/{slug}/reviews', [ReviewController::class, 'index']);
    Route::post('/businesses/{slug}/reviews', [ReviewController::class, 'store'])->middleware('throttle:10,1');
    Route::post('/reviews/{id}/like', [ReviewController::class, 'like']);

    // Blog (Patna Pulse)
    Route::get('/blog', [BlogController::class, 'index']);
    Route::get('/blog/latest', [BlogController::class, 'latest']);
    Route::get('/blog/categories', [BlogController::class, 'categories']);
    Route::get('/blog/{slug}', [BlogController::class, 'show']);
});

// User Dashboard API Routes
Route::prefix('v1/user')->group(function () {
    // Public user routes (no auth)
    Route::post('/register', [UserAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [UserAuthController::class, 'login'])->middleware('throttle:10,1');

    // Protected user routes (requires auth)
    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth
        Route::get('/me', [UserAuthController::class, 'me']);
        Route::post('/logout', [UserAuthController::class, 'logout']);
        Route::post('/change-password', [UserAuthController::class, 'changePassword']);
        Route::put('/profile', [UserAuthController::class, 'updateProfile']);

        // Dashboard
        Route::get('/dashboard', [UserDashboardController::class, 'index']);
        Route::get('/dashboard/quick-stats', [UserDashboardController::class, 'quickStats']);

        // My Businesses
        Route::get('/businesses', [UserBusinessController::class, 'index']);
        Route::get('/businesses/{id}', [UserBusinessController::class, 'show']);
        Route::post('/businesses', [UserBusinessController::class, 'store']);
        Route::put('/businesses/{id}', [UserBusinessController::class, 'update']);
        Route::delete('/businesses/{id}', [UserBusinessController::class, 'destroy']);
        Route::post('/businesses/draft', [UserBusinessController::class, 'saveDraft']);

        // Image Uploads
        Route::post('/upload-image', [\App\Http\Controllers\Api\User\ImageUploadController::class, 'upload']);
        Route::post('/upload-image-base64', [\App\Http\Controllers\Api\User\ImageUploadController::class, 'uploadBase64']);
        Route::post('/delete-image', [\App\Http\Controllers\Api\User\ImageUploadController::class, 'delete']);

        // Subscriptions / Billing
        Route::post('/subscription/create-order', [UserSubscriptionController::class, 'createOrder']);
        Route::post('/subscription/verify', [UserSubscriptionController::class, 'verifyPayment']);
        Route::get('/subscription/current', [UserSubscriptionController::class, 'currentPlan']);
        Route::post('/subscription/cancel', [UserSubscriptionController::class, 'cancelSubscription']);
        Route::get('/subscription/history', [UserSubscriptionController::class, 'history']);
    });
});

// Admin API Routes
Route::prefix('v1/admin')->group(function () {
    // Public admin routes (no auth)
    Route::post('/login', [AdminAuthController::class, 'login']);

    // Protected admin routes (requires auth + admin role)
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Auth
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::post('/change-password', [AdminAuthController::class, 'changePassword']);

        // Dashboard & Analytics
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/dashboard/quick-stats', [AdminDashboardController::class, 'quickStats']);

        // Hidden Gems GMB Sync (admin only)
        Route::post('/hidden-gems/{slug}/sync-gmb', [HiddenGemController::class, 'syncGmb']);

        // Businesses
        Route::get('/businesses', [AdminBusinessController::class, 'index']);
        Route::post('/businesses', [AdminBusinessController::class, 'store']);
        Route::get('/businesses/{id}', [AdminBusinessController::class, 'show']);
        Route::put('/businesses/{id}', [AdminBusinessController::class, 'update']);
        Route::post('/businesses/{id}/approve', [AdminBusinessController::class, 'approve']);
        Route::post('/businesses/{id}/reject', [AdminBusinessController::class, 'reject']);
        Route::post('/businesses/{id}/feature', [AdminBusinessController::class, 'feature']);
        Route::post('/businesses/{id}/verify', [AdminBusinessController::class, 'verify']);
        Route::post('/businesses/{id}/toggle-trending', [AdminBusinessController::class, 'toggleTrending']);
        Route::post('/businesses/{id}/toggle-sponsored', [AdminBusinessController::class, 'toggleSponsored']);
        Route::delete('/businesses/{id}', [AdminBusinessController::class, 'destroy']);
        Route::post('/businesses/bulk-action', [AdminBusinessController::class, 'bulkAction']);

        // Categories
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);
        Route::post('/categories/{id}/toggle-active', [AdminCategoryController::class, 'toggleActive']);

        // Areas
        Route::get('/areas', [AdminAreaController::class, 'index']);
        Route::post('/areas', [AdminAreaController::class, 'store']);
        Route::get('/areas/{id}', [AdminAreaController::class, 'show']);
        Route::put('/areas/{id}', [AdminAreaController::class, 'update']);
        Route::delete('/areas/{id}', [AdminAreaController::class, 'destroy']);
        Route::post('/areas/{id}/toggle-active', [AdminAreaController::class, 'toggleActive']);

        // Reviews
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::get('/reviews/{id}', [AdminReviewController::class, 'show']);
        Route::post('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::post('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);
        Route::post('/reviews/bulk-action', [AdminReviewController::class, 'bulkAction']);

        // Blog
        Route::get('/blog', [AdminBlogController::class, 'index']);
        Route::post('/blog', [AdminBlogController::class, 'store']);
        Route::get('/blog/{id}', [AdminBlogController::class, 'show']);
        Route::put('/blog/{id}', [AdminBlogController::class, 'update']);
        Route::delete('/blog/{id}', [AdminBlogController::class, 'destroy']);
        Route::post('/blog/{id}/toggle-publish', [AdminBlogController::class, 'togglePublish']);

        // Hidden Gems
        Route::get('/hidden-gems', [AdminHiddenGemController::class, 'index']);
        Route::post('/hidden-gems', [AdminHiddenGemController::class, 'store']);
        Route::get('/hidden-gems/{id}', [AdminHiddenGemController::class, 'show']);
        Route::put('/hidden-gems/{id}', [AdminHiddenGemController::class, 'update']);
        Route::post('/hidden-gems/{id}/feature', [AdminHiddenGemController::class, 'feature']);
        Route::post('/hidden-gems/{id}/toggle-active', [AdminHiddenGemController::class, 'toggleActive']);
        Route::delete('/hidden-gems/{id}', [AdminHiddenGemController::class, 'destroy']);
        Route::post('/hidden-gems/bulk-action', [AdminHiddenGemController::class, 'bulkAction']);

        // Subscriptions
        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
        Route::get('/subscriptions/{id}', [AdminSubscriptionController::class, 'show']);
        Route::post('/subscriptions/{id}/cancel', [AdminSubscriptionController::class, 'cancel']);

        // Users (super_admin only)
        Route::middleware('super_admin')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/{id}', [AdminUserController::class, 'show']);
            Route::put('/users/{id}/role', [AdminUserController::class, 'updateRole']);
            Route::post('/users/{id}/toggle-active', [AdminUserController::class, 'toggleActive']);
            Route::put('/users/{id}/permissions', [AdminUserController::class, 'updatePermissions']);
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        });
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
