import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const fromEmail = process.env.MAIL_FROM || "no-reply@example.com"

export function getTransport() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS")
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

export async function sendOtpEmail(to: string, code: string) {
  const transport = getTransport()
  const subject = "Your verification code"
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Verify your email</h2>
      <p>Use the following code to verify your email address:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `
  await transport.sendMail({ from: fromEmail, to, subject, html })
}



