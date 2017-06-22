const commit = {
  provider: process.env.provider,
  owner: process.env.owner,
  repo: process.env.repo,
  hash: process.env.hash,
  status_callback: process.env.status_callback,
  final_callback: process.env.final_callback
};
const repoPath = __dirname + '/repo';
const startTime = new Date().getTime() / 1000 | 0;
const aws = require(__dirname + '/models/aws.js')();
const instanceModel = require(__dirname + '/models/instance.js')(aws, process.env.instanceId);
const repoModel = require(__dirname + '/models/repo.js')(aws, commit, repoPath);
const taskModel = require(__dirname + '/models/task.js')(aws, commit, repoPath, repoModel);

// Read provider token from aws
repoModel.retrieveToken().then((providerToken) => {
  repoModel.clone(providerToken.access_token);
  repoModel.reset();
  return repoModel.parseTasks().tasks;
}).then((tasks) => {

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
  //instanceModel.destroy();
  process.exit()

// Handle any errors
}).catch((err) => {
  console.log('ERROR');
  console.log(err);
  instanceModel.destroy();
  process.exit(1);
});
