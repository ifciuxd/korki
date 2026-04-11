import { Resend } from 'resend';

let _resend: Resend | undefined;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_resend) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email via Resend. If RESEND_API_KEY is not configured,
 * logs the email to the console (dev mode fallback).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? 'noreply@example.com';

  if (!resend) {
    console.log('\n========================================');
    console.log('📧 EMAIL (dev mode — RESEND_API_KEY not set)');
    console.log('----------------------------------------');
    console.log(`From:    ${from}`);
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('----------------------------------------');
    console.log(options.text ?? options.html);
    console.log('========================================\n');
    return;
  }

  await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
