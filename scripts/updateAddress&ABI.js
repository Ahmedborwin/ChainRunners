const fs = require("fs")
const { ethers } = require("hardhat")

const CHAINRUNNER_ADDRESS_FILE = "src/config/chainRunnerAddress.json"
const CONSUMER_ADDRESS_FILE = "src/config/consumerAddress.json"
const CHAINRUNNER_NFT_ADDRESS_FILE = "src/config/chainRunnerNFTAddress.json"
const CHAINRUNNER_TOKEN_ADDRESS_FILE = "src/config/chainRunnerTokenAddress.json"

const CONSUMER_ABI_FILE = "src/config/consumerAbi.json"
const CHAINRUNNER_ABI_FILE = "src/config/chainRunnerAbi.json"
const CHAINRUNNER_NFT_ABI_FILE = "src/config/chainRunnerNFTAbi.json"
const CHAINRUNNER_Token_ABI_FILE = "src/config/chainRunnerTokenAbi.json"

module.exports = async (
    chainRunnersAddress,
    chainFunctionsConsumerAddress,
    chainRunnersNFTAddress,
    chainRunnerTokenAddress
) => {
    //need chainId
    const chainId = ethers.provider.network.chainId.toString()

    await updateChainRunnerAddress(chainId, chainRunnersAddress)
    await updateConsumerAddress(chainId, chainFunctionsConsumerAddress)
    await updateChainRunnerNFTAddress(chainId, chainRunnersNFTAddress)
    await updateChainRunnerTokenAddress(chainId, chainRunnerTokenAddress)

    await updateChainRunnerABI(chainRunnersAddress)
    await updateConsumerABI(chainFunctionsConsumerAddress)
    await updateNFTABI(chainRunnersNFTAddress)
    await updateTokenABI(chainRunnerTokenAddress)
}

async function updateChainRunnerAddress(chainId, chainRunnersAddress) {
    //get contract

    const chainrunnerAddressList = JSON.parse(fs.readFileSync(CHAINRUNNER_ADDRESS_FILE, "utf8"))

    if (chainId in chainrunnerAddressList) {
        if (!chainrunnerAddressList[chainId].includes(chainRunnersAddress)) {
            chainrunnerAddressList[chainId] = chainRunnersAddress
        }
    } else {
        chainrunnerAddressList[chainId] = chainRunnersAddress
    }
    fs.writeFileSync(CHAINRUNNER_ADDRESS_FILE, JSON.stringify(chainrunnerAddressList, null, 2))
}

async function updateChainRunnerABI(chainRunnersAddress) {
    const chainRunners = await ethers.getContractAt("ChainRunners", chainRunnersAddress)
    fs.writeFileSync(
        CHAINRUNNER_ABI_FILE,
        chainRunners.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateConsumerAddress(chainId, chainFunctionsConsumerAddress) {
    //read consumerAddress file
    const consumerAddressList = JSON.parse(fs.readFileSync(CONSUMER_ADDRESS_FILE, "utf8"))

    if (chainId in consumerAddressList) {
        if (!consumerAddressList[chainId].includes(chainFunctionsConsumerAddress)) {
            consumerAddressList[chainId] = chainFunctionsConsumerAddress
        }
    } else {
        consumerAddressList[chainId] = chainFunctionsConsumerAddress
    }
    fs.writeFileSync(CONSUMER_ADDRESS_FILE, JSON.stringify(consumerAddressList, null, 2))
}

async function updateConsumerABI(chainFunctionsConsumerAddress) {
    const chainFunctionsConsumer = await ethers.getContractAt(
        "crChainlinkRequestConsumer",
        chainFunctionsConsumerAddress
    )
    fs.writeFileSync(
        CONSUMER_ABI_FILE,
        chainFunctionsConsumer.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateChainRunnerNFTAddress(chainId, chainRunnersNFTAddress) {
    const chainRunnerNFTList = JSON.parse(fs.readFileSync(CHAINRUNNER_NFT_ADDRESS_FILE, "utf8"))

    chainRunnerNFTList[chainId] = chainRunnersNFTAddress

    fs.writeFileSync(CHAINRUNNER_NFT_ADDRESS_FILE, JSON.stringify(chainRunnerNFTList, null, 2))
}

async function updateNFTABI(chainRunnersNFTAddress) {
    const chainRunners = await ethers.getContractAt("ChainRunnersNFT", chainRunnersNFTAddress)
    fs.writeFileSync(
        CHAINRUNNER_NFT_ABI_FILE,
        chainRunners.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateChainRunnerTokenAddress(chainId, chainRunnerTokenAddress) {
    const chainRunnerTokenList = JSON.parse(fs.readFileSync(CHAINRUNNER_TOKEN_ADDRESS_FILE, "utf8"))

    chainRunnerTokenList[chainId] = chainRunnerTokenAddress

    fs.writeFileSync(CHAINRUNNER_TOKEN_ADDRESS_FILE, JSON.stringify(chainRunnerTokenList, null, 2))
}

async function updateTokenABI(chainRunnerTokenAddress) {
    const chainRunners = await ethers.getContractAt("ChainRunnersToken", chainRunnerTokenAddress)
    fs.writeFileSync(
        CHAINRUNNER_Token_ABI_FILE,
        chainRunners.interface.format(ethers.utils.FormatTypes.json)
    )
}
