// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const fs = require("fs")
const path = require("path")
const { verify } = require("./verify")

async function main() {
    // Initialize functions settings
    const getAthleteData = fs.readFileSync(path.resolve(__dirname, "getAthleteData.js")).toString()
    const donId = hre.ethers.utils.formatBytes32String("fun-polygon-mumbai-1")

    // Deploy Token
    const consumerFactory = await hre.ethers.getContractFactory("FunctionsConsumerExample")
    let consumer = await consumerFactory.deploy("0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C")

    await consumer.deployed()

    let tx = await consumer.populateString(getAthleteData)

    await tx.wait(5)

    tx = await consumer.populateDonId(donId)

    await tx.wait(5)

    console.log(`Consumer deployed to: ${consumer.address}\n`)
    console.log(`------------------------------------`)
    console.log(`------------------------------------`)
    //deploy chainrunners
    const chainrunnerfactory = await hre.ethers.getContractFactory("ChainRunners")
    let chainrunner = await chainrunnerfactory.deploy(consumer.address)

    await chainrunner.deployed()

    console.log(`Chainrunner deployed to: ${chainrunner.address}`)

    const jsCodeGetAthlete = await chainrunner.getSourceTest()

    console.log(`GET Athlete data from Chain Runner /n ${jsCodeGetAthlete}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
