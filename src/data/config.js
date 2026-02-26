export const VERSION = '1.0';

export const MAX_LEVEL = 20;

export const EXP_TABLE = (() => {
  const table = [0];
  for (let i = 1; i <= 100; i++) {
    table[i] = Math.floor(50 * i * (1 + i * 0.3));
  }
  return table;
})();

export const EQUIP_SLOTS = ['weapon', 'armor', 'helmet', 'ring', 'necklace'];

export const EQUIP_SLOT_NAMES = {
  weapon: '武器',
  armor: '衣服',
  helmet: '帽子',
  ring: '戒指',
  necklace: '项链',
};

export const QUALITY = {
  white: { name: '普通', color: '#aaa', weight: 40, affixCount: [1, 2] },
  green: { name: '优秀', color: '#2d8f2d', weight: 30, affixCount: [2, 3] },
  blue: { name: '精良', color: '#2656c9', weight: 18, affixCount: [3, 4] },
  purple: { name: '史诗', color: '#a0f', weight: 9, affixCount: [3, 5] },
  orange: { name: '传说', color: '#f80', weight: 3, affixCount: [4, 5] },
};

export const SELL_PRICE = {
  white: 5,
  green: 15,
  blue: 50,
  purple: 150,
  orange: 500,
};

export const BASE_STATS = {
  hp: { name: '生命', base: 100, perLevel: 20 },
  atk: { name: '攻击', base: 10, perLevel: 3 },
  def: { name: '防御', base: 5, perLevel: 2 },
  speed: { name: '速度', base: 10, perLevel: 1 },
  crit: { name: '暴击率', base: 5, perLevel: 0 },
  critDmg: { name: '暴击伤害', base: 150, perLevel: 0 },
};

export const AFFIX_POOL = [
  { id: 'hp', name: '生命', min: 5, max: 50, perLevel: 8 },
  { id: 'atk', name: '攻击', min: 2, max: 20, perLevel: 3 },
  { id: 'def', name: '防御', min: 1, max: 15, perLevel: 2 },
  { id: 'speed', name: '速度', min: 1, max: 8, perLevel: 1 },
  { id: 'crit', name: '暴击率', min: 1, max: 5, perLevel: 0 },
  { id: 'critDmg', name: '暴击伤害', min: 5, max: 30, perLevel: 0 },
  { id: 'hpPercent', name: '生命%', min: 1, max: 8, perLevel: 0 },
  { id: 'atkPercent', name: '攻击%', min: 1, max: 8, perLevel: 0 },
  { id: 'defPercent', name: '防御%', min: 1, max: 8, perLevel: 0 },
];

export const ENHANCE_SUCCESS_RATE = [
  1.0, 0.95, 0.90, 0.85, 0.80,
  0.70, 0.60, 0.50, 0.40, 0.30,
  0.20, 0.15, 0.10, 0.08, 0.05,
];

export const ENHANCE_DROP_LEVELS = [
  0, 0, 0, 1, 1,
  1, 2, 2, 3, 3,
  4, 4, 5, 5, 5,
];

export const ENHANCE_BONUS_PER_LEVEL = 0.10;

export const ENHANCE_COST_BASE = 100;

export const BAG_MAX_SIZE = 500;

export const FIGHT_LOG_INTERVAL_MS = 350;

export const AFK_RUN_INTERVAL_MS = 1500;
