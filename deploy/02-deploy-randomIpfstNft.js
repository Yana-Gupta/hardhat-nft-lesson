const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const {
  storeImages,
  storeTokenURIMetadata,
} = require("../utils/uploadToPinata")
require("dotenv").config()

const metaDataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_types: "cuteness",
      value: 100,
    },
  ],
}

const MINT_FEE = ethers.utils.parseEther("0.01")
const IMAGE_LOCATION = "./images/randomNft"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments
  const chainId = network.config.chainId

  // Get the IPFS of our images

  let vrfCoordinatorV2Address, subId, gasLane, callbackGasLimit

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    )
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

    const txResponse = await vrfCoordinatorV2Mock.createSubscription()
    const txRecipt = await txResponse.wait()
    subId = txRecipt.events[0].args.subId
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    subId = networkConfig[chainId].subscriptionId
  }

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris()
    console.log(tokenUris)
  }

  gasLane = networkConfig[chainId].gasLane
  callbackGasLimit = networkConfig[chainId].callbackGasLimit

  log("-------------------------------")

  const args = [
    vrfCoordinatorV2Address,
    subId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    MINT_FEE,
  ]

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConformations: network.config.blockConformations || 1,
  })

  log("Successfully Deployed !!!!!")
  log("-------------------------------")

  if (!developmentChains.includes(network.name)) {
    log("Verifying....")
    await verify(randomIpfsNft.address, args)
  }
}

async function handleTokenUris() {
  let tokenUris = []

  const { responses: imageUploadResponses, files } = await storeImages(
    IMAGE_LOCATION
  )

  for (imageUploadResponseIndex in imageUploadResponses) {
    // Stroing all the informations of that metadata
    let tokenUriMetadata = { ...metaDataTemplate }
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".pug", "")
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name}`
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

    console.log(`Uploading ${tokenUriMetadata.name} to pinata...`)

    const metadataUploadResponse = await storeTokenURIMetadata(tokenUriMetadata)
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
  }

  return tokenUris
}

module.exports.tags = ["all", "randomipfs"]
