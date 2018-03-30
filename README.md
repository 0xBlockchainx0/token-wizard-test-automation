### Automated tests for token-wizard 
Start URL, path for results in ```config.json```

Test suite #1 , starts with command ```npm run -script test1```
```
1.  Owner  can create crowdsale,no whitelist,two reserved addresses, not modifiable
2.  Investor can NOT buy less than minCap in first transaction
3.  Investor can buy amount = minCap
4.  Investor can NOT buy more than total supply in tier
5.  Investor can buy less than minCap after first transaction
6.  Owner can not modify end time if allow modify is falle
7.  Owner can NOT distribute before  all tokens are sold
8.  Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended
9. Owner can not distribute if crowdsale time is not over
10. Owner can distribute if crowdsale time is over
11. Reserved addresses receive correct amount of tokens after distribution
12. Owner can  finalize if crowdsale time is over
13. Investor receive correct amount of tokens after finalization
14. Wallet address receive correct amount of ETH.
```


Test suite #2 , starts with command ```npm run -script test2```

```
Roles:
Owner;
Investor#1: min=50, max=150 -whitelisted before,will buy max
Investor#2: min=20, max=200 - added from manage page before start,try to buy in negative tests
Investor#3=ReservedAddress - added from manage page after start, will try to buy in negative tests
ReservedAddresses: Owner 1e8 & ReservedAddresses 250%

1. Owner  can create crowdsale, one whitelist address,two reserved addresses, modifiable
2. Whitelisted investor can not buy before the crowdsale started
3. Not owner can NOT modify the start time of tier#1 
4. Field name of tier is not modifiable
5. Field wallet address is not modifiable
6. Owner is able to add whitelisted address before start of crowdsale.
7. Owner is able to modify the total supply before start of crowdsale.
8. Owner is able to modify the rate before start of crowdsale.
9. Warning present if end time earlier than start time.
10. Owner is able to modify the end time before start of crowdsale.
11. Owner is able to modify the start time  before start of crowdsale.
12. Disabled to modify the start time if crowdsale has begun.

13. Disabled to modify the total supply if crowdsale has begun.
14. Disabled to modify the rate if crowdsale has begun.
15. Owner is able to modify the end time after start of crowdsale.
15. Owner is able to add whitelisted address if crowdsale has begun.

16. Whitelisted investor can NOT buy less than minCap in first transaction
17. Whitelisted investor can buy amount = minCap
Whitelisted investor can NOT buy more than assigned max
18. Whitelisted investor can NOT buy more than total supply in tier
19. Whitelisted investor can buy less than minCap after first transaction
22. Whitelisted investor can buy assigned maximum
20. Owner can NOT distribute before all tokens are sold 
21. Owner can NOT finalize before all tokens are sold  if crowdsale NOT ended 


22. Whitelisted investor can buy total supply for current tier 
23. Whitelisted investor is NOT able to buy if all tokens were sold
24.Owner can distribute (after all tokens were sold)



24. Reserved addresses receive correct amount of tokens after distribution)

25. NOT Owner can NOT finalize (after all tokens were sold)
26. Owner can  finalize (after all tokens were sold)

27. Disabled to buy after crowdsale is finalized
28. Investors receive correct amount of tokens after finalization
29. Owner receive  correct amount of ETH.
```










 
 
 
 