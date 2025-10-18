import config from "../utils/config.js";
import { BikeModel } from "../model/bike.js";
import { CarModel } from "../model/car.js";
import { BookSportHobbyModel } from "../model/book_sport_hobby.js";
import { ElectronicModel } from "../model/electronic.js";
import { FurnitureModel } from "../model/furniture.js";
import { JobModel } from "../model/job.js";
import { PetModel } from "../model/pet.js";
import { SmartPhoneModel } from "../model/smart_phone.js";
import { ServicesModel } from "../model/services.js";
import { OtherModel } from "../model/other.js";
import { PropertyModel } from "../model/property.js";
import { UserModel } from "../model/user.js";
import { CommunicateModel } from "../model/chat.js";
import { ConversationModel } from "../model/conversation.js";
import { ReportProductModel } from "../model/reoprt_product.js";
import ChatReportModel from "../model/report_chat_model.js";
import mongoose from "mongoose";
import readline from "readline";

const models = {
  Bike: BikeModel,
  Car: CarModel,
  book_sport_hobby: BookSportHobbyModel,
  electronic: ElectronicModel,
  furniture: FurnitureModel,
  Job: JobModel,
  pet: PetModel,
  smart_phone: SmartPhoneModel,
  services: ServicesModel,
  other: OtherModel,
  property: PropertyModel,
};

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function cleanupRelatedData(Model, modelName, productIds) {
  try {
    // Delete all chats related to these products
    const chatResult = await CommunicateModel.deleteMany({
      productId: { $in: productIds },
    });
    if (chatResult.deletedCount > 0) {
      console.log(
        `   Deleted ${chatResult.deletedCount} related chat messages`
      );
    }

    // Delete all conversations related to these products
    const conversationResult = await ConversationModel.deleteMany({
      product: { $in: productIds },
    });
    if (conversationResult.deletedCount > 0) {
      console.log(
        `   Deleted ${conversationResult.deletedCount} related conversations`
      );
    }

    // Delete all product reports for these products
    const reportResult = await ReportProductModel.deleteMany({
      productId: { $in: productIds },
      modelName: modelName,
    });
    if (reportResult.deletedCount > 0) {
      console.log(`   Deleted ${reportResult.deletedCount} product reports`);
    }

    // Get conversation IDs to cleanup chat reports
    const conversationIds = await ConversationModel.find({
      product: { $in: productIds },
    }).distinct("_id");

    if (conversationIds.length > 0) {
      // Delete chat reports related to these conversations
      const chatReportResult = await ChatReportModel.deleteMany({
        conversationId: { $in: conversationIds },
      });
      if (chatReportResult.deletedCount > 0) {
        console.log(`   Deleted ${chatReportResult.deletedCount} chat reports`);
      }
    }

    // Clean up user favorites
    const usersToUpdate = await UserModel.find({
      "favorite.modelName": modelName,
    });

    let updatedCount = 0;
    for (const user of usersToUpdate) {
      user.favorite = user.favorite.filter(
        (fav) => fav.modelName !== modelName
      );
      await user.save();
      updatedCount++;
    }

    if (updatedCount > 0) {
      console.log(`   Cleaned up favorites for ${updatedCount} users`);
    }
  } catch (err) {
    console.error(`   ❌ Error cleaning up related data:`, err.message);
  }
}

async function deleteCollectionData(Model, modelName) {
  console.log(`\nProcessing ${modelName}...`);

  try {
    // Get count before deletion
    const count = await Model.countDocuments();
    console.log(`Found ${count} documents`);

    if (count > 0) {
      // Get all product IDs before deletion for cleanup
      const productIds = await Model.find({}).distinct("_id");

      // First cleanup all related data
      await cleanupRelatedData(Model, modelName, productIds);

      // Delete all documents
      const result = await Model.deleteMany({});
      console.log(`✅ ${modelName}: Deleted ${result.deletedCount} documents`);
    } else {
      console.log(`ℹ️ ${modelName}: No documents to delete`);
    }
  } catch (err) {
    console.error(`❌ Error deleting ${modelName}:`, err.message);
  }
}

async function deleteAllData() {
  try {
    // Connect to MongoDB using configuration
    await mongoose.connect(config.database.url, config.database.options);
    console.log("Connected to MongoDB");

    // Show warning and get confirmation
    console.log(
      "\n⚠️  WARNING: This will delete ALL product data from ALL collections and remove related favorites from users!"
    );
    console.log("This action cannot be undone!");

    const confirmed = await askConfirmation(
      "\nAre you sure you want to proceed? (y/N): "
    );

    if (!confirmed) {
      console.log("\nOperation cancelled by user");
      return;
    }

    console.log("\nStarting deletion process...");

    // Delete data from each collection
    for (const [modelName, Model] of Object.entries(models)) {
      await deleteCollectionData(Model, modelName);
    }

    // Final cleanup of any orphaned favorites
    const users = await UserModel.find({ "favorite.0": { $exists: true } });
    if (users.length > 0) {
      console.log("\nPerforming final cleanup of user favorites...");
      for (const user of users) {
        // Remove any remaining favorites that might be orphaned
        user.favorite = [];
        await user.save();
      }
      console.log(`✅ Cleaned up favorites for ${users.length} users`);
    }

    console.log(
      "\n✅ All product data has been deleted and user favorites have been cleaned up"
    );
  } catch (err) {
    console.error("❌ Operation failed:", err.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the deletion script
deleteAllData();
