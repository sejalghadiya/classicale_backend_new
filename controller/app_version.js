import { AppVersion } from "../model/app_version.js";

// Create a new app version
export const createAppVersion = async (req, res) => {
  try {
    const { versionName, apkLink, changes } = req.body;

    const newVersion = new AppVersion({
      versionName,
      apkLink,
      changes,
    });

    await newVersion.save();
    res.status(201).json(newVersion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all app versions
export const getAllVersions = async (req, res) => {
  try {
    const versions = await AppVersion.find().sort({ versionNumber: -1 });
    res.status(200).json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest app version
export const getLatestVersion = async (req, res) => {
  try {
    const latestVersion = await AppVersion.findOne({ isActive: true }).sort({
      versionNumber: -1,
    });
    if (!latestVersion) {
      return res.status(404).json({ message: "No app version found" });
    }
    res.status(200).json(latestVersion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific version by ID
export const getVersionById = async (req, res) => {
  try {
    const version = await AppVersion.findById(req.params.id);
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }
    res.status(200).json(version);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update app version
export const updateVersion = async (req, res) => {
  try {
    const { versionName, apkLink, changes, isActive } = req.body;
    const updatedVersion = await AppVersion.findByIdAndUpdate(
      req.params.id,
      {
        versionName,
        apkLink,
        changes,
        isActive,
      },
      { new: true }
    );

    if (!updatedVersion) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.status(200).json(updatedVersion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete app version
export const deleteVersion = async (req, res) => {
  try {
    const version = await AppVersion.findByIdAndDelete(req.params.id);
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }
    res.status(200).json({ message: "Version deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
