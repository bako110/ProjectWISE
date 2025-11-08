const User = require('../models/User.js');
const Agency = require('../models/agency.js');

const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Utilisateur non rencontré');
    }
    return user;
}

const getUsers = async (filtre = {}, pagination = {}) => {
    const users = await User.find(filtre)
        .skip(pagination.skip || 0)
        .limit(pagination.limit || 10);

    const total = await User.countDocuments(filtre);

    return { users, total };
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