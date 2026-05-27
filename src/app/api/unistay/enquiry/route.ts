import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@casasolutions.com';
const FROM = process.env.EMAIL_FROM ?? 'UniStay <onboarding@resend.dev>';

interface EnquiryBody {
  name: string;
  email: string;
  phone?: string;
  moveIn?: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: EnquiryBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, phone, moveIn, message, propertyId, propertyTitle } = body;

  // Server-side validation
  const errors: Record<string, string> = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!email || !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!message || message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  if (!propertyId || !propertyTitle) errors._form = 'Property information is missing.';

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 422 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://casasolutions.com';
  const propertyUrl = `${siteUrl}/unistay/properties/${propertyId}`;

  try {
    // Send admin notification
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `New Enquiry: ${propertyTitle}`,
      html: adminEmailHtml({ name, email, phone, moveIn, message, propertyTitle, propertyUrl }),
    });

    // Send student confirmation
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `We received your enquiry about ${propertyTitle}`,
      html: confirmationEmailHtml({ name, propertyTitle, propertyUrl }),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return Response.json({ error: 'Failed to send email. Please try again.' }, { status: 502 });
  }
}

function adminEmailHtml(d: {
  name: string; email: string; phone?: string; moveIn?: string;
  message: string; propertyTitle: string; propertyUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
  <div style="background:#1d4ed8;border-radius:8px 8px 0 0;padding:20px 24px;">
    <h1 style="color:#fff;margin:0;font-size:18px;">New Enquiry — UniStay</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
    <h2 style="font-size:16px;margin:0 0 16px;color:#1d4ed8;">${d.propertyTitle}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${d.name}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${d.email}" style="color:#1d4ed8;">${d.email}</a></td></tr>
      ${d.phone ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;">${d.phone}</td></tr>` : ''}
      ${d.moveIn ? `<tr><td style="padding:8px 0;color:#6b7280;">Move-in date</td><td style="padding:8px 0;">${d.moveIn}</td></tr>` : ''}
    </table>
    <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${d.message}</p>
    </div>
    <a href="${d.propertyUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">View Listing</a>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">Reply directly to this email to respond to the student.</p>
  </div>
</body>
</html>`;
}

function confirmationEmailHtml(d: { name: string; propertyTitle: string; propertyUrl: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
  <div style="background:#1d4ed8;border-radius:8px 8px 0 0;padding:20px 24px;">
    <h1 style="color:#fff;margin:0;font-size:18px;">UniStay — Enquiry Received</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
    <p style="font-size:15px;">Hi ${d.name},</p>
    <p style="font-size:14px;line-height:1.6;color:#374151;">
      Thanks for your enquiry about <strong>${d.propertyTitle}</strong>.
      We&apos;ve received your message and a member of the Casa team will be in touch within 24 hours.
    </p>
    <a href="${d.propertyUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;margin:8px 0 16px;">View the listing</a>
    <p style="font-size:14px;color:#374151;">In the meantime, feel free to <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://casasolutions.com'}/unistay/search" style="color:#1d4ed8;">browse more properties</a>.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
    <p style="font-size:12px;color:#9ca3af;">Casa Consultancy · UniStay · You&apos;re receiving this because you submitted an enquiry on our platform.</p>
  </div>
</body>
</html>`;
}
