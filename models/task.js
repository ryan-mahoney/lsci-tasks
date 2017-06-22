const ansi = require('ansi-to-html')
const convert = new ansi();
const request = require('axios');
const execSync = require('child_process').execSync;
const spawnSync = require('child_process').spawnSync;

module.exports = (aws, commit, repoPath, repoModel) => {

  const run = (task) => {

    // start timer
    const startTime = new Date().getTime() / 1000 | 0;

    // run a task synchronously
    const taskPath = repoPath + '/lsci/' + task.name;
    const outputPath = taskPath + '/output';
    const runPath = taskPath + '/run.sh';
    const dirCommand = `mkdir -p ${outputPath}`
    const touchCommand = `touch ${runPath}`
    const chmodCommand = `chmod +x ${runPath}`
    execSync(dirCommand);
    execSync(touchCommand);
    execSync(chmodCommand);
    const result = spawnSync('./run.sh', {cwd: taskPath, shell: '/bin/bash', encoding: 'utf-8'});
    const totalSeconds = (new Date().getTime() / 1000 | 0) - startTime;
    const state = (result.status == 1) ? 'failure' : 'success';
    const stdout = convert.toHtml(result.stdout);
    const stderr = convert.toHtml(result.stderr);
    const status = {provider: commit.provider, tasks: [{
      name: task.name,
      state: state,
      target_url: "",
      description: task.messages[state],
      context: 'lsci'}]};

    var asyncTasks = [];
    asyncTasks.push(repoModel.uploadStdout(task.name, stdout));
    asyncTasks.push(repoModel.uploadStderr(task.name, stderr));

    // call home with result
    asyncTasks.push(request.post(commit.status_callback, status));

    // TODO: save any other generated files to S3

    // run subtasks
    const subtasks = task.tasks || [];
    subtasks.forEach((subtask) => {
      asyncTasks.push(run(subtask));
    });

    // return promise when all subtasks are done
    return Promise.all(asyncTasks);
  };

  return {
    run: (task) => {
      return run(task);
    }
  };
};
