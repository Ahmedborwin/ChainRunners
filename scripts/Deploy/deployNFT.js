const hre = require("hardhat")
const { networkConfig, developmentChains } = require("../../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadPinata")
const { metadataTemplateArray } = require("../../constants")

let counter

const imagesLocation = "Media/NFT"

let tokenUris = [
    "ipfs://QmdBMEK72nU2oMupqrT1fSj6kHt8VttTg5q67RvvgjXD3G",
    "ipfs://QmeBpehrsCkMubmiyHMyh8mVH6DskdNzFR3DhLA61cXQrs",
    "ipfs://QmfYfDLWpfz167rVtqve3we7SyuKcb5EPFaqnqxYCfpRJV",
    "ipfs://QmQS2bbtcRV4tZ7ScHvBXbKuT3Nwp986e5rvwzhGsCe85Z",
    "ipfs://QmX1eBFnkNsU33GiZnDXrp1cCPG31v8qnDiC7cNwtVjYAH",
    "ipfs://QmeixBpjnnF7fWuc9p8CcFiRuMPTjkT27LY5CLgdYpi5wu",
    "ipfs://QmQXHFdrFMynZRY2cmPV12EMuvKoNTeATmwjbzZ4sJm1b3",
]

async function deployNFT() {
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock, args

    const chainId = hre.network.config.chainId

    const FUND_AMOUNT = "1000000000000000000000"

    const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
    const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    if (chainId == 31337) {
        vrfCoordinatorV2Mock = await hre.ethers.deployContract("VRFCoordinatorV2Mock", [
            BASE_FEE,
            GAS_PRICE_LINK,
        ])
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)

        subscriptionId = transactionReceipt.events[0].args.subId

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
    ]

    const chainRunnersNFT = await hre.ethers.deployContract("ChainRunnersNFT", args)

    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, chainRunnersNFT.address)

    return [chainRunnersNFT, vrfCoordinatorV2Mock]
}

async function handleTokenUris() {
    tokenUris = []
    counter = 1
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = metadataTemplateArray[imageUploadResponseIndex]
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

// deployNFT().catch((e) => {
//     console.error(e)
//     process.exit = 1
// })

module.exports = deployNFT // Export the function for use in other modules
