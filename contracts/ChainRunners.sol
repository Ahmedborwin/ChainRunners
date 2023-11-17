//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ChainRunners {
    modifier onlyAdmin(address _caller, uint256 _compId) {
        require(
            _caller == competitionList[_compId].administrator,
            "Only Competition Admin Can Call this function"
        );
        _;
    }
    event athleteProfileCreated(address athlete, string username);
    event newCompetitionCreated(uint256 compId, uint256 buyIn);
    event athleteJoinedCompetition(uint256 compId, address athleteAddress, uint256 stake);

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

    function joinCompetition(uint256 _compId) external payable {
        competition = competitionTable[_compId];

        require(athleteTable[msg.sender].registeredAthlete == true, "Not a registered Athlete");
        require(msg.value == competition.buyIn, "Incorrect Buy In Amount Sent");

        //add athlete to competition and amount staked
        athleteListByComp[competitionId].push(msg.sender);

        competition.totalStaked += msg.value;

        emit athleteJoinedCompetition(_compId, msg.sender, msg.value);
    }

    function commenceCompetition(uint256 _compId) external onlyAdmin(msg.sender, _compId) {
        //atleast two participants in comp
        require(athleteListByComp[_compId].length >= 2, "Atleast two competitors required");
    }

    function payoutEvent() public {}

    function competitionCompletion() public {}

    //getter functions
    function getCompetitionList() external returns (competitionForm[] memory) {
        return competitionList;
    }
}
