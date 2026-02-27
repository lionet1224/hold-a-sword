import {
  BASE_STATS,
  EXP_TABLE,
  MAX_LEVEL,
  EQUIP_SLOTS,
  BAG_MAX_SIZE,
  SELL_PRICE,
} from "../data/config";
import { SET_BONUSES } from "../data/dungeons";
import {
  SKILL_TREE,
  SKILL_POINTS_PER_LEVEL,
  INITIAL_SKILL_POINTS,
  getAllSkillsFlat,
} from "../data/skills";
import { CLASSES, SUMMONS } from "../data/classes";

export default class Player {
  constructor(data = null) {
    if (data) {
      Object.assign(this, data);
      if (!this.clearedDungeons) this.clearedDungeons = [];
      if (!this.classId) this.classId = null;
      if (!this.skillPoints) this.skillPoints = 0;
      if (!this.learnedSkills) this.learnedSkills = ["slash"];
      if (!this.activeSummon) this.activeSummon = null;
      if (!this.summonBuffs) this.summonBuffs = {};
      return;
    }

    this.name = "冒险者";
    this.level = 1;
    this.exp = 0;
    this.gold = 0;
    this.classId = null;

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

    this.skillPoints = INITIAL_SKILL_POINTS;
    this.learnedSkills = ["slash"];
    this.activeSummon = null;
    this.summonBuffs = {};

    this.skillCooldowns = {};
  }

  getClassName() {
    if (!this.classId) return "无职业";
    return CLASSES[this.classId]?.name || "未知";
  }

  getClassData() {
    if (!this.classId) return null;
    return CLASSES[this.classId] || null;
  }

  changeClass(classId) {
    if (!CLASSES[classId]) return false;
    this.classId = classId;
    if (classId !== "summoner") {
      this.activeSummon = null;
    }
    return true;
  }

  canLearnSkill(skillId) {
    if (this.learnedSkills.includes(skillId))
      return { ok: false, reason: "已学习" };
    if (this.skillPoints <= 0) return { ok: false, reason: "技能点不足" };

    const allSkills = getAllSkillsFlat();
    const skill = allSkills[skillId];
    if (!skill) return { ok: false, reason: "技能不存在" };

    if (skill.tree !== "common" && skill.tree !== this.classId) {
      return {
        ok: false,
        reason: `需要转职为「${SKILL_TREE[skill.tree]?.name || skill.tree}」`,
      };
    }

    if (this.skillPoints < skill.cost)
      return {
        ok: false,
        reason: `需要 ${skill.cost} 技能点 (当前: ${this.skillPoints})`,
      };

    for (const req of skill.requires) {
      if (!this.learnedSkills.includes(req)) {
        const reqSkill = allSkills[req];
        return { ok: false, reason: `需要先学习「${reqSkill?.name || req}」` };
      }
    }

    return { ok: true, cost: skill.cost };
  }

  learnSkill(skillId) {
    const check = this.canLearnSkill(skillId);
    if (!check.ok) return check;

    const allSkills = getAllSkillsFlat();
    const skill = allSkills[skillId];
    this.skillPoints -= skill.cost;
    this.learnedSkills.push(skillId);
    return { ok: true, skill };
  }

  getLearnedPassives() {
    const allSkills = getAllSkillsFlat();
    const merged = {};
    for (const id of this.learnedSkills) {
      const skill = allSkills[id];
      if (!skill || skill.type !== "passive") continue;
      for (const [key, val] of Object.entries(skill.passive)) {
        if (typeof val === "number") {
          merged[key] = (merged[key] || 0) + val;
        } else {
          merged[key] = val;
        }
      }
    }
    return merged;
  }

  getAvailableSkills() {
    const allSkills = getAllSkillsFlat();
    return this.learnedSkills
      .map((id) => allSkills[id])
      .filter((s) => s && s.type !== "summon" && s.type !== "passive");
  }

  getLearnedSummonSkills() {
    const allSkills = getAllSkillsFlat();
    return this.learnedSkills
      .map((id) => allSkills[id])
      .filter((s) => s && s.type === "summon");
  }

  setSummon(summonId) {
    if (!SUMMONS[summonId]) return false;
    this.activeSummon = summonId;
    return true;
  }

  dismissSummon() {
    this.activeSummon = null;
  }

  getSummonStats() {
    if (!this.activeSummon || this.classId !== "summoner") return null;
    const def = SUMMONS[this.activeSummon];
    if (!def) return null;

    const passives = this.getLearnedPassives();
    const buffAtk =
      (this.summonBuffs.summonAtkPercent || 0) +
      (passives.summonAtkPercent || 0);
    const buffHp =
      (this.summonBuffs.summonHpPercent || 0) + (passives.summonHpPercent || 0);
    const atkBonus = 1 + buffAtk / 100;
    const hpBonus = 1 + buffHp / 100;

    return {
      name: def.name,
      id: this.activeSummon,
      maxHp: Math.floor(
        (def.hpBase + def.hpPerLevel * (this.level - 1)) * hpBonus,
      ),
      atk: Math.floor(
        (def.atkBase + def.atkPerLevel * (this.level - 1)) * atkBonus,
      ),
      def: Math.floor(def.defBase + def.defPerLevel * (this.level - 1)),
      skills: def.skills,
    };
  }

  getBaseStats() {
    const stats = {};
    for (const [key, cfg] of Object.entries(BASE_STATS)) {
      stats[key] = Math.floor(cfg.base + cfg.perLevel * (this.level - 1));
    }

    const classData = this.getClassData();
    if (classData) {
      for (const key of Object.keys(stats)) {
        const mul = classData.statBonus[key] || 1.0;
        stats[key] = Math.floor(stats[key] * mul);
      }
    }

    return stats;
  }

  getEquipStats() {
    const stats = {
      hp: 0,
      atk: 0,
      def: 0,
      speed: 0,
      crit: 0,
      critDmg: 0,
      hpPercent: 0,
      atkPercent: 0,
      defPercent: 0,
    };

    for (const slot of EQUIP_SLOTS) {
      const equip = this.equipment[slot];
      if (!equip) continue;

      const enhanceMultiplier = 1 + (equip.enhanceLevel || 0) * 0.1;

      for (const affix of [
        ...(equip.fixedAffixes || []),
        ...(equip.randomAffixes || []),
      ]) {
        const val = affix.id.includes("Percent")
          ? affix.value
          : Math.floor(affix.value * enhanceMultiplier);
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
          activeSetDescs.push(
            `${setDef.name}(${threshold}): ${setDef[threshold].desc}`,
          );
          for (const [stat, val] of Object.entries(setDef[threshold])) {
            if (stat === "desc") continue;
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
        if (key.startsWith("summon")) continue;
        if (key.endsWith("Percent")) {
          const baseKey = key.replace("Percent", "");
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

  addExp(amount) {
    if (this.level >= MAX_LEVEL) return { leveledUp: false };

    this.exp += amount;
    let leveledUp = false;
    let levelsGained = 0;

    while (this.level < MAX_LEVEL && this.exp >= EXP_TABLE[this.level]) {
      this.exp -= EXP_TABLE[this.level];
      this.level++;
      leveledUp = true;
      levelsGained++;
      this.skillPoints += SKILL_POINTS_PER_LEVEL;
    }

    if (this.level >= MAX_LEVEL) {
      this.exp = 0;
    }

    return { leveledUp, newLevel: this.level, levelsGained };
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
    if (stat.startsWith("summon")) {
      this.summonBuffs[stat] = (this.summonBuffs[stat] || 0) + value;
    } else {
      this.buffs[stat] = (this.buffs[stat] || 0) + value;
    }
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
      classId: this.classId,
      equipment: this.equipment,
      bag: this.bag,
      materials: this.materials,
      blueprints: this.blueprints,
      buffs: this.buffs,
      summonBuffs: this.summonBuffs,
      tutorialDone: this.tutorialDone,
      clearedDungeons: this.clearedDungeons,
      skillPoints: this.skillPoints,
      learnedSkills: this.learnedSkills,
      activeSummon: this.activeSummon,
    };
  }
}
