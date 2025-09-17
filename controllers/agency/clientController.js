// controllers/agency/clientController.js
import mongoose from 'mongoose';
import Client from '../../models/clients/Client.js';
import Agency from '../../models/Agency/Agency.js';
// import CollectionReport from '../../models/collections/CollectionReport.js';

/* ---------------------------------------------------------------------- */
/* 1. Liste des clients présents dans le tableau `clients` de l'agence    */
/* ---------------------------------------------------------------------- */
// export const getClientsByAgency = async (req, res) => {
//   try {
//     const { agencyId } = req.params;
//     console.log('Recherche clients via agency.clients pour :', agencyId);

//     // Vérifier que l'ID est bien un ObjectId
//     const agId = new mongoose.Types.ObjectId(agencyId);

//     // 1️⃣ Récupérer l'agence et son tableau "clients"
//     const agency = await Agency.findById(agId).select('clients');
//     if (!agency) {
//       return res.status(404).json({ message: 'Agence non trouvée' });
//     }

//     // 2️⃣ Rechercher les clients dont _id figure dans ce tableau
//     const clients = await Client.find({ _id: { $in: agency.clients } });
//     console.log(`Nombre de clients trouvés : ${clients.length}`);

//     res.status(200).json(clients);
//   } catch (error) {
//     console.error('Erreur getClientsByAgency :', error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const getClientsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID d\'agence invalide' 
      });
    }

    // 1️⃣ Récupérer l'agence et son tableau "clients"
    const agency = await Agency.findById(agencyId).select('clients agencyName');
    if (!agency) {
      return res.status(404).json({ 
        success: false,
        message: 'Agence non trouvée' 
      });
    }

    if (!agency.clients || agency.clients.length === 0) {
      return res.status(200).json({ 
        success: true, 
        count: 0, 
        agencyName: agency.agencyName,
        data: [] 
      });
    }

    // 2️⃣ Récupérer TOUS les clients du tableau "clients" (sans filtrage de statut)
    const clients = await Client.find({ 
      _id: { $in: agency.clients } 
    })
    .populate({ 
      path: 'userId', 
      select: 'firstName lastName email phone address createdAt' 
    })
    .select('-__v') // Exclure le champ __v
    .sort({ createdAt: -1 }) // Trier par date de création (plus récent en premier)
    .lean(); // Retourne un objet JS pur pour de meilleures performances

    // 3️⃣ Optionnel : Ajouter des statistiques
    const activeClients = clients.filter(client => client.isActive !== false);
    const inactiveClients = clients.filter(client => client.isActive === false);

    // 4️⃣ Retourner le résultat complet
    return res.status(200).json({
      success: true,
      agencyId: agencyId,
      agencyName: agency.agencyName,
      count: clients.length,
      statistics: {
        total: clients.length,
        active: activeClients.length,
        inactive: inactiveClients.length
      },
      data: clients
    });

  } catch (error) {
    console.error('Erreur getClientsByAgency :', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔄 Version alternative si vous voulez une requête plus directe
export const getClientsByAgencyDirect = async (req, res) => {
  try {
    const { agencyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID d\'agence invalide' 
      });
    }

    // Requête directe avec aggregation pour plus d'efficacité
    const result = await Agency.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(agencyId) } },
      {
        $lookup: {
          from: 'clients', // nom de la collection clients
          localField: 'clients',
          foreignField: '_id',
          as: 'clientsData',
          pipeline: [
            {
              $lookup: {
                from: 'users', // nom de la collection users
                localField: 'userId',
                foreignField: '_id',
                as: 'userData',
                pipeline: [
                  { $project: { password: 0, __v: 0 } }
                ]
              }
            },
            { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
            { $project: { __v: 0 } }
          ]
        }
      },
      {
        $project: {
          agencyName: 1,
          clients: '$clientsData',
          totalClients: { $size: '$clientsData' }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Agence non trouvée' 
      });
    }

    const agencyData = result[0];

    return res.status(200).json({
      success: true,
      agencyId: agencyId,
      agencyName: agencyData.agencyName,
      count: agencyData.totalClients,
      data: agencyData.clients
    });

  } catch (error) {
    console.error('Erreur getClientsByAgencyDirect :', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/* ---------------------------------------------------------------------- */
/* 3. Valider la souscription d'un client                                 */
/* ---------------------------------------------------------------------- */
export const validateClientSubscription = async (req, res) => {
  console.log('✅ [validateClientSubscription] - Début');

  try {
    const { clientId } = req.params;
    const userId = req.user.id;

    /* Trouver l'agence liée à l'utilisateur connecté */
    const agency = await Agency.findOne({ userId });
    if (!agency) {
      return res.status(404).json({ message: 'Agence non trouvée pour cet utilisateur' });
    }

    const agencyId = agency._id.toString();

    /* Récupérer le client */
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    /* Vérifier l'appartenance à l'agence */
    if (client.subscribedAgencyId?.toString() !== agencyId) {
      return res.status(403).json({ message: 'Ce client n’est pas lié à votre agence' });
    }

    /* Mettre à jour la dernière entrée pending */
    await Client.updateOne(
      { _id: clientId },
      {
        $set: {
          subscriptionStatus: 'active',
          'subscriptionHistory.$[elem].status': 'active',
          'subscriptionHistory.$[elem].date': new Date()
        }
      },
      { arrayFilters: [{ 'elem.status': 'pending' }] }
    );

    /* Recharger le client mis à jour */
    const updatedClient = await Client.findById(clientId);

    console.log('✅ Abonnement validé pour le client:', updatedClient._id);
    return res.status(200).json({
      message: 'Abonnement validé avec succès',
      client: {
        id: updatedClient._id,
        firstName: updatedClient.firstName,
        lastName: updatedClient.lastName,
        phone: updatedClient.phone,
        subscriptionStatus: updatedClient.subscriptionStatus,
        subscriptionHistory: updatedClient.subscriptionHistory
      }
    });
  } catch (error) {
    console.error('💥 Erreur serveur:', error.message);
    return res.status(500).json({
      message: 'Erreur lors de la validation',
      error: error.message
    });
  }
};



// // Récupérer tous les signalements des clients d’une agence
// export const getReportsByAgency = async (req, res) => {
//   try {
//     const { agencyId } = req.params;

//     // Récupérer clients abonnés à cette agence
//     const clients = await Client.find({ subscribedAgencyId: agencyId }, 'firstName lastName nonPassageReports');

//     if (!clients.length) {
//       return res.status(404).json({ message: "Aucun client trouvé pour cette agence" });
//     }

//     // Optionnel : filtrer ou organiser les rapports selon besoin

//     res.json(clients);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
