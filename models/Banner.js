// models/Banner.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,  // URL of the image
  },
  link: {
    type: String,
    required: true,  // URL where the banner redirects
  },
  title: {
    type: String,
    required: true,  // Title of the banner
  },
  status: {
    type: Number,
    required: true,  // 0 means inactive, 1 means active
  },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
