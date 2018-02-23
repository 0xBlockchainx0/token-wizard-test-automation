const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;


const page=require('./Page.js');
const Page=page.Page;
const  by = require('selenium-webdriver/lib/by');
const By=by.By;
//const fieldAddress=By.xpath("//*[@id=\"root\"]/div/section/div[2]/div[4]/div/div[1]/div[1]/input");
//const checkboxTokens=By.xpath("//*[@id=\"root\"]/div/section/div[2]/div[4]/div/div[1]/div[2]/div/label[1]/span");
//const checkboxPercentage=By.xpath("//*[@id=\"root\"]/div/section/div[2]/div[4]/div/div[1]/div[2]/div/label[2]/span");
//const fieldValue=By.xpath("//*[@id=\"root\"]/div/section/div[2]/div[4]/div/div[1]/div[3]/input");
//const buttonAdd=By.xpath("//*[@id=\"root\"]/div/section/div[2]/div[4]/div/div[2]/div");
                            //*[@id="root"]/div/section/div[2]/div[4]/div[1]/div[2]/div
                               //*[@id="root"]/div/section/div[2]/div[4]/div/div[2]/div
                            //*[@id="root"]/div/section/div[2]/div[4]/div[1]/div[2]/div
const buttonAdd=By.className("button button_fill button_fill_plus");


class ReservedTokensPage extends Page{

    constructor(driver) {
        super(driver);
        this.URL;
        this.fieldAddress;
        this.fieldValue;
        this.name="Reserved tokens :"
        //this.checkboxTokens;
      //  this.checkboxPercentage;

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
        // console.log(address);
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



}
module.exports.ReservedTokensPage=ReservedTokensPage;