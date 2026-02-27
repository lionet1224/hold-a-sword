import Player from './player';
import DungeonRunner from './dungeon';
import ForgeSystem from './forge';
import {
  enhanceEquip,
  formatEquip,
  getEnhanceCost,
  getEnhanceRate,
} from './equipment';
import { saveGame, loadGame, deleteSave, hasSave } from './save';
import { DUNGEONS } from '../data/dungeons';
import { MATERIALS, BLUEPRINTS } from '../data/materials';
import {
  EQUIP_SLOT_NAMES,
  EQUIP_SLOTS,
  MAX_LEVEL,
  EXP_TABLE,
  BAG_MAX_SIZE,
  FIGHT_LOG_INTERVAL_MS,
  AFK_RUN_INTERVAL_MS,
  SELL_PRICE,
} from '../data/config';
import { SKILL_TREE, getAllSkillsFlat } from '../data/skills';
import { CLASSES, CLASS_CHANGE_LEVEL, SUMMONS } from '../data/classes';
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
    this.logger.log('          执 剑 - 文字冒险游戏', {
      color: '#f80',
      fontSize: '16px',
    });
    this.logger.log('='.repeat(40), { color: '#888' });
    this.logger.log('');

    if (hasSave()) {
      this.logger.log('检测到存档，正在加载...', { color: '#0af' });
      const data = loadGame();
      this.player = new Player(data);
      const cls = this.player.getClassName();
      this.logger.log(
        `欢迎回来，${this.player.name}！(Lv.${this.player.level} ${cls})`,
        { color: '#2d8f2d' },
      );
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

  runTutorial() {
    const L = this.logger;
    const cmd = (text) => ({ msg: text, color: '#c08b00' });
    const hl = (text, color = '#f80') => ({ msg: text, color });

    const steps = [
      // ===== 开场 =====
      {
        delay: 0,
        fn: () => {
          L.log('');
          L.chat('系统', null, '欢迎来到', hl('执剑'), '的世界！');
        },
      },
      {
        delay: 1200,
        fn: () => {
          L.chat(
            '系统',
            null,
            '这是一款在',
            hl('浏览器控制台', '#0af'),
            '里运行的文字冒险游戏。',
          );
        },
      },
      {
        delay: 1200,
        fn: () => {
          L.chat(
            '系统',
            null,
            '适合上班摸鱼、上课划水、或者任何你想',
            hl('假装在忙', 'red'),
            '的时刻。',
          );
        },
      },

      // ===== 基础操作 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第一章：基础操作 ———', {
            color: '#f80',
            fontSize: '13px',
          });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '所有操作通过在控制台输入 ',
            cmd('h.xxx()'),
            ' 来执行。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '先来看看你的角色状态吧！输入 ',
            cmd('h.status()'),
            '。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '随时输入 ',
            cmd('h.help()'),
            ' 查看所有可用指令。',
          );
        },
      },

      // ===== 战斗系统 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第二章：战斗与副本 ———', {
            color: '#f80',
            fontSize: '13px',
          });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.dungeons()'),
            ' 查看可挑战的副本列表。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.fight("green_forest")'),
            ' 手动挑战「翠绿森林」。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '战斗会',
            hl('逐回合展示', '#2d8f2d'),
            '，你可以看到每一招的伤害。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '首次通关副本后，就能解锁该副本的',
            hl('挂机模式', '#2d8f2d'),
            '。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.go("green_forest", 10)'),
            ' 挂机刷10次。挂机中',
            hl('死亡会自动停止', '#f44'),
            '。',
          );
        },
      },

      // ===== 装备系统 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第三章：装备与背包 ———', {
            color: '#f80',
            fontSize: '13px',
          });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '打怪会掉落装备。',
            hl('小怪', '#888'),
            '掉垃圾过渡装备，',
            hl('Boss', '#f80'),
            '掉稀有装备和材料。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.bag()'),
            ' 查看背包，',
            cmd('h.equip(n)'),
            ' 装备第n件。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '不要的装备用 ',
            cmd('h.sell(n)'),
            ' 卖掉换金币，或 ',
            cmd('h.sellAll("white")'),
            ' 批量卖。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '集齐同套装的装备会激活',
            hl('套装效果', '#f80'),
            '，非常强力！',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '背包上限 ',
            hl(`${BAG_MAX_SIZE}格`),
            '。挂机结束后掉落会暂存，你可以慢慢挑选。',
          );
        },
      },

      // ===== 技能系统 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第四章：技能树 ———', {
            color: '#f80',
            fontSize: '13px',
          });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '每次升级获得 ',
            hl('1技能点', '#c08b00'),
            '，用来学习新技能。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.tree()'),
            ' 查看技能树。技能分为',
            hl('主动', '#2656c9'),
            '和',
            hl('被动', '#a0f'),
            '两种。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '主动技能在战斗中自动释放，被动技能永久生效。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.learn("double_strike")'),
            ' 学习「双重打击」试试！',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '技能有',
            hl('前置要求', '#888'),
            '，需要先学前置技能才能解锁后续。',
          );
        },
      },

      // ===== 转职系统 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第五章：转职 ———', { color: '#f80', fontSize: '13px' });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '达到 ',
            hl(`Lv.${CLASS_CHANGE_LEVEL}`),
            ' 后可以转职！',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '四大职业：',
            hl('战士', '#c44'),
            '、',
            hl('法师', '#a0f'),
            '、',
            hl('射手', '#2d8f2d'),
            '、',
            hl('召唤师', '#0af'),
            '。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '每个职业有独特的',
            hl('属性加成', '#c08b00'),
            '和专属',
            hl('技能树', '#a0f'),
            '（含被动技能）。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '召唤师还能召唤',
            hl('召唤兽', '#0af'),
            '协助战斗，非常有趣！',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.classes()'),
            ' 预览职业，',
            cmd('h.change("warrior")'),
            ' 转职。',
          );
        },
      },

      // ===== 锻造强化 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ——— 第六章：锻造与强化 ———', {
            color: '#f80',
            fontSize: '13px',
          });
          L.log('');
        },
      },
      {
        delay: 500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '刷副本会获得',
            hl('材料', '#0af'),
            '和',
            hl('图纸', '#f80'),
            '。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '输入 ',
            cmd('h.mats()'),
            ' 查看材料，',
            cmd('h.bps()'),
            ' 查看图纸。',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '用 ',
            cmd('h.forge("图纸id")'),
            ' 锻造强力装备。Boss掉落的',
            hl('稀有材料', '#f80'),
            '是关键！',
          );
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.chat(
            '向导',
            { color: '#0af', font: 'bold 12px' },
            '用 ',
            cmd('h.enhance("weapon")'),
            ' 强化已装备的武器。每级+10%属性，但',
            hl('可能失败掉级', '#f44'),
            '！',
          );
        },
      },

      // ===== 结束 =====
      {
        delay: 2000,
        fn: () => {
          L.log('');
          L.log('  ═══════════════════════════════', { color: '#f80' });
          L.log('');
        },
      },
      {
        delay: 300,
        fn: () => {
          L.chat(
            '系统',
            null,
            '引导结束！你的冒险从',
            hl('翠绿森林'),
            '开始。',
          );
        },
      },
      {
        delay: 1200,
        fn: () => {
          L.chat(
            '系统',
            null,
            '建议流程：',
            hl('打副本', '#2d8f2d'),
            ' → ',
            hl('穿装备', '#2656c9'),
            ' → ',
            hl('学技能', '#a0f'),
            ' → ',
            hl('挂机刷', '#c08b00'),
            ' → 循环！',
          );
        },
      },
      {
        delay: 1200,
        fn: () => {
          L.chat(
            '系统',
            null,
            '游戏会',
            hl('自动存档', '#2d8f2d'),
            '，也可以 ',
            cmd('h.save()'),
            ' 手动保存。',
          );
        },
      },
      {
        delay: 1200,
        fn: () => {
          L.chat('系统', null, '祝你摸鱼愉快，冒险者！');
        },
      },
      {
        delay: 1500,
        fn: () => {
          L.log('');
          this.printHelp();
          this.player.tutorialDone = true;
          this.save();
        },
      },
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
      this.logger.log('正在挂机中，请先 h.stop() 停止挂机。', {
        color: '#f80',
      });
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
      ['h.tree()', '查看技能树与已学技能'],
      ['h.learn("id")', '学习技能 (消耗技能点)'],
      ['', ''],
      ['h.classes()', '查看可转职业'],
      ['h.change("id")', `转职 (需Lv.${CLASS_CHANGE_LEVEL})`],
      ['h.summons()', '查看召唤兽 (召唤师专属)'],
      ['h.summon("id")', '切换召唤兽'],
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
      ['h.pending()', '查看挂机待处理装备'],
      ['h.keep(n)', '保留第n件到背包'],
      ['h.keepAll()', '全部保留到背包'],
      ['h.trash(n)', '出售第n件换金币'],
      ['h.trashAll()', '全部出售换金币'],
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
      if (!cmd) {
        this.logger.log('');
        continue;
      }
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
    this.logger.log(`  职业: ${p.getClassName()}`, {
      color: p.getClassData()?.color || '#888',
    });
    this.logger.log(`  等级: Lv.${p.level} / ${MAX_LEVEL}`);

    if (p.level < MAX_LEVEL) {
      this.logger.log(`  经验: ${p.exp} / ${EXP_TABLE[p.level]}`);
    } else {
      this.logger.log('  经验: 已满级');
    }

    this.logger.log(`  金币: ${p.gold}`);
    this.logger.log(`  技能点: ${p.skillPoints}`, {
      color: p.skillPoints > 0 ? '#c08b00' : '#888',
    });
    this.logger.log(`  背包: ${p.bag.length} / ${BAG_MAX_SIZE}`);
    this.logger.log('');
    this.logger.log('  --- 属性 ---', { color: '#0af' });
    this.logger.log(`  生命: ${stats.hp}`);
    this.logger.log(`  攻击: ${stats.atk}`);
    this.logger.log(`  防御: ${stats.def}`);
    this.logger.log(`  速度: ${stats.speed}`);
    this.logger.log(`  暴击率: ${stats.crit}%`);
    this.logger.log(`  暴击伤害: ${stats.critDmg}%`);

    const passiveSkills = this.getLearnedPassiveSkills();
    if (passiveSkills.length > 0) {
      this.logger.log('');
      this.logger.log('  --- 已学被动 ---', { color: '#a0f' });
      for (const ps of passiveSkills) {
        this.logger.log(`  ${ps.name}: ${ps.desc}`, { color: '#a0f' });
      }
    }

    const summonStats = p.getSummonStats();
    if (summonStats) {
      this.logger.log('');
      this.logger.log(`  --- 召唤兽: ${summonStats.name} ---`, {
        color: '#0af',
      });
      this.logger.log(
        `  生命: ${summonStats.maxHp} | 攻击: ${summonStats.atk} | 防御: ${summonStats.def}`,
      );
    }

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

  getLearnedPassiveSkills() {
    const allSkills = getAllSkillsFlat();
    return this.player.learnedSkills
      .map((id) => allSkills[id])
      .filter((s) => s && s.type === 'passive');
  }

  // ========== 技能树 ==========

  printSkillTree() {
    const p = this.player;
    const allSkills = getAllSkillsFlat();

    this.logger.log(`\n====== 技能树 ====== (技能点: ${p.skillPoints})`, {
      color: '#0af',
    });

    const treesToShow = ['common'];
    if (p.classId) treesToShow.push(p.classId);

    for (const treeId of treesToShow) {
      const tree = SKILL_TREE[treeId];
      if (!tree) continue;

      this.logger.log(`\n  ── ${tree.name} ──`, { color: tree.color });

      for (const [skillId, skill] of Object.entries(tree.skills)) {
        const learned = p.learnedSkills.includes(skillId);
        const canLearn = !learned && p.canLearnSkill(skillId).ok;

        let status;
        let color;
        if (learned) {
          status = '✓ 已学';
          color = '#2d8f2d';
        } else if (canLearn) {
          status = `可学(${skill.cost}点)`;
          color = '#c08b00';
        } else {
          status = `${skill.cost}点`;
          color = '#888';
        }

        const reqText = skill.requires.length > 0
          ? ` [需: ${skill.requires.map((r) => allSkills[r]?.name || r).join(', ')}]`
          : '';

        this.logger.log(
          `  [${status}] ${skill.name} - ${skill.desc}${reqText}`,
          { color },
        );
        if (canLearn) {
          this.logger.log(`         → h.learn("${skillId}")`, {
            color: '#888',
          });
        }
      }
    }

    if (!p.classId) {
      this.logger.log('');
      this.logger.log(
        `  达到 Lv.${CLASS_CHANGE_LEVEL} 后可转职解锁更多技能！`,
        { color: '#888' },
      );
    }

    this.logger.log('');
  }

  learnSkill(skillId) {
    if (this.guardBusy()) return;

    const result = this.player.learnSkill(skillId);
    if (!result.ok) {
      this.logger.log(`学习失败: ${result.reason}`, { color: '#f00' });
      return;
    }

    this.logger.log(`学会了 [${result.skill.name}] - ${result.skill.desc}`, {
      color: '#2d8f2d',
    });
    this.logger.log(`剩余技能点: ${this.player.skillPoints}`, {
      color: '#c08b00',
    });
    this.save();
  }

  // ========== 转职 ==========

  printClasses() {
    const p = this.player;
    this.logger.log('\n====== 职业列表 ======', { color: '#0af' });

    if (p.level < CLASS_CHANGE_LEVEL) {
      this.logger.log(
        `  需要达到 Lv.${CLASS_CHANGE_LEVEL} 才能转职 (当前 Lv.${p.level})`,
        { color: '#888' },
      );
      this.logger.log('');
      return;
    }

    for (const [id, cls] of Object.entries(CLASSES)) {
      const isCurrent = p.classId === id;
      const tag = isCurrent ? ' ← 当前' : '';
      this.logger.log(`\n  [${cls.name}] (${id})${tag}`, { color: cls.color });
      this.logger.log(`    ${cls.desc}`, { color: '#888' });

      const bonusText = Object.entries(cls.statBonus)
        .filter(([, v]) => v !== 1.0)
        .map(([k, v]) => `${k}${v > 1 ? '+' : ''}${Math.round((v - 1) * 100)}%`)
        .join(', ');
      if (bonusText) {
        this.logger.log(`    属性加成: ${bonusText}`, { color: '#888' });
      }
    }

    this.logger.log('\n  使用 h.change("职业id") 转职');
    this.logger.log('');
  }

  changeClass(classId) {
    if (this.guardBusy()) return;

    if (this.player.level < CLASS_CHANGE_LEVEL) {
      this.logger.log(
        `需要达到 Lv.${CLASS_CHANGE_LEVEL} 才能转职！(当前 Lv.${this.player.level})`,
        { color: '#f00' },
      );
      return;
    }

    if (!CLASSES[classId]) {
      this.logger.log('无效的职业！使用 h.classes() 查看可选职业。', {
        color: '#f00',
      });
      return;
    }

    const cls = CLASSES[classId];
    this.player.changeClass(classId);
    this.logger.log(`转职成功！你现在是 [${cls.name}]`, { color: cls.color });
    this.logger.log(
      '职业技能树已解锁，使用 h.tree() 查看并学习被动和主动技能！',
      { color: '#c08b00' },
    );
    this.save();
  }

  // ========== 召唤兽 ==========

  printSummons() {
    const p = this.player;
    if (p.classId !== 'summoner') {
      this.logger.log('只有召唤师才能使用召唤兽！', { color: '#f00' });
      return;
    }

    this.logger.log('\n====== 召唤兽 ======', { color: '#0af' });

    const summonSkills = p.getLearnedSummonSkills();
    if (summonSkills.length === 0) {
      this.logger.log(
        '  你还没有学习任何召唤技能！使用 h.tree() 查看技能树。',
        { color: '#888' },
      );
      this.logger.log('');
      return;
    }

    for (const skill of summonSkills) {
      const def = SUMMONS[skill.summonId];
      if (!def) continue;

      const isCurrent = p.activeSummon === skill.summonId;
      const tag = isCurrent ? ' ← 当前' : '';
      const stats = p.getSummonStats();

      this.logger.log(`\n  [${def.name}] (${skill.summonId})${tag}`, {
        color: '#0af',
      });
      this.logger.log(`    ${def.desc}`, { color: '#888' });
      if (isCurrent && stats) {
        this.logger.log(
          `    HP:${stats.maxHp} ATK:${stats.atk} DEF:${stats.def}`,
          { color: '#888' },
        );
      }
    }

    this.logger.log('\n  使用 h.summon("id") 切换召唤兽');
    this.logger.log('');
  }

  setSummon(summonId) {
    if (this.guardBusy()) return;

    if (this.player.classId !== 'summoner') {
      this.logger.log('只有召唤师才能使用召唤兽！', { color: '#f00' });
      return;
    }

    if (!SUMMONS[summonId]) {
      this.logger.log('无效的召唤兽！使用 h.summons() 查看。', {
        color: '#f00',
      });
      return;
    }

    const summonSkills = this.player.getLearnedSummonSkills();
    const hasSkill = summonSkills.some((s) => s.summonId === summonId);
    if (!hasSkill) {
      this.logger.log('你还没有学习对应的召唤技能！', { color: '#f00' });
      return;
    }

    this.player.setSummon(summonId);
    const def = SUMMONS[summonId];
    this.logger.log(`召唤兽切换为 [${def.name}]`, { color: '#0af' });
    this.save();
  }

  // ========== 背包 ==========

  printBag() {
    const { bag } = this.player;
    this.logger.log('\n====== 背包 ======', { color: '#0af' });

    if (bag.length === 0) {
      this.logger.log('  背包是空的。');
    } else {
      for (let i = 0; i < bag.length; i++) {
        const e = bag[i];
        const enhance = e.enhanceLevel > 0 ? `+${e.enhanceLevel}` : '';
        const price = SELL_PRICE[e.quality] || 0;
        this.logger.log(
          `  [${i}] [${e.qualityName}] ${e.name}${enhance} (${e.slotName}) 售:${price}g`,
          { color: e.qualityColor },
        );
      }
    }

    this.logger.log(`\n  ${bag.length} / ${BAG_MAX_SIZE}`);
    this.logger.log(
      '  h.equip(n) 装备 | h.look(n) 详情 | h.sell(n) 出售 | h.drop(n) 丢弃',
    );
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
      this.logger.log(
        `装备了 [${result.equipped.qualityName}] ${result.equipped.name}`,
        { color: '#2d8f2d' },
      );
      if (result.unequipped) {
        this.logger.log(
          `卸下了 [${result.unequipped.qualityName}] ${result.unequipped.name} (放入背包)`,
          { color: '#888' },
        );
      }
      this.save();
    }
  }

  unequipItem(slot) {
    if (this.guardBusy()) return;
    if (!EQUIP_SLOTS.includes(slot)) {
      this.logger.log(`无效的装备槽位！可选: ${EQUIP_SLOTS.join(', ')}`, {
        color: '#f00',
      });
      return;
    }

    if (this.player.isBagFull()) {
      this.logger.log('背包已满，无法卸下装备！请先清理背包。', {
        color: '#f00',
      });
      return;
    }

    const item = this.player.unequip(slot);
    if (item) {
      this.logger.log(`卸下了 [${item.qualityName}] ${item.name}`, {
        color: '#888',
      });
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
      this.logger.log(`丢弃了 [${item.qualityName}] ${item.name}`, {
        color: '#888',
      });
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
      this.logger.log(
        `出售 [${result.item.qualityName}] ${result.item.name} => +${result.price}g (金币: ${this.player.gold})`,
        { color: '#c08b00' },
      );
      this.save();
    }
  }

  sellAllByQuality(quality) {
    const validQualities = ['white', 'green', 'blue', 'purple', 'orange'];
    if (!validQualities.includes(quality)) {
      this.logger.log(`无效品质！可选: ${validQualities.join(', ')}`, {
        color: '#f00',
      });
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
      this.logger.log(
        `批量出售 ${count} 件装备 => +${totalGold}g (金币: ${this.player.gold})`,
        { color: '#c08b00' },
      );
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
      this.logger.log(
        `  [${statusTag}] ${d.name} (${d.id}) - ${d.stages.length}关${afkTag}`,
        { color },
      );
      this.logger.log(`    ${d.desc}`, { color: '#888' });
    }
    this.logger.log(
      '\n  h.fight("id") 手动挑战 | h.go("id", n) 挂机(需已通关)',
    );
    this.logger.log('');
  }

  // ========== 手动战斗 ==========

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

    this.logger.log(`\n========== 挑战副本: ${dungeon.name} ==========`, {
      color: '#f80',
    });
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

      this.logger.log(`\n========== 副本通关: ${dungeon.name} ==========`, {
        color: '#2d8f2d',
      });

      if (!wasCleared) {
        this.logger.log(`★ 首次通关！已解锁「${dungeon.name}」的挂机模式`, {
          color: '#c08b00',
        });
      }
    }

    this.printFightRewards(result);

    if (result.leveledUp) {
      this.logger.log(
        `★ 升级了！当前等级: Lv.${result.newLevel} (获得技能点)`,
        { color: '#c08b00' },
      );
      if (result.newLevel >= CLASS_CHANGE_LEVEL && !this.player.classId) {
        this.logger.log(
          `★ 已达到 Lv.${CLASS_CHANGE_LEVEL}，可以转职了！输入 h.classes() 查看`,
          { color: '#a0f' },
        );
      }
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
        this.logger.log(`    [${eq.qualityName}] ${eq.name} (${eq.slotName})`, {
          color: eq.qualityColor,
        });
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
      this.logger.log(`需要先 h.fight("${dungeonId}") 手动通关后才能挂机！`, {
        color: '#f00',
      });
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
    this.logger.log('挂机中... 输入 h.stop() 停止并查看收益 (死亡自动停止)', {
      color: '#888',
    });
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
      this.logger.log(
        `  ${progress} ${statusText} +${result.exp}exp +${result.gold}g${lvlText}`,
        {
          color: result.completed ? '#2d8f2d' : '#f44',
        },
      );

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
    this.logger.log('            挂 机 收 益 汇 总', {
      color: '#f80',
      fontSize: '14px',
    });
    this.logger.log('='.repeat(48), { color: '#f80' });
    this.logger.log(`  副本: ${s.dungeonName}`, { color: '#0af' });
    this.logger.log(`  耗时: ${elapsed}秒`);
    this.logger.log(
      `  通关: ${s.completed}次 | 失败: ${s.failed}次 (共${s.completed + s.failed}/${s.targetTimes})`,
    );
    this.logger.log('');

    this.logger.log('  --- 收益 ---', { color: '#0af' });
    this.logger.log(`  经验: +${s.totalExp}`, { color: '#2d8f2d' });
    this.logger.log(`  金币: +${s.totalGold}`, { color: '#c08b00' });

    if (s.levelUps.length > 0) {
      this.logger.log(
        `  升级: Lv.${s.startLevel} → Lv.${s.levelUps[s.levelUps.length - 1]} (升了${s.levelUps.length}次)`,
        { color: '#c08b00' },
      );
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
      this.logger.log(`  --- 待处理装备 (${pending.length}件) ---`, {
        color: '#a0f',
      });
      this.logger.log('  以下装备尚未放入背包，请选择保留或出售:', {
        color: '#888',
      });
      for (let i = 0; i < pending.length; i++) {
        const eq = pending[i];
        const price = SELL_PRICE[eq.quality] || 0;
        this.logger.log(
          `    [${i}] [${eq.qualityName}] ${eq.name} (${eq.slotName}) 售:${price}g`,
          { color: eq.qualityColor },
        );
      }
      this.logger.log('');
      this.logger.log('  h.keep(n)      保留第n件到背包', { color: '#888' });
      this.logger.log('  h.keepAll()    全部保留到背包', { color: '#888' });
      this.logger.log('  h.trash(n)     出售第n件换金币', { color: '#888' });
      this.logger.log('  h.trashAll()   全部出售换金币', { color: '#888' });
      this.logger.log('  h.pending()    再次查看待处理列表', { color: '#888' });
    }

    this.logger.log('');
    this.logger.log(
      `  当前: Lv.${this.player.level} | 金币:${this.player.gold} | 背包:${this.player.bag.length}/${BAG_MAX_SIZE}`,
    );
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

    this.logger.log(`\n====== 待处理装备 (${pending.length}件) ======`, {
      color: '#a0f',
    });
    for (let i = 0; i < pending.length; i++) {
      const eq = pending[i];
      const price = SELL_PRICE[eq.quality] || 0;
      this.logger.log(
        `  [${i}] [${eq.qualityName}] ${eq.name} (${eq.slotName}) 售:${price}g`,
        { color: eq.qualityColor },
      );
    }
    this.logger.log(
      '\n  h.keep(n) 保留 | h.trash(n) 出售 | h.keepAll() 全留 | h.trashAll() 全卖',
    );
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
    this.logger.log(
      `保留 [${eq.qualityName}] ${eq.name} → 背包 (${this.player.bag.length}/${BAG_MAX_SIZE})`,
      { color: '#2d8f2d' },
    );
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

    this.logger.log(
      `保留了 ${kept} 件装备到背包 (${this.player.bag.length}/${BAG_MAX_SIZE})`,
      { color: '#2d8f2d' },
    );
    if (full > 0) {
      this.logger.log(
        `背包已满，剩余 ${full} 件未处理，请先清理背包或 h.trashAll() 出售`,
        { color: '#f80' },
      );
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
    this.logger.log(
      `出售 [${eq.qualityName}] ${eq.name} => +${price}g (金币: ${this.player.gold})`,
      { color: '#c08b00' },
    );
    this.save();
  }

  trashAllPending() {
    const pending = this.afkPendingEquips;
    if (pending.length === 0) {
      this.logger.log('没有待处理的装备。', { color: '#888' });
      return;
    }

    let totalGold = 0;
    const count = pending.length;
    while (pending.length > 0) {
      const eq = pending.shift();
      const price = SELL_PRICE[eq.quality] || 0;
      this.player.addGold(price);
      totalGold += price;
    }

    this.logger.log(
      `出售了 ${count} 件装备 => +${totalGold}g (金币: ${this.player.gold})`,
      { color: '#c08b00' },
    );
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
      const rareTag = mat?.rare ? ' ★' : '';
      this.logger.log(`  ${mat ? mat.name : id}: ${count}${rareTag}`, {
        color: mat?.rare ? '#f80' : undefined,
      });
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
      this.logger.log(`无效的装备槽位！可选: ${EQUIP_SLOTS.join(', ')}`, {
        color: '#f00',
      });
      return;
    }

    const equip = this.player.equipment[slot];
    if (!equip) {
      this.logger.log(`${EQUIP_SLOT_NAMES[slot]}槽位没有装备！`, {
        color: '#f00',
      });
      return;
    }

    const cost = getEnhanceCost(equip);
    const rate = getEnhanceRate(equip);

    if (rate <= 0) {
      this.logger.log('已达最大强化等级！', { color: '#f00' });
      return;
    }

    this.logger.log(
      `\n强化 [${equip.qualityName}] ${equip.name} +${equip.enhanceLevel}`,
      { color: '#0af' },
    );
    this.logger.log(`  费用: ${cost} 金币 (当前: ${this.player.gold})`, {
      color: '#888',
    });
    this.logger.log(`  成功率: ${(rate * 100).toFixed(0)}%`, {
      color: rate > 0.5 ? '#2d8f2d' : '#f80',
    });

    const result = enhanceEquip(equip, this.player.gold);

    if (result.reason === '金币不足') {
      this.logger.log(`  金币不足！需要 ${cost} 金币`, { color: '#f00' });
      return;
    }

    this.player.gold -= result.cost;

    if (result.success) {
      this.logger.log(`  强化成功！${equip.name} +${result.newLevel}`, {
        color: '#2d8f2d',
      });
    } else {
      const dropText = result.dropped > 0 ? ` (掉了${result.dropped}级)` : '';
      this.logger.log(
        `  强化失败！${equip.name} +${result.newLevel}${dropText}`,
        { color: '#f00' },
      );
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
