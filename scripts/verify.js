const hre = require("hardhat")

async function verifyContracts() {
    const mumbaiRouter = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C"
    const chainRunnerAddress = "0x5aAD41117e3769bF0A619b427Fd01414ef0c6721"
    const consumerAddress = "0xbAA51B3Cd6083955BcAE6BF7160a12e095D47c48"

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
