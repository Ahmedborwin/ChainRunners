const hre = require("hardhat")
const ChainRunnerNFTAddresses = require("../src/config/chainRunnerNFTAddress.json")

async function main() {
    const [deployer] = await hre.ethers.getSigners()
    // need nft abi and address
    const chainId = (await hre.ethers.provider.getNetwork()).chainId.toString()
    const nftAddress = ChainRunnerNFTAddresses[chainId]
    const chainRunnerNFT = await hre.ethers.getContractAt("ChainRunnersNFT", nftAddress)

    //will need deploy mock VRF?!

    //call nft contract to mint All 7 NFTs
    for (let i = 0; i < 7; i++) {
        await chainRunnerNFT.testMint(i)
    }

    const NFTURIList = await chainRunnerNFT.getTokenURIByAthlete(deployer.address)
    console.log(NFTURIList)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
