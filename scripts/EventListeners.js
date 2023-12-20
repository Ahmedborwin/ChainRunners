const { ethers } = require("hardhat")
const hre = require("hardhat")
const fs = require("fs")
require("dotenv").config()

async function EventListeners() {
    // Example variables - replace these with actual values
    const CHAINRUNNER_ADDRESS_FILE = "src/config/chainRunnerAddress.json"
    const CHAINRUNNER_ABI_FILE = require("../src/config/chainRunnerAbi.json")

    const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL
    if (!rpcUrl) {
        console.error("NO RPC  URL")
    }
    const provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)
    if (!provider) {
        console.error("NO Provider")
    }
    const chainrunnerAddressList = JSON.parse(fs.readFileSync(CHAINRUNNER_ADDRESS_FILE, "utf8"))

    const chainRunnerAbi = CHAINRUNNER_ABI_FILE

    const chainRunnerAddress = chainrunnerAddressList["80001"]

    // Connect to the contract
    const chainRunners = new ethers.Contract(chainRunnerAddress, chainRunnerAbi, provider)

    chainRunners.on("competitionStarted", (arg1, arg2, arg3, arg4, arg5, event) => {
        console.log("-----------------------")
        console.log(`New Event: competitionStarted`)
        console.log(
            `comp started, compid is: ${arg1} , list of athletes: ${arg2}
            )}`
        )
        console.log("-----------------------")
        // Add your event handling logic here
    })
    // Event listener
    chainRunners.on("winnerPicked", (arg1, arg2, arg3, event) => {
        console.log("-----------------------")
        console.log(`New Event: winnerPicked`)
        console.log(
            `Winner Address: ${arg1}, Comps Won: ${arg2}, tokensWon: ${ethers.utils.formatEther(
                arg3.toString()
            )}`
        )
        console.log("-----------------------")
        // Add your event handling logic here
    })

    chainRunners.on("IntervalWinnerEvent", (arg1, arg2, arg3, event) => {
        console.log("-----------------------")
        console.log(`New Event: IntervalWinnerEvent`)
        console.log(`Winner Address: ${arg1}, Meters Logged: ${arg2} , Counter${arg3}`)
        console.log("-----------------------")
        //console.log("Full event:", event)
        // Add your event handling logic here
    })
    chainRunners.on("testDistanceLogged", (arg1, arg2, arg3, event) => {
        console.log("-----------------------")
        console.log(`New Event: testDistanceLogged`)
        console.log(`Meters Logged:${arg1},Athlete ${arg3} ,Counter: ${arg2}`)
        console.log("-----------------------")
        //console.log("Full event:", event)
        // Add your event handling logic here
    })
    chainRunners.on("testCurrentOverAllWinner", (arg1, event) => {
        console.log("-----------------------")
        console.log(`New Event: testCurrentOverAllWinner`)
        console.log(`Current Over all winner:${arg1}`)
        console.log("-----------------------")
        //console.log("Full event:", event)
        // Add your event handling logic here
    })
    chainRunners.on("testWinnerDistanceVMetersLogged", (arg1, arg2, arg3, event) => {
        console.log("-----------------------")
        console.log(`New Event: testWinnerDistanceVMetersLogged`)
        console.log(`athlete:${arg3} , currentWinnerDistance ${arg1}, metersLogged ${arg2}`)
        console.log("-----------------------")
        //console.log("Full event:", event)
        // Add your event handling logic here
    })

    console.log(`Listening for events...`)
}

EventListeners().catch((e) => {
    console.error(e)
    process.exit = 1
})
