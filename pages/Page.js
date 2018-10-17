const Logger = require('../entity/Logger.js');
const logger = Logger.logger;
const key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver');
const By = require('selenium-webdriver/lib/by').By;
const loader = By.className("loading-container");
const loaderNotDisplayed = By.className("loading-container notdisplayed");
const titles = By.className("st-StepContent_InfoTitle");
const buttonOk = By.className("swal2-confirm swal2-styled");

class Page {

    constructor(driver) {
        this.driver = driver;
        this.titleElement;
    }

    async pressKey(key, times) {
        logger.info("press key " + key + " " + times + " times")
        try {
            const action = this.driver.actions();
            for ( let i = 0; i < times; i++ )
                await action.sendKeys(key).perform();
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async waitUntilDisappear(element, wait) {
        logger.info("waitUntilDisappear");
        if ( wait === undefined ) wait = 150;
        do {
            await this.driver.sleep(200);
            if ( !await this.isElementDisplayed(element) ) return true;
        } while ( counter-- > 0 );
        return false;
    }

    async waitUntilDisplayed(element, Twaiting) {
        logger.info("waitUntilDisplayed");
        let counter = Twaiting;
        if ( counter === undefined ) counter = 180;
        try {
            do {
                await this.driver.sleep(333);
                if ( await this.isElementDisplayed(element) ) return true;
            } while ( counter-- > 0 );
            return false;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async waitUntilLocated(element, Twaiting) {
        logger.info("wait until located");
        let counter = Twaiting;
        if ( counter === undefined ) counter = 180;
        try {
            do {
                await this.driver.sleep(333);
                if ( await this.isElementLocated(element) ) return true;
            } while ( counter-- > 0 );

            return false;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async isElementSelected(element) {
        logger.info("isElementSelected");
        if ( element.constructor.name !== "WebElement" ) {
            return await this.driver.findElement(element).isSelected();
        } else {
            return await element.isSelected();
        }
    }

    async isElementLocated(element) {
        logger.info("is element located: ");
        return (await this.driver.findElements(element)).length > 0;
    }

    async isElementDisplayed(element) {
        logger.info("is element displayed: ");
        try {
            if ( element.constructor.name !== "WebElement" ) {
                return await this.driver.findElement(element).isDisplayed();
            }
            else
                return element.isDisplayed();
        }
        catch ( err ) {
            logger.info("Error:" + err);
            return false;
        }
    }

    async getElement(element, Twaiting) {
        logger.info("getElement: " + element);
        try {
            if ( Twaiting === undefined ) Twaiting = 180;
            if ( element.constructor.name !== "WebElement" )
                return await this.driver.wait(webdriver.until.elementLocated(element), Twaiting * 333);
            else return element;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async isElementDisabled(element) {
        logger.info("isElementDisabled  " + element);
        try {
            let field = await this.getElement(element);
            return !await field.isEnabled()
        }
        catch ( err ) {
            logger.info("element enabled or does not present");
            return false;
        }
    }

    async getAttribute(element, attr) {
        logger.info("get attribute = " + attr + " for element = " + element);
        try {
            let field = await this.getElement(element);
            let result = await field.getAttribute(attr);
            logger.info("received value= " + result);
            return result;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async getTextForElement(element, Twaiting) {
        logger.info("get text for element : ");
        try {
            let field = await this.getElement(element, Twaiting);
            let result = await field.getText();
            if ( result.length < 100 ) logger.info("text received: " + result);
            return result;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async getURL() {
        logger.info("get current page URL ");
        return await this.driver.getCurrentUrl();
    }

    async open(url) {
        logger.info("open: " + url);
        try {
            await this.driver.get(url);
            logger.info("Current URL: " + await this.driver.getCurrentUrl());
            logger.info("Current HANDLE: " + await this.driver.getWindowHandle());
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async isLocatedLoader() {
        logger.info("is loader displayed :");
        try {
            return await this.isElementLocated(loader);
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async waitUntilLoaderGone() {
        logger.info("wait until loader gone :");
        if ( !await this.isLocatedLoader() ) return true;
        else
            return await this.waitUntilLocated(loaderNotDisplayed, 180);
    }

    async refresh() {
        logger.info("refresh :");
        try {
            await this.driver.navigate().refresh();
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async clickWithWait(element, Twaiting) {
        logger.info("click with wait: " + element);
        try {
            let field = await this.getElement(element, Twaiting);
            await field.click();
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async fillWithWait(element, k, Twaiting) {
        logger.info("fill with wait : value = " + k);
        try {
            let field = await this.getElement(element, Twaiting);
            if ( field === null ) return false;
            await field.sendKeys(k);
            return true;
        }
        catch ( err ) {
            logger.info("Element " + element + " has not appeared in" + Twaiting * 333 / 1000 + " sec.");
            return false;
        }
    }

    async findWithWait(element, Twaiting) {
        logger.info("find with wait ");
        try {
            if ( Twaiting === undefined ) Twaiting = 180;
            await this.driver.wait(webdriver.until.elementLocated(element), Twaiting * 333);
            return await this.driver.findElements(element);
        }
        catch ( err ) {
            logger.info("Element " + element + " have not appeared in" + Twaiting * 333 / 1000 + " sec.");
            return null;
        }
    }

    async clearField(element) {
        try {
            logger.info("clear field :");
            let field = await this.getElement(element);
            let content = "";
            let counter = 3;
            do {
                await field.click();
                await this.driver.sleep(200);
                for ( let i = 0; i < 40; i++ ) {
                    await field.sendKeys(key.BACK_SPACE);
                }
                await this.driver.sleep(200);
                content = await field.getAttribute('value');
                if ( content === "" ) return true;
            } while ( counter-- > 0 );
            return false;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async clearFieldFromStart(element) {
        try {
            logger.info("clearFieldFromStart");
            let field = await this.getElement(element);
            let counter = 1;
            do {
                await this.driver.sleep(200);
                for ( let i = 0; i < 10; i++ ) {
                    await field.sendKeys(key.ARROW_RIGHT);
                }
                await this.driver.sleep(200);
                for ( let i = 0; i < 10; i++ ) {
                    await field.sendKeys(key.BACK_SPACE);
                }
                await this.driver.sleep(200);

            } while ( counter-- > 0 );
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async switchToNextPage() {
        logger.info("switch to next tab :");
        let allHandles = [];
        let curHandle;
        try {
            allHandles = await this.driver.getAllWindowHandles();
            curHandle = await this.driver.getWindowHandle();
            if ( allHandles.length > 2 ) {
                let arr = [];
                arr[0] = allHandles[0];
                arr[1] = allHandles[1];
                allHandles = arr;
                logger.info("Browser has " + allHandles.length + " tabs");
            }
            let handle;
            for ( let i = 0; i < allHandles.length; i++ ) {
                if ( curHandle !== allHandles[i] ) {
                    handle = allHandles[i];
                    break;
                }
            }
            await this.driver.switchTo().window(handle);
            logger.info("Current handle  = " + curHandle);
            logger.info("Switch to handle  = " + handle);
            await this.driver.sleep(500);
            return true;

        }
        catch ( err ) {
            logger.info("can't switch to next tab " + err);
            logger.info("current handle: " + curHandle);
            return false;
        }
    }

    async goBack() {

        logger.info("goBack");
        try {
            this.driver.navigate().back();
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async goForward() {
        logger.info("goForward");
        try {
            this.driver.navigate().forward();
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async getChildsByClassName(className, element) {
        logger.info("getChildsByClassName");
        try {
            return await element.findElements(By.className(className.toString()));
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async initTitles() {
        logger.info("initTitles  ");
        try {
            let array = await this.findWithWait(titles);
            this.titleElement = array[0];
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async getTitleText() {
        logger.info("getPageTitle  ");
        await this.initTitles();
        return this.getTextForElement(this.titleElement);

    }

    async waitUntilDisplayedTitle(Twaiting) {
        logger.info("waitUntilDisplayedTitle: ");

        return (await this.initTitles() !== null)
            && await this.waitUntilDisplayed(this.titleElement, Twaiting);
    }

    async isPresentAlert() {
        logger.info("isPresentAlert:")
        try {

            let result = await this.driver.switchTo().alert().getText();
            logger.info("alert text:  " + result);
            return true;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return false;
        }
    }

    async acceptAlert() {
        logger.info("acceptAlert:")
        try {
            this.driver.switchTo().alert().accept();
            return true;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return false;
        }
    }

    async waitUntilShowUpWarning(Twaiting) {
        logger.info("waitUntilShowUpWarning ");
        return await this.waitUntilDisplayed(buttonOk, Twaiting);
    }

    async clickButtonOK() {
        logger.info("clickButtonOK ");
        return await this.clickWithWait(buttonOk);
    }

    async waitUntilHasValue(element, Twaiting) {
        logger.info("waitUntilHasValue ");
        try {
            let field = await this.getElement(element, 3);
            if ( field === null ) return false;
            if ( Twaiting === undefined ) Twaiting = 180;
            do {
                await this.driver.sleep(333);
                if ( await this.getAttribute(field, "value") !== '' ) return true;
            }
            while ( Twaiting-- > 0 )
            return false;
        }
        catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    async  scrollTo (element) {
        try {
            await this.driver.executeScript('arguments[0].scrollIntoView();', element)
            return true
        } catch (err) {
            return false
        }
    }
}

module.exports.Page = Page;
