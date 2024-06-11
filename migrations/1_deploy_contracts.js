const PetManagementv2 = artifacts.require("PetManagementv2");
const UserManagement = artifacts.require("UserManagement");

module.exports = async function(deployer) {
  await deployer.deploy(PetManagementv2);
  await deployer.deploy(UserManagement);
};
