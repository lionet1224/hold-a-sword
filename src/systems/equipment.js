import {
  QUALITY, AFFIX_POOL, EQUIP_SLOT_NAMES,
  ENHANCE_SUCCESS_RATE, ENHANCE_DROP_LEVELS,
  ENHANCE_BONUS_PER_LEVEL, ENHANCE_COST_BASE,
} from '../data/config';
import { rand, randInt, weightedRandom } from '../utils/random';

let equipIdCounter = Date.now();

function nextEquipId() {
  return `eq_${equipIdCounter++}`;
}

export function rollQuality() {
  const entries = Object.entries(QUALITY);
  const weights = entries.map(([, v]) => v.weight);
  const idx = weightedRandom(weights);
  return entries[idx][0];
}

export function rollAffixes(count, itemLevel = 1) {
  const pool = [...AFFIX_POOL];
  const result = [];
  const used = new Set();

  for (let i = 0; i < count; i++) {
    const available = pool.filter((a) => !used.has(a.id));
    if (available.length === 0) break;

    const affix = available[randInt(0, available.length - 1)];
    used.add(affix.id);

    const min = affix.min + Math.floor(affix.perLevel * itemLevel);
    const max = affix.max + Math.floor(affix.perLevel * itemLevel);
    const value = randInt(min, max);

    result.push({ id: affix.id, name: affix.name, value });
  }

  return result;
}

export function generateEquip(template, dungeonLevel = 1) {
  const quality = template.guaranteedQuality || rollQuality();
  const qualityCfg = QUALITY[quality];
  const [minAffix, maxAffix] = qualityCfg.affixCount;
  const affixCount = randInt(minAffix, maxAffix);

  const randomAffixes = rollAffixes(affixCount, dungeonLevel);

  return {
    id: nextEquipId(),
    name: template.name,
    slot: template.slot,
    setId: template.setId || null,
    quality,
    qualityName: qualityCfg.name,
    qualityColor: qualityCfg.color,
    fixedAffixes: template.fixedAffixes ? [...template.fixedAffixes.map((a) => {
      const def = AFFIX_POOL.find((p) => p.id === a.id);
      return { ...a, name: def ? def.name : a.id };
    })] : [],
    randomAffixes,
    enhanceLevel: 0,
    slotName: EQUIP_SLOT_NAMES[template.slot],
  };
}

export function enhanceEquip(equip, playerGold) {
  const level = equip.enhanceLevel || 0;
  if (level >= ENHANCE_SUCCESS_RATE.length) {
    return { success: false, reason: '已达最大强化等级', equip, cost: 0 };
  }

  const cost = Math.floor(ENHANCE_COST_BASE * (1 + level * 0.5));
  if (playerGold < cost) {
    return { success: false, reason: '金币不足', equip, cost: 0 };
  }

  const rate = ENHANCE_SUCCESS_RATE[level];
  const roll = rand();

  if (roll < rate) {
    equip.enhanceLevel = level + 1;
    return { success: true, newLevel: equip.enhanceLevel, cost, rate };
  }

  const drop = ENHANCE_DROP_LEVELS[level] || 0;
  equip.enhanceLevel = Math.max(0, level - drop);
  return { success: false, reason: '强化失败', newLevel: equip.enhanceLevel, dropped: drop, cost, rate };
}

export function getEnhanceCost(equip) {
  const level = equip.enhanceLevel || 0;
  return Math.floor(ENHANCE_COST_BASE * (1 + level * 0.5));
}

export function getEnhanceRate(equip) {
  const level = equip.enhanceLevel || 0;
  if (level >= ENHANCE_SUCCESS_RATE.length) return 0;
  return ENHANCE_SUCCESS_RATE[level];
}

export function formatEquip(equip) {
  const enhance = equip.enhanceLevel > 0 ? `+${equip.enhanceLevel}` : '';
  const enhanceMultiplier = 1 + (equip.enhanceLevel || 0) * ENHANCE_BONUS_PER_LEVEL;
  const lines = [];

  lines.push(`[${equip.qualityName}] ${equip.name}${enhance} (${equip.slotName})`);

  if (equip.setId) {
    lines.push(`  套装: ${equip.setId}`);
  }

  if (equip.fixedAffixes && equip.fixedAffixes.length > 0) {
    lines.push('  固定属性:');
    for (const a of equip.fixedAffixes) {
      const val = a.id.includes('Percent') ? a.value : Math.floor(a.value * enhanceMultiplier);
      const suffix = a.id.includes('Percent') || a.id === 'crit' || a.id === 'critDmg' ? '%' : '';
      lines.push(`    ${a.name} +${val}${suffix}`);
    }
  }

  if (equip.randomAffixes && equip.randomAffixes.length > 0) {
    lines.push('  随机属性:');
    for (const a of equip.randomAffixes) {
      const val = a.id.includes('Percent') ? a.value : Math.floor(a.value * enhanceMultiplier);
      const suffix = a.id.includes('Percent') || a.id === 'crit' || a.id === 'critDmg' ? '%' : '';
      lines.push(`    ${a.name} +${val}${suffix}`);
    }
  }

  return lines.join('\n');
}
