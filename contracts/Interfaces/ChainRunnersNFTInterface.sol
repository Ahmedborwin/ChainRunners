//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ChainRunnersNFTInterface {
    function requestRandomNumber(address _athlete) external returns (uint256 requestId);

    function getTokenURIByAthlete(address _athlete) external view returns (string[] memory);
}
