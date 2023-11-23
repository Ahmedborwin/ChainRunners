const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
    // Initialize functions settings
    const getAthleteData = fs.readFileSync(path.resolve(__dirname, "getAthleteData.js")).toString()
    const donId = hre.ethers.utils.formatBytes32String("fun-polygon-mumbai-1")
    const subId = 584
    const mumbaiRouter = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C"

    //Deploy Token

    const consumer = await hre.ethers.deployContract("crChainlinkRequestConsumer", [mumbaiRouter])

    await consumer.deployed()

    // populate code for calling athlete stats
    await consumer.populateAPICallJS(getAthleteData)

    // await tx.wait(5)

    //populate DonId bytes
    await consumer.populateDonId(donId)

    //populate subId
    await consumer.populateSubId(subId)

    //upload secrets to DON

    // await tx.wait(5)
    console.log(` /n ------------------------------------`)
    console.log(`Consumer deployed to: ${consumer.address}`)
    console.log(`------------------------------------ \n`)

    //deploy chainrunners

    const chainrunner = await hre.ethers.deployContract("ChainRunners", [consumer.address])

    await chainrunner.deployed()

    await consumer.transferOwner(chainrunner.address)

    console.log(` /n ------------------------------------`)
    console.log(`Chainrunner deployed to: ${chainrunner.address}`)
    console.log(`------------------------------------ \n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
