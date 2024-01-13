import { useState } from "react"
import Spinner from "react-bootstrap/Spinner"
import styled from "styled-components"

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

const LoadingTitle = styled("h3")`
    font-size: 24px;
    color: white;
    font-weight: bold;
`
const Loading = ({ customAction }) => {
    return (
        <div className="text-center my-5">
            <Spinner animation="grow" />

            <LoadingTitle className="my-2">{customAction}...</LoadingTitle>
        </div>
    )
}

export default Loading
