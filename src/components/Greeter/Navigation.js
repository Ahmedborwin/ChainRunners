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
    position: sticky;
    top: 0;
    z-index: 1000;
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

const ChainRunnerLogo = styled.a`
    margin: 0 1rem;
`

const Tabs = styled.div`
    display: flex;
    gap: 10px;
`

const TabLink = styled(Link)`
    text-decoration: none;
    color: white;
    font-weight: bold;
    padding: 8px 12px;
    border-radius: 8px;
    transition: box-shadow 0.3s, transform 0.3s;

    &:hover {
        background-color: #ffffff;
        color: #333;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        transform: scale(1.05);
    }
`

const Navigation = () => {
    return (
        <CustomNavbar>
            <ChainRunnerLogo href="/">
                <LogoImg
                    alt="logo"
                    src={logo}
                    width="40"
                    height="40"
                    className="d-inline-block align-top mx-3"
                />
            </ChainRunnerLogo>

            <Tabs>
                <TabLink to="/create-competition">Create Comp</TabLink>
                <TabLink to="/join-competition">Join Comp</TabLink>
                <TabLink to="/nft-portfolio">NFT Portfolio</TabLink>
            </Tabs>

            <Navbar.Collapse className="mx-2 justify-content-end">
                <ConnectButton>Connect Wallet</ConnectButton>
            </Navbar.Collapse>
        </CustomNavbar>
    )
}

export default Navigation
