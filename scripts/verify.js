const { ethers } = require("hardhat")
const hre = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const chainRunnerAddressList = require("../src/config/chainRunnerAddress.json")
const consumerAddressList = require("../src/config/consumerAddress.json")
const chainRunnerNFTAddressList = require("../src/config/chainRunnerNFTAddress.json")
const chainRunnerTokenAddressList = require("../src/config/chainRunnerTokenAddress.json")
const chainLinkFunctionsRouterList = require("../src/config/ChainlinkFunctionRouters.json")

async function verifyContracts() {
    const chainID = (await ethers.provider.getNetwork()).chainId.toString()
    const mumbaiRouter = chainLinkFunctionsRouterList[chainID]
    const chainRunnerAddress = chainRunnerAddressList[chainID]
    const consumerAddress = consumerAddressList[chainID]
    const NFTAddress = chainRunnerNFTAddressList[chainID]
    const TokenAddress = chainRunnerTokenAddressList[chainID]

    //Arguments for NFT Contract Constructor
    const vrfCoordinatorV2Address = networkConfig[chainID].vrfCoordinatorV2
    const subscriptionId = networkConfig[chainID].subscriptionId

    let tokenUris = [
        "ipfs://Qmdiqgx6v4BwAob7LBbCoWXLQRfX6c64J7aAzf5HJ2Ueby",
        "ipfs://QmW3Y41WmUmiR61TVyqFLBagmzQAFAFYjPFB262wv33Asd",
        "ipfs://QmaSd4cazjgi3mF3f3m3JxR6eRN2sQ5nyRUjAWP1CS6o8R",
        "ipfs://QmYJxJSnKr47rjLRjCHW8UxKoEykFxr2xMvYTCpsuH8VGM",
        "ipfs://QmUCSDj79jANawVXBFSVStgMdVDrsZ2hoTo8Yt6w7Voud9",
        "ipfs://QmX5vNacPZBC7GpFU2JJFgdKMbphLgGE5WxN7G36WLcPjE",
        "ipfs://QmQXHFdrFMynZRY2cmPV12EMuvKoNTeATmwjbzZ4sJm1b3",
    ]

    await hre.run("verify:verify", {
        address: consumerAddress,
        constructorArguments: [mumbaiRouter],
    })

    await hre.run("verify:verify", {
        address: chainRunnerAddress,
        constructorArguments: [consumerAddress, NFTAddress, TokenAddress],
    })
    await hre.run("verify:verify", {
        address: NFTAddress,
        constructorArguments: [
            vrfCoordinatorV2Address,
            subscriptionId,
            networkConfig[chainID]["gasLane"],
            networkConfig[chainID]["callbackGasLimit"],
            tokenUris,
        ],
    })
    await hre.run("verify:verify", {
        address: TokenAddress,
        constructorArguments: [],
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
verifyContracts().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

module.exports.verifyContracts = verifyContracts
