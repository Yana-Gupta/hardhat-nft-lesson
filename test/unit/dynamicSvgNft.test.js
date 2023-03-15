const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("DynamicSvgNft", function () {
      let dynamicSvgNft, name, symbol, tokenCounter
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
      })
      describe("constructor", function () {
        it("initializes the nft correctly...", async function () {
          tokenCounter = await dynamicSvgNft.getTokenCounter()
          name = await dynamicSvgNft.name()
          symbol = await dynamicSvgNft.symbol()
          assert.equal(tokenCounter.toString(), "0")
          assert.equal(name.toString(), "Dynamic SVG NFT")
          assert.equal(symbol.toString(), "DSN")
        })
      })

      describe("", function () {})
    })
