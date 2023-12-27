import React, { useEffect, useRef } from "react"

// Components
import Navigation from "./Navigation"

// Styles
import styled, { keyframes } from "styled-components"

const colorRun = keyframes`
    0% {
        color: #fdfb31;
    }
    25% {
        color: #b7ff00;
    }
    50% {
        color: #38ff7f;
    }
    75% {
        color: #b7ff00;
    }
    100% {
        color: #fdfb31;
    }
`

const StyledGreeter = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
`

const Brand = styled.p`
    color: #fff;
    overflow: hidden;
    position: relative;

    &.run-animation {
        animation: ${colorRun} 5s linear infinite;
    }
`

const LeftVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #0d2137;
    left: 0;
    top: 0;
`

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #19ddd3;
    right: 0;
    top: 0;
`

const Greeter = () => {
    const greeterRef = useRef(null)

    useEffect(() => {
        const interval = setInterval(() => {
            runEffect()
        }, 10000) // Run the effect every 10 seconds

        // Clean up the interval when the component is unmounted
        return () => clearInterval(interval)
    }, [])

    const runEffect = () => {
        // Trigger the running effect
        if (greeterRef.current) {
            greeterRef.current.classList.remove("run-animation")
            void greeterRef.current.offsetWidth // Trigger reflow
            greeterRef.current.classList.add("run-animation")
        }
    }

    return (
        <div className="mb-4 text-center">
            <Navigation />

            <LeftVerticalLine />
            <RightVerticalLine />

            <StyledGreeter>
                Welcome to
                <Brand className="run-animation" ref={greeterRef}>
                    &nbsp; ChainRunners &nbsp;
                </Brand>
            </StyledGreeter>
        </div>
    )
}

export default Greeter
