const KNOWN_TICKERS = [
  // Forex majors & minors
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
  'EURAUD', 'EURCAD', 'EURCHF', 'GBPAUD', 'GBPCAD', 'GBPCHF',
  'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADCHF', 'NZDCAD', 'NZDCHF',
  // Metals & commodities
  'XAUUSD', 'XAGUSD', 'XTIUSD', 'USOIL', 'UKOIL', 'GOLD', 'SILVER',
  // Indices
  'US30', 'US500', 'NAS100', 'UK100', 'GER40', 'JPN225', 'AUS200',
  'SPX', 'NDX', 'DJI', 'VIX',
  // Crypto vs USD
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'BNBUSD', 'DOGEUSD',
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'BNB', 'DOGE',
  // US stocks
  'AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'GOOGL', 'GOOG', 'META',
  'AMD', 'NFLX', 'DIS', 'BABA', 'UBER', 'LYFT', 'SNAP', 'TWTR',
  'JPM', 'GS', 'BAC', 'WFC', 'C', 'MS',
]

const TICKER_RE = /\$([A-Z]{2,10})/g

/**
 * Extract up to 5 tickers from a piece of text.
 * Matches both $TICKER notation and a known-ticker list.
 */
export function extractTickers(text: string): string[] {
  const found = new Set<string>()

  // Explicit $TICKER notation
  for (const m of text.matchAll(TICKER_RE)) {
    found.add(m[1])
  }

  // Known tickers mentioned inline
  const upper = text.toUpperCase()
  for (const t of KNOWN_TICKERS) {
    if (found.size >= 5) break
    if (upper.includes(t)) found.add(t)
  }

  return [...found].slice(0, 5)
}

/**
 * Detect a news category from a headline string.
 */
export function detectNewsCategory(text: string): string {
  const h = text.toLowerCase()
  if (/bitcoin|ethereum|crypto|btc|eth|defi|nft|blockchain|solana|ripple|xrp/.test(h)) return 'crypto'
  if (/forex|currency|\beur\b|\bgbp\b|\bjpy\b|\bcad\b|\bchf\b|\bnzd\b|\baud\b|exchange rate|interest rate|central bank|fed |ecb |boj |rba |boe /.test(h)) return 'forex'
  if (/stock|equity|nasdaq|s&p 500|dow jones|nyse|earnings|ipo|shares|dividend/.test(h)) return 'markets'
  return 'global'
}
