const hre = require("hardhat")
const fs = require("fs")
const path = require("path")
const updateContractInfo = require("./updateAddress&ABI")
// const chainLinkFunctions = require("./chainlinkFunctions")
const chainLinkFunctionsRouterList = require("../config/ChainlinkFunctionRouters.json")

async function main() {
    let rpcUrl, deployer, athlete_2

    const chainID = (await hre.ethers.provider.getNetwork()).chainId.toString()
    //set up chainrunners for testing
    const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
    const privateKey_2 = process.env.PRIVATE_KEY_2 // fetch PRIVATE_KEY
    const API_Key = process.env.POLYGON_MUMBAI_RPC_URL

    if (chainID == "31337") {
        ;[deployer, athlete_2] = await hre.ethers.getSigners()
    } else {
        rpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${API_Key}`

        console.log("Test 2", rpcUrl)

        const provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)

        const wallet_2 = new hre.ethers.Wallet(
            privateKey_2 //hardhat private key
        )
        athlete_2 = wallet_2.connect(provider)
    }
    // Initialize functions settings
    const getAthleteData = fs
        .readFileSync(path.resolve(__dirname, "../scripts/APICalls/getAthleteData.js"))
        .toString()

    //upload secrets and get secretsVersion
    // const donHostedSecretsVersion = await chainLinkFunctions()

    const donId = hre.ethers.utils.formatBytes32String("fun-polygon-mumbai-1")
    const subId = 584
    const slotId = 0

    const mumbaiRouter = chainLinkFunctionsRouterList[chainID]

    //Deploy Token

    const consumer = await hre.ethers.deployContract("crChainlinkRequestConsumer", [mumbaiRouter])
    await consumer.deployed()

    // populate code for calling athlete stats
    await consumer.populateAPICallJS(getAthleteData)
    //populate DonId bytes
    await consumer.populateDonId(donId)
    //populate subId
    await consumer.populateSubId(subId)
    //await consumer.populateVersionSecret(donHostedSecretsVersion)
    await consumer.populateDONSlotID(slotId)

    console.log(` /n ------------------------------------`)
    console.log(`Consumer deployed to: ${consumer.address}`)
    console.log(`------------------------------------ \n`)

    //deploy chainrunners
    const chainrunner = await hre.ethers.deployContract("ChainRunners", [consumer.address])
    await chainrunner.deployed()

    const buyIn = hre.ethers.utils.parseEther("0.01")

    //create two athletes
    await chainrunner.createAthlete("Ahmed", "62612170")

    await chainrunner.connect(athlete_2).createAthlete("Bolt", "62612170")

    //create competitions and join with other athlete
    await chainrunner.createCompetition("oneForAll", buyIn, 28, 7, {
        value: buyIn,
    })

    await chainrunner.connect(athlete_2).joinCompetition(1, { value: buyIn })

    //set chainrunner as admin
    await consumer.setAdmin(chainrunner.address)
    //set chainrunner interface
    await consumer.setChainRunnerInterfaceAddress(chainrunner.address)

    console.log(`/n ------------------------------------`)
    console.log(`Chainrunner deployed to: ${chainrunner.address}`)
    console.log(`------------------------------------ \n`)

    //record new contract address and ABI
    await updateContractInfo(chainrunner.address, consumer.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
