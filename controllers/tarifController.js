import Tarif from '../models/Tarif.js';

export const createTarif = async (req, res) => {
  const {agencyId, type, price, description, nbPassages } = req.body;

  if (!agencyId || !price || !type ) {
    return res.status(400).json({ message: 'les champs obligatoire agenceId, price, type.' });
  }

  try {
    const tarif = new Tarif({ agencyId, price, type, nbPassages, description });
    await tarif.save();
    res.status(201).json({ message: 'Tarif created successfully', tarif });
  } catch (error) {
    console.error('Error creating tarif:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const updateTarif = async (req, res) => {
  const { tarifId } = req.params;
  const { price, type, description, nbPassages } = req.body;

  if (!tarifId || !price || !type) {
    return res.status(400).json({ message: 'les champs obligatoire tarifId, price, type.' });
  }

  try {
    const tarif = await Tarif.findByIdAndUpdate(tarifId, { price, type, description, nbPassages }, { new: true });
    if (!tarif) {
      return res.status(404).json({ message: 'Tarif not found' });
    }
    res.status(200).json({ message: 'Tarif updated successfully', tarif });
  } catch (error) {
    console.error('Error updating tarif:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getTarifByAgency = async (req, res) => {
  const { agencyId } = req.params;

  if (!agencyId) {
    return res.status(400).json({ message: 'Agency ID is required' });
  }

  try {
    const tarifs = await Tarif.find({ agencyId });
    console.log('Tarifs found:', tarifs);
    if (tarifs.length === 0) {
      return res.status(404).json({ message: 'No tarifs found for this agency' });
    }
    res.status(200).json(tarifs);
  } catch (error) {
    console.error('Error fetching tarifs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getTarifById = async (req, res) => {
  const { tarifId } = req.params;

  if (!tarifId) {
    return res.status(400).json({ message: 'Tarif ID is required' });
  }

  try {
    const tarif = await Tarif.findById(tarifId);
    if (!tarif) {
      return res.status(404).json({ message: 'Tarif not found' });
    }
    res.status(200).json(tarif);
  } catch (error) {
    console.error('Error fetching tarif:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const deleteTarif = async (req, res) => {
  const { tarifId } = req.params;

  if (!tarifId) {
    return res.status(400).json({ message: 'Tarif ID is required' });
  }

  try {
    const tarif = await Tarif.findByIdAndDelete(tarifId);
    if (!tarif) {
      return res.status(404).json({ message: 'Tarif not found' });
    }
    res.status(200).json({ message: 'Tarif deleted successfully' });
  } catch (error) {
    console.error('Error deleting tarif:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getAllTarifs = async (req, res) => {
  try {
    const tarifs = await Tarif.find();
    if (tarifs.length === 0) {
      return res.status(404).json({ message: 'No tarifs found' });
    }
    res.status(200).json(tarifs);
  } catch (error) {
    console.error('Error fetching tarifs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}