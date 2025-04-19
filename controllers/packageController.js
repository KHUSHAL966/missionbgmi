// controllers/packageController.js
import Package from '../models/package.js';

// Add a new package
export const addPackage = async (req, res) => {
  try {
    const { package_name, participants_count, total_prize_pool, price, description, status } = req.body;

    const newPackage = new Package({
      package_name,
      participants_count,
      total_prize_pool,
      price,
      description,
      status,
    });

    await newPackage.save();
    res.status(201).json({ message: 'Package added successfully', package: newPackage });
  } catch (err) {
    res.status(500).json({ message: 'Error adding package', error: err.message });
  }
};

// Edit an existing package
export const editPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { package_name, participants_count, total_prize_pool, price, description, status } = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { package_name, participants_count, total_prize_pool, price, description, status },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ message: 'Package updated successfully', package: updatedPackage });
  } catch (err) {
    res.status(500).json({ message: 'Error editing package', error: err.message });
  }
};

// Delete a package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting package', error: err.message });
  }
};

// Get all packages
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ packages });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching packages', error: err.message });
  }
};

export const getPackageById = async (req, res) => {
  const { id } = req.params;  // Get the ID from the route parameters
  try {
    const packages = await Package.findById(id); // Find package by ID

    if (!packages) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ packages });  // Return the found package
  } catch (err) {
    res.status(500).json({ message: 'Error fetching package by ID', error: err.message });
  }
};


// Get all active packages (status: 1)
export const getAllActivePackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: 1 });
    res.status(200).json({ packages });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active packages', error: err.message });
  }
};
