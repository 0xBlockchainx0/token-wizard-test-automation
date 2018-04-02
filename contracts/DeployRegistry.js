

const Logger= require('../entity/Logger.js');
const logger=Logger.logger;

const Web3 = require('web3');
const fs = require('fs');
const deployContract = require('./DeployContract.js');

deployRegistry();

async function deployRegistry() {
//logger.info("Deploy Registry for address "+ address);
	const web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

	const registryPath = './contracts/Registry_flat';

	const registryAbi = await JSON.parse(fs.readFileSync(`${registryPath}.abi`).toString());
	let registryBin = await fs.readFileSync(`${registryPath}.bin`).toString();

	if (registryBin.slice(0, 2) !== '0x' && registryBin.slice(0, 2) !== '0X') {
		registryBin = '0x' + registryBin;
	}

	var contract=await web3.eth.getAccounts()
		.then((accounts) => {
			return deployContract(web3, registryAbi, registryBin,accounts[0])
		});

	var networkID=await web3.eth.net.getId();
	var registryAddress=contract._address;


	if (await !fs.existsSync("./.env")) await fs.writeFileSync("./.env");
	let envContent = `REACT_APP_REGISTRY_ADDRESS='{"${networkID}":"${registryAddress}"}'`;
	await fs.writeFileSync("./.env", envContent);

	logger.info("Registry deployed");
	logger.info("Ganache Chain ID: "+networkID);
	logger.info("Contract address: "+registryAddress);
	logger.info("Data saved to file  ./token-wizard-test-automation/.env");




}
module.exports = deployRegistry;

