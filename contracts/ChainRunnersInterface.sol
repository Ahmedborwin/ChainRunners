//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ChainRunnersInterface {
    function handleAPIResponse(
        uint8 _requestType,
        address _athleteAddress,
        uint256 _distance
    ) external;
}
