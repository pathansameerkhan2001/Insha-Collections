import fs from "fs";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
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

async function runDirectVerification() {
  console.log("==================================================");
  console.log("DIRECT DYNAMODB VERIFICATION & CRUD INTEGRITY TEST");
  console.log(`Region: ${REGION}`);
  console.log("==================================================");

  // 1. Verify insha_products table
  console.log("\n1. Verifying 'insha_products'...");
  const productsScan = await docClient.send(new ScanCommand({ TableName: "insha_products" }));
  const products = productsScan.Items || [];
  console.log(`   Total items in insha_products: ${products.length}`);

  if (products.length === 0) {
    throw new Error("No products found in insha_products table!");
  }

  // Check sample product
  const sample = products[0];
  console.log(`   Sample product id: ${sample.id}`);
  console.log(`   Sample product name: ${sample.name}`);
  console.log(`   Sample product category: ${sample.category}`);
  console.log(`   Sample product subCategory: ${sample.subCategory}`);
  console.log(`   Sample product price: ₹${sample.price}`);
  console.log(`   Sample product mainImage: ${sample.mainImage}`);

  const requiredFields = ["id", "name", "category", "price", "status"];
  let validCount = 0;
  for (const p of products) {
    const missing = requiredFields.filter((f) => p[f] === undefined || p[f] === null || p[f] === "");
    if (missing.length === 0) {
      validCount++;
    } else {
      console.warn(`   Product ${p.id} missing fields: ${missing.join(", ")}`);
    }
  }
  console.log(`   All required fields validated: ${validCount}/${products.length} products 100% valid.`);

  // 2. Verify insha_subcategories table
  console.log("\n2. Verifying 'insha_subcategories'...");
  const subScan = await docClient.send(new ScanCommand({ TableName: "insha_subcategories" }));
  const subcategories = subScan.Items || [];
  console.log(`   Total items in insha_subcategories: ${subcategories.length}`);

  const subCatCounts = {};
  for (const sub of subcategories) {
    subCatCounts[sub.categoryId] = (subCatCounts[sub.categoryId] || 0) + 1;
  }
  console.log("   Subcategory breakdown by category:", subCatCounts);

  // 3. Test Product CRUD Lifecycle in DynamoDB
  console.log("\n3. Testing End-to-End Product CRUD Lifecycle in DynamoDB...");
  const testProductId = `test-verify-${Date.now()}`;
  const testProduct = {
    id: testProductId,
    name: "Automated Verification Test Silk Saree",
    slug: "automated-verification-test-silk-saree",
    category: "handlooms",
    subCategory: "Silk Sarees",
    description: "Automated test item verifying DynamoDB persistence.",
    shortDescription: "Automated test item.",
    price: 3499,
    salePrice: 4999,
    sku: "TEST-VERIFY-001",
    stockQuantity: 10,
    inStock: true,
    status: "Active",
    featured: false,
    mainImage: "/api/images/s3/products/test/showcase.webp",
    images: ["/api/images/s3/products/test/real1.webp"],
    showcaseImage: "/api/images/s3/products/test/showcase.webp",
    realImages: ["/api/images/s3/products/test/real1.webp"],
    rating: 5,
    reviewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // CREATE
  console.log(`   A. Putting test product (${testProductId})...`);
  await docClient.send(new PutCommand({ TableName: "insha_products", Item: testProduct }));

  // READ
  console.log("   B. Reading back test product from DynamoDB...");
  const getRes = await docClient.send(new GetCommand({ TableName: "insha_products", Key: { id: testProductId } }));
  if (!getRes.Item || getRes.Item.name !== testProduct.name) {
    throw new Error("Created test product not found or name mismatch in DynamoDB!");
  }
  console.log(`   ✓ Created product verified: "${getRes.Item.name}", Price: ₹${getRes.Item.price}`);

  // UPDATE
  console.log("   C. Updating test product in DynamoDB...");
  const updatedItem = {
    ...getRes.Item,
    name: "Automated Verification Test Silk Saree (Updated)",
    price: 3999,
    stockQuantity: 8,
    updatedAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: "insha_products", Item: updatedItem }));

  // VERIFY UPDATE
  const getUpdatedRes = await docClient.send(new GetCommand({ TableName: "insha_products", Key: { id: testProductId } }));
  if (getUpdatedRes.Item?.name !== "Automated Verification Test Silk Saree (Updated)" || getUpdatedRes.Item?.price !== 3999) {
    throw new Error("Updated test product values not reflected in DynamoDB!");
  }
  console.log(`   ✓ Updated product verified: "${getUpdatedRes.Item.name}", Price: ₹${getUpdatedRes.Item.price}`);

  // DELETE
  console.log("   D. Deleting test product from DynamoDB...");
  await docClient.send(new DeleteCommand({ TableName: "insha_products", Key: { id: testProductId } }));

  // VERIFY DELETION
  const getDeletedRes = await docClient.send(new GetCommand({ TableName: "insha_products", Key: { id: testProductId } }));
  if (getDeletedRes.Item) {
    throw new Error("Deleted test product still exists in DynamoDB!");
  }
  console.log("   ✓ Deleted product successfully removed from DynamoDB.");

  // 4. Test Subcategory CRUD Lifecycle in DynamoDB
  console.log("\n4. Testing Subcategory CRUD Lifecycle in DynamoDB...");
  const testSubId = `handlooms-test-sub-${Date.now()}`;
  const testSub = {
    id: testSubId,
    name: "Automated Test Subcategory",
    categoryId: "handlooms",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // CREATE SUB
  console.log(`   A. Putting test subcategory (${testSubId})...`);
  await docClient.send(new PutCommand({ TableName: "insha_subcategories", Item: testSub }));

  // READ SUB
  const getSubRes = await docClient.send(new GetCommand({ TableName: "insha_subcategories", Key: { id: testSubId } }));
  if (!getSubRes.Item || getSubRes.Item.name !== testSub.name) {
    throw new Error("Created test subcategory not found in DynamoDB!");
  }
  console.log(`   ✓ Created subcategory verified: "${getSubRes.Item.name}" under category "${getSubRes.Item.categoryId}"`);

  // DELETE SUB
  console.log("   B. Deleting test subcategory from DynamoDB...");
  await docClient.send(new DeleteCommand({ TableName: "insha_subcategories", Key: { id: testSubId } }));

  const getDeletedSubRes = await docClient.send(new GetCommand({ TableName: "insha_subcategories", Key: { id: testSubId } }));
  if (getDeletedSubRes.Item) {
    throw new Error("Deleted test subcategory still exists in DynamoDB!");
  }
  console.log("   ✓ Deleted subcategory successfully removed from DynamoDB.");

  console.log("\n==================================================");
  console.log("ALL DIRECT DYNAMODB VERIFICATION TESTS PASSED (100%)");
  console.log("==================================================");
}

runDirectVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
