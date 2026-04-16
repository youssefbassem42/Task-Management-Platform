require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

async function run() {
    await connectDB();
    console.log("Migrating assignedTo to array...");
    
    // We use the native MongoDB driver collection to avoid schema casting issues
    const db = mongoose.connection.useDb(mongoose.connection.name);
    const collection = db.collection('tasks');
    
    const result = await collection.updateMany(
        { assignedTo: { $type: 'objectId' } },
        [ { $set: { assignedTo: ['$assignedTo'] } } ]
    );
    
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    console.log("Migration complete.");
    process.exit(0);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
