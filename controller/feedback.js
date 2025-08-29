import { FeatureRequest } from "../model/featureRequestSchema.js";

// Feature Request Controllers
export const createFeatureRequest = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const featureRequest = new FeatureRequest({
      title,
      description,
      userId,
    });
    await featureRequest.save();
    res.status(201).json({ success: true, data: featureRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllFeatureRequests = async (req, res) => {
  try {
    const featureRequests = await FeatureRequest.find().populate(
      "userId",
      "name email"
    );
    res.status(200).json({ success: true, data: featureRequests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getFeatureRequestById = async (req, res) => {
  try {
    const featureRequest = await FeatureRequest.findById(
      req.params.id
    ).populate("userId", "name email");
    if (!featureRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Feature request not found" });
    }
    res.status(200).json({ success: true, data: featureRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateFeatureRequest = async (req, res) => {
  try {
    const featureRequest = await FeatureRequest.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
      },
      { new: true }
    );
    if (!featureRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Feature request not found" });
    }
    res.status(200).json({ success: true, data: featureRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteFeatureRequest = async (req, res) => {
  try {
    const featureRequest = await FeatureRequest.findByIdAndDelete(
      req.params.id
    );
    if (!featureRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Feature request not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
