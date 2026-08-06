export interface Unit {
  id: string
  name: string
  classType: 'warrior' | 'knight' | 'archer' | 'mage' | 'witch' | 'assassin' | 'architect' | 'strategist'
  isHero: boolean
  isAI: boolean
  isEnemy: boolean
  level: number
  exp: number
  statPoints: number
  usedStatPoints: number
  maxHp: number
  hp: number
  attack: number
  defense: number
  moveRange: number
  attackRange: number
  skill: {
    name: string
    description: string
    cooldown: number
    currentCooldown: number
  }
  position: { row: number; col: number }
  isDefending: boolean
  hasActed: boolean
  hasMoved: boolean
  hasAttacked: boolean
  defenseBuffDuration: number
  permanentAttackBonus: number // 永久攻击加成百分比
  permanentDefenseBonus: number // 永久防御加成百分比
}

export interface GameSettings {
  enemyCount: number
  allyAiCount: number
}

export interface BattleState {
  units: Unit[]
  currentTurn: 'player' | 'enemy'
  selectedUnit: Unit | null
  turnNumber: number
  speed: 1 | 2 | 3
  playerUnitsActed: number
  totalPlayerUnits: number
  gameResult: 'victory' | 'defeat' | null
  aiJoinPending: boolean
  pendingAiSide: 'ally' | 'enemy' | null
  pendingAiClass: string | null
  moveMode: boolean
  attackMode: boolean
  skillMode: boolean
  skillTargets: { row: number; col: number }[]
  summonCount: number
  maxSummons: number
  healingGrass: { row: number; col: number }[]
  weather: 'normal' | 'snow' | 'thunder'
  snowAreas: { row: number; col: number }[]
  thunderAreas: { row: number; col: number }[]
}

export const CLASS_CONFIG = {
  warrior: {
    name: '战士',
    moveRange: 3,
    attackRange: 1,
    maxHp: 220,
    attack: 60,
    defense: 20,
    skill: {
      name: '防御姿态',
      description: '回复15%血量，本场战斗攻击提高10%、防御力提高15%，可无限叠加',
      cooldown: 3
    }
  },
  knight: {
    name: '骑士',
    moveRange: 4,
    attackRange: 1,
    maxHp: 230,
    attack: 65,
    defense: 10,
    skill: {
      name: '冲锋',
      description: '向指定方向直线移动，路径上敌人受普攻伤害',
      cooldown: 3
    }
  },
  archer: {
    name: '弓箭手',
    moveRange: 3,
    attackRange: 3,
    maxHp: 190,
    attack: 70,
    defense: 10,
    skill: {
      name: '远程射击',
      description: '对单个敌方目标造成1.3倍普通攻击伤害，射程4格',
      cooldown: 3
    }
  },
  mage: {
    name: '法师',
    moveRange: 3,
    attackRange: 3,
    maxHp: 180,
    attack: 70,
    defense: 10,
    skill: {
      name: '范围爆破',
      description: '以自身为中心，对移动距离≤2范围内的所有敌方目标造成1.1倍普通攻击伤害',
      cooldown: 3
    }
  },
  witch: {
    name: '巫师',
    moveRange: 3,
    attackRange: 4,
    maxHp: 190,
    attack: 50,
    defense: 20,
    skill: {
      name: '治愈术',
      description: '对单个己方目标恢复生命值（恢复量=攻击力×2）',
      cooldown: 3
    }
  },
  assassin: {
    name: '刺客',
    moveRange: 3,
    attackRange: 1,
    maxHp: 190,
    attack: 70,
    defense: 0,
    skill: {
      name: '暗影打击',
      description: '瞬间移动到5格范围内的任何位置发动攻击，攻击力为普通攻击×1.3（向上取整）',
      cooldown: 3
    }
  },
  architect: {
    name: '建筑师',
    moveRange: 3,
    attackRange: 1,
    maxHp: 210,
    attack: 50,
    defense: 20,
    skill: {
      name: '大兴土木',
      description: '在自己身边相邻四格范围内，至多选择3个没有角色的格子，有障碍物则清除，无障碍物则生成',
      cooldown: 2
    }
  },
  strategist: {
    name: '军师',
    moveRange: 3,
    attackRange: 2,
    maxHp: 200,
    attack: 60,
    defense: 10,
    skill: {
      name: '斗转星移',
      description: '选择4格范围内任意两个角色或障碍物交换位置',
      cooldown: 3
    }
  }
}

export const LEVEL_EXP: Record<number, number> = {
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
}

export const MAP_ROWS = 12
export const MAP_COLS = 11

let currentObstacles: { row: number; col: number }[] = [
  { row: 2, col: 3 }, { row: 2, col: 7 }, { row: 2, col: 10 },
  { row: 5, col: 1 }, { row: 5, col: 5 }, { row: 5, col: 8 },
  { row: 8, col: 2 }, { row: 8, col: 6 }, { row: 8, col: 9 },
  { row: 10, col: 4 }, { row: 10, col: 7 }
]

export function generateRandomObstacles(): { row: number; col: number }[] {
  const obstacleCount = 12 + Math.floor(Math.random() * 5)
  const obstacles: { row: number; col: number }[] = []
  const forbiddenRows = [0, 1, 11, 12]
  const maxAttempts = 100

  for (let attempt = 0; attempt < maxAttempts && obstacles.length < obstacleCount; attempt++) {
    const row = Math.floor(Math.random() * (MAP_ROWS - 4)) + 2
    const col = Math.floor(Math.random() * MAP_COLS)
    const pos = { row, col }

    if (forbiddenRows.includes(row)) continue
    if (obstacles.some(o => o.row === pos.row && o.col === pos.col)) continue

    obstacles.push(pos)

    if (!isMapConnected(obstacles)) {
      obstacles.pop()
    }
  }

  return obstacles
}

function isMapConnected(obstacles: { row: number; col: number }[]): boolean {
  const obstacleSet = new Set(obstacles.map(o => `${o.row},${o.col}`))
  const visited: boolean[][] = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false))
  const queue: { row: number; col: number }[] = []

  queue.push({ row: 0, col: 0 })
  visited[0][0] = true

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const dir of directions) {
      const newRow = current.row + dir.dr
      const newCol = current.col + dir.dc

      if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
        if (!visited[newRow][newCol] && !obstacleSet.has(`${newRow},${newCol}`)) {
          visited[newRow][newCol] = true
          queue.push({ row: newRow, col: newCol })
        }
      }
    }
  }

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (!obstacleSet.has(`${r},${c}`) && !visited[r][c]) {
        return false
      }
    }
  }

  return true
}

export function isObstacle(row: number, col: number): boolean {
  return currentObstacles.some(p => p.row === row && p.col === col)
}

export function setObstacles(obstacles: { row: number; col: number }[]) {
  currentObstacles = obstacles
}

export function getObstacles(): { row: number; col: number }[] {
  return currentObstacles
}

export function removeObstacle(row: number, col: number): boolean {
  const index = currentObstacles.findIndex(p => p.row === row && p.col === col)
  if (index !== -1) {
    currentObstacles.splice(index, 1)
    return true
  }
  return false
}

export function addObstacle(row: number, col: number): boolean {
  if (!isObstacle(row, col)) {
    currentObstacles.push({ row, col })
    return true
  }
  return false
}

export function removeObstacleWithGrassChance(row: number, col: number): { removed: boolean; generateGrass: boolean } {
  const removed = removeObstacle(row, col)
  const generateGrass = removed && Math.random() < 0.3
  return { removed, generateGrass }
}

export function generateHealingGrass(obstacles: { row: number; col: number }[]): { row: number; col: number }[] {
  const grass: { row: number; col: number }[] = []
  const middleStartRow = Math.floor(MAP_ROWS / 2) - 2
  const middleEndRow = Math.floor(MAP_ROWS / 2) + 2
  const maxAttempts = 50

  for (let attempt = 0; attempt < maxAttempts && grass.length < 2; attempt++) {
    const row = Math.floor(Math.random() * (middleEndRow - middleStartRow + 1)) + middleStartRow
    const col = Math.floor(Math.random() * MAP_COLS)
    const pos = { row, col }

    if (obstacles.some(o => o.row === pos.row && o.col === pos.col)) continue
    if (grass.some(g => g.row === pos.row && g.col === pos.col)) continue
    if (row === 0 || row === 1 || row === MAP_ROWS - 1 || row === MAP_ROWS - 2) continue

    grass.push(pos)
  }

  return grass
}

export function resetObstacles() {
  currentObstacles = [
    { row: 2, col: 3 }, { row: 2, col: 7 },
    { row: 5, col: 1 }, { row: 5, col: 5 }, { row: 5, col: 8 },
    { row: 8, col: 2 }, { row: 8, col: 6 },
    { row: 10, col: 4 }, { row: 10, col: 9 },
    { row: 12, col: 1 }, { row: 12, col: 7 }
  ]
}

let unitIdCounter = 0

export function generateUnitId(): string {
  return 'unit_' + (++unitIdCounter)
}

export function getExpForLevel(level: number): number {
  if (level <= 9) {
    return LEVEL_EXP[level] || 50
  }
  return 50 + level * 30
}

export function getLevelUpStats(heroClass: string, currentLevel: number): { hp: number; attack: number; defense: number } {
  const stats: Record<string, { hp: number; attack: number; defense: number }> = {
    warrior: {
      hp: 40,
      attack: 10,
      defense: 15
    },
    knight: {
      hp: 40,
      attack: 15,
      defense: 10
    },
    archer: {
      hp: 30,
      attack: 15,
      defense: 5
    },
    mage: {
      hp: 30,
      attack: 15,
      defense: 5
    },
    witch: {
      hp: 40,
      attack: 5,
      defense: 15
    },
    assassin: {
      hp: 30,
      attack: 15,
      defense: 5
    },
    architect: {
      hp: 35,
      attack: 10,
      defense: 15
    },
    strategist: {
      hp: 35,
      attack: 10,
      defense: 10
    }
  }
  return stats[heroClass] || stats.warrior
}

export function createUnit(config: {
  name: string
  classType: string
  isHero?: boolean
  isAI?: boolean
  isEnemy?: boolean
  level?: number
  exp?: number
  position?: { row: number; col: number }
}): Unit {
  const classConfig = CLASS_CONFIG[config.classType as keyof typeof CLASS_CONFIG]
  const level = config.level || 1
  
  let maxHp = classConfig.maxHp
  let attack = classConfig.attack
  let defense = classConfig.defense
  
  // 从2级开始每级增加属性
  for (let l = 2; l <= level; l++) {
    const stats = getLevelUpStats(config.classType, l)
    maxHp += stats.hp
    attack += stats.attack
    defense += stats.defense
  }
  
  return {
    id: generateUnitId(),
    name: config.name,
    classType: config.classType as Unit['classType'],
    isHero: config.isHero || false,
    isAI: config.isAI || false,
    isEnemy: config.isEnemy || false,
    level,
    exp: config.exp || 0,
    statPoints: 1,
    usedStatPoints: 0,
    maxHp,
    hp: maxHp,
    attack,
    defense,
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
    defenseBuffDuration: 0,
    permanentAttackBonus: 0,
    permanentDefenseBonus: 0
  }
}

export function createInitialHeroes(): Unit[] {
  return [
    createUnit({
      name: '熊熊',
      classType: 'warrior',
      isHero: true,
      level: 1,
      exp: 0
    }),
    createUnit({
      name: '兔兔',
      classType: 'archer',
      isHero: true,
      level: 1,
      exp: 0
    }),
    createUnit({
      name: '大黑熊',
      classType: 'mage',
      isHero: true,
      level: 1,
      exp: 0
    })
  ]
}

export function createEnemyUnit(classType: string, position: { row: number; col: number }, level?: number): Unit {
  return createUnit({
    name: `敌方-${CLASS_CONFIG[classType as keyof typeof CLASS_CONFIG].name}`,
    classType,
    isEnemy: true,
    level: level || 1,
    position
  })
}

export function createAllyAI(classType: string, position: { row: number; col: number }, level?: number): Unit {
  return createUnit({
    name: `我方AI-${CLASS_CONFIG[classType as keyof typeof CLASS_CONFIG].name}`,
    classType,
    isAI: true,
    isEnemy: false,
    level: level || 1,
    position
  })
}

export function getDistance(pos1: { row: number; col: number }, pos2: { row: number; col: number }): number {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col)
}

export function calculateDamage(attacker: Unit, defender: Unit): number {
  // 计算实际攻击：基础攻击 * (1 + 永久攻击加成%)
  let actualAttack = attacker.attack * (1 + attacker.permanentAttackBonus / 100)
  // 计算实际防御：基础防御 * (1 + 永久防御加成%)
  let actualDefense = defender.defense * (1 + defender.permanentDefenseBonus / 100)
  
  if (defender.isDefending) {
    actualDefense = Math.ceil(actualDefense * 1.1)
  }
  const damage = actualAttack - actualDefense
  return Math.max(1, Math.ceil(damage))
}



export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS
}

export function getAvailablePositions(units: Unit[], unit: Unit, moveRange: number, thunderAreas: { row: number; col: number }[] = []): { row: number; col: number; distance: number }[] {
  const positions: { row: number; col: number; distance: number }[] = []
  
  const visited: boolean[][] = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false))
  const queue: { row: number; col: number; distance: number }[] = []
  
  queue.push({ row: unit.position.row, col: unit.position.col, distance: 0 })
  visited[unit.position.row][unit.position.col] = true
  
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ]
  
  while (queue.length > 0) {
    const current = queue.shift()!
    
    for (const dir of directions) {
      const newRow = current.row + dir.dr
      const newCol = current.col + dir.dc
      const newDistance = current.distance + 1
      
      if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
        if (!visited[newRow][newCol] && newDistance <= moveRange) {
          if (!isObstacle(newRow, newCol)) {
            const occupied = units.some(u => u.position.row === newRow && u.position.col === newCol)
            if (!occupied) {
              visited[newRow][newCol] = true
              queue.push({ row: newRow, col: newCol, distance: newDistance })
              if (newDistance > 0) {
                positions.push({ row: newRow, col: newCol, distance: newDistance })
              }
            }
          }
        }
      }
    }
  }
  
  // 排序：非雷电格子优先，距离相近的情况下
  const isThunder = (row: number, col: number) => thunderAreas.some(t => t.row === row && t.col === col)
  const currentInThunder = isThunder(unit.position.row, unit.position.col)
  
  positions.sort((a, b) => {
    const aIsThunder = isThunder(a.row, a.col)
    const bIsThunder = isThunder(b.row, b.col)
    
    // 如果当前在雷电格子里，优先选择非雷电格子
    if (currentInThunder) {
      if (!aIsThunder && bIsThunder) return -1
      if (aIsThunder && !bIsThunder) return 1
    } else {
      // 如果当前不在雷电格子里，优先选择非雷电格子
      if (!aIsThunder && bIsThunder) return -1
      if (aIsThunder && !bIsThunder) return 1
    }
    
    // 相同类型的，按距离排序
    return a.distance - b.distance
  })
  
  return positions
}

export function getAttackablePositions(units: Unit[], unit: Unit): { row: number; col: number; target: Unit }[] {
  const positions: { row: number; col: number; target: Unit }[] = []
  const range = unit.attackRange
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (row === unit.position.row && col === unit.position.col) continue
      const distance = getDistance(unit.position, { row, col })
      if (distance <= range) {
        const targetUnit = units.find(u => u.position.row === row && u.position.col === col)
        if (targetUnit) {
          const isEnemy = (unit.isEnemy !== targetUnit.isEnemy)
          if (isEnemy) {
            positions.push({ row, col, target: targetUnit })
          }
        }
      }
    }
  }
  return positions
}

export function evaluateMoveSkillDamage(unit: Unit, allUnits: Unit[], thunderAreas: { row: number; col: number }[] = []): { moveRow: number; moveCol: number; targetRow: number; targetCol: number; totalDamage: number; targetIds: string[] } | null {
  if (unit.skill.currentCooldown > 0 && unit.classType !== 'warrior') return null

  const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas)
  let bestResult: { moveRow: number; moveCol: number; targetRow: number; targetCol: number; totalDamage: number; targetIds: string[] } | null = null

  // 骑士技能是原地使用的，不需要先移动
  if (unit.classType === 'knight') {
    const originalRow = unit.position.row
    const originalCol = unit.position.col

    let bestDamage = 0
    let bestTargetIds: string[] = []
    let bestTargetPos: { row: number; col: number } | null = null

    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ]

    for (const dir of directions) {
      // 对这个方向上的每个可能的终点单独计算
      for (let endDistance = 1; endDistance <= unit.moveRange; endDistance++) {
        const endRow = originalRow + dir.dr * endDistance
        const endCol = originalCol + dir.dc * endDistance

        if (!isValidPosition(endRow, endCol)) {
          break
        }

        // 检查终点是否是空的
        const unitAtEnd = allUnits.find(u => u.position.row === endRow && u.position.col === endCol)
        if (unitAtEnd) {
          // 终点有单位，不能作为冲锋终点，继续找更远的位置
          continue
        }

        // 终点是空的，可以作为冲锋目标，计算到这个终点为止的路径伤害
        let tempDamage = 0
        const tempTargetIds: string[] = []

        for (let i = 1; i < endDistance; i++) {
          const row = originalRow + dir.dr * i
          const col = originalCol + dir.dc * i
          const target = allUnits.find(u => u.position.row === row && u.position.col === col)
      
      if (target && unit.isEnemy !== target.isEnemy) {
        const damage = Math.ceil(calculateDamage(unit, target) * 1.1)
        tempDamage += damage
        tempTargetIds.push(target.id)
      }
        }

        // 检查这个终点是否比之前的更好
        if (tempDamage > bestDamage) {
          bestDamage = tempDamage
          bestTargetIds = [...tempTargetIds]
          bestTargetPos = { row: endRow, col: endCol }
        }
      }
    }

    if (bestTargetPos && bestDamage > 0) {
      bestResult = {
        moveRow: originalRow,
        moveCol: originalCol,
        targetRow: bestTargetPos.row,
        targetCol: bestTargetPos.col,
        totalDamage: bestDamage,
        targetIds: bestTargetIds
      }
    }

    return bestResult
  }

  // 刺客技能也是原地使用的，不需要先移动
  if (unit.classType === 'assassin') {
    const originalRow = unit.position.row
    const originalCol = unit.position.col

    let bestDamage = 0
    let bestTargetIds: string[] = []
    let bestTargetPos: { row: number; col: number } | null = null
    let bestPosIsThunder = true  // 默认认为是雷电格子

    // 评估所有可能的瞬移目标位置
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 5 && distance > 0) {
          const hasUnit = allUnits.some(u => u.position.row === row && u.position.col === col)
          if (!hasUnit && !isObstacle(row, col)) {
            // 计算瞬移到这个位置后4个方向的伤害
            let tempDamage = 0
            const tempTargetIds: string[] = []

            const directions = [
              { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
              { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
            ]
            for (const dir of directions) {
              const checkRow = row + dir.dr
              const checkCol = col + dir.dc
              const target = allUnits.find(u => u.position.row === checkRow && u.position.col === checkCol && unit.isEnemy !== u.isEnemy)
              if (target) {
                const damage = Math.ceil(calculateDamage(unit, target) * 1.3)
                tempDamage += damage
                tempTargetIds.push(target.id)
              }
            }

            const isThunderPos = thunderAreas.some(t => t.row === row && t.col === col)
            
            // 非雷电格子优先
            if (bestPosIsThunder && !isThunderPos) {
              bestDamage = tempDamage
              bestTargetIds = [...tempTargetIds]
              bestTargetPos = { row, col }
              bestPosIsThunder = false
            } else if ((bestPosIsThunder === isThunderPos) && tempDamage > bestDamage) {
              // 相同类型的格子，选伤害高的
              bestDamage = tempDamage
              bestTargetIds = [...tempTargetIds]
              bestTargetPos = { row, col }
            } else if (bestTargetPos === null && tempDamage > 0) {
              // 第一个有效目标
              bestDamage = tempDamage
              bestTargetIds = [...tempTargetIds]
              bestTargetPos = { row, col }
              bestPosIsThunder = isThunderPos
            }
          }
        }
      }
    }

    if (bestTargetPos && bestDamage > 0) {
      bestResult = {
        moveRow: originalRow,
        moveCol: originalCol,
        targetRow: bestTargetPos.row,
        targetCol: bestTargetPos.col,
        totalDamage: bestDamage,
        targetIds: bestTargetIds
      }
    }

    return bestResult
  }

  // 其他职业的处理
  for (const movePos of movePositions) {
    const originalRow = unit.position.row
    const originalCol = unit.position.col

    unit.position.row = movePos.row
    unit.position.col = movePos.col

    let totalDamage = 0
    const targetIds: string[] = []

    if (unit.classType === 'mage') {
      // 法师技能：攻击移动距离≤2范围内的敌方目标，伤害1.1倍
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const distance = getDistance({ row: movePos.row, col: movePos.col }, { row, col })
          if (distance <= 2 && distance > 0) {
            const target = allUnits.find(u => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy)
            if (target) {
              const damage = Math.ceil(calculateDamage(unit, target) * 1.1)
              totalDamage += damage
              targetIds.push(target.id)
            }
          }
        }
      }
    } else if (unit.classType === 'archer') {
      let foundTarget = false
      let bestTargetId: string | null = null
      let bestTargetPos: { row: number, col: number } | null = null
      let maxDamage = 0
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col })
          if (dist <= 4 && dist > 0) {
            const target = allUnits.find(u => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy)
            if (target) {
              const damage = Math.floor(calculateDamage(unit, target) * 1.3)
              if (damage > maxDamage) {
                maxDamage = damage
                bestTargetId = target.id
                bestTargetPos = { row, col }
              }
            }
          }
        }
      }
      
      if (bestTargetId && bestTargetPos) {
        targetIds.push(bestTargetId)
        totalDamage = maxDamage
        
        // 更新最佳结果（这里要在内部更新，因为需要目标位置）
        if (!bestResult || totalDamage > bestResult.totalDamage) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: bestTargetPos.row,
            targetCol: bestTargetPos.col,
            totalDamage,
            targetIds: [...targetIds]
          }
        }
        // 清空，避免后面重复处理
        targetIds.length = 0
        totalDamage = 0
      }
    } else if (unit.classType === 'witch') {
      let bestHealValue = 0
      let bestTargetId: string | null = null
      let bestTargetPos: { row: number, col: number } | null = null
      
      // 遍历所有友方单位（包括自己），寻找治疗价值最高的目标
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col })
          if (dist <= 4 && dist > 0) { // 巫师技能范围是4格
            const target = allUnits.find(u => u.position.row === row && u.position.col === col && unit.isEnemy === u.isEnemy)
            if (target) {
              // 治疗价值 = 目标缺失的生命值（最多不超过治疗量）
              const healAmount = unit.attack * 2
              const missingHp = target.maxHp - target.hp
              const healValue = Math.min(missingHp, healAmount)
              
              // 选择治疗价值最高的目标
              if (healValue > bestHealValue) {
                bestHealValue = healValue
                bestTargetId = target.id
                bestTargetPos = { row, col }
              }
            }
          }
        }
      }
      
      // 计算如果去攻击敌人能造成的最大伤害
      let maxAttackDamage = 0
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          const dist = getDistance({ row: movePos.row, col: movePos.col }, { row, col })
          if (dist <= unit.attackRange && dist > 0) {
            const target = allUnits.find(u => u.position.row === row && u.position.col === col && unit.isEnemy !== u.isEnemy)
            if (target) {
              const damage = calculateDamage(unit, target)
              if (damage > maxAttackDamage) {
                maxAttackDamage = damage
              }
            }
          }
        }
      }
      
      // 只有当治疗价值大于攻击伤害时才使用治疗技能
      if (bestTargetId && bestTargetPos && bestHealValue > maxAttackDamage) {
        targetIds.push(bestTargetId)
        totalDamage = bestHealValue // 用totalDamage来表示治疗价值
        
        // 更新最佳结果（这里要在内部更新，因为需要目标位置）
        if (!bestResult || totalDamage > bestResult.totalDamage) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: bestTargetPos.row,
            targetCol: bestTargetPos.col,
            totalDamage,
            targetIds: [...targetIds]
          }
        }
        // 清空，避免后面重复处理
        targetIds.length = 0
        totalDamage = 0
      }
    } else if (unit.classType === 'warrior') {
      const healAmount = Math.ceil(unit.maxHp * 0.15)
      totalDamage = -healAmount
    }

    unit.position.row = originalRow
    unit.position.col = originalCol

    if (targetIds.length > 0 && totalDamage > 0) {
      // 对于法师、弓箭手、巫师，totalDamage>0都有效
      if (!bestResult || totalDamage > bestResult.totalDamage) {
        bestResult = {
          moveRow: movePos.row,
          moveCol: movePos.col,
          targetRow: movePos.row,
          targetCol: movePos.col,
          totalDamage,
          targetIds
        }
      }
    } else if (unit.classType === 'warrior' && totalDamage < 0) {
      if (!bestResult || totalDamage < bestResult.totalDamage) {
        bestResult = {
          moveRow: movePos.row,
          moveCol: movePos.col,
          targetRow: movePos.row,
          targetCol: movePos.col,
          totalDamage: Math.abs(totalDamage),
          targetIds: []
        }
      }
    }
  }

  return bestResult
}

export function evaluateMoveAttackDamage(unit: Unit, allUnits: Unit[], thunderAreas: { row: number; col: number }[] = []): { moveRow: number; moveCol: number; targetRow: number; targetCol: number; damage: number; targetId: string } | null {
  const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas)
  let bestResult: { moveRow: number; moveCol: number; targetRow: number; targetCol: number; damage: number; targetId: string } | null = null
  let bestResultIsThunder = true

  for (const movePos of movePositions) {
    const originalRow = unit.position.row
    const originalCol = unit.position.col

    unit.position.row = movePos.row
    unit.position.col = movePos.col

    const attackPositions = getAttackablePositions(allUnits, unit)

    unit.position.row = originalRow
    unit.position.col = originalCol

    const movePosIsThunder = thunderAreas.some(t => t.row === movePos.row && t.col === movePos.col)

    if (attackPositions.length > 0) {
      for (const attackPos of attackPositions) {
        // 非雷电格子优先
        if (bestResultIsThunder && !movePosIsThunder) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: attackPos.row,
            targetCol: attackPos.col,
            damage: attackPos.target.hp,
            targetId: attackPos.target.id
          }
          bestResultIsThunder = false
        } else if ((bestResultIsThunder === movePosIsThunder) && (!bestResult || attackPos.target.hp < bestResult.damage)) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: attackPos.row,
            targetCol: attackPos.col,
            damage: attackPos.target.hp,
            targetId: attackPos.target.id
          }
        } else if (bestResult === null) {
          bestResult = {
            moveRow: movePos.row,
            moveCol: movePos.col,
            targetRow: attackPos.row,
            targetCol: attackPos.col,
            damage: attackPos.target.hp,
            targetId: attackPos.target.id
          }
          bestResultIsThunder = movePosIsThunder
        }
      }
    }
  }

  return bestResult
}

export function findClosestEnemyPosition(unit: Unit, allUnits: Unit[], thunderAreas: { row: number; col: number }[] = []): { row: number; col: number; distance: number; targetId: string } | null {
  const enemies = allUnits.filter(u => unit.isEnemy !== u.isEnemy && u.hp > 0)
  if (enemies.length === 0) return null

  let best: { row: number; col: number; distance: number; targetId: string } | null = null
  let bestIsThunder = true

  const movePositions = getAvailablePositions(allUnits, unit, unit.moveRange, thunderAreas)
  for (const movePos of movePositions) {
    const movePosIsThunder = thunderAreas.some(t => t.row === movePos.row && t.col === movePos.col)
    for (const enemy of enemies) {
      const dist = getDistance(movePos, enemy.position)
      
      // 非雷电格子优先
      if (bestIsThunder && !movePosIsThunder) {
        best = {
          row: movePos.row,
          col: movePos.col,
          distance: dist,
          targetId: enemy.id
        }
        bestIsThunder = false
      } else if ((bestIsThunder === movePosIsThunder) && (!best || dist < best.distance)) {
        best = {
          row: movePos.row,
          col: movePos.col,
          distance: dist,
          targetId: enemy.id
        }
      } else if (best === null) {
        best = {
          row: movePos.row,
          col: movePos.col,
          distance: dist,
          targetId: enemy.id
        }
        bestIsThunder = movePosIsThunder
      }
    }
  }

  return best
}

export function getSkillRangePositions(unit: Unit, units: Unit[]): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = []
  const centerRow = unit.position.row
  const centerCol = unit.position.col

  if (unit.classType === 'mage') {
    // 法师技能范围：移动距离≤2范围内
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 2 && distance > 0) {
          // 可以选择有敌人或有障碍物的位置
          const target = units.find(u => u.position.row === row && u.position.col === col)
          if ((target && unit.isEnemy !== target.isEnemy) || isObstacle(row, col)) {
            positions.push({ row, col })
          }
        }
      }
    }
  } else if (unit.classType === 'archer') {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 4 && distance > 0) {
          const target = units.find(u => u.position.row === row && u.position.col === col)
          if ((target && unit.isEnemy !== target.isEnemy) || isObstacle(row, col)) {
            positions.push({ row, col })
          }
        }
      }
    }
  } else if (unit.classType === 'knight') {
    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ]
    for (const dir of directions) {
      for (let i = 1; i <= unit.moveRange; i++) {
        const row = centerRow + dir.dr * i
        const col = centerCol + dir.dc * i
        if (!isValidPosition(row, col)) {
          break
        }
        // 检查当前这个位置是否是空的
        const unitAtPos = units.find(u => u.position.row === row && u.position.col === col)
        if (!unitAtPos) {
          positions.push({ row, col })
        }
      }
    }
  } else if (unit.classType === 'witch') {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 3 && distance > 0) {
          const target = units.find(u => u.position.row === row && u.position.col === col)
          if (target && unit.isEnemy === target.isEnemy) {
            positions.push({ row, col })
          }
        }
      }
    }
  } else if (unit.classType === 'warrior') {
    positions.push({ row: centerRow, col: centerCol })
  } else if (unit.classType === 'assassin') {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 5 && distance > 0) {
          const hasUnit = units.some(u => u.position.row === row && u.position.col === col)
          if (!hasUnit && !isObstacle(row, col)) {
            positions.push({ row, col })
          }
        }
      }
    }
  } else if (unit.classType === 'architect') {
    // 建筑师技能范围：相邻四格，没有角色的格子
    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ]
    for (const dir of directions) {
      const row = centerRow + dir.dr
      const col = centerCol + dir.dc
      if (isValidPosition(row, col)) {
        const hasUnit = units.some(u => u.position.row === row && u.position.col === col)
        if (!hasUnit) {
          positions.push({ row, col })
        }
      }
    }
  } else if (unit.classType === 'strategist') {
    // 军师技能范围：4格范围内任意位置
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 4 && distance > 0) {
          // 可以选择有角色或有障碍物的位置
          const hasUnit = units.some(u => u.position.row === row && u.position.col === col)
          if (hasUnit || isObstacle(row, col)) {
            positions.push({ row, col })
          }
        }
      }
    }
  }

  return positions
}

export function useSkill(unit: Unit, targetPos: { row: number; col: number } | null, allUnits: Unit[], skillTargets: { row: number; col: number }[]): { damage: { target: Unit; damage: number; killed: boolean }[]; healing: { target: Unit; amount: number }[]; positionChange: { row: number; col: number } | null; removedObstacles: { row: number; col: number }[]; addedObstacles: { row: number; col: number }[]; swapInfo?: { target1: string; target2: string } } {
  const results = {
    damage: [] as { target: Unit; damage: number; killed: boolean }[],
    healing: [] as { target: Unit; amount: number }[],
    positionChange: null as { row: number; col: number } | null,
    removedObstacles: [] as { row: number; col: number }[],
    addedObstacles: [] as { row: number; col: number }[]
  }

  if (unit.classType === 'archer') {
    if (targetPos) {
      const target = allUnits.find(u => u.position.row === targetPos.row && u.position.col === targetPos.col)
      if (target && unit.isEnemy !== target.isEnemy) {
        const damage = Math.floor(calculateDamage(unit, target) * 1.3)
        target.hp = Math.max(0, target.hp - damage)
        results.damage.push({ target, damage, killed: target.hp <= 0 })
      }
      if (isObstacle(targetPos.row, targetPos.col)) {
        if (removeObstacle(targetPos.row, targetPos.col)) {
          results.removedObstacles.push({ row: targetPos.row, col: targetPos.col })
        }
      }
    }
  } else if (unit.classType === 'mage') {
    // 法师技能：攻击移动距离≤2范围内的敌方目标，伤害1.1倍
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const distance = getDistance(unit.position, { row, col })
        if (distance <= 2 && distance > 0) {
          const target = allUnits.find(u => u.position.row === row && u.position.col === col)
          if (target && unit.isEnemy !== target.isEnemy) {
            const damage = Math.ceil(calculateDamage(unit, target) * 1.1)
            target.hp = Math.max(0, target.hp - damage)
            results.damage.push({ target, damage, killed: target.hp <= 0 })
          }
          if (isObstacle(row, col)) {
            if (removeObstacle(row, col)) {
              results.removedObstacles.push({ row, col })
            }
          }
        }
      }
    }
  } else if (unit.classType === 'knight' && targetPos) {
    const dr = targetPos.row - unit.position.row
    const dc = targetPos.col - unit.position.col
    
    let dirDr = 0
    let dirDc = 0
    
    if (dr !== 0) {
      dirDr = dr > 0 ? 1 : -1
    } else if (dc !== 0) {
      dirDc = dc > 0 ? 1 : -1
    }
    
    if (dirDr === 0 && dirDc === 0) {
      return results
    }
    
    const distance = Math.abs(dr) + Math.abs(dc)
    if (distance > unit.moveRange) {
      return results
    }
    
    const unitAtTarget = allUnits.find(u => u.position.row === targetPos.row && u.position.col === targetPos.col && u.id !== unit.id)
    if (unitAtTarget) {
      return results
    }
    
    // 直接执行冲锋，清除障碍物并攻击路径上的敌人
    for (let i = 1; i < distance; i++) {
      const row = unit.position.row + dirDr * i
      const col = unit.position.col + dirDc * i
      
      if (!isValidPosition(row, col)) {
        break
      }
      
      if (isObstacle(row, col)) {
        if (removeObstacle(row, col)) {
          results.removedObstacles.push({ row, col })
        }
      }
      
      const target = allUnits.find(u => u.position.row === row && u.position.col === col && u.id !== unit.id)
      if (target) {
        if (unit.isEnemy !== target.isEnemy) {
          const damage = Math.ceil(calculateDamage(unit, target) * 1.1)
          target.hp = Math.max(0, target.hp - damage)
          results.damage.push({ target, damage, killed: target.hp <= 0 })
        }
      }
    }

    unit.position.row = targetPos.row
    unit.position.col = targetPos.col
    results.positionChange = { row: targetPos.row, col: targetPos.col }
  } else if (unit.classType === 'warrior') {
    const healAmount = Math.ceil(unit.maxHp * 0.15)
    unit.hp = Math.min(unit.maxHp, unit.hp + healAmount)
    // 永久加成：攻击+10%，防御+15%，可无限叠加
    unit.permanentAttackBonus += 10
    unit.permanentDefenseBonus += 15
    results.healing.push({ target: unit, amount: healAmount })
  } else if (unit.classType === 'witch') {
    if (targetPos) {
      const target = allUnits.find(u => u.position.row === targetPos.row && u.position.col === targetPos.col)
      if (target && unit.isEnemy === target.isEnemy) {
        const healAmount = unit.attack * 2
        target.hp = Math.min(target.maxHp, target.hp + healAmount)
        results.healing.push({ target, amount: healAmount })
      }
    }
  } else if (unit.classType === 'assassin') {
    if (targetPos) {
      // 检查目标位置是否可以瞬移（没有角色和障碍物）
      const hasUnit = allUnits.some(u => u.position.row === targetPos.row && u.position.col === targetPos.col)
      if (!hasUnit && !isObstacle(targetPos.row, targetPos.col)) {
        const distance = getDistance(unit.position, targetPos)
        if (distance <= 5) {
          // 瞬移到目标位置
          unit.position.row = targetPos.row
          unit.position.col = targetPos.col
          results.positionChange = { row: targetPos.row, col: targetPos.col }

          // 攻击上下左右4个方向的敌人
          const directions = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
          ]
          for (const dir of directions) {
            const row = targetPos.row + dir.dr
            const col = targetPos.col + dir.dc
            const target = allUnits.find(u => u.position.row === row && u.position.col === col)
            if (target && unit.isEnemy !== target.isEnemy) {
              const damage = Math.ceil(calculateDamage(unit, target) * 1.3)
              target.hp = Math.max(0, target.hp - damage)
              results.damage.push({ target, damage, killed: target.hp <= 0 })
            }
            // 清除相邻障碍物
            if (isObstacle(row, col)) {
              if (removeObstacle(row, col)) {
                results.removedObstacles.push({ row, col })
              }
            }
          }
        }
      }
    }
  } else if (unit.classType === 'architect') {
    // 建筑师技能：在相邻四格范围内，选择至多3个没有角色的格子
    // 有障碍物则清除，无障碍物则生成
    const processedCount = Math.min(3, skillTargets.length)
    for (let i = 0; i < processedCount; i++) {
      const pos = skillTargets[i]
      // 检查位置是否有角色
      const hasUnit = allUnits.some(u => u.position.row === pos.row && u.position.col === pos.col)
      if (!hasUnit) {
        if (isObstacle(pos.row, pos.col)) {
          // 有障碍物则清除
          if (removeObstacle(pos.row, pos.col)) {
            results.removedObstacles.push({ row: pos.row, col: pos.col })
          }
        } else {
          // 无障碍物则生成
          if (addObstacle(pos.row, pos.col)) {
            results.addedObstacles.push({ row: pos.row, col: pos.col })
          }
        }
      }
    }
  } else if (unit.classType === 'strategist') {
    // 军师技能：斗转星移，选择两个目标交换位置
    if (skillTargets.length === 2) {
      const pos1 = skillTargets[0]
      const pos2 = skillTargets[1]
      
      const unit1 = allUnits.find(u => u.position.row === pos1.row && u.position.col === pos1.col)
      const unit2 = allUnits.find(u => u.position.row === pos2.row && u.position.col === pos2.col)
      const hasObstacle1 = isObstacle(pos1.row, pos1.col)
      const hasObstacle2 = isObstacle(pos2.row, pos2.col)
      
      // 确定两个目标的名称
      const target1Name = unit1 ? `【${unit1.name}】` : '障碍物'
      const target2Name = unit2 ? `【${unit2.name}】` : '障碍物'
      
      // 情况1：两个角色交换
      if (unit1 && unit2) {
        const tempPos = { ...unit1.position }
        unit1.position = { ...unit2.position }
        unit2.position = tempPos
      } 
      // 情况2：角色1和障碍物2交换
      else if (unit1 && hasObstacle2) {
        const tempPos = { ...unit1.position }
        unit1.position = { ...pos2 }
        removeObstacle(pos2.row, pos2.col)
        addObstacle(tempPos.row, tempPos.col)
        results.removedObstacles.push(pos2)
        results.addedObstacles.push(tempPos)
      } 
      // 情况3：障碍物1和角色2交换
      else if (hasObstacle1 && unit2) {
        const tempPos = { ...unit2.position }
        unit2.position = { ...pos1 }
        removeObstacle(pos1.row, pos1.col)
        addObstacle(tempPos.row, tempPos.col)
        results.removedObstacles.push(pos1)
        results.addedObstacles.push(tempPos)
      }
      // 情况4：两个障碍物交换 - 不需要处理，因为看起来一样
      
      // 记录交换信息
      (results as any).swapInfo = { target1: target1Name, target2: target2Name }
    }
  }

  return results
}

function findNearestEmptyPosition(fromRow: number, fromCol: number, allUnits: Unit[], excludeUnitId: string): { row: number; col: number } | null {
  const visited: boolean[][] = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(false))
  const queue: { row: number; col: number; distance: number }[] = []

  queue.push({ row: fromRow, col: fromCol, distance: 0 })
  visited[fromRow][fromCol] = true

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const dir of directions) {
      const newRow = current.row + dir.dr
      const newCol = current.col + dir.dc
      const newDistance = current.distance + 1

      if (newRow >= 0 && newRow < MAP_ROWS && newCol >= 0 && newCol < MAP_COLS) {
        if (!visited[newRow][newCol] && newDistance <= 5) {
          if (!isObstacle(newRow, newCol)) {
            const occupied = allUnits.some(u =>
              u.position.row === newRow &&
              u.position.col === newCol &&
              u.id !== excludeUnitId
            )
            if (!occupied) {
              return { row: newRow, col: newCol }
            }
            visited[newRow][newCol] = true
            queue.push({ row: newRow, col: newCol, distance: newDistance })
          }
        }
      }
    }
  }

  return null
}