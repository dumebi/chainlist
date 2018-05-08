var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
//
// var Migrations = artifacts.require("./Contract.sol");
// module.exports = function(deployer) {
//     deployer.deploy(Contract);
// };
