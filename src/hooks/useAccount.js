import { useAccount, useNetwork } from "wagmi"
import { useWalletClient } from "wagmi"

const useWalletConnected = () => {
    const { address, isConnecting } = useAccount()

    const { chain } = useNetwork()

    const { data: wallet, isError: walletIsError } = useWalletClient({
        onSuccess() {
            console.log("Wallet Connected")
        },
        onError() {
            console.log("Wallet Connection Failed")
        },
    })

    return { address, chain, wallet, walletIsError, isConnecting }
}

export default useWalletConnected
