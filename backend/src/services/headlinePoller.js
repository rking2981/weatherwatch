const fetch = require('node-fetch');
const store = require('./store');

const HEADERS = { 'User-Agent': 'WeatherWather/1.0 (ryan.king3481@gmail.com)' };

// NWS office -> state mapping (major offices)
const OFFICE_STATE = {
  KBMX:'AL',KHSV:'AL',KMOB:'AL',KFAI:'AK',PAFC:'AK',KFGZ:'AZ',KPSR:'AZ',
  KLZK:'AR',KLOT:'IL',KILX:'IL',KIND:'IN',KIWX:'IN',KDMX:'IA',KDVN:'IA',
  KTOP:'KS',KICT:'KS',KLMK:'KY',KPAH:'KY',KLIX:'LA',KSHV:'LA',KGYX:'ME',
  KLWX:'MD',KBOX:'MA',KDTX:'MI',KAPX:'MI',KMPX:'MN',KDLH:'MN',KJAN:'MS',
  Ksgf:'MO',KSGF:'MO',KEAX:'MO',KBOU:'CO',KPUB:'CO',KGLD:'CO',KGJT:'CO',
  KBYZ:'MT',KTFX:'MT',KGID:'NE',KLBF:'NE',KVEF:'NV',KRNO:'NV',KGYX:'NH',
  KPHI:'NJ',KABQ:'NM',KEPZ:'NM',KBGM:'NY',KBUF:'NY',KOKX:'NY',KALY:'NY',
  KRAH:'NC',KMHX:'NC',KFGF:'ND',KBIS:'ND',KCLE:'OH',KILN:'OH',KTSA:'OK',
  KOUN:'OK',KPDT:'OR',KPQR:'OR',KPBZ:'PA',KPHC:'PA',KBOX:'RI',KCAE:'SC',
  KFSD:'SD',KABR:'SD',KMRX:'TN',KOHX:'TN',KEWX:'TX',KHGX:'TX',KLUB:'TX',
  KAMA:'TX',KFWD:'TX',KSJT:'TX',KBRO:'TX',KSLC:'UT',KBTV:'VT',KAKQ:'VA',
  KRNK:'VA',KSEW:'WA',KOTX:'WA',KRLX:'WV',KMKX:'WI',KARX:'WI',KRIW:'WY',
  KCYS:'WY',KEAX:'MO',KSGF:'MO',
};

// Product types to try, in priority order
const PRODUCT_TYPES = ['PNS', 'SPS'];

let cachedHeadline = null;
let lastFetchedOffices = '';

// Extract the most impact-relevant sentence from raw product text
function extractHeadline(text) {
  if (!text) return null;

  // Strip NWS header boilerplate (everything before first double-newline after the header)
  const body = text.replace(/^[\s\S]*?\n\n/, '').trim();

  // Split into sentences
  const sentences = body
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);

  // Keywords that indicate impact sentences worth surfacing
  const IMPACT_PATTERNS = [
    /without power/i,
    /power outage/i,
    /\d[\d,]+\s+(?:customers?|homes?|residents?)/i,
    /damage/i,
    /injuries?|fatalities?|deaths?/i,
    /\d+\s*mph/i,
    /tornado/i,
    /destructive/i,
    /emergency/i,
    /life.threatening/i,
    /catastrophic/i,
  ];

  for (const pattern of IMPACT_PATTERNS) {
    const match = sentences.find(s => pattern.test(s));
    if (match) return match.replace(/\s+/g, ' ').trim();
  }

  // Fallback: first substantive sentence
  return sentences[0] || null;
}

async function fetchProductText(id) {
  try {
    const res = await fetch(`https://api.weather.gov/products/${id}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    return data.productText || null;
  } catch { return null; }
}

async function poll() {
  try {
    // Get unique states from active alerts
    const alerts = store.getAlerts();
    const states = [...new Set(
      alerts.flatMap(a => {
        const area = a.properties?.areaDesc || '';
        return (area.match(/\b([A-Z]{2})\b/g) || []);
      })
    )];

    if (states.length === 0) {
      cachedHeadline = null;
      return;
    }

    const stateKey = states.sort().join(',');
    // Skip re-fetch if active states haven't changed
    if (stateKey === lastFetchedOffices && cachedHeadline) return;
    lastFetchedOffices = stateKey;

    // Find NWS offices that serve active alert states
    const activeOffices = [...new Set(
      Object.entries(OFFICE_STATE)
        .filter(([, st]) => states.includes(st))
        .map(([office]) => office)
    )];

    for (const type of PRODUCT_TYPES) {
      for (const office of activeOffices) {
        const listRes = await fetch(
          `https://api.weather.gov/products?type=${type}&issuingOffice=${office}&limit=3`,
          { headers: HEADERS }
        );
        if (!listRes.ok) continue;
        const listData = await listRes.json();
        const products = listData['@graph'] || [];

        for (const product of products) {
          // Only use products issued in the last 3 hours
          const age = Date.now() - new Date(product.issuanceTime).getTime();
          if (age > 3 * 60 * 60 * 1000) continue;

          const text = await fetchProductText(product.id);
          const headline = extractHeadline(text);
          if (headline) {
            cachedHeadline = headline;
            console.log(`[headline] ${type}/${office}: ${headline.slice(0, 80)}...`);
            return;
          }
        }
      }
    }

    // No suitable product found — clear
    cachedHeadline = null;
  } catch (err) {
    console.error('[headline] Error:', err.message);
  }
}

function getHeadline() { return cachedHeadline; }

module.exports = { poll, getHeadline };
