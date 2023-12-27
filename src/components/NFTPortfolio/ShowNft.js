import { useEffect, useState } from "react"
import { Card } from "react-bootstrap"

const ShowNFT = ({ NFTURI }) => {
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")

    const fetchNFT = async (Uri) => {
        console.log(Uri)
        // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
        const requestURL = Uri.replace("ipfs://", "http://gateway.pinata.cloud/")
        try {
            const response = await fetch(requestURL)
            const tokenURIResponse = await response.json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "http://gateway.pinata.cloud/")

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
            console.log("NFT URI", NFTURI)
            fetchNFT(NFTURI)
        }
    }, [NFTURI])

    return (
        <div>
            {imageURI ? (
                <div className="px-2 py-2 flex flex-col items-end gap-2 ">
                    <Card description={tokenDescription} cursorType="pointer">
                        <div>
                            {/* <div>
                                {`You own: `}
                                <span className="font-bold underline">{tokentally}</span>
                                {` ${tokenName}'s`}
                            </div> */}
                            {/* <div className="italic text-sm">Owned by {formattedSellerAddress}</div> */}
                            <img
                                loader={() => imageURI}
                                src={imageURI}
                                height="200"
                                width="200"
                                alt="NFT Token"
                            />
                        </div>
                    </Card>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}

export default ShowNFT
