import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const ProductSchema = new mongoose.Schema({
  addProductUserId: {
    type: mongoose.Schema.Types.ObjectId, // This should be ObjectId
    ref: "User", // Reference to the User model
  },
  
  isDeleted: { type: Boolean, default: false }, // Field to mark the product as deleted
  deletedAt: { type: Date, default: null },

  type: {
    type: String,
    enum: ["ForRent", "ForSell"],
  },
  categories: {
    type: String,
    enum: ["A", "B", "C", "D", "E"],
  },

  productType: {
    type: [String],
  },
  subProductType: { type: [String] },
  category: {
    type: String,
    enum: ["Job", "Services"],
  },
  //car
  brand: { type: String },
  oldBrand: { type: String },
  model: { type: String },
  oldModel: { type: String },
  title: { type: String },
  oldTitle: { type: String },
  price: { type: String },
  oldPrice: { type: String },
  kmDriven: { type: Number },
  oldKmDriven: { type: Number },
  fuel: { type: String },
  oldFuel: { type: String },
  condition: { type: String },
  oldCondition: { type: String },
  transmission: { type: String },
  oldTransmission: { type: String },
  year: { type: String },
  oldYear: { type: String },
  description: { type: String },
  oldDescription: { type: String },
  images: [{ type: String }],
  oldImage: { type: String },
  noOfOwners: { type: Number },
  oldNoOfOwners: { type: Number },
  pdfResume: { type: String },
  //image: { type: String },

  // job releted
  salaryPeriod: { type: String },
  oldSalaryPeriod: { type: String },
  positionType: { type: String },
  oldPositionType: { type: String },
  salaryForm: { type: String },
  oldSalaryForm: { type: String },
  salaryTo: { type: String },
  oldSalaryTo: { type: String },

  //phone
  screenSize: { type: String },
  oldScreenSize: { type: String },
  camera: { type: String },
  oldCamera: { type: String },
  batteryBackup: { type: String },
  newBatteryBackup: { type: String },
  storage: { type: String },
  oldStorage: { type: String },

  // pets:
  age: { type: String },
  oldAge: { type: String },
  //property
  propertyType: { type: String },
  oldPropertyType: { type: String },
  bhk: { type: Number },
  oldBhk: { type: Number },
  furnishing: { type: String },
  oldFurnishing: { type: String },
  listedBy: { type: String },
  oldListedBy: { type: String },
  projectStatus: { type: String },
  oldProjectStatus: { type: String },
  superBuildUpArea: { type: String },
  oldSuperBuildUpArea: { type: String },
  carpetArea: { type: String },
  oldCarpetArea: { type: String },
  maintenance: { type: String },
  oldMaintenance: { type: String },
  facing: { type: String },
  oldFacing: { type: String },
  totalFloor: { type: Number },
  oldTotalFloor: { type: Number },
  florNo: { type: String },
  oldFlorNo: { type: String },
  carParking: { type: String },
  oldCarParking: { type: String },
  projectName: { type: String },
  oldProjectName: { type: String },
  plotArea: { type: String },
  oldPlotArea: { type: String },
  length: { type: String },
  oldLength: { type: String },
  breadth: { type: String },
  oldBreadth: { type: String },

  //sercvices

  servicesType: { type: String },
  oldServicesType: { type: String },
  subject: { type: String },
  oldSubject: { type: String },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date, default: Date.now },
});

ProductSchema.plugin(mongoosePaginate);
export const ProductModel = mongoose.model("Product", ProductSchema);
