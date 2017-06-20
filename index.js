// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var fs = require('fs');
var spawn = require('child_process').spawnSync;

// Load credentials and set region from JSON file
var config = {
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
};
fs.writeFileSync('/tmp/config.json', JSON.stringify(config));
AWS.config.loadFromPath('/tmp/config.json');

// Read in the file, convert it to base64, store to S3
var s3 = new AWS.S3();
var params = {
  Bucket: process.env.bucket,
  Key: 'ci-test.txt',
  Body: new Buffer('CI is working', 'binary'),
  ACL: 'public-read'
};

s3.putObject(params).promise().then(() => {
  console.log('wrote test file');
}).catch((err) => {
  console.log(err);
});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

// Terminate aws instance
var params = {
  InstanceIds: [process.env.instanceId],
  DryRun: false
};
ec2.terminateInstances(params).promise().then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err);
});
