import mongoose from 'mongoose';
import { type } from 'os';

const bookingSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  slot: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  paymentId: { type: String },
  slotdate :{type:Date},
  isWinner: { type: Boolean, default: false },
  note:{type:String,  default: "coming soon"},
  roomid:{type:String,  default: "coming soon"},
  roompass:{type:String, default: "coming soon"},
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking; 
