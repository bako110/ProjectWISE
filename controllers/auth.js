const crypto = require('crypto');
const { genererateToken, registerUser, createAgency, loginUser, getUserById, getUsers, updateUser, deleteUser, getUserByRole, getUsersByAgency, requestPasswordReset, resetPasswordWithCode, verifyResetCode } = require('../services/auth.js');
const { sendPasswordResetConfirmation, sendWelcomeEmail } = require('../utils/sendResetCodeMail.js');
const logger = require('./../utils/logger');

// Stockage temporaire en mémoire (en production, utilisez Redis ou session)
const resetSessions = new Map();

exports.register = async (req, res) => {
    try {
        const data = req.body;       
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
                    const newAgency = await createAgency(agencyData);
                    data.agencyId = newAgency._id;
                    data.isOwnerAgency = true;
                }
                break;
            case 'collector':
                if(!data.agencyId) {
                    throw new Error('L\'identifiant de l\'agence est requis pour le rôle collecteur');
                }
                break;
        }
        const user = await registerUser(data);
        
        // Envoyer l'email de bienvenue (asynchrone, ne bloque pas la réponse)
        sendWelcomeEmail(user.email, user.firstName).catch(error => {
            logger.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
        });
        
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

exports.getUser = async (req, res) => {
    try {
        if(!req.params.id) {
            throw new Error('L\'identifiant de l\'utilisateur est requis');
        }
        const user = await getUserById(req.params.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id}:`, error);
        res.status(404).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const {term, role, agencyId, neighborhood} = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const filtre = {};
        
        if(term) {
            filtre.$or = [
                { firstName: { $regex: term, $options: 'i' } },
                { lastName: { $regex: term, $options: 'i' } },
                { email: { $regex: term, $options: 'i' } },
                { phone: { $regex: term, $options: 'i' } }
            ];
        }
        if(role) {
            filtre.role = role;
        }
        if(agencyId) {
            filtre.agencyId = agencyId;
        }
        if(neighborhood) {
            filtre.neighborhood = neighborhood;
        }
        
        const pagination = {
            skip: (page - 1) * limit,
            limit: limit
        };
        
        const { users, total } = await getUsers(filtre, pagination);
        
        logger.info(`Récupération de ${users.length} utilisateurs sur ${total}`);
        
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const updatedUser = await updateUser(req.params.id, req.body);
        
        logger.info(`Utilisateur ${req.params.id} mis à jour avec succès`);
        
        res.status(200).json({
            success: true,
            user: updatedUser,
            message: 'Utilisateur mis à jour avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id}:`, error);
        res.status(404).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        const deletedUser = await deleteUser(req.params.id);
        
        logger.info(`Utilisateur ${req.params.id} supprimé avec succès`);
        
        res.status(200).json({
            success: true,
            user: deletedUser,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}:`, error);
        res.status(404).json({ 
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

// FONCTIONS SUPPLEMENTAIRES

exports.getUserByRole = async (req, res) => {
    try {
        const { role } = req.params;
        
        if (!role) {
            throw new Error('Le rôle est requis');
        }
        
        const users = await getUserByRole(role);
        
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération des utilisateurs par rôle ${req.params.role}:`, error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.getUsersByAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }
        
        const users = await getUsersByAgency(agencyId);
        
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération des utilisateurs par agence ${req.params.agencyId}:`, error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};