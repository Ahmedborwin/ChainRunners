import React, { useEffect, useState } from "react"
import styled from "styled-components"

// Images
import mapsImage from "../../assets/images/chain.jpg"

// Components
import Greeter from "../Greeter"
import ShowNFT from "./ShowNft"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

//Address and ABI
import NFT_ABI from "../../config/chainRunnerNFTAbi.json"
import NFTAddresses from "../../config/chainRunnerNFTAddress.json"

const Container = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`

const NFTPortfolio = () => {
    //States
    const [nftURIList, setNftURIList] = useState([])
    const [getTokenURIList, setGetTokenURIList] = useState(false)

    //hooks
    const { chain, address } = useWalletConnected()

    // Read ChainRunnersNFT for NFT URI List
    const { data: TokenURIList } = useContractRead({
        address: NFTAddresses[chain.id],
        abi: NFT_ABI,
        functionName: "getTokenURIByAthlete",
        args: [address],
        onError(error) {
            window.alert(error)
        },
        onSuccess(data) {
            console.log("Token URI List", data)
            setNftURIList(data)
            setGetTokenURIList(false)
        },
        onSettled(data, error) {
            console.log("Settled", { data, error })
        },
    })

    //use Effects
    useEffect(() => {
        setGetTokenURIList(true)
    }, [])

    return (
        <Container>
            <Greeter />
            {nftURIList.map((uri, index) => (
                <ShowNFT key={index} NFTURI={uri} />
            ))}
        </Container>
    )
}

export default NFTPortfolio
