<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(8,28,58,0.08);">
        <div style="background:linear-gradient(135deg,#062B49,#144272);padding:28px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">Patna Finder</h1>
            <p style="color:#9FB6CC;margin:6px 0 0;font-size:13px;">Account Security</p>
        </div>
        <div style="padding:32px;">
            <p style="color:#102A43;font-size:15px;margin:0 0 8px;">Hi {{ $name }},</p>
            <p style="color:#486581;font-size:14px;margin:0 0 20px;">Use this one-time verification code to complete your sign-in:</p>

            <div style="text-align:center;margin:0 0 20px;">
                <span style="display:inline-block;background:#FFF8E1;border:2px dashed #F4B400;border-radius:12px;padding:14px 28px;font-size:32px;letter-spacing:10px;font-weight:bold;color:#0F2744;">{{ $code }}</span>
            </div>

            <p style="color:#486581;font-size:13px;margin:0 0 6px;">&#9203; This code expires in <strong>{{ $minutes }} minutes</strong>.</p>
            <p style="color:#486581;font-size:13px;margin:0;">&#128274; Never share this code. If you didn't request it, someone may be trying to access your account — please change your password immediately.</p>
        </div>
        <div style="background:#F7F9FC;padding:16px 32px;text-align:center;">
            <p style="color:#829AB1;font-size:12px;margin:0;">Patna Finder Security Team</p>
        </div>
    </div>
</body>
</html>
