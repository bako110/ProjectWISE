const Wallet = require('../models/wallet');
const mongoose = require('mongoose');

/**
 * Crée un wallet pour un utilisateur
 */
const createWalletService = async (userId, kind = 'standard') => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID utilisateur invalide");
  }

  const existingWallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (existingWallet) throw new Error("L'utilisateur a déjà un wallet");

  const wallet = new Wallet({
    userId: new mongoose.Types.ObjectId(userId),
    kind,
  });

  return await wallet.save();
};

/**
 * Récupère un wallet par userId
 * Si inexistant, crée un wallet standard automatiquement
 */
const getWalletByUserIdService = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID utilisateur invalide");
  }

  let wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (!wallet) {
    wallet = new Wallet({
      userId: new mongoose.Types.ObjectId(userId),
      kind: 'standard',
    });
    await wallet.save();
  }

  return wallet;
};

/**
 * Ajoute un montant au solde du wallet
 */
const addBalanceService = async (userId, amount) => {
  if (amount <= 0) throw new Error('Le montant doit être positif');

  const wallet = await getWalletByUserIdService(userId);
  wallet.balance += amount;
  return await wallet.save();
};

/**
 * Retire un montant du solde du wallet
 */
const removeBalanceService = async (userId, amount) => {
  if (amount <= 0) throw new Error('Le montant doit être positif');

  const wallet = await getWalletByUserIdService(userId);
  if (wallet.balance < amount) throw new Error('Solde insuffisant');

  wallet.balance -= amount;
  return await wallet.save();
};

module.exports = {
  createWalletService,
  getWalletByUserIdService,
  addBalanceService,
  removeBalanceService,
};
