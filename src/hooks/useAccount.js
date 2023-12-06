import { useAccount, useNetwork } from "wagmi";

const useWalletConnected = () => {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { chain } = useNetwork();

    return { address: address, chain: chain };
}

export default useWalletConnected;