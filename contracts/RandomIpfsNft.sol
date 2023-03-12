// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  // Type of the Dog
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint256 internal immutable i_mintFee;
  uint64 private immutable i_subcriptionId;
  bytes32 private immutable i_gasLane;
  uint16 private immutable i_callbackGasLimit;

  uint16 private constant REQUEST_CONFORMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  // Token Count
  uint256 public s_tokenCounter;
  uint16 private constant MAX_CHANCE_VALUE = 100;

  // String array for storing URI's
  string[] internal s_dogTokenUris;

  mapping(uint256 => address) public s_requestIdToSender;

  // Events
  event NftRequested(uint256 indexed requestId, address requester);
  event NftMinted(Breed dogBreed, address minter);

  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint16 callbackGasLimit,
    string[3] memory dogTokenUris,
    uint256 mintFee
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subcriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
  }

  function requestNft() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) {
      revert RandomIpfsNft__NeedMoreETHSent();
    }
    requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subcriptionId,
      REQUEST_CONFORMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );
    s_requestIdToSender[requestId] = msg.sender;
    emit NftRequested(requestId, msg.sender);
  }

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    if (!success) revert RandomIpfsNft__TransferFailed();
  }

  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWord
  ) internal override {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    // Get the breed from moddedRng() - getBreedFromModdedRng()

    uint256 moddedRng = randomWord[0] % MAX_CHANCE_VALUE;
    Breed dogBreed = getBreedFromModdedRng(moddedRng);
    _safeMint(dogOwner, newTokenId);
    _setTokenURI(newTokenId, s_dogTokenUris[uint16(dogBreed)]);
    emit NftMinted(dogBreed, dogOwner);
  }

  function getBreedFromModdedRng(
    uint256 moddedRng
  ) public pure returns (Breed dog) {
    uint16 cumulativeSum = 0;
    uint16[3] memory chanceArray = getChanceArray();
    for (uint256 i = 0; i < 3; i++) {
      if (
        moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]
      ) {
        return Breed(i);
      }
      cumulativeSum += chanceArray[i];
    }
  }

  function getChanceArray() public pure returns (uint16[3] memory chanceArray) {
    return [10, 30, MAX_CHANCE_VALUE];
  }

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogTokenUris()
    public
    view
    returns (string[] memory dogTokenUris)
  {
    return s_dogTokenUris;
  }

  function getTokenCounter() public view returns (uint256 tokenCount) {
    return s_tokenCounter;
  }
}
