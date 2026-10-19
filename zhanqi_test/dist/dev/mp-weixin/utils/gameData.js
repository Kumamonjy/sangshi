"use strict";
const CLASS_CONFIG = {
  warrior: {
    name: "战士",
    moveRange: 3,
    attackRange: 1,
    maxHp: 18,
    attack: 6,
    defense: 2,
    skill: {
      name: "防御姿态",
      description: "回复15%血量，接下来2回合防御力+3",
      cooldown: 3
    }
  },
  knight: {
    name: "骑士",
    moveRange: 4,
    attackRange: 1,
    maxHp: 20,
    attack: 6,
    defense: 1,
    skill: {
      name: "冲锋",
      description: "向指定方向直线移动，路径上敌人受普攻伤害",
      cooldown: 3
    }
  },
  archer: {
    name: "弓箭手",
    moveRange: 3,
    attackRange: 3,
    maxHp: 16,
    attack: 7,
    defense: 1,
    skill: {
      name: "远程射击",
      description: "对单个敌方目标造成1.5倍普通攻击伤害，射程4格",
      cooldown: 2
    }
  },
  mage: {
    name: "法师",
    moveRange: 3,
    attackRange: 3,
    maxHp: 14,
    attack: 7,
    defense: 1,
    skill: {
      name: "范围爆破",
      description: "以自身为中心，对3×3范围内的所有敌方目标造成普通攻击伤害",
      cooldown: 3
    }
  },
  witch: {
    name: "巫师",
    moveRange: 3,
    attackRange: 3,
    maxHp: 16,
    attack: 5,
    defense: 2,
    skill: {
      name: "治愈术",
      description: "对单个己方目标恢复生命值（恢复量=攻击力×2）",
      cooldown: 3
    }
  },
  assassin: {
    name: "刺客",
    moveRange: 3,
    attackRange: 1,
    maxHp: 16,
    attack: 7,
    defense: 0,
    skill: {
      name: "暗影打击",
      description: "瞬间移动到5格范围内的任何位置发动攻击，攻击力为普通攻击×1.3（向上取整）",
      cooldown: 3
    }
  }
};
const LEVEL_EXP = {
  0: 50,
  1: 80,
  2: 110,
  3: 140,
  4: 170,
  5: 200,
  6: 230,
  7: 260,
  8: 290,
  9: 320
};
const MAP_ROWS = 12;
const MAP_COLS = 11;
let currentObstacles = [
  { row: 2, col: 3 },
  { row: 2, col: 7 },
  { row: 2, col: 10 },
  { row: 5, col: 1 },
  { row: 5, col: 5 },
  { row: 5, col: 8 },
  { row: 8, col: 2 },
  { row: 8, col: 6 },
  { row: 8, col: 9 },
  { row: 10, col: 4 },
  { row: 10, col: 7 }
];
function generateRandomObstacles() {
  const obstacleCount = 8 + Math.floor(Math.random() * 5);
  const obstacles = [];
  const forbiddenRows = [0, 1, 11, 12];
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts && obstacles.length < obstacleCount; attempt++) {
    const row = Math.floor(Math.random() * (MAP_ROWS - 4)) + 2;
    const col = Math.floor(Math.random() * MAP_COLS);
    const pos = { row, col };
    if (forbiddenRows.includes(row)) continue;
    if (obstacles.some((o) => o.row === pos.row && o.col === pos.col)) continue;
    obstacles.push(pos);
    if (!isMapConnected(obstacles)) {
      obstacles.pop();
    }
  }
  return obstacles;
}
function isMapConnected(obstacles) {
  const obstacleSet = new Set(obstacles.map((o) => `${o.row},${o.col}`));
  const visited = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false));
  const queue = [];
  queue.push({ row: 0, col: 0 });
  visited[0][0] = true;
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
        if (!visited[newRow][newCol] && !obstacleSet.has(`${newRow},${newCol}`)) {
          visited[newRow][newCol] = true;
          queue.push({ row: newRow, col: newCol });
        }
      }
    }
  }
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (!obstacleSet.has(`${r},${c}`) && !visited[r][c]) {
        return false;
      }
    }
  }
  return true;
}
function isObstacle(row, col) {
  return currentObstacles.some((p) => p.row === row && p.col === col);
}
function setObstacles(obstacles) {
  currentObstacles = obstacles;
}
function removeObstacle(row, col) {
  const index = currentObstacles.findIndex((p) => p.row === row && p.col === col);
  if (index !== -1) {
    currentObstacles.splice(index, 1);
    return true;
  }
  return false;
}
function generateHealingGrass(obstacles) {
  const grass = [];
  const middleStartRow = Math.floor(MAP_ROWS / 2) - 2;
  const middleEndRow = Math.floor(MAP_ROWS / 2) + 2;
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts && grass.length < 2; attempt++) {
    const row = Math.floor(Math.random() * (middleEndRow - middleStartRow + 1)) + middleStartRow;
    const col = Math.floor(Math.random() * MAP_COLS);
    const pos = { row, col };
    if (obstacles.some((o) => o.row === pos.row && o.col === pos.col)) continue;
    if (grass.some((g) => g.row === pos.row && g.col === pos.col)) continue;
    if (row === 0 || row === 1 || row === MAP_ROWS - 1 || row === MAP_ROWS - 2) continue;
    grass.push(pos);
  }
  return grass;
}
let unitIdCounter = 0;
function generateUnitId() {
  return "unit_" + ++unitIdCounter;
}
function getExpForLevel(level) {
  if (level <= 9) {
    return LEVEL_EXP[level] || 50;
  }
  return 50 + level * 30;
}
function getLevelUpStats(heroClass, currentLevel) {
  const isOddLevel = currentLevel % 2 === 1;
  const stats = {
    warrior: {
      hp: 4,
      attack: 1,
      defense: isOddLevel ? 1 : 2
    },
    knight: {
      hp: 3,
      attack: 1,
      defense: isOddLevel ? 1 : 2
    },
    archer: {
      hp: 2,
      attack: 2,
      defense: isOddLevel ? 0 : 1
    },
    mage: {
      hp: 2,
      attack: 2,
      defense: isOddLevel ? 0 : 1
    },
    witch: {
      hp: 3,
      attack: 1,
      defense: isOddLevel ? 0 : 1
    },
    assassin: {
      hp: 3,
      attack: 2,
      defense: isOddLevel ? 0 : 1
    }
  };
  return stats[heroClass] || stats.warrior;
}
function createUnit(config) {
  const classConfig = CLASS_CONFIG[config.classType];
  return {
    id: generateUnitId(),
    name: config.name,
    classType: config.classType,
    isHero: config.isHero || false,
    isAI: config.isAI || false,
    isEnemy: config.isEnemy || false,
    level: config.level || 1,
    exp: config.exp || 0,
    statPoints: 0,
    maxHp: classConfig.maxHp,
    hp: classConfig.maxHp,
    attack: classConfig.attack,
    defense: classConfig.defense,
    moveRange: classConfig.moveRange,
    attackRange: classConfig.attackRange,
    skill: {
      name: classConfig.skill.name,
      description: classConfig.skill.description,
      cooldown: classConfig.skill.cooldown,
      currentCooldown: 0
    },
    position: config.position || { row: 0, col: 0 },
    isDefending: false,
    hasActed: false,
    hasMoved: false,
    hasAttacked: false,
    defenseBuffDuration: 0
  };
}
function createInitialHeroes() {
  return [
    createUnit({
      name: "主角1-战士",
      classType: "warrior",
      isHero: true,
      level: 1,
      exp: 0
    }),
    createUnit({
      name: "主角2-弓箭手",
      classType: "archer",
      isHero: true,
      level: 1,
      exp: 0
    }),
    createUnit({
      name: "主角3-法师",
      classType: "mage",
      isHero: true,
      level: 1,
      exp: 0
    })
  ];
}
function createEnemyUnit(classType, position) {
  return createUnit({
    name: `敌方-${CLASS_CONFIG[classType].name}`,
    classType,
    isEnemy: true,
    level: 1,
    position
  });
}
function createAllyAI(classType, position) {
  return createUnit({
    name: `我方AI-${CLASS_CONFIG[classType].name}`,
    classType,
    isAI: true,
    isEnemy: false,
    level: 1,
    position
  });
}
function getDistance(pos1, pos2) {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}
function calculateDamage(attacker, defender) {
  let defense = defender.defense;
  if (defender.isDefending) {
    defense = Math.ceil(defense * 1.1);
  }
  const damage = attacker.attack - defense;
  return Math.max(1, Math.ceil(damage));
}
function isValidPosition(row, col) {
  return row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS;
}
function getAvailablePositions(units, unit, moveRange) {
  const positions = [];
  const visited = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false));
  const queue = [];
  queue.push({ row: unit.position.row, col: unit.position.col, distance: 0 });
  visited[unit.position.row][unit.position.col] = true;
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const newDistance = current.distance + 1;
      if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
        if (!visited[newRow][newCol] && newDistance <= moveRange) {
          if (!isObstacle(newRow, newCol)) {
            const occupied = units.some((u) => u.position.row === newRow && u.position.col === newCol);
            if (!occupied) {
              visited[newRow][newCol] = true;
              queue.push({ row: newRow, col: newCol, distance: newDistance });
              if (newDistance > 0) {
                positions.push({ row: newRow, col: newCol, distance: newDistance });
              }
            }
          }
        }
      }
    }
  }
  return positions;
}
function getAttackablePositions(units, unit) {
  const positions = [];
  const range = unit.attackRange;
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (row === unit.position.row && col === unit.position.col) continue;
      const distance = getDistance(unit.position, { row, col });
      if (distance <= range) {
        const targetUnit = units.find((u) => u.position.row === row && u.position.col === col);
        if (targetUnit) {
          const isEnemy = unit.isEnemy !== targetUnit.isEnemy;
          if (isEnemy) {
            positions.push({ row, col, target: targetUnit });
          }
        }
      }
    }
  }
  return positions;
}
function getSkillRangePositions(unit, units) {
  const positions = [];
  const centerRow = unit.position.row;
  const centerCol = unit.position.col;
  if (unit.classType === "mage") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const row = centerRow + dr;
        const col = centerCol + dc;
        if (isValidPosition(row, col) && !(dr === 0 && dc === 0)) {
          positions.push({ row, col });
        }
      }
    }
  } else if (unit.classType === "archer") {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col });
        if (distance <= 4 && distance > 0) {
          const target = units.find((u) => u.position.row === row && u.position.col === col);
          if (target && unit.isEnemy !== target.isEnemy) {
            positions.push({ row, col });
          }
        }
      }
    }
  } else if (unit.classType === "knight") {
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    for (const dir of directions) {
      for (let i = 1; i <= unit.moveRange; i++) {
        const row = centerRow + dir.dr * i;
        const col = centerCol + dir.dc * i;
        if (isValidPosition(row, col)) {
          if (isObstacle(row, col)) break;
          positions.push({ row, col });
        }
      }
    }
  } else if (unit.classType === "witch") {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col });
        if (distance <= 3 && distance > 0) {
          const target = units.find((u) => u.position.row === row && u.position.col === col);
          if (target && unit.isEnemy === target.isEnemy) {
            positions.push({ row, col });
          }
        }
      }
    }
  } else if (unit.classType === "warrior") {
    positions.push({ row: centerRow, col: centerCol });
  } else if (unit.classType === "assassin") {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col });
        if (distance <= 4 && distance > 0) {
          const target = units.find((u) => u.position.row === row && u.position.col === col);
          if (target && unit.isEnemy !== target.isEnemy) {
            positions.push({ row, col });
          }
        }
      }
    }
  }
  return positions;
}
function useSkill(unit, targetPos, allUnits) {
  const results = {
    damage: [],
    healing: [],
    positionChange: null
  };
  if (unit.classType === "archer") {
    if (targetPos) {
      const target = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
      if (target && unit.isEnemy !== target.isEnemy) {
        const damage = Math.floor(calculateDamage(unit, target) * 1.5);
        target.hp = Math.max(0, target.hp - damage);
        results.damage.push({ target, damage, killed: target.hp <= 0 });
      }
    }
  } else if (unit.classType === "mage") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const row = unit.position.row + dr;
        const col = unit.position.col + dc;
        const target = allUnits.find((u) => u.position.row === row && u.position.col === col);
        if (target && unit.isEnemy !== target.isEnemy) {
          const damage = calculateDamage(unit, target);
          target.hp = Math.max(0, target.hp - damage);
          results.damage.push({ target, damage, killed: target.hp <= 0 });
        }
      }
    }
  } else if (unit.classType === "knight") {
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    let endRow = unit.position.row;
    let endCol = unit.position.col;
    let blocked = false;
    for (const dir of directions) {
      if (blocked) break;
      for (let i = 1; i <= unit.moveRange; i++) {
        const row = unit.position.row + dir.dr * i;
        const col = unit.position.col + dir.dc * i;
        if (!isValidPosition(row, col) || isObstacle(row, col)) {
          blocked = true;
          break;
        }
        const target = allUnits.find((u) => u.position.row === row && u.position.col === col);
        if (target) {
          if (unit.isEnemy !== target.isEnemy) {
            const damage = calculateDamage(unit, target);
            target.hp = Math.max(0, target.hp - damage);
            results.damage.push({ target, damage, killed: target.hp <= 0 });
          }
          endRow = unit.position.row + dir.dr * (i - 1);
          endCol = unit.position.col + dir.dc * (i - 1);
          blocked = true;
          break;
        }
        endRow = row;
        endCol = col;
      }
    }
    if (endRow !== unit.position.row || endCol !== unit.position.col) {
      unit.position.row = endRow;
      unit.position.col = endCol;
      results.positionChange = { row: endRow, col: endCol };
    }
  } else if (unit.classType === "warrior") {
    const healAmount = Math.ceil(unit.maxHp * 0.15);
    unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
    unit.defense += 3;
    unit.defenseBuffDuration = 2;
    results.healing.push({ target: unit, amount: healAmount });
  } else if (unit.classType === "witch") {
    if (targetPos) {
      const target = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
      if (target && unit.isEnemy === target.isEnemy) {
        const healAmount = unit.attack * 2;
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        results.healing.push({ target, amount: healAmount });
      }
    }
  } else if (unit.classType === "assassin") {
    if (targetPos) {
      const target = allUnits.find((u) => u.position.row === targetPos.row && u.position.col === targetPos.col);
      if (target && unit.isEnemy !== target.isEnemy) {
        const distance = Math.abs(targetPos.row - unit.position.row) + Math.abs(targetPos.col - unit.position.col);
        if (distance <= 5) {
          const occupied = allUnits.some((u) => u.position.row === targetPos.row && u.position.col === targetPos.col && u.id !== target.id);
          if (!occupied || targetPos.row === target.position.row && targetPos.col === target.position.col) {
            if (!(targetPos.row === target.position.row && targetPos.col === target.position.col) || !occupied) {
              unit.position.row = targetPos.row;
              unit.position.col = targetPos.col;
              results.positionChange = { row: targetPos.row, col: targetPos.col };
            }
          }
        }
        const damage = Math.ceil(calculateDamage(unit, target) * 1.3);
        target.hp = Math.max(0, target.hp - damage);
        results.damage.push({ target, damage, killed: target.hp <= 0 });
      }
    }
  }
  return results;
}
exports.CLASS_CONFIG = CLASS_CONFIG;
exports.MAP_COLS = MAP_COLS;
exports.MAP_ROWS = MAP_ROWS;
exports.calculateDamage = calculateDamage;
exports.createAllyAI = createAllyAI;
exports.createEnemyUnit = createEnemyUnit;
exports.createInitialHeroes = createInitialHeroes;
exports.createUnit = createUnit;
exports.generateHealingGrass = generateHealingGrass;
exports.generateRandomObstacles = generateRandomObstacles;
exports.generateUnitId = generateUnitId;
exports.getAttackablePositions = getAttackablePositions;
exports.getAvailablePositions = getAvailablePositions;
exports.getExpForLevel = getExpForLevel;
exports.getLevelUpStats = getLevelUpStats;
exports.getSkillRangePositions = getSkillRangePositions;
exports.isObstacle = isObstacle;
exports.removeObstacle = removeObstacle;
exports.setObstacles = setObstacles;
exports.useSkill = useSkill;
