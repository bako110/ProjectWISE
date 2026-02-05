const TerritoryService = require('../services/territory.service');

class TerritoryController {
    
    //City Methods
    async createCity(req, res) {
        try {
            if (!req.body.name) {
                return res.status(400).json({ message: 'City name is required' });
            }
            const city = await TerritoryService.createCity(req.body);
            res.status(201).json(city);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateCity(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'City id is required' });
            }
            if (!name) {
                return res.status(400).json({ message: 'City name is required' });
            }
            const city = await TerritoryService.updateCity(id, req.body);
            res.status(200).json({data: true, message: 'City updated successfully'});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteCity(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'City id is required' });
            }
            const city = await TerritoryService.deleteCity(id);
            res.status(200).json(city);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCities(req, res) {
        try {
            const cities = await TerritoryService.getCities();
            res.status(200).json(cities);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCity(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'City id is required' });
            }
            const city = await TerritoryService.getCity(id);
            res.status(200).json(city);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createManyCities(req, res) {
        try {
            const dataArray = req.body;
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return res.status(400).json({ message: 'Data must be a non-empty array' });
            }
            const cities = await TerritoryService.createManyCities(dataArray);
            res.status(201).json(cities);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //Arrondissement Methods
    async createArrondissement(req, res) {
        try {
            if (!req.body.name) {
                return res.status(400).json({ message: 'Arrondissement name is required' });
            }
            const arrondissement = await TerritoryService.createArrondissement(req.body);
            res.status(201).json(arrondissement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateArrondissement(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'Arrondissement id is required' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Arrondissement name is required' });
            }
            const arrondissement = await TerritoryService.updateArrondissement(id, req.body);
            res.status(200).json(arrondissement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteArrondissement(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Arrondissement id is required' });
            }
            const arrondissement = await TerritoryService.deleteArrondissement(id);
            res.status(200).json(arrondissement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getArrondissements(req, res) {
        try {
            const arrondissements = await TerritoryService.getArrondissements();
            res.status(200).json(arrondissements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getArrondissement(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Arrondissement id is required' });
            }
            const arrondissement = await TerritoryService.getArrondissement(id);
            res.status(200).json(arrondissement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createManyArrondissements(req, res) {
        try {
            const dataArray = req.body;
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return res.status(400).json({ message: 'Data must be a non-empty array' });
            }
            const arrondissements = await TerritoryService.createManyArrondissements(dataArray);
            res.status(201).json(arrondissements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //Sector Methods
    async createSector(req, res) {
        try {
            if (!req.body.name) {
                return res.status(400).json({ message: 'Sector name is required' });
            }
            const sector = await TerritoryService.createSector(req.body);
            res.status(201).json(sector);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateSector(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'Sector id is required' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Sector name is required' });
            }
            const sector = await TerritoryService.updateSector(id, req.body);
            res.status(200).json(sector);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteSector(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Sector id is required' });
            }
            const sector = await TerritoryService.deleteSector(id);
            res.status(200).json(sector);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSectors(req, res) {
        try {
            const sectors = await TerritoryService.getSectors();
            res.status(200).json(sectors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSector(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Sector id is required' });
            }
            const sector = await TerritoryService.getSector(id);
            res.status(200).json(sector);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createManySectors(req, res) {
        try {
            const dataArray = req.body;
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return res.status(400).json({ message: 'Data must be a non-empty array' });
            }
            const sectors = await TerritoryService.createManySectors(dataArray);
            res.status(201).json(sectors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //Neighborhood Methods
    async createNeighborhood(req, res) {
        try {
            if (!req.body.name) {
                return res.status(400).json({ message: 'Neighborhood name is required' });
            }
            const neighborhood = await TerritoryService.createNeighborhood(req.body);
            res.status(201).json(neighborhood);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateNeighborhood(req, res) {
        try {
            const { id } = req.params;  
            const { name } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'Neighborhood id is required' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Neighborhood name is required' });
            }
            const neighborhood = await TerritoryService.updateNeighborhood(id, req.body);
            res.status(200).json(neighborhood);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteNeighborhood(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Neighborhood id is required' });
            }
            const neighborhood = await TerritoryService.deleteNeighborhood(id);
            res.status(200).json(neighborhood);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getNeighborhoods(req, res) {
        try {
            const neighborhoods = await TerritoryService.getNeighborhoods();
            res.status(200).json(neighborhoods);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getNeighborhood(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Neighborhood id is required' });
            }
            const neighborhood = await TerritoryService.getNeighborhood(id);
            res.status(200).json(neighborhood);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createManyNeighborhoods(req, res) {
        try {
            const dataArray = req.body;
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return res.status(400).json({ message: 'Data must be a non-empty array' });
            }
            const neighborhoods = await TerritoryService.createManyNeighborhoods(dataArray);
            res.status(201).json(neighborhoods);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    //methods complex queries can be added here
    async findCityWithAllDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'City id is required' });
            }
            const data = await TerritoryService.findCityWithAllDetails(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findNeighborhoodWithAllDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Neighborhood id is required' });
            }
            const data = await TerritoryService.findNeighborhoodWithAllDetails(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new TerritoryController(); 