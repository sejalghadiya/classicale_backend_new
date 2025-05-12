import mongoose from "mongoose";
const ReportProductSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    productId: { type: mongoose.Schema.Types.ObjectId},
    desctiption: { type: String },
    image: { type: String },
    modelName: { type: String },

},
    {
        timestamps: true,
    }
)

export const ReportProductModel = mongoose.model("report_product", ReportProductSchema);

//export const UserModel = mongoose.model("user", UserSchema);