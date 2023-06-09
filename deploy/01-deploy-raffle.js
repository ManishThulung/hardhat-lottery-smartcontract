const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhar-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  // console.log(deployer, "deployer")
  // console.log(chainId, "chainId")
  // console.log(network, "network")
  let vrfCoordinatorV2Address, subscriptionId, vrfCordinatorV2Mock

  if (developmentChains.includes(network.name)) {
    vrfCordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = vrfCordinatorV2Mock.address
    const transactionResponse = await vrfCordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.events[0].args.subId
    // fund the subscription
    //usually, u need the link token on a real network
    await vrfCordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }

  const entranceFee = networkConfig[chainId]["entranceFee"]
  const gasLane = networkConfig[chainId]["gasLane"]
  const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"]
  // console.log(networkConfig, "networkConfig[chainId]")
  const interval = networkConfig[chainId]["interval"]
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    callBackGasLimit,
    subscriptionId,
    interval,
  ]
  // console.log(args, "args")

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.waitConfirmations || 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("verifying....")
    await verify(raffle.address, args)
  }

  console.log("Enter lottery with command:")
  const networkName = network.name == "hardhat" ? "localhost" : network.name
  console.log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`)

  console.log("---------------------------------------")
}

module.exports.tags = ["all", "raffle"]
