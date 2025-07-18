import User from '../../models/User.js';
import Agency from '../../models/Agency/Agency.js';


export const toggleAgencyStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifie si l'utilisateur existe et est une agence
    const user = await User.findById(userId);
    if (!user || user.role !== 'agency') {
      return res.status(404).json({ message: "Utilisateur agence non trouvé." });
    }

    // Change le statut dans le modèle User
    user.isActive = !user.isActive;
    await user.save();

    // Change aussi dans le modèle Agency
    const agency = await Agency.findOne({ userId });
    if (!agency) {
      return res.status(404).json({ message: "Agence liée non trouvée." });
    }

    agency.isActive = user.isActive;
    await agency.save();

    res.status(200).json({
      message: `Statut de l'agence mis à jour avec succès.`,
      isActive: user.isActive,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
