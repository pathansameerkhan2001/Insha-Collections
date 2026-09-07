import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

export const DYNAMO_TABLE_PRODUCTS = process.env.DYNAMO_TABLE_PRODUCTS || "insha_products";
export const DYNAMO_TABLE_SUBCATEGORIES = process.env.DYNAMO_TABLE_SUBCATEGORIES || "insha_subcategories";

export function isDynamoConfigured(): boolean {
  const region = process.env.AWS_REGION || "ap-southeast-2";
  const keyId = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;

  return Boolean(
    region &&
    keyId && keyId.trim().length > 0 &&
    secret && secret.trim().length > 0
  );
}

let docClientInstance: DynamoDBDocumentClient | null = null;

export function getDynamoDocClient(): DynamoDBDocumentClient {
  if (docClientInstance) {
    return docClientInstance;
  }

  const region = process.env.AWS_REGION || "ap-southeast-2";
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

  const client = new DynamoDBClient({
    region,
    credentials: accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
  });

  docClientInstance = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });

  return docClientInstance;
}

// -----------------------------------------------------------------------------
// Product Table Operations
// -----------------------------------------------------------------------------

export async function dynamoGetProductById(id: string) {
  const docClient = getDynamoDocClient();
  const res = await docClient.send(
    new GetCommand({
      TableName: DYNAMO_TABLE_PRODUCTS,
      Key: { id },
    })
  );
  return res.Item || null;
}

export async function dynamoGetAllProducts(): Promise<Record<string, any>[]> {
  const docClient = getDynamoDocClient();
  const items: Record<string, any>[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined = undefined;

  do {
    const scanParams: any = {
      TableName: DYNAMO_TABLE_PRODUCTS,
    };
    if (lastEvaluatedKey) {
      scanParams.ExclusiveStartKey = lastEvaluatedKey;
    }
    const res = await docClient.send(new ScanCommand(scanParams));

    if (res.Items && res.Items.length > 0) {
      items.push(...res.Items);
    }
    lastEvaluatedKey = res.LastEvaluatedKey as Record<string, any> | undefined;
  } while (lastEvaluatedKey);

  return items;
}

export async function dynamoPutProduct(product: Record<string, any>) {
  const docClient = getDynamoDocClient();
  await docClient.send(
    new PutCommand({
      TableName: DYNAMO_TABLE_PRODUCTS,
      Item: product,
    })
  );
  return product;
}

export async function dynamoDeleteProduct(id: string) {
  const docClient = getDynamoDocClient();
  await docClient.send(
    new DeleteCommand({
      TableName: DYNAMO_TABLE_PRODUCTS,
      Key: { id },
    })
  );
  return true;
}

// -----------------------------------------------------------------------------
// Subcategory Table Operations
// -----------------------------------------------------------------------------

export async function dynamoGetAllSubcategories(): Promise<Record<string, any>[]> {
  const docClient = getDynamoDocClient();
  const items: Record<string, any>[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined = undefined;

  do {
    const scanParams: any = {
      TableName: DYNAMO_TABLE_SUBCATEGORIES,
    };
    if (lastEvaluatedKey) {
      scanParams.ExclusiveStartKey = lastEvaluatedKey;
    }
    const res = await docClient.send(new ScanCommand(scanParams));

    if (res.Items && res.Items.length > 0) {
      items.push(...res.Items);
    }
    lastEvaluatedKey = res.LastEvaluatedKey as Record<string, any> | undefined;
  } while (lastEvaluatedKey);

  return items;
}

export async function dynamoPutSubcategory(subCategory: Record<string, any>) {
  const docClient = getDynamoDocClient();
  await docClient.send(
    new PutCommand({
      TableName: DYNAMO_TABLE_SUBCATEGORIES,
      Item: subCategory,
    })
  );
  return subCategory;
}

export async function dynamoDeleteSubcategory(id: string) {
  const docClient = getDynamoDocClient();
  await docClient.send(
    new DeleteCommand({
      TableName: DYNAMO_TABLE_SUBCATEGORIES,
      Key: { id },
    })
  );
  return true;
}
