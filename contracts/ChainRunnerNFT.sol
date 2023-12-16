// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

error ChainRunnersNFT__AlreadyInitialized();
error ChainRunnersNFT__RangeOutOfBounds();

contract ChainRunnersNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    enum NftTier {
        Common,
        Bronze,
        Silver,
        Gold,
        Platinum,
        Diamond,
        Enigma
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;
    uint32 private constant NUM_WORDS = 1;

    // NFT Variables
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    uint256 private s_tokenCounter;
    string[] internal s_RunnerSeriesURI;
    string[] internal s_RunnerSeriesURIOwnedByPlayer;
    bool private s_initialized;

    // VRF Helpers
    //store address linked to randomNumber request
    mapping(uint256 => address) public s_requestIdToSender;
    //NFT to address storage mapping
    mapping(address => mapping(uint256 => string)) public s_addressToTokenURI;
    //All NFT's to address storage mapping
    mapping(address => string[]) public s_addressToAllTokenURIs;

    // Events

    event nftMinted(address indexed player, string indexed TokenURI);
    event AllTokenUrisbyAddress(string[] indexed tokenUris, address indexed player);
    event unSuccesfullSpin(address indexed player);

    //set rarity levels
    //Need to call VRFcoordinator to get random number
    //function to mint NFT based on randomNumber
    //need to set tokenURI's
    //there are API's that will retrieve tokenID's for a given address can i use this to get the tokenURI seperatley?

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint32 callbackGasLimit,
        string[7] memory _s_RunnerSeriesURI
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("ChainRunnerSeries", "CRS") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        _initializeTokenURIArray(_s_RunnerSeriesURI);
        s_tokenCounter = 0;
    }

    function requestRandomNumber(address _athlete) public returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = _athlete;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        //get player address associated with the VRF requestId
        address _athlete = s_requestIdToSender[requestId];
        //get Number between 0-100
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        //return the NFT tier athlete has won
        NftTier nftWon = _getTokenFromModdedRng(moddedRng);
        //Mint NFT and set the TokenURI
        _safeMint(_athlete, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_RunnerSeriesURI[uint256(nftWon)]);
        s_tokenCounter++;
        // push new token URI to list of tokens owned by address // DO I NEED THIS???
        s_addressToAllTokenURIs[_athlete].push(s_RunnerSeriesURI[uint256(nftWon)]);
        //emit event??
        emit nftMinted(_athlete, s_RunnerSeriesURI[uint256(nftWon)]);
    }

    function _getTokenFromModdedRng(uint256 moddedRng) internal pure returns (NftTier) {
        uint256 cumulativeSum = 0;
        uint8[7] memory chanceArray = [50, 64, 77, 86, 92, 96, 99];
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return NftTier(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert ChainRunnersNFT__RangeOutOfBounds();
    }

    //---------------
    //helper functions
    //---------------

    function _initializeTokenURIArray(string[7] memory tokenUris) private {
        if (s_initialized) {
            revert ChainRunnersNFT__AlreadyInitialized();
        }
        s_RunnerSeriesURI = tokenUris;
        s_initialized = true;
    }

    function setNewOwner(address _newOwner) external {
        transferOwnership(_newOwner); // function from ownable, only Owner modifier assigned to function on ownable contract
    }

    //getter functions
    function getTokenURIArray() public view returns (string[] memory) {
        return s_RunnerSeriesURI;
    }

    function getTokenURIByAthlete(address _athlete) public view returns (string[] memory) {
        return s_addressToAllTokenURIs[_athlete];
    }
}
