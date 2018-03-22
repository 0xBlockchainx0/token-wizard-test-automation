### Automated tests for token-wizard 
Start URL, path for results in ```config.json```

Test suite #1 , starts with command ```npm run -script test1```
```
1.  'Owner  can create crowdsale,one whitelist address,two reserved addresses, not modifiable'
2.  'Not whitelisted investor can NOT buy'
3.  'Whitelisted investor can NOT buy less than minCap in first transaction'
4.  'Whitelisted investor can buy amount = minCap'
5.  'Whitelisted investor can NOT buy more than total supply in tier'
6.  'Whitelisted investor can buy less than minCap after first transaction'
7.  'Owner can not modify end time if allow modify is false'
8.  'Owner can NOT distribute before  all tokens are sold'
9.  'Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended'
10. 'Whitelisted investor can buy total supply for current tier'
11. 'NOT Owner can NOT distribute (after all tokens were sold)'
12. 'Owner can distribute (after all tokens were sold)'
13. 'Reserved addresses receive correct amount of tokens after distribution)'
14. 'NOT Owner can NOT finalize (after all tokens were sold)'
15. 'Owner can  finalize (after all tokens were sold)'
16. 'Investor receive correct amount of tokens after finalization'
```
Test suite #2 , starts with command ```npm run -script test2```

```
1. 'Owner  can create crowdsale(scenario testSuite2.json),2 tiers, 2 whitelist adresses,1 reserved addresses, modifiable'
2. 'Not whitelisted investor can NOT buy'
3. 'Whitelisted investor can NOT buy less than assigned MIN value in first transaction'
4. 'Whitelisted investor can buy assigned MIN value '
5. 'Whitelisted investor can buy less than MIN value if it is NOT first transaction'
6. 'Whitelisted investor can buy assigned MAX value '
7. 'Owner can add whitelist if tier has not finished yet'
8. 'New added whitelisted investor can buy'
9. 'Owner can NOT modify start time if crowdsale has started'
10. 'Owner can modify start time of tier if tier has not started yet'
11. 'Owner can modify end time of tier#1'
12. 'Check inheritance of whitelisting. Whitelisted investor can buy in next tier.'
13. 'Owner can modify end time of tier#2'


```




 
 
 
 