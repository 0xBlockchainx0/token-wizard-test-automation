### Automated tests for token-wizard 
Start URL in ```config.json```

Test suite for MintedCappedCrowdsale , starts with command ```npm run e2eMinted```

#### UI tests for MintedCappedCrowdsale
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
 - Wizard step#3: field minCap disabled if whitelist enabled
 - Wizard step#3: User is able to download CSV file with whitelisted addresses
 - Wizard step#3: Number of added whitelisted addresses is correct,data is valid
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

#### Functional tests for MintedCappedCrowdsale
```
 - Owner  can create crowdsale,2 tiers, modifiable, whitelist,2 reserved addresses
 - Owner is able to open the manage page
 - Manage page,tier #1: field minCap disabled if whitelist enabled
 - Manage page,tier #2: field minCap disabled if whitelist enabled
 - Manage page: correct number of whitelisted addresses is displayed for tier#1
 - Manage page: correct number of reserved addresses is displayed
 - Manage page: correct list of whitelisted addresses is displayed for tier#1
 - Manage page: correct list of whitelisted addresses is displayed for tier#2
 - Manage page: button 'Save' is not clickable when disabled
 - Manage page: owner is able to add whitelisted address before start of crowdsale
 - Manage page: correct list of whitelisted addresses is displayed for tier#1 after addition
 - Manage page: owner is able to modify the end time of tier#1 before start of crowdsale
 - Manage page:  end time of tier#1  properly changed after modifying
 - Manage page:  start time of tier#2 changed  after end time of tier#1 was changed
 - Whitelisted investor in tier#1 not able to buy before start of crowdsale
 - Contribution page: Countdown timer has correct status: 'TO START OF TIER1 '
 - Tier #1 starts as scheduled
 - Manage page, tier#1 : owner is able to add whitelisted address if crowdsale has begun
 - Manage page: correct list of whitelisted addresses is displayed for tier#1 after addition
 - Manage page: field end time disabled after start of crowdsale
 - Contribution page: minContribution field contains correct minCap value
 - Whitelisted investor is not able to buy less than min in first transaction
 - Whitelisted investor can buy amount equal mincap
 - Owner's Eth balance properly changed
 - Invest page: Investors balance is properly changed  after purchase
 - Whitelisted investor is able to buy less than mincap after first transaction
 - Owner's Eth balance properly changed
 - Whitelisted investor is able to buy not more than maxCap
 - Owner's Eth balance properly changed
 - Whitelisted investor (which was added from Manage page after tier's start) is able to buy
 - Whitelisted investor (which was added from Manage page before tier's start) is able to buy
 - Whitelisted investor is not able to buy more than remains even if individual maxCap is not reached
 - Whitelisted investor is not able to buy if all tokens were sold
 - Owner is not able to finalize if tier#1 is done
 - Tier#1 has finished as scheduled
 - Contribution  page: Countdown timer has correct status: 'TO END OF TIER2 '
 - Investor which whitelisted in tier#1 is not able to buy in tier#2
 - Contribution page: minContribution field contains correct minCap value for whitelisted investor
 - Investor which was added in whitelist from manage page in tier#1 is not able to buy in tier#2
 - Manage page, tier#2 : owner is able to add whitelisted address if crowdsale has begun
 - Manage page: correct list of whitelisted addresses is displayed for tier#2 after addition
 - Whitelisted investor is able to buy maxCap in first transaction 
 - Owner's Eth balance properly changed
 - Not owner is not able to finalize
 - Owner is able to finalize (if crowdsale time expired but not all tokens were sold)
 - Whitelisted investor is not able to buy if crowdsale finalized
 - Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'
 - Reserved address#1 has received correct percent of tokens after finalization
 - Reserved address#2 has received correct quantity of tokens after finalization
 - Investor#1 has received correct quantity of tokens after finalization
 - Investor#2 has received correct quantity of tokens after finalization
 - Investor#3 has received correct quantity of tokens after finalization
   
 - Owner  can create crowdsale,minCap,3 tiers
 - Investor not able to buy before start of crowdsale
 - Disabled to modify the end time if crowdsale is not modifiable 
 - Contribution page: Countdown timer has correct status: 'TO START OF TIER1 '
 - Tier #1 starts as scheduled
 - Contribution  page: Countdown timer has correct status: 'TO END OF TIER1 '
 - Contribution page: minContribution field contains correct minCap value 
 - Investor is not able to buy less than mincap in first transaction
 - Investor is able to buy amount equal mincap
 - Owner's Eth balance properly changed
 - Invest page: Investors balance is properly changed  after purchase
 - Investor is able to buy less than mincap after first transaction 
 - Owner's Eth balance properly changed 
 - Investor is able to buy not more than total supply for current tier
 - Owner's Eth balance properly changed
 - Owner is not able to finalize if all tokens were sold in tier#1
 - Manage page: owner is able to modify the end time of tier#2 before start
 - Manage page:  end time of tier#2 properly changed after modifying
 - Manage page:  start time of tier#3 changed  after end time of tier#2 was changed
 - Manage page: owner is able to change minCap tier#2 before start of tier#2
 - Tier #1 finished as scheduled
 - Manage page,tier #2: field minCap enabled if tier has started
 - Contribution  page: Countdown timer has correct status: 'TO END OF TIER2 '
 - Contribution page: minContribution field contains correct minCap value
 - Investor is not able to buy less than minCap in first transaction
 - Investor is able to buy amount equal minCap
 - Manage page: owner is able to update minCap after start of crowdsale
 - Contribution page: minContribution field contains correct minCap value (after modifying)
 - minCap should be updated: new investor is not able to buy less than new minCap
 - minCap should be updated:  New investor is  able to buy amount equals  new minCap
 - Old investor still able to buy amount less than minCap
 - Investor is able to buy maxCap
 - Manage page: owner is able to modify the end time of tier#3 before start
 - Manage page:  end time of tier#3 properly changed after modifying
 - Tier #2 finished as scheduled
 - Manage page,tier #3: field minCap disabled if whitelist enabled
 - Contribution page: minContribution field is 'You are not allowed' for non-whitelisted investors
 - Contribution page: minContribution field contains correct minCap value for whitelisted investor
 - Whitelisted investor is not able to buy less than min in first transaction
 - Whitelisted investor can buy amount equal mincap
 - Contribution  page: Countdown timer has correct status: 'TO END OF TIER 3'
 - Tier #3 finished as scheduled
 - Contribution page: minContribution field is 'You are not allowed' after end of crowdsale
 - Contribution page: Countdown timer has correct status: 'CROWDSALE HAS ENDED'
 - Disabled to buy after crowdsale time expired
 - Owner is able to finalize (if crowdsale time expired but not all tokens were sold)
 - Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'
 - Investor is not able to buy if crowdsale is finalized
 - Contribution page: minContribution field is 'You are not allowed' after finalization of crowdsale
 - Reserved address#1 has received correct percent of tokens after finalization
 - Reserved address#2 has received correct quantity of tokens after finalization
 - Investor#1 has received correct quantity of tokens after finalization
 - Investor#2 has received correct quantity of tokens after finalization
 - Investor#3 has received correct quantity of tokens after finalization
 
```

Test suite for DutchAuctionCrowdsale , starts with command ```npm run e2eDutch```

####  UI tests for DutchAuctionCrowdsale
```
 - User is able to open wizard welcome page
 - Welcome page: button NewCrowdsale present
 - Welcome page: button ChooseContract present 
 - Welcome page: user is able to open Step1 by clicking button NewCrowdsale
 - Wizard step#1: user is able to click DutchAuction checkbox
 - Wizard step#1: user is able to open Step2 by clicking button Continue
 - Wizard step#2:Check persistant if account has changed 
 - Wizard step#2: user able to fill Name field with valid data
 - Wizard step#2: user able to fill Ticker field with valid data
 - Wizard step#2: user able to fill Decimals field with valid data
 - Wizard step#2: user able to fill out 'Total supply' field with valid data
 - Wizard step#2: button Continue is displayed and enabled
 - Wizard step#2: user is able to open Step3 by clicking button Continue 
 - Wizard step#3: field Wallet address contains current metamask account address
 - Wizard step#3:Tier#1: Whitelist container present if checkbox 'Whitelist enabled' is selected
 - Wizard step#3: field minCap disabled if whitelist enabled
 - Wizard step#3: User is able to download CSV file with whitelisted addresses
 - Wizard step#3: Number of added whitelisted addresses is correct,data is valid
 - Wizard step#3: User is able to bulk delete all whitelisted addresses
 - Wizard step#3: All whitelisted addresses are removed after deletion
 - Wizard step#3: User is able to add several whitelisted addresses one by one
 - Wizard step#3: User is able to remove one whitelisted address
 - Wizard step#3: User is able to set "Custom Gasprice" checkbox
 - Wizard step#3: User is able to fill out the  CustomGasprice field with valid value
 - Wizard step#3: User is able to set SafeAndCheapGasprice checkbox
 - Wizard step#3:Tier#1:User is able to fill out field 'minRate' with valid data
 - Wizard step#3:Tier#1: User is able to fill out field 'maxRate' with valid data
 - Wizard step#3: Button 'Continue' is disabled if minRate > maxRate
 - Wizard step#3: Button 'Continue' is disabled if crowdsaleSupply>totalSupply
 - Wizard step#3:Tier#1: User is able to fill out field Supply with valid data
 - Wizard step#3: user is able to proceed to Step4 by clicking button Continue
 - Wizard step#4: alert present if user reload the page 
 - Wizard step#4: user is able to accept alert after reloading the page
 - Wizard step#4: button SkipTransaction is  presented if user reject a transaction
 - Wizard step#4: user is able to skip transaction
 - Wizard step#4: alert is displayed if user wants to leave the wizard 
 - Wizard step#4: User is able to stop deployment 

```
#### Functional tests for DutchAuctionCrowdsale
```
 - Owner can create DutchAuction crowdsale: 1 whitelisted addresses,duration 5 min
 - Contribution page: Countdown timer has correct status: 'TO START OF TIER1'
 - Contribution page: Owner's balance has correct value (totalSupply-crowdsaleSupply)
 - Whitelisted investor not able to buy before start of crowdsale
 - Manage page: owner is able to add whitelisted address before start of crowdsale
 - Crowdsale starts as scheduled
 - Contribution  page: Countdown timer has correct status: 'TO END OF TIER1 '
 - Contribution page: minContribution field is 'You are not allowed' for non-whitelisted investors
 - Manage page: owner is able to add whitelisted address after start of crowdsale
 - Contribution page: minContribution field contains correct minCap value for whitelisted investor
 
 
 - Whitelisted investor which was added before start can buy amount equal mincap
 
 - Whitelisted investor which was added after start can buy amount equal mincap
 - Whitelisted investor is not able to buy less than minCap in first transaction
 - Whitelisted investor can buy amount equal minCap
 - Contribution page: Investor's balance is properly changed  after purchase
 
 - Whitelisted investor is able to buy less than minCap after first transaction
 - Whitelisted investor is able to buy maxCap
 - Whitelisted investor's balance limited by maxCap
 - Crowdsale has finished as schedule
 - Contribution page: Countdown timer has correct status: 'CROWDSALE HAS ENDED'
 - Whitelisted investor is not able to buy if crowdsale finished
 - Not owner is not able to finalize
 - Owner has received correct quantity of tokens
 - Owner is able to finalize (if crowdsale time is over but not all tokens have sold)
 - Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'
 - Investor#1 has received correct quantity of tokens after finalization
 - Investor#2 has received correct quantity of tokens after finalization
 - Owner has received correct quantity of tokens after finalization
 - Check if flag  `burn_exceed` works: Owner has received unsold tokens after finalization

 - Owner  can create DutchAuction crowdsale: minCap,no whitelist
 - Contribution page: Countdown timer has correct status: 'TO START OF TIER1'
 - Contribution page: Owner's balance has correct value (totalSupply-supply)
 - Contribution page: minContribution field contains correct minCap value

 - Manage page: owner is able to change minCap before start of crowdsale
 - Investor not able to buy before start of crowdsale
  
 - Crowdsale starts as scheduled
 - Contribution page: Countdown timer has correct status: 'TO END OF TIER1 '
 - Contribution page: minContribution field contains correct minCap value (after modifying)
 - Investor is not able to buy less than minCap in first transaction
 - Investor is able to buy amount equal minCap
 - Contribution page: Investors balance is properly changed after purchase
 - Investor is able to buy less than minCap after first transaction
 - Manage page: owner is able to update minCap after start of crowdsale
 - Contribution page: minContribution field contains correct minCap value (after modifying)
 - minCap should be updated: new investor is not able to buy less than new minCap
 - minCap should be updated:  New investor is  able to buy amount equals  new minCap
 - Old investor still able to buy amount less than minCap
 - Investor is able to buy maxCap
 - Owner's Eth balance properly changed
 - Owner is able to finalize (if all tokens have been sold)
 - Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'
 - Investor #1 has received correct quantity of tokens after finalization
 - Investor #2 has received correct quantity of tokens after finalization
 - Owner has received correct quantity of tokens after finalization
  
```
 