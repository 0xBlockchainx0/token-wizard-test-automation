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
    CROWDSALE_PAGE:'CROWDSALE PAGE'
}
const placeholders = {
    gasPriceCustom:'0.1',
    decomals:'18'
}

module.exports = {
	WALLET: WALLET,
    statusTimer:statusTimer,
    TIME_FORMAT:TIME_FORMAT,
    TITLES:TITLES
}
global.testVersion='2.20.2'