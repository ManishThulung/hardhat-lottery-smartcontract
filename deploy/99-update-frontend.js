const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONTEND_ADDRESSES_FILE = "../hh-lottery-frontend/constansts/contractAddresses.json"
const FRONTEND_ABI_FILE = "../hh-lottery-frontend/constansts/abi.json"

module.exports = () => {
  if (process.env.UPDATE_FRONTEND) {
    console.log("updating frontend..")
    updateContractAddresses()
    updateAbi()
  }
}

async function updateAbi() {
  const raffle = ethers.getContract("Raffle")
  fs.writeFileSync(
    FRONTEND_ABI_FILE,
    (await raffle).interface.format(ethers.utils.FormatTypes.json)
  )
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle")
  const chainId = network.config.chainId.toString()
  const contractAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf8"))

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId].includes(raffle.address)) {
      contractAddresses[chainId].push(raffle.address)
    }
  }
  {
    contractAddresses[chainId] = [raffle.address]
  }
  fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "Frontend"]
