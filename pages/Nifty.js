const logger = require('../entity/Logger.js').logger;
const NiftyId = "jbdaocneiiinmjbjlgalhcelgbejmnid";
const MetaMask = require('./MetaMask.js').MetaMask;
const buttonAccept = require('./MetaMask.js').buttonAccept;
const fieldNewPass = require('./MetaMask.js').fieldNewPass;
const fieldConfirmPass = require('./MetaMask.js').fieldConfirmPass;
const buttonCreate = require('./MetaMask.js').buttonCreate;
const buttonIveCopied = require('./MetaMask.js').buttonIveCopied;
const pass = require('./MetaMask.js').pass;

class Nifty extends MetaMask {

	constructor(driver) {
		super(driver);
		this.driver = driver;
		this.name = "Nifty  "
		this.URL = `chrome-extension://${NiftyId}//popup.html`;
		this.networks=[99,77,0, 3, 42, 4, 8545];

	}
	async activate() {
		logger.info(this.name + "activate ");
		return await this.switchToNextPage() &&
			await this.open(this.URL) &&
			await this.clickWithWait(buttonAccept) &&
			await this.clickWithWait(buttonAccept) &&
			await this.clickWithWait(buttonAccept) &&
			await this.waitUntilLocated(fieldNewPass) &&
			await this.clickWithWait(fieldNewPass) &&
			await this.fillWithWait(fieldNewPass, pass) &&
			await this.fillWithWait(fieldConfirmPass, pass) &&
			await this.clickWithWait(buttonCreate) &&
			await this.waitUntilDisplayed(buttonIveCopied) &&
			await this.clickWithWait(buttonIveCopied) &&
			await this.switchToNextPage();
	}


}

module.exports = {
	Nifty: Nifty
};