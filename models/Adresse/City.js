import mongoose from "mongoose";


const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  arrondissements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arrondissement',
    required: true
  }]
});

const City = mongoose.model('City', citySchema);
export default City;