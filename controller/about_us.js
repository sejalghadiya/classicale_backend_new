import { createDefaultAboutUsIfNotExists } from "../index.js";
import { AboutUs } from "../model/about_us.js";

export const createAboutUs = async (req, res) => {
  try {
    const aboutUs = new AboutUs(req.body);
    await aboutUs.save();
    res.status(201).json(aboutUs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAboutUs = async (req, res) => {
  try {
    await createDefaultAboutUsIfNotExists();
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res
        .status(404)
        .json({ message: "About Us information not found" });
    }
    res.status(200).json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAboutUs = async (req, res) => {
  try {
    // First find the existing document
    const existingAboutUs = await AboutUs.findOne();
    if (!existingAboutUs) {
      return res
        .status(404)
        .json({ message: "About Us information not found" });
    }

    // If our_values is provided in the request, handle it specially
    if (req.body.our_values) {
      // Map each value to ensure proper structure
      const formattedValues = req.body.our_values.map((value) => ({
        icon: value.icon,
        title: value.title,
        description: value.description,
      }));
      req.body.our_values = formattedValues;
    }

    // Update with the processed data
    const aboutUs = await AboutUs.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(aboutUs);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ message: error.message });
  }
};
