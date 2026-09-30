import 'server-only';
import nodemailer from 'nodemailer';

type Mail = { to: string; subject: string; text: string; replyTo?: string };

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

/**
 * Envoi « au mieux » : une panne SMTP ne doit jamais faire échouer
 * l'enregistrement d'une demande (déjà sauvegardée en base).
 */
export async function sendMail(mail: Mail) {
  const t = getTransporter();
  if (!t) {
    console.info(`[mail:dev] → ${mail.to} | ${mail.subject}\n${mail.text}`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM, ...mail });
  } catch (err) {
    console.error('[mail] échec d’envoi', { to: mail.to, subject: mail.subject, err: (err as Error).message });
  }
}
