const Agence = require('../models/agency');
const User = require('../models/User');

exports.agencyEmployeeService = {

   async getEmploye(agencyId) {
    if (!agencyId) throw new Error("ID de l'agence requis");

    const employees = await User.find({ agencyId, role: { $in: ['collector', 'manager'] } })
    .select('-password'); // Exclure le mot de passe

    return employees;
  },


}

// module.exports = new AgencyEmployeeService();
