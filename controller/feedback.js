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
    res.status(200).json({ success: true, data: featureRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllFeatureRequests = async (req, res) => {
  try {
    console.log("Fetching all feature requests with aggregation");

    const featureRequests = await FeatureRequest.aggregate([
      {
        $lookup: {
          from: "users", // Replace with your actual users collection name
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $addFields: {
          "userId.fName": { $arrayElemAt: ["$userId.fName", -1] },
          "userId.lName": { $arrayElemAt: ["$userId.lName", -1] },
          "userId.mName": { $arrayElemAt: ["$userId.mName", -1] },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          "userId._id": 1,
          "userId.name": 1,
          "userId.email": 1,
          "userId.fName": 1,
          "userId.lName": 1,
          "userId.mName": 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: featureRequests });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch feature requests" });
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
