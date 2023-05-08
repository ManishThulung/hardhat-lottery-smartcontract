// Raffle
// Enter the lottery (paying some amount)
// pick a random winner
// winner to be selected every X minutes
// Chainlink Oracle -> Randomness, Automated Execution (chainlink Keepers)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error Raffle__NotEnoughETHEntered();
error Raffle_TransferFailed();
error Raffle__NotOpen();
error Raffle_UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
  /* Type declaration */
  enum RaffleState {
    OPEN,
    CALCULATING
  } // uint256 0 = OPEN, 1 = CALCULATING

  // state variables
  uint256 private immutable i_entranceFee;
  address payable[] private s_players;
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane;
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATION = 3;
  uint32 private constant NUM_WORDS = 1;

  // lottery variable
  address private s_recentWinner;
  RaffleState private s_raffleState;
  uint256 private s_lastTimeStamp;
  uint32 private immutable i_interval;

  // events
  event RaffleEnter(address indexed player);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  constructor(
    address vrfCordinatorV2,
    uint256 entranceFee,
    bytes32 gasLane,
    uint32 callbackGasLimit,
    uint64 subscriptionId,
    uint32 interval
  ) VRFConsumerBaseV2(vrfCordinatorV2) {
    i_entranceFee = entranceFee;
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_raffleState = RaffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = interval;
  }

  function enterRaffle() public payable {
    // require (msg.value > i_entranceFee, "Not enough ETH!") -> not gas efficient
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }
    if (s_raffleState != RaffleState.OPEN) {
      revert Raffle__NotOpen();
    }
    s_players.push(payable(msg.sender));
    emit RaffleEnter(msg.sender);
  }

  /**
   * @dev this is the functio that chainlink keepers node call
   * they look for the `upKeepNeeded` to return true
   * the following should be true in order to return true
   * 1. The time interval should have passed
   * 2. the lottery should have at least 1 player and have some ETH
   * 3. Our subsription is funded with LINK
   * the lottery should be in an "open" state
   */
  function checkUpkeep(
    bytes memory /* checkData */
  ) public view override returns (bool upKeepNeeded, bytes memory /* performData */) {
    bool isOpen = (RaffleState.OPEN == s_raffleState);
    /**
     * block.timestamp -> gives the current time
     * s_lastTimeStamp -> the last time when the game started
     * i_interval -> specifies the time interval for the lottery game
     */
    bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
    bool hasPlayers = (s_players.length > 0);
    bool hasBalance = address(this).balance > 0;
    upKeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
  }

  function performUpkeep(bytes calldata /* performData */) external override {
    // request the random number
    // once we get it, do something with it
    // 2 transaction precess
    (bool upKeepNeeded, ) = checkUpkeep("");
    if (!upKeepNeeded) {
      revert Raffle_UpKeepNotNeeded(
        address(this).balance,
        s_players.length,
        uint256(s_raffleState)
      );
    }
    s_raffleState = RaffleState.CALCULATING; // while we r deciding the winner, nobody can enter
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATION,
      i_callbackGasLimit,
      NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);
  }

  function fulfillRandomWords(
    uint256 /*requestId*/,
    uint256[] memory randomWords
  ) internal override {
    uint256 indexOfWinner = randomWords[0] % s_players.length;
    address recentWinner = s_players[indexOfWinner];
    s_recentWinner = recentWinner;
    s_raffleState = RaffleState.OPEN; // once we decide the winner other players can join too
    s_players = new address payable[](0);
    s_lastTimeStamp = block.timestamp;
    (bool success, ) = recentWinner.call{value: address(this).balance}("");

    if (!success) {
      revert Raffle_TransferFailed();
    }
    emit WinnerPicked(recentWinner);
  }

  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  function getRaffleState() public view returns (RaffleState) {
    return s_raffleState;
  }

  function getNumWords() public pure returns (uint256) {
    return NUM_WORDS;
  }

  function getNumberOfPlayers() public view returns (uint256) {
    return s_players.length;
  }

  function getLatestTimeStamp() public view returns (uint256) {
    return s_lastTimeStamp;
  }

  function getRequestConfirmation() public pure returns (uint256) {
    return REQUEST_CONFIRMATION;
  }

  function getInterval() public view returns (uint256) {
    return i_interval;
  }
}
