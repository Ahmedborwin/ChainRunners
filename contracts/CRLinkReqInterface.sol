// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface CRLinkReqInterface {
    function sendRequest(string[] memory args) external returns (bytes32 requestId);

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) external;

    function populateString(string calldata _string) external;

    function getAPICallString() external view returns (string memory);
}
