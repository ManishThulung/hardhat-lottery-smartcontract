const { ethers } = require("hardhat")

const networkConfig = {
  // 11155111: {
  //   name: "sepolia",
  //   vrfCoordinatorV2: "0x8204c193ade6a1bb59bef25b6a310e417953013f",
  //   entranceFee: ethers.utils.parseEther("0.01"),
  //   gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
  //   subscriptionId: "12334",
  //   callBackGasLimit: "500000",
  //   interval: "30",
  // },
  11155111: {
    name: "sepolia",
    subscriptionId: "2550",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
    interval: "30",
    entranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
    callBackGasLimit: "500000", // 500,000 gas
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
  },
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x8204c193ade6a1bb59bef25b6a310e417953013f",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "12334",
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
