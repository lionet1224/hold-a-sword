export const DUNGEONS = [
  {
    id: 'green_forest',
    name: '翠绿森林',
    desc: '适合新手冒险的森林，怪物比较温和。',
    unlock: { level: 1 },
    stages: [
      {
        name: '林间小道',
        monsters: [
          { name: '野兔', level: 1, hpMul: 0.8, atkMul: 0.6, defMul: 0.4, skills: ['bite'], expReward: 15, goldReward: 10 },
          { name: '毒蛇', level: 2, hpMul: 0.7, atkMul: 0.8, defMul: 0.3, skills: ['bite', 'poison_spit'], expReward: 20, goldReward: 15 },
        ],
        count: 3,
      },
      {
        name: '密林深处',
        monsters: [
          { name: '灰狼', level: 2, hpMul: 1.0, atkMul: 0.9, defMul: 0.5, skills: ['bite', 'double_claw'], expReward: 25, goldReward: 20 },
          { name: '野猪', level: 3, hpMul: 1.3, atkMul: 0.7, defMul: 0.8, skills: ['heavy_strike'], expReward: 30, goldReward: 25 },
        ],
        count: 3,
      },
      {
        name: 'Boss: 森林巨熊',
        isBoss: true,
        monsters: [
          { name: '森林巨熊', level: 5, hpMul: 3.0, atkMul: 1.2, defMul: 1.0, skills: ['heavy_strike', 'roar', 'double_claw'], expReward: 100, goldReward: 80, isBoss: true },
        ],
        count: 1,
      },
    ],
    dropPool: [
      { setId: 'forest', slot: 'weapon', name: '森林之刃', fixedAffixes: [{ id: 'atk', value: 5 }] },
      { setId: 'forest', slot: 'armor', name: '森林皮甲', fixedAffixes: [{ id: 'def', value: 4 }, { id: 'hp', value: 10 }] },
      { setId: 'forest', slot: 'helmet', name: '森林头巾', fixedAffixes: [{ id: 'hp', value: 15 }] },
      { setId: 'forest', slot: 'ring', name: '森林指环', fixedAffixes: [{ id: 'crit', value: 2 }] },
      { setId: 'forest', slot: 'necklace', name: '森林吊坠', fixedAffixes: [{ id: 'speed', value: 3 }] },
    ],
    materialDrop: ['wood', 'leather'],
    blueprintDrop: [],
  },
  {
    id: 'dark_cave',
    name: '幽暗洞穴',
    desc: '阴暗潮湿的洞穴，潜伏着危险的生物。',
    unlock: { level: 6, cleared: 'green_forest' },
    stages: [
      {
        name: '洞穴入口',
        monsters: [
          { name: '洞穴蝙蝠', level: 6, hpMul: 0.8, atkMul: 1.0, defMul: 0.4, skills: ['bite', 'double_claw'], expReward: 40, goldReward: 35 },
          { name: '石头蜥蜴', level: 7, hpMul: 1.2, atkMul: 0.8, defMul: 1.0, skills: ['heavy_strike'], expReward: 50, goldReward: 40 },
        ],
        count: 4,
      },
      {
        name: '地下暗河',
        monsters: [
          { name: '暗影蜘蛛', level: 8, hpMul: 1.0, atkMul: 1.2, defMul: 0.6, skills: ['poison_spit', 'double_claw'], expReward: 60, goldReward: 50 },
          { name: '穴居食人鱼', level: 8, hpMul: 0.7, atkMul: 1.4, defMul: 0.3, skills: ['bite', 'fury_combo'], expReward: 65, goldReward: 55 },
        ],
        count: 4,
      },
      {
        name: 'Boss: 洞穴巨蛛',
        isBoss: true,
        monsters: [
          { name: '洞穴巨蛛', level: 10, hpMul: 3.5, atkMul: 1.4, defMul: 1.2, skills: ['poison_spit', 'fury_combo', 'roar', 'double_claw'], expReward: 200, goldReward: 160, isBoss: true },
        ],
        count: 1,
      },
    ],
    dropPool: [
      { setId: 'cave', slot: 'weapon', name: '蛛牙匕首', fixedAffixes: [{ id: 'atk', value: 12 }, { id: 'crit', value: 3 }] },
      { setId: 'cave', slot: 'armor', name: '蛛丝战甲', fixedAffixes: [{ id: 'def', value: 10 }, { id: 'hp', value: 25 }] },
      { setId: 'cave', slot: 'helmet', name: '暗影头盔', fixedAffixes: [{ id: 'def', value: 6 }, { id: 'speed', value: 2 }] },
      { setId: 'cave', slot: 'ring', name: '蛛眼戒指', fixedAffixes: [{ id: 'critDmg', value: 15 }] },
      { setId: 'cave', slot: 'necklace', name: '暗影项链', fixedAffixes: [{ id: 'atkPercent', value: 3 }] },
    ],
    materialDrop: ['iron_ore', 'spider_silk'],
    blueprintDrop: ['cave_blade_bp'],
  },
  {
    id: 'fire_mountain',
    name: '烈焰火山',
    desc: '炙热的火山地带，只有强者才能生还。',
    unlock: { level: 12, cleared: 'dark_cave', item: { id: 'fire_crystal', count: 3 } },
    stages: [
      {
        name: '熔岩地带',
        monsters: [
          { name: '火焰蜥蜴', level: 12, hpMul: 1.2, atkMul: 1.3, defMul: 0.8, skills: ['bite', 'heavy_strike'], expReward: 90, goldReward: 75 },
          { name: '岩浆史莱姆', level: 13, hpMul: 1.5, atkMul: 1.0, defMul: 1.2, skills: ['poison_spit', 'roar'], expReward: 100, goldReward: 85 },
        ],
        count: 5,
      },
      {
        name: '火焰通道',
        monsters: [
          { name: '烈焰元素', level: 14, hpMul: 1.0, atkMul: 1.6, defMul: 0.5, skills: ['fury_combo', 'heavy_strike'], expReward: 120, goldReward: 100 },
          { name: '火山巨人', level: 15, hpMul: 2.0, atkMul: 1.2, defMul: 1.5, skills: ['heavy_strike', 'roar'], expReward: 140, goldReward: 120 },
        ],
        count: 5,
      },
      {
        name: 'Boss: 炎龙',
        isBoss: true,
        monsters: [
          { name: '炎龙', level: 18, hpMul: 5.0, atkMul: 1.8, defMul: 1.5, skills: ['fury_combo', 'death_gaze', 'roar', 'heavy_strike'], expReward: 500, goldReward: 400, isBoss: true },
        ],
        count: 1,
      },
    ],
    dropPool: [
      { setId: 'flame', slot: 'weapon', name: '炎龙之牙', fixedAffixes: [{ id: 'atk', value: 25 }, { id: 'critDmg', value: 20 }] },
      { setId: 'flame', slot: 'armor', name: '炎龙鳞甲', fixedAffixes: [{ id: 'def', value: 20 }, { id: 'hp', value: 60 }, { id: 'hpPercent', value: 5 }] },
      { setId: 'flame', slot: 'helmet', name: '炎龙角冠', fixedAffixes: [{ id: 'hp', value: 40 }, { id: 'def', value: 12 }] },
      { setId: 'flame', slot: 'ring', name: '炎龙之心', fixedAffixes: [{ id: 'crit', value: 4 }, { id: 'critDmg', value: 25 }] },
      { setId: 'flame', slot: 'necklace', name: '炎龙吊坠', fixedAffixes: [{ id: 'atkPercent', value: 5 }, { id: 'atk', value: 15 }] },
    ],
    materialDrop: ['fire_crystal', 'dragon_scale'],
    blueprintDrop: ['flame_sword_bp', 'dragon_armor_bp'],
  },
];

export const SET_BONUSES = {
  forest: {
    name: '森林套装',
    2: { hp: 30, desc: '生命+30' },
    3: { def: 8, desc: '防御+8' },
    5: { atkPercent: 10, hpPercent: 10, desc: '攻击+10%, 生命+10%' },
  },
  cave: {
    name: '洞穴套装',
    2: { atk: 10, desc: '攻击+10' },
    3: { crit: 5, desc: '暴击率+5%' },
    5: { critDmg: 40, atkPercent: 12, desc: '暴击伤害+40%, 攻击+12%' },
  },
  flame: {
    name: '炎龙套装',
    2: { atk: 20, hp: 50, desc: '攻击+20, 生命+50' },
    3: { atkPercent: 8, defPercent: 8, desc: '攻击+8%, 防御+8%' },
    5: { crit: 8, critDmg: 50, atkPercent: 15, desc: '暴击+8%, 暴击伤害+50%, 攻击+15%' },
  },
};
