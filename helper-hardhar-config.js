const { ethers } = require("hardhat")

const networkConfig = {
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x8204c193ade6a1bb59bef25b6a310e417953013f",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "0",
    callBackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callBackGasLimit: "500000",
    interval: "30",
  },
}

const developmentChains = ["hardhat", "locahost"]

module.exports = {
  networkConfig,
  developmentChains,
}
