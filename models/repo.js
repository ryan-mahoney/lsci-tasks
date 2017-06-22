const yaml = require('yamljs');
const execSync = require('child_process').execSync;

module.exports = (aws, commit, repoPath) => {
  const s3 = new aws.S3();
  const baseS3Params = {Bucket: process.env.bucket};
  const tokenS3Params = Object.assign(baseS3Params, {Key: 'tokens/' + commit.provider + '.txt'});

  return {
    retrieveToken: () => {
      return s3.getObject(tokenS3Params).promise().then((response) => {
        return JSON.parse(response.Body.toString('utf-8'));
      });
    },

    uploadStdout: (task, data) => {
      const path = `content/${commit.hash}/${task}/stdout.html`;
      return s3.putObject(Object.assign(baseS3Params, {Key: path, Body: data})).promise();
    },

    uploadStderr: (task, data) => {
      const path = `content/${commit.hash}/${task}/stderr.html`;
      return s3.putObject(Object.assign(baseS3Params, {Key: path, Body: data})).promise();
    },

    clone: (accessToken) => {
      const cloneCommand = `git clone https://${accessToken}@${commit.provider}.com/${commit.owner}/${commit.repo}.git ${repoPath}`;
      const cloneOutput = execSync(cloneCommand);
    },

    reset: () => {
      const resetCommand = `cd ${repoPath} && git reset --hard ${commit.hash}`
      const resetOutput = execSync(resetCommand);
    },

    parseTasks: () => {
      return yaml.load(repoPath + '/lsci/tasks.yml');
    }
  };
};
