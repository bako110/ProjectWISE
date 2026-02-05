const Dechet = require('../models/Dechet.js');

class DechetService {
    static async createDechet(dechetData) {
        const dechet = new Dechet(dechetData);
        return await dechet.save();
    }

    static async getDechetById(dechetId) {
        return await Dechet.findById(dechetId);
    }

    static async getAllDechets() {
        return await Dechet.find({});
    }

    static async updateDechet(dechetId, updateData) {
        return await Dechet.findByIdAndUpdate(dechetId, updateData, { new: true });
    }

    static async deleteDechet(dechetId) {
        return await Dechet.findByIdAndDelete(dechetId);
    }

}

module.exports = DechetService;