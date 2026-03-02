require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function testarEmail() {
  console.log("========================================");
  console.log("TESTE: SISTEMA DE EMAIL");
  console.log("========================================");
  console.log("");

  // Verificar configuração SMTP
  const smtpConfigurado = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (!smtpConfigurado) {
    console.log("⚠️  SMTP não configurado no .env.local");
    console.log("");
    console.log("Para testar emails, configure no .env.local:");
    console.log("  SMTP_HOST=smtp.gmail.com");
    console.log("  SMTP_PORT=587");
    console.log("  SMTP_USER=seu_email@gmail.com");
    console.log("  SMTP_PASS=sua_senha_app");
    console.log("  EMAIL_FROM=noreply@rsv360.com");
    console.log("");
    console.log("📖 Veja GUIA_CONFIGURACAO_ENV.md para mais detalhes");
    console.log("");
    return;
  }

  console.log("✅ SMTP configurado!");
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log("");

  const emailTeste = process.env.TEST_EMAIL || process.env.SMTP_USER;

  // Criar transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("1. Testando envio de email genérico...");
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: emailTeste,
      subject: 'Teste RSV 360° - Email Genérico',
      html: '<h1>Teste de Email</h1><p>Este é um email de teste do sistema RSV 360°.</p>',
      text: 'Teste de Email - Este é um email de teste do sistema RSV 360°.',
    });
    console.log("✅ Email genérico enviado com sucesso!");
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error) {
    console.log("❌ Erro:", error.message);
  }
  console.log("");

  console.log("2. Verificando templates de email...");
  const templatesDir = path.join(__dirname, '..', 'templates', 'emails');
  const templates = [
    'booking-confirmation.html',
    'welcome.html',
    'password-reset.html',
    'booking-cancelled.html',
    'payment-confirmed.html',
    'checkin-instructions.html',
  ];

  templates.forEach(template => {
    const templatePath = path.join(templatesDir, template);
    if (fs.existsSync(templatePath)) {
      console.log(`   ✅ ${template} encontrado`);
    } else {
      console.log(`   ❌ ${template} não encontrado`);
    }
  });
  console.log("");

  console.log("3. Testando email de boas-vindas (com template)...");
  try {
    const welcomeTemplate = path.join(templatesDir, 'welcome.html');
    if (fs.existsSync(welcomeTemplate)) {
      let html = fs.readFileSync(welcomeTemplate, 'utf-8');
      html = html.replace(/{{userName}}/g, 'Usuário Teste');
      html = html.replace(/{{siteUrl}}/g, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: emailTeste,
        subject: 'Bem-vindo(a) ao RSV 360°, Usuário Teste!',
        html: html,
      });
      console.log("✅ Email de boas-vindas enviado com sucesso!");
      console.log(`   Message ID: ${info.messageId}`);
    } else {
      console.log("⚠️  Template welcome.html não encontrado");
    }
  } catch (error) {
    console.log("❌ Erro:", error.message);
  }
  console.log("");

  console.log("4. Testando email de confirmação de reserva (com template)...");
  try {
    const bookingTemplate = path.join(templatesDir, 'booking-confirmation.html');
    if (fs.existsSync(bookingTemplate)) {
      let html = fs.readFileSync(bookingTemplate, 'utf-8');
      html = html.replace(/{{guestName}}/g, 'Usuário Teste');
      html = html.replace(/{{propertyName}}/g, 'Hotel Teste - Caldas Novas');
      html = html.replace(/{{checkIn}}/g, new Date().toLocaleDateString('pt-BR'));
      html = html.replace(/{{checkOut}}/g, new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'));
      html = html.replace(/{{total}}/g, '500.00');
      html = html.replace(/{{bookingCode}}/g, 'RSV-TEST-001');
      html = html.replace(/{{siteUrl}}/g, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: emailTeste,
        subject: 'Confirmação de Reserva #RSV-TEST-001 - Hotel Teste',
        html: html,
      });
      console.log("✅ Email de confirmação enviado com sucesso!");
      console.log(`   Message ID: ${info.messageId}`);
    } else {
      console.log("⚠️  Template booking-confirmation.html não encontrado");
    }
  } catch (error) {
    console.log("❌ Erro:", error.message);
  }
  console.log("");

  console.log("========================================");
  console.log("TESTE DE EMAIL CONCLUÍDO");
  console.log("========================================");
  console.log("");
  console.log("📧 Verifique a caixa de entrada de:", emailTeste);
  console.log("   (Verifique também a pasta de spam)");
}

testarEmail().catch(console.error);

