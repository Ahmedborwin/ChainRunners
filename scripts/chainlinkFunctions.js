const { SecretsManager } = require("@chainlink/functions-toolkit")
const hre = require("hardhat")
const accessToken = require("./getAppAccessToken")
const chainLinkFunctionsRouterList = require("../src/config/ChainlinkFunctionRouters.json")
require("@chainlink/env-enc").config()

const expirationTimeMinutes = 360 // expiration time in minutes of the secrets

async function chainLinkFunctions(chainID) {
    let linkTokenAddress, donId, gatewayUrls, slotIdNumber, rpcUrl, routerAddress

    //Chainlink Functions Variables if Matic Mumbai
    if (chainID === "80001") {
        linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
        donId = "fun-polygon-mumbai-1"
        gatewayUrls = [
            "https://01.functions-gateway.testnet.chain.link/",
            "https://02.functions-gateway.testnet.chain.link/",
        ]
        rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"

        //Chainlink Functions Variables if Avax Fuji
    } else if (chainID === "43113") {
        linkTokenAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"
        donId = "fun-avalanche-fuji-1"
        gatewayUrls = [
            "https://01.functions-gateway.testnet.chain.link/",
            "https://02.functions-gateway.testnet.chain.link/",
        ]
        rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"
    }

    //get updated Access token
    const accessTokens = await accessToken()

    //Secrets for athlete 1
    const secrets = {
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET,
        accessToken: accessTokens.accessTokenAthlete1,
    }

    const secrets_2 = {
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET,
        accessToken: accessTokens.accessTokenAthlete2,
    }

    //get Contract Address's based on chainID
    routerAddress = chainLinkFunctionsRouterList[chainID]

    // Initialize ethers signer and provider to interact with the contracts onchain
    const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
    const privateKey_2 = process.env.PRIVATE_KEY_2 // fetch PRIVATE KEY of second account }
    if (!privateKey) throw new Error("private key not provided - check your environment variables")
    if (!privateKey_2)
        throw new Error("private key not provided - check your environment variables")
    if (!rpcUrl) throw new Error(`rpcUrl not provided  - check your environment variables`)

    //Set up athlete 1 and 2 signers
    const provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)
    const wallet = new hre.ethers.Wallet(privateKey)
    const athlete = wallet.connect(provider)
    const wallet_2 = new hre.ethers.Wallet(privateKey_2)
    const athlete_2 = wallet_2.connect(provider)

    // First encrypt secrets and upload the encrypted secrets to the DON
    const secretsManager = new SecretsManager({
        signer: athlete,
        functionsRouterAddress: routerAddress,
        donId: donId,
    })
    await secretsManager.initialize()
    // Encrypt secrets and upload to DON
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets)
    // Upload secrets
    slotIdNumber = 0
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: gatewayUrls, //where to get the relevant gateways from?
        slotId: slotIdNumber, //this will need to be dynamic + will increment work?
        minutesUntilExpiration: expirationTimeMinutes,
    })

    if (!uploadResult.success) throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`)

    console.log(
        `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
        uploadResult
    )
    // Encrypt secrets and upload to DON
    const encryptedSecretsObj_2 = await secretsManager.encryptSecrets(secrets_2)
    slotIdNumber++
    // Upload secrets
    const uploadResult_2 = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj_2.encryptedSecrets,
        gatewayUrls: gatewayUrls, //where to get the relevant gateways from?
        slotId: slotIdNumber, //this will need to be dynamic + will increment work?
        minutesUntilExpiration: expirationTimeMinutes,
    })

    if (!uploadResult_2.success) throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`)

    console.log(
        `\n✅ Secrets for Athlete 2 uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
        uploadResult
    )

    const donHostedSecretsVersion = parseInt(uploadResult.version) // fetch the reference of the encrypted secrets
    const donHostedSecretsVersion_2 = parseInt(uploadResult_2.version) // fetch the reference of the encrypted secrets

    return { donHostedSecretsVersion, donHostedSecretsVersion_2, athlete, athlete_2 }
}

module.exports = chainLinkFunctions
