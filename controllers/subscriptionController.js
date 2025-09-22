import Subscription from "../models/Subscription.js";
import Agency from "../models/Agency/Agency.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Client from "../models/clients/Client.js";
import Notification from "../models/Notification.js";
import Tarif from "../models/Tarif.js";

export const createSubscription = async (req, res) => {
  try {
    // const { userId, agencyId, plan, startDate, endDate, amount, numberMonth } = req.body;

    
    // if (!userId || !agencyId || !plan || !amount || !numberMonth || numberMonth <= 0) {
    //   return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    // }

    // const userId = req.user.id;
    const userId = req.params.userId;
    const tarifId = req.params.tarifId;
    const numberMonth = parseInt(req.params.numberMonth) || 1;

    const subscribedUser = await Subscription.findOne({ userId, status: 'active' });
    const startDate = subscribedUser ? subscribedUser.endDate : new Date();

    if (!userId || !tarifId || !numberMonth || numberMonth <= 0) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }

    const endDateCalculated = new Date(new Date().setMonth(new Date().getMonth() + numberMonth));
    // const totalAmount = amount * numberMonth;

    const tarif = await Tarif.findById(tarifId);
    if (!tarif) {
      return res.status(404).json({ error: "Tarif non trouvé" });
    }
    const agencyId = tarif.agencyId;
    const amount = tarif.price;
    const plan = tarif.type;
    const totalAmount = amount * numberMonth;


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
    walletSubcritor.balance -= totalAmount;
    walletSubcritor.save();

    const walletAgency = await Wallet.findOne({ userId: agency.userId });
    if (!walletAgency) {
      const newWallet = new Wallet({
        userId: agency.userId,
        balance: totalAmount,
        kind: 'standard'
      });
      await newWallet.save();
    } else {
      walletAgency.balance += totalAmount;
      walletAgency.save();
    }

    const client = await Client.findOne({ userId });

    client.subscribedAgencyId = agencyId;
    client.save();

    if (!agency.clients.includes(client._id)) {
      agency.clients.push(client._id);
      await agency.save();
    }

    const messageUser = `Vous avez souscrit au plan ${plan} de l'agence ${agency.agencyName} pour ${numberMonth} mois. Montant total: ${totalAmount}.`;
    const messageAgency = `Nouveau client abonné: ${user.firstName} ${user.lastName} au plan ${plan} pour ${numberMonth} mois. Montant total: ${totalAmount}.`;

    const notificationAgency = new Notification({ user: agency.userId, message: messageAgency, type: 'Subscribed' });
    await notificationAgency.save();
    const notification = new Notification({ user: userId, message: messageUser, type: 'Subscribed' });
    await notification.save();

    const subscription = new Subscription({
      userId,
      agencyId,
      tarifId,
      numberMonth,
        plan,
        amount: totalAmount,
        startDate: startDate || new Date(),
        endDate: endDateCalculated,
        // endDate:  new Date(new Date().setMinutes(new Date().getMinutes() + 2)),
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
            .populate('agencyId', 'agencyName address phone email')
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
            .populate('agencyId', 'agencyName address phone email')
            .populate('userId', 'firstName lastName email');
        res.json(subscriptions);
    } catch (error) {
        console.error("Erreur lors de la récupération des abonnements :", error);
        res.status(500).json({ error: error.message });
    }
};
