// Components
import { Button } from "react-bootstrap";

// Hooks
import { useContractWrite } from "wagmi"

// Styles
import styled from "styled-components";

const CreateButton = styled(Button)`
    background-color: #18729c;
    border-color: #0d6efd;

    &:hover {
        color: #38ff7f;
    }
`

const CreateCompetitionButton = ({ config }) => {
    // Write contract
    // Use the useContractWrite hook with the config from usePrepareContractWrite
    const { write } = useContractWrite(config);

    return (
        <CreateButton disabled={!write} onClick={() => write()}>
            Create Competition
        </CreateButton>
    )
}

export default CreateCompetitionButton;