import styled from "styled-components"
import React, { useState } from "react"
import { formatEther, parseEther } from "viem"
import Swal from "sweetalert2"

import { useWaitForTransaction } from "wagmi"

//Components
import NFTIndex from "./Index"

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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.8);
`

const CardChild = styled.div`
    margin: 10px 0;
    padding: 20px; /* Add padding for content inside the card */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 1);
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
    background-color: rgba(255, 255, 255, 1);
    text-decoration: none;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
        transform: scale(1.2);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
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
    const [isLoading, setIsLoading] = useState(false)
    const [tokenBalance, setTokenBalance] = useState(0)
    const [approveHash, setApproveHash] = useState(null)
    const { chain, address } = useWalletConnected()

    // Read competition table
    const { data: tokenBalanceData } = useContractRead({
        address: ChainRunnersTokenAddresses[chain.id],
        abi: ChainRunnersToken_ABI,
        functionName: "balanceOf",
        args: [address],
        onError(error) {
            console.log("Error reading token balance", error)
        },
        onSuccess(data) {
            if (tokenBalanceData > 0) {
                console.log("tokenBalance", formatEther(tokenBalanceData))
                setTokenBalance(formatEther(tokenBalanceData))
            }
        },
    })

    //write to Token contract and NFT contract
    const { config: prepareApproveTransfer } = usePrepareContractWrite({
        address: ChainRunnersTokenAddresses[chain.id],
        abi: ChainRunnersToken_ABI,
        functionName: "approve",
        args: [ChainRunnersAddresses[chain.id], parseEther("10")],
        onSettled(data, error) {
            if (data) {
                console.log("PrepareApprove", data)
                setIsLoading(false)
            } else if (error) {
                console.log("PrepareApprove", error)
                setIsLoading(false)
            }
        },
    })
    // approve
    const { writeAsync: approveChainRunner } = useContractWrite(prepareApproveTransfer)

    // Mint NFT
    const { data: NFTMintResponse, writeAsync: mintNFTWrite } = useContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "mintNFT",
        onSettled(data, error) {
            if (error) {
                console.log("Mint NFT Error", error)
                Swal.fire({
                    title: "NFT MINT ERROR",
                    text: `ERROR ${error}`,
                    icon: "error",
                })
            }
        },
    })

    //handle buy
    const handleBuyNFT = async () => {
        // Execute the approve transaction and get the transaction hash
        const txResponse = await approveChainRunner()
        setApproveHash(txResponse.hash)

        //set Loading screen
        setIsLoading(true)
    }

    useWaitForTransaction({
        hash: approveHash,
        confirmations: 1,
        onSettled: (data, error) => {
            if (data) {
                // Handle successful transaction confirmation
                setIsLoading(false)
                // Once the approval is confirmed, proceed to mint NFT
                mintNFTWrite()
            } else if (error) {
                console.error("Transaction failed", error)
                Swal.fire({
                    title: "Transaction Error",
                    text: "There was an error processing your transaction",
                    icon: "error",
                })
            }
        },
    })

    //TODO
    //i want to get the hash of the mint tx and display to nft minter -
    //maybe url to take them to polygonscan?

    return (
        <>
            {!isLoading ? (
                <CenteredComponent>
                    <FlexContainer style={{ width: "35vw" }}>
                        <CardChild>
                            Balance is: <span>{tokenBalance}</span> CRT
                        </CardChild>

                        <CardChild>
                            <span>10 CRT </span> Per Mint
                        </CardChild>

                        <StyledButton style={{ width: "20vw" }} onClick={() => handleBuyNFT()}>
                            MINT NFT
                        </StyledButton>
                    </FlexContainer>
                </CenteredComponent>
            ) : (
                <NFTIndex isLoading={isLoading} />
            )}
        </>
    )
}

export default BuyNFT
