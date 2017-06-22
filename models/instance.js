module.exports = (aws, instanceId) => {
  const ec2 = new aws.EC2();

  const destroy = () => {
    return;
    // Terminate aws instance
    const params = {InstanceIds: [instanceId], DryRun: false};
    ec2.terminateInstances(params).promise().then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  };

  // automatically kill in 50 minutes
  setTimeout(() => {
    destroy();
  }, 50 * 60 * 1000);

  // kill any times
  return {
    destroy: () => {
      destroy();
    }
  }
};
