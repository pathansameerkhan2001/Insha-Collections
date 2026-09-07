import fs from "fs";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

// Load environment variables from .env.local or .env
function loadEnv() {
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}
loadEnv();

const REGION = process.env.AWS_REGION || "ap-southeast-2";
const TABLE_NAME = "insha_subcategories";

const baseClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

async function getAllExistingDynamoSubcategories() {
  const items = [];
  let lastEvaluatedKey = undefined;

  do {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvaluatedKey,
    });
    const res = await docClient.send(command);
    if (res.Items) {
      items.push(...res.Items);
    }
    lastEvaluatedKey = res.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

async function runMigration() {
  console.log("==================================================");
  console.log("MIGRATING SUBCATEGORIES TO DYNAMODB (insha_subcategories)");
  console.log(`Region: ${REGION}`);
  console.log("==================================================");

  const jsonFilePath = path.resolve(process.cwd(), ".data", "subcategories.json");
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`ERROR: JSON file not found at: ${jsonFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonFilePath, "utf8");
  const subcategoryMap = JSON.parse(fileContent);

  // Flatten the category -> subcategory array mapping
  const flatSubcategories = [];
  for (const [catId, subList] of Object.entries(subcategoryMap)) {
    if (Array.isArray(subList)) {
      for (const sub of subList) {
        flatSubcategories.push({
          ...sub,
          categoryId: sub.categoryId || catId,
        });
      }
    }
  }

  console.log(`\n1. Validating source data...`);
  console.log(`   Source JSON total subcategories: ${flatSubcategories.length}`);

  const invalidSubcategories = [];
  flatSubcategories.forEach((s, idx) => {
    if (!s.id || typeof s.id !== "string" || !s.name || !s.categoryId) {
      invalidSubcategories.push({ index: idx, subcategory: s, reason: "Missing id, name, or categoryId" });
    }
  });

  if (invalidSubcategories.length > 0) {
    console.error(`   Found ${invalidSubcategories.length} invalid subcategories:`, invalidSubcategories);
    process.exit(1);
  }
  console.log(`   All ${flatSubcategories.length} subcategories are valid with id, name, categoryId.`);

  console.log(`\n2. Scanning existing DynamoDB table '${TABLE_NAME}'...`);
  const existingDynamoItems = await getAllExistingDynamoSubcategories();
  const existingIdSet = new Set(existingDynamoItems.map((item) => item.id));
  console.log(`   DynamoDB before count: ${existingDynamoItems.length}`);

  let insertedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems = [];

  console.log(`\n3. Starting idempotent migration into DynamoDB...`);

  for (const subcategory of flatSubcategories) {
    try {
      if (existingIdSet.has(subcategory.id)) {
        // Safe: do not blindly overwrite existing records
        skippedCount++;
        continue;
      }

      const itemToSave = {
        id: subcategory.id,
        name: subcategory.name,
        categoryId: subcategory.categoryId,
        createdAt: subcategory.createdAt || new Date().toISOString(),
        updatedAt: subcategory.updatedAt || new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: itemToSave,
        })
      );

      insertedCount++;
    } catch (err) {
      failedCount++;
      failedItems.push({
        id: subcategory.id,
        name: subcategory.name,
        error: err.message,
      });
      console.error(`   Failed to insert subcategory ID ${subcategory.id}: ${err.message}`);
    }
  }

  console.log(`\n4. Scanning DynamoDB to verify final count...`);
  const finalDynamoItems = await getAllExistingDynamoSubcategories();

  console.log("\n==================================================");
  console.log("SUBCATEGORY MIGRATION REPORT");
  console.log("==================================================");
  console.log(`Source JSON count:    ${flatSubcategories.length}`);
  console.log(`DynamoDB before:      ${existingDynamoItems.length}`);
  console.log(`Inserted:             ${insertedCount}`);
  console.log(`Skipped (existing):   ${skippedCount}`);
  console.log(`Failed:               ${failedCount}`);
  console.log(`DynamoDB after:       ${finalDynamoItems.length}`);
  console.log("==================================================");

  if (failedCount > 0) {
    console.error("Migration finished with errors on items:", failedItems);
    process.exit(1);
  } else {
    console.log("Subcategory migration completed successfully without errors!");
  }
}

runMigration().catch((err) => {
  console.error("Migration failed with fatal error:", err);
  process.exit(1);
});
