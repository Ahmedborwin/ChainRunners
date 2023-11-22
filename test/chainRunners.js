const { AlchemyProvider, TokenBalanceType, BigNumber } = require("alchemy-sdk")
const { expect, add } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

const ether = tokens

describe("ChainRunners", () => {
    let chainrunners, deployer, athlete2
    let username = "Ahmed"
    let buyin = ether(0.0001)
    beforeEach(async () => {
        ;[deployer, athlete2] = await ethers.getSigners()

        //deploy chainrunners contract
        const chainrunnerFactory = await ethers.getContractFactory("ChainRunners")
        chainrunners = await chainrunnerFactory.deploy()
    })

    describe("Deployment", () => {
        it("smoketest", async () => {
            const compId = await chainrunners.competitionId()
            expect(compId.toString()).equal("0")
        })
        it("", async () => {})
        it("", async () => {})
    })

    describe("Create Athlete Profile", () => {
        let athleteProfile
        describe("Success", () => {
            it("expect user created with username passed", async () => {
                await chainrunners.createAthlete(username)
                athleteProfile = await chainrunners.athleteTable(deployer.address)
                expect(athleteProfile.username.toString()).equal(username)
            })
            it("emits new player created event", async () => {
                await expect(chainrunners.createAthlete(username))
                    .emit(chainrunners, "athleteProfileCreated")
                    .withArgs(deployer.address, "Ahmed")
            })
            it("sets athlete profile bool to true", async () => {
                await chainrunners.createAthlete(username)
                athleteProfile = await chainrunners.athleteTable(deployer.address)
                expect(athleteProfile.registeredAthlete).equal(true)
            })
        })

        describe("Failure", () => {
            beforeEach("create athlete", async () => {
                await chainrunners.createAthlete(username)
                athleteProfile = await chainrunners.athleteTable(deployer.address)
            })
            it("address already registered", async () => {
                await expect(chainrunners.createAthlete("Borwin")).revertedWith(
                    "Address already registered to an Athlete"
                )
            })
            it("username is already taken", async () => {
                await expect(chainrunners.connect(athlete2).createAthlete(username)).revertedWith(
                    "Username is Taken. Choose Another"
                )
            })

            it("", async () => {})
        })
    })
    describe("Create new Competition", () => {
        let newCompetition, txResponse, txReceipt

        describe("Success", () => {
            beforeEach(async () => {
                txResponse = await chainrunners.createAthlete(username)

                txResponse = await chainrunners.createCompetition(
                    "Winner Takes All",
                    buyin,
                    30,
                    7,
                    {
                        value: buyin,
                    }
                )

                newCompetition = await chainrunners.competitionTable("1")
            })
            it("Competition ID set", async () => {
                expect(await newCompetition.id.toString()).equal("1")
            })
            it("Competition Name set", async () => {
                expect(await newCompetition.name.toString()).equal("Winner Takes All")
            })
            it("Competition isLive is set to false", async () => {
                expect(await newCompetition.isLive).equal(false)
            })
            it("Competition status is set to pending", async () => {
                //expect status = enum index 0 which is pending
                expect(await newCompetition.status.toString()).equal("0")
            })
            it("Caller of function set as admin", async () => {
                expect(await newCompetition.administrator).equal(deployer.address)
            })
            it("competing athletes includes sender", async () => {
                const competingAthletes = await chainrunners.getAthleteList(1)
                // Assert that the mapping contains the added athlete address
                expect(competingAthletes).to.deep.include(deployer.address.toString()) // Change athleteAddress to the expected address
            })
            it("total staked is updated", async () => {
                const totalStaked = await newCompetition.totalStaked
                expect(totalStaked).equal(buyin)
            })
            it("Staked amount by address by Comp ID is updated", async () => {
                const stakedCompID = await chainrunners.stakedByCompByUser[deployer.address][1]
                console.log(stakedCompID)
                expect(stakedCompID).equal(buyin)
            })
            it("sets duration of Competition in seconds", async () => {
                const thirtyDaysinSeconds = 30 * 60 * 60 * 24
                expect(await newCompetition.durationDays.toString()).equal(
                    thirtyDaysinSeconds.toString()
                )
            })
            it("sets payout intervals in seconds", async () => {
                const sevenDaysinSeconds = 7 * 60 * 60 * 24
                expect(await newCompetition.payoutIntervals.toString()).equal(
                    sevenDaysinSeconds.toString()
                )
            })

            it("competition array includes msg sender", async () => {
                const competitionList = await chainrunners.competitionList(0)
                //console.log(JSON.stringify(competitionList))
                expect(competitionList["id"]).equal(1)
                expect(competitionList["totalStaked"]).equal(buyin)
            })
            it("competition event emitted", async () => {
                await expect(
                    chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                        value: buyin,
                    })
                )
                    .emit(chainrunners, "newCompetitionCreated")
                    .withArgs(2, buyin)
            })
        })

        describe("Failure", () => {
            it("reverts if competition creator is not a registered athlete", async () => {
                await expect(
                    chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                        value: buyin,
                    })
                ).revertedWith("Not a registered Athlete")
            })
            it("fails if not enough ether is sent", async () => {
                await chainrunners.createAthlete(username)
                await expect(
                    chainrunners.createCompetition("Winner Takes All", ether(0.00001), 30, 7, {
                        value: buyin,
                    })
                ).revertedWith("Incorrect Buy In Amount Sent")
            })
            it("fails if too much ether is sent", async () => {
                await chainrunners.createAthlete(username)
                await expect(
                    chainrunners.createCompetition("Winner Takes All", ether(0.00001), 30, 7, {
                        value: ether(0.01),
                    })
                ).revertedWith("Incorrect Buy In Amount Sent")
            })
        })
    })
    describe("Join existing competition", () => {
        let competition
        beforeEach(async () => {
            //create athlete profiles
            await chainrunners.createAthlete(username)

            await chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                value: buyin,
            })
        })

        describe("Success", () => {
            beforeEach("set up for successfull join of existing comp", async () => {
                //create athlete profiles
                await chainrunners.connect(athlete2).createAthlete("Bolt")
            })
            it("updates competition list with new athlete address", async () => {
                //join competition
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
                const competingAthletes = await chainrunners.getAthleteList(1)
                console.log(competingAthletes)
                // Assert that the mapping contains the added athlete address
                expect(JSON.parse(competingAthletes)).to.deep.include(athlete2.address) // Change athleteAddress to the expected address
            })
            it("updates amount staked", async () => {
                //join competition
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
                //get compeition table object
                competition = await chainrunners.competitionTable("1")
                expect(competition.totalStaked.toString()).equal(buyin.mul(2).toString())
            })
            it("emits event", async () => {
                await expect(chainrunners.connect(athlete2).joinCompetition("1", { value: buyin }))
                    .emit(chainrunners, "athleteJoinedCompetition")
                    .withArgs("1", athlete2.address, buyin)
            })
        })

        describe("Failure", () => {
            it("reverts if competition creator is not a registered athlete", async () => {
                await expect(
                    chainrunners.connect(athlete2).joinCompetition("1", {
                        value: buyin,
                    })
                ).revertedWith("Not a registered Athlete")
            })
            it("fails if not enough ether is sent", async () => {
                await chainrunners.connect(athlete2).createAthlete("Bolt")
                await expect(
                    chainrunners.joinCompetition("1", {
                        value: ether(0.00001),
                    })
                ).revertedWith("Incorrect Buy In Amount Sent")
            })
            it("fails if too much ether is sent", async () => {
                await chainrunners.connect(athlete2).createAthlete("Bolt")
                await expect(
                    chainrunners.joinCompetition("1", {
                        value: ether(0.001),
                    })
                ).revertedWith("Incorrect Buy In Amount Sent")
            })
            it("rejects if athlete already in competition", async () => {})
        })
    })
    describe("Commence Competition", () => {
        describe("Commence Competition - Success", () => {
            let competition
            beforeEach(async () => {
                //create athlete profiles
                await chainrunners.createAthlete(username)
                await chainrunners.connect(athlete2).createAthlete("bolt")
                await chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                    value: buyin,
                })
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
            })
            it("sets status to inProgress", async () => {
                await chainrunners.commenceCompetition("1")
                //get competition form
                competition = await chainrunners.competitionTable("1")
                expect(competition.status.toString()).equal("1")
            })
            it("records start time, calculates endDate and next Pay out Date", async () => {
                await chainrunners.commenceCompetition("1")
                //get competition form
                competition = await chainrunners.competitionTable("1")
                const thirtyDaysinseconds = 60 * 60 * 24 * 30
                const sevenDaysinseconds = 60 * 60 * 24 * 7

                expect(competition.endDate).equal(
                    parseInt(competition.startDate, 10) + thirtyDaysinseconds
                )
                expect(competition.nextPayoutDate).equal(
                    parseInt(competition.startDate, 10) + sevenDaysinseconds
                )
            })

            it("Competition set to live", async () => {
                await chainrunners.commenceCompetition("1")
                expect(await chainrunners.competitionIsLive(1)).equal(true)
            })
            it("emits Comp started event", async () => {
                await expect(chainrunners.commenceCompetition("1")).emit(
                    chainrunners,
                    "competitionStarted"
                )
            })
        })
        describe("Commence Competition - Failure", () => {
            let competition
            beforeEach(async () => {
                //create athlete profiles
                await chainrunners.createAthlete(username)
                await chainrunners.connect(athlete2).createAthlete("bolt")
                await chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                    value: buyin,
                })
                competition = await chainrunners.competitionTable("1")
            })
            it("reverts if less than two competitors", async () => {
                await expect(chainrunners.commenceCompetition("1")).revertedWith(
                    "Atleast two competitors required"
                )
            })
            it("reverts if caller is no the admin", async () => {
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
                await expect(chainrunners.connect(athlete2).commenceCompetition("1")).revertedWith(
                    "Only Competition Admin Can Call this function"
                )
            })
            it("reverts if comp status anything other then pending", async () => {
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
                await chainrunners.commenceCompetition("1")
                await expect(chainrunners.commenceCompetition("1")).revertedWithCustomError(
                    chainrunners,
                    "ChainRunners__CompStatusNotAsExpected"
                )
            })
        })
    })
    describe("Abort competition", () => {
        describe("Abort Competition - Success", () => {
            beforeEach(async () => {
                //create athlete profiles
                await chainrunners.createAthlete(username)
                await chainrunners.connect(athlete2).createAthlete("bolt")
                await chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                    value: buyin,
                })
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
            })
            let competition
            it("Comptition Status is updated", async () => {
                await chainrunners.abortCompetition(1)
                competition = await chainrunners.competitionTable("1")
                expect(await competition.status).equal(3)
            })
            it("staked ether is sent back to users", async () => {
                //confirm deployer and athlete2 address ether balance increases by buyin
                const deployerBalBefore = await ethers.provider.getBalance(deployer.address)
                const balanceBefore = await ethers.provider.getBalance(athlete2.address)

                const tx = await chainrunners.abortCompetition(1)
                // Wait for the transaction to be mined and get the receipt
                await tx.wait()
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash)

                // Calculate transaction cost
                const transactionCost = receipt.gasUsed.mul(receipt.effectiveGasPrice)

                //get balance after function call
                const deployerBalAfter = await ethers.provider.getBalance(deployer.address)
                const balanceAfter = await ethers.provider.getBalance(athlete2.address)

                expect(balanceBefore.add(buyin)).equal(balanceAfter.toString())
                expect(deployerBalBefore.add(buyin).sub(transactionCost)).equal(
                    deployerBalAfter.toString()
                )
            })
            it("competition isLive mapping set to false", async () => {
                expect(await chainrunners.competitionIsLive(1)).equal(false)
            })
            it("emits comp aborted event", async () => {
                await expect(chainrunners.abortCompetition(1))
                    .emit(chainrunners, "competitionAborted")
                    .withArgs(1)
            })
        })

        describe("Abort Competition - Failure", () => {
            beforeEach(async () => {
                //create athlete profiles
                await chainrunners.createAthlete(username)
                await chainrunners.connect(athlete2).createAthlete("bolt")
                await chainrunners.createCompetition("Winner Takes All", buyin, 30, 7, {
                    value: buyin,
                })
                await chainrunners.connect(athlete2).joinCompetition("1", { value: buyin })
            })
            it("revert if aborted by non admin", async () => {
                await expect(chainrunners.connect(athlete2).abortCompetition(1)).revertedWith(
                    "Only Competition Admin Can Call this function"
                )
            })
            it("reverts if aborted and Com status is not pending ", async () => {
                await chainrunners.commenceCompetition("1")
                await expect(chainrunners.abortCompetition(1)).revertedWithCustomError(
                    chainrunners,
                    "ChainRunners__CompStatusNotAsExpected"
                )
            })
            it("", async () => {})
        })
    })
    describe("", () => {
        beforeEach(async () => {})

        describe("Success", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })

        describe("Failure", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })
    })
    describe("", () => {
        beforeEach(async () => {})

        describe("Success", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })

        describe("Failure", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })
    })
    describe("", () => {
        beforeEach(async () => {})

        describe("Success", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })

        describe("Failure", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })
    })
    describe("", () => {
        beforeEach(async () => {})

        describe("Success", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })

        describe("Failure", () => {
            it("", async () => {})
            it("", async () => {})
            it("", async () => {})
        })
    })
})
