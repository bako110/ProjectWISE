import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
// import walletController from "./walletController.js";

const createTransaction = async (req, res) => {
  try {
    const { userId, amount, type, description, sourceWalletId, destinationWalletId } = req.body;

    if (!userId || !amount || !type || !sourceWalletId || !destinationWalletId) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }   
    const sourceWallet = await Wallet.findById(sourceWalletId);
    const destinationWallet = await Wallet.findById(destinationWalletId);
    if (!sourceWallet || !destinationWallet) {
      return res.status(404).json({ error: "Source or destination wallet not found" });
    }
    if (type === 'debit' && sourceWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in source wallet" });
    }
    const transaction = new Transaction({
      userId,
      amount,
      type,
      description,
      sourceWalletId,
      destinationWalletId,
      status: 'pending',
      causedBy: req.user.role // Assuming req.user contains the authenticated user's role
    });
    // await transaction.save();
    if (type === 'debit') {
      sourceWallet.balance -= amount;
      destinationWallet.balance += amount;

    } else if (type === 'credit') {
      sourceWallet.balance += amount;
      destinationWallet.balance -= amount;
    }
    await sourceWallet.save();
    await destinationWallet.save();
    res.status(201).json({ message: "Transaction created successfully", transaction });
    } catch (error) {
    console.error("Erreur lors de la création de la transaction :", error);
    res.status(500).json({ error: error.message });
    }
}

