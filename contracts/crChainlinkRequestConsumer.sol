// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract crChainlinkRequestConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;

    string public getAthleteStatsJS;
    bytes public s_lastResponse;
    bytes public s_lastError;
    bytes32 public donID;
    uint64 subscriptionId;
    uint32 constant DEFAULT_GAS_LIMIT = 300000;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Send a simple request
  
     * @param args List of arguments accessible from within the source code
     */
    function sendRequest(string[] memory args) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(getAthleteStatsJS);
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, DEFAULT_GAS_LIMIT, donID);
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        bytesToUint(s_lastResponse);
        s_lastError = err;
        emit Response(requestId, s_lastResponse, s_lastError);
    }

    //Helper functions

    function populateAPICallJS(string calldata _string) public {
        getAthleteStatsJS = _string;
    }

    function populateDonId(bytes32 _donId) public {
        donID = _donId;
    }

    function populateSubId(uint64 _subscriptionId) external {
        subscriptionId = _subscriptionId;
    }

    function transferOwner(address _newOwner) external onlyOwner {
        transferOwnership(_newOwner);
    }

    //helper functions

    function getLastResponse() external view returns (bytes memory) {
        return s_lastResponse;
    }

    function getAPICallString() external view returns (string memory) {
        return getAthleteStatsJS;
    }

    function bytesToUint(bytes memory b) public pure returns (uint256) {
        uint256 number;
        for (uint i = 0; i < b.length; i++) {
            number = number + uint(uint8(b[i])) * (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }
}
