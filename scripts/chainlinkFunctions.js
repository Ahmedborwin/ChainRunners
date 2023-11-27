const fs = require("fs")
const path = require("path")
const { SecretsManager } = require("@chainlink/functions-toolkit")
const { ethers } = require("hardhat")
const hardhatConfig = require("../hardhat.config")

const accessToken = require("../scripts/getAppAccessToken")

const chainRunnerAddressList = require("../config/chainRunnerAddress.json")
const consumerAddressList = require("../config/consumerAddress.json")
const chainLinkFunctionsRouterList = require("../config/ChainlinkFunctionRouters.json")
require("@chainlink/env-enc").config()

// Initialize functions settings
// will need this make these dynamic - add to hardhat-config under networks

const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
const donId = "fun-polygon-mumbai-1"
const gatewayUrls = [
    "https://01.functions-gateway.testnet.chain.link/",
    "https://02.functions-gateway.testnet.chain.link/",
]

const getAthleteData = fs
    .readFileSync(path.resolve(__dirname, "APICalls/getAthleteData.js"))
    .toString()

const slotIdNumber = 0 // slot ID where to upload the secrets
const expirationTimeMinutes = 360 // expiration time in minutes of the secrets

async function chainLinkFunctions() {
    let rpcUrl, chainID, routerAddress, chainRunnerAddress, consumerAddress
    const network = await ethers.provider.getNetwork()

    //get updated Access token
    const accessTokenString = await accessToken()
    console.log("access token Functions call to secret manager: ", accessTokenString.toString())

    const secrets = {
        clientId: "116415",
        clientSecret: "4784e5e419141ad81ecaac028eb765f0311ee0af",
        accessToken: accessTokenString,
    }

    // Initialize ethers signer and provider to interact with the contracts onchain
    const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
    if (!privateKey) throw new Error("private key not provided - check your environment variables")

    rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"

    if (!rpcUrl) throw new Error(`rpcUrl not provided  - check your environment variables`)

    chainID = network.chainId

    routerAddress = chainLinkFunctionsRouterList[chainID]
    chainRunnerAddress = chainRunnerAddressList[chainID]
    consumerAddress = consumerAddressList[chainID]

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey)
    const signer = wallet.connect(provider)

    // First encrypt secrets and upload the encrypted secrets to the DON
    const secretsManager = new SecretsManager({
        signer: signer,
        functionsRouterAddress: routerAddress,
        donId: donId,
    })
    await secretsManager.initialize()
    // Encrypt secrets and upload to DON
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets)
    // Upload secrets
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

    const donHostedSecretsVersion = parseInt(uploadResult.version) // fetch the reference of the encrypted secrets
    return donHostedSecretsVersion
}

// chainLinkFunctions().catch((e) => {
//     console.error(e)
//     process.exit(1)
// })

module.exports = chainLinkFunctions
