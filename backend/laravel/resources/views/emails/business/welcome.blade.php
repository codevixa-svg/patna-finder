<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Patna Finder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #f97316; padding: 30px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Patna Finder!</h1>
                        </td>
                    </tr>
                    
                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                                Dear {{ $user->name }},
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                                Congratulations! Your business <strong style="color: #f97316;">{{ $business->name }}</strong> has been successfully registered on Patna Finder and is now live on our platform.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Business Details -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #fef3c7; border-left: 4px solid #f97316; padding: 15px; border-radius: 4px;">
                                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #92400e;">Your Business Details</h2>
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;"><strong>Business Name:</strong></td>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;">{{ $business->name }}</td>
                                    </tr>
                                    @if($business->category)
                                    <tr>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;"><strong>Category:</strong></td>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;">{{ $business->category->name }}</td>
                                    </tr>
                                    @endif
                                    @if($business->phone)
                                    <tr>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;"><strong>Phone:</strong></td>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;">{{ $business->phone }}</td>
                                    </tr>
                                    @endif
                                    @if($business->address)
                                    <tr>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0; vertical-align: top;"><strong>Address:</strong></td>
                                        <td style="font-size: 14px; color: #92400e; padding: 5px 0;">{{ $business->address }}@if($business->area), {{ $business->area->name }}@endif</td>
                                    </tr>
                                    @endif
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Set Password Instructions -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #374151;">Set Your Password</h2>
                            <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                To access your business dashboard, you'll need to set a password for your account. Click the button below to get started:
                            </p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="{{ $frontendUrl }}/dashboard/forgot-password" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">Set Your Password</a>
                            </div>
                            <p style="margin: 15px 0 0 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
                                Or copy and paste this link into your browser:<br>
                                <a href="{{ $frontendUrl }}/dashboard/forgot-password" style="color: #f97316; word-break: break-all;">{{ $frontendUrl }}/dashboard/forgot-password</a>
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
                                Enter your email address (<strong>{{ $user->email }}</strong>) on the password reset page to receive instructions.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Dashboard Features -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #374151;">What You Can Do</h2>
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                                Once you set your password and log in, you'll be able to:
                            </p>
                            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #6b7280;">
                                <li>Update your business details and information</li>
                                <li>Add photos and videos to showcase your business</li>
                                <li>Manage your services and pricing</li>
                                <li>Respond to customer reviews</li>
                                <li>Track your business analytics and insights</li>
                            </ul>
                        </td>
                    </tr>
                    
                    <!-- Support -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                    Need help? Our support team is here to assist you. Contact us at 
                                    <a href="mailto:support@patnafinder.com" style="color: #f97316; text-decoration: none;">support@patnafinder.com</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 20px 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af;">
                                Thank you for choosing Patna Finder!
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                                &copy; {{ date('Y') }} Patna Finder. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
