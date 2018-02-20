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


    fillReservedTokens(reservedTokens){

          this.fillAddress(reservedTokens.address);
          this.setDimension(reservedTokens.dimension);
          this.fillValue(reservedTokens.value);


    }


    async setDimension(dimension){
        await this.init();
        if (dimension==='percentage') this.clickCheckboxPercentage();
        else this.clickCheckboxTokens();
    }


    async fillAddress(address){
        // console.log(address);
        if (address==undefined) return;
        else {
            console.log(address);
            await this.init();
            super.fillField(this.fieldAddress, address);
        }

    }
    async fillValue(value){
        if (value==undefined) return;
        await this.init();
        super.fillField(this.fieldValue,value);
    }


    async  clickCheckboxPercentage(){
        await this.init();
        super.clickTo(this.checkboxPercentage);


    }
    async clickCheckboxTokens() {
        await this.init();
        super.clickTo(this.checkboxTokens);
    }
    clickButtonAddReservedTokens(){
        super.clickWithWait(buttonAdd);
    }



}
module.exports.ReservedTokensPage=ReservedTokensPage;