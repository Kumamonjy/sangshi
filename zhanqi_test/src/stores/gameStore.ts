import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Unit, GameSettings, BattleState } from '../utils/gameData'
import {
  createInitialHeroes,
  createUnit,
  createEnemyUnit,
  createAllyAI,
  calculateDamage,
  getAvailablePositions,
  getAttackablePositions,
  getSkillRangePositions,
  useSkill,
  getExpForLevel,
  getLevelUpStats,
  MAP_ROWS,
  MAP_COLS,
  CLASS_CONFIG,
  generateUnitId,
  isObstacle,
  generateRandomObstacles,
  setObstacles,
  removeObstacle,
  addObstacle,
  removeObstacleWithGrassChance,
  generateHealingGrass,
  evaluateMoveSkillDamage,
  evaluateMoveAttackDamage,
  findClosestEnemyPosition
} from '../utils/gameData'

export const useGameStore = defineStore('game', () => {
  const gold = ref(100)
  const heroes = ref<Unit[]>(createInitialHeroes())
  const selectedBattleUnits = ref<string[]>([])
  const settings = ref<GameSettings>({
    enemyCount: 4,
    allyAiCount: 4
  })

  function initSettings() {
    const userAdjusted = uni.getStorageSync('settings_user_adjusted')
    if (!userAdjusted) {
      settings.value.enemyCount = 4
      settings.value.allyAiCount = 4
    } else {
      if (settings.value.enemyCount < 3 || settings.value.enemyCount > 10) {
        settings.value.enemyCount = 4
      }
      if (settings.value.allyAiCount < 3 || settings.value.allyAiCount > 10) {
        settings.value.allyAiCount = 4
      }
    }
  }

  const battle = ref<BattleState>({
    units: [],
    currentTurn: 'player',
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
    maxSummons: 3,
    healingGrass: [],
    weather: 'normal',
    snowAreas: []
  })

  const aiJoinMessage = ref('')
  const showAiJoinMessage = ref(false)
  const subtitle = ref('')
  interface BattleLogEntry {
    turn: number
    messages: string[]
  }
  
  const battleLog = ref<BattleLogEntry[]>([])
  
  function addBattleLog(message: string) {
    const currentTurn = battle.value.turnNumber
    const existingTurn = battleLog.value.find(entry => entry.turn === currentTurn)
    
    if (existingTurn) {
      existingTurn.messages.push(message)
      // 确保响应式更新
      const index = battleLog.value.findIndex(entry => entry.turn === currentTurn)
      if (index !== -1) {
        battleLog.value[index] = { ...existingTurn }
      }
    } else {
      battleLog.value = [...battleLog.value, { turn: currentTurn, messages: [message] }]
    }
  }

  function clearBattleLog() {
    battleLog.value = []
  }

  const totalPlayerUnits = computed(() => {
    return battle.value.units.filter(u => !u.isEnemy).length
  })

  const totalEnemyUnits = computed(() => {
    return battle.value.units.filter(u => u.isEnemy).length
  })

  const alivePlayerUnits = computed(() => {
    return battle.value.units.filter(u => !u.isEnemy && u.hp > 0)
  })

  const aliveEnemyUnits = computed(() => {
    return battle.value.units.filter(u => u.isEnemy && u.hp > 0)
  })

  function updateSettings(newSettings: Partial<GameSettings>) {
    Object.assign(settings.value, newSettings)
    uni.setStorageSync('settings_user_adjusted', 'true')
  }

  function addGold(amount: number) {
    gold.value += amount
  }

  function deductGold(amount: number) {
    gold.value = Math.max(0, gold.value - amount)
  }

  function showSubtitle(text: string) {
    subtitle.value = text
    setTimeout(() => {
      subtitle.value = ''
    }, 2000)
  }

  function callReinforcements() {
    if (battle.value.summonCount >= battle.value.maxSummons) {
      showSubtitle('已达到最大支援次数')
      return
    }

    const classes = ['warrior', 'knight', 'archer', 'mage', 'witch', 'assassin']
    const allyClass = classes[Math.floor(Math.random() * classes.length)]
    const enemyClass = classes[Math.floor(Math.random() * classes.length)]
    
    addAiUnitDirect('ally', allyClass)
    addAiUnitDirect('enemy', enemyClass)
    
    battle.value.summonCount++
    showAiJoinMessage.value = true
    aiJoinMessage.value = `我方AI【${CLASS_CONFIG[allyClass as keyof typeof CLASS_CONFIG].name}】和敌方AI【${CLASS_CONFIG[enemyClass as keyof typeof CLASS_CONFIG].name}】加入战斗！`
    
    setTimeout(() => {
      showAiJoinMessage.value = false
    }, 3000)
  }

  function addAiUnitDirect(side: 'ally' | 'enemy', classType: string) {
    const emptyPositions: { row: number; col: number }[] = []
    const isAlly = side === 'ally'
    const startRow = isAlly ? MAP_ROWS - 2 : 0
    const endRow = isAlly ? MAP_ROWS - 1 : 1

    for (let r = startRow; r <= endRow; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (!isObstacle(r, c)) {
          const occupied = battle.value.units.some(u => u.position.row === r && u.position.col === c)
          if (!occupied) {
            emptyPositions.push({ row: r, col: c })
          }
        }
      }
    }

    if (emptyPositions.length > 0) {
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]

      if (side === 'ally') {
        const playerUnits = battle.value.units.filter(u => !u.isEnemy)
        const avgLevel = playerUnits.length > 0 ? Math.floor(playerUnits.reduce((sum, u) => sum + u.level, 0) / playerUnits.length) : 1
        const aiUnit = createAllyAI(classType, pos, avgLevel)
        battle.value.units.push(aiUnit)
      } else {
        const playerUnits = battle.value.units.filter(u => !u.isEnemy)
        const avgLevel = playerUnits.length > 0 ? Math.floor(playerUnits.reduce((sum, u) => sum + u.level, 0) / playerUnits.length) : 1
        const aiUnit = createEnemyUnit(classType, pos, avgLevel)
        battle.value.units.push(aiUnit)
      }
    }
  }

  function hireHero(): { success: boolean; message: string; hero?: Unit } {
    if (gold.value < 100) {
      return { success: false, message: '金币不足，无法雇佣新角色' }
    }

    const classes = ['warrior', 'knight', 'archer', 'mage', 'witch', 'assassin', 'architect', 'strategist']
    const randomClass = classes[Math.floor(Math.random() * classes.length)]
    const classConfig = CLASS_CONFIG[randomClass as keyof typeof CLASS_CONFIG]

    deductGold(100)

    const newHero: Unit = {
      id: generateUnitId(),
      name: `新角色-${classConfig.name}`,
      classType: randomClass as Unit['classType'],
      isHero: true,
      isAI: false,
      isEnemy: false,
      level: 1,
      exp: 0,
      statPoints: 1,
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
      position: { row: 0, col: 0 },
      isDefending: false,
      hasActed: false,
      hasMoved: false,
      hasAttacked: false
    }

    heroes.value.push(newHero)
    return { success: true, message: '雇佣成功', hero: newHero }
  }

  function fireHero(heroId: string): { success: boolean; message: string } {
    const hero = heroes.value.find(h => h.id === heroId)
    if (!hero) {
      return { success: false, message: '角色不存在' }
    }

    if (hero.isHero) {
      return { success: false, message: '主角不可被解雇' }
    }

    const index = heroes.value.findIndex(h => h.id === heroId)
    heroes.value.splice(index, 1)
    addGold(50)
    return { success: true, message: '解雇成功，获得50金币' }
  }

  function renameHero(heroId: string, newName: string): { success: boolean; message: string } {
    const hero = heroes.value.find(h => h.id === heroId)
    if (hero) {
      hero.name = newName
      return { success: true, message: '重命名成功' }
    }
    return { success: false, message: '角色不存在' }
  }

  function changeHeroClass(heroIndex: number, newClass: 'warrior' | 'knight' | 'archer' | 'mage' | 'witch' | 'assassin' | 'architect' | 'strategist') {
    const hero = heroes.value[heroIndex]
    if (!hero) return

    const classConfig = CLASS_CONFIG[newClass]
    const oldLevel = hero.level
    const oldExp = hero.exp
    const oldStatPoints = hero.statPoints
    const usedStatPoints = hero.usedStatPoints
    const oldName = hero.name
    const oldIsHero = hero.isHero

    const newHero = createUnit({
      name: oldName,
      classType: newClass,
      isHero: oldIsHero,
      level: 1
    })
    newHero.level = oldLevel
    newHero.exp = oldExp
    newHero.statPoints = oldStatPoints + usedStatPoints
    newHero.usedStatPoints = 0

    for (let i = 2; i <= oldLevel; i++) {
      const stats = getLevelUpStats(newClass, i)
      newHero.maxHp = Math.round((newHero.maxHp + stats.hp) * 10) / 10
      newHero.attack = Math.round((newHero.attack + stats.attack) * 10) / 10
      newHero.defense = Math.round((newHero.defense + stats.defense) * 10) / 10
    }

    newHero.hp = newHero.maxHp
    heroes.value[heroIndex] = newHero
  }

  function addHeroStat(heroIndex: number, statType: 'maxHp' | 'attack' | 'defense', value: number) {
    const hero = heroes.value[heroIndex]
    if (hero && hero.statPoints > 0) {
      hero.statPoints--
      hero.usedStatPoints++
      if (statType === 'maxHp') {
        hero.maxHp += value
        hero.hp += value
      } else if (statType === 'attack') {
        hero.attack += value
      } else if (statType === 'defense') {
        hero.defense += value
      }
    }
  }

  function awardExpToHeroes(exp: number) {
    heroes.value.forEach(hero => {
      if (hero.level > 0 && selectedBattleUnits.value.includes(hero.id)) {
        hero.exp += exp
        const expNeeded = getExpForLevel(hero.level)
        while (hero.exp >= expNeeded && hero.level < 10) {
          hero.exp -= expNeeded
          hero.level++
          const stats = getLevelUpStats(hero.classType, hero.level)
          hero.maxHp = Math.round((hero.maxHp + stats.hp) * 10) / 10
          hero.hp = hero.maxHp
          hero.attack = Math.round((hero.attack + stats.attack) * 10) / 10
          hero.defense = Math.round((hero.defense + stats.defense) * 10) / 10

          if (hero.isHero) {
            hero.statPoints += 1
          }
        }
      }
    })
  }

  function toggleBattleUnitSelection(unitId: string) {
    const index = selectedBattleUnits.value.indexOf(unitId)
    if (index !== -1) {
      selectedBattleUnits.value.splice(index, 1)
    } else {
      if (selectedBattleUnits.value.length < 5) {
        selectedBattleUnits.value.push(unitId)
      }
    }
  }

  function clearBattleSelection() {
    selectedBattleUnits.value = []
  }

  function startBattle() {
    if (selectedBattleUnits.value.length === 0) {
      return
    }

    battle.value.units = []
    clearBattleLog()

    const randomObstacles = generateRandomObstacles()
    setObstacles(randomObstacles)
    
    const healingGrass = generateHealingGrass(randomObstacles)
    battle.value.healingGrass = healingGrass

    const classes = ['warrior', 'knight', 'archer', 'mage', 'witch', 'assassin']
    const BOTTOM_ROW = MAP_ROWS - 1
    const TOP_ROW = 0

    const usedPlayerCols = new Set<number>()
    const usedEnemyCols = new Set<number>()

    const getRandomCol = (used: Set<number>): number => {
      let col: number
      do {
        col = Math.floor(Math.random() * MAP_COLS)
      } while (used.has(col))
      used.add(col)
      return col
    }

    const selectedHeroes = heroes.value.filter(h => selectedBattleUnits.value.includes(h.id))
    const allPlayerUnits = [...selectedHeroes]

    const allyTotalCount = settings.value.allyAiCount || 5
    const neededAiCount = allyTotalCount - selectedHeroes.length
    
    if (neededAiCount > 0) {
      for (let i = 0; i < neededAiCount; i++) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)]
        const avgLevel = selectedHeroes.length > 0 ? Math.floor(selectedHeroes.reduce((sum, h) => sum + h.level, 0) / selectedHeroes.length) : 1
        const aiUnit = createAllyAI(randomClass, { row: 0, col: 0 }, avgLevel)
        allPlayerUnits.push(aiUnit)
      }
    }

    const avgPlayerLevel = allPlayerUnits.length > 0 ? Math.floor(allPlayerUnits.reduce((sum, u) => sum + u.level, 0) / allPlayerUnits.length) : 1

    allPlayerUnits.forEach((hero) => {
      const battleHero: Unit = { ...hero }
      battleHero.id = generateUnitId()
      battleHero.position = { row: BOTTOM_ROW, col: getRandomCol(usedPlayerCols) }
      battleHero.hp = battleHero.maxHp
      battleHero.hasActed = false
      battleHero.hasMoved = false
      battleHero.hasAttacked = false
      battleHero.skill = { ...hero.skill, currentCooldown: 0 }
      battleHero.isDefending = false
      battleHero.isEnemy = false // 确保友方单位都是友方！
      battleHero.permanentAttackBonus = 0 // 重置攻击加成
      battleHero.permanentDefenseBonus = 0 // 重置防御加成
      battle.value.units.push(battleHero)
    })

    // 👇 第二次：敌人数量（重新const定义，不重复）
    const realEnemyCount = settings.value.enemyCount || 3
    for (let i = 0; i < realEnemyCount; i++) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)]
      const position = {
        row: TOP_ROW,
        col: getRandomCol(usedEnemyCols)
      }
      const enemy = createEnemyUnit(randomClass, position, avgPlayerLevel)
      battle.value.units.push(enemy)
    }

    battle.value.currentTurn = 'player'
    battle.value.selectedUnit = null
    battle.value.turnNumber = 1
    battle.value.speed = 1
    battle.value.gameResult = null
    battle.value.aiJoinPending = false
    battle.value.pendingAiSide = null
    battle.value.pendingAiClass = null
    battle.value.moveMode = false
    battle.value.attackMode = false
    battle.value.skillMode = false
    battle.value.skillTargets = []
    battle.value.summonCount = 0
    battle.value.maxSummons = 3

    const playerUnits = battle.value.units.filter(u => !u.isEnemy)
    battle.value.totalPlayerUnits = playerUnits.length
    battle.value.playerUnitsActed = 0
    
    // 初始化天气
    updateWeather()
  }

  function selectUnit(unitId: string) {
    const unit = battle.value.units.find(u => u.id === unitId)
    if (unit && battle.value.currentTurn === 'player') {
      if (!unit.isEnemy && !unit.hasActed && !unit.isAI) {
        battle.value.selectedUnit = unit
        battle.value.moveMode = false
        battle.value.attackMode = false
        battle.value.skillMode = false
        battle.value.skillTargets = []
      } else if (unit.isEnemy) {
        battle.value.selectedUnit = unit
        battle.value.moveMode = false
        battle.value.attackMode = false
        battle.value.skillMode = false
        battle.value.skillTargets = []
      } else if (!unit.isEnemy && unit.hasActed && !unit.isAI) {
        battle.value.selectedUnit = unit
        battle.value.moveMode = false
        battle.value.attackMode = false
        battle.value.skillMode = false
        battle.value.skillTargets = []
      } else if (!unit.isEnemy && unit.isAI) {
        battle.value.selectedUnit = unit
        battle.value.moveMode = false
        battle.value.attackMode = false
        battle.value.skillMode = false
        battle.value.skillTargets = []
      }
    }
  }

  function deselectUnit() {
    battle.value.selectedUnit = null
    battle.value.moveMode = false
    battle.value.attackMode = false
    battle.value.skillMode = false
    battle.value.skillTargets = []
  }

  function moveUnit(unitId: string, row: number, col: number) {
    const unit = battle.value.units.find(u => u.id === unitId)
    if (unit) {
      const occupied = battle.value.units.some(u => u.id !== unitId && u.position.row === row && u.position.col === col)
      if (occupied) {
        return
      }
      unit.position = { row, col }
      unit.hasMoved = true
      // 只有同时完成了移动和攻击/防御时，才标记为已行动
      if (unit.hasAttacked) {
        unit.hasActed = true
      }
      battle.value.moveMode = false

      const grassIndex = battle.value.healingGrass.findIndex(g => g.row === row && g.col === col)
      if (grassIndex !== -1) {
        const healAmount = Math.ceil(unit.maxHp * 0.3)
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmount)
        battle.value.healingGrass.splice(grassIndex, 1)
        showSubtitle(`我方【${unit.name}】服用了草药，回复${healAmount}点生命值！`)
        addBattleLog(`我方【${unit.name}】服用了草药，回复${healAmount}点生命值！`)
      }
    }
  }

  function setAttackMode(enabled: boolean) {
    if (enabled) {
      battle.value.attackMode = true
      battle.value.moveMode = false
      battle.value.skillMode = false
      battle.value.skillTargets = []
    } else {
      battle.value.attackMode = false
    }
  }

  function setSkillMode(enabled: boolean) {
    if (enabled && battle.value.selectedUnit && battle.value.selectedUnit.skill.currentCooldown === 0) {
      battle.value.skillMode = true
      battle.value.moveMode = false
      battle.value.attackMode = false
      
      // 军师和建筑师需要用户手动选择目标，所以初始化为空数组
      const isArchitectOrStrategist = 
        battle.value.selectedUnit.classType === 'architect' || 
        battle.value.selectedUnit.classType === 'strategist'
      
      if (!isArchitectOrStrategist) {
        battle.value.skillTargets = getSkillRangePositions(battle.value.selectedUnit, battle.value.units)
      } else {
        battle.value.skillTargets = []
      }
    } else {
      battle.value.skillMode = false
      battle.value.skillTargets = []
    }
  }

  function attackTarget(targetId: string) {
    if (!battle.value.selectedUnit) return

    const attacker = battle.value.selectedUnit
    const target = battle.value.units.find(u => u.id === targetId)

    if (target && attacker.isEnemy !== target.isEnemy) {
      const damage = calculateDamage(attacker, target)
      target.hp = Math.max(0, target.hp - damage)

      attacker.hasAttacked = true
      // 只有同时完成了移动和攻击/防御时，才标记为已行动
      if (attacker.hasMoved) {
        attacker.hasActed = true
      }

      const side = attacker.isEnemy ? '敌方' : (attacker.isHero ? '我方主角' : '我方')
      const targetSide = target.isEnemy ? '敌方' : (target.isHero ? '我方主角' : '我方')
      const classConfig = CLASS_CONFIG[attacker.classType as keyof typeof CLASS_CONFIG]
      const targetClassConfig = CLASS_CONFIG[target.classType as keyof typeof CLASS_CONFIG]
      const attackerName = attacker.isHero ? attacker.name : classConfig.name
      const targetName = target.isHero ? target.name : targetClassConfig.name
      
      let logMessage = `${side}【${attackerName}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`
      
      if (target.hp <= 0) {
        battle.value.units = battle.value.units.filter(u => u.id !== targetId)
        const defeatMessage = `${targetSide}【${targetName}】被击败！`
        logMessage += `，${defeatMessage}`
        showSubtitle(defeatMessage)
      } else {
        showSubtitle(logMessage)
      }
      
      addBattleLog(logMessage)

      checkBattleEnd()
    }

    deselectUnit()
  }

  function attackObstacle(row: number, col: number) {
    if (!battle.value.selectedUnit) return
    const attacker = battle.value.selectedUnit

    const { removed, generateGrass } = removeObstacleWithGrassChance(row, col)
    if (removed) {
      attacker.hasAttacked = true
      // 只有同时完成了移动和攻击/防御时，才标记为已行动
      if (attacker.hasMoved) {
        attacker.hasActed = true
      }
      const side = attacker.isEnemy ? '敌方' : (attacker.isHero ? '我方主角' : '我方')
      const classConfig = CLASS_CONFIG[attacker.classType as keyof typeof CLASS_CONFIG]
      const attackerName = attacker.isHero ? attacker.name : classConfig.name
      
      if (generateGrass) {
        battle.value.healingGrass = [...battle.value.healingGrass, { row, col }]
        showSubtitle(`${side}【${attackerName}】清除了障碍物，获得了草药！`)
        addBattleLog(`${side}【${attackerName}】清除了障碍物，获得了草药！`)
      } else {
        showSubtitle(`${side}【${attackerName}】清除了障碍物`)
        addBattleLog(`${side}【${attackerName}】清除了障碍物`)
      }
    }
    deselectUnit()
  }

  function useSkillTarget(targetPos: { row: number; col: number }) {
    if (!battle.value.selectedUnit) return

    const unit = battle.value.selectedUnit
    
    // 检查是否是建筑师
    if (unit.classType === 'architect') {
      // 建筑师技能：选择或取消选择多个目标
      const existingIndex = battle.value.skillTargets.findIndex(t => t.row === targetPos.row && t.col === targetPos.col)
      
      if (existingIndex !== -1) {
        // 已选择，取消选择
        battle.value.skillTargets = battle.value.skillTargets.filter((_, i) => i !== existingIndex)
      } else if (battle.value.skillTargets.length < 3) {
        // 未选择且未达到3个，添加选择
        battle.value.skillTargets.push(targetPos)
      }
      
      // 建筑师不需要立即执行，需要点击确认按钮
      return
    }
    
    // 检查是否是军师
    if (unit.classType === 'strategist') {
      // 军师技能：选择或取消选择2个目标
      const existingIndex = battle.value.skillTargets.findIndex(t => t.row === targetPos.row && t.col === targetPos.col)
      
      if (existingIndex !== -1) {
        // 已选择，取消选择
        battle.value.skillTargets = battle.value.skillTargets.filter((_, i) => i !== existingIndex)
      } else if (battle.value.skillTargets.length < 2) {
        // 未选择且未达到2个，添加选择
        battle.value.skillTargets.push(targetPos)
      }
      
      // 军师不需要立即执行，需要点击确认按钮
      return
    }

    // 保存技能使用前的治疗草数量，用于判断是否使用了治疗草
    const grassCountBefore = battle.value.healingGrass.length
    const hpBefore = unit.hp
    
    // 其他职业正常使用技能
    const results = useSkill(unit, targetPos, battle.value.units, battle.value.skillTargets)

    let usedGrass = false
    // 处理位置变化标记（刺客瞬移、骑士冲锋）
    if (results.positionChange) {
      unit.hasMoved = true
      
      // 检查新位置是否有治疗草
      const grassIndex = battle.value.healingGrass.findIndex(g => g.row === results.positionChange!.row && g.col === results.positionChange!.col)
      if (grassIndex !== -1) {
        const healAmount = Math.ceil(unit.maxHp * 0.3)
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmount)
        battle.value.healingGrass.splice(grassIndex, 1)
        usedGrass = true
      }
    }

    // 记录被击杀的单位
    const killedUnits: { target: any; targetSide: string; targetName: string }[] = []
    
    results.damage.forEach(d => {
      if (d.killed) {
        const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
        const targetClassConfig = CLASS_CONFIG[d.target.classType as keyof typeof CLASS_CONFIG]
        const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
        killedUnits.push({ target: d.target, targetSide, targetName })
        battle.value.units = battle.value.units.filter(u => u.id !== d.target.id)
      }
    })

    unit.skill.currentCooldown = unit.skill.cooldown
    unit.hasAttacked = true
    // 只有同时完成了移动和攻击/防御时，才标记为已行动
    if (unit.hasMoved) {
      unit.hasActed = true
    }

    const side = unit.isEnemy ? '敌方' : (unit.isHero ? '我方主角' : '我方')
    const classConfig = CLASS_CONFIG[unit.classType as keyof typeof CLASS_CONFIG]
    const attackerName = unit.isHero ? unit.name : classConfig.name
    
    let subtitleText = ''
    let battleLogText = ''
    
    if (results.damage.length > 0) {
      // 有伤害，构建伤害信息
      const damageParts: string[] = []
      results.damage.forEach(d => {
        const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
        const targetClassConfig = CLASS_CONFIG[d.target.classType as keyof typeof CLASS_CONFIG]
        const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
        damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`)
      })
      subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】，${damageParts.join('，')}`
      battleLogText = subtitleText
      
      // 如果有击杀，单独显示击杀字幕
      if (killedUnits.length > 0) {
        killedUnits.forEach(k => {
          const defeatMessage = `${k.targetSide}【${k.targetName}】被击败！`
          battleLogText += `，${defeatMessage}`
        })
        // 只显示最后一个击杀的字幕
        const lastKilled = killedUnits[killedUnits.length - 1]
        const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`
        showSubtitle(defeatMessage)
      } else {
        showSubtitle(subtitleText)
      }
    } else if (results.healing.length > 0) {
      // 有治疗（女巫）
      const heal = results.healing[0]
      const targetSide = heal.target.isEnemy ? '敌方' : (heal.target.isHero ? '我方主角' : '我方')
      const targetClassConfig = CLASS_CONFIG[heal.target.classType as keyof typeof CLASS_CONFIG]
      const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name
      subtitleText = `${side}【${attackerName}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】`
      battleLogText = subtitleText
      showSubtitle(subtitleText)
    } else {
      // 没有伤害也没有治疗（战士回复、刺客移动等）
      subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`
      battleLogText = subtitleText
      showSubtitle(subtitleText)
    }
    
    if (results.removedObstacles.length > 0) {
      const grassPositions: { row: number; col: number }[] = []
      results.removedObstacles.forEach(pos => {
        if (Math.random() < 0.25) {
          grassPositions.push(pos)
          battle.value.healingGrass = [...battle.value.healingGrass, pos]
        }
      })
      
      if (grassPositions.length > 0) {
        subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
        battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
      } else {
        subtitleText += `，清除了${results.removedObstacles.length}个障碍物`
        battleLogText += `，清除了${results.removedObstacles.length}个障碍物`
      }
    }
    
    // 检查是否使用了治疗草
    if (usedGrass) {
      const healAmount = Math.ceil(unit.maxHp * 0.3)
      subtitleText += `，服用了草药，回复${healAmount}点生命值！`
      battleLogText += `，服用了草药，回复${healAmount}点生命值！`
    }
    
    addBattleLog(battleLogText)
    showSubtitle(subtitleText)

    checkBattleEnd()
    deselectUnit()
  }

  function confirmArchitectSkill() {
    if (!battle.value.selectedUnit || battle.value.selectedUnit.classType !== 'architect') return

    const unit = battle.value.selectedUnit
    
    // 执行建筑师技能
    const results = useSkill(unit, null, battle.value.units, battle.value.skillTargets)

    unit.skill.currentCooldown = unit.skill.cooldown
    unit.hasAttacked = true
    // 只有同时完成了移动和攻击/防御时，才标记为已行动
    if (unit.hasMoved) {
      unit.hasActed = true
    }

    const side = unit.isEnemy ? '敌方' : (unit.isHero ? '我方主角' : '我方')
    const classConfig = CLASS_CONFIG[unit.classType as keyof typeof CLASS_CONFIG]
    const attackerName = unit.isHero ? unit.name : classConfig.name
    
    let subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`
    let battleLogText = subtitleText
    
    if (results.addedObstacles.length > 0 || results.removedObstacles.length > 0) {
      const actions: string[] = []
      if (results.addedObstacles.length > 0) {
        actions.push(`生成了${results.addedObstacles.length}个障碍物`)
      }
      if (results.removedObstacles.length > 0) {
        actions.push(`清除了${results.removedObstacles.length}个障碍物`)
      }
      subtitleText += `，${actions.join('，')}`
      battleLogText += `，${actions.join('，')}`
    }
    
    addBattleLog(battleLogText)
    showSubtitle(subtitleText)

    // 清除技能目标
    battle.value.skillTargets = []

    checkBattleEnd()
    deselectUnit()
  }

  function confirmStrategistSkill() {
    if (!battle.value.selectedUnit || battle.value.selectedUnit.classType !== 'strategist') return
    
    const unit = battle.value.selectedUnit
    
    // 必须选择2个目标
    if (battle.value.skillTargets.length !== 2) {
      showSubtitle('请选择2个目标')
      return
    }
    
    // 执行军师技能
    const results = useSkill(unit, null, battle.value.units, battle.value.skillTargets)

    unit.skill.currentCooldown = unit.skill.cooldown
    unit.hasAttacked = true
    // 只有同时完成了移动和攻击/防御时，才标记为已行动
    if (unit.hasMoved) {
      unit.hasActed = true
    }

    const side = unit.isEnemy ? '敌方' : (unit.isHero ? '我方主角' : '我方')
    const classConfig = CLASS_CONFIG[unit.classType as keyof typeof CLASS_CONFIG]
    const attackerName = unit.isHero ? unit.name : classConfig.name
    
    let subtitleText = `${side}【${attackerName}】使用技能【${classConfig.skill.name}】`
    let battleLogText = subtitleText
    
    if (results.swapInfo) {
      subtitleText += `，交换了${results.swapInfo.target1}和${results.swapInfo.target2}的位置`
      battleLogText += `，交换了${results.swapInfo.target1}和${results.swapInfo.target2}的位置`
    } else {
      const pos1 = battle.value.skillTargets[0]
      const pos2 = battle.value.skillTargets[1]
      const pos1Desc = `(${pos1.row + 1},${pos1.col + 1})`
      const pos2Desc = `(${pos2.row + 1},${pos2.col + 1})`
      subtitleText += `，交换了${pos1Desc}和${pos2Desc}的位置`
      battleLogText += `，交换了${pos1Desc}和${pos2Desc}的位置`
    }
    
    addBattleLog(battleLogText)
    showSubtitle(subtitleText)

    // 清除技能目标
    battle.value.skillTargets = []

    checkBattleEnd()
    deselectUnit()
  }

  function defend() {
    if (!battle.value.selectedUnit) return

    const unit = battle.value.selectedUnit
    unit.isDefending = true
    unit.hasAttacked = true
    // 只有同时完成了移动和攻击/防御时，才标记为已行动
    if (unit.hasMoved) {
      unit.hasActed = true
    }

    const side = unit.isEnemy ? '敌方' : (unit.isHero ? '我方主角' : '我方')
    const classConfig = CLASS_CONFIG[unit.classType as keyof typeof CLASS_CONFIG]
    const attackerName = unit.isHero ? unit.name : classConfig.name
    const isSkill = unit.classType === 'warrior'
    const actionName = isSkill ? '【' + classConfig.skill.name + '】' : '【原地防御】'
    const logMessage = `${side}【${attackerName}】使用技能${actionName}`
    showSubtitle(logMessage)
    addBattleLog(logMessage)

    deselectUnit()
  }

  function markUnitActed(unitId: string) {
    const unit = battle.value.units.find(u => u.id === unitId)
    if (unit) {
      unit.hasActed = true
      unit.hasMoved = true
      unit.hasAttacked = true
    }
  }

  async function endPlayerTurn() {
    console.log('endPlayerTurn called, currentTurn:', battle.value.currentTurn)
    if (battle.value.currentTurn !== 'player') {
      console.log('Not player turn, returning')
      return
    }
    
    battle.value.selectedUnit = null
    battle.value.moveMode = false
    battle.value.attackMode = false
    battle.value.skillMode = false
    battle.value.skillTargets = []

    battle.value.units.forEach(u => {
      u.isDefending = false
    })

    const allyAIUnits = battle.value.units.filter(u => !u.isEnemy && u.isAI && !u.hasActed && u.hp > 0)
    console.log('Ally AI units to act:', allyAIUnits.length)
    
    const speed = battle.value.speed
    
    for (const allyAI of allyAIUnits) {
      console.log('Executing AI action for:', allyAI.name)
      await new Promise(resolve => setTimeout(resolve, 660 / speed))
      executeAllyAIAction(allyAI)
      // 确保响应式更新
      const unitIndex = battle.value.units.findIndex(u => u.id === allyAI.id)
      if (unitIndex !== -1) {
        battle.value.units[unitIndex] = { ...battle.value.units[unitIndex] }
      }
    }

    battle.value.currentTurn = 'enemy'
    console.log('Turn changed to enemy, executing enemy turn')
    await executeEnemyTurn()
  }

  function executeAllyAIAction(allyAI: Unit) {
    const enemyUnits = battle.value.units.filter(u => u.isEnemy && u.hp > 0)
    if (enemyUnits.length === 0) return

    // 检查是否在雪地或雷区中
    const isInSnow = isInSnowArea(allyAI.position.row, allyAI.position.col)
    const isInThunder = isInThunderArea(allyAI.position.row, allyAI.position.col)

    // 如果是战士
    if (allyAI.classType === 'warrior') {
      // 1. 首先检查是否需要移动躲避危险（雪地或雷区）
      let movedToSafety = false
      if ((isInSnow || isInThunder) && !isInSnow) { // 雪地中不能移动
        const movePositions = getAvailablePositions(battle.value.units, allyAI, allyAI.moveRange, battle.value.thunderAreas)
        // 寻找安全的位置（不在雷区和雪地中）
        let safePosition: { row: number, col: number } | null = null
        for (const pos of movePositions) {
          const posIsThunder = battle.value.thunderAreas.some(t => t.row === pos.row && t.col === pos.col)
          const posIsSnow = isInSnowArea(pos.row, pos.col)
          if (!posIsThunder && !posIsSnow) {
            safePosition = pos
            break
          }
        }
        if (safePosition) {
          const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === safePosition.row && u.position.col === safePosition.col)
          if (!occupied) {
            allyAI.position = { row: safePosition.row, col: safePosition.col }
            const grassIndex = battle.value.healingGrass.findIndex(g => g.row === safePosition.row && g.col === safePosition.col)
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(allyAI.maxHp * 0.3)
              allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
              battle.value.healingGrass.splice(grassIndex, 1)
              showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
              addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
            }
            movedToSafety = true
          }
        }
      }

      // 2. 检查血量是否低于80%且技能可用，使用技能
      const hpPercent = allyAI.hp / allyAI.maxHp
      if (hpPercent < 0.8 && allyAI.skill.currentCooldown === 0 && !isInSnow) {
        const results = useSkill(allyAI, null, battle.value.units, [])
        allyAI.skill.currentCooldown = allyAI.skill.cooldown
        allyAI.hasActed = true
        const logMsg = `我方【${allyAI.name}】使用技能【${allyAI.skill.name}】`
        showSubtitle(logMsg)
        addBattleLog(logMsg)
        return
      }

      // 3. 尝试移动并攻击
      const attackResult = evaluateMoveAttackDamage(allyAI, battle.value.units, battle.value.thunderAreas)
      if (attackResult && !isInSnow) {
        const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol)
        if (!occupied) {
          allyAI.position = { row: attackResult.moveRow, col: attackResult.moveCol }
          const grassIndex = battle.value.healingGrass.findIndex(g => g.row === attackResult.moveRow && g.col === attackResult.moveCol)
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(allyAI.maxHp * 0.3)
            allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
            battle.value.healingGrass.splice(grassIndex, 1)
            showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
            addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
          }
        }

        const target = battle.value.units.find(u => u.id === attackResult.targetId)
        if (target) {
          const damage = calculateDamage(allyAI, target)
          target.hp = Math.max(0, target.hp - damage)
          if (target.hp <= 0) {
            battle.value.units = battle.value.units.filter(u => u.id !== target.id)
          }
          const classConfig = CLASS_CONFIG[allyAI.classType as keyof typeof CLASS_CONFIG]
          const attackLogMsg = `我方【${allyAI.name}】对敌方【${classConfig.name}】使用【普通攻击】，造成 ${damage} 点伤害`
          showSubtitle(attackLogMsg)
          addBattleLog(attackLogMsg)
        }

        allyAI.hasActed = true
        return
      }

      // 4. 没有攻击目标，移动并防御（优先去安全位置）
      const closestResult = findClosestEnemyPosition(allyAI, battle.value.units, battle.value.thunderAreas)
      if (closestResult && !isInSnow) {
        const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === closestResult.row && u.position.col === closestResult.col)
        if (!occupied) {
          allyAI.position = { row: closestResult.row, col: closestResult.col }
          const grassIndex = battle.value.healingGrass.findIndex(g => g.row === closestResult.row && g.col === closestResult.col)
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(allyAI.maxHp * 0.3)
            allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
            battle.value.healingGrass.splice(grassIndex, 1)
            showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
            addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
          }
        }
      }

      allyAI.isDefending = true
      allyAI.hasActed = true
      const defendLogMsg = `我方【${allyAI.name}】使用【原地防御】`
      showSubtitle(defendLogMsg)
      addBattleLog(defendLogMsg)
      return
    }

    // 其他职业正常逻辑
    const skillResult = evaluateMoveSkillDamage(allyAI, battle.value.units, battle.value.thunderAreas)
    if (skillResult && !isInSnow) {
      // 对于刺客和骑士，使用 useSkill 函数处理（因为有位置变化）
      if (allyAI.classType === 'assassin' || allyAI.classType === 'knight') {
        // 先移动到 moveRow/moveCol（如果需要）
        if (skillResult.moveRow !== allyAI.position.row || skillResult.moveCol !== allyAI.position.col) {
          const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol)
          if (!occupied) {
            allyAI.position = { row: skillResult.moveRow, col: skillResult.moveCol }
            const grassIndex = battle.value.healingGrass.findIndex(g => g.row === skillResult.moveRow && g.col === skillResult.moveCol)
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(allyAI.maxHp * 0.3)
              allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
              battle.value.healingGrass.splice(grassIndex, 1)
              showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
              addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
            }
          }
        }

        // 使用 useSkill 函数处理技能
        const results = useSkill(allyAI, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, [])
        
        // 如果有位置变化，确保在响应式数组中更新
        if (results.positionChange) {
          const unitIndex = battle.value.units.findIndex(u => u.id === allyAI.id)
          if (unitIndex !== -1) {
            battle.value.units[unitIndex] = { ...allyAI }
          }
        }
        
        // 记录被击杀的单位
        const killedUnits: { target: any; targetSide: string; targetName: string }[] = []
        
        // 处理击杀
        results.damage.forEach(d => {
          if (d.killed) {
            const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
            const targetClassConfig = CLASS_CONFIG[d.target.classType as keyof typeof CLASS_CONFIG]
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
            killedUnits.push({ target: d.target, targetSide, targetName })
            battle.value.units = battle.value.units.filter(u => u.id !== d.target.id)
          }
        })
        
        allyAI.skill.currentCooldown = allyAI.skill.cooldown
        allyAI.hasActed = true
        
        // 构建日志
        const side = '我方'
        const classConfig = CLASS_CONFIG[allyAI.classType as keyof typeof CLASS_CONFIG]
        let subtitleText = ''
        let battleLogText = ''
        
        if (results.damage.length > 0) {
          const damageParts: string[] = []
          results.damage.forEach(d => {
            const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
            const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
            damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`)
          })
          subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】，${damageParts.join('，')}`
          battleLogText = subtitleText
          
          // 如果有击杀，单独显示击杀字幕
          if (killedUnits.length > 0) {
            killedUnits.forEach(k => {
              const defeatMessage = `${k.targetSide}【${k.targetName}】被击败！`
              battleLogText += `，${defeatMessage}`
            })
            // 只显示最后一个击杀的字幕
            const lastKilled = killedUnits[killedUnits.length - 1]
            const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`
            showSubtitle(defeatMessage)
          } else {
            showSubtitle(subtitleText)
          }
        } else if (results.healing.length > 0) {
          // 处理治疗技能（巫师）
          const heal = results.healing[0]
          const targetSide = heal.target.isEnemy ? '敌方' : (heal.target.isHero ? '我方主角' : '我方')
          const targetClassConfig = CLASS_CONFIG[heal.target.classType as any]
          const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name
          subtitleText = `${side}【${allyAI.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`
          battleLogText = subtitleText
          showSubtitle(subtitleText)
        } else {
          subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】`
          battleLogText = subtitleText
          showSubtitle(subtitleText)
        }
        
        // 处理清除障碍物和草药
        if (results.removedObstacles.length > 0) {
          const grassPositions: { row: number; col: number }[] = []
          results.removedObstacles.forEach(pos => {
            if (Math.random() < 0.3) {
              grassPositions.push(pos)
              battle.value.healingGrass = [...battle.value.healingGrass, pos]
            }
          })
          
          if (grassPositions.length > 0) {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
          } else {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物`
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物`
          }
        }
        
        addBattleLog(battleLogText)
        checkBattleEnd()
        return
      }

      // 对于其他职业，继续原有的逻辑
      const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol)
      if (!occupied) {
        allyAI.position = { row: skillResult.moveRow, col: skillResult.moveCol }
        const grassIndex = battle.value.healingGrass.findIndex(g => g.row === skillResult.moveRow && g.col === skillResult.moveCol)
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(allyAI.maxHp * 0.3)
          allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
          battle.value.healingGrass.splice(grassIndex, 1)
          showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
          addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
        }
      }

      // 使用 useSkill 函数处理技能
      const results = useSkill(allyAI, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, [])
      
      // 如果有位置变化，确保在响应式数组中更新
      if (results.positionChange) {
        const unitIndex = battle.value.units.findIndex(u => u.id === allyAI.id)
        if (unitIndex !== -1) {
          battle.value.units[unitIndex] = { ...allyAI }
        }
      }
      
      // 记录被击杀的单位
      const killedUnits: { target: any; targetSide: string; targetName: string }[] = []
      
      // 处理击杀
      results.damage.forEach(d => {
        if (d.killed) {
          const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
          const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
          const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
          killedUnits.push({ target: d.target, targetSide, targetName })
          battle.value.units = battle.value.units.filter(u => u.id !== d.target.id)
        }
      })
      
      allyAI.skill.currentCooldown = allyAI.skill.cooldown
      allyAI.hasActed = true
      
      // 构建日志
      const side = '我方'
      const classConfig = CLASS_CONFIG[allyAI.classType as any]
      let subtitleText = ''
      let battleLogText = ''
      
      if (results.damage.length > 0) {
        const damageParts: string[] = []
        results.damage.forEach(d => {
          const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
          const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
          const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
          damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`)
        })
        subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】，${damageParts.join('，')}`
        battleLogText = subtitleText
        
        // 如果有击杀，单独显示击杀字幕
        if (killedUnits.length > 0) {
          killedUnits.forEach(k => {
            const defeatMessage = `${k.targetSide}【${k.targetName}】被击败！`
            battleLogText += `，${defeatMessage}`
          })
          // 只显示最后一个击杀的字幕
          const lastKilled = killedUnits[killedUnits.length - 1]
          const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`
          showSubtitle(defeatMessage)
        } else {
          showSubtitle(subtitleText)
        }
      } else if (results.healing.length > 0) {
        // 处理治疗技能（巫师）
        const heal = results.healing[0]
        const targetSide = heal.target.isEnemy ? '敌方' : (heal.target.isHero ? '我方主角' : '我方')
        const targetClassConfig = CLASS_CONFIG[heal.target.classType as any]
        const targetName = heal.target.isHero ? heal.target.name : targetClassConfig.name
        subtitleText = `${side}【${allyAI.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`
        battleLogText = subtitleText
        showSubtitle(subtitleText)
      } else {
        subtitleText = `${side}【${allyAI.name}】使用技能【${classConfig.skill.name}】`
        battleLogText = subtitleText
        showSubtitle(subtitleText)
      }
      
      // 处理清除障碍物和草药
      if (results.removedObstacles.length > 0) {
        const grassPositions: { row: number; col: number }[] = []
        results.removedObstacles.forEach(pos => {
          if (Math.random() < 0.3) {
            grassPositions.push(pos)
            battle.value.healingGrass = [...battle.value.healingGrass, pos]
          }
        })
        
        if (grassPositions.length > 0) {
          subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
          battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
        } else {
          subtitleText += `，清除了${results.removedObstacles.length}个障碍物`
          battleLogText += `，清除了${results.removedObstacles.length}个障碍物`
        }
      }
      
      addBattleLog(battleLogText)
      checkBattleEnd()
      return
    }

    const attackResult = evaluateMoveAttackDamage(allyAI, battle.value.units, battle.value.thunderAreas)
    if (attackResult && !isInSnow) {
      // 检查目标位置是否被占据
      const occupied = battle.value.units.some(u => u.id !== allyAI.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol)
      if (!occupied) {
        allyAI.position = { row: attackResult.moveRow, col: attackResult.moveCol }
        const grassIndex = battle.value.healingGrass.findIndex(g => g.row === attackResult.moveRow && g.col === attackResult.moveCol)
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(allyAI.maxHp * 0.3)
          allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
          battle.value.healingGrass.splice(grassIndex, 1)
          showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
          addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
        }
      }

      const target = battle.value.units.find(u => u.id === attackResult.targetId)
      if (target) {
        const damage = calculateDamage(allyAI, target)
        target.hp = Math.max(0, target.hp - damage)
        const classConfig = CLASS_CONFIG[allyAI.classType as keyof typeof CLASS_CONFIG]
        const targetClassConfig = CLASS_CONFIG[target.classType as keyof typeof CLASS_CONFIG]
        const targetName = targetClassConfig.name
        
        let attackLogMsg = `我方【${allyAI.name}】对敌方【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`
        
        if (target.hp <= 0) {
          battle.value.units = battle.value.units.filter(u => u.id !== target.id)
          const defeatMessage = `敌方【${targetName}】被击败！`
          attackLogMsg += `，${defeatMessage}`
          showSubtitle(defeatMessage)
        } else {
          showSubtitle(attackLogMsg)
        }
        
        addBattleLog(attackLogMsg)
      }

      allyAI.hasActed = true
      return
    }

    const closestResult = findClosestEnemyPosition(allyAI, battle.value.units, battle.value.thunderAreas)
    if (closestResult && !isInSnow) {
      allyAI.position = { row: closestResult.row, col: closestResult.col }
      const grassIndex = battle.value.healingGrass.findIndex(g => g.row === closestResult.row && g.col === closestResult.col)
      if (grassIndex !== -1) {
        const healAmount = Math.ceil(allyAI.maxHp * 0.3)
        allyAI.hp = Math.min(allyAI.maxHp, allyAI.hp + healAmount)
        battle.value.healingGrass.splice(grassIndex, 1)
        showSubtitle(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
        addBattleLog(`我方【${allyAI.name}】服用了草药，回复${healAmount}点生命值！`)
      }
    }

    allyAI.isDefending = true
    allyAI.hasActed = true
    const defendLogMsg = `我方【${allyAI.name}】使用【原地防御】`
    showSubtitle(defendLogMsg)
    addBattleLog(defendLogMsg)
  }

  async function executeEnemyTurn() {
    console.log('executeEnemyTurn called')
    const enemyUnits = battle.value.units.filter(u => u.isEnemy && !u.hasActed && u.hp > 0)
    console.log('Enemy units to act:', enemyUnits.length)
    
    const playerUnits = battle.value.units.filter(u => !u.isEnemy && u.hp > 0)
    console.log('Player units alive:', playerUnits.length)

    const speed = battle.value.speed

    for (const enemy of enemyUnits) {
      if (playerUnits.length === 0) break

      await new Promise(resolve => setTimeout(resolve, 660 / speed))

      const alivePlayerUnits = battle.value.units.filter(u => !u.isEnemy && u.hp > 0)
      if (alivePlayerUnits.length === 0) break

      // 检查是否在雪地中
      const isInSnow = isInSnowArea(enemy.position.row, enemy.position.col)

      // 如果是战士，优先尝试攻击
      if (enemy.classType === 'warrior') {
        const attackResult = evaluateMoveAttackDamage(enemy, battle.value.units, battle.value.thunderAreas)
        if (attackResult && !isInSnow) {
          // 检查目标位置是否被占据
          const occupied = battle.value.units.some(u => u.id !== enemy.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol)
          if (!occupied) {
            enemy.position = { row: attackResult.moveRow, col: attackResult.moveCol }
            const grassIndex = battle.value.healingGrass.findIndex(g => g.row === attackResult.moveRow && g.col === attackResult.moveCol)
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(enemy.maxHp * 0.3)
              enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
              battle.value.healingGrass.splice(grassIndex, 1)
              showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
              addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
            }
          }
          await new Promise(resolve => setTimeout(resolve, 300 / speed))

          const target = battle.value.units.find(u => u.id === attackResult.targetId)
          if (target) {
            const damage = calculateDamage(enemy, target)
            target.hp = Math.max(0, target.hp - damage)
            if (target.hp <= 0) {
              battle.value.units = battle.value.units.filter(u => u.id !== target.id)
            }
            const targetSide = target.isHero ? '我方主角' : '我方'
            const targetClassConfig = CLASS_CONFIG[target.classType as keyof typeof CLASS_CONFIG]
            const targetName = target.isHero ? target.name : targetClassConfig.name
            const enemyAttackLog = `敌方【${enemy.name}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`
            showSubtitle(enemyAttackLog)
            addBattleLog(enemyAttackLog)
          }

          enemy.hasActed = true
          continue
        }

        // 攻击不到，检查生命值是否满
        if (enemy.hp < enemy.maxHp && enemy.skill.currentCooldown === 0 && !isInSnow) {
          // 生命值不满，使用技能回复
          const healAmount = Math.ceil(enemy.maxHp * 0.15)
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
          enemy.defense += 3
          enemy.defenseBuffDuration = 2
          enemy.skill.currentCooldown = enemy.skill.cooldown
          enemy.hasActed = true
          const logMsg1 = `敌方【${enemy.name}】使用技能【${enemy.skill.name}】`
          showSubtitle(logMsg1)
          addBattleLog(logMsg1)
          continue
        }

        // 生命值满或技能CD，移动并防御
        const closestResult = findClosestEnemyPosition(enemy, battle.value.units, battle.value.thunderAreas)
        if (closestResult && !isInSnow) {
          // 检查目标位置是否被占据
          const occupied = battle.value.units.some(u => u.id !== enemy.id && u.position.row === closestResult.row && u.position.col === closestResult.col)
          if (!occupied) {
            enemy.position = { row: closestResult.row, col: closestResult.col }
            const grassIndex = battle.value.healingGrass.findIndex(g => g.row === closestResult.row && g.col === closestResult.col)
            if (grassIndex !== -1) {
              const healAmount = Math.ceil(enemy.maxHp * 0.3)
              enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
              battle.value.healingGrass.splice(grassIndex, 1)
              showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
              addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
            }
            await new Promise(resolve => setTimeout(resolve, 300 / speed))
          }
        }

        enemy.isDefending = true
        enemy.hasActed = true
        const enemyDefendLog = `敌方【${enemy.name}】使用【原地防御】`
        showSubtitle(enemyDefendLog)
        addBattleLog(enemyDefendLog)
        continue
      }

      // 其他职业正常逻辑
      const skillResult = evaluateMoveSkillDamage(enemy, battle.value.units, battle.value.thunderAreas)
      if (skillResult && !isInSnow) {
        // 对于刺客和骑士，使用 useSkill 函数处理（因为有位置变化）
        if (enemy.classType === 'assassin' || enemy.classType === 'knight') {
          // 先移动到 moveRow/moveCol（如果需要）
          if (skillResult.moveRow !== enemy.position.row || skillResult.moveCol !== enemy.position.col) {
            const occupied = battle.value.units.some(u => u.id !== enemy.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol)
            if (!occupied) {
              enemy.position = { row: skillResult.moveRow, col: skillResult.moveCol }
              const grassIndex = battle.value.healingGrass.findIndex(g => g.row === skillResult.moveRow && g.col === skillResult.moveCol)
              if (grassIndex !== -1) {
                const healAmount = Math.ceil(enemy.maxHp * 0.3)
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
                battle.value.healingGrass.splice(grassIndex, 1)
                showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
                addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
              }
              await new Promise(resolve => setTimeout(resolve, 300 / speed))
            }
          }

          // 使用 useSkill 函数处理技能
          const results = useSkill(enemy, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, [])
          
          // 如果有位置变化，确保在响应式数组中更新
          if (results.positionChange) {
            const unitIndex = battle.value.units.findIndex(u => u.id === enemy.id)
            if (unitIndex !== -1) {
              battle.value.units[unitIndex] = { ...enemy }
            }
          }
          
          // 记录被击杀的单位
          const killedUnits: { target: any; targetSide: string; targetName: string }[] = []
          
          // 处理击杀
          results.damage.forEach(d => {
            if (d.killed) {
              const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
              const targetClassConfig = CLASS_CONFIG[d.target.classType as keyof typeof CLASS_CONFIG]
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
              killedUnits.push({ target: d.target, targetSide, targetName })
              battle.value.units = battle.value.units.filter(u => u.id !== d.target.id)
            }
          })
          
          enemy.skill.currentCooldown = enemy.skill.cooldown
          enemy.hasActed = true
          
          // 构建日志
          const side = '敌方'
          const classConfig = CLASS_CONFIG[enemy.classType as keyof typeof CLASS_CONFIG]
          let subtitleText = ''
          let battleLogText = ''
          
          if (results.damage.length > 0) {
            const damageParts: string[] = []
            results.damage.forEach(d => {
              const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
              const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
              const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
              damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`)
            })
            subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】，${damageParts.join('，')}`
            battleLogText = subtitleText
            
            // 如果有击杀，单独显示击杀字幕
            if (killedUnits.length > 0) {
              killedUnits.forEach(k => {
                const defeatMessage = `${k.targetSide}【${k.targetName}】被击败！`
                battleLogText += `，${defeatMessage}`
              })
              // 只显示最后一个击杀的字幕
              const lastKilled = killedUnits[killedUnits.length - 1]
              const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`
              showSubtitle(defeatMessage)
            } else {
              showSubtitle(subtitleText)
            }
          } else if (results.healing.length > 0) {
            // 处理治疗技能（巫师）
            const heal = results.healing[0]
            const targetSide = heal.target.isEnemy ? '敌方' : '我方'
            const targetClassConfig = CLASS_CONFIG[heal.target.classType as any]
            const targetName = targetClassConfig.name
            subtitleText = `${side}【${enemy.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`
            battleLogText = subtitleText
            showSubtitle(subtitleText)
          } else {
            subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】`
            battleLogText = subtitleText
            showSubtitle(subtitleText)
          }
          
          // 处理清除障碍物和草药
          if (results.removedObstacles.length > 0) {
            const grassPositions: { row: number; col: number }[] = []
            results.removedObstacles.forEach(pos => {
              if (Math.random() < 0.3) {
                grassPositions.push(pos)
                battle.value.healingGrass = [...battle.value.healingGrass, pos]
              }
            })
            
            if (grassPositions.length > 0) {
              subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
              battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
            } else {
              subtitleText += `，清除了${results.removedObstacles.length}个障碍物`
              battleLogText += `，清除了${results.removedObstacles.length}个障碍物`
            }
          }
          
          addBattleLog(battleLogText)
          checkBattleEnd()
          continue
        }

        // 对于其他职业，继续原有的逻辑
        const occupied = battle.value.units.some(u => u.id !== enemy.id && u.position.row === skillResult.moveRow && u.position.col === skillResult.moveCol)
        if (!occupied) {
          enemy.position = { row: skillResult.moveRow, col: skillResult.moveCol }
          const grassIndex = battle.value.healingGrass.findIndex(g => g.row === skillResult.moveRow && g.col === skillResult.moveCol)
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(enemy.maxHp * 0.3)
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
            battle.value.healingGrass.splice(grassIndex, 1)
            showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
            addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
          }
        }

        // 使用 useSkill 函数处理技能
        const results = useSkill(enemy, { row: skillResult.targetRow, col: skillResult.targetCol }, battle.value.units, [])
        
        // 如果有位置变化，确保在响应式数组中更新
        if (results.positionChange) {
          const unitIndex = battle.value.units.findIndex(u => u.id === enemy.id)
          if (unitIndex !== -1) {
            battle.value.units[unitIndex] = { ...enemy }
          }
        }
        
        // 记录被击杀的单位
        const killedUnits: { target: any; targetSide: string; targetName: string }[] = []
        
        // 处理击杀
        results.damage.forEach(d => {
          if (d.killed) {
            const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
            const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
            killedUnits.push({ target: d.target, targetSide, targetName })
            battle.value.units = battle.value.units.filter(u => u.id !== d.target.id)
          }
        })
        
        enemy.skill.currentCooldown = enemy.skill.cooldown
        enemy.hasActed = true
        
        // 构建日志
        const side = '敌方'
        const classConfig = CLASS_CONFIG[enemy.classType as any]
        let subtitleText = ''
        let battleLogText = ''
        
        if (results.damage.length > 0) {
          const damageParts: string[] = []
          results.damage.forEach(d => {
            const targetSide = d.target.isEnemy ? '敌方' : (d.target.isHero ? '我方主角' : '我方')
            const targetClassConfig = CLASS_CONFIG[d.target.classType as any]
            const targetName = d.target.isHero ? d.target.name : targetClassConfig.name
            damageParts.push(`对${targetSide}【${targetName}】造成 ${d.damage} 点伤害`)
          })
          subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】，${damageParts.join('，')}`
          battleLogText = subtitleText
          
          // 如果有击杀，单独显示击杀字幕
          if (killedUnits.length > 0) {
            killedUnits.forEach(k => {
              const defeatMessage = `${k.targetSide}【${k.targetName}】被击败！`
              battleLogText += `，${defeatMessage}`
            })
            // 只显示最后一个击杀的字幕
            const lastKilled = killedUnits[killedUnits.length - 1]
            const defeatMessage = `${lastKilled.targetSide}【${lastKilled.targetName}】被击败！`
            showSubtitle(defeatMessage)
          } else {
            showSubtitle(subtitleText)
          }
        } else if (results.healing.length > 0) {
          // 处理治疗技能（巫师）
          const heal = results.healing[0]
          const targetSide = heal.target.isEnemy ? '敌方' : '我方'
          const targetClassConfig = CLASS_CONFIG[heal.target.classType as any]
          const targetName = targetClassConfig.name
          subtitleText = `${side}【${enemy.name}】对${targetSide}【${targetName}】使用技能【${classConfig.skill.name}】，回复 ${heal.amount} 点生命值`
          battleLogText = subtitleText
          showSubtitle(subtitleText)
        } else {
          subtitleText = `${side}【${enemy.name}】使用技能【${classConfig.skill.name}】`
          battleLogText = subtitleText
          showSubtitle(subtitleText)
        }
        
        // 处理清除障碍物和草药
        if (results.removedObstacles.length > 0) {
          const grassPositions: { row: number; col: number }[] = []
          results.removedObstacles.forEach(pos => {
            if (Math.random() < 0.3) {
              grassPositions.push(pos)
              battle.value.healingGrass = [...battle.value.healingGrass, pos]
            }
          })
          
          if (grassPositions.length > 0) {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物，获得了${grassPositions.length}个草药！`
          } else {
            subtitleText += `，清除了${results.removedObstacles.length}个障碍物`
            battleLogText += `，清除了${results.removedObstacles.length}个障碍物`
          }
        }
        
        addBattleLog(battleLogText)
        checkBattleEnd()
        continue
      }

      const attackResult = evaluateMoveAttackDamage(enemy, battle.value.units, battle.value.thunderAreas)
      if (attackResult && !isInSnow) {
        // 检查目标位置是否被占据
        const occupied = battle.value.units.some(u => u.id !== enemy.id && u.position.row === attackResult.moveRow && u.position.col === attackResult.moveCol)
        if (!occupied) {
          enemy.position = { row: attackResult.moveRow, col: attackResult.moveCol }
          const grassIndex = battle.value.healingGrass.findIndex(g => g.row === attackResult.moveRow && g.col === attackResult.moveCol)
          if (grassIndex !== -1) {
            const healAmount = Math.ceil(enemy.maxHp * 0.3)
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
            battle.value.healingGrass.splice(grassIndex, 1)
            showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
            addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
          }
          await new Promise(resolve => setTimeout(resolve, 300 / speed))
        }

        const target = battle.value.units.find(u => u.id === attackResult.targetId)
        if (target) {
          const damage = calculateDamage(enemy, target)
          target.hp = Math.max(0, target.hp - damage)
          const targetSide = target.isHero ? '我方主角' : '我方'
          const targetClassConfig = CLASS_CONFIG[target.classType as keyof typeof CLASS_CONFIG]
          const targetName = target.isHero ? target.name : targetClassConfig.name
          
          let enemyAttackLog = `敌方【${enemy.name}】对${targetSide}【${targetName}】使用【普通攻击】，造成 ${damage} 点伤害`
          
          if (target.hp <= 0) {
            battle.value.units = battle.value.units.filter(u => u.id !== target.id)
            const defeatMessage = `${targetSide}【${targetName}】被击败！`
            enemyAttackLog += `，${defeatMessage}`
            showSubtitle(defeatMessage)
          } else {
            showSubtitle(enemyAttackLog)
          }
          
          addBattleLog(enemyAttackLog)
        }

        enemy.hasActed = true
        continue
      }

      const closestResult = findClosestEnemyPosition(enemy, battle.value.units, battle.value.thunderAreas)
      if (closestResult && !isInSnow) {
        enemy.position = { row: closestResult.row, col: closestResult.col }
        const grassIndex = battle.value.healingGrass.findIndex(g => g.row === closestResult.row && g.col === closestResult.col)
        if (grassIndex !== -1) {
          const healAmount = Math.ceil(enemy.maxHp * 0.3)
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount)
          battle.value.healingGrass.splice(grassIndex, 1)
          showSubtitle(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
          addBattleLog(`敌方【${enemy.name}】服用了草药，回复${healAmount}点生命值！`)
        }
        await new Promise(resolve => setTimeout(resolve, 300 / speed))
      }

      enemy.isDefending = true
      enemy.hasActed = true
      const enemyDefendLog = `敌方【${enemy.name}】使用【原地防御】`
      showSubtitle(enemyDefendLog)
      addBattleLog(enemyDefendLog)
      // 确保响应式更新
      const unitIndex = battle.value.units.findIndex(u => u.id === enemy.id)
      if (unitIndex !== -1) {
        battle.value.units[unitIndex] = { ...battle.value.units[unitIndex] }
      }
      showSubtitle(`敌方【${enemy.name}】使用【原地防御】`)
    }

    await new Promise(resolve => setTimeout(resolve, 500 / speed))
    endEnemyTurn()
  }

  function endEnemyTurn() {
    // 先应用雷电伤害
    applyThunderDamage()
    
    battle.value.turnNumber++
    battle.value.currentTurn = 'player'
    
    // 更新天气
    updateWeather()

    battle.value.units.forEach(u => {
      u.hasActed = false
      u.hasMoved = false
      u.hasAttacked = false
      u.isDefending = false
      if (u.skill.currentCooldown > 0) {
        u.skill.currentCooldown--
      }
    })

    // 禁用自动加入AI
    // if (battle.value.summonCount < battle.value.maxSummons) {
    //   const shouldJoin = Math.random() < 0.3
    //   if (shouldJoin) {
    //     const classes = ['warrior', 'knight', 'archer', 'mage', 'witch', 'assassin']
    //     const randomClass = classes[Math.floor(Math.random() * classes.length)]
    //     battle.value.aiJoinPending = true
    //     battle.value.pendingAiSide = Math.random() < 0.5 ? 'ally' : 'enemy'
    //     battle.value.pendingAiClass = randomClass
    //   }
    // }

    const playerUnits = battle.value.units.filter(u => !u.isEnemy)
    battle.value.totalPlayerUnits = playerUnits.length
    battle.value.playerUnitsActed = 0

    checkBattleEnd()
  }

  function addAiUnit() {
    if (!battle.value.pendingAiSide || !battle.value.pendingAiClass) return

    const emptyPositions: { row: number; col: number }[] = []
    const isAlly = battle.value.pendingAiSide === 'ally'
    const startRow = isAlly ? MAP_ROWS - 2 : 0
    const endRow = isAlly ? MAP_ROWS - 1 : 1

    for (let r = startRow; r <= endRow; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (!isObstacle(r, c)) {
          const occupied = battle.value.units.some(u => u.position.row === r && u.position.col === c)
          if (!occupied) {
            emptyPositions.push({ row: r, col: c })
          }
        }
      }
    }

    if (emptyPositions.length > 0) {
      const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]

      if (battle.value.pendingAiSide === 'ally') {
        const aiUnit = createAllyAI(battle.value.pendingAiClass, pos)
        battle.value.units.push(aiUnit)
        showAiJoinMessage.value = true
        aiJoinMessage.value = `己方AI（${CLASS_CONFIG[battle.value.pendingAiClass as keyof typeof CLASS_CONFIG].name}）加入战斗`
      } else {
        const aiUnit = createEnemyUnit(battle.value.pendingAiClass, pos)
        battle.value.units.push(aiUnit)
        showAiJoinMessage.value = true
        aiJoinMessage.value = `敌方AI（${CLASS_CONFIG[battle.value.pendingAiClass as keyof typeof CLASS_CONFIG].name}）加入战斗`
      }

      battle.value.summonCount++

      setTimeout(() => {
        showAiJoinMessage.value = false
      }, 3000)
    }

    battle.value.aiJoinPending = false
    battle.value.pendingAiSide = null
    battle.value.pendingAiClass = null
  }

  function checkBattleEnd() {
    const alivePlayer = battle.value.units.filter(u => !u.isEnemy && u.hp > 0)
    const aliveEnemy = battle.value.units.filter(u => u.isEnemy && u.hp > 0)

    if (aliveEnemy.length === 0) {
      const initialEnemyCount = settings.value.enemyCount
      const summonedCount = battle.value.summonCount
      const totalEnemiesSpawned = initialEnemyCount + summonedCount
      const killedEnemies = totalEnemiesSpawned - aliveEnemy.length
      const exp = 20 + killedEnemies * 10
      const gold = 50 + killedEnemies * 5
      addGold(gold)
      awardExpToHeroes(exp)
      battle.value.gameResult = 'victory'
      showSubtitle('战斗胜利！获得金币：' + gold + '，所有存活我方角色获得经验值：' + exp)
      return 'victory'
    }

    if (alivePlayer.length === 0) {
      // 战败时所有参战角色获得20经验与20金币
      addGold(20)
      awardExpToHeroes(20)
      battle.value.gameResult = 'defeat'
      showSubtitle('战斗失败...参战角色获得经验值：20，获得金币：20')
      return 'defeat'
    }

    return null
  }

  function setSpeed(speed: 1 | 2 | 3) {
    battle.value.speed = speed
  }

  function clearBattle() {
    battle.value.units = []
    battle.value.selectedUnit = null
    battle.value.currentTurn = 'player'
    battle.value.turnNumber = 1
    battle.value.gameResult = null
    battle.value.summonCount = 0
    battle.value.weather = 'normal'
    battle.value.snowAreas = []
    battle.value.thunderAreas = []
  }

  function generateSnowAreas(areaCount: number): { row: number; col: number }[] {
    const snowAreas: { row: number; col: number }[] = []
    const usedCenters: { row: number; col: number }[] = []
    
    for (let i = 0; i < areaCount; i++) {
      let centerRow: number
      let centerCol: number
      let attempts = 0
      
      // 找到一个不会与已有雪地区域重叠且不被障碍物占据的中心
      do {
        centerRow = 1 + Math.floor(Math.random() * (MAP_ROWS - 2))
        centerCol = 1 + Math.floor(Math.random() * (MAP_COLS - 2))
        attempts++
      } while (
        attempts < 50 && 
        (isObstacle(centerRow, centerCol) || 
         usedCenters.some(c => Math.abs(c.row - centerRow) < 3 && Math.abs(c.col - centerCol) < 3))
      )
      
      if (attempts < 50) {
        usedCenters.push({ row: centerRow, col: centerCol })
        
        // 生成3×3的雪地区域
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const r = centerRow + dr
            const c = centerCol + dc
            if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS && !isObstacle(r, c)) {
              if (!snowAreas.some(s => s.row === r && s.col === c)) {
                snowAreas.push({ row: r, col: c })
              }
            }
          }
        }
      }
    }
    
    return snowAreas
  }

  function generateThunderAreas(areaType: 'small' | 'medium' | 'large'): { row: number; col: number }[] {
    const thunderAreas: { row: number; col: number }[] = []
    
    let count: number
    let size: number
    
    if (areaType === 'small') {
      count = 6
      size = 1
    } else if (areaType === 'medium') {
      count = 3
      size = 2
    } else {
      count = 5
      size = 2
    }
    
    for (let i = 0; i < count; i++) {
      let startRow: number
      let startCol: number
      let attempts = 0
      
      do {
        startRow = Math.floor(Math.random() * (MAP_ROWS - size + 1))
        startCol = Math.floor(Math.random() * (MAP_COLS - size + 1))
        attempts++
      } while (
        attempts < 50 && 
        thunderAreas.some(t => t.row >= startRow && t.row < startRow + size && t.col >= startCol && t.col < startCol + size)
      )
      
      if (attempts < 50) {
        for (let dr = 0; dr < size; dr++) {
          for (let dc = 0; dc < size; dc++) {
            const r = startRow + dr
            const c = startCol + dc
            if (!isObstacle(r, c) && !thunderAreas.some(t => t.row === r && t.col === c)) {
              thunderAreas.push({ row: r, col: c })
            }
          }
        }
      }
    }
    
    return thunderAreas
  }

  function updateWeather() {
    const rand = Math.random()
    if (rand < 0.1) {
      // 小雪：1个3×3区域
      battle.value.weather = 'snow'
      battle.value.snowAreas = generateSnowAreas(1)
      battle.value.thunderAreas = []
      showSubtitle('❄️ 小雪！雪地区域的角色无法移动！')
      addBattleLog('❄️ 本回合是小雪天')
    } else if (rand < 0.3) {
      // 中雪：2个3×3区域
      battle.value.weather = 'snow'
      battle.value.snowAreas = generateSnowAreas(2)
      battle.value.thunderAreas = []
      showSubtitle('❄️ 中雪！雪地区域的角色无法移动！')
      addBattleLog('❄️ 本回合是中雪天')
    } else if (rand < 0.4) {
      // 大雪：3个3×3区域
      battle.value.weather = 'snow'
      battle.value.snowAreas = generateSnowAreas(3)
      battle.value.thunderAreas = []
      showSubtitle('❄️ 大雪！雪地区域的角色无法移动！')
      addBattleLog('❄️ 本回合是大雪天')
    } else if (rand < 0.5) {
      // 小雷雨：6个1×1雷电
      battle.value.weather = 'thunder'
      battle.value.snowAreas = []
      battle.value.thunderAreas = generateThunderAreas('small')
      showSubtitle('⚡ 小雷雨！小心雷电格子！')
      addBattleLog('⚡ 本回合是小雷雨')
    } else if (rand < 0.7) {
      // 中雷雨：3个2×2雷电
      battle.value.weather = 'thunder'
      battle.value.snowAreas = []
      battle.value.thunderAreas = generateThunderAreas('medium')
      showSubtitle('⚡ 中雷雨！小心雷电格子！')
      addBattleLog('⚡ 本回合是中雷雨')
    } else if (rand < 0.8) {
      // 大雷雨：5个2×2雷电
      battle.value.weather = 'thunder'
      battle.value.snowAreas = []
      battle.value.thunderAreas = generateThunderAreas('large')
      showSubtitle('⚡ 大雷雨！小心雷电格子！')
      addBattleLog('⚡ 本回合是大雷雨')
    } else {
      // 20%概率正常天气
      battle.value.weather = 'normal'
      battle.value.snowAreas = []
      battle.value.thunderAreas = []
    }
  }

  function isInThunderArea(row: number, col: number): boolean {
    return battle.value.thunderAreas.some(t => t.row === row && t.col === col)
  }

  function applyThunderDamage() {
    battle.value.units.forEach((unit, index) => {
      if (isInThunderArea(unit.position.row, unit.position.col) && unit.hp > 0) {
        const damage = Math.floor(unit.maxHp * 0.5)
        unit.hp = Math.max(0, unit.hp - damage)
        
        const side = unit.isEnemy ? '敌方' : '我方'
        const subtitle = `⚡ ${side}【${unit.name}】被雷电击中！受到 ${damage} 点伤害！`
        showSubtitle(subtitle)
        addBattleLog(subtitle)
        
        battle.value.units[index] = { ...unit }
      }
    })
  }

  function isInSnowArea(row: number, col: number): boolean {
    return battle.value.snowAreas.some(s => s.row === row && s.col === col)
  }

  function resetGame() {
    gold.value = 100
    heroes.value = createInitialHeroes()
    settings.value = {
      enemyCount: 4,
      allyAiCount: 4
    }
    uni.removeStorageSync('settings_user_adjusted')
    clearBattle()
  }

  // 获取 Download/zhanqi 文件夹路径
  function getSaveFolderPath(): string {
    try {
      // 使用 plus.io API 获取下载目录
      if (typeof plus !== 'undefined' && plus.io) {
        const downloadDir = plus.io.convertLocalFileSystemURL('_downloads')
        return `${downloadDir}/zhanqi`
      }
    } catch (e) {
      console.log('获取保存路径失败:', e)
    }
    // 回退到临时目录
    return '_doc/zhanqi'
  }

  // 确保文件夹存在
  function ensureSaveFolderExists(folderPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (typeof plus !== 'undefined' && plus.io) {
          plus.io.resolveLocalFileSystemURL(
            folderPath,
            () => {
              // 文件夹已存在
              resolve(true)
            },
            () => {
              // 文件夹不存在，创建它
              plus.io.requestFileSystem(
                plus.io.PRIVATE_WDOC,
                (fs: any) => {
                  const path = folderPath.replace(plus.io.convertLocalFileSystemURL('_downloads'), '')
                  fs.root.getDirectory(
                    path,
                    { create: true },
                    () => resolve(true),
                    () => resolve(false)
                  )
                },
                () => resolve(false)
              )
            }
          )
        } else {
          // H5 环境，不需要创建文件夹
          resolve(true)
        }
      } catch (e) {
        console.log('创建文件夹失败:', e)
        resolve(false)
      }
    })
  }

  // 保存数据到文件系统
  async function saveToFileSystem(saveData: any, fileName: string): Promise<boolean> {
    try {
      const folderPath = getSaveFolderPath()
      const folderExists = await ensureSaveFolderExists(folderPath)
      if (!folderExists) {
        console.log('无法创建保存文件夹')
        return false
      }

      if (typeof plus !== 'undefined' && plus.io) {
        const fullPath = `${folderPath}/${fileName}`
        return new Promise((resolve) => {
          plus.io.requestFileSystem(
            plus.io.PUBLIC_DOWNLOADS,
            (fs: any) => {
              // 先尝试创建 zhanqi 文件夹
              fs.root.getDirectory(
                'zhanqi',
                { create: true },
                (dirEntry: any) => {
                  // 创建或打开文件
                  dirEntry.getFile(
                    fileName,
                    { create: true, exclusive: false },
                    (fileEntry: any) => {
                      fileEntry.createWriter(
                        (writer: any) => {
                          writer.onwriteend = () => {
                            console.log(`存档已保存到文件系统: ${fullPath}`)
                            resolve(true)
                          }
                          writer.onerror = (e: any) => {
                            console.log('写入文件失败:', e)
                            resolve(false)
                          }
                          writer.write(JSON.stringify(saveData))
                        },
                        (e: any) => {
                          console.log('创建文件写入器失败:', e)
                          resolve(false)
                        }
                      )
                    },
                    (e: any) => {
                      console.log('创建文件失败:', e)
                      resolve(false)
                    }
                  )
                },
                (e: any) => {
                  console.log('创建 zhanqi 文件夹失败:', e)
                  resolve(false)
                }
              )
            },
            (e: any) => {
              console.log('请求文件系统失败:', e)
              resolve(false)
            }
          )
        })
      }
      return false
    } catch (e) {
      console.log('保存到文件系统失败:', e)
      return false
    }
  }

  // 从文件系统读取数据
  async function loadFromFileSystem(fileName: string): Promise<any> {
    try {
      if (typeof plus !== 'undefined' && plus.io) {
        return new Promise((resolve) => {
          plus.io.requestFileSystem(
            plus.io.PUBLIC_DOWNLOADS,
            (fs: any) => {
              fs.root.getFile(
                `zhanqi/${fileName}`,
                { create: false },
                (fileEntry: any) => {
                  fileEntry.file(
                    (file: any) => {
                      const reader = new FileReader()
                      reader.onloadend = (e: any) => {
                        try {
                          const content = e.target.result
                          const data = JSON.parse(content)
                          console.log(`从文件系统加载存档成功: zhanqi/${fileName}`)
                          resolve(data)
                        } catch (parseError) {
                          console.log('解析存档文件失败:', parseError)
                          resolve(null)
                        }
                      }
                      reader.onerror = () => {
                        console.log('读取文件失败')
                        resolve(null)
                      }
                      reader.readAsText(file)
                    },
                    () => {
                      console.log('获取文件失败')
                      resolve(null)
                    }
                  )
                },
                () => {
                  console.log('文件不存在')
                  resolve(null)
                }
              )
            },
            () => {
              console.log('请求文件系统失败')
              resolve(null)
            }
          )
        })
      }
      return null
    } catch (e) {
      console.log('从文件系统加载失败:', e)
      return null
    }
  }

  // 获取所有存档槽的文件名
  function getSaveFileName(slotIndex: number): string {
    return `gameSave_${slotIndex}.json`
  }

  // 获取所有存档槽的信息
  async function getSaveSlotsInfo(): Promise<Array<{ index: number; hasData: boolean; saveName?: string; savedAt?: string }>> {
    const slotsInfo = []
    
    for (let i = 0; i < 3; i++) {
      let hasData = false
      let saveName: string | undefined
      let savedAt: string | undefined
      
      // 先尝试从文件系统获取
      const fileData = await loadFromFileSystem(getSaveFileName(i))
      if (fileData) {
        hasData = true
        saveName = fileData.saveName
        savedAt = fileData.savedAt
      } else {
        // 再尝试从本地存储获取
        const localData = uni.getStorageSync(`gameSave_${i}`)
        if (localData) {
          try {
            const data = JSON.parse(localData)
            hasData = true
            saveName = data.saveName
            savedAt = data.savedAt
          } catch (e) {
            // 解析失败，忽略
          }
        }
      }
      
      slotsInfo.push({
        index: i,
        hasData,
        saveName,
        savedAt
      })
    }
    
    return slotsInfo
  }

  // 存档版本号，用于数据迁移
  const SAVE_VERSION = 2

  function migrateSaveData(data: any): any {
    if (!data.version || data.version < 1) {
      console.log('迁移存档数据到版本 1...')
      // 版本 1 迁移：添加默认值
      if (!data.heroes) {
        data.heroes = []
      }
      if (!data.gold) {
        data.gold = 100
      }
      if (!data.settings) {
        data.settings = {}
      }
      data.version = 1
    }

    if (data.version < 2) {
      console.log('迁移存档数据到版本 2...')
      // 版本 2 迁移：确保所有英雄有完整属性
      if (data.heroes && Array.isArray(data.heroes)) {
        data.heroes = data.heroes.map((hero: any) => {
          // 确保每个英雄有完整的属性
          if (!hero.classType) hero.classType = 'warrior'
          if (!hero.level) hero.level = 1
          if (!hero.exp) hero.exp = 0
          if (!hero.hp) hero.hp = hero.maxHp || 100
          if (!hero.maxHp) hero.maxHp = 100
          if (!hero.attack) hero.attack = 10
          if (!hero.defense) hero.defense = 10
          if (!hero.statPoints) hero.statPoints = 1
          if (!hero.usedStatPoints) hero.usedStatPoints = 0
          if (!hero.skill) {
            hero.skill = {
              name: '',
              description: '',
              cooldown: 0,
              currentCooldown: 0
            }
          }
          return hero
        })
      }
      data.version = 2
    }

    // 未来版本的迁移可以继续添加

    return data
  }

  async function saveGame(saveName?: string): Promise<{ success: boolean; needDeleteOldest?: boolean; oldestSlotIndex?: number }> {
    try {
      const now = new Date()
      const saveData = {
        version: SAVE_VERSION,
        gold: gold.value,
        heroes: heroes.value,
        settings: settings.value,
        savedAt: `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        saveName: saveName || `存档`
      }

      // 同时保存一份备份，防止意外丢失
      uni.setStorageSync('gameSave_backup', JSON.stringify(saveData))
      // 同时保存到文件系统备份
      await saveToFileSystem(saveData, 'gameSave_backup.json')

      let saveIndex = -1
      for (let i = 0; i < 3; i++) {
        const existing = uni.getStorageSync(`gameSave_${i}`)
        if (!existing) {
          saveIndex = i
          break
        }
      }

      if (saveIndex >= 0) {
        uni.setStorageSync(`gameSave_${saveIndex}`, JSON.stringify(saveData))
        // 同时保存到文件系统
        await saveToFileSystem(saveData, getSaveFileName(saveIndex))
        return { success: true }
      } else {
        let oldestIndex = 0
        let oldestTime = Date.now()
        for (let i = 0; i < 3; i++) {
          const existing = uni.getStorageSync(`gameSave_${i}`)
          if (existing) {
            try {
              const data = JSON.parse(existing)
              const timeStr = data.savedAt.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1/$2/$3 $4:$5:$6')
              const saveTime = new Date(timeStr).getTime()
              if (saveTime < oldestTime) {
                oldestTime = saveTime
                oldestIndex = i
              }
            } catch (e) {
              oldestIndex = i
              break
            }
          }
        }
        return { success: false, needDeleteOldest: true, oldestSlotIndex: oldestIndex }
      }
    } catch (e) {
      console.error('保存游戏失败:', e)
      return { success: false }
    }
  }

  async function saveGameOverwrite(saveName: string, slotIndex: number): Promise<boolean> {
    try {
      const now = new Date()
      const saveData = {
        version: SAVE_VERSION,
        gold: gold.value,
        heroes: heroes.value,
        settings: settings.value,
        savedAt: `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        saveName: saveName || `存档`
      }
      
      // 同时保存一份备份
      uni.setStorageSync('gameSave_backup', JSON.stringify(saveData))
      // 同时保存到文件系统备份
      await saveToFileSystem(saveData, 'gameSave_backup.json')
      
      uni.setStorageSync(`gameSave_${slotIndex}`, JSON.stringify(saveData))
      // 同时保存到文件系统
      await saveToFileSystem(saveData, getSaveFileName(slotIndex))
      return true
    } catch (e) {
      console.error('保存游戏失败:', e)
      return false
    }
  }

  async function loadGame(slotIndex: number = 0): Promise<boolean> {
    try {
      let savedData: string | null = null
      let data: any = null
      
      // 优先从文件系统加载
      console.log('尝试从文件系统加载存档...')
      const fileData = await loadFromFileSystem(getSaveFileName(slotIndex))
      
      if (fileData) {
        data = fileData
        console.log('从文件系统加载存档成功')
      } else {
        // 如果文件系统没有存档，尝试从本地存储加载
        console.log('文件系统中没有存档，尝试从本地存储加载...')
        savedData = uni.getStorageSync(`gameSave_${slotIndex}`)
        
        // 如果没有找到存档，尝试从文件系统备份恢复
        if (!savedData) {
          console.log('本地存储中没有存档，尝试从文件系统备份恢复...')
          const backupFileData = await loadFromFileSystem('gameSave_backup.json')
          if (backupFileData) {
            data = backupFileData
          } else {
            // 最后尝试从本地存储备份恢复
            console.log('尝试从本地存储备份恢复...')
            savedData = uni.getStorageSync('gameSave_backup')
          }
        }
        
        if (savedData) {
          data = JSON.parse(savedData)
        }
      }
      
      if (!data) {
        console.log('没有存档数据')
        return false
      }
      
      // 数据迁移
      data = migrateSaveData(data)
      
      // 验证数据完整性
      if (!data.heroes || !Array.isArray(data.heroes)) {
        console.log('存档数据不完整，使用默认值')
        data.heroes = []
      }
      if (!data.gold || typeof data.gold !== 'number') {
        data.gold = 100
      }
      if (!data.settings || typeof data.settings !== 'object') {
        data.settings = {}
      }
      
      gold.value = data.gold
      heroes.value = data.heroes
      settings.value = data.settings
      uni.setStorageSync('settings_user_adjusted', 'true')
      initSettings()
      clearBattle()
      
      // 加载成功后，自动保存到本地存储备份和文件系统备份
      uni.setStorageSync('gameSave_backup', JSON.stringify(data))
      await saveToFileSystem(data, 'gameSave_backup.json')
      
      console.log('存档加载成功')
      return true
    } catch (e) {
      console.error('加载游戏失败:', e)
      
      // 如果加载失败，尝试从备份恢复
      try {
        // 先尝试文件系统备份
        const backupFileData = await loadFromFileSystem('gameSave_backup.json')
        if (backupFileData) {
          console.log('尝试从文件系统备份恢复...')
          let data = migrateSaveData(backupFileData)
          
          gold.value = data.gold || 100
          heroes.value = data.heroes || []
          settings.value = data.settings || {}
          uni.setStorageSync('settings_user_adjusted', 'true')
          initSettings()
          clearBattle()
          
          console.log('从文件系统备份恢复成功')
          return true
        }
        
        // 然后尝试本地存储备份
        const backupData = uni.getStorageSync('gameSave_backup')
        if (backupData) {
          console.log('尝试从本地存储备份恢复...')
          let data = JSON.parse(backupData)
          data = migrateSaveData(data)
          
          gold.value = data.gold || 100
          heroes.value = data.heroes || []
          settings.value = data.settings || {}
          uni.setStorageSync('settings_user_adjusted', 'true')
          initSettings()
          clearBattle()
          
          console.log('从本地存储备份恢复成功')
          return true
        }
      } catch (backupError) {
        console.error('备份恢复失败:', backupError)
      }
      
      return false
    }
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
    initSettings,
    addGold,
    deductGold,
    hireHero,
    fireHero,
    renameHero,
    changeHeroClass,
    addHeroStat,
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
    confirmArchitectSkill,
    confirmStrategistSkill,
    defend,
    markUnitActed,
    endPlayerTurn,
    addAiUnit,
    addAiUnitDirect,
    setSpeed,
    clearBattle,
    resetGame,
    saveGame,
    saveGameOverwrite,
    loadGame,
    getSaveSlotsInfo,
    getAvailablePositions,
    getAttackablePositions,
    getSkillRangePositions,
    subtitle,
    callReinforcements,
    battleLog,
    addBattleLog,
    clearBattleLog,
    isInSnowArea,
    updateWeather
  }
})