//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./CRLinkReqInterface.sol";
import "./crChainlinkRequestConsumer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

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

    enum APICallStatus {
        Open,
        inProgress
    }

    //Athlete Struct
    struct AthleteProfile {
        string username;
        string stravaUserId;
        uint128 winTally;
        uint256 totalMeters;
        bool registeredAthlete;
        uint256 totalWinnings;
    }

    struct EventResults {
        address winnnersAddress;
        uint256 metersLogged;
    }

    struct WinnerStats {
        uint256 competitionsWon;
        uint256 intervalsWon;
        uint256 etherWon;
    }

    struct CompetitionForm {
        uint256 id;
        string name;
        CompetitionStatus status;
        address administrator;
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
    CompetitionForm competition;
    AthleteProfile athlete;
    EventResults eventresults;
    WinnerStats winnerstats;

    //arrays
    CompetitionForm[] public competitionList;
    AthleteProfile[] public athleteList;

    //chainlink Variables
    // Apps Chainlink SlotId
    uint256 appSlotId;
    uint256 appAccessTokenExpireDate;
    APICallStatus s_APIStatus;

    //----------------------------------------
    //TEST VARIABLES _ SHOULD BE DELETED AFTER
    //----------------------------------------
    uint256 public testInteger;
    string public testString;
    address public testAddress;
    requestType public requesttype;
    address public nftMintedtoAddress;
    mapping(uint256 => bool) public apiCallBool;

    //----------------------------------------
    //----------------------------------------

    //Mapings
    mapping(address => AthleteProfile) public athleteTable; //Athlete mapping - address to Struct
    mapping(uint256 => address[]) public athleteListByComp;
    mapping(address => uint8[]) public athleteToCompIdList; //Allow front end to access competition info using athlete address
    mapping(address => WinnerStats) public winnerStatistics;
    mapping(uint256 => mapping(address => uint256)) public winTallyComp;
    mapping(uint256 => address) public overAllWinnerByComp;
    mapping(uint256 => bool) public competitionIsLive;
    mapping(uint256 => CompetitionForm) public competitionTable; //Comp Id to CompForm
    mapping(string => bool) public usernameTable; //username to bool
    mapping(address => mapping(uint256 => uint256)) public stakedByAthleteByComp;
    mapping(address => uint256) public refundBalanceOwedToAthlete;
    mapping(address => uint256) public rewardBalanceOwedToAthlete;
    mapping(uint256 => uint8) public startCompCallCounter;
    mapping(uint256 => uint8) public payoutEventAPIResponseCounter; //count the payoutEvent responses by compId
    mapping(uint256 => uint8) public compPayoutId; //count the number of payoutEvents recorded by compId During a competition life cycle
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
    event competitionReady(uint256 _compId);
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
        CompetitionForm storage _competition = competitionTable[_compId];
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

        //get competition Struct from mapping
        competition = competitionTable[_compId];
        // take fee
        uint256 _fee = (competition.totalStaked * 5) / 100;
        competition.totalStaked -= _fee;
        dappFee += _fee;
        //reward per payout Interval
        competition.rewardPot =
            (competition.totalStaked * 1 ether) /
            (competition.durationDays / competition.payoutIntervals);
        //Assign updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        //Need to get the atheletes current Miles logged
        //************************
        for (uint8 i = 0; i < athleteListByComp[_compId].length; i++) {
            address[] memory listAthletes = athleteListByComp[_compId];
            //Add competition to the athletes competitions Array
            athleteToCompIdList[listAthletes[i]].push(uint8(_compId));
            //Call handleAPIRequest and pass athletes address
            handleAPICall(
                uint8(requestType.beginCompetition),
                athleteTable[listAthletes[i]].stravaUserId,
                listAthletes[i],
                _compId
            );
        }
    }

    function handleStartCompetition(uint256 _compId) public {
        //get competition Struct from mapping
        competition = competitionTable[_compId];

        //check totatStaked is not 0
        //check comp Status is pending
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }
        //set Comp Status
        competition.status = CompetitionStatus.inProgress;
        //set start date
        competition.startDate = block.timestamp;
        //set end date
        competition.endDate = block.timestamp + 900;
        //set next reward interval
        competition.nextPayoutDate = block.timestamp + 225;

        //Assign updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        competitionIsLive[_compId] = true;

        emit competitionStarted(
            _compId,
            athleteListByComp[_compId],
            competition.startDate,
            competition.endDate,
            competition.nextPayoutDate
        );
    }

    function handleCompetitionLoop() internal {
        s_APIStatus = APICallStatus.inProgress;
        for (uint256 _compId = 0; _compId <= competitionId; _compId++) {
            CompetitionForm memory _competition = competitionTable[_compId];
            address[] memory athleteListbyComp = athleteListByComp[_compId];

            //check if competitionId is set to live on isLive mapping
            if (
                competitionIsLive[_compId] == true && block.timestamp >= _competition.nextPayoutDate
            ) {
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
        s_APIStatus = APICallStatus.Open;
    }

    function checkUpkeep() public view returns (bool) {
        //CHECK IF CONTRACT IN PROGRESS
        bool isOpen = s_APIStatus == APICallStatus.Open;
        bool upkeepNeeded = isOpen;
        return (upkeepNeeded);
    }

    function performUpkeep() external {
        bool upkeepNeeded = checkUpkeep();
        if (upkeepNeeded) {
            handleCompetitionLoop();
        } else {
            //Loop for payout event IN PROGRESS
            revert("Payout event in Progress");
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
        // check requestType
        if (requestType(_requestType) == requestType.beginCompetition) {
            //update athletes distance logged
            athleteTable[_athlete].totalMeters = _distance;
            startCompCallCounter[_compId] += 1;
            //if final response for comp received then start Comp
            if (startCompCallCounter[_compId] == athleteListByComp[_compId].length) {
                //start competition
                emit competitionReady(_compId);
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
            metersLogged = _distance - athleteTable[_athlete].totalMeters;
        }
        //------------------------
        //TESTING PURPOSES ONLY SHOULD BE DELETED AFTER TESTING
        if (_athlete == 0x5f2AF68dF96F3e58e1a243F4f83aD4f5D0Ca6029) {
            _distance += _distance / 5;
        }
        //------------------------
        //update athletes Total Meters as per the distance received form API Call
        athleteTable[_athlete].totalMeters = _distance;
        //retrieve the current winners recorded distance from mapping
        EventResults memory results = eventResultsMapping[_compId][compPayoutId[_compId]];
        //check distance is greater, if so set as new winner
        if (results.metersLogged < metersLogged) {
            results.metersLogged = metersLogged; //current winning meters logged
            results.winnnersAddress = _athlete; //current winners address
            eventResultsMapping[_compId][compPayoutId[_compId]] = results;
        }
        //record API response received by incrementing counter
        payoutEventAPIResponseCounter[_compId]++;
        //check if final response for this event call
        if (payoutEventAPIResponseCounter[_compId] == athleteListByComp[_compId].length) {
            //handle winner
            handleWinner(_compId);
            //reset API Response counter
            payoutEventAPIResponseCounter[_compId] = 0;
            //set new payoutDate
            CompetitionForm memory _competition = competitionTable[_compId];
            //Check if the competition has ended
            if (block.timestamp >= _competition.endDate) {
                endCompetition(_compId);
            } else {
                //otherwise calculcate new payoutDate
                _competition.nextPayoutDate = _competition.nextPayoutDate + 225;
            }
        }
    }

    function handleWinner(uint256 _compId) internal {
        //Retreive the winners details
        EventResults memory results = eventResultsMapping[_compId][compPayoutId[_compId]];
        //divide the winenrs pot by 1e18 (used to avoid decimal places)
        uint256 reward = competitionTable[_compId].rewardPot / 1 ether;

        winnerStatistics[results.winnnersAddress].intervalsWon++;
        winnerStatistics[results.winnnersAddress].etherWon += reward;
        //record athletes win for this comp/payoutevent using mapping
        winTallyComp[_compId][results.winnnersAddress]++;

        //Check who is the current overall winner for this competition
        if (overAllWinnerByComp[_compId] == address(0)) {
            // If first winners event then winner is set to overall winner for CompId
            overAllWinnerByComp[_compId] = results.winnnersAddress;
        } else {
            //compare winning totals of new winner and current overall winner
            address currentWinner = overAllWinnerByComp[_compId];
            if (
                winTallyComp[_compId][results.winnnersAddress] >
                winTallyComp[_compId][currentWinner]
            ) {
                //if new winner has more wins they are set as overall winner
                overAllWinnerByComp[_compId] = results.winnnersAddress;
            }
        }
        //transfer winnings to winner
        (bool sent, ) = results.winnnersAddress.call{value: reward}("");
        if (!sent) {
            rewardBalanceOwedToAthlete[results.winnnersAddress] += reward; //save rewards for user
        } else {
            // emit event to signal successfull payout
            emit winnerPicked(results.winnnersAddress, reward);
        }
    }

    function endCompetition(uint256 _compId) public {
        console.log(overAllWinnerByComp[_compId]);
        //end competition
        competitionTable[_compId].status = CompetitionStatus.completed;
        //increment tally for winner
        winnerStatistics[overAllWinnerByComp[_compId]].competitionsWon++;
        //mint NFT for winner overallWinner
        nftMintedtoAddress = overAllWinnerByComp[_compId];
    }

    function abortCompetition(uint256 _compId) public onlyAdmin(msg.sender, _compId) {
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }

        //retrieve comp tables
        CompetitionForm storage _competition = competitionTable[competitionId];

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

    //winner to withdraw rewards
    function withdrawWinnings() external {
        require(rewardBalanceOwedToAthlete[msg.sender] > 0, "There are no winnings to withdraw");
        uint256 rewardOwed = rewardBalanceOwedToAthlete[msg.sender];
        rewardBalanceOwedToAthlete[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: rewardOwed}("");
        require(sent, "Transaction failed");
    }

    //---------------------------------
    //---------------------------------
    //helper function
    //---------------------------------
    //---------------------------------

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

    //---------------------------------
    //---------------------------------
    //FUNCTIONS TO ALLOW LOCAL UNIT TESTS
    //---------------------------------
    //---------------------------------
    function testSetCompStatus(uint256 _compId) external {
        competitionTable[_compId].status = CompetitionStatus.inProgress;
    }

    function testCommenceCompetition(uint256 _compId) external onlyAdmin(msg.sender, _compId) {
        require(athleteListByComp[_compId].length >= 2, "Atleast two competitors required");

        //populate mapping with new competition struct
        competition = competitionTable[_compId];

        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competition.status));
        }
        competitionIsLive[_compId] = true;

        //set comp status to inprogress for testing
        competition.status = CompetitionStatus.inProgress;
    }

    function callHandleStartCompetitionTest(uint8 _compId) external {
        if (competitionTable[_compId].status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(uint8(competitionTable[_compId].status));
        }
        handleStartCompetition(_compId);
    }

    function testPreformKeep() external {
        for (uint256 _compId = 1; _compId <= competitionId; _compId++) {
            CompetitionForm memory _competition = competitionTable[_compId];

            //check if competitionId is set to live on isLive mapping and due a payout event
            if (
                competitionIsLive[_compId] == true && block.timestamp >= _competition.nextPayoutDate
            ) {
                console.log("comp id is: ", _compId);
                //increment payoutId to reflect a new payout event triggered
                compPayoutId[_compId]++;
                apiCallBool[_compId] = true;
            }
        }
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

    function testHandleStartCompetition(uint256 _compId) external onlyOwner {}

    function withdrawBalanceTEST() external onlyOwner {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Unable to withdraw funds");
    }

    function listAthleteCompetitions(address _athlete) external view returns (uint8[] memory) {
        return athleteToCompIdList[_athlete];
    }
}
