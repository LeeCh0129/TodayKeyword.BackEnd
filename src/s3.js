import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";

export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

export const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, callBack) => {
      callBack(null, { fieldname: file.fieldname });
    },
    key: (req, file, callBack) => {
      const imageName = "images/" + `${uuidv4()}`;
      callBack(null, imageName);
    },
    limits: { fileSize: 2000000 },
  }),
});
