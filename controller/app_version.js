import { AppVersion } from "../model/app_version.js";

// Create a new app version
export const createAppVersion = async (req, res) => {
  try {
    const { version, versionName, apkLink, changes } = req.body;
    console.log("Creating new app version:", {
      version,
      versionName,
      apkLink,
      changes,
    });

    // Validate version format
    if (!version || !/^\d+\.\d+$/.test(version)) {
      return res.status(400).json({
        message: "Invalid version format. Use format like '1.0', '1.1', etc.",
      });
    }

    // Check if version already exists
    const existingVersion = await AppVersion.findOne({ version });
    if (existingVersion) {
      return res.status(400).json({
        message: `Version ${version} already exists`,
      });
    }

    // Check if versionName already exists
    const existingVersionName = await AppVersion.findOne({ versionName });
    if (existingVersionName) {
      return res.status(400).json({
        message: `Version name ${versionName} already exists`,
      });
    }

    const newVersion = new AppVersion({
      version,
      versionName,
      apkLink,
      changes,
    });

    await newVersion.save();
    res.status(201).json(newVersion);
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? "Version or version name already exists"
          : error.message,
    });
  }
};

// Get all app versions
export const getAllVersions = async (req, res) => {
  try {
    const versions = await AppVersion.find().sort({ version: -1 });
    res
      .status(200)
      .json({ data: versions, message: "All versions fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest app version
export const getLatestVersion = async (req, res) => {
  try {
    const latestVersion = await AppVersion.findOne({ isActive: true }).sort({
      version: -1,
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
    const { version, versionName, apkLink, changes, isActive } = req.body;

    // Validate version format if it's being updated
    if (version && !/^\d+\.\d+$/.test(version)) {
      return res.status(400).json({
        message: "Invalid version format. Use format like '1.0', '1.1', etc.",
      });
    }

    const updatedVersion = await AppVersion.findByIdAndUpdate(
      req.params.id,
      {
        version,
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
