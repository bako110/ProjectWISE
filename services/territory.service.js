const City = require('../models/city');
const Arrondissement = require('../models/Arrondissement');
const Sector = require('../models/Sector');
const Neighborhood = require('../models/neighbourhood');

class TerritoryService {

    //City Methods
    async createCity(data) {
        const city = new City(data);
        return await city.save();
    }

    async updateCity(id, data) {
        return await City.updateOne({ _id: id }, data);
    }

    async deleteCity(id) {
        return await City.deleteOne({ _id: id });
    }

    async getCities(filtre = {}) {
        return await City.find(filtre);
    }

    async getCity(id) {
        return await City.findById(id);
    }

    async createManyCities(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error('Data must be a non-empty array');
        }
        return await City.insertMany(dataArray);
    }

    //Arrondissement Methods
    async createArrondissement(data) {
        const arrondissement = new Arrondissement(data);
        return await arrondissement.save();
    }

    async updateArrondissement(id, data) {
        return await Arrondissement.updateOne({ _id: id }, data);
    }

    async deleteArrondissement(id) {
        return await Arrondissement.deleteOne({ _id: id });
    }

    async getArrondissements(filtre = {}) {
        return await Arrondissement.find(filtre);
    }

    async getArrondissement(id) {
        return await Arrondissement.findById(id);
    }

    async createManyArrondissements(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error('Data must be a non-empty array');
        }
        return await Arrondissement.insertMany(dataArray);
    }


    //Sector Methods
    async createSector(data) {
        const sector = new Sector(data);
        return await sector.save();
    }

    async updateSector(id, data) {
        return await Sector.updateOne({ _id: id }, data);
    }

    async deleteSector(id) {
        return await Sector.deleteOne({ _id: id });
    }

    async getSectors(filtre = {}) {
        return await Sector.find(filtre);
    }

    async getSector(id) {
        return await Sector.findById(id);
    }

    async createManySectors(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error('Data must be a non-empty array');
        }
        return await Sector.insertMany(dataArray);
    }


    //Neighborhood Methods
    async createNeighborhood(data) {
        const neighborhood = new Neighborhood(data);
        return await neighborhood.save();
    }

    async updateNeighborhood(id, data) {
        return await Neighborhood.updateOne({ _id: id }, data);
    }

    async deleteNeighborhood(id) {
        return await Neighborhood.deleteOne({ _id: id });
    }

    async getNeighborhoods(filtre = {}) {
        return await Neighborhood.find(filtre);
    }

    async getNeighborhood(id) {
        return await Neighborhood.findById(id);
    }

    async createManyNeighborhoods(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error('Data must be a non-empty array');
        }
        return await Neighborhood.insertMany(dataArray);
    }

    // Additional methods for complex queries can be added here

    async findCityWithAllDetails(cityId) {
    const city = await City.findById(cityId).lean();
    if (!city) {
        throw new Error('City not found');
    }

    const arrondissements = await Arrondissement.find({ cityId: city._id }).lean();

    for (const arrondissement of arrondissements) {
        const sectors = await Sector.find({ arrondissementId: arrondissement._id }).lean();

        for (const sector of sectors) {
            const neighborhoods = await Neighborhood.find({ sectorId: sector._id }).lean();
            sector.neighborhoods = neighborhoods; // ✅ maintenant visible
        }

        arrondissement.sectors = sectors; // ✅ maintenant visible
    }

    city.arrondissements = arrondissements;

    return city
}


    async findNeighborhoodWithAllDetails(neighborhoodId) {
        // let data = {};
        const neighborhood = await Neighborhood.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Neighborhood not found');
        }
        const sector = await Sector.findById(neighborhood.sectorId);
        if (!sector) {
            throw new Error('Sector not found');
        }
        const arrondissement = await Arrondissement.findById(sector.arrondissementId);
        if (!arrondissement) {
            throw new Error('Arrondissement not found');
        }
        const city = await City.findById(arrondissement.cityId);
        if (!city) {
            throw new Error('City not found');
        }
        data.neighborhood = neighborhood;
        data.sector = sector;
        data.arrondissement = arrondissement;
        data.city = city;

        return data;
    }
                              

}

module.exports = new TerritoryService();