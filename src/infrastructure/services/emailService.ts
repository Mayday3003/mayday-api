import { Resend } from 'resend';

export class EmailService {
  private static resendClient: Resend | null = null;

  private static getClient(): Resend | null {
    if (!this.resendClient) {
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY no está configurada. El correo se registrará en consola.');
        return null;
      }
      this.resendClient = new Resend(apiKey);
    }
    return this.resendClient;
  }

  /**
   * 1. Correo de Bienvenida al registrar una nueva cuenta
   */
  static async sendWelcomeEmail(name: string, email: string): Promise<void> {
    const client = this.getClient();
    const subject = '❀ ¡Bienvenida/o a Mayday! ❀';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09131d; color: #f0f6fb; padding: 40px 30px; border-radius: 20px; border: 1px solid rgba(122, 159, 184, 0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.1em; color: #7a9fb8; text-transform: uppercase;">Bitácora Personal & Recuerdos</span>
          <h1 style="font-size: 28px; color: #f0f6fb; margin: 10px 0 0; font-weight: normal;">Hola, ${name} 🗲</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #b9cbdb;">
          Tu cuenta ha sido creada exitosamente en <strong>Mayday</strong>. A partir de ahora podrás explorar los proyectos de física y astrofísica, ver el muro de memorias y compartir recuerdos de los momentos vividos.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://mayday3003.world/muro" style="background: #4a8cb8; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
            Explorar Muro de Recuerdos
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid rgba(122, 159, 184, 0.2); margin: 30px 0;" />
        <p style="font-size: 12px; color: #7a9fb8; text-align: center; margin: 0;">
          Mayday © 2026 · Desarrollado con pasión cósmica
        </p>
      </div>
    `;

    if (!client) {
      console.log(`[Simulación Email Bienvenida] Enviado a ${email}: ${subject}`);
      return;
    }

    try {
      await client.emails.send({
        from: 'Mayday <onboarding@resend.dev>',
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ Correo de bienvenida enviado a ${email}`);
    } catch (error) {
      console.error('Error al enviar correo de bienvenida con Resend:', error);
    }
  }

  /**
   * 2. Correo para Restablecer Contraseña olvidada
   */
  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const client = this.getClient();
    const subject = '🔒 Restablecimiento de contraseña — Mayday';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/login?resetToken=${resetToken}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09131d; color: #f0f6fb; padding: 40px 30px; border-radius: 20px; border: 1px solid rgba(122, 159, 184, 0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.1em; color: #7a9fb8; text-transform: uppercase;">Seguridad Mayday</span>
          <h1 style="font-size: 26px; color: #f0f6fb; margin: 10px 0 0; font-weight: normal;">¿Olvidaste tu contraseña?</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #b9cbdb;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Mayday</strong>. Haz clic en el botón de abajo para asignar una nueva clave.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" style="background: #4a8cb8; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="font-size: 13px; color: #7a9fb8; line-height: 1.5;">
          Este enlace expirará en 1 hora por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje; tu contraseña actual continuará siendo segura.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(122, 159, 184, 0.2); margin: 30px 0;" />
        <p style="font-size: 12px; color: #7a9fb8; text-align: center; margin: 0;">
          Mayday © 2026 · Seguridad y Recuerdos
        </p>
      </div>
    `;

    if (!client) {
      console.log(`[Simulación Email Reset] Enviado a ${email}: ${resetLink}`);
      return;
    }

    try {
      await client.emails.send({
        from: 'Mayday <onboarding@resend.dev>',
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ Correo de recuperación enviado a ${email}`);
    } catch (error) {
      console.error('Error al enviar correo de recuperación con Resend:', error);
    }
  }
}
