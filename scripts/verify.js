const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
    const mumbaiRouter = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C"
    const chainRunnerAddress = "0x77218f5F2810545A76d4C97206e4cffA558f1dcC"
    const consumerAddress = "0x1a1611Aff8242C4E013AB63541cce9D9f0aFd718"

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
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
