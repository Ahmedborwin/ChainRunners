import React, { useEffect, useState } from "react"
import styled from "styled-components"

// Images
import mapsImage from "../../assets/images/chain.jpg"

// Components
import Greeter from "../Greeter"
import ShowNFT from "./ShowNft"
import BuyNFT from "./BuyNFT"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

//Address and ABI
import NFT_ABI from "../../config/chainRunnerNFTAbi.json"
import NFTAddresses from "../../config/chainRunnerNFTAddress.json"

const NftTitle = styled("h2")`
    color: #ffffff;
    background: #0d2137;
    text-transform: uppercase;
    font-size: 2rem;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
    padding: 1rem;
`

const Container = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    max-height: 600px; /* Set the maximum height for the y-axis */
    overflow-y: auto; /* Enable vertical scroll when content exceeds the height */
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-radius: 8px;

    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
    }
`

const CenteredCard = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
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

            <BuyNFT />

            <CenteredCard>
                <NftTitle>NFT Portfolio</NftTitle>
            </CenteredCard>

            <GridContainer className="grid grid-cols-2 gap-4">
                {nftURIList.map((uri, index) => (
                    <ShowNFT key={index} NFTURI={uri} />
                ))}
            </GridContainer>
        </Container>
    )
}

export default NFTPortfolio
