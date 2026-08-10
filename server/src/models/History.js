import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  type: { type: String, enum: ['run', 'claimed', 'reclaimed', 'open'], required: true },
  user: { type: String, required: true, index: true },
  dist: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  area: { type: String, default: '' },
  date: { type: Number, default: () => Date.now() },
}, { timestamps: true });

historySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const History = mongoose.model('History', historySchema);
