// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface CRLinkReqInterface {
    function sendRequest(
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
    ) external returns (bytes32 requestId);

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) external;

    function populateString(string calldata _string) external;

    function getStringTest() external view returns (string memory);
}
