const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/subscription');

class AgencyClientService {

  /**
   * 🔹 Récupérer les clients abonnés à une agence
   */
  async getSubscribedClients(agencyId) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

    // Vérification du format ObjectId
    let agencyObjectId;
    try {
      agencyObjectId = new mongoose.Types.ObjectId(agencyId);
    } catch (error) {
      throw new Error("L'identifiant de l'agence est invalide");
    }

    // 🔹 On récupère toutes les subscriptions actives liées à l'agence
    const subscriptions = await Subscription.find({
      agencyId: agencyObjectId,
      isActive: true
    }).populate({
      path: "clientId",
      select: "firstName lastName email phone address status"
    });

    // 🔹 Extraire uniquement les clients valides
    const clients = subscriptions
      .filter(sub => sub.clientId) // sécurité
      .map(sub => ({
        client: sub.clientId,
        subscriptionId: sub._id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        numberMonths: sub.numberMonths
      }));

    return clients;
  }
}

module.exports = new AgencyClientService();
