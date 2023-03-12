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
          const getTokenUri = await randomIpfsNft.getDogTokenUris()
          const tokenUriZero = getTokenUri[0]
          assert.equal(mintfee.toString(), MINT_FEE.toString())
          expect(tokenUriZero.includes("ipfs://"))
        })
      })

      describe("requestNft", function () {
        let fee
        beforeEach(async function () {
          fee = await randomIpfsNft.getMintFee()
        })
        it("reverts if the payment is sent less", async function () {
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })
        it("reverts if the payment sent is less than mint fee", async function () {
          await expect(
            randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.00001")),
            })
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })
        it("emits event when its successful", async function () {
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested")
        })
      })

      describe("getBreedFromModdedRng", function () {
        it("should return a pug if random number is between 0 to 9", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
          assert.equal(expectedValue.toString(), "0")
        })
        it("should return a shiba-inu if random number is betwen 10 to 39", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(37)
          assert.equal(expectedValue.toString(), "1")
        })
        it("should return a st-bernard if random number is between 40 to 99", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(97)
          assert.equal(expectedValue.toString(), "2")
        })
      })
    })
