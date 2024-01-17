const hre = require("hardhat")
const fs = require("fs")
const path = require("path")
const chainLinkFunctions = require("./chainlinkFunctions")
const consumerAddresses = require("../src/config/consumerAddress.json")

const chainID = (await hre.ethers.provider.getNetwork()).chainId.toString()
const consumer = consumerAddresses[chainID]

const rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"
const provider = new hre.ethers.providers.JsonRpcProvider(rpcUrl)

//get secrets object
const donHostedSecretsObject = await chainLinkFunctions(chainID)

console.log(`\n ------------------------------------`)
console.log(`Set up consumer for chainID:: ${chainID}`)
console.log(`------------------------------------ \n`)
const privateKey = process.env.PRIVATE_KEY // fetch PRIVATE_KEY
const wallet = new hre.ethers.Wallet(privateKey)
const athlete = wallet.connect(provider)
//create athlete 2 for testing
const privateKey_2 = process.env.PRIVATE_KEY_2 // fetch PRIVATE KEY of second account }
const wallet_2 = new hre.ethers.Wallet(privateKey_2)
const athlete_2 = wallet_2.connect(provider)

await consumer.populateVersionSecret(
    donHostedSecretsObject.donHostedSecretsVersion,
    athlete.address
)
await consumer.populateVersionSecret(
    donHostedSecretsObject.donHostedSecretsVersion_2,
    athlete_2.address
)
