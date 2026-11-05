import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
export async function createUploadUrl(contentType: string, fileName: string) {
  if (!allowed.has(contentType)) throw new Error("Unsupported file type.");
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || "auto";
  if (!bucket || !endpoint || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) throw new Error("Object storage is not configured.");
  const client = new S3Client({
    region, endpoint,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
    forcePathStyle: true
  });
  const ext = fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|pdf)$/)?.[0] || "";
  const key = `jtech/${new Date().toISOString().slice(0,10)}/${randomUUID()}${ext}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  if (!publicBase) throw new Error("S3_PUBLIC_BASE_URL is not configured.");
  return { uploadUrl, publicUrl: `${publicBase.replace(/\/$/,"")}/${key}`, key };
}
