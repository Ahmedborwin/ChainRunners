import { useEffect, useState } from "react"
import { Card, CardBody } from "react-bootstrap"
import styled from "styled-components"

const CardFooter = styled("CardBody")`
    display: flex;
    align-items: center;
    justify-content: center;
`

const ShowNFT = ({ NFTURI }) => {
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")

    const fetchNFT = async (Uri) => {
        // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
        const requestURL = Uri.replace("ipfs://", "https://cf-ipfs.com/ipfs/")
        try {
            const response = await fetch(requestURL)
            const tokenURIResponse = await response.json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://cf-ipfs.com/ipfs/")

            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        } catch (error) {
            // Handle error if fetch or JSON parsing fails
            console.error("Error fetching or parsing data:", error)
        }
    }

    //use fetch api to get URI Object
    useEffect(() => {
        if (NFTURI) {
            fetchNFT(NFTURI)
        }
    }, [NFTURI])

    return (
        <Card className="card" style={{ width: "19rem" }}>
            <img loader={() => imageURI} src={imageURI} height="300" width="302" alt="NFT Token" />
            <CardFooter>
                <div>{tokenName}</div>
            </CardFooter>
        </Card>
    )
}

export default ShowNFT
