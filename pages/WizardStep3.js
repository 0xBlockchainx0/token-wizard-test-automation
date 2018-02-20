
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const adj="div[1]/";
//const adj="";
const fieldWalletAddress=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[1]/input");
const fieldMinCap=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[1]/input");
const boxGasPriceSafe=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[1]/label/span");
const boxGasPriceNormal=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[2]/label/span");
const boxGasPriceFast=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[3]/label/span");
const boxGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[4]/label/span");
const fieldGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/input");
const buttonContinue=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[5]/div/a");
const buttonAddTier=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[5]/div/div");
const boxWhitelistingYes=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[1]/span");
const boxWhitelistingNo=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[2]/span");

class WizardStep3 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.tier;

    }

    clickButtonContinue(){
        super.clickWithWait(buttonContinue);

    }
    fillWalletAddress(address){
        //console.log("QQQQQ1");
        super.clearField(fieldWalletAddress);
        super.fillWithWait(fieldWalletAddress,address);
    }


    clickCheckboxGasPriceSafe()
    {
        super.clickWithWait(boxGasPriceSafe);
    }
    clickCheckboxGasPriceNormal()
    {
        super.clickWithWait(boxGasPriceNormal);
    }
    clickCheckboxGasPriceFast()
    {
    super.clickWithWait(boxGasPriceFast);
    }
    clickCheckboxGasPriceCustom()
    {
        super.clickWithWait(boxGasPriceCustom);
    }
    fillGasPriceCustom(value){
        super.clearField(fieldGasPriceCustom);
        super.fillWithWait(fieldGasPriceCustom,value);
    }
    clickCheckboWhitelistYes()
    {
        super.clickWithWait(boxWhitelistingYes);
    }
    clickCheckboWhitelistNo()
    {
        super.clickWithWait(boxWhitelistingNo);
    }

    clickButtonAddTier()
    {

        super.clickWithWait(buttonAddTier);
    }

    setGasPrice(value){
switch(value){
    case 2:{this.clickCheckboxGasPriceSafe();break;}
    case 4:{this.clickCheckboxGasPriceNormal();break;}
    case 30:{this.clickCheckboxGasPriceFast();break;}
    default:{
        this.clickCheckboxGasPriceCustom();
        this.fillGasPriceCustom(value);
            }
            }
    }

    fillMinCap(value){
        super.clearField(fieldMinCap);
        super.fillWithWait(fieldMinCap,value);
    }


}
module.exports.WizardStep3=WizardStep3;
