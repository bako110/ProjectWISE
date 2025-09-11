import Subscription from "../models/Subscription.js";
import Agency from "../models/Agency/Agency.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

export const createSubscription = async (req, res) => {
  try {
    const { userId, agencyId, plan, startDate, endDate, amount } = req.body;
    if (!userId || !agencyId || !plan || !amount) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agence non trouvée" });
    }   

    const walletSubcritor = await Wallet.findOne({ userId });
    if (walletSubcritor.balance < 0) {
      return res.status(400).json({ error: "Solde insuffisant dans le wallet" });
    }
    walletSubcritor.balance -= amount;
    walletSubcritor.save();

    const walletAgency = await Wallet.findOne({ userId: agency.userId });
    if (!walletAgency) {
      const newWallet = new Wallet({
        userId: agency.userId,
        balance: amount,
        kind: 'standard'
      });
      await newWallet.save();
    } else {
      walletAgency.balance += amount;
      walletAgency.save();
    }

    const subscription = new Subscription({
      userId,
      agencyId,
        plan,
        amount,
        startDate: startDate || new Date(),
        // endDate: "2025-09-11T00:01:00.000Z" || new Date(new Date().setMonth(new Date().getMonth() + 1)),
        endDate:  new Date(new Date().setMinutes(new Date().getMinutes() + 2)),
        status: 'active' 
    });
    await subscription.save();
    res.status(201).json({ message: "Abonnement créé avec succès", subscription });
  } catch (error) {
    console.error("Erreur lors de la création de l'abonnement :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubscriptionsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const subscriptions = await Subscription.find({ userId })
            .populate('agencyId', 'name address phone email')
            .populate('userId', 'firstName lastName email');
        res.json(subscriptions);
    } catch (error) {
        console.error("Erreur lors de la récupération des abonnements :", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('agencyId', 'name address phone email')
            .populate('userId', 'firstName lastName email');
        res.json(subscriptions);
    } catch (error) {
        console.error("Erreur lors de la récupération des abonnements :", error);
        res.status(500).json({ error: error.message });
    }
};
