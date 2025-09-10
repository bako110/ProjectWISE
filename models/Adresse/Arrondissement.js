import mongoose from "mongoose";

const arrondissementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  sectors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
  }]
});
const Arrondissement = mongoose.model('Arrondissement', arrondissementSchema);
export default Arrondissement;