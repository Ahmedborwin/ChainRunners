import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { ethers } from "ethers"
import Swal from "sweetalert2"
import { PublicClient } from "viem"

// Images
import mapsImage from "../../assets/images/chain.jpg"

// Components
import Greeter from "../Greeter"
import ShowNFT from "./ShowNft"
import BuyNFT from "./BuyNFT"
import Loading from "../Loading"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

//Address and ABI
import NFT_ABI from "../../config/chainRunnerNFTAbi.json"
import NFTAddresses from "../../config/chainRunnerNFTAddress.json"
import providerURLs from "../../config/ProviderUrl.json"

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
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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

const NFTPortfolio = ({ isLoading }) => {
    //States
    const [nftURIList, setNftURIList] = useState([])
    const [getTokenURIList, setGetTokenURIList] = useState(false)

    //hooks
    const { chain, address } = useWalletConnected()

    //get provider
    const providerurl = chain.id in providerURLs ? providerURLs[chain.id] : null
    const provider = new ethers.providers.JsonRpcProvider(providerurl)

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
            setNftURIList(data)
        },
    })

    //event listenener - toast/pop up when NFT bought
    const listenEvents = async () => {
        const NFTContract = new ethers.Contract(NFTAddresses[chain.id], NFT_ABI, provider)
        // const isMintNFTRegistered = await NFTContract.listenerCount("nftMinted")

        NFTContract.once("nftMinted", async (athlete, NftTier) => {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "NFT Minted!",
                showConfirmButton: false,
                timer: 1500,
            })
        })
    }

    //use Effects
    useEffect(() => {
        listenEvents()
    }, [])

    return (
        <Container>
            <Greeter />

            <>
                <BuyNFT />

                <CenteredCard>
                    <NftTitle>NFT Portfolio</NftTitle>
                </CenteredCard>

                <GridContainer className="grid grid-cols-2 gap-4">
                    {nftURIList.map((uri, index) => (
                        <ShowNFT key={index} NFTURI={uri} />
                    ))}
                </GridContainer>
            </>
        </Container>
    )
}

export default NFTPortfolio
