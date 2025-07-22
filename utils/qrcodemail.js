import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables d'environnement

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

/**
 * Envoie un email avec un QR code en pièce jointe inline
 * @param {string} to Email destinataire
 * @param {string} firstName Prénom du destinataire
 * @param {string} base64QRCode Image QR code encodée base64 (avec ou sans préfixe)
 */
export async function sendQRCodeEmail(to, firstName, base64QRCode) {
  if (!base64QRCode) {
    throw new Error('Le QR code est vide ou indéfini.');
  }

  // 🔍 Nettoyage : si l'image contient le préfixe `data:image/...`, on l'enlève
  const cleanedBase64 = base64QRCode.includes('base64,')
    ? base64QRCode.split('base64,')[1]
    : base64QRCode;

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: "Votre QR code d'accès",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Voici votre QR code personnel :</p>
      <img src="cid:qrcode" alt="QR Code" style="width:200px; height:200px;" />
      <p>Merci de conserver ce code précieusement.</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content: Buffer.from(cleanedBase64, 'base64'),
        cid: 'qrcode' // pour l'affichage inline
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}
