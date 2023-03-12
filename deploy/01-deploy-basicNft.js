const { network } = require("hardhat")

const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("-----------------------------")

  const args = []

  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args: args,
    log: true,
    waitConformations: network.config.blockConformations || 1,
  })
  log("Deployed Successfully !!!!!!")
  log("--------------------------------------")

  if (!developmentChains.includes(network.name)) {
    log("Verifying...")
    await verify(basicNft.address, args)
  }
}

module.exports.tags = ["all", "basicNft"]
