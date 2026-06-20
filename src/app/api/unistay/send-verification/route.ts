import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminAuth } from '@/lib/unistay/firebase-admin';
import { verificationEmailHtml } from '@/lib/unistay/emailTemplate';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { uid, name, email } = await req.json() as { uid: string; name: string; email: string };
  if (!uid || !email) return Response.json({ error: 'Missing uid or email' }, { status: 400 });

  try {
    const verifyUrl = await getAdminAuth().generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/unistay/browse`,
    });

    await transporter.sendMail({
      from:    `"UniStay" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: 'Verify your UniStay account',
      html:    verificationEmailHtml(name, verifyUrl),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('send-verification error:', err);
    return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
