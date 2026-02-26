import Player from './player';
import DungeonRunner from './dungeon';
import ForgeSystem from './forge';
import { enhanceEquip, formatEquip, getEnhanceCost, getEnhanceRate } from './equipment';
import { saveGame, loadGame, deleteSave, hasSave } from './save';
import { DUNGEONS } from '../data/dungeons';
import { MATERIALS, BLUEPRINTS } from '../data/materials';
import { EQUIP_SLOT_NAMES, EQUIP_SLOTS, MAX_LEVEL, EXP_TABLE, BAG_MAX_SIZE, FIGHT_LOG_INTERVAL_MS, AFK_RUN_INTERVAL_MS, SELL_PRICE } from '../data/config';
import { PLAYER_SKILLS } from '../data/skills';
import createLogger from '../core/log';

export default class Game {
  constructor() {
    this.logger = createLogger();
    this.player = null;
    this.dungeonRunner = null;
    this.forgeSystem = null;

    this.fightTimer = null;
    this.afkTimer = null;
    this.afkSummary = null;
    this.afkPendingEquips = [];
  }

  boot() {
    this.logger.log('='.repeat(40), { color: '#888' });
    this.logger.log('          执 剑 - 文字冒险游戏', { color: '#f80', fontSize: '16px' });
    this.logger.log('='.repeat(40), { color: '#888' });
    this.logger.log('');

    if (hasSave()) {
      this.logger.log('检测到存档，正在加载...', { color: '#0af' });
      const data = loadGame();
      this.player = new Player(data);
      this.logger.log(`欢迎回来，${this.player.name}！(Lv.${this.player.level})`, { color: '#2d8f2d' });
    } else {
      this.logger.log('没有找到存档，创建新角色...', { color: '#0af' });
      this.player = new Player();
    }

    this.dungeonRunner = new DungeonRunner(this.player);
    this.forgeSystem = new ForgeSystem(this.player, this.logger);

    if (!this.player.tutorialDone) {
      this.runTutorial();
    } else {
      this.logger.log('');
      this.printHelp();
    }

    this.save();
  }

  save() {
    saveGame(this.player);
  }

  // ========== 教程 ==========

  runTutorial() {
    const L = this.logger;
    const steps = [
      { delay: 0, fn: () => {
        L.log('');
        L.chat('系统', null, '欢迎来到', { msg: '执剑', color: '#f80' }, '的世界！这是一段属于你的传奇故事。');
      }},
      { delay: 1500, fn: () => {
        L.chat('系统', null, '在这里，你需要先', { msg: '手动通关', color: '#c08b00' }, '副本，然后才能解锁', { msg: '挂机刷取', color: '#2d8f2d' }, '。');
      }},
      { delay: 1500, fn: () => {
        L.chat('系统', null, '当然，我们就是这样一个', { msg: '肤浅', color: 'red' }, '的摸鱼游戏，哈哈哈哈哈。');
      }},
      { delay: 2000, fn: () => {
        L.log('');
        L.log('  ——— 新手引导 ———', { color: '#f80', fontSize: '13px' });
        L.log('');
      }},
      { delay: 500, fn: () => {
        L.chat('向导', { color: '#0af', font: 'bold 12px' },
          '所有指令通过 ', { msg: 'h.xxx()', color: '#c08b00' }, ' 在控制台输入。');
      }},
      { delay: 1500, fn: () => {
        L.chat('向导', { color: '#0af', font: 'bold 12px' },
          '输入 ', { msg: 'h.fight("green_forest")', color: '#c08b00' }, ' 手动挑战副本，会展示详细战斗过程。');
      }},
      { delay: 1500, fn: () => {
        L.chat('向导', { color: '#0af', font: 'bold 12px' },
          '通关后解锁挂机，输入 ', { msg: 'h.go("green_forest", 10)', color: '#c08b00' }, ' 自动刷取。');
      }},
      { delay: 1500, fn: () => {
        L.chat('向导', { color: '#0af', font: 'bold 12px' },
          '挂机结束后会展示所有掉落装备，用 ', { msg: 'h.sell(n)', color: '#c08b00' }, ' 卖掉不要的（直接换金币）。');
      }},
      { delay: 1500, fn: () => {
        L.chat('向导', { color: '#0af', font: 'bold 12px' },
          '背包上限 ', { msg: BAG_MAX_SIZE + '格', color: '#f80' }, '，装备可以强化、锻造，集齐套装更强！');
      }},
      { delay: 1500, fn: () => {
        L.log('');
        L.chat('系统', null, '好了，冒险者，去闯荡吧！输入 ', { msg: 'h.help()', color: '#c08b00' }, ' 随时查看所有指令。');
      }},
      { delay: 1500, fn: () => {
        L.log('');
        this.printHelp();
        this.player.tutorialDone = true;
        this.save();
      }},
    ];

    let totalDelay = 0;
    for (const step of steps) {
      totalDelay += step.delay;
      setTimeout(step.fn, totalDelay);
    }
  }

  isBusy() {
    return this.fightTimer !== null || this.afkTimer !== null;
  }

  isAfk() {
    return this.afkTimer !== null;
  }

  isFighting() {
    return this.fightTimer !== null;
  }

  guardBusy() {
    if (this.fightTimer) {
      this.logger.log('战斗进行中，请等待战斗结束。', { color: '#f80' });
      return true;
    }
    if (this.afkTimer) {
      this.logger.log('正在挂机中，请先 h.stop() 停止挂机。', { color: '#f80' });
      return true;
    }
    return false;
  }

  // ========== 帮助 ==========

  printHelp() {
    this.logger.log('输入 h.help() 查看所有指令', { color: '#888' });
    this.logger.log('');
    const cmds = [
      ['h.status()', '查看角色状态'],
      ['h.skills()', '查看已解锁技能'],
      ['', ''],
      ['h.bag()', `查看背包 (上限${BAG_MAX_SIZE})`],
      ['h.look(n)', '查看背包中第n件装备详情'],
      ['h.equips()', '查看已装备的装备'],
      ['h.equip(n)', '装备背包中第n件装备'],
      ['h.unequip(slot)', '卸下装备 (weapon/armor/helmet/ring/necklace)'],
      ['h.drop(n)', '丢弃背包中第n件装备'],
      ['h.sell(n)', '出售背包中第n件装备换金币'],
      ['h.sellAll(quality)', '批量出售指定品质 ("white"/"green"等)'],
      ['', ''],
      ['h.dungeons()', '查看副本列表与解锁状态'],
      ['h.fight(id)', '手动挑战副本 (逐回合展示战斗，首次通关解锁挂机)'],
      ['h.go(id, n)', '挂机刷副本n次 (需已通关，死亡自动停止)'],
      ['h.stop()', '停止挂机，展示收益'],
      ['', ''],
      ['h.mats()', '查看材料'],
      ['h.bps()', '查看图纸'],
      ['h.forge(id)', '锻造装备'],
      ['h.enhance(slot)', '强化装备'],
      ['', ''],
      ['h.save()', '手动保存'],
      ['h.reset()', '删档重来'],
      ['h.help()', '显示帮助'],
    ];

    for (const [cmd, desc] of cmds) {
      if (!cmd) { this.logger.log(''); continue; }
      this.logger.log(`  ${cmd.padEnd(28)} ${desc}`);
    }
    this.logger.log('');
  }

  // ========== 角色信息 ==========

  printStatus() {
    const p = this.player;
    const stats = p.getFinalStats();
    const { activeSetDescs } = p.getSetBonuses();

    this.logger.log('\n====== 角色状态 ======', { color: '#0af' });
    this.logger.log(`  名称: ${p.name}`);
    this.logger.log(`  等级: Lv.${p.level} / ${MAX_LEVEL}`);

    if (p.level < MAX_LEVEL) {
      this.logger.log(`  经验: ${p.exp} / ${EXP_TABLE[p.level]}`);
    } else {
      this.logger.log('  经验: 已满级');
    }

    this.logger.log(`  金币: ${p.gold}`);
    this.logger.log(`  背包: ${p.bag.length} / ${BAG_MAX_SIZE}`);
    this.logger.log('');
    this.logger.log('  --- 属性 ---', { color: '#0af' });
    this.logger.log(`  生命: ${stats.hp}`);
    this.logger.log(`  攻击: ${stats.atk}`);
    this.logger.log(`  防御: ${stats.def}`);
    this.logger.log(`  速度: ${stats.speed}`);
    this.logger.log(`  暴击率: ${stats.crit}%`);
    this.logger.log(`  暴击伤害: ${stats.critDmg}%`);

    if (activeSetDescs.length > 0) {
      this.logger.log('');
      this.logger.log('  --- 套装效果 ---', { color: '#f80' });
      for (const desc of activeSetDescs) {
        this.logger.log(`  ${desc}`, { color: '#f80' });
      }
    }

    if (Object.keys(p.buffs).length > 0) {
      this.logger.log('');
      this.logger.log('  --- 永久Buff ---', { color: '#2d8f2d' });
      for (const [stat, val] of Object.entries(p.buffs)) {
        this.logger.log(`  ${stat}: +${val}%`);
      }
    }
    this.logger.log('');
  }

  printSkills() {
    this.logger.log('\n====== 技能列表 ======', { color: '#0af' });
    for (const s of PLAYER_SKILLS) {
      const unlocked = this.player.level >= s.unlockLevel;
      const status = unlocked ? '✓' : `Lv.${s.unlockLevel}解锁`;
      const color = unlocked ? '#2d8f2d' : '#888';
      this.logger.log(`  [${status}] ${s.name} - ${s.desc} (CD: ${s.cooldown}回合)`, { color });
    }
    this.logger.log('');
  }

  // ========== 背包 ==========

  printBag() {
    const bag = this.player.bag;
    this.logger.log('\n====== 背包 ======', { color: '#0af' });

    if (bag.length === 0) {
      this.logger.log('  背包是空的。');
    } else {
      for (let i = 0; i < bag.length; i++) {
        const e = bag[i];
        const enhance = e.enhanceLevel > 0 ? `+${e.enhanceLevel}` : '';
        const price = SELL_PRICE[e.quality] || 0;
        this.logger.log(`  [${i}] [${e.qualityName}] ${e.name}${enhance} (${e.slotName}) 售:${price}g`, { color: e.qualityColor });
      }
    }

    this.logger.log(`\n  ${bag.length} / ${BAG_MAX_SIZE}`);
    this.logger.log('  h.equip(n) 装备 | h.look(n) 详情 | h.sell(n) 出售 | h.drop(n) 丢弃');
    this.logger.log('');
  }

  printEquips() {
    this.logger.log('\n====== 已装备 ======', { color: '#0af' });

    for (const slot of EQUIP_SLOTS) {
      const equip = this.player.equipment[slot];
      const slotName = EQUIP_SLOT_NAMES[slot];

      if (equip) {
        this.logger.log(`\n  [${slotName}]`, { color: '#0af' });
        for (const line of formatEquip(equip).split('\n')) {
          this.logger.log(`  ${line}`, { color: equip.qualityColor });
        }
      } else {
        this.logger.log(`  [${slotName}] 空`, { color: '#888' });
      }
    }
    this.logger.log('');
  }

  equipItem(index) {
    if (this.guardBusy()) return;
    if (index < 0 || index >= this.player.bag.length) {
      this.logger.log('无效的背包序号！', { color: '#f00' });
      return;
    }

    const result = this.player.equip(index);
    if (result) {
      this.logger.log(`装备了 [${result.equipped.qualityName}] ${result.equipped.name}`, { color: '#2d8f2d' });
      if (result.unequipped) {
        this.logger.log(`卸下了 [${result.unequipped.qualityName}] ${result.unequipped.name} (放入背包)`, { color: '#888' });
      }
      this.save();
    }
  }

  unequipItem(slot) {
    if (this.guardBusy()) return;
    if (!EQUIP_SLOTS.includes(slot)) {
      this.logger.log(`无效的装备槽位！可选: ${EQUIP_SLOTS.join(', ')}`, { color: '#f00' });
      return;
    }

    if (this.player.isBagFull()) {
      this.logger.log('背包已满，无法卸下装备！请先清理背包。', { color: '#f00' });
      return;
    }

    const item = this.player.unequip(slot);
    if (item) {
      this.logger.log(`卸下了 [${item.qualityName}] ${item.name}`, { color: '#888' });
      this.save();
    } else {
      this.logger.log('该槽位没有装备。', { color: '#888' });
    }
  }

  dropItem(index) {
    if (index < 0 || index >= this.player.bag.length) {
      this.logger.log('无效的背包序号！', { color: '#f00' });
      return;
    }
    const item = this.player.removeFromBag(index);
    if (item) {
      this.logger.log(`丢弃了 [${item.qualityName}] ${item.name}`, { color: '#888' });
      this.save();
    }
  }

  sellItem(index) {
    if (index < 0 || index >= this.player.bag.length) {
      this.logger.log('无效的背包序号！', { color: '#f00' });
      return;
    }
    const result = this.player.sellFromBag(index);
    if (result) {
      this.logger.log(`出售 [${result.item.qualityName}] ${result.item.name} => +${result.price}g (金币: ${this.player.gold})`, { color: '#c08b00' });
      this.save();
    }
  }

  sellAllByQuality(quality) {
    const validQualities = ['white', 'green', 'blue', 'purple', 'orange'];
    if (!validQualities.includes(quality)) {
      this.logger.log(`无效品质！可选: ${validQualities.join(', ')}`, { color: '#f00' });
      return;
    }

    let totalGold = 0;
    let count = 0;

    for (let i = this.player.bag.length - 1; i >= 0; i--) {
      if (this.player.bag[i].quality === quality) {
        const result = this.player.sellFromBag(i);
        if (result) {
          totalGold += result.price;
          count++;
        }
      }
    }

    if (count === 0) {
      this.logger.log('背包中没有该品质的装备。', { color: '#888' });
    } else {
      this.logger.log(`批量出售 ${count} 件装备 => +${totalGold}g (金币: ${this.player.gold})`, { color: '#c08b00' });
      this.save();
    }
  }

  inspectBagItem(index) {
    if (index < 0 || index >= this.player.bag.length) {
      this.logger.log('无效的背包序号！', { color: '#f00' });
      return;
    }
    const equip = this.player.bag[index];
    this.logger.log('');
    for (const line of formatEquip(equip).split('\n')) {
      this.logger.log(line, { color: equip.qualityColor });
    }
    const price = SELL_PRICE[equip.quality] || 0;
    this.logger.log(`  售价: ${price}g`, { color: '#c08b00' });
    this.logger.log('');
  }

  // ========== 副本 ==========

  printDungeons() {
    this.logger.log('\n====== 副本列表 ======', { color: '#0af' });
    for (const d of DUNGEONS) {
      const check = this.dungeonRunner.checkUnlock(d);
      const cleared = this.player.hasDungeonCleared(d.id);

      let statusTag;
      let color;
      if (cleared) {
        statusTag = '✓ 已通关';
        color = '#2d8f2d';
      } else if (check.ok) {
        statusTag = '可挑战';
        color = '#c08b00';
      } else {
        statusTag = check.reason;
        color = '#888';
      }

      const afkTag = cleared ? ' [可挂机]' : '';
      this.logger.log(`  [${statusTag}] ${d.name} (${d.id}) - ${d.stages.length}关${afkTag}`, { color });
      this.logger.log(`    ${d.desc}`, { color: '#888' });
    }
    this.logger.log('\n  h.fight("id") 手动挑战 | h.go("id", n) 挂机(需已通关)');
    this.logger.log('');
  }

  // ========== 手动战斗 (逐回合展示) ==========

  fightDungeon(dungeonId) {
    if (this.guardBusy()) return;

    const dungeon = this.dungeonRunner.getDungeon(dungeonId);
    if (!dungeon) {
      this.logger.log('副本不存在！', { color: '#f00' });
      return;
    }

    const check = this.dungeonRunner.checkUnlock(dungeon);
    if (!check.ok) {
      this.logger.log(`无法进入: ${check.reason}`, { color: '#f00' });
      return;
    }

    this.logger.log(`\n========== 挑战副本: ${dungeon.name} ==========`, { color: '#f80' });
    this.logger.log(dungeon.desc, { color: '#888' });

    const result = this.dungeonRunner.fightThrough(dungeonId);

    if (result.error) {
      this.logger.log(result.error, { color: '#f00' });
      return;
    }

    const logQueue = [...result.logs];
    let idx = 0;

    this.fightTimer = setInterval(() => {
      if (idx >= logQueue.length) {
        clearInterval(this.fightTimer);
        this.fightTimer = null;
        this.onFightComplete(dungeonId, dungeon, result);
        return;
      }

      const log = logQueue[idx++];
      this.logger.log(log.msg, { color: log.color });
    }, FIGHT_LOG_INTERVAL_MS);
  }

  onFightComplete(dungeonId, dungeon, result) {
    if (result.completed) {
      const wasCleared = this.player.hasDungeonCleared(dungeonId);
      this.player.markDungeonCleared(dungeonId);

      this.logger.log(`\n========== 副本通关: ${dungeon.name} ==========`, { color: '#2d8f2d' });

      if (!wasCleared) {
        this.logger.log(`★ 首次通关！已解锁「${dungeon.name}」的挂机模式`, { color: '#c08b00' });
      }
    }

    this.printFightRewards(result);

    if (result.leveledUp) {
      this.logger.log(`★ 升级了！当前等级: Lv.${result.newLevel}`, { color: '#c08b00' });
    }

    this.save();
  }

  printFightRewards(result) {
    this.logger.log('\n--- 奖励 ---', { color: '#0af' });
    this.logger.log(`  经验: +${result.exp}`, { color: '#2d8f2d' });
    this.logger.log(`  金币: +${result.gold}`, { color: '#c08b00' });

    if (result.equips.length > 0) {
      this.logger.log('  装备:', { color: '#a0f' });
      for (const eq of result.equips) {
        this.logger.log(`    [${eq.qualityName}] ${eq.name} (${eq.slotName})`, { color: eq.qualityColor });
      }
    }

    if (result.materials.length > 0) {
      const mc = {};
      for (const id of result.materials) mc[id] = (mc[id] || 0) + 1;
      this.logger.log('  材料:', { color: '#0af' });
      for (const [id, count] of Object.entries(mc)) {
        const mat = MATERIALS[id];
        this.logger.log(`    ${mat ? mat.name : id} x${count}`);
      }
    }

    if (result.blueprints.length > 0) {
      this.logger.log('  图纸:', { color: '#f80' });
      for (const id of result.blueprints) {
        const bp = BLUEPRINTS[id];
        this.logger.log(`    ${bp ? bp.name : id}`, { color: '#f80' });
      }
    }
    this.logger.log('');
  }

  // ========== 挂机 ==========

  startAfk(dungeonId, times = 10) {
    if (this.guardBusy()) return;

    const dungeon = this.dungeonRunner.getDungeon(dungeonId);
    if (!dungeon) {
      this.logger.log('副本不存在！', { color: '#f00' });
      return;
    }

    if (!this.player.hasDungeonCleared(dungeonId)) {
      this.logger.log(`需要先 h.fight("${dungeonId}") 手动通关后才能挂机！`, { color: '#f00' });
      return;
    }

    const check = this.dungeonRunner.checkUnlock(dungeon);
    if (!check.ok) {
      this.logger.log(`无法进入: ${check.reason}`, { color: '#f00' });
      return;
    }

    times = Math.max(1, Math.floor(times));

    this.afkPendingEquips = [];
    this.afkSummary = {
      dungeonId,
      dungeonName: dungeon.name,
      targetTimes: times,
      completed: 0,
      failed: 0,
      totalExp: 0,
      totalGold: 0,
      materials: {},
      blueprints: [],
      levelUps: [],
      startLevel: this.player.level,
      startTime: Date.now(),
    };

    this.logger.log(`\n开始挂机: ${dungeon.name} x${times}`, { color: '#f80' });
    this.logger.log('挂机中... 输入 h.stop() 停止并查看收益 (死亡自动停止)', { color: '#888' });
    this.logger.log('');

    let runCount = 0;

    this.afkTimer = setInterval(() => {
      if (runCount >= times) {
        this.stopAfk();
        return;
      }

      const result = this.dungeonRunner.runOnce(dungeonId);
      runCount++;

      if (result.error) {
        this.logger.log(`挂机异常: ${result.error}`, { color: '#f00' });
        this.stopAfk();
        return;
      }

      const s = this.afkSummary;

      if (result.completed) {
        s.completed++;
      } else {
        s.failed++;
      }

      s.totalExp += result.exp;
      s.totalGold += result.gold;

      for (const eq of result.equips) {
        this.afkPendingEquips.push(eq);
      }
      for (const matId of result.materials) {
        s.materials[matId] = (s.materials[matId] || 0) + 1;
      }
      for (const bpId of result.blueprints) {
        s.blueprints.push(bpId);
      }
      if (result.leveledUp) {
        s.levelUps.push(result.newLevel);
      }

      const progress = `[${runCount}/${times}]`;
      const statusText = result.completed ? '通关' : `失败(${result.diedAt})`;
      const lvlText = result.leveledUp ? ` ★Lv.${result.newLevel}` : '';
      this.logger.log(`  ${progress} ${statusText} +${result.exp}exp +${result.gold}g${lvlText}`, {
        color: result.completed ? '#2d8f2d' : '#f44',
      });

      this.save();

      if (!result.completed) {
        this.logger.log('  ✗ 战斗失败，挂机自动停止。', { color: '#f44' });
        this.stopAfk();
      }
    }, AFK_RUN_INTERVAL_MS);
  }

  stopAfk() {
    if (!this.isAfk()) {
      this.logger.log('当前没有在挂机。', { color: '#888' });
      return;
    }

    clearInterval(this.afkTimer);
    this.afkTimer = null;

    const s = this.afkSummary;
    if (!s) return;

    const elapsed = ((Date.now() - s.startTime) / 1000).toFixed(1);

    this.logger.log('');
    this.logger.log('='.repeat(48), { color: '#f80' });
    this.logger.log('            挂 机 收 益 汇 总', { color: '#f80', fontSize: '14px' });
    this.logger.log('='.repeat(48), { color: '#f80' });
    this.logger.log(`  副本: ${s.dungeonName}`, { color: '#0af' });
    this.logger.log(`  耗时: ${elapsed}秒`);
    this.logger.log(`  通关: ${s.completed}次 | 失败: ${s.failed}次 (共${s.completed + s.failed}/${s.targetTimes})`);
    this.logger.log('');

    this.logger.log('  --- 收益 ---', { color: '#0af' });
    this.logger.log(`  经验: +${s.totalExp}`, { color: '#2d8f2d' });
    this.logger.log(`  金币: +${s.totalGold}`, { color: '#c08b00' });

    if (s.levelUps.length > 0) {
      this.logger.log(`  升级: Lv.${s.startLevel} → Lv.${s.levelUps[s.levelUps.length - 1]} (升了${s.levelUps.length}次)`, { color: '#c08b00' });
    }

    const matEntries = Object.entries(s.materials);
    if (matEntries.length > 0) {
      this.logger.log('');
      this.logger.log('  --- 材料 ---', { color: '#0af' });
      for (const [id, count] of matEntries) {
        const mat = MATERIALS[id];
        this.logger.log(`    ${mat ? mat.name : id} x${count}`);
      }
    }

    if (s.blueprints.length > 0) {
      this.logger.log('');
      this.logger.log('  --- 图纸 ---', { color: '#f80' });
      for (const id of s.blueprints) {
        const bp = BLUEPRINTS[id];
        this.logger.log(`    ${bp ? bp.name : id}`, { color: '#f80' });
      }
    }

    const pending = this.afkPendingEquips;
    if (pending.length > 0) {
      this.logger.log('');
      this.logger.log(`  --- 待处理装备 (${pending.length}件) ---`, { color: '#a0f' });
      this.logger.log('  以下装备尚未放入背包，请选择保留或出售:', { color: '#888' });
      for (let i = 0; i < pending.length; i++) {
        const eq = pending[i];
        const price = SELL_PRICE[eq.quality] || 0;
        this.logger.log(`    [${i}] [${eq.qualityName}] ${eq.name} (${eq.slotName}) 售:${price}g`, { color: eq.qualityColor });
      }
      this.logger.log('');
      this.logger.log('  h.keep(n)      保留第n件到背包', { color: '#888' });
      this.logger.log('  h.keepAll()    全部保留到背包', { color: '#888' });
      this.logger.log('  h.trash(n)     出售第n件换金币', { color: '#888' });
      this.logger.log('  h.trashAll()   全部出售换金币', { color: '#888' });
      this.logger.log('  h.pending()    再次查看待处理列表', { color: '#888' });
    }

    this.logger.log('');
    this.logger.log(`  当前: Lv.${this.player.level} | 金币:${this.player.gold} | 背包:${this.player.bag.length}/${BAG_MAX_SIZE}`);
    this.logger.log('='.repeat(48), { color: '#f80' });
    this.logger.log('');

    this.afkSummary = null;
    this.save();
  }

  // ========== 待处理装备 ==========

  hasPending() {
    return this.afkPendingEquips.length > 0;
  }

  printPending() {
    const pending = this.afkPendingEquips;
    if (pending.length === 0) {
      this.logger.log('没有待处理的装备。', { color: '#888' });
      return;
    }

    this.logger.log(`\n====== 待处理装备 (${pending.length}件) ======`, { color: '#a0f' });
    for (let i = 0; i < pending.length; i++) {
      const eq = pending[i];
      const price = SELL_PRICE[eq.quality] || 0;
      this.logger.log(`  [${i}] [${eq.qualityName}] ${eq.name} (${eq.slotName}) 售:${price}g`, { color: eq.qualityColor });
    }
    this.logger.log(`\n  h.keep(n) 保留 | h.trash(n) 出售 | h.keepAll() 全留 | h.trashAll() 全卖`);
    this.logger.log('');
  }

  keepPending(index) {
    const pending = this.afkPendingEquips;
    if (index < 0 || index >= pending.length) {
      this.logger.log('无效序号！', { color: '#f00' });
      return;
    }

    if (this.player.isBagFull()) {
      this.logger.log('背包已满！请先清理背包。', { color: '#f00' });
      return;
    }

    const eq = pending.splice(index, 1)[0];
    this.player.addToBag(eq);
    this.logger.log(`保留 [${eq.qualityName}] ${eq.name} → 背包 (${this.player.bag.length}/${BAG_MAX_SIZE})`, { color: '#2d8f2d' });
    this.save();
  }

  keepAllPending() {
    const pending = this.afkPendingEquips;
    if (pending.length === 0) {
      this.logger.log('没有待处理的装备。', { color: '#888' });
      return;
    }

    let kept = 0;
    let full = 0;
    while (pending.length > 0) {
      if (this.player.isBagFull()) {
        full = pending.length;
        break;
      }
      const eq = pending.shift();
      this.player.addToBag(eq);
      kept++;
    }

    this.logger.log(`保留了 ${kept} 件装备到背包 (${this.player.bag.length}/${BAG_MAX_SIZE})`, { color: '#2d8f2d' });
    if (full > 0) {
      this.logger.log(`背包已满，剩余 ${full} 件未处理，请先清理背包或 h.trashAll() 出售`, { color: '#f80' });
    }
    this.save();
  }

  trashPending(index) {
    const pending = this.afkPendingEquips;
    if (index < 0 || index >= pending.length) {
      this.logger.log('无效序号！', { color: '#f00' });
      return;
    }

    const eq = pending.splice(index, 1)[0];
    const price = SELL_PRICE[eq.quality] || 0;
    this.player.addGold(price);
    this.logger.log(`出售 [${eq.qualityName}] ${eq.name} => +${price}g (金币: ${this.player.gold})`, { color: '#c08b00' });
    this.save();
  }

  trashAllPending() {
    const pending = this.afkPendingEquips;
    if (pending.length === 0) {
      this.logger.log('没有待处理的装备。', { color: '#888' });
      return;
    }

    let totalGold = 0;
    let count = pending.length;
    while (pending.length > 0) {
      const eq = pending.shift();
      const price = SELL_PRICE[eq.quality] || 0;
      this.player.addGold(price);
      totalGold += price;
    }

    this.logger.log(`出售了 ${count} 件装备 => +${totalGold}g (金币: ${this.player.gold})`, { color: '#c08b00' });
    this.save();
  }

  // ========== 材料 & 图纸 ==========

  printMaterials() {
    this.logger.log('\n====== 材料 ======', { color: '#0af' });

    let hasAny = false;
    for (const [id, count] of Object.entries(this.player.materials)) {
      if (count <= 0) continue;
      hasAny = true;
      const mat = MATERIALS[id];
      this.logger.log(`  ${mat ? mat.name : id}: ${count}`);
    }

    if (!hasAny) {
      this.logger.log('  没有任何材料。');
    }
    this.logger.log('');
  }

  printBlueprints() {
    const bps = this.forgeSystem.getAvailableBlueprints();

    this.logger.log('\n====== 图纸 ======', { color: '#0af' });

    if (bps.length === 0) {
      this.logger.log('  没有任何图纸。刷副本获取！');
    } else {
      for (const bp of bps) {
        this.logger.log(`\n  ${bp.name} (${bp.id})`, { color: '#f80' });
        this.logger.log(`    产出: ${bp.result.name}`);
        this.logger.log(`    金币: ${bp.goldCost}`);
        const matStr = Object.entries(bp.materials)
          .map(([id, count]) => {
            const mat = MATERIALS[id];
            const have = this.player.materials[id] || 0;
            return `${mat ? mat.name : id} ${have}/${count}`;
          })
          .join(', ');
        this.logger.log(`    材料: ${matStr}`);
      }
    }
    this.logger.log('\n  使用 h.forge("图纸id") 锻造');
    this.logger.log('');
  }

  forgeItem(blueprintId) {
    if (this.guardBusy()) return;

    if (this.player.isBagFull()) {
      this.logger.log('背包已满，无法锻造！请先清理背包。', { color: '#f00' });
      return;
    }

    const equip = this.forgeSystem.forge(blueprintId);
    if (equip) {
      this.save();
    }
    return equip;
  }

  // ========== 强化 ==========

  enhanceItem(slot) {
    if (this.guardBusy()) return;

    if (!EQUIP_SLOTS.includes(slot)) {
      this.logger.log(`无效的装备槽位！可选: ${EQUIP_SLOTS.join(', ')}`, { color: '#f00' });
      return;
    }

    const equip = this.player.equipment[slot];
    if (!equip) {
      this.logger.log(`${EQUIP_SLOT_NAMES[slot]}槽位没有装备！`, { color: '#f00' });
      return;
    }

    const cost = getEnhanceCost(equip);
    const rate = getEnhanceRate(equip);

    if (rate <= 0) {
      this.logger.log('已达最大强化等级！', { color: '#f00' });
      return;
    }

    this.logger.log(`\n强化 [${equip.qualityName}] ${equip.name} +${equip.enhanceLevel}`, { color: '#0af' });
    this.logger.log(`  费用: ${cost} 金币 (当前: ${this.player.gold})`, { color: '#888' });
    this.logger.log(`  成功率: ${(rate * 100).toFixed(0)}%`, { color: rate > 0.5 ? '#2d8f2d' : '#f80' });

    const result = enhanceEquip(equip, this.player.gold);

    if (result.reason === '金币不足') {
      this.logger.log(`  金币不足！需要 ${cost} 金币`, { color: '#f00' });
      return;
    }

    this.player.gold -= result.cost;

    if (result.success) {
      this.logger.log(`  强化成功！${equip.name} +${result.newLevel}`, { color: '#2d8f2d' });
    } else {
      const dropText = result.dropped > 0 ? ` (掉了${result.dropped}级)` : '';
      this.logger.log(`  强化失败！${equip.name} +${result.newLevel}${dropText}`, { color: '#f00' });
    }

    this.save();
  }

  // ========== 存档 ==========

  resetGame() {
    if (this.fightTimer) {
      clearInterval(this.fightTimer);
      this.fightTimer = null;
    }
    if (this.afkTimer) {
      clearInterval(this.afkTimer);
      this.afkTimer = null;
      this.afkSummary = null;
    }
    this.afkPendingEquips = [];

    deleteSave();
    this.player = new Player();
    this.dungeonRunner = new DungeonRunner(this.player);
    this.forgeSystem = new ForgeSystem(this.player, this.logger);
    this.save();
    this.logger.log('存档已删除，重新开始游戏！', { color: '#f80' });
  }
}
