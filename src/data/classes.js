export const CLASS_CHANGE_LEVEL = 10;

export const CLASSES = {
  warrior: {
    name: '战士',
    desc: '近战物理输出，高生命高防御，擅长持久战。',
    color: '#c44',
    statBonus: { hp: 1.2, atk: 1.1, def: 1.3, speed: 0.9, crit: 1.0, critDmg: 1.0 },
  },
  mage: {
    name: '法师',
    desc: '远程魔法输出，高暴击高爆伤，但身板脆弱。',
    color: '#a0f',
    statBonus: { hp: 0.8, atk: 1.3, def: 0.7, speed: 1.0, crit: 1.2, critDmg: 1.3 },
  },
  archer: {
    name: '射手',
    desc: '高速高暴击，擅长先手和连击。',
    color: '#2d8f2d',
    statBonus: { hp: 0.9, atk: 1.15, def: 0.8, speed: 1.4, crit: 1.5, critDmg: 1.2 },
  },
  summoner: {
    name: '召唤师',
    desc: '召唤兽协助作战，本体提供辅助。',
    color: '#0af',
    statBonus: { hp: 1.0, atk: 0.8, def: 0.9, speed: 1.0, crit: 1.0, critDmg: 1.0 },
  },
};

export const SUMMONS = {
  wolf_spirit: {
    name: '灵狼',
    desc: '初始召唤兽，攻守均衡。',
    hpBase: 80, hpPerLevel: 15,
    atkBase: 8, atkPerLevel: 2,
    defBase: 4, defPerLevel: 1,
    skills: ['bite'],
    unlockLevel: 10,
  },
  fire_imp: {
    name: '火焰小鬼',
    desc: '高攻击低防御的攻击型召唤兽。',
    hpBase: 50, hpPerLevel: 10,
    atkBase: 12, atkPerLevel: 3,
    defBase: 2, defPerLevel: 0.5,
    skills: ['bite', 'poison_spit'],
    unlockLevel: 14,
  },
  stone_golem: {
    name: '石像守卫',
    desc: '高防御高生命的坦克型召唤兽。',
    hpBase: 120, hpPerLevel: 25,
    atkBase: 5, atkPerLevel: 1,
    defBase: 8, defPerLevel: 2,
    skills: ['heavy_strike'],
    unlockLevel: 18,
  },
};
