import mongoose from 'mongoose';

const collectionScheduleSchema = new mongoose.Schema({
  // zoneId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'ServiceZone',
  //   required: true
  // },

  zone : {
    type: String,
  },
  // dayOfWeek: { type: Number, required: true }, // 0=Sunday, 6=Saturday

  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },

  collectorId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  }],
  date: { type: Date, default: Date.now },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

const CollectionSchedule = mongoose.model('CollectionSchedule', collectionScheduleSchema);
export default CollectionSchedule;
