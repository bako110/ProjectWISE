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
