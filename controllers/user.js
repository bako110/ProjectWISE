const { getUserById, getUsers, updateUser, deleteUser, getUserByRole, getEmployeesByAgency, getClientByAgency } = require('../services/user.js');
const { sendPasswordResetConfirmation, sendWelcomeEmail } = require('../utils/sendResetCodeMail.js');
const logger = require('./../utils/logger');

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
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        
        const pagination = {
            skip: (page - 1) * limit,
            limit: limit
        };

        const { role } = req.query;
        
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }
        
        const users = await getEmployeesByAgency(agencyId, role, pagination);
        
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

exports.getClientByAgency = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        
        const pagination = {
            skip: (page - 1) * limit,
            limit: limit
        };

        const { neighborhood, city } = req.query;
        
        const filtre = {};
        
        if (neighborhood) filtre.address.neighborhood = neighborhood;
        if (city) filtre.address.city = city;   
        
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }
        
        const users = await getClientByAgency(agencyId, filtre, pagination);
        
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération des clients par agence ${req.params.agencyId}:`, error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};