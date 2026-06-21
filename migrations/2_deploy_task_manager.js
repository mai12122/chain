const Migrations = artifacts.require("Migrations");
const TaskManager = artifacts.require("TaskManager");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TaskManager);
};
