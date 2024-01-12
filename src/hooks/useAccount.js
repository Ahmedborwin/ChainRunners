import { useAccount, useNetwork } from "wagmi"
import { useWalletClient } from "wagmi"
import { useState } from "react"

const useWalletConnected = () => {
    const { address, isConnecting, isReconnecting } = useAccount()
    const [currentAddress, setCurrentAddress] = useState(null)

    const { chain } = useNetwork()

    const {
        data: wallet,
        isError: walletIsError,
        isLoading,
    } = useWalletClient({
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
