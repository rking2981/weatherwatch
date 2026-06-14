// Safety guidance per NWS event type.
// Each entry: { icon, heading, steps[] }
const ACTIONS = {
  'Tornado Warning': {
    icon: '🌪',
    heading: 'TAKE SHELTER NOW',
    steps: [
      'Go to lowest floor — interior room, away from windows',
      'Bathrooms, closets, or under stairs are best',
      'Cover yourself with mattress or heavy blankets',
      'DO NOT stay in a mobile home — find a sturdy building',
      'If outside, lie flat in a ditch — never under a bridge',
      'Stay until warning expires and all-clear is given',
    ],
  },
  'Tornado Watch': {
    icon: '🌪',
    heading: 'BE READY TO SHELTER',
    steps: [
      'Conditions are favorable for tornadoes — stay alert',
      'Know where your shelter spot is in advance',
      'Monitor weather radio or this app for warnings',
      'Charge devices and keep shoes on',
      'Prepare to move to shelter within seconds of a warning',
    ],
  },
  'Severe Thunderstorm Warning': {
    icon: '⛈',
    heading: 'SEEK SHELTER INDOORS',
    steps: [
      'Get inside a sturdy building immediately',
      'Stay away from windows — large hail can break glass',
      'Unplug sensitive electronics',
      'Do not use corded phones or plumbing during lightning',
      'Pull vehicles into a garage if time permits',
      'Wait 30 minutes after last thunder before going back out',
    ],
  },
  'Severe Thunderstorm Watch': {
    icon: '⛈',
    heading: 'MONITOR CONDITIONS',
    steps: [
      'Severe thunderstorms are possible — stay weather-aware',
      'Postpone outdoor activities if storms approach',
      'Know the nearest sturdy shelter',
      'Secure loose outdoor objects that could become projectiles',
      'Keep weather radio or app open for warnings',
    ],
  },
  'Flash Flood Warning': {
    icon: '🌊',
    heading: 'MOVE TO HIGHER GROUND',
    steps: [
      'TURN AROUND — NEVER drive through flooded roads',
      'Just 6 inches of moving water can knock you down',
      '2 feet of water can sweep away most vehicles',
      'Move away from streams, rivers, and drainage channels',
      'If trapped in rising water, move to the roof — call 911',
      'Do not return home until officials declare it safe',
    ],
  },
  'Flash Flood Watch': {
    icon: '🌊',
    heading: 'PREPARE FOR FLOODING',
    steps: [
      'Flash flooding is possible — know your escape routes',
      'Move valuables and documents to upper floors',
      'Avoid low-lying areas, underpasses, and drainage basins',
      'Do not park near streams or flood-prone areas',
      'Monitor local water levels and this app',
    ],
  },
  'Flood Warning': {
    icon: '🌊',
    heading: 'AVOID FLOOD AREAS',
    steps: [
      'Do not drive through flooded roads — turn around',
      'Stay away from rivers, streams, and creeks',
      'Follow evacuation orders immediately if issued',
      'Move important belongings above anticipated flood level',
      'Be aware water may rise quickly — stay on high ground',
    ],
  },
  'Flood Watch': {
    icon: '🌊',
    heading: 'PREPARE NOW',
    steps: [
      'Flooding is possible — prepare an emergency kit',
      'Know your evacuation route and shelter locations',
      'Move vehicles away from flood-prone parking',
      'Check on elderly neighbors who may need help',
    ],
  },
  'Hurricane Warning': {
    icon: '🌀',
    heading: 'EVACUATE OR SHELTER',
    steps: [
      'Follow ALL evacuation orders — do not wait',
      'If sheltering in place, stay in an interior room',
      'Board windows or use hurricane shutters',
      'Store 3+ days of water and food per person',
      'Charge devices and fill gas tank NOW',
      'Stay indoors during the eye — the storm will resume',
    ],
  },
  'Hurricane Watch': {
    icon: '🌀',
    heading: 'PREPARE IMMEDIATELY',
    steps: [
      'Hurricane conditions possible within 48 hours',
      'Complete all preparations now — time is short',
      'Know your evacuation zone and route',
      'Assemble emergency kit: water, food, meds, documents',
      'Fuel up vehicles and fill prescriptions',
    ],
  },
  'Winter Storm Warning': {
    icon: '❄',
    heading: 'STAY OFF ROADS',
    steps: [
      'Avoid all unnecessary travel',
      'If you must drive, pack emergency supplies in your car',
      'Keep extra blankets, food, and water at home',
      'Dress in warm layers if you must go outside',
      'Check on elderly neighbors and pets',
      'Know signs of hypothermia and frostbite',
    ],
  },
  'Blizzard Warning': {
    icon: '❄',
    heading: 'DO NOT GO OUTSIDE',
    steps: [
      'Stay indoors — blizzard conditions are life-threatening',
      'If stranded in a vehicle, stay with it and call for help',
      'Run engine sparingly for heat — check exhaust pipe for snow',
      'Do not overexert shoveling — heart attacks are a risk',
      'Keep emergency kit: blankets, water, flashlight, phone charger',
    ],
  },
  'Extreme Wind Warning': {
    icon: '💨',
    heading: 'TAKE COVER NOW',
    steps: [
      'Extreme winds can cause catastrophic damage',
      'Go to an interior room on the lowest floor',
      'Stay away from windows and glass doors',
      'Do not go outside until the warning expires',
      'Secure or bring in all outdoor objects immediately',
    ],
  },
  'Dust Storm Warning': {
    icon: '🌫',
    heading: 'PULL OVER AND WAIT',
    steps: [
      'If driving, pull completely off the road and stop',
      'Turn off all lights so others don\'t follow you',
      'Keep engine running with A/C on recirculate',
      'Stay in the vehicle until the storm passes',
      'If outside, cover nose and mouth — dust can cause illness',
    ],
  },
  'Tsunami Warning': {
    icon: '🌊',
    heading: 'MOVE INLAND NOW',
    steps: [
      'Move immediately to high ground or inland',
      'Do not wait for official evacuation orders',
      'Do not go to the coast to watch the wave',
      'A tsunami is a SERIES of waves — wait for all-clear',
      'Stay away from flooded areas until officials say it\'s safe',
    ],
  },
  'Heat Advisory': {
    icon: '🌡',
    heading: 'STAY COOL',
    steps: [
      'Stay in air-conditioned spaces during peak heat hours',
      'Drink water frequently even if not thirsty',
      'Never leave children or pets in parked vehicles',
      'Wear lightweight, light-colored, loose-fitting clothing',
      'Check on elderly neighbors and those without AC',
      'Know signs of heat exhaustion and heat stroke',
    ],
  },
  'Excessive Heat Warning': {
    icon: '🌡',
    heading: 'DANGEROUS HEAT',
    steps: [
      'This heat is life-threatening — limit ALL outdoor exposure',
      'Stay in AC — visit a cooling center if you don\'t have it',
      'Drink water constantly — avoid alcohol and caffeine',
      'Never leave anyone in a parked car — temperatures are fatal',
      'Call 911 for heat stroke: hot, dry skin and confusion',
    ],
  },
};

const FALLBACK = {
  Extreme: {
    icon: '⚠',
    heading: 'TAKE IMMEDIATE ACTION',
    steps: [
      'This is an EXTREME threat — follow all official guidance',
      'Move away from the hazard area immediately',
      'Seek shelter in a sturdy interior location',
      'Monitor all official channels for updates',
      'Do not return until authorities give the all-clear',
    ],
  },
  Severe: {
    icon: '⚠',
    heading: 'TAKE PROTECTIVE ACTION',
    steps: [
      'Seek shelter in a sturdy building immediately',
      'Stay away from windows and exterior walls',
      'Monitor weather radio and official channels',
      'Avoid outdoor activities until the threat passes',
    ],
  },
};

export function getSafetyActions(event, severity) {
  if (ACTIONS[event]) return ACTIONS[event];
  if (severity === 'Extreme' || severity === 'Severe') return FALLBACK[severity] || FALLBACK.Severe;
  return null;
}
