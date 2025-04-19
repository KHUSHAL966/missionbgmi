// models/Video.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  youtubeLink: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,  // 0 or 1, where 1 means active and 0 means inactive
  },
  type: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
