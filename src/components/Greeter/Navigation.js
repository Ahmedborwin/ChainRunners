import React from "react"
import { Link } from "react-router-dom"

// Components
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Navbar from "react-bootstrap/Navbar"

// Images
import logo from "../../assets/images/image.png"

// Styles
import styled from "styled-components"

const CustomNavbar = styled(Navbar)`
    background: #0d2137;
`

const LogoImg = styled.img`
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: scale(1.5);
    }
`

const BrandText = styled(Link)`
    font-family: sans-serif;
    font-weight: bold;
    color: #b7ff00;
    text-decoration: none;

    &:hover {
        color: #38ff7f;
    }
`

const Navigation = () => {
    return (
        <CustomNavbar>
            <LogoImg
                alt="logo"
                src={logo}
                width="40"
                height="40"
                className="d-inline-block align-top mx-3"
            />
            <BrandText to="/">CHAIN-RUNNERS</BrandText>

            <Navbar.Collapse className="mx-2 justify-content-end">
                <ConnectButton>Connect Wallet</ConnectButton>
            </Navbar.Collapse>
        </CustomNavbar>
    )
}

export default Navigation
