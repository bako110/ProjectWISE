import mongoose from 'mongoose';


const sectorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    neighborhoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighborhood',
        required: true
    }]
});

const Sector = mongoose.model('Sector', sectorSchema);
export default Sector;