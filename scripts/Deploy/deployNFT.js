const hre = require("hardhat")
const { networkConfig } = require("../../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadPinata")
const { metadataTemplateArray } = require("../../constants")
const VRFCoordinatorV2ABI = require("../../src/config/vrfCordinatorV2ABI.json")

let counter

const imagesLocation = "Media/NFT"

let tokenUris = [
    "ipfs://Qmdiqgx6v4BwAob7LBbCoWXLQRfX6c64J7aAzf5HJ2Ueby",
    "ipfs://QmW3Y41WmUmiR61TVyqFLBagmzQAFAFYjPFB262wv33Asd",
    "ipfs://QmaSd4cazjgi3mF3f3m3JxR6eRN2sQ5nyRUjAWP1CS6o8R",
    "ipfs://QmYJxJSnKr47rjLRjCHW8UxKoEykFxr2xMvYTCpsuH8VGM",
    "ipfs://QmUCSDj79jANawVXBFSVStgMdVDrsZ2hoTo8Yt6w7Voud9",
    "ipfs://QmX5vNacPZBC7GpFU2JJFgdKMbphLgGE5WxN7G36WLcPjE",
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

    //Add NFt contract as a VRF consumer
    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, chainRunnersNFT.address)
    } else {
        const vrfCoorindatorContract = await hre.ethers.getContractAt(
            VRFCoordinatorV2ABI,
            vrfCoordinatorV2Address
        )
        await vrfCoorindatorContract.addConsumer(subscriptionId, chainRunnersNFT.address)
    }

    return [chainRunnersNFT, vrfCoordinatorV2Mock]
}

async function handleTokenUris() {
    tokenUris = []
    counter = 1
    const { responses: imageUploadResponses } = await storeImages(imagesLocation)
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
