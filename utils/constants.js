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

module.exports = {
	WALLET: WALLET,
    statusTimer:statusTimer,
    TIME_FORMAT:TIME_FORMAT
}
global.testVersion='2.10.2'