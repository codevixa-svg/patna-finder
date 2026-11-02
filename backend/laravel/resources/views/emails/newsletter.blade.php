<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(8,28,58,0.08);">
        <div style="background:linear-gradient(135deg,#062B49,#144272);padding:28px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">Khojya</h1>
            <p style="color:#9FB6CC;margin:6px 0 0;font-size:13px;">Newsletter</p>
        </div>
        <div style="padding:32px;">
            <p style="color:#102A43;font-size:15px;margin:0 0 8px;">
                Hi {{ $subscriberName ?? 'there' }},
            </p>
            <p style="color:#102A43;font-size:17px;font-weight:bold;margin:0 0 16px;">
                {{ $subject }}
            </p>
            <div style="color:#486581;font-size:14px;line-height:1.7;margin:0 0 24px;white-space:pre-wrap;">{{ $body }}</div>

            <div style="text-align:center;margin:0 0 8px;">
                <a href="{{ $unsubscribeUrl }}"
                   style="display:inline-block;background:#F4B400;color:#062B49;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">
                    Visit Khojya
                </a>
            </div>
        </div>
        <div style="background:#F7F9FC;padding:16px 32px;text-align:center;">
            <p style="color:#829AB1;font-size:12px;margin:0 0 6px;">
                You are receiving this email because you subscribed to the Khojya newsletter.
            </p>
            <p style="margin:0;">
                <a href="{{ $unsubscribeUrl }}" style="color:#829AB1;font-size:12px;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <span style="color:#829AB1;font-size:12px;">Patna, Bihar, India</span>
            </p>
        </div>
    </div>
</body>
</html>
