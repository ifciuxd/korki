import { sendEmail } from './resend';
import { APP_NAME } from '@/lib/constants';

interface InviteEmailParams {
  to: string;
  firstName: string;
  inviteUrl: string;
  role: 'admin' | 'parent' | 'student';
}

const ROLE_LABELS = {
  admin: 'korepetytora',
  parent: 'rodzica',
  student: 'ucznia',
} as const;

export async function sendInviteEmail(params: InviteEmailParams): Promise<void> {
  const { to, firstName, inviteUrl, role } = params;
  const roleLabel = ROLE_LABELS[role];

  const html = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="utf-8">
      <title>Zaproszenie do ${APP_NAME}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <h1 style="color: #1e40af; font-size: 24px;">Witaj ${firstName}!</h1>
      <p>Otrzymałeś zaproszenie do platformy <strong>${APP_NAME}</strong> jako konto ${roleLabel}.</p>
      <p>Kliknij poniższy przycisk, aby dokończyć rejestrację i ustawić hasło:</p>
      <p style="margin: 32px 0;">
        <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
          Dokończ rejestrację
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Lub skopiuj ten link do przeglądarki:<br>
        <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        Link wygaśnie za 7 dni. Jeśli nie spodziewałeś się tego maila, możesz go zignorować.
      </p>
    </body>
    </html>
  `;

  const text = `
Witaj ${firstName}!

Otrzymałeś zaproszenie do platformy ${APP_NAME} jako konto ${roleLabel}.

Aby dokończyć rejestrację, otwórz ten link:
${inviteUrl}

Link wygaśnie za 7 dni.
  `.trim();

  await sendEmail({
    to,
    subject: `Zaproszenie do ${APP_NAME}`,
    html,
    text,
  });
}
