### Automated tests for token-wizard 
Start URL in ```config.json```

Test suite #1 , starts with command ```npm run -script test1```

#### UI tests
```
 - User is able to open wizard welcome page
 - Welcome page: button NewCrowdsale present
 - Welcome page: button ChooseContract present 
 - Welcome page: user is able to open Step1 by clicking button NewCrowdsale
 - Wizard step#1: user is able to open Step2 by clicking button Continue
 
 - Wizard step#2: user able to fill out Name field with valid data
 - Wizard step#2: user able to fill out Ticker field with valid data
 - Wizard step#2: user is not able to open Step2 if Decimals field empty
 - Wizard step#2: user able to fill Decimals field with valid data
 - Wizard step#2: user is able to download CSV file with reserved addresses
 - Wizard step#2: number of added reserved tokens is correct
 - Wizard step#2: button ClearAll is displayed 
 - Wizard step#2: alert is displayed after clicking ClearAll 
 - Wizard step#2: user is able to bulk delete of reserved tokens
 - Wizard step#2: user is able to add reserved tokens one by one 
 - Wizard step#2: field Decimals is disabled if reserved tokens are added
 - Wizard step#2: user is able to remove one of reserved tokens 
 - Wizard step#2: button Continue is displayed
 - Wizard step#2: user is able to open Step3 with clicking button Continue 
 
 - Wizard step#3: field Wallet address contains the metamask account address 
 - Wizard step#3: Whitelist container present if checkbox WhitelistEnabled is selected
 - Wizard step#3: User is able to download CSV file with whitelisted addresses
 - Wizard step#3: Number of added whitelisted addresses is correct
 - Wizard step#3: User is able to bulk delete all whitelisted addresses
 - Wizard step#3: All whitelisted addresses removed after deletion 
 - Wizard step#3: User is able to add several whitelisted addresses one by one
 - Wizard step#3: User is able to remove one whitelisted address
 - Wizard step#3: User is able to set "Custom Gasprice" checkbox
 - Wizard step#3: User is able to fill out the  CustomGasprice field with valid value
 - Wizard step#3: User is able to set SafeAndCheapGasprice checkbox
 - Wizard step#3: User is able to fill out field Rate with valid data
 - Wizard step#3: User is able to fill out field Supply with valid data
 - Wizard step#3: User is able to add tier
 - Wizard step#3: user is able to proceed to Step4 by clicking button Continue
 
 - Wizard step#4: alert is displayed if user reload the page
 - Wizard step#4: user is able to accept alert after reloading the page
 - Wizard step#4: button SkipTransaction is  presented if user reject a transaction
 - Wizard step#4: user is able to skip a transaction
 - Wizard step#4: alert is presented if user wants to leave the wizard
 - Wizard step#4: User is able to stop deployment
```

#### Functional tests
```
 - Owner  can create crowdsale(scenario testSuite1.json),1 tier, not modifiable, no whitelist,1 reserved
 - Disabled to modify the end time if crowdsale is not modifiable
 - Investor can NOT buy less than mincap in first transaction
 - Investor can buy amount equal mincap
 - Invest page: Investor's balance is changed accordingly after purchase
 - Investor is not able to buy amount which significally more than total supply
 - Investor is able to buy less than mincap after first transaction
 - Crowdsale is finished in time
 - Disabled to buy after crowdsale time expired
 - Owner able to distribute if crowdsale time expired but not all tokens were sold
 - Reserved address has received correct quantity of tokens after distribution
 - Owner is able to finalize ( if crowdsale time expired but not all tokens were sold)
 - Investor has received correct quantity of tokens after finalization


 - Owner  can create crowdsale(scenario testSuite2.json): 1 tier,1 whitelist address,2 reserved addresses, modifiable
 - Whitelisted investor NOT able to buy before start of crowdsale 
 - Disabled to modify the name of tier
 - Tier's name  matches given value
 - Disabled to modify the wallet address
 - Tier's wallet address matches given value
 - Owner is able to add whitelisted address before start of crowdsale
 - Owner is able to modify the rate before start of crowdsale
 - Manage page: Rate changed accordingly after modifying
 - Manage page: owner is able to modify the total supply before start of crowdsale
 - Manage page: total supply changed accordingly  after changing
 - Manage page: owner is able to modify the total supply before start of crowdsale
 - Manage page: Owner is able to modify the start time  before start of crowdsale
 - Manage page:  end time changed  after modifying
 - Manage page: warning is displayed if end time earlier than start time
 - Warning present if not owner open manage page
 - Manage page: disabled to modify the start time if crowdsale has begun
 - Manage page: disabled to modify the total supply if crowdsale has begun
 - Manage page: disabled to modify the rate if crowdsale has begun
 - Manage page: owner is able to modify the end time after start of crowdsale
 - Manage page:  end time changed accordingly after modifying
 - Manage page: owner is able to add whitelisted address if crowdsale has begun
 - Whitelisted investor is not able to buy less than min in first transaction
 - Whitelisted investor can buy amount equal mincap
 - Whitelisted investor is able to buy less than mincap after first transaction
 - Whitelisted investor is not able to buy more than assigned max
 - Whitelisted investor is able to buy assigned max
 - Whitelisted investor is not able to buy more than total supply in tier
 - Owner is not able to distribute before all tokens are sold and crowdsale is not finished
 - Owner is NOT able to distribute before all tokens are sold and crowdsale is not finished
 - Owner is NOT able to finalize before  all tokens are sold and crowdsale is not finished
 - Whitelisted investor is able to buy total supply 
 - Whitelisted investor is not able to buy if all tokens were sold
 - Owner able to distribute after all tokens were sold but crowdsale is not finished
 - Reserved address has received correct quantity of tokens after distribution
 - Reserved address has received correct percentage of tokens after distribution
 - Not Owner is not able to finalize (after all tokens were sold)
 - Owner able to finalize (after all tokens were sold)
 - Disabled to buy after finalization of crowdsale
 - Investor #1 has received correct amount of tokens after finalization
 - Investor #2 has received correct amount of tokens after finalization
```
