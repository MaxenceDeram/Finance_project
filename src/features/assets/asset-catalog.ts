export type CatalogAssetType = "STOCK" | "ETF" | "CRYPTO" | "INDEX" | "FUND" | "OTHER";

export type CatalogAsset = {
  symbol: string;
  name: string;
  assetType: CatalogAssetType;
  exchange: string;
  currency: string;
  sector: string;
  country: string;
  category: "Actions populaires" | "Cryptomonnaies populaires" | "ETF populaires";
  tags: string[];
  logoText: string;
  logoUrl?: string;
  logoClassName: string;
  description: string;
  isin: string;
  wkn: string;
  marketCap: string;
  peRatio: string;
  beta: string;
  dividendYield: string;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  open: number;
  previousClose: number;
  bid: number;
  ask: number;
  analystTarget: number;
  analystBuy: number;
  analystHold: number;
  analystSell: number;
  news: Array<{ title: string; time: string }>;
  events: Array<{ day: string; month: string; title: string; description: string }>;
  dividends: Array<{ date: string; amount: number }>;
};

export const assetCatalog: CatalogAsset[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetType: "STOCK",
    exchange: "NASDAQ",
    currency: "EUR",
    sector: "Electronics",
    country: "USA",
    category: "Actions populaires",
    tags: ["USA", "Electronics", "NASDAQ", "S&P 500"],
    logoText: "NV",
    logoUrl: "https://cdn.simpleicons.org/nvidia/000000",
    logoClassName: "bg-[#76b900] text-black",
    description:
      "NVIDIA Corporation develops accelerated computing platforms, graphics processors and AI infrastructure used in data centers, gaming, automotive and professional visualization.",
    isin: "US67066G1040",
    wkn: "918422",
    marketCap: "4,173 T",
    peRatio: "41,22",
    beta: "2,29",
    dividendYield: "0,02 %",
    dayLow: 169.84,
    dayHigh: 172.98,
    yearLow: 83.89,
    yearHigh: 183.2,
    open: 170.84,
    previousClose: 170.42,
    bid: 172.56,
    ask: 172.94,
    analystTarget: 225.17,
    analystBuy: 93,
    analystHold: 5,
    analystSell: 2,
    news: [
      {
        title: "NVIDIA annonce une nouvelle plateforme IA pour les centres de donnees",
        time: "il y a 6 heures"
      },
      {
        title: "Les fabricants de puces progressent avant les resultats trimestriels",
        time: "il y a 7 heures"
      },
      {
        title: "VAST Data leve de nouveaux fonds avec NVIDIA parmi les investisseurs",
        time: "il y a 7 heures"
      }
    ],
    events: [
      {
        day: "20",
        month: "mai",
        title: "Financials Release",
        description: "Publication des resultats trimestriels."
      },
      {
        day: "25",
        month: "juin",
        title: "Annual General Meeting",
        description: "Assemblee generale des actionnaires."
      },
      {
        day: "25",
        month: "aout",
        title: "Financials Release",
        description: "Publication des resultats semestriels."
      }
    ],
    dividends: [
      { date: "avr. 26", amount: 0.01 },
      { date: "dec. 25", amount: 0.01 },
      { date: "oct. 25", amount: 0.01 },
      { date: "juil. 25", amount: 0.01 }
    ]
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: "STOCK",
    exchange: "NASDAQ",
    currency: "EUR",
    sector: "Technology",
    country: "USA",
    category: "Actions populaires",
    tags: ["USA", "Technology", "NASDAQ", "Dow Jones"],
    logoText: "A",
    logoUrl: "https://cdn.simpleicons.org/apple/000000",
    logoClassName: "bg-white text-black",
    description:
      "Apple designs consumer electronics, software and services, including iPhone, Mac, iPad, wearables and subscription ecosystems.",
    isin: "US0378331005",
    wkn: "865985",
    marketCap: "2,91 T",
    peRatio: "29,14",
    beta: "1,18",
    dividendYield: "0,48 %",
    dayLow: 181.62,
    dayHigh: 186.43,
    yearLow: 162.8,
    yearHigh: 237.49,
    open: 183.1,
    previousClose: 182.66,
    bid: 184.4,
    ask: 184.9,
    analystTarget: 218.35,
    analystBuy: 68,
    analystHold: 26,
    analystSell: 6,
    news: [
      {
        title: "Apple progresse avec les valeurs technologiques americaines",
        time: "il y a 3 heures"
      },
      {
        title: "Les services continuent de soutenir les marges du groupe",
        time: "il y a 5 heures"
      }
    ],
    events: [
      {
        day: "02",
        month: "mai",
        title: "Financials Release",
        description: "Resultats trimestriels attendus."
      },
      {
        day: "09",
        month: "juin",
        title: "Developer Event",
        description: "Conference annuelle developpeurs."
      }
    ],
    dividends: [
      { date: "mai 26", amount: 0.25 },
      { date: "fev. 26", amount: 0.25 },
      { date: "nov. 25", amount: 0.24 }
    ]
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    assetType: "STOCK",
    exchange: "NASDAQ",
    currency: "EUR",
    sector: "Internet",
    country: "USA",
    category: "Actions populaires",
    tags: ["USA", "Internet", "NASDAQ", "S&P 500"],
    logoText: "a",
    logoUrl: "https://cdn.simpleicons.org/amazon/000000",
    logoClassName: "bg-[#ff9900] text-black",
    description:
      "Amazon operates e-commerce marketplaces, cloud infrastructure through AWS, advertising and digital subscription businesses.",
    isin: "US0231351067",
    wkn: "906866",
    marketCap: "1,97 T",
    peRatio: "35,80",
    beta: "1,32",
    dividendYield: "0,00 %",
    dayLow: 174.1,
    dayHigh: 180.45,
    yearLow: 139.15,
    yearHigh: 201.2,
    open: 176.2,
    previousClose: 175.4,
    bid: 178.3,
    ask: 178.88,
    analystTarget: 214.6,
    analystBuy: 88,
    analystHold: 10,
    analystSell: 2,
    news: [
      {
        title: "AWS reste au centre des attentes des analystes",
        time: "il y a 4 heures"
      },
      { title: "Amazon renforce son activite publicitaire", time: "il y a 8 heures" }
    ],
    events: [
      {
        day: "30",
        month: "avr.",
        title: "Financials Release",
        description: "Resultats du trimestre."
      }
    ],
    dividends: []
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    assetType: "CRYPTO",
    exchange: "CRYPTO",
    currency: "EUR",
    sector: "Digital Assets",
    country: "Global",
    category: "Cryptomonnaies populaires",
    tags: ["Crypto", "Paiements", "Reserve numerique"],
    logoText: "B",
    logoUrl: "https://cdn.simpleicons.org/bitcoin/FFFFFF",
    logoClassName: "bg-[#f7931a] text-white",
    description:
      "Bitcoin is a decentralized digital asset designed as a peer-to-peer monetary network with fixed issuance and global settlement.",
    isin: "CRYPTOBTC",
    wkn: "BTC",
    marketCap: "1,82 T",
    peRatio: "-",
    beta: "2,80",
    dividendYield: "0,00 %",
    dayLow: 60320,
    dayHigh: 62540,
    yearLow: 39100,
    yearHigh: 73880,
    open: 61020,
    previousClose: 60840,
    bid: 61980,
    ask: 62020,
    analystTarget: 72000,
    analystBuy: 70,
    analystHold: 22,
    analystSell: 8,
    news: [
      {
        title: "Le marche crypto se stabilise apres une semaine volatile",
        time: "il y a 2 heures"
      },
      {
        title: "Les flux ETF restent surveilles par les investisseurs",
        time: "il y a 6 heures"
      }
    ],
    events: [],
    dividends: []
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    assetType: "CRYPTO",
    exchange: "CRYPTO",
    currency: "EUR",
    sector: "Digital Assets",
    country: "Global",
    category: "Cryptomonnaies populaires",
    tags: ["Crypto", "DeFi", "Smart Contracts"],
    logoText: "E",
    logoUrl: "https://cdn.simpleicons.org/ethereum/FFFFFF",
    logoClassName: "bg-[#627eea] text-white",
    description:
      "Ethereum is a programmable blockchain network used for decentralized finance, applications, stablecoins and tokenized assets.",
    isin: "CRYPTOETH",
    wkn: "ETH",
    marketCap: "390 Md",
    peRatio: "-",
    beta: "2,55",
    dividendYield: "0,00 %",
    dayLow: 2940,
    dayHigh: 3110,
    yearLow: 1880,
    yearHigh: 4090,
    open: 3012,
    previousClose: 2998,
    bid: 3060,
    ask: 3065,
    analystTarget: 3800,
    analystBuy: 74,
    analystHold: 20,
    analystSell: 6,
    news: [
      { title: "Ethereum profite du regain d'activite DeFi", time: "il y a 5 heures" }
    ],
    events: [],
    dividends: []
  },
  {
    symbol: "SOL",
    name: "Solana",
    assetType: "CRYPTO",
    exchange: "CRYPTO",
    currency: "EUR",
    sector: "Digital Assets",
    country: "Global",
    category: "Cryptomonnaies populaires",
    tags: ["Crypto", "Layer 1", "Web3"],
    logoText: "S",
    logoUrl: "https://cdn.simpleicons.org/solana/000000",
    logoClassName: "bg-[#14f195] text-black",
    description:
      "Solana is a high-throughput blockchain ecosystem focused on low-latency applications, payments and consumer crypto experiences.",
    isin: "CRYPTOSOL",
    wkn: "SOL",
    marketCap: "82 Md",
    peRatio: "-",
    beta: "3,10",
    dividendYield: "0,00 %",
    dayLow: 132,
    dayHigh: 141,
    yearLow: 84,
    yearHigh: 206,
    open: 136,
    previousClose: 134,
    bid: 139,
    ask: 140,
    analystTarget: 168,
    analystBuy: 64,
    analystHold: 26,
    analystSell: 10,
    news: [
      {
        title: "Solana attire de nouveaux volumes sur les applications grand public",
        time: "il y a 9 heures"
      }
    ],
    events: [],
    dividends: []
  },
  {
    symbol: "CW8",
    name: "Amundi MSCI World UCITS ETF",
    assetType: "ETF",
    exchange: "EPA",
    currency: "EUR",
    sector: "Broad Market",
    country: "France",
    category: "ETF populaires",
    tags: ["ETF", "Monde", "MSCI World"],
    logoText: "CW",
    logoClassName: "bg-[#0f7a55] text-white",
    description:
      "CW8 tracks large and mid-cap equities across developed markets and is often used for long-term diversified exposure.",
    isin: "LU1681043599",
    wkn: "A2H59Q",
    marketCap: "ETF",
    peRatio: "-",
    beta: "1,00",
    dividendYield: "0,00 %",
    dayLow: 524,
    dayHigh: 531,
    yearLow: 445,
    yearHigh: 552,
    open: 526,
    previousClose: 525,
    bid: 529,
    ask: 530,
    analystTarget: 560,
    analystBuy: 80,
    analystHold: 18,
    analystSell: 2,
    news: [
      {
        title: "Les ETF Monde restent privilegies pour l'investissement long terme",
        time: "il y a 1 jour"
      }
    ],
    events: [],
    dividends: []
  }
];

export const catalogCategories = Array.from(
  new Set(assetCatalog.map((asset) => asset.category))
);

export function getCatalogAsset(symbol: string) {
  return assetCatalog.find((asset) => asset.symbol === symbol) ?? assetCatalog[0];
}
