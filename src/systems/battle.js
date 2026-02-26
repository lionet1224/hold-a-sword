import { BASE_STATS } from '../data/config';
import { MONSTER_SKILLS } from '../data/skills';
import { rand, randInt, pickRandom } from '../utils/random';

function createMonster(template) {
  const level = template.level;
  const stats = {};
  for (const [key, cfg] of Object.entries(BASE_STATS)) {
    const base = cfg.base + cfg.perLevel * (level - 1);
    const mul = template[`${key}Mul`] || 1.0;
    stats[key] = Math.floor(base * mul);
  }

  return {
    name: template.name,
    level,
    maxHp: stats.hp,
    hp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    speed: stats.speed,
    crit: stats.crit || 5,
    critDmg: stats.critDmg || 150,
    skills: template.skills.map((id) => MONSTER_SKILLS.find((s) => s.id === id)).filter(Boolean),
    expReward: template.expReward,
    goldReward: template.goldReward,
    isBoss: template.isBoss || false,
  };
}

function calcDamage(attacker, defender, multiplier = 1.0) {
  const rawAtk = attacker.atk * multiplier;
  const reduction = defender.def / (defender.def + 100);
  let dmg = Math.max(1, Math.floor(rawAtk * (1 - reduction)));

  let isCrit = false;
  if (rand() * 100 < attacker.crit) {
    dmg = Math.floor(dmg * (attacker.critDmg / 100));
    isCrit = true;
  }

  dmg = Math.max(1, dmg + randInt(-5, 5));
  return { dmg, isCrit };
}

function applyMonsterBuff(monster, skill) {
  const stat = skill.buffStat.replace('Percent', '');
  const baseVal = monster[stat] || 0;
  monster[stat] = baseVal + Math.floor(baseVal * skill.buffValue / 100);
}

export class BattleEngine {
  constructor(player) {
    this.player = player;
  }

  fight(monsterTemplate, verbose = false) {
    const monster = createMonster(monsterTemplate);
    const playerStats = this.player.getFinalStats();
    const ps = {
      maxHp: playerStats.hp,
      hp: playerStats.hp,
      atk: playerStats.atk,
      def: playerStats.def,
      speed: playerStats.speed,
      crit: playerStats.crit,
      critDmg: playerStats.critDmg,
    };

    this.player.resetCooldowns();
    const logs = [];

    if (verbose) {
      const tag = monster.isBoss ? '>>> BOSS ' : '';
      logs.push({ msg: `${tag}遭遇 ${monster.name} (Lv.${monster.level}) HP:${monster.hp}`, color: monster.isBoss ? '#f80' : '#555' });
    }

    let round = 0;
    while (ps.hp > 0 && monster.hp > 0 && round < 50) {
      round++;
      this.player.tickCooldowns();

      if (verbose) {
        logs.push({ msg: `  ── 第 ${round} 回合 ──`, color: '#888' });
      }

      const pLog = this.doPlayerTurn(ps, monster, verbose);
      if (pLog) logs.push(pLog);

      if (monster.hp <= 0) break;

      const mLog = this.doMonsterTurn(monster, ps, verbose);
      if (mLog) logs.push(mLog);
    }

    const won = monster.hp <= 0;

    if (verbose) {
      if (won) {
        logs.push({ msg: `  ✓ 击败 ${monster.name}！+${monster.expReward}exp +${monster.goldReward}g`, color: '#2d8f2d' });
      } else if (ps.hp <= 0) {
        logs.push({ msg: `  ✗ 被 ${monster.name} 击败...`, color: '#f44' });
      } else {
        logs.push({ msg: '  战斗超时，撤退。', color: '#f80' });
      }
    }

    return {
      won,
      monsterName: monster.name,
      isBoss: monster.isBoss,
      expReward: won ? monster.expReward : 0,
      goldReward: won ? monster.goldReward : 0,
      logs,
    };
  }

  doPlayerTurn(ps, monster, verbose) {
    const skill = this.pickSkill(ps);
    this.player.useSkill(skill.id, skill.cooldown || 0);

    if (skill.type === 'damage') {
      let totalDmg = 0;
      const hitParts = [];

      for (let i = 0; i < skill.hits; i++) {
        const { dmg, isCrit } = calcDamage(ps, monster, skill.multiplier);
        monster.hp -= dmg;
        totalDmg += dmg;
        hitParts.push(`${dmg}${isCrit ? '(暴击!)' : ''}`);
      }

      if (verbose) {
        const hitsText = skill.hits > 1 ? `${skill.hits}段` : '';
        return { msg: `  你 [${skill.name}] ${hitsText} ${hitParts.join('+')}=${totalDmg} (怪HP:${Math.max(0, monster.hp)})`, color: '#2656c9' };
      }
    } else if (skill.type === 'buff') {
      this.player.applyBuff(skill.buffStat, skill.buffValue);
      const s = this.player.getFinalStats();
      ps.atk = s.atk;
      ps.def = s.def;
      ps.maxHp = s.hp;
      ps.hp = Math.min(ps.hp, s.hp);
      if (verbose) return { msg: `  你 [${skill.name}] ${skill.desc}`, color: '#0af' };
    } else if (skill.type === 'heal') {
      const heal = Math.floor(ps.maxHp * skill.healPercent);
      ps.hp = Math.min(ps.maxHp, ps.hp + heal);
      if (verbose) return { msg: `  你 [${skill.name}] 恢复${heal}HP (${ps.hp}/${ps.maxHp})`, color: '#2d8f2d' };
    }

    return null;
  }

  doMonsterTurn(monster, ps, verbose) {
    if (monster.skills.length === 0) return null;
    const skill = pickRandom(monster.skills);

    if (skill.type === 'damage') {
      let totalDmg = 0;
      const hitParts = [];

      for (let i = 0; i < skill.hits; i++) {
        const { dmg, isCrit } = calcDamage(monster, ps, skill.multiplier);
        ps.hp -= dmg;
        totalDmg += dmg;
        hitParts.push(`${dmg}${isCrit ? '(暴击!)' : ''}`);
      }

      if (verbose) {
        const hitsText = skill.hits > 1 ? `${skill.hits}段` : '';
        return { msg: `  ${monster.name} [${skill.name}] ${hitsText} ${hitParts.join('+')}=${totalDmg} (你HP:${Math.max(0, ps.hp)}/${ps.maxHp})`, color: '#c44' };
      }
    } else if (skill.type === 'buff') {
      applyMonsterBuff(monster, skill);
      if (verbose) return { msg: `  ${monster.name} [${skill.name}] 增强自身`, color: '#f80' };
    }

    return null;
  }

  pickSkill(ps) {
    const available = this.player.getAvailableSkills().filter((s) => this.player.isSkillReady(s.id));
    if (available.length === 0) {
      return { id: 'basic_attack', name: '普通攻击', type: 'damage', hits: 1, multiplier: 1.0, cooldown: 0 };
    }

    const heal = available.filter((s) => s.type === 'heal');
    const buff = available.filter((s) => s.type === 'buff');
    const dmg = available.filter((s) => s.type === 'damage');

    if (heal.length > 0 && ps.hp < ps.maxHp * 0.4) return heal[0];
    if (buff.length > 0 && rand() < 0.15) return buff[0];
    if (dmg.length > 0) return pickRandom(dmg);
    return available[0];
  }
}
