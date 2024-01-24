import { useState } from "react"
import Spinner from "react-bootstrap/Spinner"
import styled from "styled-components"

// Images
import sillouteImage from "../assets/Silouhette-Watching.webp"

const LoadingTitle = styled("h3")`
    font-size: 24px;
    color: white;
    font-weight: bold;
`

const Container = styled("div")`
    position: relative;
    height: 100%;
    width: 500px;
`

// const Image = styled("div")`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 5px 0;
//     height: 50%;
//     background-image: url(${sillouteImage}); /* Use LoginImage */
//     background-size: cover; /* Cover the entire div */
//     background-position: right center;
//     border-radius: 20px 0 0 20px; /* Adjusted rounded corners */
//     box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
// `
const Loading = ({ customAction }) => {
    return (
        <Container>
            <div className="text-center">
                <Spinner animation="grow" />
                <LoadingTitle className="my-2">{customAction}...</LoadingTitle>
            </div>
        </Container>
    )
}

export default Loading
