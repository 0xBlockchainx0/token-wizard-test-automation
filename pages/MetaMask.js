const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const IDMetaMask = "nkbihfbeogaeaoehlefnkodbefgpgknn";
const URL = "chrome-extension://" + IDMetaMask + "//popup.html";
const buttonSubmit = By.className("confirm btn-green");
const buttonAccept = By.xpath('//*[@id="app-content"]/div/div[4]/div/div[1]/button');
//const buttonAccept = By.xpath("//*[contains(text(),'Accept')]");
const agreement = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div/p[1]/strong");
const fieldNewPass = By.xpath("//*[@id=\"password-box\"]");
const fieldConfirmPass = By.xpath("//*[@id=\"password-box-confirm\"]");
const buttonCreate = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button");
const buttonIveCopied = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button[1]");
const popupNetwork = By.className("network-name");
const popupAccount = By.xpath("//*[@id=\"app-content\"]/div/div[1]/div/div[2]/span/div");
const fieldPrivateKey = By.xpath("//*[@id=\"private-key-box\"]");
const pass = "qwerty12345";

const buttonImport = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[4]/button");
const fieldNewRPCURL = By.id("new_rpc");
const buttonSave = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/div/div[2]/button");
const arrowBackRPCURL = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/i");
const iconChangeAccount = By.className("cursor-pointer color-orange accounts-selector");
const buttonReject = By.className("cancel btn-red");
const buttonRejectAll = By.className("cancel btn-red");
const fieldGasLimit = By.xpath("//*[@id=\"pending-tx-form\"]/div[1]/div[2]/div[2]/div[2]/div/div/input");
const buttonSend = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div[2]/button[2]");
const fieldRecipientAddress = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/section[1]/div/input");
const fieldAmount = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/section[2]/input");
const buttonNext = By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/section[2]/button");
var accountOrderNumber = 1;
var networks = [0, 3, 42, 4, 8545];

class MetaMask extends Page {

	constructor(driver) {
		super(driver);
		this.driver = driver;
		this.URL = URL;
		this.name = "Metamask  "
	}

	async clickButtonSubmitTransaction() {
		return await this.clickWithWait(buttonSubmit);
	}

	async activate() {
		logger.info(this.name + "activate ");
		return await this.switchToNextPage() &&
			await this.open(this.URL) &&
			//await this.clickWithWait(buttonAccept) &&
			//await this.clickWithWait(agreement) &&
			await this.pressKey(key.TAB, 15) &&
			await this.clickWithWait(buttonAccept) &&
			//await this.clickWithWait(agreement) &&
			await this.pressKey(key.TAB, 3) &&
			await this.clickWithWait(buttonAccept) &&
			await this.pressKey(key.TAB, 3) &&
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

	async importAccount(user) {
		logger.info(this.name + "importAccount ");
		user.accountOrderInMetamask = accountOrderNumber;
		return await  this.switchToNextPage() &&
			await  this.setNetwork(user.networkID) &&
			await  this.clickImportAccount() &&
			await  this.fillWithWait(fieldPrivateKey, user.privateKey) &&
			await  this.waitUntilDisplayed(buttonImport) &&
			await  this.clickWithWait(buttonImport) &&
			await  this.switchToNextPage();
	}

	async selectAccount(user) {
		logger.info(this.name + "selectAccount ");
		try {
			await this.switchToNextPage();
			await this.setNetwork(user.networkID);
			await super.clickWithWait(popupAccount);
			await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')[" +
				user.accountOrderInMetamask + "].click();");
			await this.switchToNextPage();
			return true;
		}
		catch (err) {
			return false;
		}
	}

	async clickImportAccount() {
		logger.info(this.name + "clickImportAccount ");
		try {
			await super.clickWithWait(popupAccount);
			await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["
				+ (accountOrderNumber + 1) + "].click();");
			accountOrderNumber++;
			return true;
		}
		catch (err) {
			return false;
		}
	}

	async signTransaction(refreshCount) {
		logger.info(this.name + "signTransaction ");
		await this.switchToNextPage();
		let counter = 5;
		if (refreshCount !== undefined) counter = refreshCount;
		do {
			await this.refresh();
			await super.waitUntilLocated(iconChangeAccount);
			if (await this.isElementDisplayed(buttonSubmit)) {

				return await this.fillGasLimit(8900000)
					&& await this.clickButtonSubmitTransaction()
					&& await  this.switchToNextPage();
			}
			await this.driver.sleep(3000);
		} while (counter-- >= 0);

		await this.switchToNextPage();
		return false;
	}

	async setNetwork(provider) {
		logger.info(this.name + "setNetwork ");
		try {
			await super.clickWithWait(popupNetwork);
			let orderNumber = networks.indexOf(provider);
			let script = "document.getElementsByClassName('dropdown-menu-item')[" + orderNumber + "].click();"
			if (orderNumber < 0) await this.addNetwork(provider);
			else await this.driver.executeScript(script);
			return true;
		}
		catch (err) {
			return false;
		}
	}

	async addNetwork(provider) {
		logger.info(this.name + "addNetwork ");
		let url;
		switch (provider) {
			case 77: {
				url = "https://sokol.poa.network";
				networks.push(77);
				break;
			}
			case 99: {
				url = "https://core.poa.network";
				networks.push(99);
				break;
			}
			default: {
				url = "https://sokol.poa.network";
			}
		}
		await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')[" +
			(networks.length - 1) + "].click();");
		return await super.fillWithWait(fieldNewRPCURL, url) &&
			await super.clickWithWait(buttonSave) &&
			await super.clickWithWait(arrowBackRPCURL);
	}

	async clickButtonReject() {
		logger.info(this.name + "clickButtonReject ");
		return await super.clickWithWait(buttonReject);
	}

	async rejectTransaction(refreshCount) {
		logger.info(this.name + " rejectTransaction ");
		let counter = 5;
		if (refreshCount !== undefined) counter = refreshCount;
		await this.switchToNextPage();
		do {
			await this.refresh();
			await super.waitUntilLocated(iconChangeAccount);
			if (await this.isElementDisplayed(buttonReject)) {
				return await this.clickButtonReject()
					&& await this.switchToNextPage();
			}
			await this.driver.sleep(1000);
		} while (counter-- >= 0);
		await this.switchToNextPage();
		return false;
	}

	async clickButtonSend() {
		logger.info(this.name + " clickButtonSend ");
		return await this.clickWithWait(buttonSend);
	}

	async fillGasLimit(value) {
		logger.info(this.name + " fillGasLimit ");
		return await this.clearFieldFromStart(fieldGasLimit)
			&& await this.fillWithWait(fieldGasLimit, value);

	}

	async fillRecipientAddress(address) {
		logger.info(this.name + " fillRecipientAddress ");
		return await this.fillWithWait(fieldRecipientAddress, address);
	}

	async fillAmount(amount) {
		logger.info(this.name + " fillAmount ");
		return await this.fillWithWait(fieldAmount, amount);
	}

	async clickButtonNext() {
		logger.info(this.name + " clickButtonNext ");
		return await this.clickWithWait(buttonNext);
	}

	async testMetamask() {
		logger.info(this.name + " testMetamask ");
		await this.switchToNextPage();
		await this.clickButtonSend();
		await this.fillRecipientAddress("0x56B2e3C3cFf7f3921Dc2e0F8B8e20d1eEc29216b");
		await this.fillAmount("0.01");
		await this.clickButtonNext();

		await this.clearFieldFromStart(fieldGasLimit);
		await this.fillGasLimit(50000);
		throw("Stop");

	}

}

module.exports = {
	MetaMask: MetaMask
};
