

const Web3 = require('web3');
const fs = require('fs');
const deployContract = require('./DeployContract.js');

async function deployRegistry(address) {
console.log("Deploy Registry for address "+ address);
	const web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

	const registryPath = './contracts/Registry_flat';

	const registryAbi = await JSON.parse(fs.readFileSync(`${registryPath}.abi`).toString());
	let registryBin = await fs.readFileSync(`${registryPath}.bin`).toString();

	if (registryBin.slice(0, 2) !== '0x' && registryBin.slice(0, 2) !== '0X') {
		registryBin = '0x' + registryBin;
	}
//console.log(registryBin);

	await web3.eth.getAccounts()
		.then((accounts) => {
			return deployContract(web3, registryAbi, registryBin,accounts[0])
		});
}
module.exports = deployRegistry;
//deployContract(web3, registryAbi, registryBin, web3.eth.accounts[0]);