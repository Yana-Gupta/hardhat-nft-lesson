const { network, ethers } = require("hardhat")
const fs = require("fs")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments
  const chainId = network.config.chainId
  let AggregatorV3MockAddress

  if (developmentChains.includes(network.name)) {
    const AggregatorV3Mock = await ethers.getContract("MockV3Aggregator")
    AggregatorV3MockAddress = AggregatorV3Mock.address
  } else {
    AggregatorV3MockAddress = networkConfig[chainId].ethUsdPriceFeed
  }

  const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf-8",
  })
  const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf-8",
  })

  const args = [AggregatorV3MockAddress, lowSvg, highSvg]

  log("----------------------------------")

  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConformations: network.config.blockConformations || 1,
  })

  log("Random IPFS NFT successfully deployed !!!")
  log("---------------------------------------")
  if (!developmentChains.includes(network.name)) {
    log("Verifying....")
    await verify(dynamicSvgNft.address, args)
  }
}

module.exports.tags = ["all", "dynamicsvgnft"]
