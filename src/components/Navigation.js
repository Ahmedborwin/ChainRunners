import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/images/logo.png';
import styled from 'styled-components';

// Create styled components with updated styles
const CustomNavbar = styled(Navbar)`
  background-color: #fc4c02; /* Orange background color */
`;

const LogoImg = styled.img`
  transition: transform 0.3s ease-in-out;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const BrandText = styled(Navbar.Brand)`
  font-family: 'YourCustomFont', sans-serif;
  color: #ffffff; /* White text color */
`;

const UppercaseAccountText = styled(Navbar.Brand)`
  text-transform: uppercase;
  color: #ffffff;
  margin-right: 2%;
`;

const Navigation = ({ account }) => {
  return (
    <CustomNavbar>
      <LogoImg
        alt="logo"
        src={logo}
        width="80"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <BrandText href="#">Strava</BrandText>
      <Navbar.Collapse className="justify-content-end">
        <UppercaseAccountText href="#">
          {account}
        </UppercaseAccountText>
      </Navbar.Collapse>
    </CustomNavbar>
  );
}

export default Navigation;
