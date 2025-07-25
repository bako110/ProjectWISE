import mongoose from 'mongoose';

const collectionScheduleSchema = new mongoose.Schema({
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceZone',
    required: true
  },

  dayOfWeek: { type: Number, required: true }, // 0=Sunday, 6=Saturday

  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },

  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

const CollectionSchedule = mongoose.model('CollectionSchedule', collectionScheduleSchema);
export default CollectionSchedule;
