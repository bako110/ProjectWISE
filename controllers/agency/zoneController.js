import Agency from "../../models/Agency/Agency.js";

export const getZones = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const serviceZones = await Agency.findById(agencyId).select("serviceZones").lean();
        res.json(serviceZones);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateZones = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { serviceZones } = req.body;
        const updatedAgency = await Agency.findByIdAndUpdate(agencyId, { serviceZones }, { new: true });
        res.json(updatedAgency);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};