const User = require('../models/User.js');
const Agency = require('../models/agency.js');


const getUserById = async (userId) => {
    const user = await User.findById(userId)
        .select('-password')
        .populate('agencyId', 'name')
        .lean(); // Convertir en objet JavaScript simple
    
    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    // Renommer agencyId en agency
    const { agencyId, ...rest } = user;

    return {
        ...rest,
        agencyId: agencyId?._id || agencyId, // Garder juste l'ID
        agency: agencyId // L'objet complet
    };
};


const getUsers = async (filtre = {}, pagination = {}) => {
    const [users, total] = await Promise.all([
        User.find(filtre)
            .select('-password')
            .populate('agencyId', 'name')
            .skip(pagination.skip || 0)
            .limit(pagination.limit || 10)
            .lean(),
        User.countDocuments(filtre)
    ]);

    const formattedUsers = users.map(user => ({
        ...user,
        agency: user.agencyId,
        agencyId: user.agencyId?._id || user.agencyId
    }));

    return { users: formattedUsers, total };
};


const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
        throw new Error('Utilisateur non rencontré');
    }
    return user;
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new Error('Utilisateur non rencontré');
    }
    return user;
};

const getUserByRole = async (role) => {
    const users = await User.find({ role });
    return users;
}

const getEmployeesByAgency = async (agencyId, role, pagination) => {
    if (role) {
        const users = await User.find({ agencyId, role })
            .skip(pagination.skip || 0)
            .limit(pagination.limit || 10);
        return users;
    }
    const users = await User.find({ agencyId , $or: [ { role: 'manager' }, { role: 'collector' } ] }).skip(pagination.skip).limit(pagination.limit);
    return users;
}

const getClientByAgency = async (agencyId, filtre, pagination) => {
    if (filtre) {
        const users = await User.find({ agencyId, role: 'client', ...filtre })
            .skip(pagination.skip || 0)
            .limit(pagination.limit || 10);
        return users;
    }
    const users = await User.find({ agencyId, role: 'client' }).skip(pagination.skip || 0).limit(pagination.limit || 10);

    return users;
}

module.exports = { 
  getUserById, 
  getUsers, 
  updateUser, 
  deleteUser, 
  getUserByRole, 
  getEmployeesByAgency,
  getClientByAgency
};