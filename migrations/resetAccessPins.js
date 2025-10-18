import config from "../utils/config.js";
import { AccessCodeModel } from "../model/accessPin.js";
import mongoose from "mongoose";
import readline from "readline";

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

async function resetAccessPins() {
  try {
    // Connect to MongoDB using configuration
    await mongoose.connect(config.database.url, config.database.options);
    console.log("Connected to MongoDB");

    // Show warning and get confirmation
    console.log("\n⚠️  WARNING: This will reset ALL access pins:");
    console.log("- Set useCount to 0");
    console.log("- Set maxUseCount to 100");
    console.log("- Keep existing usedBy history");
    console.log("This action cannot be undone!");

    const confirmed = await askConfirmation(
      "\nAre you sure you want to proceed? (y/N): "
    );

    if (!confirmed) {
      console.log("\nOperation cancelled by user");
      return;
    }

    // Get count before update
    const totalPins = await AccessCodeModel.countDocuments();
    console.log(`\nFound ${totalPins} access pins to reset`);

    if (totalPins > 0) {
      // Update all documents
      const result = await AccessCodeModel.updateMany(
        {}, // match all documents
        {
          $set: {
            useCount: 0,
            maxUseCount: 100,
          },
        }
      );

      console.log("\n✅ Reset completed:");
      console.log(`   Total pins found: ${totalPins}`);
      console.log(`   Pins updated: ${result.modifiedCount}`);
      console.log(`   Pins matched: ${result.matchedCount}`);
    } else {
      console.log("ℹ️ No access pins found to reset");
    }
  } catch (err) {
    console.error("❌ Operation failed:", err.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the reset script
resetAccessPins();
