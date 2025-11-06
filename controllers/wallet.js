const {
  createWalletService,
  getWalletByUserIdService,
  addBalanceService,
  removeBalanceService
} = require('../services/wallet');

const createWalletController = async (req, res) => {
  try {
    const { userId, kind } = req.body;
    const wallet = await createWalletService(userId, kind);
    res.status(201).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getWalletController = async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await getWalletByUserIdService(userId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet non trouvé' });
    }
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addBalanceController = async (req, res) => {
  try {
    const { userId, amount } = req.params;
    const wallet = await addBalanceService(userId, parseFloat(amount));
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

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
