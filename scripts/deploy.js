const hre = require("hardhat")
const fs = require("fs")
const path = require("path")
const updateContractInfo = require("./updateAddress&ABI")
const chainLinkFunctions = require("./chainlinkFunctions")
const { SubscriptionManager, startLocalFunctionsTestnet } = require("@chainlink/functions-toolkit")
const chainLinkFunctionsRouterList = require("../src/config/ChainlinkFunctionRouters.json")
const deployNFTContractScript = require("./Deploy/deployNFT")
const deployTokenContractScript = require("./Deploy/deployToken")
const { parseEther } = require("viem")

async function main() {
    let donHostedSecretsObject,
        provider,
        donIDString,
        rpcUrl,
        subId,
        donId,
        athlete,
        athlete_2,
        slotId

    const chainID = (await hre.ethers.provider.getNetwork()).chainId.toString()
    const MumbaiURL = process.env.POLYGON_MUMBAI_RPC_URL

    if (chainID === "80001") {
        rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"
    } else if (chainID === "43113") {
        rpcUrl = "https://avalanche-fuji.drpc.org"
    }

    if (chainID === "80001") {
        donIDString = "fun-polygon-mumbai-1"
        subId = 584
    } else if (chainID === "43113") {
        donIDString = "fun-avalanche-fuji-1"
        subId = 1620
    }

    if (chainID === "31337") {
        provider = hre.network.provider
        ;[athlete, athlete_2] = await hre.ethers.getSigners()
        // const localFunctionsTestnet = await startLocalFunctionsTestnet(
        //     simulationConfigPath?: string // Absolute path to config file which exports simulation config parameters
        //     options?: ServerOptions // Ganache server options
        //   )
    } else {
        provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)
        donHostedSecretsObject = await chainLinkFunctions(chainID)
        donId = hre.ethers.utils.formatBytes32String(donIDString)
    }

    const functionsRouter = chainLinkFunctionsRouterList[chainID]

    //Deploy Token
    const chainRunnerToken = await deployTokenContractScript()
    console.log(`\n ------------------------------------`)
    console.log("ChainRunners Token to deployed to: ", chainRunnerToken.address)
    console.log(`------------------------------------\n`)

    //deploy NFT contract
    const [chainRunnersNFT, vrfCoordinatorV2Mock] = await deployNFTContractScript()
    console.log(`\n ------------------------------------`)
    console.log("Chainrunners NFT deployed to: ", chainRunnersNFT.address)
    console.log(`------------------------------------\n`)

    //deploy consumer
    const consumer = await hre.ethers.deployContract("crChainlinkRequestConsumer", [
        functionsRouter,
    ])
    await consumer.deployed()

    console.log(`\n ------------------------------------`)
    console.log(`Consumer deployed to: ${consumer.address}`)
    console.log(`------------------------------------ \n`)

    // only populate on test net for now
    if (chainID !== "31337") {
        console.log(`\n ------------------------------------`)
        console.log(`Set up consumer for chainID:: ${chainID}`)
        console.log(`------------------------------------ \n`)
        const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
        const wallet = new hre.ethers.Wallet(privateKey)
        const athlete = wallet.connect(provider)
        //create athlete 2 for testing
        const privateKey_2 = process.env.PRIVATE_KEY_2 // fetch PRIVATE KEY of second account }
        const wallet_2 = new hre.ethers.Wallet(privateKey_2)
        athlete_2 = wallet_2.connect(provider)
        // Initialize functions settings
        const getAthleteData = fs
            .readFileSync(path.resolve(__dirname, "./APICalls/getAthleteData.js"))
            .toString()
        // populate code for calling athlete stats
        await consumer.populateAPICallJS(getAthleteData)
        //populate DonId bytes for athlete 1
        await consumer.populateDonId(donId)
        await consumer.populateVersionSecret(
            donHostedSecretsObject.donHostedSecretsVersion,
            athlete.address
        )
        await consumer.populateVersionSecret(
            donHostedSecretsObject.donHostedSecretsVersion_2,
            athlete_2.address
        )
        slotId = 0
        await consumer.populateDONSlotID(slotId, athlete.address)
        slotId++
        await consumer.populateDONSlotID(slotId, athlete_2.address)
        //populate subId
        await consumer.populateSubId(subId)
        // Add consumer to subscription
        const subManager = new SubscriptionManager({
            signer: athlete,
            linkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
            functionsRouterAddress: functionsRouter,
        })
        const txOptions = {}
        await subManager.initialize()
        await subManager.addConsumer({
            subscriptionId: subId,
            consumerAddress: consumer.address,
            txOptions,
        })
    }

    //deploy chainrunners
    const chainrunner = await hre.ethers.deployContract("ChainRunners", [
        consumer.address,
        chainRunnerToken.address,
        chainRunnersNFT.address,
    ])
    await chainrunner.deployed()

    console.log(`\n ------------------------------------`)
    console.log(`Chainrunner deployed to: ${chainrunner.address}`)
    console.log(`------------------------------------\n`)

    //set up chainrunners for testing

    console.log(`\n ------------------------------------`)
    console.log(`Create Competition , and Athlete2 Joins, set Admin, assign consumer address`)
    console.log(`------------------------------------\n`)
    const buyIn = hre.ethers.utils.parseEther("0.01")
    await chainrunner.createAthlete("Ahmed", "62612170")
    await chainrunner.connect(athlete_2).createAthlete("Mihai", "127753215")
    //create competitions and join with other athlete
    await chainrunner.createCompetition("oneForAll", 28, 7, {
        value: buyIn,
    })
    // await chainrunner.connect(athlete_2).joinCompetition(1, { value: buyIn })
    //set chainrunner as admin
    await consumer.setAdmin(chainrunner.address)
    //set chainrunner interface
    await consumer.setChainRunnerInterfaceAddress(chainrunner.address)

    // approve chain runners to token
    const totalSupply = await chainRunnerToken.totalSupply()
    // Keep
    //await chainRunnerToken.transfer(chainrunner.address, parseEther("100000"))
    //record new contract address and ABI
    await updateContractInfo(
        chainrunner.address,
        consumer.address,
        chainRunnersNFT.address,
        chainRunnerToken.address
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
