
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const  buttonContinue= By.className("button button_fill");


class WizardStep1 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;

    }

    clickButtonContinue(){
        super.clickWithWait(buttonContinue);

    }
    open(){

        this.driver.get(this.URL);

    }




}
module.exports.WizardStep1=WizardStep1;
