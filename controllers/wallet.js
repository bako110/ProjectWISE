const {
  createWalletService,
  getWalletByUserIdService,
  addBalanceService,
  removeBalanceService
} = require('../services/wallet');

/**
 * Crée un wallet
 */
const createWalletController = async (req, res) => {
  try {
    const { userId, kind } = req.body;
    const wallet = await createWalletService(userId, kind);
    res.status(201).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Récupère un wallet par userId
 */
const getWalletController = async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await getWalletByUserIdService(userId);
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Ajoute un montant au wallet
 */
const addBalanceController = async (req, res) => {
  try {
    const { userId, amount } = req.params;
    const wallet = await addBalanceService(userId, parseFloat(amount));
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Retire un montant du wallet
 */
const removeBalanceController = async (req, res) => {
  try {
    const { userId, amount } = req.params;
    const wallet = await removeBalanceService(userId, parseFloat(amount));
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createWalletController,
  getWalletController,
  addBalanceController,
  removeBalanceController
};
