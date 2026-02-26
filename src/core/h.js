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

  skills() {
    gameInstance.printSkills();
  }

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

  save() {
    gameInstance.save();
    console.log('%c游戏已保存！', 'color: #2d8f2d');
  }

  reset() {
    gameInstance.resetGame();
  }
}
