const hre = require("hardhat")

async function deployToken() {
    //deploy token contract
    const chainRunnersToken = await hre.ethers.deployContract("ChainRunnersToken")

    //update token address

    return chainRunnersToken
}

module.exports = deployToken
