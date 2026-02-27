export const SKILL_TREE = {
  common: {
    name: '通用',
    color: '#888',
    skills: {
      slash: {
        name: '斩击', desc: '120%攻击力伤害', type: 'damage', hits: 1, multiplier: 1.2, cooldown: 0,
        cost: 0, requires: [],
      },
      double_strike: {
        name: '双重打击', desc: '2段各80%攻击力伤害', type: 'damage', hits: 2, multiplier: 0.8, cooldown: 2,
        cost: 1, requires: ['slash'],
      },
      heal: {
        name: '治愈', desc: '恢复30%最大生命值', type: 'heal', healPercent: 0.3, cooldown: 4,
        cost: 1, requires: [],
      },
      iron_wall: {
        name: '铁壁', desc: '永久增加10%防御', type: 'buff', buffStat: 'defPercent', buffValue: 10, cooldown: 5,
        cost: 2, requires: ['heal'],
      },
      war_cry: {
        name: '战吼', desc: '永久增加8%攻击', type: 'buff', buffStat: 'atkPercent', buffValue: 8, cooldown: 5,
        cost: 2, requires: ['double_strike'],
      },
    },
  },
  warrior: {
    name: '战士',
    color: '#c44',
    skills: {
      iron_body: {
        name: '铁躯', desc: '被动: 受到伤害降低8%', type: 'passive',
        passive: { damageReduction: 0.08 },
        cost: 2, requires: [],
      },
      shield_bash: {
        name: '盾击', desc: '150%攻击力伤害，基于防御加成', type: 'damage', hits: 1, multiplier: 1.5, cooldown: 3,
        defScaling: 0.5,
        cost: 2, requires: ['iron_wall'],
      },
      whirlwind: {
        name: '旋风斩', desc: '3段各70%攻击力伤害', type: 'damage', hits: 3, multiplier: 0.7, cooldown: 3,
        cost: 2, requires: ['double_strike'],
      },
      fortify: {
        name: '坚守', desc: '永久增加15%防御和10%生命', type: 'buff', buffStat: 'defPercent', buffValue: 15, cooldown: 6,
        extraBuff: { stat: 'hpPercent', value: 10 },
        cost: 3, requires: ['shield_bash'],
      },
      unyielding: {
        name: '不屈', desc: '被动: 生命低于30%时防御额外+25%', type: 'passive',
        passive: { lowHpDefBonus: 0.25, lowHpThreshold: 0.3 },
        cost: 3, requires: ['iron_body', 'fortify'],
      },
      blade_storm: {
        name: '剑刃风暴', desc: '5段各55%攻击力伤害', type: 'damage', hits: 5, multiplier: 0.55, cooldown: 4,
        cost: 3, requires: ['whirlwind'],
      },
    },
  },
  mage: {
    name: '法师',
    color: '#a0f',
    skills: {
      arcane_mastery: {
        name: '奥术精通', desc: '被动: 技能伤害额外+15%', type: 'passive',
        passive: { skillDmgBonus: 0.15 },
        cost: 2, requires: [],
      },
      fireball: {
        name: '火球术', desc: '180%攻击力伤害', type: 'damage', hits: 1, multiplier: 1.8, cooldown: 2,
        cost: 2, requires: ['slash'],
      },
      ice_shard: {
        name: '冰晶碎片', desc: '3段各65%攻击力伤害', type: 'damage', hits: 3, multiplier: 0.65, cooldown: 3,
        cost: 2, requires: ['double_strike'],
      },
      arcane_burst: {
        name: '奥术爆发', desc: '永久增加12%攻击和10%暴击伤害', type: 'buff', buffStat: 'atkPercent', buffValue: 12, cooldown: 5,
        extraBuff: { stat: 'critDmg', value: 10 },
        cost: 3, requires: ['fireball'],
      },
      spell_crit: {
        name: '法术暴击', desc: '被动: 暴击率额外+10%', type: 'passive',
        passive: { bonusCrit: 10 },
        cost: 3, requires: ['arcane_mastery', 'arcane_burst'],
      },
      meteor: {
        name: '陨石坠落', desc: '2段各130%攻击力伤害', type: 'damage', hits: 2, multiplier: 1.3, cooldown: 4,
        cost: 3, requires: ['arcane_burst', 'ice_shard'],
      },
    },
  },
  archer: {
    name: '射手',
    color: '#2d8f2d',
    skills: {
      swift_strike: {
        name: '迅捷打击', desc: '被动: 每回合30%概率额外攻击一次', type: 'passive',
        passive: { extraAttackChance: 0.30 },
        cost: 2, requires: [],
      },
      rapid_shot: {
        name: '速射', desc: '3段各55%攻击力伤害', type: 'damage', hits: 3, multiplier: 0.55, cooldown: 2,
        cost: 2, requires: ['double_strike'],
      },
      precision: {
        name: '精准', desc: '永久增加5%暴击率和20%暴击伤害', type: 'buff', buffStat: 'crit', buffValue: 5, cooldown: 5,
        extraBuff: { stat: 'critDmg', value: 20 },
        cost: 2, requires: ['slash'],
      },
      arrow_rain: {
        name: '箭雨', desc: '5段各45%攻击力伤害', type: 'damage', hits: 5, multiplier: 0.45, cooldown: 3,
        cost: 3, requires: ['rapid_shot'],
      },
      eagle_eye: {
        name: '鹰眼', desc: '被动: 暴击伤害额外+30%', type: 'passive',
        passive: { bonusCritDmg: 30 },
        cost: 3, requires: ['swift_strike', 'precision'],
      },
      snipe: {
        name: '狙击', desc: '250%攻击力伤害，高暴击率', type: 'damage', hits: 1, multiplier: 2.5, cooldown: 4,
        bonusCrit: 25,
        cost: 3, requires: ['precision', 'rapid_shot'],
      },
    },
  },
  summoner: {
    name: '召唤师',
    color: '#0af',
    skills: {
      soul_bond: {
        name: '灵魂链接', desc: '被动: 召唤兽在场时本体受伤-20%，转移给召唤兽', type: 'passive',
        passive: { damageTransfer: 0.20 },
        cost: 2, requires: [],
      },
      summon_wolf: {
        name: '召唤灵狼', desc: '召唤一只灵狼协助战斗', type: 'summon', summonId: 'wolf_spirit', cooldown: 0,
        cost: 2, requires: ['slash'],
      },
      soul_drain: {
        name: '灵魂汲取', desc: '100%攻击力伤害，回复伤害的30%为生命', type: 'damage', hits: 1, multiplier: 1.0, cooldown: 3,
        lifeSteal: 0.3,
        cost: 2, requires: ['heal'],
      },
      summon_imp: {
        name: '召唤火鬼', desc: '召唤一只火焰小鬼协助战斗', type: 'summon', summonId: 'fire_imp', cooldown: 0,
        cost: 3, requires: ['summon_wolf'],
      },
      summon_golem: {
        name: '召唤石像', desc: '召唤一只石像守卫协助战斗', type: 'summon', summonId: 'stone_golem', cooldown: 0,
        cost: 3, requires: ['summon_wolf'],
      },
      spirit_fury: {
        name: '灵魂狂暴', desc: '被动: 召唤兽攻击力+25%，生命+25%', type: 'passive',
        passive: { summonAtkPercent: 25, summonHpPercent: 25 },
        cost: 3, requires: ['soul_bond', 'summon_imp'],
      },
      empower_summon: {
        name: '强化召唤', desc: '永久增加召唤兽20%攻击和20%生命', type: 'buff', buffStat: 'summonAtkPercent', buffValue: 20, cooldown: 6,
        extraBuff: { stat: 'summonHpPercent', value: 20 },
        cost: 3, requires: ['summon_imp'],
      },
    },
  },
};

export const SKILL_POINTS_PER_LEVEL = 1;
export const INITIAL_SKILL_POINTS = 1;

export const MONSTER_SKILLS = [
  { id: 'bite', name: '撕咬', type: 'damage', hits: 1, multiplier: 1.0 },
  { id: 'heavy_strike', name: '重击', type: 'damage', hits: 1, multiplier: 1.5 },
  { id: 'double_claw', name: '双爪', type: 'damage', hits: 2, multiplier: 0.7 },
  { id: 'poison_spit', name: '毒液喷射', type: 'damage', hits: 1, multiplier: 1.2 },
  { id: 'roar', name: '怒吼', desc: '增加自身攻击力', type: 'buff', buffStat: 'atkPercent', buffValue: 15 },
  { id: 'fury_combo', name: '狂暴连击', type: 'damage', hits: 3, multiplier: 0.6 },
  { id: 'death_gaze', name: '死亡凝视', type: 'damage', hits: 1, multiplier: 2.0 },
];

export function getAllSkillsFlat() {
  const all = {};
  for (const [treeId, tree] of Object.entries(SKILL_TREE)) {
    for (const [skillId, skill] of Object.entries(tree.skills)) {
      all[skillId] = { ...skill, id: skillId, tree: treeId };
    }
  }
  return all;
}
