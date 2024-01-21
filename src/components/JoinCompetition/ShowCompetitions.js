import { useState, useEffect } from "react"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Components
import CompetitionInformation from "./CompetitionInformation"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const ShowCompetitions = ({ showCompetitions, searchText }) => {
    const [compIdArray, setCompIdArray] = useState([])
    const { chain } = useWalletConnected()

    // Read ChainRunners for competitionId's
    const { data: competitionCount } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionId",

        onSettled(data, error) {
            if (data) {
                console.log("Settled Succesfully", data)
            } else if (error) {
                console.log("Settled with error", error)
            }
        },
    })

    // Create array of competition IDs
    useEffect(() => {
        if (competitionCount > 0) {
            // Create array of compID's
            const _compIdArray = []
            for (let i = 1; i <= competitionCount; i++) {
                _compIdArray.push(i)
            }
            setCompIdArray(_compIdArray)
        }
    }, [competitionCount])

    return (
        showCompetitions && (
            <div style={{ width: "80vw" }}>
                <h4 className="m-2" style={{ color: "white" }}>
                    Search Results:
                </h4>
                <hr style={{ color: "white" }} />
                <div style={{ display: "flex" }}>
                    {compIdArray.map((competitionId, index) => (
                        <CompetitionInformation
                            key={index}
                            competitionId={competitionId}
                            searchText={searchText}
                        />
                    ))}
                </div>
            </div>
        )
    )
}

export default ShowCompetitions
