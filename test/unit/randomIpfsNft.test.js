const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains, MINT_FEE } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", function () {

      let randomIpfsNft, vrfCoordinatorV2
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
        vrfCoordinatorV2 = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        )
      })

      describe("constructor", function () {
        it("initializes all the variables correctly", async function () {
          const mintfee = await randomIpfsNft.getMintFee()
          assert.equal(mintfee.toString(), MINT_FEE.toString())
          const getTokenUri = await randomIpfsNft.getDogTokenUris
          const tokenUriZero = getTokenUri[0]
          assert(tokenUriZero.includes("ipfs://"))
        })
      })
      
      describe("requestNft", function () {
        beforeEach(async function () {
          const fee = await randomIpfsNft.getMintFee()
        })
        it("reverts if the payment is sent less", async function () {
          await expect(
            await randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError("RandomIpfsNft__NeedMoreETHSent")
        })
        it("reverts if the payment sent is less than mint fee", async function () {
          await expect(
            await randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.00001")),
            })
          ).to.be.revertedWithCustomError("RandomIpfsNft__NeedMoreETHSent")
        })

        it("emits an event at success", async function () {
          await expect(
            await randomIpfsNft
              .requestNft({ value: fee })
              .to.emit(randomIpfsNft, "NftRequested")
          )
        })
      })

      describe("", async function () {})
    })

module.exports.tags = ["all", "randomipfs"]
