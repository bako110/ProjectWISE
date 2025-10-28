const nodemailer = require('nodemailer');

// Configuration du transporteur email avec vos paramètres SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Vérifier la configuration email
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuration email vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error.message);
    return false;
  }
};

// Envoyer l'email de réinitialisation AVEC CODE
const sendResetPasswordEmail = async (email, resetCode) => {
  try {
    // Vérifier la configuration
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      throw new Error('Configuration email invalide');
    }

    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || 'Application de collecte de déchets',
        address: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER
      },
      to: email,
      subject: 'Code de réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #2E7D32; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Code de réinitialisation</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur notre plateforme de collecte de déchets.</p>
            
            <p><strong>Voici votre code de réinitialisation à 6 chiffres :</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2E7D32; color: white; padding: 25px; border-radius: 10px; display: inline-block; font-weight: bold; font-size: 32px; letter-spacing: 8px; border: 3px solid #1B5E20;">
                ${resetCode}
              </div>
            </div>
            
            <p><strong>Instructions :</strong></p>
            <ol style="line-height: 1.6;">
              <li>Rendez-vous sur la page de réinitialisation de mot de passe</li>
              <li>Entrez votre adresse email</li>
              <li>Saisissez le code ci-dessus : <strong style="color: #2E7D32;">${resetCode}</strong></li>
              <li>Créez votre nouveau mot de passe</li>
            </ol>
            
            <div style="background-color: #FFF3CD; border: 1px solid #FFEEBA; border-radius: 4px; padding: 12px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important :</strong> Ce code expirera dans 1 heure.
              </p>
            </div>
            
            <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>
            <p>Cordialement,<br>L'équipe de collecte de déchets</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email avec code de réinitialisation envoyé à: ${email} - Code: ${resetCode}`);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error.message);
    throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
  }
};

// Envoyer un email de confirmation de réinitialisation
const sendPasswordResetConfirmation = async (email) => {
  try {
    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || 'Application de collecte de déchets',
        address: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER
      },
      to: email,
      subject: 'Confirmation de réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Mot de passe réinitialisé</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bonjour,</p>
            <p>Votre mot de passe a été réinitialisé avec succès.</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>👍 Votre sécurité est importante :</strong> Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement notre support.
              </p>
            </div>
            <p>Vous pouvez maintenant vous connecter à votre compte avec votre nouveau mot de passe.</p>
            <p>Cordialement,<br>L'équipe de collecte de déchets</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à: ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error.message);
    // Ne pas throw pour ne pas bloquer le processus principal
  }
};

// Envoyer un email de bienvenue
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || 'Application de collecte de déchets',
        address: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER
      },
      to: email,
      subject: 'Bienvenue sur notre plateforme de collecte de déchets',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🌟 Bienvenue ${firstName} !</h1>
          </div>
          <div style="padding: 20px;">
            <p>Bonjour <strong>${firstName}</strong>,</p>
            <p>Félicitations ! Votre compte a été créé avec succès sur notre plateforme de collecte de déchets.</p>
            
            <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0056b3; margin-top: 0;">🎯 Vous pouvez maintenant :</h3>
              <ul style="color: #0056b3;">
                <li>Vous connecter à votre compte</li>
                <li>Accéder à toutes les fonctionnalités</li>
                <li>Gérer vos collectes de déchets</li>
                <li>Suivre vos statistiques</li>
              </ul>
            </div>

            <p>Nous sommes ravis de vous compter parmi nos utilisateurs et nous nous engageons à vous offrir la meilleure expérience possible.</p>
            
            <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à contacter notre support.</p>
            
            <p>Bien cordialement,<br>L'équipe de collecte de déchets</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à: ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error.message);
  }
};

// Envoyer un email de notification générique
const sendNotificationEmail = async (email, subject, message, title = 'Notification') => {
  try {
    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || 'Application de collecte de déchets',
        address: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER
      },
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #6c757d; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${title}</h1>
          </div>
          <div style="padding: 20px;">
            <div style="white-space: pre-line;">${message}</div>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de notification envoyé à: ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error.message);
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendPasswordResetConfirmation,
  sendWelcomeEmail,
  sendNotificationEmail,
  verifyEmailConfig,
  transporter
};