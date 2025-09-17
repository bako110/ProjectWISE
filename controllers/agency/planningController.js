import CollectionSchedule from '../../models/Agency/CollectionSchedule.js';
import Client from '../../models/clients/Client.js';
import Notification from '../../models/Notification.js';
import Employee from '../../models/Agency/Employee.js';

// ➤ Créer un planning
export const creerPlanning = async (req, res) => {
  try {
    const { zone, startTime, endTime, collectorId, agencyId, date } = req.body;

    if (!zone || !startTime || !endTime || !collectorId) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }
    const employee = await Employee.findOne({ _id: collectorId, agencyId });

    const message = `Nouveau planning assigné: Jour ${date}, dans la zone ${zone}.`;
    const notification = new Notification({ user: employee.userId, message, type: 'Planning' });
    await notification.save();


    const planning = new CollectionSchedule({
      zone,
      // dayOfWeek,
      startTime,
      endTime,
      collectorId,
      agencyId,
      date
    });

    await planning.save();

    res.status(201).json({
      message: "Planning créé avec succès",
      ...planning,
      collector: employee
    });
  } catch (error) {
    console.error("Erreur lors de la création du planning :", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Lister les plannings (avec filtres)
export const listerPlannings = async (req, res) => {
  try {
    const { collectorId, zone } = req.query;
    const filtre = {};

    if (collectorId) filtre.collectorId = collectorId;
    if (zone) filtre.zone = zone;
    // if (dayOfWeek) filtre.dayOfWeek = parseInt(dayOfWeek);

    const plannings = await CollectionSchedule.find(filtre)
      .populate('zone', 'name')
      .populate('collectorId', 'firstName lastName phone');

    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// lister les plannings actifs de l'agence de la semaine
// export const getPlannings = async (req, res) => {
//   try {
//     const agencyId = req.params.agencyId;
//     if (!agencyId) {
//       return res.status(400).json({ error: "Agency ID is required" });
//     }
//     const plannings = await CollectionSchedule.find({ isActive: true, agencyId })

//     const collector = await Employee.find({ agencyId, _id: { $in: plannings.map(p => p.collectorId) } });

//     res.status(200).json({  plannings, collector });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
export const getPlannings = async (req, res) => {
 try {
  const agencyId = req.params.agencyId;
  if (!agencyId) {
    return res.status(400).json({ error: "Agency ID is required" });
  }

  // Récupère tous les plannings actifs de l'agence
  const plannings = await CollectionSchedule.find({ isActive: true, agencyId });

  // Récupère tous les collecteurs liés à ces plannings
  const collectorIds = [...new Set(plannings.flatMap(p => p.collectorId || []))];
  const collectors = await Employee.find({ agencyId, _id: { $in: collectorIds } });

  // Associe chaque planning à ses collecteurs
  const planningsWithCollectors = plannings.map(planning => {
    const planningCollectorIds = planning.collectorId || [];
    const matchedCollectors = collectors.filter(c =>
      planningCollectorIds.some(id => c._id.equals(id))
    );

    return {
      ...planning.toObject(),
      collectors: matchedCollectors
    };
  });

  res.status(200).json({ plannings: planningsWithCollectors });
} catch (error) {
  res.status(500).json({ error: error.message });
}

};

// lister les plannings actifs du collecteur de la semaine
export const getCollectorPlannings = async (req, res) => {
  // try {
  //   const collectorId = req.params.collectorId;
  //   if (!collectorId) {
  //     return res.status(400).json({ error: "Collector ID is required" });
  //   }
  //   const plannings = await CollectionSchedule.find({ isActive: true, collectorId })

  //   const agencyId = plannings[0]?.agencyId;

  //   const zone = plannings[0]?.zone;

  //   const userPlannings = await Client.find({subscribedAgencyId: agencyId, "address.neighborhood": zone });

  //   res.status(200).json({  plannings, userPlannings });
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // } 
  try {
  const collectorId = req.params.collectorId;

  if (!collectorId) {
    return res.status(400).json({ error: "Collector ID is required" });
  }

  // 1. Récupère tous les plannings actifs pour ce collecteur
  const plannings = await CollectionSchedule.find({ isActive: true, collectorId });

  if (plannings.length === 0) {
    return res.status(404).json({ error: "No plannings found for this collector" });
  }

  // 2. Récupère l'agence (on suppose qu'ils ont tous la même agence)
  const agencyId = plannings[0].agencyId;

  // 3. Extraire toutes les zones des plannings
  const zones = plannings.flatMap(planning => planning.zone); // suppose que planning.zone est un array
  const uniqueZones = [...new Set(zones)]; // élimine les doublons

  // 4. Récupérer les clients dans ces zones et cette agence
  const clients = await Client.find({
    subscribedAgencyId: agencyId,
    "address.neighborhood": { $in: uniqueZones }
  });

  // 5. Associer les clients à leur planning respectif
  const planningsWithClients = plannings.map(planning => {
    const planningZones = planning.zone || [];
    const relatedClients = clients.filter(client =>
      planningZones.includes(client.address?.neighborhood)
    );
    return {
      ...planning.toObject(),
      clients: relatedClients,
      totalClients: relatedClients.length
    };
  });

  res.status(200).json({ plannings: planningsWithClients });

} catch (error) {
  res.status(500).json({ error: error.message });
}

}

// ➤ Mettre à jour un planning
export const mettreAJourPlanning = async (req, res) => {
  try {
    const planning = await CollectionSchedule.findById(req.params.id);
    if (!planning) return res.status(404).json({ error: 'Planning non trouvé' });

    const { startTime, endTime, collectorId, isActive } = req.body;

    if (startTime) planning.startTime = startTime;
    if (endTime) planning.endTime = endTime;
    if (collectorId) planning.collectorId = collectorId;
    if (typeof isActive === 'boolean') planning.isActive = isActive;

    await planning.save();
    res.json({
      message: 'Planning mis à jour',
      planning
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Historique des tournées d’un collecteur
export const historiqueParCollecteur = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const plannings = await CollectionSchedule.find({ collectorId })
      .sort({ createdAt: -1 })
      .populate('zoneId', 'name')
      .populate('collectorId', 'firstName lastName');

    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const supprimerPlanning = async (req, res) => {
  try {
    const planning = await CollectionSchedule.findByIdAndDelete(req.params.id);
    if (!planning) return res.status(404).json({ error: 'Planning non trouvé' });

    res.json({ data: planning, message: 'Planning supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}