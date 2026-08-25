import nodemailer from 'nodemailer'

import { env } from '../../config/env.js'
import { AppError } from '../../http/app-error.js'

function getTransporter() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_USER ||
    !env.SMTP_PASSWORD ||
    !env.SMTP_FROM
  ) {
    throw new AppError(
      'EMAIL_SERVICE_NOT_CONFIGURED',
      503,
      'O serviço de e-mail não está configurado.',
    )
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,

    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  })
}

interface SendPasswordResetCodeInput {
  email: string
  name: string
  code: string
}

export async function sendPasswordResetCode(input: SendPasswordResetCodeInput) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.email,
    subject: 'Código para redefinição de senha - FightOps',

    text: [
      `Olá, ${input.name}.`,
      '',
      `Seu código para redefinição de senha é: ${input.code}`,
      '',
      `O código expira em ${env.PASSWORD_RESET_CODE_EXPIRATION_MINUTES} minutos.`,
      '',
      'Se você não solicitou esta alteração, ignore este e-mail.',
    ].join('\n'),

    html: `
      <h2>Redefinição de senha</h2>

      <p>Olá, ${input.name}.</p>

      <p>Use o código abaixo para continuar a redefinição da sua senha:</p>

      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">
        ${input.code}
      </p>

      <p>
        Este código expira em
        ${env.PASSWORD_RESET_CODE_EXPIRATION_MINUTES}
        minutos.
      </p>

      <p>
        Se você não solicitou esta alteração,
        ignore este e-mail.
      </p>
    `,
  })
}