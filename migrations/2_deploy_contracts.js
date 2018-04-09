var Chainlist = artifacts.require("./Chainlist.sol");

module.exports = function(deployer) {
  deployer.deploy(Chainlist);
}
