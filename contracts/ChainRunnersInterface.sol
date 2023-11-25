//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ChainRunnersInterface {
    function testReceiveAPIResponse(
        uint8 _requestType,
        address _athleteAddress,
        uint256 distance
    ) external;

    function handleAPIResponse(address _athlete, uint8 _requestType) external;
}
