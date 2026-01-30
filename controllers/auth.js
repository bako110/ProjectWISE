const crypto = require('crypto');
const {notoficationService} = require('../services/notification.service.js');
const { genereateQRCodeForUser, genererateToken, registerUser, createAgency, loginUser, requestPasswordReset, resetPasswordWithCode, verifyResetCode, getProfile } = require('../services/auth.js');
const { sendPasswordResetConfirmation, sendWelcomeEmail } = require('../utils/sendResetCodeMail.js');
const logger = require('./../utils/logger');

// Stockage temporaire en mémoire (en production, utilisez Redis ou session)
const resetSessions = new Map();

exports.register = async (req, res) => {
    try {
        const data = req.body;   
        let newAgency = {};    
        if(!data.role) {
            throw new Error('Le rôle est requis pour l\'inscription');
        }

        if(!data.email || !data.password || !data.firstName || !data.lastName || !data.phone || !data.address) {
            throw new Error('Les informations firstname, lastname, email, phone, adresse et password sont requis pour l\'inscription');
        }

        switch (data.role) {
            case 'manager':
                if(!data.isOwnerAgency && !data.agencyId) {
                    throw new Error('L\'information isOwnerAgency ou agencyId est requise pour le rôle manager');
                }
                if(data.agencyId) {
                    data.isOwnerAgency = false;
                } else {
                    const agencyData = data.agency;
                    if(!agencyData || !agencyData.name) {
                        throw new Error('Les informations de l\'agence avec au moins le nom sont requises pour créer une agence');
                    }

                    agencyData.address = data.address;
                    newAgency = await createAgency(agencyData);
                    data.agencyId = newAgency._id;
                    data.isOwnerAgency = true;

                    // const message = `Agence ${agencyData.name} créée avec succès.`;
                    // await notoficationService.createNotification({
                    //     user: data.agencyId,
                    //     message: message,
                    //     type: 'AgencyAdd'
                    // });
                }
                break;
            case 'collector':
                if(!data.agencyId) {
                    throw new Error('L\'identifiant de l\'agence est requis pour le rôle collecteur');
                }
                break;
        }
        const user = await registerUser(data);
        if(data.isOwnerAgency && newAgency._id) {
            newAgency.owner = user._id;
            await newAgency.save();
        }
        
        logger.info(`Nouvel utilisateur enregistré: ${user.email} avec le rôle ${user.role}`);
        
        // Envoyer l'email de bienvenue (asynchrone, ne bloque pas la réponse)
        // sendWelcomeEmail(user.email, user.firstName).catch(error => {
        //     logger.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
        // });
        
        res.status(201).json({
            success: true,
            user,
            message: 'Utilisateur créé avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de l\'inscription:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const {login, password} = req.body;
        if(!login || !password) {
            throw new Error('Le login et le mot de passe sont requis');
        }
        const user = await loginUser(login, password);
        const token = await genererateToken(user);
        
        logger.info(`Utilisateur ${user.email} connecté avec succès`);
        
        res.status(200).json({
            success: true,
            token, 
            user,
            message: 'Connexion réussie'
        });
    } catch (error) {
        logger.warn(`Tentative de connexion échouée pour: ${req.body.login}`);
        res.status(401).json({ 
            success: false,
            error: error.message 
        });
    }
};

// FONCTIONS POUR MOT DE PASSE PERDU AVEC CODE

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'L\'email est requis'
            });
        }

        const result = await requestPasswordReset(email);
        
        logger.info(`Demande de réinitialisation de mot de passe pour: ${email}`);
        
        res.json({
            success: true,
            message: result.message
        });
        
    } catch (error) {
        logger.warn(`Demande de réinitialisation échouée pour: ${req.body.email} - ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Le code est requis'
            });
        }

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: 'Le code doit être composé de 6 chiffres'
            });
        }

        const result = await verifyResetCode(code);
        
        // Créer une session temporaire pour la réinitialisation
        const sessionToken = crypto.randomBytes(32).toString('hex');
        resetSessions.set(sessionToken, {
            email: result.email,
            code: code,
            expires: Date.now() + 900000 // 15 minutes
        });
        
        logger.info(`Code de réinitialisation vérifié avec succès pour: ${result.email}`);
        
        res.json({
            success: true,
            valid: result.valid,
            email: result.email,
            sessionToken: sessionToken // Token pour la prochaine étape
        });
        
    } catch (error) {
        logger.warn(`Code de réinitialisation invalide: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const sessionToken = req.headers['x-reset-token']; // Récupérer le token du header
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Le nouveau mot de passe est requis'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }

        if (!sessionToken) {
            return res.status(400).json({
                success: false,
                message: 'Token de réinitialisation manquant dans les headers'
            });
        }

        // Vérifier la session
        const session = resetSessions.get(sessionToken);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Session invalide ou expirée'
            });
        }

        if (session.expires < Date.now()) {
            resetSessions.delete(sessionToken);
            return res.status(400).json({
                success: false,
                message: 'Session expirée'
            });
        }

        // Utiliser le code de la session pour réinitialiser le mot de passe
        const user = await resetPasswordWithCode(session.code, password);
        
        // Nettoyer la session
        resetSessions.delete(sessionToken);
        
        // Envoyer l'email de confirmation (asynchrone)
        sendPasswordResetConfirmation(user.email).catch(error => {
            logger.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        });
        
        logger.info(`Mot de passe réinitialisé avec succès pour: ${user.email}`);
        
        res.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });
        
    } catch (error) {
        logger.warn(`Tentative de réinitialisation de mot de passe échouée - ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        // const userId = req.user._id; // Supposant que l'ID utilisateur est dans req.user._id
        const profile = await getProfile(userId);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.genereateQRCodeForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const qrCode = await genereateQRCodeForUser(userId);
        if (!qrCode) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        res.json({ success: true, message: 'QR Code généré avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};