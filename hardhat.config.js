require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"
// If not set, it uses the hardhat account 0 private key.
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2 || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const POLYGON_SCAN_API_KEY = process.env.POLYGON_SCAN_API_KEY || ""
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.8",
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        yul: true,
                    },
                },
            },
            {
                version: "0.8.9",
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        yul: true,
                    },
                },
            },
            {
                version: "0.8.19",
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        details: {
                            yul: true,
                        },
                    },
                },
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
        },
        polygonMumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
        },
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            gasPrice: 500000,
            chainId: 43113,
            accounts: [PRIVATE_KEY],
        },
        AvalancheMainnet: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            gasPrice: 500000,
            chainId: 43114,
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: POLYGON_SCAN_API_KEY,
        },
        // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
    },
}
