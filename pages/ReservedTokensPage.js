const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;


const page=require('./Page.js');
const Page=page.Page;
const  by = require('selenium-webdriver/lib/by');
const By=by.By;
const ReservedTokensContainer=By.className("reserved-tokens-item-container-inner");
const buttonAdd=By.className("button button_fill button_fill_plus");
const itemsRemove=By.className("item-remove");
const buttonClearAll=By.className("fa fa-trash");
const buttonYesAlert=By.className("swal2-confirm swal2-styled");
const buttonNoAlert=By.className("swal2-cancel swal2-styled");

class ReservedTokensPage extends Page{

    constructor(driver) {
        super(driver);
        this.URL;
        this.fieldAddress;
        this.fieldValue;
        this.name="Reserved tokens :"
        this.itemsRemove=[];

    }


    async initItemsRemove(){
	    var arr = await super.findWithWait(itemsRemove);
	    for (var i=0;i<arr.length;i++)
        {
            this.itemsRemove[i]=arr[i];
        }

	    return arr;
    }
	async initReservedTokensContainer(){

		var arr = await super.findWithWait(ReservedTokensContainer);
		return arr;

	}

	async init(){

        var locator = By.className("input");
        var arr = await super.findWithWait(locator);
        this.fieldAddress = arr[3];
        this.fieldValue = arr[4];
        locator=By.className("radio-inline");
        var arr = await super.findWithWait(locator);
        this.checkboxTokens=arr[0];
        this.checkboxPercentage=arr[1];
    }

    async amountAddedReservedTokens(){
		try {
			let arr = await this.initReservedTokensContainer()
			logger.info("Reserved tokens added=" + arr.length);
			return arr.length;
		}
		catch(err){
			return 0;
		}

	}




	async fillReservedTokens(reservedTokens){
          logger.info(this.name+": ");
          await this.fillAddress(reservedTokens.address);
          await this.setDimension(reservedTokens.dimension);
          await this.fillValue(reservedTokens.value);


    }


    async setDimension(dimension){
        logger.info(this.name+"field Dimension :");
        await this.init();
        if (dimension==='percentage') await this.clickCheckboxPercentage();
        else await this.clickCheckboxTokens();
    }

    async fillAddress(address){

        logger.info(this.name+"field Address :");
        if (address=="") return;
        else {
            logger.info("Waallet address"+address);
            await this.init();
            await super.fillField(this.fieldAddress, address);
        }

    }
    async fillValue(value){
        logger.info(this.name+"field Value :");
        if (value==undefined) return;
        await this.init();
        await super.fillField(this.fieldValue,value);
    }


    async  clickCheckboxPercentage(){
        logger.info(this.name+"checkbox Percentage :");
        await this.init();
        await super.clickTo(this.checkboxPercentage);


    }
    async clickCheckboxTokens() {
        logger.info(this.name+"checkbox Tokens :");
        await this.init();
        await super.clickTo(this.checkboxTokens);
    }
    async clickButtonAddReservedTokens(){
        logger.info(this.name+"button AddReservedTokens :");
        await super.clickWithWait(buttonAdd);
    }
    async removeReservedTokens(number)
    {
        await this.initItemsRemove();
        await super.clickWithWait(this.itemsRemove[number]);

    }

    async clickButtonClearAll(){
        await super.clickWithWait(buttonClearAll);
    }
    async isPresentButtonClearAll(){
        return await super.isElementPresent(buttonClearAll);
    }
 async bulkDelete(){

        await this.clickButtonClearAll();

 }

    async isPresentButtonYesAlert(){
		return await super.isElementPresent(buttonYesAlert);
	}
	async isPresentButtonNoAlert(){
		return await super.isElementPresent(buttonNoAlert);
	}

	async clickButtonYesAlert(){
        await super.clickWithWait(buttonYesAlert);

    }
	async clickButtonNoAlert(){
		await super.clickWithWait(buttonNoAlert);

	}



}
module.exports.ReservedTokensPage=ReservedTokensPage;