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
        beginCompetition,
        payoutEvent
    }

    //Athlete Struct
    struct athleteProfile {
        string username;
        string stravaUserId;
        uint256 competitionsWon;
        uint256 totalMeters;
        bool registeredAthlete;
    }

    struct EventResults {
        address winnnersAddress;
        uint256 metersLogged;
    }

    struct competitionForm {
        uint256 id;
        string name;
        CompetitionStatus status;
        address administrator;
        uint256 stake;
        uint256 startDate;
        uint256 durationDays;
        uint256 endDate;
        uint256 nextPayoutDate;
        uint256 payoutIntervals;
        uint256 startDeadline;
        uint256 buyIn;
        uint256 totalStaked;
        uint256 rewardPot;
    }

    //state variables
    CRLinkReqInterface public i_linkReq;
    uint256 public competitionId;
    uint256 public appAccessTokenExpires;
    uint256 public dappFee;

    //initialise structs
    competitionForm competition;
    athleteProfile athlete;
    EventResults eventresults;

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
    mapping(address => uint8[]) public athleteToCompIdList; //Allow front end to access competition info using athlete address
    mapping(uint256 => bool) public competitionIsLive;
    mapping(uint256 => competitionForm) public competitionTable; //Comp Id to CompForm
    mapping(string => bool) public usernameTable; //username to bool
    mapping(address => mapping(uint256 => uint256)) public stakedByAthleteByComp;
    mapping(address => uint256) public refundBalanceOwedToAthlete;
    mapping(address => uint256) public rewardBalanceOwedToAthlete;
    mapping(uint256 => uint8) public startCompCallCounter;
    mapping(uint256 => uint8) public payoutEventAPIResponseCounter; //count the payoutEvent responses by compId
    //trying something.......
    mapping(uint256 => uint8) public compPayoutId; //count the number of payoutEvents recorded by compId
    mapping(uint256 => mapping(uint8 => EventResults)) public eventResultsMapping; //compId to payoutId to event results
    //events
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
    event winnerPicked(address winnnersAddress, uint256 winnings);

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
        athleteListByComp[competitionId].push(msg.sender);
        competition.name = _name;
        competition.totalStaked += msg.value;
        competition.buyIn = _buyin;
        competition.administrator = msg.sender;
        competition.status = CompetitionStatus.pending;
        competition.durationDays = _durationDays;
        competition.payoutIntervals = _payoutIntervals;
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

        //Need to get the atheletes current Miles logged
        //************************
        for (uint8 i = 0; i < athleteListByComp[_compId].length; i++) {
            address[] memory listAthletes = athleteListByComp[_compId];
            //Call handleAPIRequest and pass athletes address
            handleAPICall(
                uint8(requestType.beginCompetition),
                athleteTable[listAthletes[i]].stravaUserId,
                listAthletes[i],
                _compId
            );
        }
    }

    function handleStartCompetition(uint256 _compId) internal {
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }
        //populate mapping with new competition struct
        competition = competitionTable[_compId];
        //set Comp Status
        competition.status = CompetitionStatus.inProgress;
        //set start date
        competition.startDate = block.timestamp;
        //set end date
        competition.endDate = block.timestamp + (competition.durationDays * 60 * 60 * 24);
        //set next reward interval
        competition.nextPayoutDate = block.timestamp + (competition.payoutIntervals * 60 * 60 * 24);
        // take fee
        uint256 fee = (competition.totalStaked * 5) / 100;
        competition.totalStaked -= fee;
        dappFee += fee;

        //reward per payout Interval
        uint256 _rewardPot = competition.totalStaked * 1 ether;
        competition.rewardPot =
            _rewardPot /
            (competition.durationDays / competition.payoutIntervals);

        //Assign updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        competitionIsLive[_compId] = true;

        //assign compId to athlete Address
        for (uint8 i = 0; i < athleteListByComp[_compId].length; i++) {
            address[] memory listAthletes = athleteListByComp[_compId];
            athleteToCompIdList[listAthletes[i]].push(uint8(_compId));
        }

        emit competitionStarted(
            _compId,
            athleteListByComp[_compId],
            competition.startDate,
            competition.endDate,
            competition.nextPayoutDate
        );
    }

    function checkupKeep(uint256 _compId) external {
        for (uint256 i = 1; i <= competitionId; i++) {
            competitionForm memory _competition = competitionTable[i];
            address[] memory athleteListbyComp = athleteListByComp[i];

            //check if competitionId is set to live on isLive mapping
            if (competitionIsLive[i] == true && block.timestamp >= _competition.nextPayoutDate) {
                //increment payoutId to reflect a new payout event triggered
                compPayoutId[_compId]++;
                for (uint256 j = 0; j < athleteListbyComp.length; j++) {
                    handleAPICall(
                        uint8(requestType.payoutEvent),
                        athleteTable[athleteListbyComp[j]].stravaUserId,
                        athleteListbyComp[j],
                        _compId
                    );
                }
            }
        }
    }

    function handleAPICall(
        uint8 _requestType,
        string memory _stravaId,
        address _athlete,
        uint256 _compId
    ) internal {
        //call consumer contract and pass address of athlete
        string[] memory args = new string[](1);
        args[0] = _stravaId;

        //need to think about the what to record and why
        i_linkReq.sendRequest(_requestType, args, _athlete, _compId);

        //emit event?
    }

    function handleAPIResponse(
        uint8 _requestType,
        address _athlete,
        uint256 _distance,
        uint256 _compId
    ) external {
        //needs to be only consumer
        //require(msg.sender == address(i_linkReq), "Only Consumer can call this function");
        // check requestType
        if (requestType(_requestType) == requestType.beginCompetition) {
            //update athletes distance logged
            athleteTable[_athlete].totalMeters = _distance;
            startCompCallCounter[_compId] += 1;
            //if final response for comp received then start Comp
            if (startCompCallCounter[_compId] == athleteListByComp[_compId].length) {
                //start competition
                handleStartCompetition(_compId);
            }
        } else if (requestType(_requestType) == requestType.payoutEvent) {
            handlePayoutEvent(_athlete, _distance, _compId);
        }
    }

    function handlePayoutEvent(address _athlete, uint256 _distance, uint256 _compId) internal {
        //check result saved to mapping by compId and by PayoutId
        uint256 metersLogged;
        if (athleteTable[_athlete].totalMeters == 0) {
            metersLogged = _distance;
        } else {
            metersLogged = athleteTable[_athlete].totalMeters - _distance;
        }

        EventResults memory results = eventResultsMapping[_compId][compPayoutId[_compId]];
        //check distance is greater, if so set as new winner
        if (results.metersLogged < metersLogged) {
            results.metersLogged = metersLogged; //current winning meters logged
            results.winnnersAddress = _athlete; //current winners address
            eventResultsMapping[_compId][compPayoutId[_compId]] = results;
        }
        //check if final response for this event call
        payoutEventAPIResponseCounter[_compId]++;
        if (payoutEventAPIResponseCounter[_compId] == athleteListByComp[_compId].length) {
            //handle winner
            handleWinner(_compId);
            //reset variables
            payoutEventAPIResponseCounter[_compId] = 0;
            //set new payoutDate
            competitionForm memory _competition = competitionTable[_compId];
            _competition.nextPayoutDate =
                _competition.nextPayoutDate +
                (competition.payoutIntervals * 60 * 60 * 24);
        }
    }

    function handleWinner(uint256 _compId) internal {
        //the winners details
        EventResults memory results = eventResultsMapping[_compId][compPayoutId[_compId]];
        uint256 reward = competitionTable[_compId].rewardPot / 1 ether;
        (bool sent, ) = results.winnnersAddress.call{value: reward}("");
        if (!sent) {
            //save rewards for user
            rewardBalanceOwedToAthlete[results.winnnersAddress] += reward;
            //emit event
            //emit event to signal failed transaction and reward owed?
        } else {
            emit winnerPicked(results.winnnersAddress, reward);
            // emit event to signal successfull payout
        }
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

    function withdrawFeeBalance() external onlyOwner {
        (bool sent, ) = msg.sender.call{value: dappFee}("");
        require(sent, "Unable to withdraw funds");
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

    //winner to withdraw rewards

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

    //FUNCTIONS TO HELP WITH TESTs
    function setCompStatus(uint256 _compId) external {
        competitionTable[_compId].status = CompetitionStatus.inProgress;
    }

    function callHandleStartCompetitionTest(uint8 _compId) external {
        if (competitionTable[_compId].status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competitionTable[_compId].status));
        }
        handleStartCompetition(_compId);
    }

    function testHandleAPICall(
        uint8 _requestType,
        address _athlete,
        string memory _stravaId,
        uint256 _compId
    ) external onlyOwner {
        //call consumer contract and pass address of athlete
        string[] memory args = new string[](1);
        args[0] = _stravaId;

        //need to think about the what to record and why
        i_linkReq.sendRequest(_requestType, args, _athlete, _compId);
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

    function testPayoutIdIncrement(uint256 _compId) external {
        compPayoutId[_compId]++;
    }

    function testHandleStartCompetition(uint256 _compId) external onlyOwner {
        handleStartCompetition(_compId);
    }

    function withdrawBalanceTEST() external onlyOwner {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Unable to withdraw funds");
    }
}
