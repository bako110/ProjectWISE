const { genererateToken, registerUser, createAgency, loginUser, getUserById, getUsers, updateUser, deleteUser, getUserByRole, getUsersByAgency } = require('../services/auth.js');
const logger = require('./../utils/logger');
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
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        res.status(200).json(token, user);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        if(!req.params.id) {
            throw new Error('L\'identifiant de l\'utilisateur est requis');
        }
        const user = await getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
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
        res.status(200).json({
            data: users,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const updatedUser = await updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        const deletedUser = await deleteUser(req.params.id);
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};


