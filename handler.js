"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
var fs = require("fs");
const { stringify } = require("csv-stringify/sync");
AWS.config.update({ region: "us-west-2" });

var ddb = new AWS.DynamoDB();
const s3 = new AWS.S3();

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports.uploadCsvToS3Handler = async (event) => {
  try {
    const uploadedObjectKey = await generateDataAndUploadToS3();
    const jobId = event["jobId"];
    var params = {
      TableName: TABLE_NAME,
      Item: {
        jobId: { S: jobId },
        reportFileName: { S: uploadedObjectKey },
      },
    };

    // Call DynamoDB to add the item to the table
    await ddb.putItem(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          status: "success",
          jobId: jobId,
          objectKey: uploadedObjectKey,
        },
        null,
        2
      ),
    };
  } catch (error) {
    throw Error(`Error in backend: ${error}`);
  }
};

const generateDataAndUploadToS3 = async () => {
  var filePath = "/tmp/test_user_data.csv";
  const objectKey = `${uuidv4()}.csv`;
  await writeCsvToFileAndUpload(filePath, objectKey);
  return objectKey;
};

const uploadFile = async (fileName, objectKey) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: fileContent,
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
  return objectKey;
};

async function writeCsvToFileAndUpload(filePath, objectKey) {
  var data = getCsvData();
  var output = stringify(data);

  fs.writeFile(filePath, output, function (err) {
    if (err) {
      console.log("file write error", err);
    }
    uploadFile(filePath, objectKey);
  });
}

function getCsvData() {
  return [
    ["1", "2", "3", "4"],
    ["a", "b", "c", "d"],
  ];
}
