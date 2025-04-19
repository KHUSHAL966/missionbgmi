// controllers/videoController.js
import Video from '../models/Video.js';


// Add a new video
export const addVideo = async (req, res) => {
  try {
    const { youtubeLink, description, title, status, type } = req.body;
    console.log(req.body)

    // Check if all required fields are present
    if (!youtubeLink || !description || !title || !status || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newVideo = new Video({ youtubeLink, description, title, status, type });

    await newVideo.save();
    res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (err) {
    console.error('Error adding video:', err);
    res.status(500).json({ message: 'Error adding video', error: err.message });
  }
};

// Edit an existing video
export const editVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { youtubeLink, description, title, status ,type } = req.body;
    const updatedData = { youtubeLink, description, title, status ,type };

    
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json({ message: 'Video updated successfully', video: updatedVideo });
  } catch (err) {
    res.status(500).json({ message: 'Error editing video', error: err.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.findByIdAndDelete(id);

    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }


    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting video', error: err.message });
  }
};

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching videos', error: err.message });
  }
};

// Get all active videos (status: 1)
export const getAllActiveVideos = async (req, res) => {
  try {
    const videos = await Video.find({ status: 1, type: 1 });
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active videos', error: err.message });
  }
};

export const getAllActiveVideos2 = async (req, res) => {
  try {
    const videos = await Video.find({ status: 1, type: 2 });
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active videos', error: err.message });
  }
};

