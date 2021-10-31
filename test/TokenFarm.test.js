// This is the test file

const { assert } = require('chai');
const _deploy_contracts = require('../migrations/2_deploy_contracts');

const OlaToken = artifacts.require('OlaToken');
const DaiToken = artifacts.require('DaiToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

//owner deploy the smart contract, investor deposit to the "bank"
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, olaToken, tokenFarm

    before(async () => {
        //Load Contracts
        daiToken = await DaiToken.new()
        olaToken = await OlaToken.new()
        tokenFarm = await TokenFarm.new(olaToken.address, daiToken.address)

        // Transfer all Ola tokens to form 1 million
        await olaToken.transfer(tokenFarm.address, tokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    })



    //Write tests here...
    describe('Mock Dai deployment', async() => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Ola Token deployment', async() => {
        it('has a name', async () => {
            const name = await olaToken.name()
            assert.equal(name, 'Ola Token')
        })
    })

    describe('Token Farm deployment', async() => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Ola Token Farm')
        })
    

        it('contract has tokens', async () => {
            let balance = await olaToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })

    })

    describe('Farming tokens', async () => {

        it('rewards investors for staking Dai tokens', async () => {
           let result
           
           // Check investor balance before staking
           result = await daiToken.balanceOf(investor)
           assert.equal(result.toString(), tokens('100'), 'investor DAI wallet balance correct before staking')

           // Stake DAI tokens
           await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
           await tokenFarm.stakeTokens(tokens('100'), { from: investor })

           result = await daiToken.balanceOf(investor)
           assert.equal(result.toString(), tokens('0'), 'investor DAI wallet balance correct after staking')

           result = await daiToken.balanceOf(tokenFarm.address)
           assert.equal(result.toString(), tokens('100'), 'Toekn Farm DAI wallet balance correct after staking')

           result = await tokenFarm.stakingBalance(investor)
           assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

           result = await tokenFarm.isStaking(investor)
           assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await tokenFarm.issueTokens({ from: owner })

            // Chack balances after issuance
            result = await olaToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Ola Token wallet balance correct after issuance')

            //Ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor}).should.be.rejected

            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DAI wallet balance correct after staking')
            

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')





        })
    })

})