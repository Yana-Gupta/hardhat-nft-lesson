const ethers = require("ethers")

const networkConfig = {
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    enterenceFee: ethers.utils.parseEther("1.0"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "10633",
    callbackGasLimit: "5000000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    enterenceFee: ethers.utils.parseEther("1.0"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "0",
    callbackGasLimit: "50000",
    interval: "30",
  },
}

const MINT_FEE = ethers.utils.parseEther("0.01")
const developmentChains = ["hardhat", "localhost"]

module.exports = { networkConfig, developmentChains, MINT_FEE }
