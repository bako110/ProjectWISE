const User = require('../models/User');
const Agency = require('../models/Agency');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user;
}

const createAgency = async (agencyData) => {
  const agency = new Agency(agencyData);
  await agency.save();
  return agency;
}

const loginUser = async (login, password) => {
    const user = await User.findOne({ $or: [ { email: login }, { phone: login } ] });
    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Mot de passe incorrect');
    }
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Utilisateur non rencontré');
    }
    return user;
}


const getUsers= async () => {
    const users = await User.find();
    return users;
}

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

const getUsersByAgency = async (agencyId) => {
    const users = await User.find({ agencyId , $or: [ { role: 'manager' }, { role: 'collector' } ] });
    return users;
}


const genererateToken = async (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}
    // Implémente la génération de token JWT ici

module.exports = { genererateToken, registerUser, createAgency, loginUser, getUserById, getUsers, updateUser, deleteUser, getUserByRole, getUsersByAgency };