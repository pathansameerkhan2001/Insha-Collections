import fs from "fs";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
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
const TABLE_NAME = "insha_products";

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

async function getAllExistingDynamoProducts() {
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
  console.log("MIGRATING PRODUCTS TO DYNAMODB (insha_products)");
  console.log(`Region: ${REGION}`);
  console.log("==================================================");

  const jsonFilePath = path.resolve(process.cwd(), ".data", "products.json");
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`ERROR: JSON file not found at: ${jsonFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonFilePath, "utf8");
  const products = JSON.parse(fileContent);

  if (!Array.isArray(products)) {
    console.error("ERROR: .data/products.json does not contain an array of products.");
    process.exit(1);
  }

  console.log(`\n1. Validating source data...`);
  console.log(`   Source JSON total products: ${products.length}`);

  const invalidProducts = [];
  products.forEach((p, idx) => {
    if (!p.id || typeof p.id !== "string") {
      invalidProducts.push({ index: idx, product: p, reason: "Missing or invalid id" });
    }
  });

  if (invalidProducts.length > 0) {
    console.error(`   Found ${invalidProducts.length} invalid products without ID:`, invalidProducts);
    process.exit(1);
  }
  console.log(`   All ${products.length} products have valid IDs.`);

  console.log(`\n2. Scanning existing DynamoDB table '${TABLE_NAME}'...`);
  const existingDynamoItems = await getAllExistingDynamoProducts();
  const existingIdSet = new Set(existingDynamoItems.map((item) => item.id));
  console.log(`   DynamoDB before count: ${existingDynamoItems.length}`);

  let insertedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems = [];

  console.log(`\n3. Starting idempotent migration into DynamoDB...`);

  for (const product of products) {
    try {
      if (existingIdSet.has(product.id)) {
        // Safe: do not blindly overwrite existing records
        skippedCount++;
        continue;
      }

      // Preserve all fields exactly as they are in the JSON
      const itemToSave = {
        ...product,
        updatedAt: product.updatedAt || new Date().toISOString(),
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
        id: product.id,
        name: product.name,
        error: err.message,
      });
      console.error(`   Failed to insert product ID ${product.id}: ${err.message}`);
    }
  }

  console.log(`\n4. Scanning DynamoDB to verify final count...`);
  const finalDynamoItems = await getAllExistingDynamoProducts();

  console.log("\n==================================================");
  console.log("PRODUCT MIGRATION REPORT");
  console.log("==================================================");
  console.log(`Source JSON count:    ${products.length}`);
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
    console.log("Product migration completed successfully without errors!");
  }
}

runMigration().catch((err) => {
  console.error("Migration failed with fatal error:", err);
  process.exit(1);
});
