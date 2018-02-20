
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonNewCrowdsale=By.className("button button_fill");
const buttonChooseContract=By.className("button button_outline");

class WizardWelcome extends page.Page{

    constructor(driver,URL){
        super(driver);
        this.URL=URL;

    }

    clickButtonNewCrowdsale(){
        super.clickWithWait(buttonNewCrowdsale);



    }
    clickButtonChooseContract(){
        super.clickWithWait(buttonChooseContract);
        }

    open()
    {
        this.driver.get(this.URL);

    }



}
module.exports.WizardWelcome=WizardWelcome;
