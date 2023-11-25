//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./CRLinkReqInterface.sol";
import "./crChainlinkRequestConsumer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//errors
error ChainRunners__CompStatusNotAsExpected(uint8 currentStatus);
error ChainRunners__UsernameTaken();
error ChainRunners__NotRegisteredAthlete();
error ChainRunners__UnableToRefundTokensToAthlete(address athleteAddress);

contract ChainRunners is Ownable {
    modifier onlyAdmin(address _caller, uint256 _compId) {
        uint256 competitionIndex = _compId - 1;
        require(
            _caller == competitionList[competitionIndex].administrator,
            "Only Competition Admin Can Call this function"
        );
        _;
    }
    modifier isRegisteredAthlete(address _caller) {
        if (athleteTable[msg.sender].registeredAthlete != true) {
            revert ChainRunners__NotRegisteredAthlete();
        }
        _;
    }

    enum CompetitionStatus {
        pending,
        inProgress,
        completed,
        aborted
    }

    enum requestType {
        beginCompeition,
        payoutEvent
    }

    //Athlete Struct
    struct athleteProfile {
        string username;
        string stravaUserId;
        uint256[] activeCompetitions;
        uint256 competitionsWon;
        uint256 totalMiles;
        bool registeredAthlete;
    }

    struct competitionForm {
        uint256 id;
        string name;
        CompetitionStatus status;
        address administrator;
        bool isLive;
        uint256 stake;
        uint256 startDate;
        uint256 durationDays;
        uint256 endDate;
        uint256 nextPayoutDate;
        uint256 payoutIntervals;
        uint256 startDeadline;
        uint256 buyIn;
        uint256 totalStaked;
    }

    //state variables
    CRLinkReqInterface public i_linkReq;
    uint256 public competitionId;
    uint256 public appAccessTokenExpires;
    uint256 internal dappFee;

    //initialise structs
    competitionForm competition;
    athleteProfile athlete;

    //arrays
    competitionForm[] public competitionList;
    athleteProfile[] public athleteList;

    //chainlink Variables
    // Apps Chainlink SlotId
    uint256 appSlotId;
    uint256 appAccessTokenExpireDate;

    //----------------------------------------
    //TEST VARIABLES _ SHOULD BE DELETED AFTER
    //----------------------------------------
    uint256 public testInteger;
    string public testString;
    address public testAddress;
    requestType public requesttype;

    //----------------------------------------
    //----------------------------------------

    //Mapings
    mapping(address => athleteProfile) public athleteTable; //Athlete mapping - address to Struct
    mapping(uint256 => address[]) public athleteListByComp;
    mapping(uint256 => bool) public competitionIsLive;
    mapping(uint256 => competitionForm) public competitionTable; //Comp Id to CompForm
    mapping(string => bool) public usernameTable; //username to bool
    mapping(address => mapping(uint256 => uint256)) public stakedByAthleteByComp;
    mapping(address => uint256) public refundBalanceOwedToAthlete;

    event athleteProfileCreated(address indexed athlete, string indexed username);
    event UsernameTaken(string username);
    event newCompetitionCreated(uint256 indexed compId, uint256 indexed buyIn);
    event athleteJoinedCompetition(
        uint256 indexed compId,
        address indexed athleteAddress,
        uint256 indexed stake
    );
    event competitionStarted(
        uint256 compId,
        address[] competingAthletes,
        uint256 startDate,
        uint256 endDate,
        uint256 nextPayout
    );
    event competitionAborted(uint256 indexed CompetitionId);

    constructor(address _linkReq) {
        i_linkReq = CRLinkReqInterface(_linkReq);
    }

    /**
     *
     * @param _username Athlete to provide their username
     * @param _stravaUserId Athlete to Provide their _stravaId
     * Require that address is not registered to an existing athlete
     * Require that username is not already registered
     * @dev Creates new athlete profile as a struct and stores this in mapping with address as the Unique Identifier
     * @dev updates username table
     * @dev emits athleteProfileCreated event
     */
    function createAthlete(string calldata _username, string calldata _stravaUserId) external {
        if (usernameTable[_username] == true) {
            //emit event
            emit UsernameTaken(_username);
            revert ChainRunners__UsernameTaken();
        }
        require(!athleteTable[msg.sender].registeredAthlete, "Address Registered to An Athlete");

        //create athlete mapping
        athlete.username = _username;
        athlete.stravaUserId = _stravaUserId;
        athlete.registeredAthlete = true;
        athleteTable[msg.sender] = athlete;

        //add username to existing username table
        usernameTable[_username] = true;

        emit athleteProfileCreated(msg.sender, _username);
    }

    /**
     *
     * @param _buyin ether amount required to enter competition
     * @param _durationDays length of competition - expected in days
     * @param _payoutIntervals length of time between payout intervals
     * @dev NEED TO RETHINK THE PAYOUT INTERVALS - WILL CAUSE ISSUES AND WILL REQUIRE TOO MANY CHECKS
     * @dev COULD USE ENUMS FOR THE DURATION AND INTERVALS TO MAKE SURE THE MATHS WILL ALWAYS ADD UP
     * @dev Requires that ether sent is equal to the buyin amount and that caller is a registered athlete
     * @dev initialise competition form as struct and add to both mapping and array
     * @dev NEED ARRAY FOR LIVE COMPETITIONS ONLY - CURRENT ARRAY IS FOR ALL COMPETITIONS CREATED
     * @dev newCompetitionCreated event is emitted
     */
    function createCompetition(
        string calldata _name,
        uint256 _buyin,
        uint256 _durationDays,
        uint256 _payoutIntervals
    ) external payable isRegisteredAthlete(msg.sender) {
        require(msg.value == _buyin, "Incorrect Buy In Amount Sent");

        //increment ID for compteition
        competitionId++;

        //populate Form
        competition.id = competitionId;
        competition.isLive = false;
        athleteListByComp[competitionId].push(msg.sender);
        competition.name = _name;
        competition.totalStaked += msg.value;
        competition.buyIn = _buyin;
        competition.administrator = msg.sender;
        competition.status = CompetitionStatus.pending;
        competition.durationDays = _durationDays * 60 * 60 * 24;
        competition.payoutIntervals = _payoutIntervals * 60 * 60 * 24;
        //7 day deadline for competition to start otherwise it is Auto aborted
        competition.startDeadline = 7 * 60 * 60 * 24;
        //populate mapping with new competition struct
        competitionTable[competitionId] = competition;

        //update mapping with amount staked by athlete for _compID
        stakedByAthleteByComp[msg.sender][competitionId] = msg.value;

        //push comptition into array
        competitionList.push(competition);

        emit newCompetitionCreated(competition.id, _buyin);
    }

    /**
     *
     * @param _compId caller confirms the Id of the Competition they wish to join
     * @dev Required to send ether equal to buyIn and for caller to be a registered athlete
     * @dev update list of competing athletes by Compeition Id to include new competitor
     * @dev update amount stake for competition
     * @dev emit athleteJoinedCompetition event
     */
    function joinCompetition(uint256 _compId) external payable isRegisteredAthlete(msg.sender) {
        competitionForm storage _competition = competitionTable[_compId];
        require(msg.value == competition.buyIn, "Incorrect BuyIn Amount");

        //update total staked
        _competition.totalStaked += msg.value;

        //add athlete to competition and amount staked
        athleteListByComp[competitionId].push(msg.sender);

        //update mapping with amount staked by athlete for _compID
        stakedByAthleteByComp[msg.sender][_compId] = msg.value;

        emit athleteJoinedCompetition(_compId, msg.sender, msg.value);
    }

    /**
     *
     * @param _compId the id of the competition
     * @dev only competition admin can call this function and at least two competitors required
     */
    function commenceCompetition(uint256 _compId) external onlyAdmin(msg.sender, _compId) {
        require(athleteListByComp[_compId].length >= 2, "Atleast two competitors required");

        //populate mapping with new competition struct
        competition = competitionTable[_compId];

        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }

        //set Comp Status
        competition.status = CompetitionStatus.inProgress;
        //set start date
        competition.startDate = block.timestamp;
        //set end date
        competition.endDate = block.timestamp + competition.durationDays;
        //set next reward interval
        competition.nextPayoutDate = block.timestamp + competition.payoutIntervals;
        // take fee
        uint256 fee = (competition.stake * 5) / 100;
        competition.stake -= fee;
        dappFee += fee;

        //Assign updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        //Need to get the atheletes current Miles logged
        //************************
        //this function is still under build
        for (uint8 i = 0; i <= athleteListByComp[_compId].length; i++) {
            address[] memory listAthletes = athleteListByComp[_compId];
            //Call handleAPIRequest and pass athletes address
            handleAPICall(
                uint8(requestType.beginCompeition),
                listAthletes[i],
                athleteTable[listAthletes[i]].stravaUserId
            );
        }
        //************************
        //should we set comp to Live here or on the back of retrieving their current miles?
        //setLive status to competition mapping
        competitionIsLive[_compId] = true;
        // athleteTable[athleteListByComp[_compId][i]].activeCompetitions.push(_compId);

        emit competitionStarted(
            _compId,
            athleteListByComp[_compId],
            competition.startDate,
            competition.endDate,
            competition.nextPayoutDate
        );
    }

    function handlePayoutEvent() public {
        for (uint256 i = 0; i <= competitionList.length; i++) {
            competitionForm memory _competition = competitionList[i];
            address[] memory athleteListbyComp = athleteListByComp[i];

            //check if competitionId is set to live on isLive mapping
            if (
                competitionIsLive[_competition.id] == true &&
                _competition.nextPayoutDate >= block.timestamp
            ) {
                for (uint256 j = 0; j <= athleteListbyComp.length; j++) {
                    handleAPICall(
                        uint8(requestType.payoutEvent),
                        athleteListbyComp[j],
                        athleteTable[athleteListbyComp[j]].stravaUserId
                    );
                }
            }
        }
    }

    function handleAPICall(uint8 _requestType, address _athlete, string memory _stravaId) internal {
        //call consumer contract and pass address of athlete
        string[] memory args = new string[](1);
        args[0] = _stravaId;

        //need to think about the what to record and why
        i_linkReq.sendRequest(_requestType, args, _athlete);

        //emit event?
    }

    function handleAPIResponse(uint8 _requestType, address _athlete, uint256 _distance) external {
        //needs to be only consumer
        // figure out who the winner is
        //if all zeros deal then end
        //largest > than min miles? if not deal with scenario
    }

    function endCompetition() public {
        //
    }

    function abortCompetition(uint256 _compId) public onlyAdmin(msg.sender, _compId) {
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }

        //retrieve comp tables
        competitionForm storage _competition = competitionTable[competitionId];

        //update status
        _competition.status = CompetitionStatus.aborted;

        //return funds to stakers
        for (uint8 i = 0; i < athleteListByComp[competitionId].length; i++) {
            uint256 amountStaked = stakedByAthleteByComp[athleteListByComp[competitionId][i]][
                _compId
            ];

            (bool sent, ) = athleteListByComp[competitionId][i].call{value: amountStaked}("");

            if (!sent) {
                //moves monies owed to
                refundBalanceOwedToAthlete[athleteListByComp[competitionId][i]] += amountStaked;
            }
            _competition.totalStaked -= amountStaked;
        }

        //set isLive to false
        competitionIsLive[_compId] = false;

        emit competitionAborted(_compId);
    }

    //helper function

    //owner can update his apps access token expiry date
    function updateAppAccessTokenExpires(uint256 _newExpiryDate) external onlyOwner {
        appAccessTokenExpires = _newExpiryDate;
    }

    function bytesToUint(bytes memory _bytes) public pure returns (uint256) {
        uint256 number;
        for (uint i = 0; i < _bytes.length; i++) {
            number = number + uint(uint8(_bytes[i])) * (2 ** (8 * (_bytes.length - (i + 1))));
        }
        return number;
    }

    //getter functions
    function getAthleteList(uint256 _compId) external view returns (address[] memory) {
        return athleteListByComp[_compId];
    }

    function getStakedByCompByAthlete(
        address _athlete,
        uint256 _compId
    ) external view returns (uint256) {
        stakedByAthleteByComp[_athlete][_compId];
    }

    function testReceiveAPIResponse(
        uint8 _requestType,
        address _athleteAddress,
        uint256 _distance
    ) external {
        testInteger = _distance;
        testAddress = _athleteAddress;
        requesttype = requestType(_requestType);
    }
}
