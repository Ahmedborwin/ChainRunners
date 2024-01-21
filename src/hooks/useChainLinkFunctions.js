// import { useState, useEffect } from "react"

// //chainlink functions toolkit
// import { SecretsManager } from "@chainlink/functions-toolkit"

// // // Hooks
// // import { useContractWrite, usePrepareContractWrite } from "wagmi"
// // import useWalletConnected from "./useAccount"

// // // ABIs
// // import ChainlinkConsumerABI from "../config/consumerAbi.json"
// // import ChainlinkConsumerAddress from "../config/consumerAddress.json"

// // //router address
// // const chainLinkFunctionsRouterList = require("../config/ChainlinkFunctionRouters.json")

// async function useChainLinkFunctions({ accesstoken }) {
//     //     let linkTokenAddress, donId, gatewayUrls, slotIdNumber, rpcUrl, routerAddress
//     //     //use state hooks
//     //     const [slotId, setSlotId] = useState(0)
//     //     const [accessToken, setAccessToken] = useState(null)
//     //     //hooks
//     //     const { address, chainID, walletClient } = useWalletConnected()
//     //     // //write DonSlotID
//     //     // const { config: prepareConfig1 } = usePrepareContractWrite({
//     //     //     address: ChainlinkConsumerAddress[chainID],
//     //     //     abi: ChainlinkConsumerABI,
//     //     //     functionName: "populateDONSlotID",
//     //     //     args: [address],
//     //     //     enabled: Boolean(),
//     //     // })
//     //     // // Write contract
//     //     // useContractWrite(prepareConfig1)
//     //     // //write secretsVersion
//     //     // const { config: prepareConfig2 } = usePrepareContractWrite({
//     //     //     address: ChainlinkConsumerAddress[chainID],
//     //     //     abi: ChainlinkConsumerABI,
//     //     //     functionName: "populateVersionSecret",
//     //     //     args: [address],
//     //     //     enabled: Boolean(),
//     //     // })
//     //     // // Write contract
//     //     // useContractWrite(prepareConfig2)
//     //     //innitiating secrets
//     //     const initiateSecrets = async () => {}
//     //     //uploading to the DON
//     //     if (accesstoken) {
//     //         setAccessToken(accesstoken)
//     //     }
//     //     const expirationTimeMinutes = 360 // expiration time in minutes of the secrets
//     //     //set variables required to upload secrets
//     //     // If polygon matic
//     //     if (chainID === "80001") {
//     //         linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
//     //         donId = "fun-polygon-mumbai-1"
//     //         gatewayUrls = [
//     //             "https://01.functions-gateway.testnet.chain.link/",
//     //             "https://02.functions-gateway.testnet.chain.link/",
//     //         ]
//     //         rpcUrl = "https://polygon-mumbai.g.alchemy.com/v2/LCWjuGIGXSD0auG-b9ESZdI87BeQCNrp"
//     //         //Chainlink Functions Variables if Avax Fuji
//     //     }
//     //     //if avalanche fuji
//     //     else if (chainID === "43113") {
//     //         linkTokenAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"
//     //         donId = "fun-avalanche-fuji-1"
//     //         gatewayUrls = [
//     //             "https://01.functions-gateway.testnet.chain.link/",
//     //             "https://02.functions-gateway.testnet.chain.link/",
//     //         ]
//     //         rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"
//     //     }
//     //     //retrieve router address from chainlink router
//     //     routerAddress = chainLinkFunctionsRouterList[chainID]
//     //     //secrets should be on env file
//     //     const secrets = {
//     //         clientId: "116415",
//     //         clientSecret: "4784e5e419141ad81ecaac028eb765f0311ee0af",
//     //         accessToken: "dc2f9a4ea7a64b33f95900974ed3b596f2e0f280", // temp - need to call this function and access token on strava call success
//     //     }
//     //     // // First encrypt secrets and upload the encrypted secrets to the DON
//     //     // const secretsManager = new SecretsManager({
//     //     //     signer: walletClient, //i think this is the signer???
//     //     //     functionsRouterAddress: routerAddress,
//     //     //     donId: donId,
//     //     // })
//     //     // // await secretsManager.initialize()
//     //     // // Encrypt secrets and upload to DON
//     //     // const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets)
//     //     // // Upload secrets
//     //     // //need to write the slotId to consumer then increnent
//     //     // const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
//     //     //     encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
//     //     //     gatewayUrls: gatewayUrls, //where to get the relevant gateways from?
//     //     //     slotId: slotIdNumber, //this will need to be dynamic + will increment work?
//     //     //     minutesUntilExpiration: expirationTimeMinutes,
//     //     // })
//     //     if (!uploadResult.success) throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`)
//     //     console.log(
//     //         `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
//     //         uploadResult
//     //     )
//     //     let interimSlotId = slotId
//     //     const newSlotId = interimSlotId++
//     //     setSlotId(newSlotId)
//     //     //need to write this the consumer contract along with the SlotId
//     //     const donHostedSecretsVersion = parseInt(uploadResult.version) // fetch the reference of the encrypted secrets
//     //     console.log(donHostedSecretsVersion)
//     //     useEffect(() => {
//     //         if (accessToken) {
//     //             //initiate secrets manager
//     //             //upload secrets
//     //             //write data to consumer
//     //         }
//     //     }, [accessToken])
// }

// export default useChainLinkFunctions
