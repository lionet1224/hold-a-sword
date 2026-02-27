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
      return {
        ok: false,
        reason: `需要先通关「${prev ? prev.name : u.cleared}」`,
      };
    }
    if (u.item) {
      const mat = MATERIALS[u.item.id];
      const have = this.player.materials[u.item.id] || 0;
      if (have < u.item.count) {
        return {
          ok: false,
          reason: `需要 ${mat ? mat.name : u.item.id} x${u.item.count} (当前: ${have})`,
        };
      }
    }
    return { ok: true };
  }

  rollTrashDrop(monster, dungeonLevel) {
    if (!monster.trashDrop || monster.trashDrop.length === 0) return null;

    for (const drop of monster.trashDrop) {
      if (rand() < drop.prob) {
        const template = { slot: drop.slot, name: drop.name, fixedAffixes: [] };
        return generateEquip(template, dungeonLevel);
      }
    }
    return null;
  }

  rollBossRareDrop(monster, dungeonLevel) {
    const drops = { equips: [], materials: [] };
    if (!monster.rareDrop || monster.rareDrop.length === 0) return drops;

    for (const drop of monster.rareDrop) {
      if (rand() < drop.prob) {
        if (drop.type === 'equip') {
          const template = {
            ...drop.template,
            guaranteedQuality: drop.quality,
          };
          drops.equips.push(generateEquip(template, dungeonLevel));
        } else if (drop.type === 'material') {
          drops.materials.push(drop.id);
        }
      }
    }
    return drops;
  }

  fightThrough(dungeonId) {
    const dungeon = this.getDungeon(dungeonId);
    if (!dungeon) return { error: '副本不存在' };

    const check = this.checkUnlock(dungeon);
    if (!check.ok) return { error: check.reason };

    const dungeonLevel = dungeon.unlock.level || 1;
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
      result.logs.push({
        msg: `\n----- ${stage.name} -----`,
        color: '#e08a00',
      });

      for (let i = 0; i < stage.count; i++) {
        const template = stage.isBoss
          ? stage.monsters[0]
          : pickRandom(stage.monsters);
        const br = battle.fight(template, true);

        result.logs.push(...br.logs);

        if (!br.won) {
          result.diedAt = stage.name;
          result.logs.push({
            msg: `\n副本失败！倒在了「${stage.name}」`,
            color: '#f44',
          });
          this.applyRewards(result);
          for (const eq of result.equips) {
            this.player.addToBag(eq);
          }
          return result;
        }

        result.exp += br.expReward;
        result.gold += br.goldReward;

        if (template.isBoss) {
          const bossDrops = this.rollBossRareDrop(template, dungeonLevel);
          for (const eq of bossDrops.equips) {
            result.equips.push(eq);
            result.logs.push({
              msg: `  ★ Boss掉落: [${eq.qualityName}] ${eq.name}`,
              color: eq.qualityColor,
            });
          }
          for (const matId of bossDrops.materials) {
            result.materials.push(matId);
            const mat = MATERIALS[matId];
            result.logs.push({
              msg: `  ★ Boss掉落: ${mat ? mat.name : matId}`,
              color: '#f80',
            });
          }
        } else {
          const trash = this.rollTrashDrop(template, dungeonLevel);
          if (trash) {
            result.equips.push(trash);
            result.logs.push({
              msg: `  掉落: [${trash.qualityName}] ${trash.name}`,
              color: trash.qualityColor,
            });
          }
        }
      }

      if (dungeon.materialDrop && dungeon.materialDrop.length > 0) {
        const count = randInt(1, 3);
        for (let j = 0; j < count; j++) {
          result.materials.push(pickRandom(dungeon.materialDrop));
        }
      }
    }

    result.completed = true;
    this.rollSetDrops(dungeon, result, dungeonLevel);
    this.applyRewards(result);

    for (const eq of result.equips) {
      this.player.addToBag(eq);
    }

    return result;
  }

  runOnce(dungeonId) {
    const dungeon = this.getDungeon(dungeonId);
    if (!dungeon) return { error: '副本不存在' };

    const dungeonLevel = dungeon.unlock.level || 1;
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
        const template = stage.isBoss
          ? stage.monsters[0]
          : pickRandom(stage.monsters);
        const br = battle.fight(template, false);

        if (!br.won) {
          result.diedAt = stage.name;
          this.applyRewards(result);
          return result;
        }

        result.exp += br.expReward;
        result.gold += br.goldReward;

        if (template.isBoss) {
          const bossDrops = this.rollBossRareDrop(template, dungeonLevel);
          result.equips.push(...bossDrops.equips);
          result.materials.push(...bossDrops.materials);
        } else {
          const trash = this.rollTrashDrop(template, dungeonLevel);
          if (trash) result.equips.push(trash);
        }
      }

      if (dungeon.materialDrop && dungeon.materialDrop.length > 0) {
        const count = randInt(1, 3);
        for (let j = 0; j < count; j++) {
          result.materials.push(pickRandom(dungeon.materialDrop));
        }
      }
    }

    result.completed = true;
    this.rollSetDrops(dungeon, result, dungeonLevel);
    this.applyRewards(result);

    return result;
  }

  rollSetDrops(dungeon, result, dungeonLevel) {
    if (dungeon.dropPool && dungeon.dropPool.length > 0) {
      const dropCount = randInt(1, 2);
      for (let i = 0; i < dropCount; i++) {
        const template = pickRandom(dungeon.dropPool);
        const equip = generateEquip(template, dungeonLevel);
        result.equips.push(equip);
      }
    }

    if (
      dungeon.blueprintDrop
      && dungeon.blueprintDrop.length > 0
      && rand() < 0.15
    ) {
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
