// Mock data for Institutional & P2P USDT OTC Platform

export const DEFAULT_ADMIN_PRICING = {
  buyPriceInr: 90.25,   // What customer pays to BUY 1 USDT in INR (Desk Sells to customer)
  sellPriceInr: 88.80,  // What customer receives when they SELL 1 USDT in INR (Desk Buys from customer)
  baseBenchmarkInr: 89.45,
  minTradeInr: 25000,
  maxTradeInr: 100000000,
  minTradeUsdt: 300,
  maxTradeUsdt: 1200000,
  deskSpreadBps: 14,
  bankDetails: {
    beneficiaryName: 'VALENCE OTC MARKETS PRIVATE LIMITED',
    bankName: 'HDFC Bank Ltd (Corporate OTC Treasury Branch)',
    accountNumber: '50200084920199',
    ifsc: 'HDFC0000123',
    upiId: 'valence.otc@hdfcbank',
    city: 'Mumbai, BKC'
  },
  lastUpdated: new Date().toISOString()
};

export const USDT_NETWORKS = [
  {
    id: 'trc20',
    name: 'TRON (TRC-20)',
    short: 'TRC-20',
    icon: '⚡',
    badgeColor: '#EF4444',
    feeUsdt: 1.00,
    speed: '~1-3 mins',
    confirmations: '19 blocks',
    contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    defaultAddress: 'TJYv8RsmQ6tP89KzQW2r6nUx7L3vGEmL7d',
    status: 'Optimal',
    isPopular: true
  },
  {
    id: 'erc20',
    name: 'Ethereum (ERC-20)',
    short: 'ERC-20',
    icon: '🔷',
    badgeColor: '#627EEA',
    feeUsdt: 3.80,
    speed: '~3-6 mins',
    confirmations: '12 blocks',
    contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    defaultAddress: '0x71C836eA9B0B76378A690bE87515F47E84B086Db',
    status: 'Optimal',
    isPopular: false
  },
  {
    id: 'bep20',
    name: 'BNB Smart Chain (BEP-20)',
    short: 'BEP-20',
    icon: '🟡',
    badgeColor: '#F3BA2F',
    feeUsdt: 0.25,
    speed: '~45 secs',
    confirmations: '15 blocks',
    contract: '0x55d398326f99059fF775485246999027B3197955',
    defaultAddress: '0x8892Ea68b256885FaE69f109f4f38C982E2E6904',
    status: 'Optimal',
    isPopular: true
  },
  {
    id: 'sol',
    name: 'Solana (SPL)',
    short: 'SOL-SPL',
    icon: '🟣',
    badgeColor: '#14F195',
    feeUsdt: 0.08,
    speed: '~10-20 secs',
    confirmations: '32 slots',
    contract: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    defaultAddress: '8wJ1rMvQz5B3G34kR79nN1L5rF6YmU7QeX2tK4v9P0oL',
    status: 'High Speed',
    isPopular: false
  },
  {
    id: 'polygon',
    name: 'Polygon (PoS)',
    short: 'POL-USDT',
    icon: '🟣',
    badgeColor: '#8247E5',
    feeUsdt: 0.15,
    speed: '~1 min',
    confirmations: '64 blocks',
    contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    defaultAddress: '0x3F65b26713916CE79f04Fc75F119C08D237A8119',
    status: 'Optimal',
    isPopular: false
  }
];

export const FIAT_CURRENCIES = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    rateToUsdt: 89.45, // 1 USDT = 89.45 INR
    deskSpreadBps: 12,
    paymentMethods: ['IMPS Instant', 'RTGS (High Value)', 'NEFT', 'Bank Account Transfer'],
    minTrade: 50000,
    maxTrade: 100000000
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    rateToUsdt: 1.0002, // 1 USDT = 1.0002 USD
    deskSpreadBps: 8,
    paymentMethods: ['Fedwire', 'ACH Transfer', 'SWIFT Wire', 'Silvergate SEN Alternative'],
    minTrade: 10000,
    maxTrade: 5000000
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    rateToUsdt: 0.9220, // 1 EUR = 1.0845 USDT
    deskSpreadBps: 12,
    paymentMethods: ['SEPA Instant', 'SEPA Standard', 'SWIFT Euro', 'Revolut Pay'],
    minTrade: 10000,
    maxTrade: 5000000
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    rateToUsdt: 0.7895, // 1 GBP = 1.2666 USDT
    deskSpreadBps: 14,
    paymentMethods: ['UK Faster Payments', 'CHAPS', 'BACS', 'SWIFT GBP'],
    minTrade: 10000,
    maxTrade: 3000000
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    flag: '🇦🇪',
    rateToUsdt: 3.6730, // 1 USDT = 3.6730 AED
    deskSpreadBps: 10,
    paymentMethods: ['UAE Local Wire (FTS)', 'Dubai Islamic Bank Direct', 'Mashreq Neo', 'Cash Desk Dubai Marina'],
    minTrade: 35000,
    maxTrade: 20000000
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    rateToUsdt: 1.3420,
    deskSpreadBps: 12,
    paymentMethods: ['FAST Instant (MAS)', 'MEPS+', 'PayNow Corporate', 'SWIFT SGD'],
    minTrade: 15000,
    maxTrade: 5000000
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    rateToUsdt: 1.3810,
    deskSpreadBps: 15,
    paymentMethods: ['Interac e-Transfer', 'EFT / Wire', 'Large Value Transfer System (LVTS)'],
    minTrade: 15000,
    maxTrade: 5000000
  }
];

export const INITIAL_MERCHANTS = [
  {
    id: 'm-inr-1',
    name: 'Bharat Prime Institutional Desk',
    badge: 'Tier 1 Verified Desk',
    isDesk: true,
    rating: 100,
    completedTrades: 16420,
    completionRate: '99.9%',
    avgSpeed: '1.5 mins',
    fiatCode: 'INR',
    type: 'SELL', // Selling USDT to user
    unitPrice: 89.48,
    minLimitUsdt: 500,
    maxLimitUsdt: 250000,
    availableUsdt: 5800000,
    paymentMethods: ['RTGS (High Value)', 'IMPS Instant', 'Bank Account Transfer'],
    chains: ['TRC-20', 'BEP-20', 'ERC-20', 'SOL-SPL'],
    terms: 'Institutional Indian desk execution with guaranteed fixed rate. Direct RTGS/IMPS corporate rails. Instant automated smart escrow release.'
  },
  {
    id: 'm-1',
    name: 'Valence Institutional Prime Desk',
    badge: 'Tier 1 Official Desk',
    isDesk: true,
    rating: 100,
    completedTrades: 12840,
    completionRate: '99.9%',
    avgSpeed: '1.8 mins',
    fiatCode: 'USD',
    type: 'SELL', // Selling USDT to user (User buys USDT)
    unitPrice: 1.0008,
    minLimitUsdt: 25000,
    maxLimitUsdt: 2500000,
    availableUsdt: 8420000,
    paymentMethods: ['Fedwire', 'SWIFT Wire', 'SEPA Instant'],
    chains: ['TRC-20', 'ERC-20', 'BEP-20', 'SOL-SPL'],
    terms: 'Institutional desk execution with guaranteed fixed rate. Funds released immediately upon receipt of Fedwire or SWIFT MT103 copy. 100% Escrow Guarantee backed by FDIC-insured segregated fiat accounts.'
  },
  {
    id: 'm-2',
    name: 'Cumberland Global Liquidity',
    badge: 'Institutional Desk',
    isDesk: true,
    rating: 99.8,
    completedTrades: 9420,
    completionRate: '99.8%',
    avgSpeed: '2.5 mins',
    fiatCode: 'USD',
    type: 'BUY', // Buying USDT from user (User sells USDT)
    unitPrice: 0.9994,
    minLimitUsdt: 50000,
    maxLimitUsdt: 3000000,
    availableUsdt: 5200000,
    paymentMethods: ['Fedwire', 'SWIFT Wire', 'ACH Transfer'],
    chains: ['TRC-20', 'ERC-20'],
    terms: 'Same-day fiat settlement for large blocks. Wire sent within 15 minutes of 19 Tron or 12 Ethereum confirmations. Clean corporate funds.'
  },
  {
    id: 'm-3',
    name: 'FalconX Europe Escrow Desk',
    badge: 'Regulated VASP',
    isDesk: true,
    rating: 99.6,
    completedTrades: 7850,
    completionRate: '99.7%',
    avgSpeed: '3.1 mins',
    fiatCode: 'EUR',
    type: 'SELL',
    unitPrice: 0.9235,
    minLimitUsdt: 10000,
    maxLimitUsdt: 1500000,
    availableUsdt: 3800000,
    paymentMethods: ['SEPA Instant', 'SEPA Standard', 'Revolut Pay'],
    chains: ['TRC-20', 'BEP-20', 'ERC-20'],
    terms: 'SEPA Instant transfers received within 10 seconds. Automated smart contract escrow release on verification.'
  },
  {
    id: 'm-4',
    name: 'Gulf Horizon OTC (Dubai Desk)',
    badge: 'DMCC Licensed Desk',
    isDesk: true,
    rating: 99.9,
    completedTrades: 6240,
    completionRate: '100%',
    avgSpeed: '2.0 mins',
    fiatCode: 'AED',
    type: 'SELL',
    unitPrice: 3.6745,
    minLimitUsdt: 20000,
    maxLimitUsdt: 5000000,
    availableUsdt: 9500000,
    paymentMethods: ['UAE Local Wire (FTS)', 'Dubai Islamic Bank Direct', 'Cash Desk Dubai Marina'],
    chains: ['TRC-20', 'ERC-20', 'SOL-SPL'],
    terms: 'Serving UAE & GCC high-net-worth clients. Office in Dubai Marina available for physical cash or instant local wire settlement. Instant TRC-20 transfer.'
  },
  {
    id: 'm-5',
    name: 'Indus Block Trader Pro',
    badge: 'Verified Merchant',
    isDesk: false,
    rating: 99.4,
    completedTrades: 4120,
    completionRate: '99.5%',
    avgSpeed: '3.8 mins',
    fiatCode: 'INR',
    type: 'SELL',
    unitPrice: 87.75,
    minLimitUsdt: 5000,
    maxLimitUsdt: 100000,
    availableUsdt: 450000,
    paymentMethods: ['RTGS (High Value)', 'IMPS Instant', 'Bank Account Transfer'],
    chains: ['TRC-20', 'BEP-20'],
    terms: 'Strict KYC compliance. Only corporate & self-verified bank accounts accepted. Fast release within 5 minutes of RTGS credit.'
  },
  {
    id: 'm-6',
    name: 'Mayfair Wealth Escrow UK',
    badge: 'FCA Compliant Entity',
    isDesk: true,
    rating: 99.7,
    completedTrades: 3890,
    completionRate: '99.6%',
    avgSpeed: '2.2 mins',
    fiatCode: 'GBP',
    type: 'BUY',
    unitPrice: 0.7885,
    minLimitUsdt: 20000,
    maxLimitUsdt: 2000000,
    availableUsdt: 2900000,
    paymentMethods: ['UK Faster Payments', 'CHAPS High Value'],
    chains: ['TRC-20', 'ERC-20'],
    terms: 'Direct UK banking rails. Instant UK Faster Payments settlement directly into client solicitors or corporate accounts.'
  }
];

export const INITIAL_TRADE_HISTORY = [
  {
    id: 'OTC-99421',
    timestamp: '2026-09-27 12:45:10',
    type: 'BUY',
    side: 'BUY_USDT',
    amountUsdt: 150000,
    fiatAmount: 150030,
    fiatCode: 'USD',
    network: 'TRC-20',
    rate: 1.0002,
    counterparty: 'Valence Institutional Prime Desk',
    status: 'COMPLETED',
    txHash: '9a3f2c58e1b049d95f87b8d3f545acb879e6f4773a9089f2e347c6a9b4d81234',
    escrowId: 'ESC-4890-TRON',
    referenceCode: 'FED-20260927-VAL84',
    feeUsdt: 0
  },
  {
    id: 'OTC-99388',
    timestamp: '2026-09-27 10:14:22',
    type: 'SELL',
    side: 'SELL_USDT',
    amountUsdt: 500000,
    fiatAmount: 461000,
    fiatCode: 'EUR',
    network: 'ERC-20',
    rate: 0.9220,
    counterparty: 'FalconX Europe Escrow Desk',
    status: 'COMPLETED',
    txHash: '0x389b21a8d05e2634e2c240974b7dfa9386d914e6b2169bce05963f45ac9188f1',
    escrowId: 'ESC-4852-ETH',
    referenceCode: 'SEPA-INST-88320-EU',
    feeUsdt: 0
  },
  {
    id: 'OTC-99215',
    timestamp: '2026-09-26 16:32:05',
    type: 'BUY',
    side: 'BUY_USDT',
    amountUsdt: 75000,
    fiatAmount: 275475,
    fiatCode: 'AED',
    network: 'TRC-20',
    rate: 3.6730,
    counterparty: 'Gulf Horizon OTC (Dubai Desk)',
    status: 'COMPLETED',
    txHash: '4e99f18a2430bc872517ea55b99cd362a71bf64010e9803b9b008d72e7314567',
    escrowId: 'ESC-4781-TRON',
    referenceCode: 'FTS-DXB-99120',
    feeUsdt: 0
  },
  {
    id: 'OTC-99104',
    timestamp: '2026-09-25 18:20:44',
    type: 'BUY',
    side: 'BUY_USDT',
    amountUsdt: 250000,
    fiatAmount: 250050,
    fiatCode: 'USD',
    network: 'BEP-20',
    rate: 1.0002,
    counterparty: 'Valence Institutional Prime Desk',
    status: 'COMPLETED',
    txHash: '0x17b43b6ef94829370129bc837e8c1097fa64821a80d738f625418b7625ec991a',
    escrowId: 'ESC-4699-BSC',
    referenceCode: 'FED-20260925-VAL19',
    feeUsdt: 0
  }
];

export const INITIAL_DESK_RFQS = [
  {
    id: 'RFQ-7821',
    client: 'Apex Alpha Capital Ltd',
    tier: 'Tier 3 Institutional',
    type: 'BUY',
    amountUsdt: 750000,
    fiatCode: 'USD',
    requestedNetwork: 'TRC-20',
    quoteRate: 1.0005,
    spreadBps: 10,
    timestamp: 'Just now',
    timeLeftSeconds: 42,
    status: 'PENDING_APPROVAL'
  },
  {
    id: 'RFQ-7820',
    client: 'Nordic Horizon Treasury',
    tier: 'Tier 3 Institutional',
    type: 'SELL',
    amountUsdt: 300000,
    fiatCode: 'EUR',
    requestedNetwork: 'ERC-20',
    quoteRate: 0.9215,
    spreadBps: 12,
    timestamp: '2m ago',
    timeLeftSeconds: 24,
    status: 'PENDING_APPROVAL'
  }
];

export const USER_WALLET_BALANCES = {
  totalUsdt: 348500.00,
  breakdown: {
    trc20: 195000.00,
    erc20: 82000.00,
    bep20: 45000.00,
    sol: 26500.00,
    polygon: 0.00
  },
  fiatEquivUsd: 348569.70,
  lockedInEscrow: 0.00
};
