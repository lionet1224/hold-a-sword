import Game from '../systems/game';

let gameInstance = null;

export class H {
  constructor() {
    gameInstance = new Game();
    gameInstance.boot();
  }

  help() {
    gameInstance.printHelp();
  }

  status() {
    gameInstance.printStatus();
  }

  // ========== 技能树 ==========

  tree() {
    gameInstance.printSkillTree();
  }

  learn(id) {
    gameInstance.learnSkill(id);
  }

  // ========== 职业 ==========

  classes() {
    gameInstance.printClasses();
  }

  change(id) {
    gameInstance.changeClass(id);
  }

  // ========== 召唤兽 ==========

  summons() {
    gameInstance.printSummons();
  }

  summon(id) {
    gameInstance.setSummon(id);
  }

  // ========== 背包 ==========

  bag() {
    gameInstance.printBag();
  }

  look(n) {
    gameInstance.inspectBagItem(n);
  }

  equips() {
    gameInstance.printEquips();
  }

  equip(n) {
    gameInstance.equipItem(n);
  }

  unequip(slot) {
    gameInstance.unequipItem(slot);
  }

  drop(n) {
    gameInstance.dropItem(n);
  }

  sell(n) {
    gameInstance.sellItem(n);
  }

  sellAll(quality) {
    gameInstance.sellAllByQuality(quality);
  }

  // ========== 副本 ==========

  dungeons() {
    gameInstance.printDungeons();
  }

  fight(id) {
    gameInstance.fightDungeon(id);
  }

  go(id, n = 10) {
    gameInstance.startAfk(id, n);
  }

  stop() {
    gameInstance.stopAfk();
  }

  // ========== 待处理 ==========

  pending() {
    gameInstance.printPending();
  }

  keep(n) {
    gameInstance.keepPending(n);
  }

  keepAll() {
    gameInstance.keepAllPending();
  }

  trash(n) {
    gameInstance.trashPending(n);
  }

  trashAll() {
    gameInstance.trashAllPending();
  }

  // ========== 锻造 & 强化 ==========

  mats() {
    gameInstance.printMaterials();
  }

  bps() {
    gameInstance.printBlueprints();
  }

  forge(id) {
    return gameInstance.forgeItem(id);
  }

  enhance(slot) {
    gameInstance.enhanceItem(slot);
  }

  // ========== 存档 ==========

  save() {
    gameInstance.save();
    console.log('%c游戏已保存！', 'color: #2d8f2d');
  }

  reset() {
    gameInstance.resetGame();
  }
}
