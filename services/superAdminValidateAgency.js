const Agence = require('../models/agence');

class AgenceValidationService {
  /**
   * Récupère toutes les agences en attente de validation
   */
  async getPendingAgences() {
    try {
      const pendingAgences = await Agence.find({ 
        'validation.status': 'pending',
        status: { $ne: 'deleted' }
      })
      .populate('owner', 'firstName lastName email phone')
      .populate('gestionnaires', 'firstName lastName email')
      .sort({ createdAt: -1 });

      return pendingAgences;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des agences en attente: ${error.message}`);
    }
  }

  /**
   * Valide une agence
   */
  async validateAgence(agenceId, validationData) {
    try {
      const agence = await Agence.findById(agenceId);
      
      if (!agence) {
        throw new Error('Agence non trouvée');
      }

      if (agence.validation.status === 'approved') {
        throw new Error('Agence déjà validée');
      }

      // Mettre à jour la validation
      agence.validation.status = 'approved';
      agence.validation.validatedBy = validationData.validatedBy;
      agence.validation.validatedAt = new Date();
      agence.validation.validationComment = validationData.validationComment;
      
      // Activer l'agence
      agence.status = 'active';

      await agence.save();

      // Populer les données avant de retourner
      const validatedAgence = await Agence.findById(agenceId)
        .populate('owner', 'firstName lastName email phone')
        .populate('validation.validatedBy', 'firstName lastName');

      return validatedAgence;
    } catch (error) {
      throw new Error(`Erreur lors de la validation de l'agence: ${error.message}`);
    }
  }

  /**
   * Rejette une agence
   */
  async rejectAgence(agenceId, rejectionData) {
    try {
      const agence = await Agence.findById(agenceId);
      
      if (!agence) {
        throw new Error('Agence non trouvée');
      }

      if (agence.validation.status === 'rejected') {
        throw new Error('Agence déjà rejetée');
      }

      if (!rejectionData.rejectionReason) {
        throw new Error('La raison du rejet est obligatoire');
      }

      // Mettre à jour la validation
      agence.validation.status = 'rejected';
      agence.validation.validatedBy = rejectionData.validatedBy;
      agence.validation.validatedAt = new Date();
      agence.validation.rejectionReason = rejectionData.rejectionReason;
      
      // Désactiver l'agence
      agence.status = 'inactive';

      await agence.save();

      // Populer les données avant de retourner
      const rejectedAgence = await Agence.findById(agenceId)
        .populate('owner', 'firstName lastName email phone')
        .populate('validation.validatedBy', 'firstName lastName');

      return rejectedAgence;
    } catch (error) {
      throw new Error(`Erreur lors du rejet de l'agence: ${error.message}`);
    }
  }

  /**
   * Récupère les statistiques de validation
   */
  async getValidationStats() {
    try {
      const stats = await Agence.aggregate([
        {
          $group: {
            _id: '$validation.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await Agence.countDocuments({ status: { $ne: 'deleted' } });
      
      return {
        total,
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        approved: stats.find(s => s._id === 'approved')?.count || 0,
        rejected: stats.find(s => s._id === 'rejected')?.count || 0
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  /**
   * Récupère l'historique des validations
   */
  async getValidationHistory() {
    try {
      const history = await Agence.find({
        'validation.status': { $in: ['approved', 'rejected'] }
      })
      .populate('owner', 'firstName lastName email')
      .populate('validation.validatedBy', 'firstName lastName')
      .select('name validation status createdAt')
      .sort({ 'validation.validatedAt': -1 })
      .limit(50);

      return history;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }
}

module.exports = new AgenceValidationService();