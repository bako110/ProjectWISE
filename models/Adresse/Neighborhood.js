import mongoose from "mongoose";

const neighborhoodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true }
});

const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);
export default Neighborhood;