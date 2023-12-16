const { expect, add } = require("chai")
const { ethers, network } = require("hardhat")
const deployNFTContractScript = require("../scripts/Deploy/deployNFT")

let chainRunnersNFT, vrfCoordinatorV2Mock
//call deploy script from here?
const deployNFTContract = async () => {
    ;[chainRunnersNFT, vrfCoordinatorV2Mock] = await deployNFTContractScript()
}

describe("ChainRunnersNFT", () => {
    //variables
    let deployer
    beforeEach(async () => {
        await deployNFTContract()
        ;[deployer] = await ethers.getSigners()

        //set tokenURI
    })

    describe("Deployment", () => {
        it("deploys smart contract", async () => {
            console.log("ChainrunnersNFT address: ", chainRunnersNFT.address)
            expect(chainRunnersNFT.address).not.equal(undefined)
        })
        it("deploys mock vrf coordinator contract", async () => {
            console.log("VRF Co-ordinator address", vrfCoordinatorV2Mock.address)
            expect(vrfCoordinatorV2Mock.address).not.equal(undefined)
        })
        it("get token URI array", async () => {
            const tokenURIArray = await chainRunnersNFT.getTokenURIArray()
            expect(tokenURIArray).not.equal(undefined)
        })
        // it("", async () => {})
        // it("", async () => {})
        // it("", async () => {})
    })
    describe("request and fullfill random numbers", () => {
        it("request random number", async () => {
            const txResponse = await chainRunnersNFT.requestRandomNumber(deployer.address)
            const txReceipt = await txResponse.wait(1)
        })
        it("call fullfill random words from mockVRF", async () => {
            await chainRunnersNFT.requestRandomNumber(deployer.address)
            await vrfCoordinatorV2Mock.fulfillRandomWords(1, chainRunnersNFT.address)
            const tokenURIArray = await chainRunnersNFT.getTokenURIByAthlete(deployer.address)
            console.log(tokenURIArray)
        })
        it("", async () => {})
        it("", async () => {})
        it("", async () => {})
    })
})
