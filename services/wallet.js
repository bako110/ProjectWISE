const Wallet = require('../models/wallet');
const mongoose = require('mongoose');

const createWalletService = async (userId, kind = 'standard') => {
  const existingWallet = await Wallet.findOne({ userId });
  if (existingWallet) throw new Error("L'utilisateur a déjà un wallet");

  const wallet = new Wallet({
    userId: mongoose.Types.ObjectId(userId),
    kind,
  });

  return await wallet.save();
};

/**
 * Récupère un wallet par userId.
 * Si le wallet n'existe pas, il est créé automatiquement avec type "standard".
 */
const getWalletByUserIdService = async (userId) => {
  let wallet = await Wallet.findOne({ userId: mongoose.Types.ObjectId(userId) });
  
  if (!wallet) {
    // Création automatique d'un wallet standard
    wallet = new Wallet({
      userId: mongoose.Types.ObjectId(userId),
      kind: 'standard',
    });
    await wallet.save();
  }

  return wallet;
};

const addBalanceService = async (userId, amount) => {
  if (amount <= 0) throw new Error('Le montant doit être positif');

  const wallet = await getWalletByUserIdService(userId);
  wallet.balance += amount;
  return await wallet.save();
};

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
