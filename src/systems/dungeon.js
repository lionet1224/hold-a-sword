import { DUNGEONS } from '../data/dungeons';
import { MATERIALS } from '../data/materials';
import { generateEquip } from './equipment';
import { BattleEngine } from './battle';
import { rand, randInt, pickRandom } from '../utils/random';

export default class DungeonRunner {
  constructor(player) {
    this.player = player;
  }

  getDungeon(id) {
    return DUNGEONS.find((d) => d.id === id);
  }

  checkUnlock(dungeon) {
    const u = dungeon.unlock;
    if (!u) return { ok: true };

    if (u.level && this.player.level < u.level) {
      return { ok: false, reason: `需要等级 Lv.${u.level}` };
    }
    if (u.cleared && !this.player.hasDungeonCleared(u.cleared)) {
      const prev = this.getDungeon(u.cleared);
      return { ok: false, reason: `需要先通关「${prev ? prev.name : u.cleared}」` };
    }
    if (u.item) {
      const mat = MATERIALS[u.item.id];
      const have = this.player.materials[u.item.id] || 0;
      if (have < u.item.count) {
        return { ok: false, reason: `需要 ${mat ? mat.name : u.item.id} x${u.item.count} (当前: ${have})` };
      }
    }
    return { ok: true };
  }

  fightThrough(dungeonId) {
    const dungeon = this.getDungeon(dungeonId);
    if (!dungeon) return { error: '副本不存在' };

    const check = this.checkUnlock(dungeon);
    if (!check.ok) return { error: check.reason };

    const result = {
      completed: false,
      exp: 0,
      gold: 0,
      equips: [],
      materials: [],
      blueprints: [],
      logs: [],
      diedAt: null,
      leveledUp: false,
      newLevel: this.player.level,
    };

    const battle = new BattleEngine(this.player);

    for (const stage of dungeon.stages) {
      result.logs.push({ msg: `\n----- ${stage.name} -----`, color: '#e08a00' });

      for (let i = 0; i < stage.count; i++) {
        const template = stage.isBoss ? stage.monsters[0] : pickRandom(stage.monsters);
        const br = battle.fight(template, true);

        result.logs.push(...br.logs);

        if (!br.won) {
          result.diedAt = stage.name;
          result.logs.push({ msg: `\n副本失败！倒在了「${stage.name}」`, color: '#f44' });
          this.applyRewards(result);
          return result;
        }

        result.exp += br.expReward;
        result.gold += br.goldReward;
      }

      if (dungeon.materialDrop && dungeon.materialDrop.length > 0) {
        const count = randInt(1, 3);
        for (let j = 0; j < count; j++) {
          result.materials.push(pickRandom(dungeon.materialDrop));
        }
      }
    }

    result.completed = true;
    this.rollDrops(dungeon, result);
    this.applyRewards(result);

    for (const eq of result.equips) {
      this.player.addToBag(eq);
    }

    return result;
  }

  runOnce(dungeonId) {
    const dungeon = this.getDungeon(dungeonId);
    if (!dungeon) return { error: '副本不存在' };

    const result = {
      completed: false,
      exp: 0,
      gold: 0,
      equips: [],
      materials: [],
      blueprints: [],
      diedAt: null,
      leveledUp: false,
      newLevel: this.player.level,
    };

    const battle = new BattleEngine(this.player);

    for (const stage of dungeon.stages) {
      for (let i = 0; i < stage.count; i++) {
        const template = stage.isBoss ? stage.monsters[0] : pickRandom(stage.monsters);
        const br = battle.fight(template, false);

        if (!br.won) {
          result.diedAt = stage.name;
          this.applyRewards(result);
          return result;
        }

        result.exp += br.expReward;
        result.gold += br.goldReward;
      }

      if (dungeon.materialDrop && dungeon.materialDrop.length > 0) {
        const count = randInt(1, 3);
        for (let j = 0; j < count; j++) {
          result.materials.push(pickRandom(dungeon.materialDrop));
        }
      }
    }

    result.completed = true;
    this.rollDrops(dungeon, result);
    this.applyRewards(result);

    return result;
  }

  rollDrops(dungeon, result) {
    if (dungeon.dropPool && dungeon.dropPool.length > 0) {
      const dropCount = randInt(1, 2);
      for (let i = 0; i < dropCount; i++) {
        const template = pickRandom(dungeon.dropPool);
        const equip = generateEquip(template, dungeon.unlock.level || 1);
        result.equips.push(equip);
      }
    }

    if (dungeon.blueprintDrop && dungeon.blueprintDrop.length > 0 && rand() < 0.15) {
      const bpId = pickRandom(dungeon.blueprintDrop);
      if (this.player.addBlueprint(bpId)) {
        result.blueprints.push(bpId);
      }
    }

    if (rand() < 0.5) {
      result.materials.push('enhance_stone');
    }
  }

  applyRewards(result) {
    const lr = this.player.addExp(result.exp);
    this.player.addGold(result.gold);

    for (const matId of result.materials) {
      this.player.addMaterial(matId);
    }

    if (lr.leveledUp) {
      result.leveledUp = true;
      result.newLevel = lr.newLevel;
    }
  }
}
