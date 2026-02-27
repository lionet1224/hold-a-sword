export const MATERIALS = {
  wood: { name: '木材', desc: '普通的木材' },
  leather: { name: '皮革', desc: '兽皮制成的皮革' },
  iron_ore: { name: '铁矿石', desc: '坚硬的铁矿石' },
  spider_silk: { name: '蛛丝', desc: '坚韧的蛛丝' },
  fire_crystal: { name: '火焰水晶', desc: '蕴含火焰之力的水晶' },
  dragon_scale: { name: '龙鳞', desc: '炎龙脱落的鳞片' },
  enhance_stone: { name: '强化石', desc: '用于强化装备的神秘石头' },
  bear_claw: { name: '巨熊之爪', desc: '森林巨熊的利爪，锋利无比', rare: true },
  spider_fang: { name: '巨蛛毒牙', desc: '洞穴巨蛛的毒牙，剧毒附体', rare: true },
  dragon_heart: { name: '龙之心', desc: '炎龙的心脏，蕴含恐怖的力量', rare: true },
};

export const BLUEPRINTS = {
  cave_blade_bp: {
    name: '蛛牙秘刃图纸',
    result: {
      slot: 'weapon',
      name: '蛛牙秘刃',
      setId: 'cave',
      fixedAffixes: [{ id: 'atk', value: 18 }, { id: 'crit', value: 5 }, { id: 'speed', value: 4 }],
      guaranteedQuality: 'blue',
    },
    materials: { iron_ore: 10, spider_silk: 5 },
    goldCost: 500,
  },
  flame_sword_bp: {
    name: '炎龙剑图纸',
    result: {
      slot: 'weapon',
      name: '炎龙剑',
      setId: 'flame',
      fixedAffixes: [{ id: 'atk', value: 35 }, { id: 'critDmg', value: 30 }, { id: 'crit', value: 5 }],
      guaranteedQuality: 'purple',
    },
    materials: { fire_crystal: 15, dragon_scale: 8, iron_ore: 10 },
    goldCost: 2000,
  },
  dragon_armor_bp: {
    name: '龙鳞战甲图纸',
    result: {
      slot: 'armor',
      name: '龙鳞战甲',
      setId: 'flame',
      fixedAffixes: [{ id: 'def', value: 30 }, { id: 'hp', value: 80 }, { id: 'hpPercent', value: 8 }],
      guaranteedQuality: 'purple',
    },
    materials: { dragon_scale: 15, fire_crystal: 10, leather: 20 },
    goldCost: 2500,
  },
  bear_blade_bp: {
    name: '熊爪重剑图纸',
    result: {
      slot: 'weapon',
      name: '熊爪重剑',
      fixedAffixes: [{ id: 'atk', value: 10 }, { id: 'hp', value: 30 }, { id: 'def', value: 5 }],
      guaranteedQuality: 'blue',
    },
    materials: { bear_claw: 3, wood: 10, leather: 5 },
    goldCost: 300,
  },
  venom_dagger_bp: {
    name: '剧毒匕首图纸',
    result: {
      slot: 'weapon',
      name: '剧毒匕首',
      setId: 'cave',
      fixedAffixes: [{ id: 'atk', value: 20 }, { id: 'crit', value: 6 }, { id: 'critDmg', value: 20 }],
      guaranteedQuality: 'purple',
    },
    materials: { spider_fang: 3, spider_silk: 10, iron_ore: 8 },
    goldCost: 800,
  },
  dragon_heart_amulet_bp: {
    name: '龙心护符图纸',
    result: {
      slot: 'necklace',
      name: '龙心护符',
      setId: 'flame',
      fixedAffixes: [{ id: 'hp', value: 100 }, { id: 'hpPercent', value: 10 }, { id: 'atkPercent', value: 8 }],
      guaranteedQuality: 'orange',
    },
    materials: { dragon_heart: 2, dragon_scale: 20, fire_crystal: 15 },
    goldCost: 5000,
  },
};
