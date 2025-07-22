import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Création du transporteur de mail avec configuration .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Fonction pour envoyer l'email de code de réinitialisation
export const sendResetCodeEmail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: '🔐 Réinitialisation de mot de passe – Code de vérification',
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; text-align: center;">🔐 Réinitialisation de mot de passe</h2>
            <p style="font-size: 16px; color: #34495e;">Bonjour,</p>
            <p style="font-size: 16px; color: #34495e;">
              Vous avez demandé à réinitialiser votre mot de passe sur l' <strong>${process.env.MAIL_FROM_NAME}</strong>.
              Voici votre code de vérification :
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #f0f4f8; padding: 15px 30px; color: #2980b9; border-radius: 8px; letter-spacing: 5px;">
                ${verificationCode}
              </span>
            </div>
            <p style="font-size: 16px; color: #34495e;">
              ⏰ Ce code est valable pendant <strong>15 minutes</strong>.
            </p>
            <p style="font-size: 16px; color: #34495e;">
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
            </p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 14px; color: #95a5a6; text-align: center;">
              © ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. Tous droits réservés.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Échec de l'envoi de l'email de réinitialisation");
  }
};


export const sendMail = async (to, subject, { firstName, email, password }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // ou smtp.example.com
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50;">Bienvenue chez <span style="color: #2980b9;">WISE</span> 🎉</h2>
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${firstName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Votre compte employé a été créé avec succès par votre agence.</p>
        <p style="font-size: 16px; color: #333;">Voici vos identifiants de connexion :</p>
        <ul style="font-size: 16px; color: #2d3436;">
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p style="font-size: 16px; color: #333;">Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>
        <p style="font-size: 16px; color: #333;">Si vous avez des questions, n’hésitez pas à contacter votre responsable d’agence.</p>
        <br/>
        <p style="font-size: 14px; color: #95a5a6; text-align: center;">© ${new Date().getFullYear()} WISE. Tous droits réservés.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"WISE Agency" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  });
};