// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface CRLinkReqInterface {
    function sendRequest(
        uint8 _requestType,
        string[] memory args,
        address _athleteAddress
    ) external returns (bytes32 requestId);

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) external;

    function getAPICallString() external view returns (string memory);

    function getLastResponse() external view returns (bytes memory);
}
