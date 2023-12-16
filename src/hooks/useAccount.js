import { useAccount, useNetwork } from "wagmi"
import { useWalletClient } from "wagmi"

const useWalletConnected = () => {
    const { address, isConnecting, isDisconnected } = useAccount()

    const { chain } = useNetwork()
    const {
        data: wallet,
        isError: walletIsError,
        isLoading,
    } = useWalletClient({
        onSuccess() {
            console.log("Wallet Connected")
        },
    })

    if (!wallet) {
        console.error("wallet Not initialised")
    }

    return { address, chain, wallet, walletIsError, isConnecting }
}

export default useWalletConnected
