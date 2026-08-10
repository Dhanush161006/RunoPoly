import mongoose from 'mongoose';

const territorySchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true },
  colorIdx: { type: Number, required: true },
  coords: { type: [[Number]], required: true },
  area: { type: Number, required: true },
  claimedAt: { type: Number, default: () => Date.now() },
  distance: { type: String, default: '0.00' },
  duration: { type: Number, default: 0 },
}, { timestamps: true });

territorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const Territory = mongoose.model('Territory', territorySchema);
