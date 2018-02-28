### Automated tests for token-wizard 
Start URL, path for results in ```config.json```

Test suite #1 , starts with command ```npm run -script test1```
```
1.  'Owner  can create crowdsale,no whitelist,reserved'
2.  'Warning presents if investor try to buy from foreign network'
3.  'Investor can NOT buy less than minCap in first transaction'
4.  'Investor can NOT buy more than total supply in tier'
5.  'Investor can buy amount equals minCap'
6.  'Investor can buy  less than minCap after first transaction'
7.  'Owner can NOT distribute before  all tokens were sold'
8.  'Owner can NOT finalize before  all tokens were sold & if crowdsale NOT ended'
9.  'Investor can contribute maximum'
10. 'NOT Owner can NOT distribute (after all tokens were sold)'
12. 'Owner can distribute (after all tokens were sold)'
13. 'Reserved addresses receive right amount of tokens after distribution'
14. 'NOT Owner can NOT finalize (after all tokens were sold)'
15. 'Owner can  finalize (after all tokens were sold)'
16. 'Investors receive right amount of tokens after finalization)'
```
Test suite #2 , starts with command ```npm run -script test2```

```
1.  'Owner  can create crowdsale, whitelist, reserved'





```




 
 
 
 