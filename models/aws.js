const AWS = require('aws-sdk');
const fs = require('fs');

module.exports = () => {
  // Load credentials and set region from JSON file
  const awsConfig = {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
  };
  fs.writeFileSync('/tmp/config.json', JSON.stringify(awsConfig));
  AWS.config.loadFromPath('/tmp/config.json');
  return AWS;
};
