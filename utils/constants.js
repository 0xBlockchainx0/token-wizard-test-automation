global.testVersion='new Design 3.2.0'
const WALLET = {
	METAMASK: 'METAMASK',
	NIFTY: 'NIFTY'
}
const statusTimer = {
    start: "START",
    end: "CROWDSALE HAS ENDED",
    finalized: "HAS BEEN FINALIZED",
    tier1: "END OF TIER 1",
    tier2: "END OF TIER 2",
    tier3: "END OF TIER 3",
}
const TIME_FORMAT = {
    MDY: "mdy",
    UTC: "utc"
}

const TITLES = {
    STEP1:"Crowdsale Strategy",
    STEP2:"Token Setup",
    STEP3:"Crowdsale Setup",
    PUBLISH_PAGE:"Publish",
    CROWDSALE_PAGE:"Crowdsale Page",
    CONTRIBUTE_PAGE:"Contribute Page"

}
const placeholders = {
    gasPriceCustom:'0.1',
    decomals:'18'
}
const TEXT={
    WHITELIST_VALIDATOR : 'The following lines are wrong:\n' +
        'Line #1 has a greater minCap than maxCap. Current value is 13.\n' +
        'Line #1 has a less maxCap than minCap. Current value is 12.\n' +
        'Line #2 has a negative value for maxCap. Current value is -16.\n' +
        'Line #2 has a greater minCap than maxCap. Current value is 4.\n' +
        'Line #2 has a less maxCap than minCap. Current value is -16.\n' +
        'Line #3 has a negative value for minCap. Current value is -2.\n' +
        'Line #4 has an incorrect address. Current value is 0xF16AB2EA0a7F7B28C267cbA3Ed211Ea5c6e2741.\n' +
        'Line #5 have 2 columns, must have 3 columns.\n' +
        'Line #5 has an incorrect minCap, must be an integer. Current value is empty.\n' +
        'Line #5 has an incorrect maxCap, must be an integer. Current value is empty.\n' +
        'Line #6 has an incorrect maxCap, must be an integer. Current value is empty.\n' +
        'Line #7 have 5 columns, must have 3 columns.\n' +
        'Line #8 has a maxCap that exceeds the total supply. Current value is 1000001.\n' +
        'Line #9 have 1 column, must have 3 columns.\n' +
        'Line #9 has an incorrect address. Current value is Qdqwdiuhqkd.\n' +
        'Line #9 has an incorrect minCap, must be an integer. Current value is empty.\n' +
        'Line #9 has an incorrect maxCap, must be an integer. Current value is empty.\n' +
        'Line #10 has an incorrect minCap, must be an integer. Current value is 12.345.\n' +
        'Line #11 has an incorrect maxCap, must be an integer. Current value is 123.456.',
    WHITELIST_MAX_REACHED : "You're not able to add more addresses to the whitelist. Only 50 addresses of the file could be added. The maximum allowed is 50",
    RESERVED_VALIDATOR:"The following lines have an erroneous amount of columns:\n" +
                       "The line number 15 have 1 column, must have 3 columns",
    RESERVED_MAX_REACHED:"You're not able to reserve more tokens. Reserved tokens imported Tokens will be reserved for 20 addresses. The maximum allowed is 20",
}

module.exports = {
    TEXT:TEXT,
	WALLET: WALLET,
    statusTimer:statusTimer,
    TIME_FORMAT:TIME_FORMAT,
    TITLES:TITLES
}
