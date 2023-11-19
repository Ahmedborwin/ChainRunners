//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ChainRunners {
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
    event athleteProfileCreated(address athlete, string username);
    event newCompetitionCreated(uint256 compId, uint256 buyIn);
    event athleteJoinedCompetition(uint256 compId, address athleteAddress, uint256 stake);
    event competitionStarted(
        uint256 compId,
        address[] competingAthletes,
        uint256 startDate,
        uint256 endDate,
        uint256 nextPayout
    );

    enum CompetitionStatus {
        pending,
        inProgress,
        completed,
        aborted
    }
    //Athlete Struct
    struct athleteProfile {
        string username;
        uint256 slotID; //this is used to store and retreive athlete strava tokens from the DON
        uint256[] activeCompetitions;
        uint256 compeitionsWon;
        uint256 totalMiles;
        bool registeredAthlete;
    }

    struct competitionForm {
        uint256 id;
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
        uint256 buyIn;
        uint256 totalStaked;
    }

    //state variables

    //initialise structs
    competitionForm competition;
    athleteProfile athlete;

    uint256 public competitionId;
    competitionForm[] public competitionList;
    athleteProfile[] internal athleteList;

    //chainlink Variables
    uint256 currentSlotId;

    //Mapings
    mapping(address => athleteProfile) public athleteTable; //Athlete mapping - address to Struct
    mapping(uint256 => address[]) public athleteListByComp;
    mapping(uint256 => competitionForm) public competitionTable; //Comp Id to CompForm
    mapping(string => bool) public usernameTable; //username to bool

    constructor() {}

    /**
     *
     * @param _username User to provide their username
     * Require that address is not registered to an existing athlete
     * Require that username is not already registered
     * @dev Creates new athlete profile as a struct and stores this in mapping with address as the Unique Identifier
     * @dev updates username table
     * @dev emits athleteProfileCreated event
     */
    function createAthlete(string calldata _username) external {
        require(
            athleteTable[msg.sender].registeredAthlete == false,
            "Address already registered to an Athlete"
        );
        require(usernameTable[_username] == false, "Username is Taken. Choose Another");

        athlete.username = _username;
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
        competition.durationDays = durationSecs;
        competition.payoutIntervals = payoutIntervalSecs;
        competition.totalStaked += msg.value;
        competition.buyIn = _buyin;
        competition.administrator = msg.sender;
        competition.status = CompetitionStatus.pending;

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
        competition = competitionTable[_compId];

        require(athleteTable[msg.sender].registeredAthlete == true, "Not a registered Athlete");
        require(msg.value == competition.buyIn, "Incorrect Buy In Amount Sent");

        //add athlete to competition and amount staked
        athleteListByComp[competitionId].push(msg.sender);

        competition.totalStaked += msg.value;

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

        //Assing updated Competition Form back to mapping
        competitionTable[competitionId] = competition;

        emit competitionStarted(
            _compId,
            athleteListByComp[_compId],
            competition.startDate,
            competition.endDate,
            competition.nextPayoutDate
        );
    }

    function payoutEvent() public {}

    function finaliseCompetition() public {}

    //getter functions
    function getCompetitionList() external returns (competitionForm[] memory) {
        return competitionList;
    }
}
