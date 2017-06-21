// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const fs = require('fs');
const execSync = require('child_process').execSync;

// Load credentials and set region from JSON file
const awsConfig = {
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
};
fs.writeFileSync('/tmp/config.json', JSON.stringify(awsConfig));
AWS.config.loadFromPath('/tmp/config.json');
const s3 = new AWS.S3();
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
const baseParams = {
  Bucket: process.env.bucket
};

const tokenParams = Object.assign(baseParams, {
  Key: 'tokens/' + process.env.provider + '.txt'
});

// Read provider token from aws
s3.getObject(tokenParams).promise().then((response) => {
  return JSON.parse(response.Body.toString('utf-8'));
}).then((providerToken) => {

  // clone repository
  const repoPath = __dirname + '/repo';
  const cloneCommand = `git clone https://${providerToken.access_token}@${process.env.provider}.com/${process.env.owner}/${process.env.repo}.git ${repoPath}`;
  const cloneOutput = execSync(cloneCommand);

  // reset to commit hash
  const resetCommand = `cd ${repoPath} && git reset --hard ${process.env.hash}`
  const resetOutput = execSync(resetCommand);

  // parse tasks

  // run tasks

}).catch((err) => {
  console.log(err);
});

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
