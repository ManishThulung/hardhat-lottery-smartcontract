const { network, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhar-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Test", async function () {
      let deployer, raffle, vrfCoordinatorV2Mock, entranceFee
      const chainId = network.config.chainId

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        entranceFee = await raffle.getEntranceFee()
      })

      describe("constructor", async function () {
        it("initialize the raffle correctly", async function () {
          const raffleState = await raffle.getRaffleState()
          const interval = await raffle.getInterval()
          assert.equal(raffleState.toString(), "0")
          assert.equal(interval.toString(), networkConfig[chainId]["interval"])
        })
      })

      describe("enterRaffle", async function () {
        // it("reverts when you don't pay enough", async function () {
        //   const entranceFee = await raffle.getEntranceFee()
        //   const raffleState = await raffle.getRaffleState()
        //   assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
        //   assert.equal(raffleState.toString(), "0")
        // })
        it("reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered")
        })
        it("records players when they enter", async function () {
          await raffle.enterRaffle({ value: entranceFee })
          const playerFromContract = await raffle.getPlayer(0)
          assert.equal(playerFromContract, deployer)
        })
      })
    })
