//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./CRLinkReqInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainRunners is Ownable {
    //errors
    error ChainRunners__CompStatusNotAsExpected(CompetitionStatus currentStatus);

    modifier onlyAdmin(address _caller, uint256 _compId) {
        uint256 competitionIndex = _compId - 1;
        require(
            _caller == competitionList[competitionIndex].administrator,
            "Only Competition Admin Can Call this function"
        );
        _;
    }

    enum CompetitionStatus {
        pending,
        inProgress,
        completed,
        aborted
    }
    //Athlete Struct
    struct athleteProfile {
        string username;
        uint256 stravaUserId;
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
        uint256 createdDate;
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
    CRLinkReqInterface public linkReq;
    uint256 public competitionId;
    uint256 public appAccessTokenExpires;

    //initialise structs
    competitionForm competition;
    athleteProfile athlete;

    //arrays
    competitionForm[] public competitionList;
    athleteProfile[] public athleteList;

    //chainlink Variables
    uint256 currentSlotId;

    //Mapings
    mapping(address => athleteProfile) public athleteTable; //Athlete mapping - address to Struct
    mapping(uint256 => address[]) public athleteListByComp;
    mapping(uint256 => bool) public competitionIsLive;
    mapping(uint256 => competitionForm) public competitionTable; //Comp Id to CompForm
    mapping(string => bool) public usernameTable; //username to bool
    mapping(address => mapping(uint256 => uint256)) public stakedByCompByUser;

    event athleteProfileCreated(address indexed athlete, string indexed username);
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
        linkReq = CRLinkReqInterface(_linkReq);
    }

    /**
     *
     * @param _username User to provide their username
     * Require that address is not registered to an existing athlete
     * Require that username is not already registered
     * @dev Creates new athlete profile as a struct and stores this in mapping with address as the Unique Identifier
     * @dev updates username table
     * @dev emits athleteProfileCreated event
     */
    function createAthlete(string calldata _username, uint256 _stravaUseId) external {
        require(
            athleteTable[msg.sender].registeredAthlete == false,
            "Address already registered to an Athlete"
        );
        require(usernameTable[_username] == false, "Username is Taken. Choose Another");

        //there should be

        athlete.username = _username;
        athlete.stravaUserId = _stravaUseId;
        athlete.registeredAthlete = true;

        //create athlete mapping
        athleteTable[msg.sender] = athlete;

        usernameTable[_username] = true; //add username to existing username table

        emit athleteProfileCreated(msg.sender, _username);
    }

    /**
     *
     * @param _buyin ether amoutn required to enter competition
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
    ) external payable {
        require(msg.value == _buyin, "Incorrect Buy In Amount Sent");
        require(athleteTable[msg.sender].registeredAthlete == true, "Not a registered Athlete");

        //increment ID for compeition
        competitionId++;

        //populate Form
        competition.id = competitionId;
        competition.isLive = false;

        athleteListByComp[competitionId].push(msg.sender);

        uint256 durationSecs = _durationDays * 60 * 60 * 24;
        uint256 payoutIntervalSecs = _payoutIntervals * 60 * 60 * 24;

        competition.name = _name;
        competition.durationDays = durationSecs;
        competition.payoutIntervals = payoutIntervalSecs;
        competition.totalStaked += msg.value;
        competition.buyIn = _buyin;
        competition.administrator = msg.sender;
        competition.status = CompetitionStatus.pending;
        //7 day deadline for competition to start otherwise it is Auto aborted
        competition.startDeadline = 7 * 60 * 60 * 24;
        //update mapping with amount staked by athlete for _compID
        stakedByCompByUser[msg.sender][competitionId] = msg.value;

        //populate mapping with new competition struct
        competitionTable[competitionId] = competition;

        //push compition into array
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
    function joinCompetition(uint256 _compId) external payable {
        competitionForm storage _competition = competitionTable[_compId];

        require(athleteTable[msg.sender].registeredAthlete == true, "Not a registered Athlete");
        require(msg.value == competition.buyIn, "Incorrect Buy In Amount Sent");

        //update total staked
        _competition.totalStaked += msg.value;

        //add athlete to competition and amount staked
        athleteListByComp[competitionId].push(msg.sender);

        //update mapping with amount staked by athlete for _compID
        stakedByCompByUser[msg.sender][_compId] = msg.value;

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
        competition = competitionTable[competitionId];
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(competition.status);
        }

        //set Comp Status
        competition.status = CompetitionStatus.inProgress;
        //set start date
        competition.startDate = block.timestamp;
        //set end date
        competition.endDate = block.timestamp + competition.durationDays;
        //set next reward interval
        competition.nextPayoutDate = block.timestamp + competition.payoutIntervals;

        //Assign updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        //push competitionId to live competitions array
        competitionIsLive[_compId] = true;

        emit competitionStarted(
            _compId,
            athleteListByComp[_compId],
            competition.startDate,
            competition.endDate,
            competition.nextPayoutDate
        );
    }

    function payoutEvent() public {
        //check for live competitions
        uint256 competitionsCount = competitionList.length;

        for (uint256 i = 0; i <= competitionsCount; i++) {
            competitionForm memory _competition = competitionList[i];
            //check if competitionId is set to live on isLive mapping
            if (
                competitionIsLive[_competition.id] == true &&
                _competition.nextPayoutDate >= block.timestamp
            ) {
                for (uint256 j = 0; j <= athleteListByComp[i].length; j++) {
                    //need to call chainlink function here for each athlete
                }
            }
        }

        //find largest number
        //if all zeros deal then end
        //largest > than min miles? if not deal with scenario
    }

    function endCompetition() public {
        //
    }

    function abortCompetition(uint256 _compId) public onlyAdmin(msg.sender, _compId) {
        if (competition.status != CompetitionStatus.pending) {
            revert ChainRunners__CompStatusNotAsExpected(competition.status);
        }

        //retrieve comp tables
        competitionForm storage _competition = competitionTable[competitionId];

        //update status
        _competition.status = CompetitionStatus.aborted;

        uint256 numberOfCompetitors = athleteListByComp[competitionId].length;
        address[] memory athletesList = athleteListByComp[competitionId];

        //return funds to stakers
        for (uint16 i = 0; i < numberOfCompetitors; i++) {
            uint256 amountStaked = stakedByCompByUser[athletesList[i]][_compId];

            (bool sent, ) = athletesList[i].call{value: amountStaked}("");
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

    //getter functions
    function getAthleteList(uint256 _compId) external returns (address[] memory) {
        address[] memory listofAthletes = athleteListByComp[_compId];
        return listofAthletes;
    }

    function getSourceTest() external view returns (string memory) {
        console.log("Source API From Contract", linkReq.getStringTest());
        linkReq.getStringTest();
    }
}
