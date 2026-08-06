"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gameStore = require("../../stores/gameStore.js");
const utils_gameData = require("../../utils/gameData.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "battle",
  setup(__props, { expose: __expose }) {
    __expose();
    const showUnitInfo = common_vendor.ref(false);
    const gameStore = stores_gameStore.useGameStore();
    const battle = common_vendor.computed(() => gameStore.battle);
    const alivePlayerUnits = common_vendor.computed(() => gameStore.alivePlayerUnits);
    const aliveEnemyUnits = common_vendor.computed(() => gameStore.aliveEnemyUnits);
    const aiJoinMessage = common_vendor.computed(() => gameStore.aiJoinMessage);
    const showAiJoinMessage = common_vendor.computed(() => gameStore.showAiJoinMessage);
    const subtitle = common_vendor.computed(() => gameStore.subtitle);
    const movablePositions = common_vendor.computed(() => {
      if (!battle.value.selectedUnit || !battle.value.moveMode) return [];
      return gameStore.getAvailablePositions(battle.value.units, battle.value.selectedUnit, battle.value.selectedUnit.moveRange);
    });
    const attackableTargets = common_vendor.computed(() => {
      if (!battle.value.selectedUnit || !battle.value.attackMode) return [];
      return gameStore.getAttackablePositions(battle.value.units, battle.value.selectedUnit);
    });
    function goBack() {
      gameStore.clearBattle();
      common_vendor.index.navigateBack();
    }
    function callReinforcements() {
      gameStore.callReinforcements();
    }
    function getUnitAt(row, col) {
      return battle.value.units.find((u) => u.position.row === row && u.position.col === col);
    }
    function isSelected(row, col) {
      var _a, _b;
      return ((_a = battle.value.selectedUnit) == null ? void 0 : _a.position.row) === row && ((_b = battle.value.selectedUnit) == null ? void 0 : _b.position.col) === col;
    }
    function isHealingGrass(row, col) {
      var _a;
      return ((_a = battle.value.healingGrass) == null ? void 0 : _a.some((g) => g.row === row && g.col === col)) || false;
    }
    function isMovable(row, col) {
      return movablePositions.value.some((p) => p.row === row && p.col === col);
    }
    function isAttackable(row, col) {
      return attackableTargets.value.some((p) => p.row === row && p.col === col);
    }
    function isSkillTarget(row, col) {
      return battle.value.skillTargets.some((p) => p.row === row && p.col === col);
    }
    function onCellClick(row, col) {
      if (battle.value.currentTurn !== "player") return;
      const clickedUnit = getUnitAt(row, col);
      if (battle.value.moveMode && isMovable(row, col)) {
        gameStore.moveUnit(battle.value.selectedUnit.id, row, col);
        return;
      }
      if (battle.value.attackMode && clickedUnit && clickedUnit.isEnemy) {
        gameStore.attackTarget(clickedUnit.id);
        return;
      }
      if (battle.value.attackMode && utils_gameData.isObstacle(row, col)) {
        gameStore.attackObstacle(row, col);
        return;
      }
      if (battle.value.skillMode) {
        const isInSkillRange = battle.value.skillTargets.some((p) => p.row === row && p.col === col);
        if (isInSkillRange) {
          gameStore.useSkillTarget({ row, col });
          return;
        }
      }
      if (!battle.value.moveMode && !battle.value.attackMode && !battle.value.skillMode) {
        if (clickedUnit && (clickedUnit.isEnemy || !clickedUnit.isAI)) {
          gameStore.selectUnit(clickedUnit.id);
        } else {
          gameStore.deselectUnit();
        }
      }
    }
    function toggleMoveMode() {
      var _a, _b;
      if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasMoved) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed)) return;
      gameStore.battle.moveMode = !gameStore.battle.moveMode;
      gameStore.battle.attackMode = false;
      gameStore.battle.skillMode = false;
    }
    function toggleAttackMode() {
      var _a, _b;
      if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasAttacked) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed)) return;
      gameStore.battle.attackMode = !gameStore.battle.attackMode;
      gameStore.battle.moveMode = false;
      gameStore.battle.skillMode = false;
    }
    function toggleSkillMode() {
      var _a, _b, _c;
      if (((_a = battle.value.selectedUnit) == null ? void 0 : _a.hasAttacked) || ((_b = battle.value.selectedUnit) == null ? void 0 : _b.hasActed) || ((_c = battle.value.selectedUnit) == null ? void 0 : _c.skill.currentCooldown) > 0) return;
      gameStore.setSkillMode(!gameStore.battle.skillMode);
    }
    function cancelAction() {
      gameStore.battle.moveMode = false;
      gameStore.battle.attackMode = false;
      gameStore.battle.skillMode = false;
      gameStore.battle.skillTargets = [];
    }
    function defend() {
      gameStore.defend();
    }
    function endTurn() {
      gameStore.endPlayerTurn();
    }
    function setSpeed(speed) {
      gameStore.setSpeed(speed);
    }
    function addAiUnit() {
      gameStore.addAiUnit();
    }
    function getClassName(classType) {
      var _a;
      return ((_a = utils_gameData.CLASS_CONFIG[classType]) == null ? void 0 : _a.name) || classType;
    }
    function getClassEmoji(classType) {
      const emojis = {
        warrior: "⚔️",
        knight: "🛡️",
        archer: "🏹",
        mage: "🔮",
        witch: "💀",
        assassin: "🗡️"
      };
      return emojis[classType] || "👤";
    }
    function getClassShortName(classType) {
      const names = {
        warrior: "战",
        knight: "骑",
        archer: "弓",
        mage: "法",
        witch: "巫",
        assassin: "刺"
      };
      return names[classType] || "";
    }
    const __returned__ = { showUnitInfo, gameStore, battle, alivePlayerUnits, aliveEnemyUnits, aiJoinMessage, showAiJoinMessage, subtitle, movablePositions, attackableTargets, goBack, callReinforcements, getUnitAt, isSelected, isHealingGrass, isMovable, isAttackable, isSkillTarget, onCellClick, toggleMoveMode, toggleAttackMode, toggleSkillMode, cancelAction, defend, endTurn, setSpeed, addAiUnit, getClassName, getClassEmoji, getClassShortName, get isObstacle() {
      return utils_gameData.isObstacle;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($setup.goBack),
    b: common_vendor.t($setup.battle.turnNumber),
    c: common_vendor.t($setup.battle.currentTurn === "player" ? "我方回合" : "敌方回合"),
    d: common_vendor.n($setup.battle.currentTurn),
    e: common_vendor.f([1, 2, 3], (s, k0, i0) => {
      return {
        a: common_vendor.t(s),
        b: s,
        c: $setup.battle.speed === s ? 1 : "",
        d: common_vendor.o(($event) => $setup.setSpeed(s), s)
      };
    }),
    f: common_vendor.t($setup.battle.summonCount),
    g: common_vendor.t($setup.battle.maxSummons),
    h: $setup.battle.summonCount >= $setup.battle.maxSummons || $setup.battle.currentTurn === "enemy",
    i: common_vendor.o($setup.callReinforcements),
    j: common_vendor.f(12, (row, k0, i0) => {
      return {
        a: common_vendor.f(11, (col, k1, i1) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
          return common_vendor.e({
            a: $setup.isObstacle(row - 1, col - 1)
          }, $setup.isObstacle(row - 1, col - 1) ? {} : $setup.isHealingGrass(row - 1, col - 1) ? {} : $setup.getUnitAt(row - 1, col - 1) ? common_vendor.e({
            d: common_vendor.t($setup.getClassEmoji(((_a = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _a.classType) || "")),
            e: (_b = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _b.isHero
          }, ((_c = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _c.isHero) ? {} : {}, {
            f: ((_d = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _d.isEnemy) ? 1 : "",
            g: (((_e = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _e.hp) || 0) / (((_f = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _f.maxHp) || 1) < 0.3 ? 1 : "",
            h: (((_g = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _g.hp) || 0) / (((_h = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _h.maxHp) || 1) * 100 + "%",
            i: ((_i = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _i.isEnemy) ? 1 : "",
            j: ((_j = $setup.battle.selectedUnit) == null ? void 0 : _j.position.row) === row - 1 && ((_k = $setup.battle.selectedUnit) == null ? void 0 : _k.position.col) === col - 1 ? 1 : "",
            k: ((_l = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _l.isAI) ? 1 : "",
            l: ((_m = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _m.isHero) ? 1 : "",
            m: ((_n = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _n.classType) === "warrior" ? 1 : "",
            n: ((_o = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _o.classType) === "knight" ? 1 : "",
            o: ((_p = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _p.classType) === "archer" ? 1 : "",
            p: ((_q = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _q.classType) === "mage" ? 1 : "",
            q: ((_r = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _r.classType) === "witch" ? 1 : "",
            r: ((_s = $setup.getUnitAt(row - 1, col - 1)) == null ? void 0 : _s.classType) === "assassin" ? 1 : ""
          }) : {}, {
            b: $setup.isHealingGrass(row - 1, col - 1),
            c: $setup.getUnitAt(row - 1, col - 1),
            s: col,
            t: $setup.isObstacle(row - 1, col - 1) ? 1 : "",
            v: $setup.isSelected(row - 1, col - 1) ? 1 : "",
            w: $setup.isMovable(row - 1, col - 1) ? 1 : "",
            x: $setup.isAttackable(row - 1, col - 1) ? 1 : "",
            y: $setup.isSkillTarget(row - 1, col - 1) ? 1 : "",
            z: common_vendor.o(($event) => $setup.onCellClick(row - 1, col - 1), col)
          });
        }),
        b: row
      };
    }),
    k: $setup.subtitle
  }, $setup.subtitle ? {
    l: common_vendor.t($setup.subtitle)
  } : {}, {
    m: $setup.battle.selectedUnit && !$setup.battle.selectedUnit.isEnemy
  }, $setup.battle.selectedUnit && !$setup.battle.selectedUnit.isEnemy ? common_vendor.e({
    n: common_vendor.t($setup.battle.selectedUnit.name),
    o: common_vendor.t($setup.getClassName($setup.battle.selectedUnit.classType)),
    p: common_vendor.t($setup.battle.selectedUnit.level),
    q: common_vendor.t($setup.battle.selectedUnit.hp),
    r: common_vendor.t($setup.battle.selectedUnit.maxHp),
    s: common_vendor.t($setup.battle.selectedUnit.attack),
    t: common_vendor.t($setup.battle.selectedUnit.defense),
    v: $setup.battle.selectedUnit.hasMoved || $setup.battle.selectedUnit.hasActed,
    w: common_vendor.o($setup.toggleMoveMode),
    x: $setup.battle.selectedUnit.hasAttacked || $setup.battle.selectedUnit.hasActed,
    y: common_vendor.o($setup.toggleAttackMode),
    z: common_vendor.t($setup.battle.selectedUnit.skill.currentCooldown > 0 ? "(" + $setup.battle.selectedUnit.skill.currentCooldown + ")" : ""),
    A: $setup.battle.selectedUnit.hasAttacked || $setup.battle.selectedUnit.hasActed || $setup.battle.selectedUnit.skill.currentCooldown > 0,
    B: common_vendor.o($setup.toggleSkillMode),
    C: $setup.battle.selectedUnit.hasActed,
    D: common_vendor.o($setup.defend),
    E: $setup.battle.moveMode || $setup.battle.attackMode || $setup.battle.skillMode
  }, $setup.battle.moveMode || $setup.battle.attackMode || $setup.battle.skillMode ? common_vendor.e({
    F: $setup.battle.moveMode
  }, $setup.battle.moveMode ? {} : $setup.battle.attackMode ? {} : $setup.battle.skillMode ? {} : {}, {
    G: $setup.battle.attackMode,
    H: $setup.battle.skillMode,
    I: common_vendor.o($setup.cancelAction)
  }) : {}) : $setup.battle.selectedUnit && $setup.battle.selectedUnit.isEnemy ? {
    K: common_vendor.t($setup.battle.selectedUnit.name),
    L: common_vendor.t($setup.getClassName($setup.battle.selectedUnit.classType)),
    M: common_vendor.t($setup.battle.selectedUnit.level),
    N: common_vendor.t($setup.battle.selectedUnit.hp),
    O: common_vendor.t($setup.battle.selectedUnit.maxHp),
    P: common_vendor.t($setup.battle.selectedUnit.attack),
    Q: common_vendor.t($setup.battle.selectedUnit.defense)
  } : {
    R: common_vendor.t($setup.battle.currentTurn === "player" ? "我方回合" : "敌方回合"),
    S: common_vendor.n($setup.battle.currentTurn),
    T: common_vendor.t($setup.battle.turnNumber),
    U: common_vendor.t($setup.alivePlayerUnits.length),
    V: common_vendor.t($setup.aliveEnemyUnits.length)
  }, {
    J: $setup.battle.selectedUnit && $setup.battle.selectedUnit.isEnemy,
    W: common_vendor.o($setup.endTurn),
    X: $setup.battle.gameResult
  }, $setup.battle.gameResult ? {
    Y: common_vendor.t($setup.battle.gameResult === "victory" ? "🎉" : "💀"),
    Z: common_vendor.t($setup.battle.gameResult === "victory" ? "胜利！" : "失败..."),
    aa: common_vendor.t($setup.battle.gameResult === "victory" ? "恭喜获得金币和经验！" : "我方全军覆没..."),
    ab: common_vendor.t($setup.battle.gameResult === "victory" ? "继续游戏" : "返回主页"),
    ac: common_vendor.o($setup.goBack)
  } : {}, {
    ad: $setup.showAiJoinMessage
  }, $setup.showAiJoinMessage ? {
    ae: common_vendor.t($setup.aiJoinMessage)
  } : {}, {
    af: $setup.battle.aiJoinPending
  }, $setup.battle.aiJoinPending ? {
    ag: common_vendor.t($setup.getClassName($setup.battle.pendingAiClass || "")),
    ah: common_vendor.t($setup.battle.pendingAiSide === "ally" ? "加入我方" : "加入敌方"),
    ai: common_vendor.o($setup.addAiUnit)
  } : {}, {
    aj: $setup.showUnitInfo && $setup.battle.selectedUnit
  }, $setup.showUnitInfo && $setup.battle.selectedUnit ? {
    ak: common_vendor.t($setup.battle.selectedUnit.name),
    al: common_vendor.o(($event) => $setup.showUnitInfo = false),
    am: common_vendor.t($setup.getClassName($setup.battle.selectedUnit.classType)),
    an: common_vendor.t($setup.battle.selectedUnit.level),
    ao: common_vendor.t($setup.battle.selectedUnit.hp),
    ap: common_vendor.t($setup.battle.selectedUnit.maxHp),
    aq: common_vendor.t($setup.battle.selectedUnit.attack),
    ar: common_vendor.t($setup.battle.selectedUnit.defense),
    as: common_vendor.t($setup.battle.selectedUnit.moveRange),
    at: common_vendor.t($setup.battle.selectedUnit.attackRange),
    av: common_vendor.t($setup.battle.selectedUnit.skill.name),
    aw: common_vendor.t($setup.battle.selectedUnit.skill.description),
    ax: common_vendor.t($setup.battle.selectedUnit.skill.cooldown)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1ff1a1ca"], ["__file", "E:/project_jy/zhanqi_test/src/pages/battle/battle.vue"]]);
wx.createPage(MiniProgramPage);
