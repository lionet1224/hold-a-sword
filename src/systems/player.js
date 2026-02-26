import { BASE_STATS, EXP_TABLE, MAX_LEVEL, EQUIP_SLOTS, BAG_MAX_SIZE, SELL_PRICE } from '../data/config';
import { SET_BONUSES } from '../data/dungeons';
import { PLAYER_SKILLS } from '../data/skills';

export default class Player {
  constructor(data = null) {
    if (data) {
      Object.assign(this, data);
      if (!this.clearedDungeons) this.clearedDungeons = [];
      return;
    }

    this.name = '冒险者';
    this.level = 1;
    this.exp = 0;
    this.gold = 0;

    this.equipment = {};
    for (const slot of EQUIP_SLOTS) {
      this.equipment[slot] = null;
    }

    this.bag = [];
    this.materials = {};
    this.blueprints = [];
    this.buffs = {};
    this.tutorialDone = false;
    this.clearedDungeons = [];

    this.skillCooldowns = {};
  }

  getBaseStats() {
    const stats = {};
    for (const [key, cfg] of Object.entries(BASE_STATS)) {
      stats[key] = cfg.base + cfg.perLevel * (this.level - 1);
    }
    return stats;
  }

  getEquipStats() {
    const stats = { hp: 0, atk: 0, def: 0, speed: 0, crit: 0, critDmg: 0, hpPercent: 0, atkPercent: 0, defPercent: 0 };

    for (const slot of EQUIP_SLOTS) {
      const equip = this.equipment[slot];
      if (!equip) continue;

      const enhanceMultiplier = 1 + (equip.enhanceLevel || 0) * 0.10;

      for (const affix of [...(equip.fixedAffixes || []), ...(equip.randomAffixes || [])]) {
        const val = affix.id.includes('Percent') ? affix.value : Math.floor(affix.value * enhanceMultiplier);
        stats[affix.id] = (stats[affix.id] || 0) + val;
      }
    }

    return stats;
  }

  getSetBonuses() {
    const setCounts = {};
    for (const slot of EQUIP_SLOTS) {
      const equip = this.equipment[slot];
      if (!equip || !equip.setId) continue;
      setCounts[equip.setId] = (setCounts[equip.setId] || 0) + 1;
    }

    const bonusStats = {};
    const activeSetDescs = [];

    for (const [setId, count] of Object.entries(setCounts)) {
      const setDef = SET_BONUSES[setId];
      if (!setDef) continue;

      for (const threshold of [2, 3, 5]) {
        if (count >= threshold && setDef[threshold]) {
          activeSetDescs.push(`${setDef.name}(${threshold}): ${setDef[threshold].desc}`);
          for (const [stat, val] of Object.entries(setDef[threshold])) {
            if (stat === 'desc') continue;
            bonusStats[stat] = (bonusStats[stat] || 0) + val;
          }
        }
      }
    }

    return { bonusStats, activeSetDescs };
  }

  getBuffStats() {
    const stats = {};
    for (const [stat, val] of Object.entries(this.buffs || {})) {
      stats[stat] = (stats[stat] || 0) + val;
    }
    return stats;
  }

  getFinalStats() {
    const base = this.getBaseStats();
    const equip = this.getEquipStats();
    const { bonusStats: setBonus } = this.getSetBonuses();
    const buff = this.getBuffStats();

    const flat = {};
    const percent = {};

    for (const source of [equip, setBonus, buff]) {
      for (const [key, val] of Object.entries(source)) {
        if (key.endsWith('Percent')) {
          const baseKey = key.replace('Percent', '');
          percent[baseKey] = (percent[baseKey] || 0) + val;
        } else {
          flat[key] = (flat[key] || 0) + val;
        }
      }
    }

    const final = {};
    for (const key of Object.keys(base)) {
      const baseVal = base[key] + (flat[key] || 0);
      const pct = percent[key] || 0;
      final[key] = Math.floor(baseVal * (1 + pct / 100));
    }

    return final;
  }

  getAvailableSkills() {
    return PLAYER_SKILLS.filter((s) => s.unlockLevel <= this.level);
  }

  addExp(amount) {
    if (this.level >= MAX_LEVEL) return { leveledUp: false };

    this.exp += amount;
    let leveledUp = false;

    while (this.level < MAX_LEVEL && this.exp >= EXP_TABLE[this.level]) {
      this.exp -= EXP_TABLE[this.level];
      this.level++;
      leveledUp = true;
    }

    if (this.level >= MAX_LEVEL) {
      this.exp = 0;
    }

    return { leveledUp, newLevel: this.level };
  }

  addGold(amount) {
    this.gold += amount;
  }

  addMaterial(id, count = 1) {
    this.materials[id] = (this.materials[id] || 0) + count;
  }

  hasMaterial(id, count = 1) {
    return (this.materials[id] || 0) >= count;
  }

  removeMaterial(id, count = 1) {
    if (!this.hasMaterial(id, count)) return false;
    this.materials[id] -= count;
    return true;
  }

  addBlueprint(id) {
    if (!this.blueprints.includes(id)) {
      this.blueprints.push(id);
      return true;
    }
    return false;
  }

  hasDungeonCleared(dungeonId) {
    return this.clearedDungeons.includes(dungeonId);
  }

  markDungeonCleared(dungeonId) {
    if (!this.clearedDungeons.includes(dungeonId)) {
      this.clearedDungeons.push(dungeonId);
    }
  }

  isBagFull() {
    return this.bag.length >= BAG_MAX_SIZE;
  }

  getBagSpace() {
    return BAG_MAX_SIZE - this.bag.length;
  }

  addToBag(item) {
    if (this.isBagFull()) return false;
    this.bag.push(item);
    return true;
  }

  removeFromBag(index) {
    if (index < 0 || index >= this.bag.length) return null;
    return this.bag.splice(index, 1)[0];
  }

  sellFromBag(index) {
    const item = this.removeFromBag(index);
    if (!item) return null;
    const price = SELL_PRICE[item.quality] || 1;
    this.gold += price;
    return { item, price };
  }

  equip(index) {
    const item = this.bag[index];
    if (!item) return null;

    const slot = item.slot;
    const old = this.equipment[slot];

    this.equipment[slot] = item;
    this.bag.splice(index, 1);

    if (old) {
      this.bag.push(old);
    }

    return { equipped: item, unequipped: old };
  }

  unequip(slot) {
    const item = this.equipment[slot];
    if (!item) return null;

    this.equipment[slot] = null;
    this.bag.push(item);
    return item;
  }

  applyBuff(stat, value) {
    this.buffs[stat] = (this.buffs[stat] || 0) + value;
  }

  resetCooldowns() {
    this.skillCooldowns = {};
  }

  tickCooldowns() {
    for (const id of Object.keys(this.skillCooldowns)) {
      if (this.skillCooldowns[id] > 0) {
        this.skillCooldowns[id]--;
      }
    }
  }

  isSkillReady(skillId) {
    return !this.skillCooldowns[skillId] || this.skillCooldowns[skillId] <= 0;
  }

  useSkill(skillId, cooldown) {
    this.skillCooldowns[skillId] = cooldown;
  }

  toJSON() {
    return {
      name: this.name,
      level: this.level,
      exp: this.exp,
      gold: this.gold,
      equipment: this.equipment,
      bag: this.bag,
      materials: this.materials,
      blueprints: this.blueprints,
      buffs: this.buffs,
      tutorialDone: this.tutorialDone,
      clearedDungeons: this.clearedDungeons,
    };
  }
}
