
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const loader=By.className("loading-container");

const key = require('selenium-webdriver').Key;
const Twait=20000;


class Page {

    constructor(driver){
        this.driver=driver;
        this.pageID;
        this.footer;
        this.header;
    }



     async   findElementInArray(locator,className)
        {
            var arr=await this.driver.findElements(locator);
            for (var i=0;i<arr.length;i++)
            {
                var s=await arr[i].getAttribute("className");
                if (s.includes(className)) return arr[i];
            }


        }


 async  isElementPresent(element) {
     var q;
     try {
         q = await this.driver.findElement(element).isDisplayed();
        // var s=await this.driver.findElements(element);
        // console.log("lengfth"+s.length);
        // if (s.length>0)q=true;
        // else q=false;
     } catch (err) {
         q = false;
     }

     return q;

     }
async getTextElement(element)
{return await element.getText();}





async getText(element)
{
  return await this.driver.findElement(element).getText();
}
async getURL()
{
    return await this.driver.getCurrentUrl();
}
open (url){
        this.driver.get(url);
}
clearField(element,n){
    let field;
    if (n!=1) {
        field = this.driver.wait(webdriver.until.elementLocated(element), Twait);
    }
    else field=element;
    const c=key.chord(key.CONTROL,"a");
    const action=this.driver.actions();
    action.click(field).perform();
    //action.click(field).perform();
    this.driver.sleep(500);
    action.sendKeys(c).perform();
    action.sendKeys(key.DELETE).perform();
    action.sendKeys(key.DELETE).perform();

}
oneClick(element){
      this.driver.findElement(element).click();
}
    clickElement(element){
        element.click();
    }

    fillField(field,address){
        field.sendKeys(address);

    }


    clickWithWait(element) {
        let button = this.driver.wait(webdriver.until.elementLocated(element), Twait);
        button.click();
    }
    fillWithWait(element,k) {
        let field = this.driver.wait(webdriver.until.elementLocated(element), Twait);
        field.sendKeys(k);

    }
    refresh(){
        this.driver.navigate().refresh();
    }
    async findWithWait(element)
    {
        await this.driver.wait(webdriver.until.elementLocated(element), Twait);
        return await this.driver.findElements(element);
    }
    clickTo(element){
        element.click();

    }

    async  isDisplayedLoader(){
        var s=await this.driver.findElement(loader).getAttribute("className");
        if (s=="loading-container notdisplayed") return true;
        else return false;
    }
async waitUntilLoaderGone(){
    do{ this.driver.sleep(1000);await this.isDisplayedLoader();}while(!(await this.isDisplayedLoader()));
}
    switchToAnotherPage(){
        let dr=this.driver;

        dr.getWindowHandle().then(function (mainWindowHandle) {

            dr.getAllWindowHandles().then(function (windowHandles) {

                windowHandles.forEach(function(handle){

                    if(!(handle===mainWindowHandle))
                    {
                        dr.switchTo().window(handle);

                    }
                });
            });

        });


    }





}
module.exports.Page=Page;
