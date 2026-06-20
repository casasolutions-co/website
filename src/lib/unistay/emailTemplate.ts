export function verificationEmailHtml(name: string, verifyUrl: string): string {
  const displayName = name || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your UniStay account</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:22px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">Uni<span style="color:#2563eb;">Stay</span></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

              <!-- Top accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:5px;background:linear-gradient(90deg,#2563eb,#60a5fa);border-radius:20px 20px 0 0;"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:44px 48px 36px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:1.5px;">Welcome aboard</p>
                    <h1 style="margin:0 0 20px;font-size:30px;font-weight:800;color:#0f172a;line-height:1.2;">Hi ${displayName},<br/>verify your email</h1>
                    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;">
                      Thanks for joining UniStay — your platform for finding student housing across Germany.
                      Click the button below to verify your email address and activate your account.
                    </p>

                    <!-- CTA button -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="border-radius:12px;background:#2563eb;">
                          <a href="${verifyUrl}"
                             style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
                            Verify my email &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 28px;font-size:12px;color:#2563eb;word-break:break-all;">
                      <a href="${verifyUrl}" style="color:#2563eb;text-decoration:none;">${verifyUrl}</a>
                    </p>

                    <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 24px;" />

                    <p style="margin:0;font-size:12px;color:#cbd5e1;line-height:1.6;">
                      This link expires in 24 hours. If you didn't create a UniStay account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} UniStay &mdash; a Casa Solutions product
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
