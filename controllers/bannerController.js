import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Banner from '../models/Banner.js';
import { validationResult } from 'express-validator';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Set multer upload limit to a smaller size (e.g., 5 MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5 MB
});

// Add Banner
export const addBanner = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  upload.single('image'),
  async (req, res) => {
    try {
      const { link, title, status } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const newBanner = new Banner({
        image: req.file.path,
        link,
        title,
        status,
      });

      await newBanner.save();
      res.status(201).json({ message: 'Banner added successfully', banner: newBanner });
    } catch (err) {
      res.status(500).json({ message: 'Error adding banner', error: err.message });
    }
  },
];
export const editBanner = [
  upload.single('image'), // Add multer middleware here
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { link, title, status } = req.body;

      // Find the existing banner
      const banner = await Banner.findById(id);
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      // If a new image is uploaded, replace the old one
      let imagePath = banner.image; // Keep the existing image by default
      if (req.file) {
        imagePath = req.file.path;

        // Delete the old image from the server
        if (fs.existsSync(banner.image)) {
          fs.unlinkSync(banner.image);
        }
      }

      const updatedBanner = await Banner.findByIdAndUpdate(
        id,
        { image: imagePath, link, title, status },
        { new: true }
      );

      res.status(200).json({ message: 'Banner updated successfully', banner: updatedBanner });
    } catch (err) {
      res.status(500).json({ message: 'Error editing banner', error: err.message });
    }
  },
];


// Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the banner
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    console.log('Deleting Banner:', banner); // Debugging step

    // Delete the image from the server
    if (banner.image && fs.existsSync(banner.image)) {
      fs.unlinkSync(banner.image);
      console.log('Image Deleted:', banner.image); // Debugging step
    }

    // Delete the banner from the database
    await Banner.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Error Deleting Banner:', err); // Debugging step
    res.status(500).json({ message: 'Error deleting banner', error: err.message });
  }
};


// Get Banner by ID
export const getAllBannersById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ banner });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banner by ID', error: err.message });
  }
};

// Get All Banners
export const getAllBanners = async (req, res) => {
  try {
    res.status(200).json({ banners: await Banner.find() });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banners', error: err.message });
  }
};

// Get All Active Banners
export const getAllActiveBanners = async (req, res) => {
  try {
    res.status(200).json({ banners: await Banner.find({ status: 1 }) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active banners', error: err.message });
  }
};
