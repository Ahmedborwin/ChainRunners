const fs = require("fs")
const { ethers } = require("hardhat")

const CHAINRUNNER_ADDRESS_FILE = require("../src/config/chainRunnerAddress.json")
const CONSUMER_ADDRESS_FILE = require("../src/config/consumerAddress.json")
const CONSUMER_ABI_FILE = require("../src/config/consumerAbi.json")
const CHAINRUNNER_ABI_FILE = require("../src/config/chainRunnerAbi.json")

module.exports = async (chainRunnersAddress, chainFunctionsConsumerAddress) => {
    //need chainId
    const chainId = ethers.provider.network.chainId.toString()

    await updateChainRunnerAddress(chainId, chainRunnersAddress)
    await updateConsumerAddress(chainId, chainFunctionsConsumerAddress)
    await updateChainRunnerABI(chainRunnersAddress)
    await updateConsumerABI(chainFunctionsConsumerAddress)
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
