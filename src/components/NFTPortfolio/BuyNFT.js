import { Button, Card } from "react-bootstrap"
import styled from "styled-components"
import React, { useState, useEffect } from "react"
import { formatEther, parseEther } from "viem"
import { ethers } from "ethers"

//NFT Contract
import ChainRunnersNFT_ABI from "../../config/chainRunnerNFTAbi.json"
import ChainRunnersNFTAddresses from "../../config/chainRunnerNFTAddress.json"
//TOKEN Contract
import ChainRunnersToken_ABI from "../../config/chainRunnerTokenAbi.json"
import ChainRunnersTokenAddresses from "../../config/chainRunnerTokenAddress.json"
//Chainrunner Contract
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const CenteredComponent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px; /* Add border-radius to the card */
    background-color: #ffffff;
`

const CardChild = styled.div`
    margin: 10px 0;
    padding: 20px; /* Add padding for content inside the card */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add shadow to the children */
    border-radius: 4px; /* Add border-radius to the children */
    span {
        text-decoration: underline;
        font-weight: bold;
    }
`

const StyledButton = styled.a`
    display: inline-block;
    text-align: center;
    margin: 10px;
    padding: 8px 16px; /* Adjust the padding as needed */
    border: 1px solid currentColor;
    border-radius: 0.25rem; /* Match the border-radius value */
    font-size: 1rem; /* Equivalent to text-sm in Tailwind */
    font-weight: 500; /* Equivalent to font-medium in Tailwind */
    color: #4f46e5; /* Equivalent to text-indigo-600 in Tailwind */
    text-decoration: none;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    &:focus {
        outline: none;
        ring: 2px solid #4f46e5;
    }

    &:active {
        color: #3c366b;
    }
`

const BuyNFT = () => {
    //hooks
    const [approveTransferReady, setApproveTransferReady] = useState(false)
    const [mintNFTReady, setMintNFTReady] = useState(false)
    const [mintNFTWriteReady, setMintNFTWriteReady] = useState(false)

    const { chain, wallet, address } = useWalletConnected()

    // Read competition table
    const { data: tokenBalance } = useContractRead({
        address: ChainRunnersTokenAddresses[chain.id],
        abi: ChainRunnersToken_ABI,
        functionName: "balanceOf",
        args: [address],
        onError(error) {
            window.alert(error)
        },
        onSuccess(data) {
            console.log("tokenBalance", formatEther(tokenBalance))
        },
    })

    //write to Token contract and NFT contract
    const { config: prepareApproveTransfer } = usePrepareContractWrite({
        address: ChainRunnersTokenAddresses[chain.id],
        abi: ChainRunnersToken_ABI,
        functionName: "approve",
        args: [ChainRunnersAddresses[chain.id], parseEther("10")],
        enabled: approveTransferReady,
        onError(error) {
            console.log(error)
            setApproveTransferReady(false) // Reset the state after the operation
        },
        onSuccess(data) {
            console.log("PrepareApprove", data)
            setApproveTransferReady(false) // Reset the state after the operation
        },
    })
    // approve
    const { write: approveChainRunner, isSuccess: approveSuccesfull } =
        useContractWrite(prepareApproveTransfer)

    //write to Token contract and NFT contract
    const { config: mintNFTPrepare } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "mintNFT",
        enabled: mintNFTReady,
        onError(error) {
            console.log(error)
            setMintNFTReady(false) // Reset the state after the operation
        },
        onSuccess(data) {
            console.log("Prepare Mint NFT Ready", data)
            setMintNFTReady(false) // Reset the state after the operation
            setMintNFTWriteReady(true)
        },
    })
    // approve
    const { write: mintNFTWrite, isSuccess: MintNFTSuccesfull } = useContractWrite(mintNFTPrepare)

    //handle buy
    const handleBuyNFT = async () => {
        //approve token transfer
        approveChainRunner()
    }

    //MODAL when button clicked?
    //event listenener - toast/pop up when NFT bought

    useEffect(() => {
        setApproveTransferReady(true)
    }, [])

    //call Chainrunner to mint NFT
    useEffect(() => {
        if (approveSuccesfull) {
            // prepare NFT Mint contract call
            setMintNFTReady(true)
        }
    }, [approveSuccesfull])

    //call Chainrunner to mint NFT
    useEffect(() => {
        if (mintNFTWriteReady) {
            // call Chainrunners contract to Mint NFT
            mintNFTWrite()
        }
    }, [mintNFTWriteReady])

    return (
        <CenteredComponent>
            <FlexContainer style={{ width: "35vw" }}>
                <CardChild>
                    Balance is: <span>{formatEther(tokenBalance)}</span> CRT
                </CardChild>

                <CardChild>
                    <span>10 CRT </span> Per Mint
                </CardChild>

                <StyledButton style={{ width: "20vw" }} onClick={() => handleBuyNFT()}>
                    MINT NFT
                </StyledButton>
            </FlexContainer>
        </CenteredComponent>
    )
}

export default BuyNFT
