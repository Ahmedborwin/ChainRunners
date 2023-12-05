import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// ABIs: Import your contract ABIs here
import ChainRunners_ABI from "../config/chainRunnerAbi.json";
import Consumer_ABI from "../config/consumerAbi.json";

// Config: Import your network config here
import consumerAddress from "../config/consumerAddress.json";
import chainRunnerAddress from "../config/chainRunnerAddress.json";

const useLoadBlockchainData = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainRunner, setChainRunner] = useState(null);
    const [consumer, setConsumer] = useState(null);
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadBlockchainData = async () => {
        // Check if MetaMask or a compatible Ethereum provider is available
        if (!window.ethereum) {
            setIsLoading(false);
            return;
        }

        // Initiate provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const chainId = (await provider.getNetwork())?.chainId;

        // Get signer
        const signer = provider.getSigner();
        setSigner(signer)

        // Initiate ChainRunner contract
        const chainRunner = new ethers.Contract(chainRunnerAddress[chainId], ChainRunners_ABI, provider);
        setChainRunner(chainRunner);

        // Initiate Consumer contract
        const consumer = new ethers.Contract(consumerAddress[chainId], Consumer_ABI, provider);
        setConsumer(consumer);

        // Get current account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
        setIsLoading(false);
    }

    useEffect(() => {
        if (isLoading)
            loadBlockchainData();
    }, [isLoading])

    return { provider: provider, chainRunner: chainRunner, consumer: consumer, signer: signer, account: account };
}

export default useLoadBlockchainData;