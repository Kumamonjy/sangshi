"use strict";
const common_vendor = require("../common/vendor.js");
const utils_gameData = require("../utils/gameData.js");
const useGameStore = common_vendor.defineStore("game", () => {
  const gold = common_vendor.ref(0);
  const heroes = common_vendor.ref(utils_gameData.createInitialHeroes());
  const selectedBattleUnits = common_vendor.ref([]);
  const settings = common_vendor.ref({
    enemyCount: 3,
    allyAiCount: 0,
    enemyAiMinLevel: 2,
    enemyAiMaxLevel: 4,
    allyAiMinLevel: 1,
    allyAiMaxLevel: 3
  });
  const battle = common_vendor.ref({
    units: [],
    currentTurn: "player",
    selectedUnit: null,
    turnNumber: 1,
    speed: 1,
    playerUnitsActed: 0,
    totalPlayerUnits: 0,
    gameResult: null,
    aiJoinPending: false,
    pendingAiSide: null,
    pendingAiClass: null,
    moveMode: false,
    attackMode: false,
    skillMode: false,
    skillTargets: [],
    summonCount: 0,
    maxSummons: 3
  });
  const aiJoinMessage = common_vendor.ref("");
  const showAiJoinMessage = common_vendor.ref(false);
  const subtitle = common_vendor.ref("");
  const totalPlayerUnits = common_vendor.computed(() => {
    return battle.value.units.filter((u) => !u.isEnemy).length;
  });
  const totalEnemyUnits = common_vendor.computed(() => {
    return battle.value.units.filter((u) => u.isEnemy).length;
  });
  const alivePlayerUnits = common_vendor.computed(() => {
    return battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
  });
  const aliveEnemyUnits = common_vendor.computed(() => {
    return battle.value.units.filter((u) => u.isEnemy && u.hp > 0);
  });
  function updateSettings(newSettings) {
    Object.assign(settings.value, newSettings);
  }
  function addGold(amount) {
    gold.value += amount;
  }
  function deductGold(amount) {
    gold.value = Math.max(0, gold.value - amount);
  }
  function showSubtitle(text) {
    subtitle.value = text;
    setTimeout(() => {
      subtitle.value = "";
    }, 2e3);
  }
  function callReinforcements() {
    if (battle.value.summonCount >= battle.value.maxSummons) {
      showSubtitle("已达到最大支援次数");
      return;
    }
    const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin"];
    const allyClass = classes[Math.floor(Math.random() * classes.length)];
    const enemyClass = classes[Math.floor(Math.random() * classes.length)];
    addAiUnitDirect("ally", allyClass);
    addAiUnitDirect("enemy", enemyClass);
    battle.value.summonCount++;
    showAiJoinMessage.value = true;
    aiJoinMessage.value = `我方AI【${utils_gameData.CLASS_CONFIG[allyClass].name}】和敌方AI【${utils_gameData.CLASS_CONFIG[enemyClass].name}】加入战斗！`;
    setTimeout(() => {
      showAiJoinMessage.value = false;
    }, 3e3);
  }
  function addAiUnitDirect(side, classType) {
    const emptyPositions = [];
    const isAlly = side === "ally";
    const startRow = isAlly ? utils_gameData.MAP_ROWS - 2 : 0;
    const endRow = isAlly ? utils_gameData.MAP_ROWS - 1 : 1;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = 0; c < utils_gameData.MAP_COLS; c++) {
        if (!utils_gameData.isObstacle(r, c)) {
          const occupied = battle.value.units.some((u) => u.position.row === r && u.position.col === c);
          if (!occupied) {
            emptyPositions.push({ row: r, col: c });
          }
        }
      }
    }
    if (emptyPositions.length > 0) {
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      if (side === "ally") {
        const aiUnit = utils_gameData.createAllyAI(classType, pos);
        battle.value.units.push(aiUnit);
      } else {
        const aiUnit = utils_gameData.createEnemyUnit(classType, pos);
        battle.value.units.push(aiUnit);
      }
    }
  }
  function hireHero() {
    if (gold.value < 100) {
      return { success: false, message: "金币不足，无法雇佣新角色" };
    }
    const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin"];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const classConfig = utils_gameData.CLASS_CONFIG[randomClass];
    deductGold(100);
    const newHero = {
      id: utils_gameData.generateUnitId(),
      name: `新角色-${classConfig.name}`,
      classType: randomClass,
      isHero: true,
      isAI: false,
      isEnemy: false,
      level: 0,
      exp: 0,
      statPoints: 0,
      maxHp: Math.floor(classConfig.maxHp * 0.8),
      hp: Math.floor(classConfig.maxHp * 0.8),
      attack: Math.floor(classConfig.attack * 0.8),
      defense: Math.floor(classConfig.defense * 0.8),
      moveRange: classConfig.moveRange,
      attackRange: classConfig.attackRange,
      skill: {
        name: classConfig.skill.name,
        description: classConfig.skill.description,
        cooldown: classConfig.skill.cooldown,
        currentCooldown: 0
      },
      position: { row: 0, col: 0 },
      isDefending: false,
      hasActed: false,
      hasMoved: false,
      hasAttacked: false
    };
    heroes.value.push(newHero);
    return { success: true, message: "雇佣成功", hero: newHero };
  }
  function fireHero(heroId) {
    if (heroes.value.length <= 1) {
      return { success: false, message: "主角团至少保留1名角色，无法继续解雇" };
    }
    const index = heroes.value.findIndex((h) => h.id === heroId);
    if (index === -1) {
      return { success: false, message: "角色不存在" };
    }
    heroes.value.splice(index, 1);
    addGold(50);
    return { success: true, message: "解雇成功，获得50金币" };
  }
  function renameHero(heroId, newName) {
    const hero = heroes.value.find((h) => h.id === heroId);
    if (hero) {
      hero.name = newName;
      return { success: true, message: "重命名成功" };
    }
    return { success: false, message: "角色不存在" };
  }
  function changeHeroClass(heroIndex, newClass) {
    const hero = heroes.value[heroIndex];
    if (!hero || !hero.isHero) return;
    const oldLevel = hero.level;
    const oldExp = hero.exp;
    const oldStatPoints = hero.statPoints;
    const newHero = utils_gameData.createUnit({
      name: hero.name,
      classType: newClass,
      isHero: true,
      level: 1
    });
    newHero.level = oldLevel;
    newHero.exp = oldExp;
    newHero.statPoints = oldStatPoints;
    for (let i = 1; i <= oldLevel; i++) {
      const stats = utils_gameData.getLevelUpStats(newClass, i);
      newHero.maxHp += stats.hp;
      newHero.attack += stats.attack;
      newHero.defense += stats.defense;
    }
    newHero.hp = newHero.maxHp;
    heroes.value[heroIndex] = newHero;
  }
  function awardExpToHeroes(exp) {
    heroes.value.forEach((hero) => {
      if (hero.level > 0) {
        hero.exp += exp;
        const expNeeded = utils_gameData.getExpForLevel(hero.level);
        while (hero.exp >= expNeeded && hero.level < 10) {
          hero.exp -= expNeeded;
          hero.level++;
          const stats = utils_gameData.getLevelUpStats(hero.classType, hero.level);
          hero.maxHp += stats.hp;
          hero.hp = hero.maxHp;
          hero.attack += stats.attack;
          hero.defense += stats.defense;
          if (hero.isHero) {
            const points = Math.floor(Math.random() * 2) + 1;
            hero.statPoints += points;
          }
        }
      }
    });
  }
  function toggleBattleUnitSelection(unitId) {
    const index = selectedBattleUnits.value.indexOf(unitId);
    if (index !== -1) {
      selectedBattleUnits.value.splice(index, 1);
    } else {
      if (selectedBattleUnits.value.length < 3) {
        selectedBattleUnits.value.push(unitId);
      }
    }
  }
  function clearBattleSelection() {
    selectedBattleUnits.value = [];
  }
  function startBattle() {
    if (selectedBattleUnits.value.length === 0) {
      return;
    }
    battle.value.units = [];
    const randomObstacles = utils_gameData.generateRandomObstacles();
    utils_gameData.setObstacles(randomObstacles);
    const healingGrass = utils_gameData.generateHealingGrass(randomObstacles);
    battle.value.healingGrass = healingGrass;
    const classes = ["warrior", "knight", "archer", "mage", "witch", "assassin"];
    const BOTTOM_ROW = utils_gameData.MAP_ROWS - 1;
    const TOP_ROW = 0;
    const usedPlayerCols = /* @__PURE__ */ new Set();
    const usedEnemyCols = /* @__PURE__ */ new Set();
    const getRandomCol = (used) => {
      let col;
      do {
        col = Math.floor(Math.random() * utils_gameData.MAP_COLS);
      } while (used.has(col));
      used.add(col);
      return col;
    };
    const selectedHeroes = heroes.value.filter((h) => selectedBattleUnits.value.includes(h.id));
    const allPlayerUnits = [...selectedHeroes];
    const allyAiCount = settings.value.allyAiCount || 0;
    for (let i = 0; i < allyAiCount; i++) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const aiUnit = utils_gameData.createAllyAI(randomClass, { row: 0, col: 0 });
      const minLevel = selectedHeroes.length > 0 ? Math.min(...selectedHeroes.map((h) => h.level)) : 1;
      const maxLevel = minLevel + 2;
      aiUnit.level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
      allPlayerUnits.push(aiUnit);
    }
    const minPlayerLevel = allPlayerUnits.length > 0 ? Math.min(...allPlayerUnits.map((u) => u.level)) : 1;
    allPlayerUnits.forEach((hero) => {
      const battleHero = { ...hero };
      battleHero.id = utils_gameData.generateUnitId();
      battleHero.position = { row: BOTTOM_ROW, col: getRandomCol(usedPlayerCols) };
      battleHero.hp = battleHero.maxHp;
      battleHero.hasActed = false;
      battleHero.hasMoved = false;
      battleHero.hasAttacked = false;
      battleHero.skill = { ...hero.skill, currentCooldown: 0 };
      battleHero.isDefending = false;
      battle.value.units.push(battleHero);
    });
    const enemyCount = settings.value.enemyCount || 3;
    for (let i = 0; i < enemyCount; i++) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const position = {
        row: TOP_ROW,
        col: getRandomCol(usedEnemyCols)
      };
      const enemy = utils_gameData.createEnemyUnit(randomClass, position);
      const level = Math.floor(Math.random() * 3) + minPlayerLevel;
      enemy.level = level;
      battle.value.units.push(enemy);
    }
    battle.value.currentTurn = "player";
    battle.value.selectedUnit = null;
    battle.value.turnNumber = 1;
    battle.value.speed = 1;
    battle.value.gameResult = null;
    battle.value.aiJoinPending = false;
    battle.value.pendingAiSide = null;
    battle.value.pendingAiClass = null;
    battle.value.moveMode = false;
    battle.value.attackMode = false;
    battle.value.skillMode = false;
    battle.value.skillTargets = [];
    battle.value.summonCount = 0;
    battle.value.maxSummons = 3;
    const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
    battle.value.totalPlayerUnits = playerUnits.length;
    battle.value.playerUnitsActed = 0;
  }
  function selectUnit(unitId) {
    const unit = battle.value.units.find((u) => u.id === unitId);
    if (unit && battle.value.currentTurn === "player") {
      if (!unit.isEnemy && !unit.hasActed && !unit.isAI) {
        battle.value.selectedUnit = unit;
        battle.value.moveMode = false;
        battle.value.attackMode = false;
        battle.value.skillMode = false;
        battle.value.skillTargets = [];
      } else if (unit.isEnemy) {
        battle.value.selectedUnit = unit;
        battle.value.moveMode = false;
        battle.value.attackMode = false;
        battle.value.skillMode = false;
        battle.value.skillTargets = [];
      } else if (!unit.isEnemy && unit.hasActed && !unit.isAI) {
        battle.value.selectedUnit = unit;
        battle.value.moveMode = false;
        battle.value.attackMode = false;
        battle.value.skillMode = false;
        battle.value.skillTargets = [];
      }
    }
  }
  function deselectUnit() {
    battle.value.selectedUnit = null;
    battle.value.moveMode = false;
    battle.value.attackMode = false;
    battle.value.skillMode = false;
    battle.value.skillTargets = [];
  }
  function moveUnit(unitId, row, col) {
    const unit = battle.value.units.find((u) => u.id === unitId);
    if (unit) {
      unit.position = { row, col };
      unit.hasMoved = true;
      battle.value.moveMode = false;
      const grassIndex = battle.value.healingGrass.findIndex((g) => g.row === row && g.col === col);
      if (grassIndex !== -1) {
        const healAmount = Math.ceil(unit.maxHp * 0.3);
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
        battle.value.healingGrass.splice(grassIndex, 1);
      }
    }
  }
  function setAttackMode(enabled) {
    if (enabled) {
      battle.value.attackMode = true;
      battle.value.moveMode = false;
      battle.value.skillMode = false;
      battle.value.skillTargets = [];
    } else {
      battle.value.attackMode = false;
    }
  }
  function setSkillMode(enabled) {
    if (enabled && battle.value.selectedUnit && battle.value.selectedUnit.skill.currentCooldown === 0) {
      battle.value.skillMode = true;
      battle.value.moveMode = false;
      battle.value.attackMode = false;
      battle.value.skillTargets = utils_gameData.getSkillRangePositions(battle.value.selectedUnit, battle.value.units);
    } else {
      battle.value.skillMode = false;
      battle.value.skillTargets = [];
    }
  }
  function attackTarget(targetId) {
    if (!battle.value.selectedUnit) return;
    const attacker = battle.value.selectedUnit;
    const target = battle.value.units.find((u) => u.id === targetId);
    if (target && attacker.isEnemy !== target.isEnemy) {
      const damage = utils_gameData.calculateDamage(attacker, target);
      target.hp = Math.max(0, target.hp - damage);
      attacker.hasAttacked = true;
      if (!attacker.hasMoved) {
        attacker.hasActed = true;
      }
      if (target.hp <= 0) {
        battle.value.units = battle.value.units.filter((u) => u.id !== targetId);
      }
      const side = attacker.isEnemy ? "敌方" : attacker.isHero ? "我方主角" : "我方";
      const targetSide = target.isEnemy ? "敌方" : target.isHero ? "我方主角" : "我方";
      const classConfig = utils_gameData.CLASS_CONFIG[attacker.classType];
      const targetClassConfig = utils_gameData.CLASS_CONFIG[target.classType];
      showSubtitle(`${side}【${classConfig.name}】对${targetSide}【${targetClassConfig.name}】使用【普通攻击】`);
      checkBattleEnd();
    }
    deselectUnit();
  }
  function attackObstacle(row, col) {
    if (!battle.value.selectedUnit) return;
    const attacker = battle.value.selectedUnit;
    const removed = utils_gameData.removeObstacle(row, col);
    if (removed) {
      attacker.hasAttacked = true;
      attacker.hasActed = true;
      const side = attacker.isEnemy ? "敌方" : attacker.isHero ? "我方主角" : "我方";
      const classConfig = utils_gameData.CLASS_CONFIG[attacker.classType];
      showSubtitle(`${side}【${classConfig.name}】清除了障碍物`);
    }
    deselectUnit();
  }
  function useSkillTarget(targetPos) {
    if (!battle.value.selectedUnit) return;
    const unit = battle.value.selectedUnit;
    const results = utils_gameData.useSkill(unit, targetPos, battle.value.units);
    results.damage.forEach((d) => {
      if (d.killed) {
        battle.value.units = battle.value.units.filter((u) => u.id !== d.target.id);
      }
    });
    unit.skill.currentCooldown = unit.skill.cooldown;
    unit.hasAttacked = true;
    if (!unit.hasMoved) {
      unit.hasActed = true;
    }
    const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
    const classConfig = utils_gameData.CLASS_CONFIG[unit.classType];
    let subtitleText = "";
    if (targetPos) {
      const target = battle.value.units.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
      if (target) {
        const targetSide = target.isEnemy ? "敌方" : target.isHero ? "我方主角" : "我方";
        const targetClassConfig = utils_gameData.CLASS_CONFIG[target.classType];
        subtitleText = `${side}【${classConfig.name}】对${targetSide}【${targetClassConfig.name}】使用技能【${classConfig.skill.name}】`;
      } else {
        subtitleText = `${side}【${classConfig.name}】使用技能【${classConfig.skill.name}】`;
      }
    } else {
      subtitleText = `${side}【${classConfig.name}】使用技能【${classConfig.skill.name}】`;
    }
    showSubtitle(subtitleText);
    checkBattleEnd();
    deselectUnit();
  }
  function defend() {
    if (!battle.value.selectedUnit) return;
    const unit = battle.value.selectedUnit;
    unit.isDefending = true;
    unit.hasActed = true;
    const side = unit.isEnemy ? "敌方" : unit.isHero ? "我方主角" : "我方";
    const classConfig = utils_gameData.CLASS_CONFIG[unit.classType];
    const isSkill = unit.classType === "warrior";
    const actionName = isSkill ? "【" + classConfig.skill.name + "】" : "【原地防御】";
    showSubtitle(`${side}【${classConfig.name}】使用技能${actionName}`);
    deselectUnit();
  }
  function markUnitActed(unitId) {
    const unit = battle.value.units.find((u) => u.id === unitId);
    if (unit) {
      unit.hasActed = true;
      unit.hasMoved = true;
      unit.hasAttacked = true;
    }
  }
  function endPlayerTurn() {
    battle.value.currentTurn = "enemy";
    battle.value.selectedUnit = null;
    battle.value.moveMode = false;
    battle.value.attackMode = false;
    battle.value.skillMode = false;
    battle.value.skillTargets = [];
    battle.value.units.forEach((u) => {
      if (u.skill.currentCooldown > 0) {
        u.skill.currentCooldown--;
      }
      u.isDefending = false;
    });
    executeEnemyTurn();
  }
  async function executeEnemyTurn() {
    const enemyUnits = battle.value.units.filter((u) => u.isEnemy && !u.hasActed && u.hp > 0);
    const playerUnits = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
    const speed = battle.value.speed;
    for (const enemy of enemyUnits) {
      if (playerUnits.length === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 500 / speed));
      const alivePlayerUnits2 = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
      if (alivePlayerUnits2.length === 0) break;
      if (enemy.hp <= enemy.maxHp * 0.3 && !enemy.isDefending) {
        enemy.isDefending = true;
        enemy.hasActed = true;
        const classConfig = utils_gameData.CLASS_CONFIG[enemy.classType];
        const isSkill = enemy.classType === "warrior";
        const actionName = isSkill ? "【" + classConfig.skill.name + "】" : "【原地防御】";
        showSubtitle(`敌方【${classConfig.name}】使用技能${actionName}`);
        continue;
      }
      if (enemy.skill.currentCooldown === 0) {
        const skillTargets = utils_gameData.getSkillRangePositions(enemy, battle.value.units);
        if (skillTargets.length > 0 && enemy.classType !== "warrior") {
          const validTarget = skillTargets.find((pos) => {
            const target = battle.value.units.find((u) => u.position.row === pos.row && u.position.col === pos.col);
            return target && enemy.isEnemy !== target.isEnemy;
          });
          if (validTarget) {
            utils_gameData.useSkill(enemy, validTarget, battle.value.units);
            enemy.skill.currentCooldown = enemy.skill.cooldown;
            enemy.hasActed = true;
            const classConfig = utils_gameData.CLASS_CONFIG[enemy.classType];
            const target = battle.value.units.find((u) => u.position.row === validTarget.row && u.position.col === validTarget.col);
            if (target) {
              const targetSide = target.isEnemy ? "敌方" : target.isHero ? "我方主角" : "我方";
              const targetClassConfig = utils_gameData.CLASS_CONFIG[target.classType];
              showSubtitle(`敌方【${classConfig.name}】对${targetSide}【${targetClassConfig.name}】使用技能【${classConfig.skill.name}】`);
            } else {
              showSubtitle(`敌方【${classConfig.name}】使用技能【${classConfig.skill.name}】`);
            }
            continue;
          }
        } else if (enemy.classType === "warrior" && enemy.hp < enemy.maxHp) {
          enemy.isDefending = true;
          enemy.hasActed = true;
          const classConfig = utils_gameData.CLASS_CONFIG[enemy.classType];
          showSubtitle(`敌方【${classConfig.name}】使用技能【${classConfig.skill.name}】`);
          continue;
        }
      }
      let closestTarget = null;
      let closestDistance = Infinity;
      alivePlayerUnits2.forEach((pu) => {
        const dist = Math.abs(enemy.position.row - pu.position.row) + Math.abs(enemy.position.col - pu.position.col);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestTarget = pu;
        }
      });
      if (closestTarget) {
        const movePositions = utils_gameData.getAvailablePositions(battle.value.units, enemy, enemy.moveRange);
        let bestMove = null;
        let bestDistance = closestDistance;
        movePositions.forEach((pos) => {
          const dist = Math.abs(pos.row - closestTarget.position.row) + Math.abs(pos.col - closestTarget.position.col);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestMove = pos;
          }
        });
        if (bestMove && bestDistance < closestDistance) {
          enemy.position = { row: bestMove.row, col: bestMove.col };
          await new Promise((resolve) => setTimeout(resolve, 300 / speed));
        }
        const attackPositions = utils_gameData.getAttackablePositions(battle.value.units, enemy);
        if (attackPositions.length > 0) {
          let bestTarget = null;
          let lowestHp = Infinity;
          attackPositions.forEach((pos) => {
            if (pos.target.hp < lowestHp) {
              lowestHp = pos.target.hp;
              bestTarget = pos.target;
            }
          });
          if (bestTarget) {
            const damage = utils_gameData.calculateDamage(enemy, bestTarget);
            bestTarget.hp = Math.max(0, bestTarget.hp - damage);
            if (bestTarget.hp <= 0) {
              battle.value.units = battle.value.units.filter((u) => u.id !== bestTarget.id);
            }
            const classConfig = utils_gameData.CLASS_CONFIG[enemy.classType];
            const targetSide = bestTarget.isEnemy ? "敌方" : bestTarget.isHero ? "我方主角" : "我方";
            const targetClassConfig = utils_gameData.CLASS_CONFIG[bestTarget.classType];
            showSubtitle(`敌方【${classConfig.name}】对${targetSide}【${targetClassConfig.name}】使用【普通攻击】`);
          }
        }
      }
      enemy.hasActed = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 / speed));
    endEnemyTurn();
  }
  function endEnemyTurn() {
    battle.value.turnNumber++;
    battle.value.currentTurn = "player";
    battle.value.units.forEach((u) => {
      u.hasActed = false;
      u.hasMoved = false;
      u.hasAttacked = false;
      u.isDefending = false;
      if (u.skill.currentCooldown > 0) {
        u.skill.currentCooldown--;
      }
    });
    const playerUnits = battle.value.units.filter((u) => !u.isEnemy);
    battle.value.totalPlayerUnits = playerUnits.length;
    battle.value.playerUnitsActed = 0;
    checkBattleEnd();
  }
  function addAiUnit() {
    if (!battle.value.pendingAiSide || !battle.value.pendingAiClass) return;
    const emptyPositions = [];
    const isAlly = battle.value.pendingAiSide === "ally";
    const startRow = isAlly ? utils_gameData.MAP_ROWS - 2 : 0;
    const endRow = isAlly ? utils_gameData.MAP_ROWS - 1 : 1;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = 0; c < utils_gameData.MAP_COLS; c++) {
        if (!utils_gameData.isObstacle(r, c)) {
          const occupied = battle.value.units.some((u) => u.position.row === r && u.position.col === c);
          if (!occupied) {
            emptyPositions.push({ row: r, col: c });
          }
        }
      }
    }
    if (emptyPositions.length > 0) {
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      if (battle.value.pendingAiSide === "ally") {
        const aiUnit = utils_gameData.createAllyAI(battle.value.pendingAiClass, pos);
        battle.value.units.push(aiUnit);
        showAiJoinMessage.value = true;
        aiJoinMessage.value = `己方AI（${utils_gameData.CLASS_CONFIG[battle.value.pendingAiClass].name}）加入战斗`;
      } else {
        const aiUnit = utils_gameData.createEnemyUnit(battle.value.pendingAiClass, pos);
        battle.value.units.push(aiUnit);
        showAiJoinMessage.value = true;
        aiJoinMessage.value = `敌方AI（${utils_gameData.CLASS_CONFIG[battle.value.pendingAiClass].name}）加入战斗`;
      }
      battle.value.summonCount++;
      setTimeout(() => {
        showAiJoinMessage.value = false;
      }, 3e3);
    }
    battle.value.aiJoinPending = false;
    battle.value.pendingAiSide = null;
    battle.value.pendingAiClass = null;
  }
  function checkBattleEnd() {
    const alivePlayer = battle.value.units.filter((u) => !u.isEnemy && u.hp > 0);
    const aliveEnemy = battle.value.units.filter((u) => u.isEnemy && u.hp > 0);
    if (aliveEnemy.length === 0) {
      const initialEnemyCount = settings.value.enemyCount;
      const summonedCount = battle.value.summonCount;
      const totalEnemiesSpawned = initialEnemyCount + summonedCount;
      const killedEnemies = totalEnemiesSpawned - aliveEnemy.length;
      const exp = 20 + killedEnemies * 10;
      addGold(killedEnemies * 10);
      awardExpToHeroes(exp);
      battle.value.gameResult = "victory";
      showSubtitle("战斗胜利！所有存活我方角色获得经验值：" + exp);
      return "victory";
    }
    if (alivePlayer.length === 0) {
      battle.value.gameResult = "defeat";
      return "defeat";
    }
    return null;
  }
  function setSpeed(speed) {
    battle.value.speed = speed;
  }
  function clearBattle() {
    battle.value.units = [];
    battle.value.selectedUnit = null;
    battle.value.currentTurn = "player";
    battle.value.turnNumber = 1;
    battle.value.gameResult = null;
    battle.value.summonCount = 0;
  }
  function resetGame() {
    gold.value = 0;
    heroes.value = utils_gameData.createInitialHeroes();
    settings.value = {
      enemyCount: 3,
      allyAiCount: 0,
      enemyAiMinLevel: 2,
      enemyAiMaxLevel: 4,
      allyAiMinLevel: 1,
      allyAiMaxLevel: 3
    };
    clearBattle();
  }
  return {
    gold,
    heroes,
    selectedBattleUnits,
    settings,
    battle,
    aiJoinMessage,
    showAiJoinMessage,
    totalPlayerUnits,
    totalEnemyUnits,
    alivePlayerUnits,
    aliveEnemyUnits,
    updateSettings,
    addGold,
    deductGold,
    hireHero,
    fireHero,
    renameHero,
    changeHeroClass,
    awardExpToHeroes,
    toggleBattleUnitSelection,
    clearBattleSelection,
    startBattle,
    selectUnit,
    deselectUnit,
    moveUnit,
    setAttackMode,
    setSkillMode,
    attackTarget,
    attackObstacle,
    useSkillTarget,
    defend,
    markUnitActed,
    endPlayerTurn,
    addAiUnit,
    addAiUnitDirect,
    setSpeed,
    clearBattle,
    resetGame,
    getAvailablePositions: utils_gameData.getAvailablePositions,
    getAttackablePositions: utils_gameData.getAttackablePositions,
    getSkillRangePositions: utils_gameData.getSkillRangePositions,
    subtitle,
    callReinforcements
  };
});
exports.useGameStore = useGameStore;
