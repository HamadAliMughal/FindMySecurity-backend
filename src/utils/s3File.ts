import { ObjectCannedACL } from "aws-sdk/clients/s3";
import { S3 } from "aws-sdk";
import path from "path";

const {
  S3_ROUTE,
  S3_REGION,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} = process.env;

const S3BucketName = S3_BUCKET || "decode";
const S3AccessKeyId = S3_ACCESS_KEY_ID || "";
const S3SecretAccessKey = S3_SECRET_ACCESS_KEY || "";

const s3Client = new S3({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3AccessKeyId,
    secretAccessKey: S3SecretAccessKey,
  },
});

export const awsUploadFile = (
  file: File,
  name: string = "",
  permission: ObjectCannedACL = "authenticated-read",
  onProgress?: (progress: number) => void
) => {
  return new Promise(async (resolve, reject) => {
    // Build the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set the file name
    name = name === "" ? file.name : name.trim().toLowerCase();
    const fileName = `${S3_ROUTE}/${
      name?.split(".")[0]
    }_${new Date().getTime()}${path.extname(file.name)}`;

    const uploadParams = {
      Bucket: S3BucketName,
      Key: fileName,
      Body: buffer,
      ACL: permission,
    };

    const upload = s3Client.upload(uploadParams);

    // Listen for the progress event
    upload.on("httpUploadProgress", (progress) => {
      const progressPercentage = Math.round(
        (progress.loaded / progress.total) * 100
      );
      if (onProgress) {
        onProgress(progressPercentage);
      }
    });

    // Handle the upload completion
    upload.send((err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fileName });
      }
    });
  });
};

export const getUploadSignedUrl = async ({ file, type }: any) => {

  if (!file || typeof file !== "string") throw new Error("Invalid file name");

  // Generate a signed URL for uploading
  const uploadUrl = await s3Client.getSignedUrl("putObject", {
    Key: file,
    Bucket: S3BucketName,
    ACL: "authenticated-read",
    Expires: 240,
    ContentType: type,
  });

  try {
    await s3Client
      .headObject({
        Key: file,
        Bucket: S3BucketName,
      })
      .promise(); // Log metadata if available
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }
  // Return the signed URL and notify client to upload
  return { uploadUrl };

  // Once uploaded, fetch the metadata
};

export const getSignedUrl = async ({ file }: any) => {
  if (!file || typeof file !== "string") throw new Error("Invalid file name");

  const downloadUrl = await s3Client.getSignedUrl("getObject", {
    Key: file,
    Bucket: S3BucketName,
    Expires: 240,
  });
  return { downloadUrl };
};

export const verifyUpload = async (fileKey: any) => {
  // console.log("i am the file key", fileKey?.file)
  const file = fileKey.file; // Ensure this is correct
const sanitizedKey = file.startsWith("/") ? file.substring(1) : file; // Remove leading slash
  try {
    const metadata = await s3Client.headObject({
      Bucket: S3BucketName, 
      Key: sanitizedKey,
    }).promise();

    if (metadata.ContentLength && metadata.ContentLength > 0) {
      return { success: true, fileSize: metadata.ContentLength };
    } else {
      return { success: false,fileSize:-1, message: "File size is 0, upload failed." };
    }
  } catch (error) {
    console.error("Error verifying upload:", error);
    return { success: false, message: "File not found or inaccessible." };
  }
};