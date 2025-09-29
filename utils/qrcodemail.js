import nodemailer from 'nodemailer';

/**
 * ⚡ Configuration SMTP directement dans le code
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',          // SMTP Gmail
  port: 587,                       // Port TLS
  secure: false,                   // false pour TLS
  auth: {
    user: 'bakorobert2000@gmail.com',        // ton email SMTP
    pass: 'wlqe palv yoxv egbh'             // ton mot de passe SMTP
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
    from: `"Application de collecte de déchets" <bakorobert2001@gmail.com>`,
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to} (ID: ${info.messageId})`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
    throw error;
  }
}

// Exemples d'utilisation
// sendQRCodeEmail('destinataire@example.com', 'Robert', 'data:image/png;base64,iVBORw0KGgoAAAANS...');
