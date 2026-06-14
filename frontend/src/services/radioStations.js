// NOAA Weather Radio stations with live MP3 streams from radio.weatherusa.net
// Each entry includes state for auto-tuning by alert area.
export const STATIONS = [
  { state: 'AL', city: 'Mobile',              callsign: 'KEC61',  url: 'https://radio.weatherusa.net/NWR/KEC61_2.mp3' },
  { state: 'AZ', city: 'Yuma',                callsign: 'WXL87',  url: 'https://radio.weatherusa.net/NWR/WXL87.mp3' },
  { state: 'CA', city: 'Apple Valley',         callsign: 'WXM66',  url: 'https://radio.weatherusa.net/NWR/WXM66.mp3' },
  { state: 'CA', city: 'Coachella',            callsign: 'KIG78',  url: 'https://radio.weatherusa.net/NWR/KIG78_2.mp3' },
  { state: 'CA', city: 'Fresno',               callsign: 'KIH62',  url: 'https://radio.weatherusa.net/NWR/KIH62_2.mp3' },
  { state: 'CA', city: 'San Diego',            callsign: 'KEC62',  url: 'https://radio.weatherusa.net/NWR/KEC62_2.mp3' },
  { state: 'CO', city: 'Durango',              callsign: 'KWN54',  url: 'https://radio.weatherusa.net/NWR/KWN54.mp3' },
  { state: 'FL', city: 'Baton Rouge',          callsign: 'KHB46',  url: 'https://radio.weatherusa.net/NWR/KHB46.mp3' },
  { state: 'GA', city: 'Columbus',             callsign: 'WXM32',  url: 'https://radio.weatherusa.net/NWR/WXM32.mp3' },
  { state: 'IA', city: 'Des Moines',           callsign: 'WXL57',  url: 'https://radio.weatherusa.net/NWR/WXL57.mp3' },
  { state: 'IL', city: 'Dixon',                callsign: 'KZZ55',  url: 'https://radio.weatherusa.net/NWR/KZZ55.mp3' },
  { state: 'IL', city: 'Plano',                callsign: 'KXI58',  url: 'https://radio.weatherusa.net/NWR/KXI58.mp3' },
  { state: 'IL', city: 'Springfield',          callsign: 'WXJ75',  url: 'https://radio.weatherusa.net/NWR/WXJ75.mp3' },
  { state: 'LA', city: 'Lafayette',            callsign: 'WXK80',  url: 'https://radio.weatherusa.net/NWR/WXK80.mp3' },
  { state: 'LA', city: 'Monroe',               callsign: 'WXJ96',  url: 'https://radio.weatherusa.net/NWR/WXJ96_2.mp3' },
  { state: 'MA', city: 'Boston',               callsign: 'KHB35',  url: 'https://radio.weatherusa.net/NWR/KHB35_3.mp3' },
  { state: 'MA', city: 'Gloucester',           callsign: 'WNG574', url: 'https://radio.weatherusa.net/NWR/WNG574.mp3' },
  { state: 'MD', city: 'Baltimore',            callsign: 'KEC83',  url: 'https://radio.weatherusa.net/NWR/KEC83_3.mp3' },
  { state: 'ME', city: 'Portland',             callsign: 'KDO95',  url: 'https://radio.weatherusa.net/NWR/KDO95.mp3' },
  { state: 'MI', city: 'Detroit',              callsign: 'KEC63',  url: 'https://radio.weatherusa.net/NWR/KEC63.mp3' },
  { state: 'MI', city: 'West Olive',           callsign: 'WXN99',  url: 'https://radio.weatherusa.net/NWR/WXN99.mp3' },
  { state: 'MN', city: 'Clearwater',           callsign: 'WNG676', url: 'https://radio.weatherusa.net/NWR/WNG676.mp3' },
  { state: 'MN', city: 'Minneapolis',          callsign: 'KEC65',  url: 'https://radio.weatherusa.net/NWR/KEC65.mp3' },
  { state: 'MO', city: 'Kansas City',          callsign: 'KID77',  url: 'https://radio.weatherusa.net/NWR/KID77_3.mp3' },
  { state: 'MS', city: 'Tupelo',               callsign: 'KIH53',  url: 'https://radio.weatherusa.net/NWR/KIH53.mp3' },
  { state: 'NE', city: 'Beatrice',             callsign: 'KZZ69',  url: 'https://radio.weatherusa.net/NWR/KZZ69.mp3' },
  { state: 'NE', city: 'Omaha',                callsign: 'KIH61',  url: 'https://radio.weatherusa.net/NWR/KIH61.mp3' },
  { state: 'NM', city: 'Farmington',           callsign: 'WXJ37',  url: 'https://radio.weatherusa.net/NWR/WXJ37.mp3' },
  { state: 'NV', city: 'Fernley',              callsign: 'WWG20',  url: 'https://radio.weatherusa.net/NWR/WWG20.mp3' },
  { state: 'NV', city: 'Reno',                 callsign: 'WXK58',  url: 'https://radio.weatherusa.net/NWR/WXK58.mp3' },
  { state: 'NY', city: 'Buffalo',              callsign: 'KEB98',  url: 'https://radio.weatherusa.net/NWR/KEB98.mp3' },
  { state: 'NY', city: 'Highland',             callsign: 'WXL37',  url: 'https://radio.weatherusa.net/NWR/WXL37.mp3' },
  { state: 'NY', city: 'Middleville',          callsign: 'WXM45',  url: 'https://radio.weatherusa.net/NWR/WXM45.mp3' },
  { state: 'OH', city: 'Akron',                callsign: 'KDO94',  url: 'https://radio.weatherusa.net/NWR/KDO94.mp3' },
  { state: 'OH', city: 'Columbus',             callsign: 'KIG86',  url: 'https://radio.weatherusa.net/NWR/KIG86.mp3' },
  { state: 'OK', city: 'Lawton',               callsign: 'WXK86',  url: 'https://radio.weatherusa.net/NWR/WXK86.mp3' },
  { state: 'OK', city: 'Oklahoma City',        callsign: 'WXK85',  url: 'https://radio.weatherusa.net/NWR/WXK85.mp3' },
  { state: 'PA', city: 'Philadelphia',         callsign: 'KIH28',  url: 'https://radio.weatherusa.net/NWR/KIH28_3.mp3' },
  { state: 'PA', city: 'Pittsburgh',           callsign: 'KIH35',  url: 'https://radio.weatherusa.net/NWR/KIH35.mp3' },
  { state: 'TN', city: 'Bristol',              callsign: 'WXK47',  url: 'https://radio.weatherusa.net/NWR/WXK47_2.mp3' },
  { state: 'TN', city: 'Shelbyville',          callsign: 'WXK63',  url: 'https://radio.weatherusa.net/NWR/WXK63.mp3' },
  { state: 'TN', city: 'White House',          callsign: 'KIG79',  url: 'https://radio.weatherusa.net/NWR/KIG79_2.mp3' },
  { state: 'TX', city: 'Amarillo',             callsign: 'WXK38',  url: 'https://radio.weatherusa.net/NWR/WXK38_2.mp3' },
  { state: 'TX', city: 'College Station',      callsign: 'WXK30',  url: 'https://radio.weatherusa.net/NWR/WXK30.mp3' },
  { state: 'TX', city: 'Corpus Christi',       callsign: 'KHB41',  url: 'https://radio.weatherusa.net/NWR/KHB41_2.mp3' },
  { state: 'TX', city: 'Corsicana',            callsign: 'KXI87',  url: 'https://radio.weatherusa.net/NWR/KXI87.mp3' },
  { state: 'TX', city: 'Dallas',               callsign: 'KEC56',  url: 'https://radio.weatherusa.net/NWR/KEC56_3.mp3' },
  { state: 'TX', city: 'Fort Worth',           callsign: 'KEC55',  url: 'https://radio.weatherusa.net/NWR/KEC55_2.mp3' },
  { state: 'TX', city: 'Galveston',            callsign: 'KHB40',  url: 'https://radio.weatherusa.net/NWR/KHB40.mp3' },
  { state: 'TX', city: 'Houston',              callsign: 'KGG68',  url: 'https://radio.weatherusa.net/NWR/KGG68.mp3' },
  { state: 'TX', city: 'Lufkin',               callsign: 'WXK23',  url: 'https://radio.weatherusa.net/NWR/WXK23.mp3' },
  { state: 'TX', city: 'Odessa',               callsign: 'WXK32',  url: 'https://radio.weatherusa.net/NWR/WXK32.mp3' },
  { state: 'TX', city: 'Tyler',                callsign: 'WXK36',  url: 'https://radio.weatherusa.net/NWR/WXK36_2.mp3' },
  { state: 'VA', city: 'Emporia',              callsign: 'WWG33',  url: 'https://radio.weatherusa.net/NWR/AKQ.mp3' },
  { state: 'VA', city: 'Roanoke',              callsign: 'WXL60',  url: 'https://radio.weatherusa.net/NWR/WXL60.mp3' },
  { state: 'VA', city: 'Virginia Beach',       callsign: 'KHB37',  url: 'https://radio.weatherusa.net/NWR/KHB37_3.mp3' },
  { state: 'WA', city: 'Davis Peak',           callsign: 'WNG604', url: 'https://radio.weatherusa.net/NWR/WNG604_2.mp3' },
  { state: 'WA', city: 'Richland',             callsign: 'WWF56',  url: 'https://radio.weatherusa.net/NWR/WWF56_2.mp3' },
  { state: 'WI', city: 'Menomonie',            callsign: 'WXJ88',  url: 'https://radio.weatherusa.net/NWR/WXJ88.mp3' },
  { state: 'WI', city: 'Winona',               callsign: 'KGG95',  url: 'https://radio.weatherusa.net/NWR/KGG95.mp3' },
  { state: 'WV', city: 'Parkersburg',          callsign: 'WXM70',  url: 'https://radio.weatherusa.net/NWR/KWN75.mp3' },
  { state: 'WY', city: 'Lander',               callsign: 'WXM61',  url: 'https://radio.weatherusa.net/NWR/WXM61.mp3' },
];

// Extract 2-letter state codes from NOAA areaDesc (e.g. "Colbert, AL; Franklin, AL")
function statesFromAreaDesc(areaDesc) {
  if (!areaDesc) return [];
  const matches = areaDesc.match(/\b([A-Z]{2})\b/g) || [];
  return [...new Set(matches)];
}

// Find best matching station for an alert
export function stationForAlert(alert) {
  const p = alert?.properties || {};
  const states = statesFromAreaDesc(p.areaDesc);
  if (!states.length) return null;
  // Return first station matching any affected state
  return STATIONS.find(s => states.includes(s.state)) || null;
}
