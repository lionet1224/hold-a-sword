import { BLUEPRINTS, MATERIALS } from '../data/materials';
import { generateEquip } from './equipment';

export default class ForgeSystem {
  constructor(player, logger) {
    this.player = player;
    this.logger = logger;
  }

  getAvailableBlueprints() {
    return this.player.blueprints
      .map((id) => ({ id, ...BLUEPRINTS[id] }))
      .filter((bp) => bp.name);
  }

  canForge(blueprintId) {
    const bp = BLUEPRINTS[blueprintId];
    if (!bp) return { can: false, reason: '图纸不存在' };

    if (this.player.gold < bp.goldCost) {
      return { can: false, reason: `金币不足 (需要 ${bp.goldCost}, 当前 ${this.player.gold})` };
    }

    for (const [matId, count] of Object.entries(bp.materials)) {
      if (!this.player.hasMaterial(matId, count)) {
        const mat = MATERIALS[matId];
        const have = this.player.materials[matId] || 0;
        return { can: false, reason: `${mat.name}不足 (需要 ${count}, 当前 ${have})` };
      }
    }

    return { can: true };
  }

  forge(blueprintId) {
    const bp = BLUEPRINTS[blueprintId];
    if (!bp) {
      this.logger.log('图纸不存在！', { color: '#f00' });
      return null;
    }

    const check = this.canForge(blueprintId);
    if (!check.can) {
      this.logger.log(`锻造失败: ${check.reason}`, { color: '#f00' });
      return null;
    }

    this.player.gold -= bp.goldCost;
    for (const [matId, count] of Object.entries(bp.materials)) {
      this.player.removeMaterial(matId, count);
    }

    const equip = generateEquip(bp.result, 10);
    this.player.addToBag(equip);

    this.logger.log(`\n锻造成功！获得 [${equip.qualityName}] ${equip.name}`, { color: '#f80' });

    return equip;
  }
}
