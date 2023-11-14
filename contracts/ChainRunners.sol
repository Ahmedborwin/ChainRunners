//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ChainRunners {
    //Athlete Struct
    struct athleteProfile {
        string username;
        uint256 slotID; //this is used to store and retreive athlete strava tokens from the DON
        uint256[] activeCompeitions;
        uint256 compeitionsWon;
        uint256 totalMiles;
    }

    struct competitionForm {
        uint256 id;
        bool isLive;
        address[] competingAthletes;
        uint256 createdDate;
        uint256 startDate;
        uint256 durationDays;
        uint256 endDate;
        uint256 nextPayoutDate;
        uint256 payoutIntervals;
        uint256 buyIn;

    }

    //state variables
    uint256 competitionId;
    competitionForm[] internal competitionList;
    athleteProfile[] internal athleteList;

    //chainlink Variables
    uint256 currentSlotId;

    //Athlete mapping - address to Struct
    mapping(address => athleteProfile) public athleteTable;
    mapping(uint256 => competitionForm) public competitionTable;

    constructor() {}

    function createAthlete(string calldata _username) external {
        athleteProfile memory athlete;
        athlete.username = _username;

        //create athlete mapping
        athleteTable[msg.sender] = athlete;
    }

    function createCompetition(uint256 _durationDays , uint256 _payoutIntervals  ) payable external {
        //increment ID for compeition
        competitionId++;

        //initialise CompetitionForm
        competitionForm memory newCompetition;

        //populate Form
        newCompetition.id = competitionId;
        newCompetition.isLive = false;
        newCompetition.competingAthletes[0] = msg.sender;

        //populate mapping with new compeition struct
        competitionTable[competitionId] = newCompetition;

        //push compition into array
        competitionList.push(newCompetition);
    }
}
