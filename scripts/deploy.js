const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
    // Initialize functions settings
    const getAthleteData = fs.readFileSync(path.resolve(__dirname, "getAthleteData.js")).toString()
    const donId = hre.ethers.utils.formatBytes32String("fun-polygon-mumbai-1")
    const subId = 584
    const mumbaiRouter = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C"

    // Deploy Token
    const consumerFactory = await hre.ethers.getContractFactory("crChainlinkRequestConsumer")
    let consumer = await consumerFactory.deploy(mumbaiRouter)

    await consumer.deployed()

    // await hre.run("verify:verify", {
    //     address: consumer.address,
    //     constructorArguments: [mumbaiRouter],
    // })

    // populate code for calling athlete stats
    let tx = await consumer.populateAPICallJS(getAthleteData)

    await tx.wait(5)

    //populate DonId bytes
    tx = await consumer.populateDonId(donId)

    //populate subId
    tx = await consumer.populateSubId(subId)

    //upload secrets to DON

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

    // await hre.run("verify:verify", {
    //     address: chainrunner.address,
    //     constructorArguments: [consumer.address],
    // })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
