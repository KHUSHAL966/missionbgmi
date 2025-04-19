// models/Package.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  package_name: {
    type: String,
    required: true,  // Name of the package
  },
  participants_count: {
    type: Number,
    required: true,  // Number of participants
  },
  total_prize_pool: {
    type: Number,
    required: true,  // Total prize pool amount
  },
  price: {
    type: Number,
    required: true,  // Price of the package
  },
  description: {
    type: String,
    required: true,  // Description of the package
  },
  status: {
    type: Number,
    required: true,  // 0 means inactive, 1 means active
  },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
});

const Package = mongoose.model('Package', packageSchema);

export default Package;
