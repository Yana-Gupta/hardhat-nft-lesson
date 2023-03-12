const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft", function () {
      let basicNft, tokenCounter, name, symbol
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        basicNft = await ethers.getContract("BasicNft", deployer)
      })

      describe("constructor", function () {
        it("intialize the NFT correctly..", async function () {
          tokenCounter = await basicNft.getTokenCounter()
          name = await basicNft.name()
          symbol = await basicNft.symbol()
          assert.equal(tokenCounter.toString(), "0")
          assert.equal(name.toString(), "Doggie")
          assert.equal(symbol.toString(), "DOG")
        })
      })

      describe("mintNft", function () {
        let tokenCounterInitial
        beforeEach(async () => {
          tokenCounterInitial = await basicNft.getTokenCounter()
          const txResponse = await basicNft.mintNft()
          txResponse.wait(1)
        })
        it("allows user to mint NFT, and updates details properly", async function () {
          const tokenURI = await basicNft.tokenURI(0)
          const tokenCounterAfter = await basicNft.getTokenCounter()
          assert.equal(
            tokenCounterInitial.add(1).toString(),
            tokenCounterAfter.toString()
          )
          assert.equal(tokenURI, await basicNft.TOKEN_URI())
        })
        it("shows the correct balance and owner of the NFT", async function () {
          const deployerAddress = deployer
          const deployerBalance = await basicNft.balanceOf(deployerAddress)
          const owner = await basicNft.ownerOf("0")
          assert.equal(deployerBalance.toString(), "1")
          assert.equal(owner, deployerAddress)
        })
      })
    })
