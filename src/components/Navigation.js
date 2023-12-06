import React from 'react';
import { Link } from 'react-router-dom';

// Components
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Navbar from 'react-bootstrap/Navbar';
import styled from 'styled-components';

// Images
import logo from '../assets/images/image.png';

const CustomNavbar = styled(Navbar)`
  background: #0d2137;
`;

const LogoImg = styled.img`
  transition: transform 0.3s ease-in-out;
  
  &:hover {
    transform: scale(1.5);
  }
`;

const BrandText = styled(Link)`
  font-family: sans-serif;
  font-weight: bold;
  color: #b7ff00;
  text-decoration: none;

  &:hover {
    color: #38ff7f;
  }
`;

const UppercaseAccountText = styled(Navbar.Brand)`
  text-transform: uppercase;
  font-family: sans-serif;
  font-weight: bold;
  color: #b7ff00;
  margin-right: 2%;

  &:hover {
    color: #38ff7f;
  }
`;

const Navigation = ({ account }) => {
  return (
    <CustomNavbar>
      <LogoImg
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <BrandText to="/" >
        CHAIN-RUNNERS
      </BrandText>

      <Navbar.Collapse className="justify-content-end">
        {/* {account ? (
          <UppercaseAccountText href="/user-profile">
            {account}
          </UppercaseAccountText>
        ) : (
          <ConnectButton>
            Connect Wallet
          </ConnectButton>
        )} */}
        <ConnectButton>
            Connect Wallet
          </ConnectButton>
      </Navbar.Collapse>
    </CustomNavbar>
  );
}

export default Navigation;
