/**
 * @desc this file will hold all the function for retrive, upload, delete files from S3 bucket
 * @author CodeNet Softwares Pvt. Ltd.
 * @file aws.js
 */

import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new AWS.S3({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

const awsS3Obj = {
  addDocumentToS3: async function (base64Data, fileName, bucketName, fileType) {
    try {
      if (!base64Data || !fileName || !bucketName || !fileType) {
        throw new Error('Missing required parameters.');
      }
      const fileBuffer = Buffer.from(base64Data, 'base64');
      const fileExtension = fileType.substring(fileType.lastIndexOf('/') + 1);
      const uniqueFileName = `${fileName}_${Date.now()}.${fileExtension}`;
      const params = {
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: fileType,
        ContentEncoding: 'base64',
        ACL: 'public-read',
      };
      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Error uploading file to S3: ${error.message}`);
    }
  },


  deleteDocumentsFromS3: async function (fileName, bucketName) {
    try {
      const ans = await s3
        .deleteObject({
          Bucket: bucketName,
          Key: fileName,
        })
        .promise();
      console.log(`Successfully deleted file ${fileName} from bucket ${bucketName}`);
    } catch (error) {
      console.error(`Error deleting file ${fileName} from bucket ${bucketName}: ${error}`);
    }
  },
};

export default awsS3Obj;
