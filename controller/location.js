// Fetch all unique locations (state, district, locationName)
import { ProductModel } from "../model/product.js";
export const getLocations = async (req, res) => {
  try {
    const locations = await ProductModel.aggregate([
      {
        $project: {
          state: "$location.state",
          district: "$location.district",
          locationName: "$location.locationName",
        },
      },
      { $unwind: "$state" },
      { $unwind: "$district" },
      { $unwind: "$locationName" },
      {
        $group: {
          _id: null,
          states: { $addToSet: "$state" },
          districts: { $addToSet: "$district" },
          locationNames: { $addToSet: "$locationName" },
        },
      },
    ]);

    res.status(200).json(locations[0]);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
