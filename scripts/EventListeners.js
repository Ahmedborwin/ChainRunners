const { ethers } = require("hardhat")
const hre = require("hardhat")
const fs = require("fs")

async function EventListeners() {
    // Example variables - replace these with actual values
    const CHAINRUNNER_ADDRESS_FILE = "src/config/chainRunnerAddress.json"
    const CHAINRUNNER_ABI_FILE = require("../src/config/chainRunnerAbi.json")
    const eventName = "winnerPicked" // Replace with the name of the event you want to listen to

    // Connect to the Ethereum network
    // This example uses a default provider for the Rinkeby test network.
    // For a production environment, use a dedicated provider like Infura or Alchemy.
    const rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"
    const provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)

    const chainrunnerAddressList = JSON.parse(fs.readFileSync(CHAINRUNNER_ADDRESS_FILE, "utf8"))

    const chainRunnerAbi = CHAINRUNNER_ABI_FILE

    const chainRunnerAddress = chainrunnerAddressList["80001"]

    // Connect to the contract
    const chainRunners = new ethers.Contract(chainRunnerAddress, chainRunnerAbi, provider)

    // Event listener
    chainRunners.on(eventName, (arg1, arg2, event) => {
        console.log(`New Event: ${eventName}`)
        console.log(`Winner Address: ${arg1}, Ether Won: ${arg2}`)
        console.log("Full event:", event)
        // Add your event handling logic here
    })

    chainRunners.on("testWINNERRESULT", (arg1, arg2, event) => {
        console.log(`New Event: testWINNERRESULT`)
        console.log(`Winner Address: ${arg1}, Meters Logged: ${arg2}`)
        console.log("Full event:", event)
        // Add your event handling logic here
    })

    console.log(`Listening for  events...`)
}

EventListeners().catch((e) => {
    console.error(e)
    process.exit = 1
})
