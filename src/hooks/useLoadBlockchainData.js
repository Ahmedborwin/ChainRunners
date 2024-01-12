// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { useWalletClient, useContractWrite, usePrepareContractWrite, useNetwork } from 'wagmi';

// // ABIs: Import your contract ABIs here
// import ChainRunners_ABI from "../config/chainRunnerAbi.json";
// import Consumer_ABI from "../config/consumerAbi.json";

// // Config: Import your network config here
// import consumerAddress from "../config/consumerAddress.json";
// import chainRunnerAddress from "../config/chainRunnerAddress.json";

// const useLoadBlockchainData = () => {
//     const [provider, setProvider] = useState(null);
//     const [signer, setSigner] = useState(null);
//     const [chainRunner, setChainRunner] = useState(null);
//     const [consumer, setConsumer] = useState(null);
//     const [account, setAccount] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const { chain } = useNetwork()
//     // const { data } = useWalletClient();
//     // console.log(data, "@@@@data")
//     const { config } = usePrepareContractWrite({
//         address: '0xFa6cA738fbCB5Fbd7896BcC47092A6e798ca5e96',
//         abi: ChainRunners_ABI,
//         functionName: 'createAthlete',
//         args: ["Name1", "2"]
//       })
//       const { data, write } = useContractWrite(config)

//       console.log(chain?.id, "@@@@chain")

//     console.log(config, "@@@@config")
//     console.log(data, "@@@@data")

//     const loadBlockchainData = async (data) => {
//         // Check if MetaMask or a compatible Ethereum provider is available
//         if (data) {
//             // Initiate provider
//             // const provider = `https://polygon-mumbai.g.alchemy.com/v2/-mN93uQwSHMo3x3ZqlvVmMC1zXvlHtFd`;
//             // setProvider(provider);
//             // console.log(walletClient, "@@@@walletClient")
//             // const chainId = await walletClient.getChainId();
//             // console.log(chainId, "@@@chainId")
//             // Get signer
//             // const signer = await walletClient.account;
//             // setSigner(signer);
//             // console.log(signer, "@@@@signer")
//             // Initiate ChainRunner contract
//             // const chainRunner = useContractWrite(chainRunnerAddress[chainId], ChainRunners_ABI, walletClient)
//             // const chainRunner = new ethers.Contract(chainRunnerAddress[chainId], ChainRunners_ABI, provider);
//             // console.log(chainRunner, "@@@@chainRunner")
//             // setChainRunner(chainRunner);

//             // Initiate Consumer contract
//             // const consumer = new ethers.Contract(consumerAddress[chainId], Consumer_ABI, provider);
//             // setConsumer(consumer);

//             // Get current account
//             // const accounts = await data.getAddresses();
//             // console.log(accounts, "@@@@accounts")
//             // const account = accounts[0];
//             // setAccount(account);
//             // setIsLoading(false);
//         }
//     }

//     // useEffect(() => {
//     //     if (isLoading)
//     //         loadBlockchainData(data);
//     // }, [isLoading])

//     return { provider: provider, chainRunner: chainRunner, consumer: consumer, signer: signer, account: account };
// }

// export default useLoadBlockchainData;
