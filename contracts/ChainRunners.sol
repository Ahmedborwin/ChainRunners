//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ChainRunners {
    //Athlete Struct
    struct athleteProfile {
        string username;
        uint256 slotID; //this is used to store and retreive athlete strava tokens from the DON
    }

    struct competitionForm {
        uint256 competitionId;
        bool isCompetitionLive;
        address[] competingAthletes;
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

    function createAthlete() external {}

    function createCompetition(uint256 _compId) external {
        //increment ID for compeition
        competitionId++;

        //set up array of competing athletes. At this point that is msg.sender only
        // address[] storage _listCompetitors;
        // _listCompetitors.push(msg.sender);

        //initialise CompetitionForm
        competitionForm memory newCompetition;

        //populate Form
        newCompetition.competitionId = competitionId;
        newCompetition.isCompetitionLive = false;
        newCompetition.competingAthletes[0] = msg.sender;

        //populate mapping with new compeition struct
        competitionTable[competitionId] = newCompetition;

        //push compition into array
        competitionList.push(newCompetition);
    }
}
