const { network, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhar-config")
const { assert, expect } = require("chai")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Test", function () {
      let raffle, raffleEntranceFee

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe("fulfillRandomWords", function () {
        it("works with live chainlink keepers and chainlink VRF, we get a random winner", async function () {
          console.log("Setting up test...")
          const startingTimeStamp = await raffle.getLatestTimeStamp()
          const accounts = await ethers.getSigners()

          console.log("Setting up Listener...")
          await new Promise(async (resolve, reject) => {
            // setup listener before we enter the raffle
            // Just in case the blockchain moves REALLY fast
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!")
              try {
                // add our asserts here
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLatestTimeStamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
            // Then entering the raffle
            console.log("Entering Raffle...")
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
            await tx.wait(1)
            console.log("Ok, time to wait...")
            const winnerStartingBalance = await accounts[0].getBalance()

            // and this code WONT complete until our listener has finished listening!
          })
        })
        // const startingTimeStamp = await raffle.getLatestTimeStamp()
        // const accounts = await ethers.getSigners()

        // await new Promise(async (resolve, reject) => {
        //   raffle.once("WinnerPicked", async () => {
        //     console.log("WinnerPicked event fired!")
        //     try {
        //       const recentWinner = await raffle.getRecentWinner()
        //       const raffleState = await raffle.getRaffleState()
        //       const winnerEndingBalance = await accounts[0].getBalance()
        //       const endingTimeStamp = await raffle.getLatestTimeStamp()

        //       await expect(raffle.getPlayer(0)).to.be.reverted
        //       assert.equal(recentWinner.toString(), accounts[0].address)
        //       assert.equal(raffleState, 0)
        //       assert(endingTimeStamp > startingTimeStamp)

        //       assert.equal(
        //         winnerEndingBalance.toString(),
        //         winnerStartingBalance.add(raffleEntranceFee).toString()
        //       )
        //       resolve()
        //     } catch (error) {
        //       console.log(error)
        //       reject(e)
        //     }
        //   })
        //   await raffle.enterRaffle({ value: raffleEntranceFee })
        //   const winnerStartingBalance = await accounts[0].getBalance()
        // })
      })
    })
// })
