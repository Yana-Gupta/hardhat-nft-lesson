// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

// error

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
  uint256 private s_tokenCounter;
  string private i_lowImageURI;
  string private i_highImageURI;
  string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
  string private constant base64EndodedJsonPrefix =
    "data:application/json;base64,";

  mapping(uint256 => int256) public s_tokenIdToHighValue;

  AggregatorV3Interface internal immutable i_priceFeed;

  // Events
  event CreatedNFT(uint256 indexed tokenId, int256 highValue);

  constructor(
    address priceFeedAddress,
    string memory lowSvg,
    string memory highSvg
  ) ERC721("Dynamic SVG NFT", "DSN") {
    s_tokenCounter = 0;
    i_highImageURI = svgToImageURI(highSvg);
    i_lowImageURI = svgToImageURI(lowSvg);
    i_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  function svgToImageURI(
    string memory svg
  ) public pure returns (string memory) {
    // abi.encodePacked -> globally available method -> converts anything to its binary format
    string memory svgBase64Encoded = Base64.encode(
      bytes(string(abi.encodePacked(svg)))
    );
    return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
  }

  function mintNft(int256 highValue) public {
    s_tokenIdToHighValue[s_tokenCounter] = highValue;
    _safeMint(msg.sender, s_tokenCounter);
    s_tokenCounter++;
    emit CreatedNFT(s_tokenCounter, highValue);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override returns (string memory) {
    if (!_exists(tokenId)) {
      revert ERC721Metadata__URI_QueryFor_NonExistentToken();
    }

    // Get the price from AggregatorV3
    (, int256 price, , , ) = i_priceFeed.latestRoundData();
    string memory imageURI = i_lowImageURI;
    if (price >= s_tokenIdToHighValue[tokenId]) {
      imageURI = i_highImageURI;
    }
    return
      string(
        abi.encodePacked(
          base64EndodedJsonPrefix,
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name":"',
                name(), 
                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                imageURI,
                '"}'
              )
            )
          )
        )
      );
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
