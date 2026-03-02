const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransporter(config);
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn("Email service not configured - email not sent");
      return { success: false, error: "Email service not configured" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""), // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to: ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const subject = "Recuperação de Senha - Onboarding RSV";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #2563EB; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Recuperação de Senha</h1>
            </div>
            
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Onboarding RSV</strong>.</p>
                
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Redefinir Senha</a>
                </div>
                
                <p>Ou copie e cole o link abaixo no seu navegador:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                    ${resetUrl}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este link é válido por apenas <strong>1 hora</strong></li>
                        <li>Se você não solicitou esta redefinição, ignore este email</li>
                        <li>Sua senha atual permanecerá inalterada até que você defina uma nova</li>
                    </ul>
                </div>
                
                <p>Se você tiver dúvidas, entre em contato com nosso suporte:</p>
                <p>📧 support@onboardingrsv.com</p>
            </div>
            
            <div class="footer">
                <p>© 2024 Onboarding RSV. Todos os direitos reservados.</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, userName, tempPassword = null) => {
  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

  const subject = "Bem-vindo ao Onboarding RSV! 🎉";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao Onboarding RSV</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
                display: inline-block; 
                background: #10B981; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
            .credentials { background: #fef9c3; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bem-vindo ao Onboarding RSV!</h1>
            </div>
            
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                
                <p>É com grande prazer que damos as boas-vindas ao <strong>Sistema Onboarding RSV</strong>!</p>
                
                <p>Sua conta foi criada com sucesso e você já pode começar a explorar todas as funcionalidades do sistema.</p>
                
                ${
                  tempPassword
                    ? `
                <div class="credentials">
                    <h3>🔑 Credenciais de Acesso:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Senha Temporária:</strong> ${tempPassword}</p>
                    <p><em>⚠️ Recomendamos que você altere sua senha no primeiro acesso.</em></p>
                </div>
                `
                    : ""
                }
                
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Acessar Sistema</a>
                </div>
                
                <h3>🚀 O que você pode fazer no sistema:</h3>
                <ul>
                    <li>📊 Acompanhar seu progresso de onboarding</li>
                    <li>📅 Gerenciar reservas e agendamentos</li>
                    <li>💼 Colaborar em projetos</li>
                    <li>📈 Visualizar relatórios e analytics</li>
                    <li>🔔 Receber notificações importantes</li>
                    <li>👥 Interagir com sua equipe</li>
                </ul>
                
                <p>Se você tiver dúvidas ou precisar de ajuda:</p>
                <p>📧 support@onboardingrsv.com<br>
                📱 (64) 99319-7555</p>
            </div>
            
            <div class="footer">
                <p>© 2024 Onboarding RSV. Todos os direitos reservados.</p>
                <p>Reservei Viagens - Caldas Novas, GO</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send 2FA setup email
 */
const sendTwoFactorSetupEmail = async (email, userName) => {
  const subject = "Autenticação de Dois Fatores Ativada - Onboarding RSV";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>2FA Ativado</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .success { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Autenticação de Dois Fatores Ativada</h1>
            </div>
            
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                
                <div class="success">
                    <strong>✅ Parabéns!</strong> A autenticação de dois fatores foi ativada com sucesso em sua conta.
                </div>
                
                <p>Sua conta agora está mais segura. A partir de agora, você precisará:</p>
                
                <ol>
                    <li>Inserir seu email e senha normalmente</li>
                    <li>Fornecer o código de 6 dígitos do seu aplicativo autenticador</li>
                </ol>
                
                <h3>📱 Aplicativos Recomendados:</h3>
                <ul>
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                </ul>
                
                <h3>🔑 Códigos de Backup:</h3>
                <p>Guarde seus códigos de backup em local seguro. Eles podem ser usados caso você perca acesso ao seu aplicativo autenticador.</p>
                
                <p>Se você não ativou a 2FA ou suspeita de atividade não autorizada, entre em contato conosco imediatamente:</p>
                <p>📧 security@onboardingrsv.com</p>
            </div>
            
            <div class="footer">
                <p>© 2024 Onboarding RSV. Todos os direitos reservados.</p>
                <p>Este é um email automático de segurança.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Test email configuration
 */
const testEmailService = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: false, error: "Email credentials not configured" };
    }

    const transporter = createTransporter();
    await transporter.verify();

    logger.info("Email service configuration is valid");
    return { success: true, message: "Email service is properly configured" };
  } catch (error) {
    logger.error("Email service configuration error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTwoFactorSetupEmail,
  testEmailService,
};
