### Automated tests for token-wizard 
Start URL in ```config.json```

Test suite for MintedCappedCrowdsale , starts with command ```npm run e2eMinted```

#### UI tests
```
 - User is able to open wizard welcome page
 - Welcome page: button NewCrowdsale present
 - Welcome page: button ChooseContract present 
 - Welcome page: user is able to open Step1 by clicking button NewCrowdsale
 - Wizard step#1: user is able to open Step2 by clicking button Continue
 - Wizard step#2: user able to fill Name field with valid data
 - Wizard step#2: user able to fill Ticker field with valid data
 - Wizard step#2: user able to fill Decimals field with valid data
 - Wizard step#2: User is able to download CSV file with reserved addresses
 - Wizard step#2: added only valid data from CSV file
 - Wizard step#2: button ClearAll is displayed
 - Wizard step#2: Alert present after clicking ClearAll
 - Wizard step#2: user is able bulk delete of reserved tokens 
 - Wizard step#2: user is able to add reserved tokens one by one 
 - Wizard step#2: field Decimals is disabled if reserved tokens are added
 - Wizard step#2: user is able to remove one of reserved tokens
 - Wizard step#2: button Continue is displayed 
 - Wizard step#2: user is able to open Step3 by clicking button Continue 
 - Wizard step#3: Whitelist container present if checkbox "Whitelist enabled" is selected
 - Wizard step#3: User is able to download CSV file with whitelisted addresses
 - Wizard step#3: Number of added whitelisted addresses is correct,data is valid
 - Wizard step#3: User is able to bulk delete all whitelisted addresses
 - Wizard step#3: User is able to bulk delete all whitelisted addresses
 - Wizard step#3: All whitelisted addresses are removed after deletion
 - Wizard step#3: User is able to add several whitelisted addresses one by one
 - Wizard step#3: User is able to remove one whitelisted address
 - Wizard step#3: User is able to set "Custom Gasprice" checkbox
 - Wizard step#3: User is able to fill out the  CustomGasprice field with valid value
 - Wizard step#3: User is able to set SafeAndCheapGasprice checkbox
 - Wizard step#3:Tier#1: User is able to fill out field "Rate" with valid data
 - Wizard step#3:Tier#1: User is able to fill out field "Supply" with valid data
 - Wizard step#3: User is able to add tier
 - Wizard step#3:Tier#2: User is able to fill out field "Rate" with valid data
 - Wizard step#3:Tier#2: User is able to fill out field "Supply" with valid data
 - Wizard step#3: user is able to proceed to Step4 by clicking button Continue
 - Wizard step#4: alert present if user reload the page 
 - Wizard step#4: user is able to accept alert after reloading the page
 - Wizard step#4: button SkipTransaction is  presented if user reject a transaction
 - Wizard step#4: user is able to skip transaction
 - Wizard step#4: alert is displayed if user wants to leave the wizard 
 - Wizard step#4: User is able to stop deployment 
 
```

#### Functional tests
```
 - Owner  can create crowdsale:1 tier, modifiable, whitelist,2 reserved
 - Whitelisted investor is not able to buy before start of crowdsale
 - Manage page: owner is able to open the manage page
 - Manage page: button 'Save' is  disabled by default
 - Manage page: button 'Save' is not clickable when disabled
 - Manage page: owner is able to add whitelisted address before start of crowdsale
 - Manage page: owner is able to modify the end time before start of crowdsale
 - Manage page:  end time changed  accordingly after modifying
 - Invest page: Countdown timer is displayed
 - Tier starts as scheduled
 - Manage page: owner is able to add whitelisted address if crowdsale has begun
 - Manage page: owner is able to modify the end time after start of crowdsale
 - Manage page:  end time changed  accordingly after modifying
 - Whitelisted investor is NOT able to buy less than min in first transaction
 - Whitelisted investor can buy amount equal mincap
 - Invest page: Investors balance is changed accordingly after purchase
 - Whitelisted investor is able to buy less than mincap after first transaction
 - Whitelisted investor is able to buy not more than maxCap
 - Whitelisted investor (which was added from Manage page) is able to buy maxCap
 - Whitelisted investor is not able to buy more than remains even if individual maxCap is not reached
 - Whitelisted investor is not able to buy if all tokens were sold
 - Not owner is not able to finalize
 - Owner is able to finalize (if crowdsale time expired but not all tokens were sold)
 - Whitelisted investor is not able to buy if crowdsale finalized
 - Reserved address has received correct quantity of tokens after distribution
 - Investor has received correct quantity of tokens after finalization
 - Owner  can create crowdsale with minCap,1 tier, not modifiable, no whitelist,2 reserved
 - Investor not able to buy before start of crowdsale
 - Disabled to modify the end time if crowdsale is not modifiable 
 - Invest page: Countdown timer is displayed
 - Tier starts as scheduled
 - Investor is not able to buy less than mincap in first transaction
 - Investor can buy amount equal mincap
 - Invest page: Investor's balance is changed accordingly after purchase
 - Investor is able to buy less than mincap after first transaction
 - Owner is not able to finalize if all tokens were not sold and crowdsale is not finished
 - Crowdsale is finished as scheduled
 - Disabled to buy after crowdsale's time expired
 - Owner is able to finalize (if crowdsale time expired but not all tokens were sold)
 - Investor is not able to buy if crowdsale is finalized
 - Reserved address has received correct quantity of tokens after distribution
 - Investor has received correct quantity of tokens after finalization

```








 
 
 
 