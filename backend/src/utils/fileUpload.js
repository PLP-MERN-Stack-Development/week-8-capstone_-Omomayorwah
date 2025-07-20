const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

// AWS S3 config
let s3;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
  s3 = new AWS.S3();
}

// Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToS3(file, userId, folder = 'uploads') {
  if (!s3) throw new Error('S3 not configured');
  const ext = file.originalname.split('.').pop();
  const key = `${folder}/${userId}/${uuidv4()}.${ext}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };
  const data = await s3.upload(params).promise();
  return data.Location;
}

async function uploadToCloudinary(file, userId, folder = 'uploads') {
  if (!cloudinary.config().cloud_name) throw new Error('Cloudinary not configured');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/${userId}`,
        resource_type: 'image',
        public_id: uuidv4(),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(file.buffer);
  });
}

module.exports = { uploadToS3, uploadToCloudinary }; 