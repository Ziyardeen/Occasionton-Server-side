const {
  Client,
  Account,
  Databases,
  ID,
  Storage,
  Permission,
} = require("node-appwrite");
const dotenv = require("dotenv");

dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT;
const project_id = process.env.APPWRITE_PROJECT_ID;
const api_key = process.env.APPWRITE_API_KEY;
const database_id = process.env.APPWRITE_DATABASE_ID;
const events_collection_id = process.env.APPWRITE_EVENTS_COLLECTION_ID;

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project_id)
  .setKey(api_key);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

async function createDatabase() {
  try {
    const result = await databases.create(
      "occasiontonDb",
      "Occasionton Database",
      true
    );
    console.log("Database created successfully:", result);
  } catch (error) {
    console.error("Error creating database:", error);
  }
}
// Creating Events Storage Bucket
async function createBucket() {
  try {
    try {
      await storage.deleteBucket("EventsImageBucketId");
      console.log("Existing Bucket Deleted successully.");
    } catch (error) {
      if (error.code === 404) {
        console.log("Bucket Does not exist, Skipping ...");
      } else {
        throw error;
      }
    }
    const result = await storage.createBucket(
      "EventsImageBucketId",
      "EventsImageBucket",
      ['read("any")', 'write("any")', 'update("any")', 'delete("any")']
    );
    console.log("Events Storage Bucket created successfully:", result);
  } catch (error) {
    console.error("Error creating Events Storage Bucket:", error);
  }
}

async function createEventsCollection() {
  const attributes = [
    { key: "title", type: "string", size: 100, required: true },
    { key: "description", type: "string", size: 500, required: true },
    { key: "date", type: "dateTime", required: true },
    { key: "location", type: "string", size: 255, required: true },
    { key: "image", type: "string", size: 2048, required: true },
    { key: "category", type: "string", size: 50, required: true },
    {
      key: "tags",
      type: "array",
      items: { type: "string", size: 30 },
      required: false,
    },
    {
      key: "attendees",
      type: "array",
      items: { type: "string", size: 30 },
      required: false,
    },
    { key: "host", type: "string", size: 100, required: true },
    { key: "price", type: "float", required: true },
    { key: "maxAttendees", type: "integer", required: true },
    { key: "isFeatured", type: "boolean", required: false },
    { key: "startTime", type: "string", size: 100, required: false },
    { key: "endTime", type: "string", size: 100, required: false },
  ];
  try {
    try {
      await databases.deleteCollection("occasiontonDb", "eventsColId");
      console.log("Existing Collection Deleted Successfully.");
    } catch (error) {
      if (error.code === 404) {
        console.log("Collection does not exist, skipping delete.");
      } else {
        throw error;
      }
    }
    const result = await databases.createCollection(
      "occasiontonDb",
      "eventsColId",
      "Events",
      ['read("any")', 'write("any")', 'update("any")', 'delete("any")']
    );

    for (let attr of attributes)
      switch (attr.type) {
        case "string":
          await databases.createStringAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.size,
            attr.required,
            attr.required ? null : "",
            false, // Not an array
            false // Do not encrypt
          );
          console.log(`String attribute '${attr.key}' created successfully.`);
          break;
        case "boolean":
          await databases.createBooleanAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.required,
            false, // Default value (optional)
            false, // Not an array
            false // Do not encrypt
          );
          console.log(`Boolean attribute '${attr.key}' created successfully.`);
          break;
        case "integer":
          await databases.createIntegerAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.required,
            null, // min (optional)
            null, // max (optional)
            null, // default (optional)
            false // array (optional)
          );
          console.log(`Integer attribute '${attr.key}' created successfully.`);
          break;
        case "float":
          await databases.createFloatAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.required, //required
            null, // min (optional)
            null, // max (optional)
            null, // default (optional)
            false // array (optional)
          );
          console.log(`Float attribute '${attr.key}' created successfully.`);
          break;
        case "dateTime":
          await databases.createDatetimeAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.required,
            attr.required ? null : "",
            false
          );
          console.log(`DateTime attribute '${attr.key}' created successfully.`);
          break;

        case "array":
          await databases.createStringAttribute(
            database_id,
            events_collection_id,
            attr.key,
            attr.items.size,
            attr.required,
            attr.required ? null : null, // Default value (optional)
            true, // Not an array
            false // Do not encrypt
          );
          console.log(`Array attribute '${attr.key}' created successfully.`);
          break;

        default:
          console.log(`Attribute type '${attr.type}' is not recognized.`);

          break;
      }

    // console.log("Events Collection Created: ", result);
  } catch (error) {
    console.error(error);
  }
}

async function seed(data) {
  try {
    data.forEach(async (item) => {
      await databases.createDocument(
        database_id,
        events_collection_id,
        ID.unique(),
        item
      );
      console.log(`Seeded event: ${item.title}`);
    });
    console.log("Database seeding complete.");
    return;
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = {
  createDatabase,
  createEventsCollection,
  seed,
  createBucket,
};
