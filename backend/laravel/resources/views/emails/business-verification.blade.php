<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Business Verification - Patna Finder</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                        <td style="background-color:#1d4ed8;padding:20px 28px;">
                            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Patna Finder</h1>
                            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Business Verification Update</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @if($action === 'verified')
                                <h2 style="margin:0 0 12px;color:#065f46;font-size:18px;">🎉 Congratulations! Your business is now verified</h2>
                                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                                    Your business <strong>{{ $business->name }}</strong> has been verified by our team.
                                </p>
                                @if($methodLabel)
                                    <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                        <strong>Verification Method:</strong> {{ $methodLabel }}
                                    </p>
                                @endif
                                <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                    <strong>Verified On:</strong> {{ now()->format('d M Y, h:i A') }}
                                </p>
                                @if($note)
                                    <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                        <strong>Remarks:</strong> {{ $note }}
                                    </p>
                                @endif
                                <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.6;">
                                    A verified <span style="color:#3b82f6;font-weight:bold;">✓ badge</span> will now be shown on your listing, which builds trust and brings more customers to your business.
                                </p>
                            @else
                                <h2 style="margin:0 0 12px;color:#991b1b;font-size:18px;">Verification removed</h2>
                                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                                    The verified badge for your business <strong>{{ $business->name }}</strong> has been removed by our team.
                                </p>
                                @if($note)
                                    <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                        <strong>Reason:</strong> {{ $note }}
                                    </p>
                                @endif
                                <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.6;">
                                    If you believe this was a mistake or your business details have changed, please contact our support team for re-verification.
                                </p>
                            @endif

                            <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
                                Thank you,<br>
                                Team Patna Finder
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;color:#9ca3af;font-size:11px;">
                                You are receiving this email because you are the owner of this business listing on Patna Finder.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
