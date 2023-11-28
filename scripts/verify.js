const { ethers } = require("hardhat")
const hre = require("hardhat")

const chainRunnerAddressList = require("../config/chainRunnerAddress.json")
const consumerAddressList = require("../config/consumerAddress.json")
const chainLinkFunctionsRouterList = require("../config/ChainlinkFunctionRouters.json")

async function verifyContracts() {
    const chainID = (await ethers.provider.getNetwork()).chainId.toString()
    const mumbaiRouter = chainLinkFunctionsRouterList[chainID]
    const chainRunnerAddress = chainRunnerAddressList[chainID]
    const consumerAddress = consumerAddressList[chainID]

    await hre.run("verify:verify", {
        address: consumerAddress,
        constructorArguments: [mumbaiRouter],
    })

    await hre.run("verify:verify", {
        address: chainRunnerAddress,
        constructorArguments: [consumerAddress],
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
verifyContracts().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

module.exports.verifyContracts = verifyContracts
