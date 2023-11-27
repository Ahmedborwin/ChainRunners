// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "./ChainRunnersInterface.sol";
/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
error UnexpectedRequestID(bytes32 requestId);

contract crChainlinkRequestConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    modifier onlyAuthorised(address _caller) {
        if (_caller != chainRunnersAddress || _caller != owner()) {
            revert("Cannot make this call, only admin and owner");
        }
        _;
    }
    enum requestType {
        beginCompeition,
        payoutEvent
    }

    //Prepopulated Variables for Athlete Stats API Call
    string public getAthleteStatsJS;
    bytes32 public donID;
    uint64 public subscriptionId;
    uint64 public donHostedSecretsVersion;
    uint8 public donHostedSecretsSlotID;
    uint32 constant DEFAULT_GAS_LIMIT = 300000;

    // state variables
    address chainRunnersAddress;
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    ChainRunnersInterface i_chainrunners;

    //Data Structures to deal with API Call from Chainrunners
    mapping(bytes32 => address) public requestIdToAthleteAddress;
    mapping(bytes32 => requestType) public requestIdToRequestType;
    mapping(bytes32 => uint256) public requestIdToCompId;

    //events
    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Send a simple request
     * @param args expects the Athletes Strava userId as an arg
     */
    function sendRequest(
        uint8 _requestType,
        string[] memory args,
        address _athleteAddress,
        uint256 _compId
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(getAthleteStatsJS);
        if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);
        }
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, DEFAULT_GAS_LIMIT, donID);

        requestIdToAthleteAddress[s_lastRequestId] = _athleteAddress;
        requestIdToRequestType[s_lastRequestId] = requestType(_requestType);
        requestIdToCompId[s_lastRequestId] = _compId;

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
        s_lastResponse = response;
        s_lastError = err;

        uint256 distance = bytesToUint(s_lastResponse);

        //call chainrunners and pass back athlete address and distance
        i_chainrunners.handleAPIResponse(
            uint8(requestIdToRequestType[requestId]),
            requestIdToAthleteAddress[requestId],
            distance,
            requestIdToCompId[requestId]
        );

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

    function populateVersionSecret(uint64 _secretsVersion) external {
        donHostedSecretsVersion = _secretsVersion;
    }

    function populateDONSlotID(uint8 _slotId) external {
        donHostedSecretsSlotID = _slotId;
    }

    function setAdmin(address _chainRunnersAddress) external onlyOwner {
        chainRunnersAddress = _chainRunnersAddress;
    }

    function setChainRunnerInterfaceAddress(address _chainrunners) external onlyOwner {
        i_chainrunners = ChainRunnersInterface(_chainrunners);
    }

    function getLastResponse() external view returns (bytes memory) {
        return s_lastResponse;
    }

    function bytesToUint(bytes memory b) public pure returns (uint256) {
        uint256 number;
        for (uint i = 0; i < b.length; i++) {
            number = number + uint(uint8(b[i])) * (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }
}
