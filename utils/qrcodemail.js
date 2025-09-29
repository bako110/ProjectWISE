import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables d'environnement

// Création du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

// 🔎 Vérifier la connexion SMTP au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Erreur SMTP :', error);
  } else {
    console.log('✅ Connexion SMTP OK');
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

  // Nettoyage : si l'image contient le préfixe `data:image/...`, on l'enlève
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

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to}`);
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :', err);
    throw err;
  }
}

// --- TEST AUTOMATIQUE (facultatif) ---
// Décommente pour tester automatiquement au démarrage
/*
(async () => {
  try {
    await transporter.sendMail({
      from: `"Test" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: 'tonautreadresse@gmail.com', // ton email pour recevoir le test
      subject: 'Test Render SMTP',
      text: 'Ceci est un mail test depuis Render'
    });
    console.log('✅ Mail test envoyé !');
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi du mail test :', err);
  }
})();
*/
