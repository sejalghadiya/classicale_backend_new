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
import mongoose from "mongoose";

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

async function migrateCollection(Model, modelName) {
  console.log(`\nMigrating ${modelName}...`);

  try {
    // Find all documents
    const docs = await Model.find({});
    console.log(`Found ${docs.length} documents to migrate`);

    let updated = 0;
    let errors = 0;

    for (const doc of docs) {
      try {
        // Update Latest fields from arrays
        if (doc.area?.length) doc.areaLatest = doc.area[doc.area.length - 1];
        if (doc.state?.length)
          doc.stateLatest = doc.state[doc.state.length - 1];
        if (doc.city?.length) doc.cityLatest = doc.city[doc.city.length - 1];
        if (doc.country?.length)
          doc.countryLatest = doc.country[doc.country.length - 1];

        await doc.save();
        updated++;

        // Log progress every 100 documents
        if (updated % 100 === 0) {
          console.log(
            `   Progress: ${updated}/${docs.length} documents updated`
          );
        }
      } catch (err) {
        console.error(`Error updating document ${doc._id}:`, err.message);
        errors++;
      }
    }

    // Create new indexes
    console.log("Creating indexes...");
    await Model.collection.createIndex({
      countryLatest: 1,
      stateLatest: 1,
      cityLatest: 1,
      areaLatest: 1,
    });

    console.log(`✅ ${modelName} Migration completed:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
  } catch (err) {
    console.error(`❌ Error migrating ${modelName}:`, err.message);
  }
}

async function migrate() {
  try {
    // Connect to MongoDB using configuration
    await mongoose.connect(config.database.url, config.database.options);
    console.log("Connected to MongoDB");

    // Migrate each collection
    for (const [modelName, Model] of Object.entries(models)) {
      await migrateCollection(Model, modelName);
    }

    console.log("\n✅ All migrations completed");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run migration
migrate();
