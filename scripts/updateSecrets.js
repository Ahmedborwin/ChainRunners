const hre = require("hardhat")
const functionsConsumerAddresses = require("../src/config/consumerAddress.json")
const functionsConsumerABI = require("../src/config/consumerAbi.json")
const chainLinkFunctions = require("./chainlinkFunctions")

async function main() {
    let functionsConsumer, rpcUrl, provider, donHostedSecretsObject

    const chainID = (await hre.ethers.provider.getNetwork()).chainId.toString()
    // initiate to consumer contract
    const functionsConsumerAddress = functionsConsumerAddresses[chainID]
    //need provider
    if (chainID === "80001") {
        rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"
    } else if (chainID === "43113") {
        rpcUrl = "https://avalanche-fuji.drpc.org"
    }
    provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)
    //need signer
    const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
    const wallet = new hre.ethers.Wallet(privateKey)
    const admin = wallet.connect(provider)

    //update Secrets by calling chainLink functions script
    donHostedSecretsObject = await chainLinkFunctions(chainID)

    functionsConsumer = await hre.ethers.getContractAt(
        functionsConsumerABI,
        functionsConsumerAddress
    )

    //update secret for athlete 1
    let txResponse = await functionsConsumer
        .connect(admin)
        .populateVersionSecret(
            donHostedSecretsObject.donHostedSecretsVersion,
            donHostedSecretsObject.athlete.address
        )

    //update secret for athlete 2
    txResponse = await functionsConsumer
        .connect(admin)
        .populateVersionSecret(
            donHostedSecretsObject.donHostedSecretsVersion_2,
            donHostedSecretsObject.athlete_2.address
        )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
