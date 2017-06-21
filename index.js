const startTime = new Date().getTime() / 1000 | 0;
const execSync = require('child_process').execSync;
const aws = require(__dirname + '/models/aws.js')();
const instanceModel = require(__dirname + '/models/instance.js')(aws, process.env.instanceId);
const commit = {
  provider: process.env.provider,
  owner: process.env.owner,
  repo: process.env.repo,
  hash: process.env.hash
};
const taskModel = require(__dirname + '/models/task.js')(aws, commit);
const s3 = new aws.S3();
const baseS3Params = {Bucket: process.env.bucket};
const tokenS3Params = Object.assign(baseS3Params, {Key: 'tokens/' + process.env.provider + '.txt'});
const repoPath = __dirname + '/repo';

// Read provider token from aws
s3.getObject(tokenS3Params).promise().then((response) => {
  return JSON.parse(response.Body.toString('utf-8'));

}).then((providerToken) => {
  // Clone repository
  const cloneCommand = `git clone https://${providerToken.access_token}@${commit.provider}.com/${commit.owner}/${commit.repo}.git ${repoPath}`;
  const cloneOutput = execSync(cloneCommand);

  // Reset to commit hash
  const resetCommand = `cd ${repoPath} && git reset --hard ${process.env.hash}`
  const resetOutput = execSync(resetCommand);

  // Parse the tasks
  return new Promise((resolve) => {
    resolve([]);
  });
}).then((tasks) => {

  // assign each job to a variable
  const allTasks = tasks.map((task) => {
    return taskModel.run(task);
  });

  // return when all promises have been resolved
  return Promise.all(allTasks);

}).then(() => {

  // Call home with final timing
  const totalSeconds = (new Date().getTime() / 1000 | 0) - startTime;

}).then(() => {

  // Shutdown the instance
  instanceModel.destroy();

// Handle any errors
}).catch((err) => {
  console.log(err);
  instanceModel.destroy();
});
