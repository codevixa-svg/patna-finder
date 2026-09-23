<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document Update - Patna Finder</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                        <td style="background-color:#1d4ed8;padding:20px 28px;">
                            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Patna Finder</h1>
                            <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Verification Document Update</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @if($document->status === 'approved')
                                <h2 style="margin:0 0 12px;color:#065f46;font-size:18px;">✅ Document Approved</h2>
                            @else
                                <h2 style="margin:0 0 12px;color:#991b1b;font-size:18px;">❌ Document Rejected</h2>
                            @endif

                            <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                <strong>Business:</strong> {{ $business->name }}
                            </p>
                            <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                <strong>Document:</strong> {{ $document->doc_type_label }}
                                @if($document->original_name)({{ $document->original_name }})@endif
                            </p>
                            @if($document->review_note)
                                <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                    <strong>{{ $document->status === 'approved' ? 'Note' : 'Reason' }}:</strong> {{ $document->review_note }}
                                </p>
                            @endif
                            @if($document->expires_at)
                                <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                                    <strong>Valid Till:</strong> {{ $document->expires_at->format('d M Y') }}
                                </p>
                            @endif

                            @if($document->status === 'approved')
                                <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.6;">
                                    Aapka document review ho gaya hai. Verification process aage badhega.
                                </p>
                            @else
                                <p style="margin:16px 0 0;color:#374151;font-size:14px;line-height:1.6;">
                                    Kripya sahi document upload karein taaki verification process aage badhe.
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
