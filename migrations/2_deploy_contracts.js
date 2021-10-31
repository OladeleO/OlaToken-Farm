// This file put new smart contracts in the blockchain
const OlaToken = artifacts.require('OlaToken');
const DaiToken = artifacts.require('DaiToken');
const TokenFarm = artifacts.require('TokenFarm');

module.exports = async function(deployer, network, accounts) {
    // Deploy Dai Token
    await deployer.deploy(DaiToken)
    const daiToken = await DaiToken.deployed()
    
    // Deploy Ola Token
    await deployer.deploy(OlaToken)
    const olaToken = await OlaToken.deployed()

    // Deploy TokenFarm
    await deployer.deploy(TokenFarm, olaToken.address, daiToken.address)
    const tokenFarm = await TokenFarm.deployed()

    // Transfer all tokens to TokenFarm (1 million)
    await olaToken.transfer(tokenFarm.address, '1000000000000000000000000')

    //Transfer 100 Mock DAI tokens to investor
    await daiToken.transfer(accounts[1], '100000000000000000000')
};