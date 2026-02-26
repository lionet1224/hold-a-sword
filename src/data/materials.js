export const MATERIALS = {
  wood: { name: '木材', desc: '普通的木材' },
  leather: { name: '皮革', desc: '兽皮制成的皮革' },
  iron_ore: { name: '铁矿石', desc: '坚硬的铁矿石' },
  spider_silk: { name: '蛛丝', desc: '坚韧的蛛丝' },
  fire_crystal: { name: '火焰水晶', desc: '蕴含火焰之力的水晶' },
  dragon_scale: { name: '龙鳞', desc: '炎龙脱落的鳞片' },
  enhance_stone: { name: '强化石', desc: '用于强化装备的神秘石头' },
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
};
