import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, Character, Item, HomeGridCell, BattleMap, BattleCharacter, BattleTile, TerrainType, BattleBuilding, BattleCollectible, WeatherType, SnowArea, FireArea, StatusType, Attribute, Skill } from '../utils/gameData'
import { INITIAL_CHARACTERS, HIREABLE_CHARACTERS, FACTION_CONFIG, JOB_CONFIG, createInitialHomeGrid, createCharacterFromTemplate, EQUIPMENT_TEMPLATES, CONSUMABLE_TEMPLATES, BATTLE_CONFIG, TERRAIN_PROBABILITIES, TERRAIN_CONFIG, BUILDING_CONFIG, COLLECTIBLE_CONFIG, CHARACTER_GROWTH, getExpRequired, getEquipmentStats, getEquipmentUpgradeCost, openChest, DIFFICULTY_CONFIG, SKILL_TEMPLATES, getAvatarPath, getRandomRarity, CHARACTER_SKILLS, buildSkillsForCharacterId, buildFullSkillsForCharacter, STATUS_CONFIG, NEGATIVE_STATUSES, POSITIVE_STATUSES, RARITY_CONFIG, ATTRIBUTE_CONFIG, calculateCharacterStats, calculateSetBonus, CHEST_CONFIG, createChestItem, isChestItem, getChestConfigByName, processEquipmentEffects } from '../utils/gameData'
import { saveGameToExternalStorage, loadGameFromExternalStorage, getExternalStoragePath } from '../utils/storageUtils'

export const useGameStore = defineStore('game', () => {
  const player = ref<Player | null>(null)
  const currentCharacter = ref<Character | null>(null)
  const battleMap = ref<BattleMap | null>(null)
  const isInBattle = ref(false)
  const isLoading = ref(false)
  const battleLog = ref<string[]>([])
  const gameSpeed = ref(1)
  const currentAiCharacter = ref<string | null>(null)
  
  // 抖动特效相关
  interface ShakingTarget {
    row: number
    col: number
    type: 'character' | 'building'
  }
  const shakingTargets = ref<ShakingTarget[]>([])
  
  function triggerShake(row: number, col: number, type: 'character' | 'building') {
    const existingIndex = shakingTargets.value.findIndex(t => t.row === row && t.col === col && t.type === type)
    if (existingIndex !== -1) {
      shakingTargets.value.splice(existingIndex, 1)
    }
    
    const target = { row, col, type }
    shakingTargets.value.push(target)
    setTimeout(() => {
      const idx = shakingTargets.value.findIndex(t => t.row === row && t.col === col && t.type === type)
      if (idx !== -1) {
        shakingTargets.value.splice(idx, 1)
      }
    }, 300)
  }
  
  // 技能光效相关
  interface SkillEffect {
    id: string
    row: number
    col: number
    color: string
    size: 'small' | 'medium' | 'large'
    timestamp: number
    attribute: Attribute
    skillType: 'attack' | 'heal' | 'support' | 'summon' | 'special'
    particles?: { x: number; y: number; delay: number }[]
    category?: '指定' | 'aoe' | '直线' | '横扫' | '轰炸' | 'heal' | 'support' | 'summon' | 'special'
    direction?: 'up' | 'down' | 'left' | 'right'
    fromRow?: number
    fromCol?: number
  }
  const skillEffects = ref<SkillEffect[]>([])
  
  function triggerSkillEffect(row: number, col: number, attribute: Attribute, size: 'small' | 'medium' | 'large' = 'medium', skillType: 'attack' | 'heal' | 'support' | 'summon' | 'special' = 'attack', category?: '指定' | 'aoe' | '直线' | '横扫' | '轰炸' | 'heal' | 'support' | 'summon' | 'special', fromRow?: number, fromCol?: number) {
    const color = ATTRIBUTE_CONFIG[attribute]?.color || ATTRIBUTE_CONFIG.normal.color
    const effectId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const particles = generateParticles(attribute, skillType)
    
    skillEffects.value.push({
      id: effectId,
      row,
      col,
      color,
      size,
      timestamp: Date.now(),
      attribute,
      skillType,
      particles,
      category,
      fromRow,
      fromCol
    })
    setTimeout(() => {
      const idx = skillEffects.value.findIndex(e => e.id === effectId)
      if (idx !== -1) {
        skillEffects.value.splice(idx, 1)
      }
    }, 1500)
  }
  
  function generateParticles(attribute: Attribute, skillType: string): { x: number; y: number; delay: number }[] {
    const particles: { x: number; y: number; delay: number }[] = []
    const particleCount = skillType === 'attack' ? 8 : skillType === 'heal' ? 6 : 4
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = 30 + Math.random() * 40
      particles.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        delay: Math.random() * 0.2
      })
    }
    return particles
  }

  function triggerAOEEffects(
    centerRow: number,
    centerCol: number,
    areaRange: number,
    attribute: Attribute,
    rangeType: 'diamond' | 'square' = 'diamond',
    skillType: 'attack' | 'heal' | 'support' | 'summon' | 'special' = 'attack',
    category?: 'aoe' | '轰炸'
  ) {
    if (!battleMap.value) return
    
    const effectIds: string[] = []
    const timestamp = Date.now()
    
    for (let dr = -areaRange; dr <= areaRange; dr++) {
      for (let dc = -areaRange; dc <= areaRange; dc++) {
        const r = centerRow + dr
        const c = centerCol + dc
        if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
          const isValid = rangeType === 'diamond'
            ? Math.abs(dr) + Math.abs(dc) <= areaRange
            : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange
          if (isValid) {
            const color = ATTRIBUTE_CONFIG[attribute]?.color || ATTRIBUTE_CONFIG.normal.color
            const effectId = `skill_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
            const particles = generateParticles(attribute, skillType)
            const isBombing = category === '轰炸'
            const delay = isBombing ? Math.random() * 0.4 : Math.max(Math.abs(dr), Math.abs(dc)) * 0.08
            
            skillEffects.value.push({
              id: effectId,
              row: r,
              col: c,
              color,
              size: isBombing ? 'small' : 'medium',
              timestamp,
              attribute,
              skillType,
              particles,
              category,
              fromRow: centerRow,
              fromCol: centerCol
            })
            effectIds.push(effectId)
          }
        }
      }
    }
    
    setTimeout(() => {
      effectIds.forEach(effectId => {
        const idx = skillEffects.value.findIndex(e => e.id === effectId)
        if (idx !== -1) {
          skillEffects.value.splice(idx, 1)
        }
      })
    }, 1500)
  }

  function triggerAreaEffects(
    positions: { row: number; col: number }[],
    attribute: Attribute,
    skillType: 'attack' | 'heal' | 'support' | 'summon' | 'special' = 'attack',
    category?: '横扫' | '直线',
    direction?: 'up' | 'down' | 'left' | 'right',
    fromRow?: number,
    fromCol?: number
  ) {
    if (!battleMap.value) return
    
    const effectIds: string[] = []
    const timestamp = Date.now()
    const color = ATTRIBUTE_CONFIG[attribute]?.color || ATTRIBUTE_CONFIG.normal.color
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const effectId = `skill_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
      const particles = generateParticles(attribute, skillType)
      const sweepDelay = category === '横扫' || category === '直线' ? i * 0.05 : 0
      
      skillEffects.value.push({
        id: effectId,
        row: pos.row,
        col: pos.col,
        color,
        size: 'medium',
        timestamp,
        attribute,
        skillType,
        particles,
        category,
        direction,
        fromRow,
        fromCol
      })
      effectIds.push(effectId)
    }
    
    setTimeout(() => {
      effectIds.forEach(effectId => {
        const idx = skillEffects.value.findIndex(e => e.id === effectId)
        if (idx !== -1) {
          skillEffects.value.splice(idx, 1)
        }
      })
    }, 1500)
  }

  function processAOEAttackSkill(
    attacker: BattleCharacter,
    skill: Skill,
    centerRow: number,
    centerCol: number,
    charTemplate: Character | undefined
  ) {
    if (!battleMap.value) return

    const areaRange = skill.areaRange || 1
    const rangeType = skill.rangeType || 'diamond'
    const attribute = skill.attribute || 'normal'
    const skillType = skill.type as 'attack' | 'heal' | 'support' | 'summon' | 'special' || 'attack'
    const isBombing = skill.targetCountTag === '轰炸'
    const aoeCategory = isBombing ? '轰炸' as const : 'aoe' as const

    triggerAOEEffects(centerRow, centerCol, areaRange, attribute, rangeType, skillType, aoeCategory)

    // 投射物动画：轰炸类技能从攻击者飞到中心
    if (isBombing) {
      const projType = getProjectileTypeForSkill(skill)
      if (projType) {
        triggerProjectile(attacker.row, attacker.col, centerRow, centerCol, projType, attribute)
      }
    }

    const attackPower = computeAttackPower(attacker)

    let totalDamage = 0
    const damageResults: string[] = []
    const defeatedNames: string[] = []
    const destroyedBuildings: string[] = []
    let splashTargets: BattleCharacter[] = []
    let splashBuildings: BattleBuilding[] = []

    const enemyTargets = attacker.isPlayer
      ? battleMap.value.enemies.filter(enemy => {
          const dr = enemy.row - centerRow
          const dc = enemy.col - centerCol
          if (rangeType === 'diamond') {
            return Math.abs(dr) + Math.abs(dc) <= areaRange
          } else {
            return Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange
          }
        })
      : battleMap.value.players.filter(playerChar => {
          const dr = playerChar.row - centerRow
          const dc = playerChar.col - centerCol
          if (rangeType === 'diamond') {
            return Math.abs(dr) + Math.abs(dc) <= areaRange
          } else {
            return Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange
          }
        })

    const enemyBuildings = battleMap.value.buildings.filter(building => {
      const dr = building.row - centerRow
      const dc = building.col - centerCol
      let inRange = false
      if (rangeType === 'diamond') {
        inRange = Math.abs(dr) + Math.abs(dc) <= areaRange
      } else {
        inRange = Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange
      }
      return inRange && building.isPlayer !== attacker.isPlayer
    })

    const obstaclePositions: { row: number; col: number }[] = []
    for (let dr = -areaRange; dr <= areaRange; dr++) {
      for (let dc = -areaRange; dc <= areaRange; dc++) {
        const r = centerRow + dr
        const c = centerCol + dc
        if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
          const isValid = rangeType === 'diamond'
            ? Math.abs(dr) + Math.abs(dc) <= areaRange
            : Math.abs(dr) <= areaRange && Math.abs(dc) <= areaRange
          if (isValid && battleMap.value.tiles[r]![c]!.terrain === 'obstacle') {
            obstaclePositions.push({ row: r, col: c })
          }
        }
      }
    }

    enemyTargets.forEach(target => {
      const targetTemplate = findCharacterTemplateInStore(target.characterId)
      const defense = computeDefensePower(target)
      
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        const movedDistance = attacker.movedDistance || 0
        const moveBonus = 1 + 0.3 * movedDistance
        damage = Math.max(1, Math.floor(moveBonus * attackPower - defense))
      } else if (skill.damageFormula === 'hp_lost_pct') {
        const maxHp = attacker.maxHp || 100
        const hpLost = maxHp - (attacker.hp || 0)
        const hpLostPercent = hpLost / maxHp
        const totalPower = (skill.power / 100) + hpLostPercent
        damage = Math.max(1, Math.floor(totalPower * attackPower - defense))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
      }
      
      target.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(target.row, target.col, 'character')
      triggerHitFlash(target.row, target.col, attribute)
      showFloatingText(target.row, target.col, damage, 'damage', attribute, true)
      triggerSkillEffect(target.row, target.col, attribute, 'medium', skillType)
      damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

      if (skill.statusEffect) {
        addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0)
        triggerStatusApplyEffect(target.row, target.col, skill.statusEffect)
        damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}】状态`)
      }
      if (skill.statusEffects && skill.statusEffects.length > 0) {
        skill.statusEffects.forEach((status, index) => {
          const duration = skill.statusEffectsDurations?.[index] || 0
          addStatusToCharacter(target, status, true, duration)
          triggerStatusApplyEffect(target.row, target.col, status)
          damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[status]?.name || status}】状态`)
        })
      }

      if (target.hp <= 0) {
        triggerDefeatAnimation(target.row, target.col, 'kill')
        removeCharacterFromBattle(target.id, target.isPlayer)
        defeatedNames.push(targetTemplate?.name || target.characterId)
      }
    })

    enemyBuildings.forEach(building => {
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        damage = Math.max(1, Math.floor(attackPower))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
      }
      
      building.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(building.row, building.col, 'building')
      triggerHitFlash(building.row, building.col)
      showFloatingText(building.row, building.col, damage, 'damage')
      triggerSkillEffect(building.row, building.col, attribute, 'medium', skillType)
      damageResults.push(`对【${building.name}】造成${damage}点伤害`)

      trySpawnZombieFromHeart(building)

      if (building.hp <= 0) {
        removeBuildingFromBattle(building.id)
        triggerDefeatAnimation(building.row, building.col, 'kill')
        battleMap.value!.tiles[building.row]![building.col]!.building = null
        destroyedBuildings.push(building.name)
      }
    })

    obstaclePositions.forEach(pos => {
      battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
      triggerShake(pos.row, pos.col, 'character')
    })
    if (obstaclePositions.length > 0) {
      damageResults.push(`清除了${obstaclePositions.length}个障碍物`)
    }

    // 轰炸技能溅射特效：对中心范围外圈1格的目标造成50%伤害
    if (isBombing) {
      const splashRange = areaRange + 1
      splashTargets = attacker.isPlayer
        ? battleMap.value.enemies.filter(enemy => {
            const dr = enemy.row - centerRow
            const dc = enemy.col - centerCol
            const dist = Math.abs(dr) + Math.abs(dc)
            return dist > areaRange && dist <= splashRange
          })
        : battleMap.value.players.filter(playerChar => {
            const dr = playerChar.row - centerRow
            const dc = playerChar.col - centerCol
            const dist = Math.abs(dr) + Math.abs(dc)
            return dist > areaRange && dist <= splashRange
          })

      splashBuildings = battleMap.value.buildings.filter(building => {
        const dr = building.row - centerRow
        const dc = building.col - centerCol
        const dist = Math.abs(dr) + Math.abs(dc)
        return dist > areaRange && dist <= splashRange && building.isPlayer !== attacker.isPlayer
      })

      // 溅射特效
      if (splashTargets.length > 0 || splashBuildings.length > 0) {
        for (let dr = -splashRange; dr <= splashRange; dr++) {
          for (let dc = -splashRange; dc <= splashRange; dc++) {
            const dist = Math.abs(dr) + Math.abs(dc)
            if (dist > areaRange && dist <= splashRange) {
              const r = centerRow + dr
              const c = centerCol + dc
              if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
                const splashColor = ATTRIBUTE_CONFIG[attribute]?.color || '#ff6b35'
                const splashEffectId = `splash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                skillEffects.value.push({
                  id: splashEffectId,
                  row: r,
                  col: c,
                  type: 'explosion',
                  color: splashColor,
                  size: 'medium',
                  createdAt: Date.now()
                })
                setTimeout(() => {
                  const idx = skillEffects.value.findIndex(e => e.id === splashEffectId)
                  if (idx !== -1) skillEffects.value.splice(idx, 1)
                }, 800)
              }
            }
          }
        }
      }

      // 溅射伤害（50%伤害）
      splashTargets.forEach(target => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const defense = computeDefensePower(target)
        let baseDamage = 0
        if (skill.damageFormula === 'move_based') {
          const movedDistance = attacker.movedDistance || 0
          const moveBonus = 1 + 0.3 * movedDistance
          baseDamage = Math.max(1, Math.floor(moveBonus * attackPower - defense))
        } else {
          baseDamage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
        }
        const splashDamage = Math.max(1, Math.floor(baseDamage * 0.5))
        target.hp -= splashDamage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += splashDamage
        totalDamage += splashDamage

        triggerShake(target.row, target.col, 'character')
        triggerHitFlash(target.row, target.col, attribute)
        showFloatingText(target.row, target.col, splashDamage, 'damage', attribute, true)
        damageResults.push(`溅射对【${targetTemplate?.name || target.characterId}】造成${splashDamage}点伤害`)

        if (target.hp <= 0) {
          triggerDefeatAnimation(target.row, target.col, 'kill')
          removeCharacterFromBattle(target.id, target.isPlayer)
          defeatedNames.push(targetTemplate?.name || target.characterId)
        }
      })

      splashBuildings.forEach(building => {
        let baseDamage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
        const splashDamage = Math.max(1, Math.floor(baseDamage * 0.5))
        building.hp -= splashDamage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += splashDamage
        totalDamage += splashDamage

        triggerShake(building.row, building.col, 'building')
        showFloatingText(building.row, building.col, splashDamage, 'damage')
        damageResults.push(`溅射对【${building.name}】造成${splashDamage}点伤害`)

        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id)
          battleMap.value!.tiles[building.row]![building.col]!.building = null
          destroyedBuildings.push(building.name)
        }
      })
    }

    if (skill.lifesteal && totalDamage > 0) {
      const healAmount = Math.floor(totalDamage * skill.lifesteal)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      damageResults.push(`恢复了${healAmount}点生命值`)
    }

    if (skill.selfHpCost) {
      const hpBase = skill.selfHpCostType === 'current' ? (attacker.hp || 1) : (attacker.maxHp || 100)
      const hpCost = Math.floor(hpBase * skill.selfHpCost)
      attacker.hp = Math.max(1, attacker.hp - hpCost)
      damageResults.push(`消耗了${hpCost}点生命值`)
    }

    if (skill.selfStatusEffects) {
      skill.selfStatusEffects.forEach((effect, index) => {
        const duration = getSelfStatusDuration(skill, index)
        addStatusToCharacter(attacker, effect, true, duration)
        triggerStatusApplyEffect(attacker.row, attacker.col, effect)
        damageResults.push(`自身获得【${STATUS_CONFIG[effect]?.name || effect}】状态${duration > 0 ? `，持续${duration}回合` : ''}`)
      })
    }

    if (skill.selfMaxHpBuff) {
      const hpBuff = Math.floor(attackPower * skill.selfMaxHpBuff)
      attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff
      attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += hpBuff
      damageResults.push(`生命值上限+${hpBuff}并恢复${hpBuff}生命`)
    }

    if (skill.selfHealPct && attacker.maxHp) {
      const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += healAmount
      damageResults.push(`恢复${healAmount}点生命值`)
      showFloatingText(attacker.row, attacker.col, healAmount, 'heal')
    }

    if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
      const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
      if (negStatuses.length > 0) {
        const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
        toDispel.forEach(status => {
          removeStatusFromCharacter(attacker, status)
          damageResults.push(`驱散【${STATUS_CONFIG[status]?.name || status}】状态`)
        })
      }
    }

    const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length + 
      (isBombing ? (splashTargets.length + splashBuildings.length) : 0)
    if (totalHits > 0) {
      const summary = damageResults.join('，')
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】命中 ${totalHits} 个目标：${summary}`)
    } else {
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标`)
    }
  }

  function processLineAttackSkill(
    attacker: BattleCharacter,
    skill: Skill,
    direction: 'up' | 'down' | 'left' | 'right',
    charTemplate: Character | undefined
  ) {
    if (!battleMap.value) return

    const lineRange = skill.range || 1
    const lineWidth = skill.lineWidth || 1
    const attribute = skill.attribute || 'normal'
    const skillType = skill.type as 'attack' | 'heal' | 'support' | 'summon' | 'special' || 'attack'

    const attackPower = computeAttackPower(attacker)
    
    triggerSkillEffect(attacker.row, attacker.col, attribute, 'large', skillType)

    let totalDamage = 0
    const damageResults: string[] = []
    const defeatedNames: string[] = []
    const destroyedBuildings: string[] = []

    const linePositions: { row: number; col: number }[] = []
    const row = attacker.row
    const col = attacker.col

    const halfWidth = Math.floor(lineWidth / 2)
    const widthOffsets = lineWidth === 1 ? [0] : Array.from({ length: lineWidth }, (_, i) => i - halfWidth)

    switch (direction) {
      case 'up':
        for (let i = 1; i <= lineRange; i++) {
          const r = row - i
          if (r >= 0 && r < battleMap.value.height) {
            for (const wOff of widthOffsets) {
              const c = col + wOff
              if (c >= 0 && c < battleMap.value.width) {
                linePositions.push({ row: r, col: c })
              }
            }
          }
        }
        break
      case 'down':
        for (let i = 1; i <= lineRange; i++) {
          const r = row + i
          if (r >= 0 && r < battleMap.value.height) {
            for (const wOff of widthOffsets) {
              const c = col + wOff
              if (c >= 0 && c < battleMap.value.width) {
                linePositions.push({ row: r, col: c })
              }
            }
          }
        }
        break
      case 'left':
        for (let i = 1; i <= lineRange; i++) {
          const c = col - i
          if (c >= 0 && c < battleMap.value.width) {
            for (const wOff of widthOffsets) {
              const r = row + wOff
              if (r >= 0 && r < battleMap.value.height) {
                linePositions.push({ row: r, col: c })
              }
            }
          }
        }
        break
      case 'right':
        for (let i = 1; i <= lineRange; i++) {
          const c = col + i
          if (c >= 0 && c < battleMap.value.width) {
            for (const wOff of widthOffsets) {
              const r = row + wOff
              if (r >= 0 && r < battleMap.value.height) {
                linePositions.push({ row: r, col: c })
              }
            }
          }
        }
        break
    }

    triggerAreaEffects(linePositions, attribute, skillType, '直线', direction, attacker.row, attacker.col)

    // 直线技能依次穿透特效：按位置顺序依次触发命中特效
    const sortedLinePositions = [...linePositions].sort((a, b) => {
      // 按距离攻击者的顺序排序
      const distA = Math.abs(a.row - attacker.row) + Math.abs(a.col - attacker.col)
      const distB = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
      return distA - distB
    })

    // 为每个格子添加穿透特效（带有延迟）
    sortedLinePositions.forEach((pos, index) => {
      const effectId = `line_penetrate_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`
      const color = ATTRIBUTE_CONFIG[attribute]?.color || '#fff'
      const delay = index * 0.08
      
      setTimeout(() => {
        skillEffects.value.push({
          id: effectId,
          row: pos.row,
          col: pos.col,
          type: 'beam',
          color,
          size: 'medium',
          createdAt: Date.now()
        })
        setTimeout(() => {
          const idx = skillEffects.value.findIndex(e => e.id === effectId)
          if (idx !== -1) skillEffects.value.splice(idx, 1)
        }, 400)
      }, delay * 1000)
    })

    const enemyTargets = attacker.isPlayer
      ? battleMap.value.enemies.filter(enemy => 
          linePositions.some(pos => pos.row === enemy.row && pos.col === enemy.col)
        )
      : battleMap.value.players.filter(playerChar => 
          linePositions.some(pos => pos.row === playerChar.row && pos.col === playerChar.col)
        )

    const enemyBuildings = battleMap.value.buildings.filter(building => 
      linePositions.some(pos => pos.row === building.row && pos.col === building.col) &&
      building.isPlayer !== attacker.isPlayer
    )

    const obstaclePositions = linePositions.filter(pos => 
      battleMap.value.tiles[pos.row]?.[pos.col]?.terrain === 'obstacle'
    )

    enemyTargets.forEach(target => {
      const targetTemplate = findCharacterTemplateInStore(target.characterId)
      const defense = computeDefensePower(target)
      
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        const movedDistance = attacker.movedDistance || 0
        const moveBonus = 1 + 0.3 * movedDistance
        damage = Math.max(1, Math.floor(moveBonus * attackPower - defense))
      } else if (skill.damageFormula === 'atk_plus_hp_pct' && skill.hpPct) {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower + skill.hpPct * (target.hp || 1)) - defense))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
      }
      
      target.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(target.row, target.col, 'character')
      triggerHitFlash(target.row, target.col, attribute)
      showFloatingText(target.row, target.col, damage, 'damage', attribute, true)
      triggerSkillEffect(target.row, target.col, attribute, 'medium', skillType)
      damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

      if (skill.statusEffect) {
        addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0)
        triggerStatusApplyEffect(target.row, target.col, skill.statusEffect)
        damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}】状态`)
      }

      if (skill.statusEffects) {
        skill.statusEffects.forEach((effect, index) => {
          const duration = skill.statusEffectsDurations?.[index] || 0
          addStatusToCharacter(target, effect, true, duration)
          triggerStatusApplyEffect(target.row, target.col, effect)
          damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[effect]?.name || effect}】状态`)
        })
      }

      if (skill.clearPositiveStatus) {
        POSITIVE_STATUSES.forEach(status => {
          if (hasStatus(target, status)) {
            removeStatusFromCharacter(target, status)
            damageResults.push(`驱散【${targetTemplate?.name || target.characterId}】的【${STATUS_CONFIG[status]?.name || status}】状态`)
          }
        })
      }

      if (target.hp <= 0) {
        triggerDefeatAnimation(target.row, target.col, 'kill')
        removeCharacterFromBattle(target.id, target.isPlayer)
        defeatedNames.push(targetTemplate?.name || target.characterId)
      }
    })

    enemyBuildings.forEach(building => {
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        damage = Math.max(1, Math.floor(attackPower))
      } else if (skill.damageFormula === 'atk_plus_hp_pct' && skill.hpPct) {
        damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
      }
      
      building.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(building.row, building.col, 'building')
      showFloatingText(building.row, building.col, damage, 'damage')
      triggerSkillEffect(building.row, building.col, attribute, 'medium', skillType)
      damageResults.push(`对【${building.name}】造成${damage}点伤害`)

      trySpawnZombieFromHeart(building)

      if (building.hp <= 0) {
        removeBuildingFromBattle(building.id)
        battleMap.value!.tiles[building.row]![building.col]!.building = null
        destroyedBuildings.push(building.name)
      }
    })

    obstaclePositions.forEach(pos => {
      battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
      triggerShake(pos.row, pos.col, 'character')
    })
    if (obstaclePositions.length > 0) {
      damageResults.push(`清除了${obstaclePositions.length}个障碍物`)
    }

    if (skill.lifesteal && totalDamage > 0) {
      const healAmount = Math.floor(totalDamage * skill.lifesteal)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      damageResults.push(`恢复了${healAmount}点生命值`)
    }

    if (skill.selfHpCost) {
      const hpBase = skill.selfHpCostType === 'current' ? (attacker.hp || 1) : (attacker.maxHp || 100)
      const hpCost = Math.floor(hpBase * skill.selfHpCost)
      attacker.hp = Math.max(1, attacker.hp - hpCost)
      damageResults.push(`消耗了${hpCost}点生命值`)
    }

    if (skill.selfStatusEffects) {
      skill.selfStatusEffects.forEach((effect, index) => {
        const duration = skill.selfStatusEffectsDurations?.[index] || 0
        addStatusToCharacter(attacker, effect, true, duration)
        damageResults.push(`自身获得【${STATUS_CONFIG[effect]?.name || effect}】状态${duration > 0 ? `，持续${duration}回合` : ''}`)
      })
    }

    if (skill.selfMaxHpBuff) {
      const hpBuff = Math.floor(attackPower * skill.selfMaxHpBuff)
      attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff
      attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += hpBuff
      damageResults.push(`生命值上限+${hpBuff}并恢复${hpBuff}生命`)
    }

    if (skill.selfHealPct && attacker.maxHp) {
      const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += healAmount
      damageResults.push(`恢复${healAmount}点生命值`)
      showFloatingText(attacker.row, attacker.col, healAmount, 'heal')
    }

    if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
      const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
      if (negStatuses.length > 0) {
        const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
        toDispel.forEach(status => {
          removeStatusFromCharacter(attacker, status)
          damageResults.push(`驱散【${STATUS_CONFIG[status]?.name || status}】状态`)
        })
      }
    }

    const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length
    if (totalHits > 0) {
      const summary = damageResults.join('，')
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】命中 ${totalHits} 个目标：${summary}`)
    } else {
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标`)
    }
  }

  function processSweepAttackSkill(
    attacker: BattleCharacter,
    skill: Skill,
    direction: 'up' | 'down' | 'left' | 'right',
    charTemplate: Character | undefined
  ) {
    if (!battleMap.value) return

    const sweepLength = skill.sweepLength || 3
    const sweepWidth = skill.sweepWidth || 2
    const attribute = skill.attribute || 'normal'
    const skillType = skill.type as 'attack' | 'heal' | 'support' | 'summon' | 'special'

    const attackPower = computeAttackPower(attacker)
    
    triggerSkillEffect(attacker.row, attacker.col, attribute, 'large', skillType)

    let totalDamage = 0
    const damageResults: string[] = []
    const defeatedNames: string[] = []
    const destroyedBuildings: string[] = []

    const sweepPositions: { row: number; col: number }[] = []
    const row = attacker.row
    const col = attacker.col

    const startJ = sweepWidth % 2 === 0 ? -(sweepWidth / 2 - 1) : -Math.floor(sweepWidth / 2)
    const endJ = sweepWidth % 2 === 0 ? sweepWidth / 2 : Math.floor(sweepWidth / 2)

    for (let i = 1; i <= sweepLength; i++) {
      for (let j = startJ; j <= endJ; j++) {
        let r = row
        let c = col
        
        switch (direction) {
          case 'up':
            r = row - i
            c = col + j
            break
          case 'down':
            r = row + i
            c = col + j
            break
          case 'left':
            r = row + j
            c = col - i
            break
          case 'right':
            r = row + j
            c = col + i
            break
        }
        
        if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
          sweepPositions.push({ row: r, col: c })
        }
      }
    }

    triggerAreaEffects(sweepPositions, attribute, skillType, '横扫', direction, attacker.row, attacker.col)

    const enemyTargets = attacker.isPlayer
      ? battleMap.value.enemies.filter(enemy => 
          sweepPositions.some(pos => pos.row === enemy.row && pos.col === enemy.col)
        )
      : battleMap.value.players.filter(playerChar => 
          sweepPositions.some(pos => pos.row === playerChar.row && pos.col === playerChar.col)
        )

    const enemyBuildings = battleMap.value.buildings.filter(building => 
      sweepPositions.some(pos => pos.row === building.row && pos.col === building.col) &&
      building.isPlayer !== attacker.isPlayer
    )

    const obstaclePositions = sweepPositions.filter(pos => 
      battleMap.value.tiles[pos.row]?.[pos.col]?.terrain === 'obstacle'
    )

    enemyTargets.forEach(target => {
      const targetTemplate = findCharacterTemplateInStore(target.characterId)
      const defense = computeDefensePower(target)
      
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        const movedDistance = attacker.movedDistance || 0
        const moveBonus = 1 + 0.3 * movedDistance
        damage = Math.max(1, Math.floor(moveBonus * attackPower - defense))
      } else if (skill.damageFormula === 'atk_plus_hp_pct' && skill.hpPct) {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower + skill.hpPct * (target.hp || 1)) - defense))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
      }
      
      target.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(target.row, target.col, 'character')
      triggerHitFlash(target.row, target.col, attribute)
      showFloatingText(target.row, target.col, damage, 'damage', attribute, true)
      triggerSkillEffect(target.row, target.col, attribute, 'medium', skillType)
      damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

      if (skill.statusEffect) {
        addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0)
        triggerStatusApplyEffect(target.row, target.col, skill.statusEffect)
        damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}】状态`)
      }

      if (skill.statusEffects) {
        skill.statusEffects.forEach((effect, index) => {
          const duration = skill.statusEffectsDurations?.[index] || 0
          addStatusToCharacter(target, effect, true, duration)
          triggerStatusApplyEffect(target.row, target.col, effect)
          damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[effect]?.name || effect}】状态`)
        })
      }

      if (skill.clearPositiveStatus) {
        POSITIVE_STATUSES.forEach(status => {
          if (hasStatus(target, status)) {
            removeStatusFromCharacter(target, status)
            damageResults.push(`驱散【${targetTemplate?.name || target.characterId}】的【${STATUS_CONFIG[status]?.name || status}】状态`)
          }
        })
      }

      if (target.hp <= 0) {
        triggerDefeatAnimation(target.row, target.col, 'kill')
        removeCharacterFromBattle(target.id, target.isPlayer)
        defeatedNames.push(targetTemplate?.name || target.characterId)
      }
    })

    enemyBuildings.forEach(building => {
      let damage = 0
      if (skill.damageFormula === 'move_based') {
        damage = Math.max(1, Math.floor(attackPower))
      } else if (skill.damageFormula === 'atk_plus_hp_pct' && skill.hpPct) {
        damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
      } else {
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
      }
      
      building.hp -= damage

      if (attacker.totalDamage === undefined) attacker.totalDamage = 0
      attacker.totalDamage += damage
      totalDamage += damage

      triggerShake(building.row, building.col, 'building')
      showFloatingText(building.row, building.col, damage, 'damage')
      triggerSkillEffect(building.row, building.col, attribute, 'medium', skillType)
      damageResults.push(`对【${building.name}】造成${damage}点伤害`)

      trySpawnZombieFromHeart(building)

      if (building.hp <= 0) {
        removeBuildingFromBattle(building.id)
        battleMap.value!.tiles[building.row]![building.col]!.building = null
        destroyedBuildings.push(building.name)
      }
    })

    obstaclePositions.forEach(pos => {
      battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
      triggerShake(pos.row, pos.col, 'character')
    })
    if (obstaclePositions.length > 0) {
      damageResults.push(`清除了${obstaclePositions.length}个障碍物`)
    }

    if (skill.lifesteal && totalDamage > 0) {
      const healAmount = Math.floor(totalDamage * skill.lifesteal)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      damageResults.push(`恢复了${healAmount}点生命值`)
    }

    if (skill.selfHpCost) {
      const hpBase = skill.selfHpCostType === 'current' ? (attacker.hp || 1) : (attacker.maxHp || 100)
      const hpCost = Math.floor(hpBase * skill.selfHpCost)
      attacker.hp = Math.max(1, attacker.hp - hpCost)
      damageResults.push(`消耗了${hpCost}点生命值`)
    }

    if (skill.selfStatusEffects) {
      skill.selfStatusEffects.forEach((effect, index) => {
        const duration = skill.selfStatusEffectsDurations?.[index] || 0
        addStatusToCharacter(attacker, effect, true, duration)
        damageResults.push(`自身获得【${STATUS_CONFIG[effect]?.name || effect}】状态${duration > 0 ? `，持续${duration}回合` : ''}`)
      })
    }

    if (skill.selfMaxHpBuff) {
      const hpBuff = Math.floor(attackPower * skill.selfMaxHpBuff)
      attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff
      attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += hpBuff
      damageResults.push(`生命值上限+${hpBuff}并恢复${hpBuff}生命`)
    }

    if (skill.selfHealPct && attacker.maxHp) {
      const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += healAmount
      damageResults.push(`恢复${healAmount}点生命值`)
      showFloatingText(attacker.row, attacker.col, healAmount, 'heal')
    }

    if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
      const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
      if (negStatuses.length > 0) {
        const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
        toDispel.forEach(status => {
          removeStatusFromCharacter(attacker, status)
          damageResults.push(`驱散【${STATUS_CONFIG[status]?.name || status}】状态`)
        })
      }
    }

    const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length
    if (totalHits > 0) {
      const summary = damageResults.join('，')
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】命中 ${totalHits} 个目标：${summary}`)
    } else {
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标`)
    }
  }

  function processSummonSkill(
    attacker: BattleCharacter,
    skill: Skill,
    targetIds: string[],
    charTemplate: Character | undefined
  ) {
    const map = battleMap.value
    if (!map) return

    // HP threshold check
    if (skill.selfHpThreshold !== undefined) {
      const hpRatio = attacker.hp / (attacker.maxHp || 1)
      if (hpRatio < skill.selfHpThreshold) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用【${skill.name}】失败：生命值不足！`)
        return
      }
    }

    // HP > ATK check for skills that require it
    if (skill.requireHpGtAtk) {
      if (attacker.hp <= attacker.attack) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用【${skill.name}】失败：当前生命值必须大于攻击力！`)
        return
      }
    }

    // Save caster's current HP before deduction for summon HP calculation
    const casterHpBeforeCost = attacker.hp

    // self HP cost deduction
    if (skill.selfHpCost) {
      const hpBase = skill.selfHpCostType === 'current' ? (attacker.hp || 1) : (attacker.maxHp || 100)
      const hpCost = Math.floor(hpBase * skill.selfHpCost)
      attacker.hp = Math.max(1, attacker.hp - hpCost)
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】消耗了${hpCost}点生命值`)
    }

    // Apply self status effects
    if (skill.selfStatusEffects) {
      skill.selfStatusEffects.forEach((effect, index) => {
        const duration = getSelfStatusDuration(skill, index)
        addStatusToCharacter(attacker, effect, true, duration)
        triggerStatusApplyEffect(attacker.row, attacker.col, effect)
        battleLog.value.push(`自身获得【${STATUS_CONFIG[effect]?.name || effect}】状态${duration > 0 ? `，持续${duration}回合` : ''}`)
      })
    }

    const posIds = Array.isArray(targetIds) ? targetIds : [targetIds]
    const summonPositions: { row: number; col: number }[] = []

    for (const posId of posIds) {
      if (posId && posId.startsWith('pos_')) {
        const parts = posId.split('_')
        if (parts.length === 3) {
          const row = parseInt(parts[1])
          const col = parseInt(parts[2])
          if (!isNaN(row) && !isNaN(col)) {
            const hasChar = [...map.players, ...map.enemies].some(x => x.row === row && x.col === col)
            const hasBuilding = map.buildings.some(b => b.row === row && b.col === col)
            const tile = map.tiles[row]?.[col]
            if (!hasChar && !hasBuilding && tile && tile.terrain === 'empty') {
              summonPositions.push({ row, col })
            }
          }
        }
      }
    }

    let summonTemplates: Character[] = []
    if (skill.summonCharacter) {
      const template = HIREABLE_CHARACTERS.find(c => c.id === skill.summonCharacter)
      if (template) {
        // 检查同阵营召唤物数量限制
        if (skill.summonMaxCount && skill.summonCountId) {
          const currentSide = attacker.isPlayer ? map.players : map.enemies
          const existingCount = currentSide.filter(c => c.characterId === skill.summonCountId).length
          const availableSlots = Math.max(0, skill.summonMaxCount - existingCount)
          if (availableSlots <= 0) {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用【${skill.name}】失败：同阵营【杀生樱】数量已达上限${skill.summonMaxCount}个！`)
            return
          }
          // 限制可召唤数量
          const maxSummonCount = Math.min(summonPositions.length, availableSlots)
          summonTemplates = Array(maxSummonCount).fill(template)
        } else {
          summonTemplates = Array(summonPositions.length).fill(template)
        }
      }
    } else if (skill.summonJob) {
      const jobTemplates = HIREABLE_CHARACTERS.filter(c => c.job === skill.summonJob)
      if (jobTemplates.length > 0) {
        for (let i = 0; i < summonPositions.length; i++) {
          summonTemplates.push(jobTemplates[Math.floor(Math.random() * jobTemplates.length)])
        }
      }
    }

    if (summonTemplates.length > 0) {
      const spawnLevel = attacker.level || 1
      const summonedNames: string[] = []

      for (let i = 0; i < summonPositions.length && i < summonTemplates.length; i++) {
        const pos = summonPositions[i]
        const template = summonTemplates[i]
        
        const newChar = createBattleCharacter(template, spawnLevel, pos.row, pos.col, attacker.isPlayer, true, true)
        
        // Strip summon-category skills from summoned clones to prevent infinite recursion
        // Remove summon skills from cooldowns and skills list
        if (newChar.skillCooldowns) {
          for (const skillId of Object.keys(newChar.skillCooldowns)) {
            const sk = SKILL_TEMPLATES[skillId]
            if (sk && sk.category === 'summon') {
              delete newChar.skillCooldowns[skillId]
            }
          }
        }
        // Also strip from the skills array (if accessible)
        if ((newChar as any).skills) {
          (newChar as any).skills = (newChar as any).skills.filter((s: Skill) => s.category !== 'summon')
        }
        
        // Apply summon HP percentage: based on caster's HP before self-cost deduction
        if (skill.summonHpPct !== undefined) {
          const summonHp = Math.max(1, Math.floor(casterHpBeforeCost * skill.summonHpPct))
          newChar.maxHp = summonHp
          newChar.hp = summonHp
        }
        
        // Apply summon status effects to the summoned character
        if (skill.summonStatusEffects) {
          skill.summonStatusEffects.forEach((effect: StatusType) => {
            addStatusToCharacter(newChar, effect, true)
            triggerStatusApplyEffect(pos.row, pos.col, effect)
          })
        }
        
        if (attacker.isPlayer) {
          map.players.push(newChar)
        } else {
          map.enemies.push(newChar)
        }
        
        map.tiles[pos.row][pos.col].character = newChar
        
        // 触发召唤出场特效
        triggerSummonEffect(pos.row, pos.col, skill.attribute || 'light')
        
        const collectibleAtPos = map.collectibles.find(c => c.row === pos.row && c.col === pos.col)
        if (collectibleAtPos) {
          useCollectible(collectibleAtPos.id, newChar.id)
        }
        
        summonedNames.push(template.name)
      }
      
      if (summonedNames.length > 0) {
        const uniqueNames = [...new Set(summonedNames)]
        const nameStr = uniqueNames.length === 1 
          ? `【${uniqueNames[0]}】` 
          : `【${uniqueNames.join('】、【')}】`
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，召唤出${summonedNames.length}个${nameStr}！`)
      }
    }
  }

  function processSingleOrMultiTargetSkill(
    attacker: BattleCharacter,
    skill: Skill,
    targetIds: string[],
    charTemplate: Character | undefined
  ) {
    if (!battleMap.value) return

    const maxTargets = skill.targetCount || 1
    const attackPower = computeAttackPower(attacker)
    const damageResults: string[] = []
    let totalDamage = 0
    const skillAttribute = skill.attribute || 'normal'
    const skillType = skill.type as 'attack' | 'heal' | 'support' | 'summon' | 'special' || 'attack'

    const actualTargets = targetIds.slice(0, maxTargets)

    for (const targetId of actualTargets) {
      let charTargets = attacker.isPlayer
        ? battleMap.value.enemies.filter(e => e.id === targetId)
        : battleMap.value.players.filter(p => p.id === targetId)

      let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

      const obstacleMatch = targetId.match(/^obstacle_(\d+)_(\d+)$/)
      if (obstacleMatch) {
        const row = parseInt(obstacleMatch[1])
        const col = parseInt(obstacleMatch[2])
        if (battleMap.value.tiles[row]?.[col]?.terrain === 'obstacle') {
          battleMap.value.tiles[row]![col]!.terrain = 'empty'
          triggerShake(row, col, 'character')
          triggerSkillEffect(row, col, skillAttribute, 'medium', skillType)
          damageResults.push('清除了一个障碍物')
        }
      } else if (charTargets.length > 0) {
        const target = charTargets[0]
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const defense = computeDefensePower(target)

        let damage = 0
        if (skill.damageFormula === 'atk_plus_hp_pct') {
          const hpPct = skill.hpPct || 0
          damage = Math.max(1, Math.floor((skill.power / 100 * attackPower) + (target.hp * hpPct) - defense))
        } else if (skill.damageFormula === 'move_based') {
          const distance = Math.abs(attacker.row - target.row) + Math.abs(attacker.col - target.col)
          const powerWithDistance = skill.power + (distance * 20)
          damage = Math.max(1, Math.floor((powerWithDistance / 100 * attackPower - defense)))
        } else {
          damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
        }

        target.hp -= damage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage
        totalDamage += damage

        triggerShake(target.row, target.col, 'character')
        triggerHitFlash(target.row, target.col, skillAttribute)
        showFloatingText(target.row, target.col, damage, 'damage', skillAttribute, true)
        triggerSkillEffect(target.row, target.col, skillAttribute, 'medium', skillType, '指定', attacker.row, attacker.col)
        
        // 攻击投射物
        const projType = getProjectileTypeForSkill(skill)
        if (projType) {
          triggerProjectile(attacker.row, attacker.col, target.row, target.col, projType, skillAttribute)
        }

        damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

        if (skill.statusEffect) {
          addStatusToCharacter(target, skill.statusEffect, true, skill.statusEffectDuration || 0)
          triggerStatusApplyEffect(target.row, target.col, skill.statusEffect)
          damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[skill.statusEffect]?.name || skill.statusEffect}】状态`)
        }
        if (skill.statusEffects && skill.statusEffects.length > 0) {
          skill.statusEffects.forEach((status, index) => {
            const duration = skill.statusEffectsDurations?.[index] || 0
            addStatusToCharacter(target, status, true, duration)
            triggerStatusApplyEffect(target.row, target.col, status)
            damageResults.push(`使【${targetTemplate?.name || target.characterId}】陷入【${STATUS_CONFIG[status]?.name || status}】状态`)
          })
        }

        if (skill.stealBuff) {
          const targetPositiveStatuses = target.statuses.filter(s => STATUS_CONFIG[s.type]?.tag === 'positive')
          if (targetPositiveStatuses.length > 0) {
            const randomIndex = Math.floor(Math.random() * targetPositiveStatuses.length)
            const stolenStatus = targetPositiveStatuses[randomIndex]
            
            const statusIdx = target.statuses.findIndex(s => s.type === stolenStatus.type)
            if (statusIdx !== -1) {
              target.statuses.splice(statusIdx, 1)
              addStatusToCharacter(attacker, stolenStatus.type, true, stolenStatus.duration)
              damageResults.push(`偷取了【${targetTemplate?.name || target.characterId}】的【${STATUS_CONFIG[stolenStatus.type]?.name || stolenStatus.type}】状态`)
            }
          }
        }

        if (target.hp <= 0) {
          triggerDefeatAnimation(target.row, target.col, 'kill')
          removeCharacterFromBattle(target.id, target.isPlayer)
          damageResults.push(`【${targetTemplate?.name || target.characterId}】被击败`)
        }
      } else if (buildingTargets.length > 0) {
        const targetBuilding = buildingTargets[0]

        let damage = 0
        if (skill.damageFormula === 'atk_plus_hp_pct') {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
        } else {
          damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
        }

        targetBuilding.hp -= damage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage
        totalDamage += damage

        triggerShake(targetBuilding.row, targetBuilding.col, 'building')
        showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')
        triggerSkillEffect(targetBuilding.row, targetBuilding.col, skillAttribute, 'medium', skillType)

        damageResults.push(`对【${targetBuilding.name}】造成${damage}点伤害`)

        trySpawnZombieFromHeart(targetBuilding)

        if (targetBuilding.hp <= 0) {
          removeBuildingFromBattle(targetBuilding.id)
          battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
          damageResults.push(`【${targetBuilding.name}】被摧毁`)
        }
      }
    }

    if (skill.lifesteal && totalDamage > 0) {
      const healAmount = Math.floor(totalDamage * skill.lifesteal)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      damageResults.push(`恢复了${healAmount}点生命值`)
    }

    if (actualTargets.length > 0 && damageResults.length > 0) {
      const summary = damageResults.join('，')
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${summary}！`)
    } else if (actualTargets.length > 0) {
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有命中有效目标`)
    }

    if (skill.summonZombie) {
      const spawnRange = 2
      const spawnPositions: { row: number; col: number }[] = []
      for (let r = -spawnRange; r <= spawnRange; r++) {
        for (let c = -spawnRange; c <= spawnRange; c++) {
          const nr = attacker.row + r
          const nc = attacker.col + c
          if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
            if (r !== 0 || c !== 0) {
              if (Math.abs(r) + Math.abs(c) <= spawnRange) {
                const tile = battleMap.value.tiles[nr][nc]
                const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some(ch => ch.row === nr && ch.col === nc)
                const hasBuilding = battleMap.value.buildings.some(b => b.row === nr && b.col === nc)
                if (tile.terrain === 'empty' && !hasCharacter && !hasBuilding) {
                  spawnPositions.push({ row: nr, col: nc })
                }
              }
            }
          }
        }
      }
      
      if (spawnPositions.length > 0) {
        const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)]
        const zombieTemplate = HIREABLE_CHARACTERS.find(c => c.id === 'ordinary_zombie')
        if (zombieTemplate) {
          const spawnLevel = attacker.level || 1
          const newZombie = createBattleCharacter(zombieTemplate, spawnLevel, spawnPos.row, spawnPos.col, attacker.isPlayer, true, true)

          if (attacker.isPlayer) {
            battleMap.value.players.push(newZombie)
          } else {
            battleMap.value.enemies.push(newZombie)
          }

          battleMap.value.tiles[spawnPos.row][spawnPos.col].character = newZombie
        
          const collectibleAtZombiePos = battleMap.value.collectibles.find(c => c.row === spawnPos.row && c.col === spawnPos.col)
          if (collectibleAtZombiePos) {
            useCollectible(collectibleAtZombiePos.id, newZombie.id)
          }
          
          battleLog.value.push('召唤了1只普通丧尸')
        }
      }
    }

    if (skill.selfDefeat) {
      triggerDefeatAnimation(attacker.row, attacker.col, 'self')
      attacker.hp = 0
      removeCharacterFromBattle(attacker.id, attacker.isPlayer)
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能后战败退场！`)
    }

    if (skill.selfHpCost && attacker.maxHp) {
      const hpBase = skill.selfHpCostType === 'current' ? (attacker.hp || 1) : (attacker.maxHp || 100)
      const hpCost = Math.floor(hpBase * skill.selfHpCost)
      attacker.hp = Math.max(1, attacker.hp - hpCost)
      damageResults.push(`消耗了${hpCost}点生命值`)
    }

    if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
      skill.selfStatusEffects.forEach((status, index) => {
        const duration = getSelfStatusDuration(skill, index)
        addStatusToCharacter(attacker, status, true, duration)
        triggerStatusApplyEffect(attacker.row, attacker.col, status)
        damageResults.push(`自身获得【${STATUS_CONFIG[status]?.name || status}】状态${duration > 0 ? `，持续${duration}回合` : ''}`)
      })
      const summary = damageResults.join('，')
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${summary}！`)
    }

    if (skill.clearPositiveStatus && actualTargets.length > 0 && battleMap.value) {
      const map = battleMap.value
      actualTargets.forEach(tid => {
        const allChars = [...map.players, ...map.enemies]
        const targetChar = allChars.find(c => c.id === tid)
        if (targetChar) {
          const dispelled: string[] = []
          POSITIVE_STATUSES.forEach(status => {
            if (hasStatus(targetChar, status)) {
              removeStatusFromCharacter(targetChar, status)
              dispelled.push(STATUS_CONFIG[status]?.name || status)
            }
          })
          if (dispelled.length > 0) {
            battleLog.value.push(`驱散了【${targetChar.characterId}】的【${dispelled.join('、')}】状态`)
          }
        }
      })
    }

    if (skill.createSnowTerrain && actualTargets.length > 0 && battleMap.value) {
      const map = battleMap.value
      actualTargets.forEach(tid => {
        const allChars = [...map.players, ...map.enemies]
        const targetChar = allChars.find(c => c.id === tid)
        if (targetChar) {
          map.tiles[targetChar.row]![targetChar.col]!.terrain = 'snow'
          damageResults.push(`在【${targetChar.characterId}】脚下产生了雪地`)
        }
      })
    }

    if (skill.selfMaxHpBuff && attacker.maxHp) {
      const hpBuff = Math.floor(computeAttackPower(attacker) * skill.selfMaxHpBuff)
      attacker.maxHp += hpBuff
      attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += hpBuff
      damageResults.push(`生命值上限+${hpBuff}并恢复${hpBuff}生命`)
    }

    if (skill.selfHealPct && attacker.maxHp) {
      const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += healAmount
      damageResults.push(`恢复${healAmount}点生命值`)
      showFloatingText(attacker.row, attacker.col, healAmount, 'heal')
    }

    if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
      const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
      if (negStatuses.length > 0) {
        const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
        toDispel.forEach(status => {
          removeStatusFromCharacter(attacker, status)
          damageResults.push(`驱散【${STATUS_CONFIG[status]?.name || status}】状态`)
        })
      }
    }
  }
  
  // 飘字特效相关
  interface FloatingText {
    id: string
    row: number
    col: number
    value: number
    type: 'damage' | 'heal' | 'mp'
    attribute?: Attribute
    isShaking?: boolean
    timestamp: number
  }
  const floatingTexts = ref<FloatingText[]>([])
  
  function showFloatingText(row: number, col: number, value: number, type: 'damage' | 'heal' | 'mp', attribute?: Attribute, isShaking?: boolean) {
    const textId = `float_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // 伤害飘字默认启用震动效果
    const shouldShake = type === 'damage' ? (isShaking !== false) : false
    floatingTexts.value.push({
      id: textId,
      row,
      col,
      value,
      type,
      attribute,
      isShaking: shouldShake,
      timestamp: Date.now()
    })
    setTimeout(() => {
      const idx = floatingTexts.value.findIndex(t => t.id === textId)
      if (idx !== -1) {
        floatingTexts.value.splice(idx, 1)
      }
    }, 1200)
  }
  
  // ========== 新视觉特效系统 ==========
  
  // 1. 受击闪白 + 血条冲击反馈
  interface HitFlashTarget {
    id: string
    row: number
    col: number
    timestamp: number
  }
  const hitFlashTargets = ref<HitFlashTarget[]>([])
  
  function triggerHitFlash(row: number, col: number, attribute: Attribute = 'normal') {
    const id = `hitflash_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    hitFlashTargets.value.push({ id, row, col, timestamp: Date.now() })
    // 触发粒子飞溅特效
    triggerHitSpark(row, col, attribute)
    setTimeout(() => {
      const idx = hitFlashTargets.value.findIndex(t => t.id === id)
      if (idx !== -1) hitFlashTargets.value.splice(idx, 1)
    }, 400)
  }
  
  // 2. 击杀/退场动画
  interface DefeatRecord {
    id: string
    row: number
    col: number
    defeatType: 'kill' | 'self' // kill: 被击败退场, self: 主动退场（自爆/中毒/燃烧）
    timestamp: number
  }
  const defeatRecords = ref<DefeatRecord[]>([])
  
  function triggerDefeatAnimation(row: number, col: number, defeatType: 'kill' | 'self') {
    const id = `defeat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    defeatRecords.value.push({ id, row, col, defeatType, timestamp: Date.now() })
    setTimeout(() => {
      const idx = defeatRecords.value.findIndex(d => d.id === id)
      if (idx !== -1) defeatRecords.value.splice(idx, 1)
    }, 1500)
  }
  
  // 3. 攻击轨迹投射物动画
  interface Projectile {
    id: string
    fromRow: number
    fromCol: number
    toRow: number
    toCol: number
    type: 'arrow' | 'fireball' | 'ice-spike' | 'dark-bolt' | 'metal-blade' | 'fist'
    color: string
    duration: number
    timestamp: number
  }
  const projectiles = ref<Projectile[]>([])
  
  function triggerProjectile(fromRow: number, fromCol: number, toRow: number, toCol: number, type: Projectile['type'], attribute: Attribute = 'normal') {
    const color = ATTRIBUTE_CONFIG[attribute]?.color || '#eaeaea'
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    projectiles.value.push({
      id, fromRow, fromCol, toRow, toCol,
      type, color,
      duration: Math.max(200, Math.abs(toRow - fromRow) * 80 + Math.abs(toCol - fromCol) * 80),
      timestamp: Date.now()
    })
    setTimeout(() => {
      const idx = projectiles.value.findIndex(p => p.id === id)
      if (idx !== -1) projectiles.value.splice(idx, 1)
    }, 600)
  }
  
  // 4. 状态施加视觉反馈
  interface StatusApplyEffect {
    id: string
    row: number
    col: number
    statusType: StatusType
    isPositive: boolean
    timestamp: number
  }
  const statusApplyEffects = ref<StatusApplyEffect[]>([])
  
  function triggerStatusApplyEffect(row: number, col: number, statusType: StatusType) {
    const isPositive = POSITIVE_STATUSES.includes(statusType)
    const id = `status_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    statusApplyEffects.value.push({ id, row, col, statusType, isPositive, timestamp: Date.now() })
    setTimeout(() => {
      const idx = statusApplyEffects.value.findIndex(s => s.id === id)
      if (idx !== -1) statusApplyEffects.value.splice(idx, 1)
    }, 1200)
  }
  
  // 5. 召唤出场特效
  interface SummonEffect {
    id: string
    row: number
    col: number
    attribute: Attribute
    timestamp: number
  }
  const summonEffects = ref<SummonEffect[]>([])
  
  function triggerSummonEffect(row: number, col: number, attribute: Attribute = 'light') {
    const id = `summon_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    summonEffects.value.push({ id, row, col, attribute, timestamp: Date.now() })
    setTimeout(() => {
      const idx = summonEffects.value.findIndex(s => s.id === id)
      if (idx !== -1) summonEffects.value.splice(idx, 1)
    }, 1500)
  }
  
  // 6. 移动轨迹粒子
  interface MoveTrailEffect {
    id: string
    particles: { row: number; col: number; delay: number }[]
    isPlayer: boolean
    timestamp: number
  }
  const moveTrailEffects = ref<MoveTrailEffect[]>([])
  
  function triggerMoveTrail(fromRow: number, fromCol: number, toRow: number, toCol: number, isPlayer: boolean) {
    const distance = Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol)
    if (distance === 0) return
    
    // 沿路径生成粒子，首尾分别在起点和终点格子正中间
    const particleCount = Math.min(distance * 2, 8)
    const particles: { row: number; col: number; delay: number }[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1)
      const row = fromRow + (toRow - fromRow) * t
      const col = fromCol + (toCol - fromCol) * t
      particles.push({
        row,
        col,
        delay: (i / (particleCount - 1)) * 0.15
      })
    }
    
    const id = `movetrail_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    moveTrailEffects.value.push({ id, particles, isPlayer, timestamp: Date.now() })
    setTimeout(() => {
      const idx = moveTrailEffects.value.findIndex(t => t.id === id)
      if (idx !== -1) moveTrailEffects.value.splice(idx, 1)
    }, 600)
  }
  
  // 7. 受击粒子飞溅特效
  interface HitSparkParticle {
    dx: number
    dy: number
    size: number
    delay: number
  }
  interface HitSparkEffect {
    id: string
    row: number
    col: number
    attribute: Attribute
    particles: HitSparkParticle[]
    timestamp: number
  }
  const hitSparkEffects = ref<HitSparkEffect[]>([])
  
  function triggerHitSpark(row: number, col: number, attribute: Attribute = 'normal') {
    const particleCount = 8
    const particles: HitSparkParticle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5
      const distance = 15 + Math.random() * 20
      particles.push({
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.1
      })
    }
    
    const id = `hitspark_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    hitSparkEffects.value.push({ id, row, col, attribute, particles, timestamp: Date.now() })
    setTimeout(() => {
      const idx = hitSparkEffects.value.findIndex(s => s.id === id)
      if (idx !== -1) hitSparkEffects.value.splice(idx, 1)
    }, 500)
  }
  
  // 投射物类型判断：指定哪些技能类型有投射物
  function getProjectileTypeForSkill(skill: Skill | null): Projectile['type'] | null {
    if (!skill) return null
    // 指定category的攻击技能有投射物
    if (skill.category !== '指定' && skill.category !== 'aoe') return null
    if (skill.type !== 'attack') return null
    
    const attr = skill.attribute || 'normal'
    const effectType = skill.effectType
    
    // 根据属性和特效类型决定投射物样式
    if (effectType === 'fire' || attr === 'fire') return 'fireball'
    if (effectType === 'ice' || attr === 'ice' || attr === 'water') return 'ice-spike'
    if (effectType === 'thunder') return 'metal-blade'
    if (effectType === 'wind' || attr === 'wind') return 'arrow'
    if (effectType === 'shadow' || attr === 'dark') return 'dark-bolt'
    if (attr === 'metal') return 'metal-blade'
    if (attr === 'wood') return 'arrow'
    if (attr === 'earth') return 'fist'
    return 'arrow' // 默认使用箭矢
  }

  // 计算轰炸类技能的最佳中心位置
  function findBestBombingCenter(
    attacker: BattleCharacter,
    skill: Skill
  ): { row: number; col: number } | null {
    if (!battleMap.value) return null
    const range = skill.range || 4
    const areaRange = skill.areaRange || 1
    const enemies = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
    const buildings = battleMap.value.buildings
    let maxAreaDamage = 0
    let bestCenterPos: { row: number; col: number } | null = null

    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        const dist = Math.abs(dr) + Math.abs(dc)
        if (dist > 0 && dist <= range) {
          const centerRow = attacker.row + dr
          const centerCol = attacker.col + dc
          if (centerRow >= 0 && centerRow < battleMap.value.height && centerCol >= 0 && centerCol < battleMap.value.width) {
            let areaDamage = 0
            for (const enemy of enemies) {
              const enemyDist = Math.abs(enemy.row - centerRow) + Math.abs(enemy.col - centerCol)
              if (enemyDist <= areaRange) {
                const defense = computeDefensePower(enemy)
                const attackPower = computeAttackPower(attacker)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
                areaDamage += damage
              }
            }
            for (const building of buildings) {
              const buildingDist = Math.abs(building.row - centerRow) + Math.abs(building.col - centerCol)
              if (buildingDist <= areaRange && building.isPlayer !== attacker.isPlayer) {
                const attackPower = computeAttackPower(attacker)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
                areaDamage += damage
              }
            }
            if (areaDamage > maxAreaDamage) {
              maxAreaDamage = areaDamage
              bestCenterPos = { row: centerRow, col: centerCol }
            }
          }
        }
      }
    }
    return bestCenterPos
  }
  
  // 普通攻击使用的投射物
  function getProjectileTypeForNormalAttack(attribute: Attribute): Projectile['type'] {
    if (attribute === 'fire') return 'fireball'
    if (attribute === 'ice' || attribute === 'water') return 'ice-spike'
    if (attribute === 'dark') return 'dark-bolt'
    if (attribute === 'metal') return 'metal-blade'
    return 'fist'
  }
  
  // ========== 阵营指令相关
  type FactionCommand = 'attack' | 'gather'
  const factionCommand = ref<FactionCommand>('attack')
  const gatheringPoints = ref<{ row: number; col: number }[]>([])
  const isSelectingGatherPoints = ref(false)
  
  // 设置阵营指令
  function setFactionCommand(command: FactionCommand) {
    factionCommand.value = command
    if (command === 'gather') {
      isSelectingGatherPoints.value = true
      gatheringPoints.value = []
      battleLog.value.push('请选择1-4个格子作为集结点')
    } else {
      isSelectingGatherPoints.value = false
      battleLog.value.push('全军出击指令已下达')
    }
  }
  
  // 切换集结点选择状态
  function toggleGatherPointSelection(active: boolean) {
    isSelectingGatherPoints.value = active
  }
  
  // 添加集结点
  function addGatheringPoint(row: number, col: number) {
    if (gatheringPoints.value.length >= 4) {
      battleLog.value.push('最多只能选择4个集结点')
      return false
    }
    if (gatheringPoints.value.some(p => p.row === row && p.col === col)) {
      battleLog.value.push('该位置已被选中')
      return false
    }
    gatheringPoints.value.push({ row, col })
    battleLog.value.push(`集结点 (${row}, ${col}) 已添加 (${gatheringPoints.value.length}/4)`)
    return true
  }
  
  // 移除集结点
  function removeGatheringPoint(row: number, col: number) {
    gatheringPoints.value = gatheringPoints.value.filter(p => !(p.row === row && p.col === col))
  }
  
  // 确认集结点选择
  function confirmGatheringPoints() {
    if (gatheringPoints.value.length === 0) {
      battleLog.value.push('请至少选择1个集结点')
      return false
    }
    isSelectingGatherPoints.value = false
    battleLog.value.push('全军集结指令已下达，将向指定位置集结')
    return true
  }

  const aliveCharacters = computed(() => {
    if (!player.value) return []
    return player.value.characters.filter(c => c.hp > 0)
  })

  const totalAttack = computed(() => currentCharacter.value?.attack || 0)
  const totalDefense = computed(() => currentCharacter.value?.defense || 0)
  const totalMaxHp = computed(() => currentCharacter.value?.maxHp || 0)
  const totalMaxMp = computed(() => currentCharacter.value?.maxMp || 0)
  const totalMoveRange = computed(() => currentCharacter.value?.moveRange || 0)
  const totalAttackRange = computed(() => currentCharacter.value?.attackRange || 0)

  async function initGame() {
    const characters = INITIAL_CHARACTERS.map(createCharacterFromTemplate)
    const inventory: Item[] = [
      { ...EQUIPMENT_TEMPLATES.weapons[0], id: 'eq_1', count: 1, rarity: getRandomRarity() },
      { ...EQUIPMENT_TEMPLATES.armors[0], id: 'eq_2', count: 1, rarity: getRandomRarity() },
      { ...CHEST_CONFIG.wanwu, id: 'chest_1', count: 1, subtype: 'chest', type: 'consumable' },
      { ...CONSUMABLE_TEMPLATES[0], id: 'cons_1', count: 5 },
      { ...CONSUMABLE_TEMPLATES[1], id: 'cons_2', count: 3 },
    ]

    player.value = {
      id: 'player_1',
      name: '玩家',
      gold: 15000,
      day: 1,
      phase: 'day',
      characters,
      inventory,
      homeGrid: createInitialHomeGrid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await saveGame()
  }

  async function loadGame(tryExternal = true): Promise<{ success: boolean; error?: string }> {
    let saveData = uni.getStorageSync('sangshi_save')
    
    // Android 先尝试外部存储，再用内部存储
    if (tryExternal && uni.getSystemInfoSync().platform === 'android') {
      try {
        const result = await loadGameFromExternalStorage('sangshi_save')
        if (result.success && result.content) {
          saveData = result.content
          console.log('从外部存储恢复存档')
        }
      } catch (e) {
        console.error('从外部存储恢复存档失败:', e)
        return { success: false, error: '外部存储读取失败: ' + (e as Error).message?.substring(0, 100) }
      }
    }
    
    if (saveData) {
      try {
        const parsed = typeof saveData === 'string' ? JSON.parse(saveData) : saveData
        console.log('加载存档:', parsed)
        
        if (!parsed.player) {
          console.error('存档中没有 player 数据')
          return { success: false, error: '存档缺少 player 数据' }
        }
        
        // 确保 characters 存在
        if (!parsed.player.characters) {
          parsed.player.characters = []
        }
        
        // 处理 homeGrid
        if (parsed.player.homeGrid) {
          // 检查是否是简化格式（一维数组）还是旧格式（二维数组）
          if (Array.isArray(parsed.player.homeGrid[0])) {
            // 旧格式，先移除 icon 等字段
            parsed.player.characters = parsed.player.characters.map((char: any) => {
              if (!char.baseMaxHp) char.baseMaxHp = char.maxHp
              if (!char.baseMaxMp) char.baseMaxMp = char.maxMp
              if (!char.baseAttack) char.baseAttack = char.attack
              if (!char.baseDefense) char.baseDefense = char.defense
              if (!char.baseMoveRange) char.baseMoveRange = char.moveRange
              if (!char.baseAttackRange) char.baseAttackRange = char.attackRange
              
              // hp 和 mp 恢复到满值
              char.hp = char.maxHp
              char.mp = char.maxMp
              
              // 恢复 avatar（从角色 id 重新生成）
              if (!char.avatar) {
                char.avatar = getAvatarPath(char.id, char.faction)
              }
              
              // 恢复 isPlayerOwned（玩家角色均为 true）
              char.isPlayerOwned = true
              
              // 恢复 faction 和 job（战斗灵气煞气系统需要）
              if (!char.faction || !char.job) {
                const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
                const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
                const templateChar = initialChar || hireableChar
                if (templateChar) {
                  char.faction = templateChar.faction
                  char.job = templateChar.job
                }
              }
              
              // 处理技能：移除 icon 字段，确保兼容性
              if (char.skills) {
                char.skills = char.skills.map((skill: any) => {
                  const { icon, ...cleanSkill } = skill
                  return cleanSkill
                })
              }
              
              return char
            })
          } else {
            // 新格式，还原 homeGrid
            const fullHomeGrid = createInitialHomeGrid()
            parsed.player.homeGrid.forEach((cell: any) => {
              if (cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9) {
                fullHomeGrid[cell.row][cell.col].building = cell.building
              }
            })
            parsed.player.homeGrid = fullHomeGrid
            
            // 恢复 hp/mp 到满值，恢复 avatar，恢复 isPlayerOwned，恢复 attribute
            // 技能从 CHARACTER_SKILLS / buildSkillsForCharacterId 装配（不读取存档中的技能信息，这样版本更新新增技能可以自动生效）
            parsed.player.characters = parsed.player.characters.map((char: any) => {
              if (!char.baseMaxHp) char.baseMaxHp = char.maxHp
              if (!char.baseMaxMp) char.baseMaxMp = char.maxMp
              if (!char.baseAttack) char.baseAttack = char.attack
              if (!char.baseDefense) char.baseDefense = char.defense
              if (!char.baseMoveRange) char.baseMoveRange = char.moveRange
              if (!char.baseAttackRange) char.baseAttackRange = char.attackRange
              
              // hp 和 mp 恢复到满值
              char.hp = char.maxHp
              char.mp = char.maxMp
              
              // 恢复 avatar（从角色 id 重新生成）
              if (!char.avatar) {
                char.avatar = getAvatarPath(char.id, char.faction)
              }
              
              // 恢复 isPlayerOwned（玩家角色均为 true）
              char.isPlayerOwned = true
              
              // 恢复 attribute（属性系统为新增字段，旧存档可能缺失，从模板中找回）
              if (!char.attribute) {
                const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
                const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
                const templateChar = initialChar || hireableChar
                char.attribute = templateChar?.attribute || 'normal'
              }
              
              // 恢复 faction 和 job（战斗灵气煞气系统需要）
              if (!char.faction || !char.job) {
                const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
                const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
                const templateChar = initialChar || hireableChar
                if (templateChar) {
                  char.faction = templateChar.faction
                  char.job = templateChar.job
                }
              }
              
              // 从 CHARACTER_SKILLS 装配技能：忽略存档中的 skills 字段，直接查表生成
              // 这样版本更新新增的技能可以在旧存档中自动生效
              char.skills = buildFullSkillsForCharacter(char.id, char.equipment)
              
              return char
            })
          }
        } else {
          // 没有 homeGrid，创建初始的
          parsed.player.homeGrid = createInitialHomeGrid()
          
          // 也为这些角色装配技能
          parsed.player.characters = parsed.player.characters.map((char: any) => {
            if (!char.attribute) {
              const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
              const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
              const templateChar = initialChar || hireableChar
              char.attribute = templateChar?.attribute || 'normal'
            }
            char.skills = buildFullSkillsForCharacter(char.id, char.equipment)
            return char
          })
        }
        
        console.log('处理后的 player:', parsed.player)
        player.value = parsed.player
        
        return { success: true }
      } catch (e) {
        console.error('加载存档失败:', e)
        return { success: false, error: (e as Error).message?.substring(0, 100) || '加载存档时发生未知错误' }
      }
    }
    return { success: false, error: '未找到存档数据' }
  }

  async function saveGame() {
    if (player.value) {
      // 保存前重置所有角色的技能冷却（因为战斗状态不需要保存）
      player.value.characters.forEach(char => {
        char.skills.forEach(skill => {
          skill.currentCooldown = 0
        })
      })
      
      player.value.updatedAt = Date.now()
      
      // 创建简化的玩家数据用于保存
      const simplifiedPlayer = JSON.parse(JSON.stringify(player.value))
      
      // 1. 简化 homeGrid：只保存有建筑的位置
      simplifiedPlayer.homeGrid = simplifiedPlayer.homeGrid
        .flatMap((row: any, rowIndex: number) => 
          row.filter((cell: any) => cell.building !== null)
             .map((cell: any) => ({ row: cell.row, col: cell.col, building: cell.building }))
        )
      
      // 2. 简化角色：恢复hp/mp到满值，删除avatar字段，技能从角色-技能表恢复（不保存技能）
      simplifiedPlayer.characters.forEach((char: any) => {
        // 恢复到满血满蓝：hp = maxHp, mp = maxMp
        char.hp = char.maxHp
        char.mp = char.maxMp
        // 删除 avatar 字段，加载时通过 getAvatarPath 从 id 重新生成
        delete char.avatar
        // 删除 isPlayerOwned 字段，加载时默认设为 true
        delete char.isPlayerOwned
        // 不保存技能信息：加载时从 CHARACTER_SKILLS / buildSkillsForCharacterId 恢复
        delete char.skills
      })
      
      const saveData = {
        version: '3.0',
        savedAt: Date.now(),
        player: simplifiedPlayer,
      }
      
      uni.setStorageSync('sangshi_save', JSON.stringify(saveData))
      
      if (uni.getSystemInfoSync().platform === 'android') {
        try {
          const result = await saveGameToExternalStorage('sangshi_save', saveData)
          console.log('外部存储备份:', result)
        } catch (e) {
          console.error('外部存储备份失败:', e)
        }
      }
    }
  }

  function hasSaveData(): boolean {
    return !!uni.getStorageSync('sangshi_save')
  }

  interface SaveSlot {
    id: number
    name: string
    savedAt: number
    version: string
    player: Player | null
  }

  async function getSaveSlots(): Promise<SaveSlot[]> {
    const slots: SaveSlot[] = []
    for (let i = 1; i <= 3; i++) {
      const key = `sangshi_save_${i}`
      let saveData = uni.getStorageSync(key)
      
      // Android 先尝试从外部存储读取
      if (!saveData && uni.getSystemInfoSync().platform === 'android') {
        try {
          const result = await loadGameFromExternalStorage(key)
          if (result.success && result.content) {
            saveData = result.content
            console.log('从外部存储读取存档槽:', i)
          }
        } catch (e) {
          console.error('从外部存储读取存档槽失败:', e)
        }
      }
      
      if (saveData) {
        try {
          const parsed = JSON.parse(saveData)
          slots.push({
            id: i,
            name: parsed.name || `存档 ${i}`,
            savedAt: parsed.savedAt,
            version: parsed.version || '1.0',
            player: parsed.player
          })
        } catch (e) {
          console.error(`读取存档 ${i} 失败:`, e)
          slots.push({ id: i, name: '', savedAt: 0, version: '1.0', player: null })
        }
      } else {
        slots.push({ id: i, name: '', savedAt: 0, version: '1.0', player: null })
      }
    }
    return slots
  }

  async function saveToSlot(slotId: number, name: string): Promise<boolean> {
    if (!player.value || slotId < 1 || slotId > 3) return false
    
    // 保存前重置所有角色的技能冷却（因为战斗状态不需要保存）
    player.value.characters.forEach(char => {
      char.skills.forEach(skill => {
        skill.currentCooldown = 0
      })
    })
    
    player.value.updatedAt = Date.now()
    
    // 创建简化的玩家数据用于保存
    const simplifiedPlayer = JSON.parse(JSON.stringify(player.value))
    
    // 1. 简化 homeGrid：只保存有建筑的位置
    simplifiedPlayer.homeGrid = simplifiedPlayer.homeGrid
      .flatMap((row: any, rowIndex: number) => 
        row.filter((cell: any) => cell.building !== null)
           .map((cell: any) => ({ row: cell.row, col: cell.col, building: cell.building }))
      )
    
    // 2. 简化角色：恢复hp/mp到满值，删除avatar字段，技能从角色-技能表恢复（不保存技能）
    simplifiedPlayer.characters.forEach((char: any) => {
      // 恢复到满血满蓝：hp = maxHp, mp = maxMp
      char.hp = char.maxHp
      char.mp = char.maxMp
      // 删除 avatar 字段，加载时通过 getAvatarPath 从 id 重新生成
      delete char.avatar
      // 删除 isPlayerOwned 字段，加载时默认设为 true
      delete char.isPlayerOwned
      // 不保存技能信息：加载时从 CHARACTER_SKILLS / buildSkillsForCharacterId 恢复
      delete char.skills
    })
    
    const saveData = {
      name: name || `存档 ${slotId}`,
      version: '3.0',
      savedAt: Date.now(),
      player: simplifiedPlayer
    }
    uni.setStorageSync(`sangshi_save_${slotId}`, JSON.stringify(saveData))
    
    if (uni.getSystemInfoSync().platform === 'android') {
      try {
        await saveGameToExternalStorage(`sangshi_save_${slotId}`, saveData)
      } catch (e) {
        console.error('外部存储备份存档槽失败:', e)
      }
    }
    return true
  }

  async function loadFromSlot(slotId: number): Promise<{ success: boolean; error?: string }> {
    if (slotId < 1 || slotId > 3) return { success: false, error: '无效的存档槽号' }
    let saveData = uni.getStorageSync(`sangshi_save_${slotId}`)
    
    // Android 先尝试外部存储
    if (uni.getSystemInfoSync().platform === 'android') {
      try {
        const result = await loadGameFromExternalStorage(`sangshi_save_${slotId}`)
        if (result.success && result.content) {
          saveData = result.content
          console.log('从外部存储恢复存档槽:', slotId)
        }
      } catch (e) {
        console.error('从外部存储恢复存档槽失败，尝试本地存储:', e)
        // 不直接返回，继续尝试本地存储
      }
    }
    
    if (saveData) {
      try {
        const parsed = typeof saveData === 'string' ? JSON.parse(saveData) : saveData
        console.log('加载存档:', parsed)
        
        if (!parsed.player) {
          console.error('存档中没有 player 数据')
          return { success: false, error: '存档缺少 player 数据' }
        }
        
        // 确保 characters 存在
        if (!parsed.player.characters) {
          parsed.player.characters = []
        }
        
        // 处理 homeGrid
        if (parsed.player.homeGrid) {
          // 检查是否是简化格式（一维数组）还是旧格式（二维数组）
          if (Array.isArray(parsed.player.homeGrid[0])) {
            // 旧格式，先移除 icon 等字段
            parsed.player.characters = parsed.player.characters.map((char: any) => {
              if (!char.baseMaxHp) char.baseMaxHp = char.maxHp
              if (!char.baseMaxMp) char.baseMaxMp = char.maxMp
              if (!char.baseAttack) char.baseAttack = char.attack
              if (!char.baseDefense) char.baseDefense = char.defense
              if (!char.baseMoveRange) char.baseMoveRange = char.moveRange
              if (!char.baseAttackRange) char.baseAttackRange = char.attackRange
              
              // hp 和 mp 恢复到满值
              char.hp = char.maxHp
              char.mp = char.maxMp
              
              // 恢复 avatar（从角色 id 重新生成）
              if (!char.avatar) {
                char.avatar = getAvatarPath(char.id, char.faction)
              }
              
              // 恢复 isPlayerOwned（玩家角色均为 true）
              char.isPlayerOwned = true
              
              // 恢复 faction 和 job（战斗灵气煞气系统需要）
              if (!char.faction || !char.job) {
                const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
                const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
                const templateChar = initialChar || hireableChar
                if (templateChar) {
                  char.faction = templateChar.faction
                  char.job = templateChar.job
                }
              }
              
              // 处理技能：移除 icon 字段，确保兼容性
              if (char.skills) {
                char.skills = char.skills.map((skill: any) => {
                  const { icon, ...cleanSkill } = skill
                  return cleanSkill
                })
              }
              
              return char
            })
          } else {
            // 新格式，还原 homeGrid
            const fullHomeGrid = createInitialHomeGrid()
            parsed.player.homeGrid.forEach((cell: any) => {
              if (cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9) {
                fullHomeGrid[cell.row][cell.col].building = cell.building
              }
            })
            parsed.player.homeGrid = fullHomeGrid
            
            // 恢复 hp/mp 到满值，恢复 avatar，恢复 isPlayerOwned，恢复 attribute
            // 技能从 CHARACTER_SKILLS / buildSkillsForCharacterId 装配（不读取存档中的技能信息）
            parsed.player.characters = parsed.player.characters.map((char: any) => {
              if (!char.baseMaxHp) char.baseMaxHp = char.maxHp
              if (!char.baseMaxMp) char.baseMaxMp = char.maxMp
              if (!char.baseAttack) char.baseAttack = char.attack
              if (!char.baseDefense) char.baseDefense = char.defense
              if (!char.baseMoveRange) char.baseMoveRange = char.moveRange
              if (!char.baseAttackRange) char.baseAttackRange = char.attackRange
              
              // hp 和 mp 恢复到满值
              char.hp = char.maxHp
              char.mp = char.maxMp
              
              // 恢复 avatar（从角色 id 重新生成）
              if (!char.avatar) {
                char.avatar = getAvatarPath(char.id, char.faction)
              }
              
              // 恢复 isPlayerOwned（玩家角色均为 true）
              char.isPlayerOwned = true
              
              // 恢复 attribute（属性系统为新增字段，旧存档可能缺失，从模板中找回）
              if (!char.attribute) {
                const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
                const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
                const templateChar = initialChar || hireableChar
                char.attribute = templateChar?.attribute || 'normal'
              }
              
              // 从 CHARACTER_SKILLS 装配技能：忽略存档中的 skills 字段
              char.skills = buildFullSkillsForCharacter(char.id, char.equipment)
              
              return char
            })
          }
        } else {
          // 没有 homeGrid，创建初始的
          parsed.player.homeGrid = createInitialHomeGrid()
          
          // 也为这些角色装配技能
          parsed.player.characters = parsed.player.characters.map((char: any) => {
            if (!char.attribute) {
              const initialChar = INITIAL_CHARACTERS.find((c: any) => c.id === char.id)
              const hireableChar = HIREABLE_CHARACTERS.find((c: any) => c.id === char.id)
              const templateChar = initialChar || hireableChar
              char.attribute = templateChar?.attribute || 'normal'
            }
            char.skills = buildFullSkillsForCharacter(char.id, char.equipment)
            return char
          })
        }
        
        console.log('处理后的 player:', parsed.player)
        player.value = parsed.player
        
        return { success: true }
      } catch (e) {
        console.error('加载存档失败:', e)
        return { success: false, error: (e as Error).message?.substring(0, 100) || '加载存档时发生未知错误' }
      }
    }
    return { success: false, error: '未找到存档数据' }
  }

  async function hireCharacter(characterTemplate: typeof HIREABLE_CHARACTERS[0]): Promise<boolean> {
    if (!player.value) return false
    
    const hasCharacter = player.value.characters.some(c => c.id === characterTemplate.id)
    if (hasCharacter) return false
    
    const cost = characterTemplate.maxHp + characterTemplate.maxMp + 5 * characterTemplate.attack + 5 * characterTemplate.defense + 50 * characterTemplate.moveRange + 50 * characterTemplate.attackRange
    if (player.value.gold < cost) return false

    player.value.gold -= cost
    const newCharacter = createCharacterFromTemplate(characterTemplate)
    player.value.characters.push(newCharacter)
    await saveGame()
    return true
  }

  async function equipItem(characterId: string, itemId: string): Promise<boolean> {
    if (!player.value) return false

    const character = player.value.characters.find(c => c.id === characterId)
    const item = player.value.inventory.find(i => i.id === itemId)

    if (!character || !item || item.type !== 'equipment' || !item.subtype) return false

    const slot = item.subtype as keyof typeof character.equipment
    const oldEquipment = character.equipment[slot]

    character.equipment[slot] = { ...item, count: 1 }

    item.count--
    if (item.count <= 0) {
      player.value.inventory = player.value.inventory.filter(i => i.id !== itemId)
    }

    if (oldEquipment) {
      const existingItem = player.value.inventory.find(i => i.id === oldEquipment.id)
      if (existingItem) {
        existingItem.count++
      } else {
        player.value.inventory.push({ ...oldEquipment, count: 1 })
      }
    }

    updateCharacterStats(character)
    character.skills = buildFullSkillsForCharacter(character.id, character.equipment)
    await saveGame()
    return true
  }

  async function unequipItem(characterId: string, slot: keyof Character['equipment']): Promise<boolean> {
    if (!player.value) return false

    const character = player.value.characters.find(c => c.id === characterId)
    if (!character) return false

    const equipment = character.equipment[slot]
    if (!equipment) return false

    character.equipment[slot] = null

    const existingItem = player.value.inventory.find(i => i.id === equipment.id)
    if (existingItem) {
      existingItem.count++
    } else {
      player.value.inventory.push({ ...equipment, count: 1 })
    }

    updateCharacterStats(character)
    character.skills = buildFullSkillsForCharacter(character.id, character.equipment)
    await saveGame()
    return true
  }

  function updateCharacterStats(character: Character) {
    const equipEffects = processEquipmentEffects(character.equipment)

    character.maxHp = Math.ceil(character.baseMaxHp * (1 + equipEffects.hpPercent / 100)) + equipEffects.hp
    character.maxMp = Math.ceil(character.baseMaxMp * (1 + equipEffects.mpPercent / 100)) + equipEffects.mp
    character.attack = Math.ceil(character.baseAttack * (1 + equipEffects.attackPercent / 100)) + equipEffects.attack
    character.defense = Math.ceil(character.baseDefense * (1 + equipEffects.defensePercent / 100)) + equipEffects.defense
    character.moveRange = character.baseMoveRange + equipEffects.moveRange
    character.attackRange = character.baseAttackRange + equipEffects.attackRange

    if (character.hp > character.maxHp) character.hp = character.maxHp
    if (character.mp > character.maxMp) character.mp = character.maxMp
  }

  function addExpToCharacter(characterId: string, exp: number): boolean {
    if (!player.value) return false
    
    const character = player.value.characters.find(c => c.id === characterId)
    if (!character) return false

    character.exp += exp
    checkAndUpgrade(character)
    return true
  }

  function checkAndUpgrade(character: Character) {
    const expRequired = getExpRequired(character.level)
    if (character.exp >= expRequired) {
      character.exp -= expRequired
      character.level++
      
      const growth = CHARACTER_GROWTH[character.id]
      if (growth) {
        character.baseMaxHp += growth.maxHp
        character.baseMaxMp += growth.maxMp
        character.baseAttack += growth.attack
        character.baseDefense += growth.defense
        
        character.hp += growth.maxHp
        character.mp += growth.maxMp
        
        battleLog.value.push(`【${character.name}】升级到${character.level}级！`)
      }
      
      // 重新计算装备加成
      updateCharacterStats(character)
      
      if (character.exp >= getExpRequired(character.level)) {
        checkAndUpgrade(character)
      }
    }
  }

  async function useConsumable(itemId: string, targetCharacterId?: string): Promise<Item | boolean> {
    if (!player.value) return false

    const item = player.value.inventory.find(i => i.id === itemId)
    if (!item || item.type !== 'consumable') return false

    let target: Character | null = null
    if (targetCharacterId) {
      target = player.value.characters.find(c => c.id === targetCharacterId)
    } else {
      target = player.value.characters[0]
    }

    if (!target) return false

    let openedItem: Item | null = null

    if (isChestItem(item)) {
      // 开宝箱获得装备
      const chestConfig = getChestConfigByName(item.name)
      const chestId = chestConfig?.id
      openedItem = openChest(chestId)
      player.value.inventory.push(openedItem)
    } else if (item.name.includes('灵草')) {
      const healAmount = Math.floor(target.maxHp * 0.1)
      const mpRestore = Math.floor(target.maxMp * 0.1)
      target.hp = Math.min(target.hp + healAmount, target.maxHp)
      target.mp = Math.min(target.mp + mpRestore, target.maxMp)
    } else if (item.name.includes('灵药')) {
      const healAmount = Math.floor(target.maxHp * 0.3)
      const mpRestore = Math.floor(target.maxMp * 0.3)
      target.hp = Math.min(target.hp + healAmount, target.maxHp)
      target.mp = Math.min(target.mp + mpRestore, target.maxMp)
    } else if (item.name.includes('药箱')) {
      target.hp = target.maxHp
    } else {
      // 未知消耗品，不生效
      return false
    }

    item.count--
    if (item.count <= 0) {
      player.value.inventory = player.value.inventory.filter(i => i.id !== itemId)
    }

    await saveGame()
    return openedItem !== null ? openedItem : true
  }

  async function updateHomeGrid(row: number, col: number, terrain: TerrainType, buildingType: 'none' | 'spiritField' | 'elixirRoom') {
    if (!player.value) return

    if (row < 0 || row >= 9 || col < 0 || col >= 9) return

    const cell = player.value.homeGrid[row][col]
    cell.terrain = terrain

    if (buildingType === 'none') {
      cell.building = null
    } else {
      const buildingConfig = buildingType === 'spiritField' 
        ? { type: 'spiritField' as const, name: '灵田', icon: '🌾', maxHp: 500 }
        : { type: 'elixirRoom' as const, name: '丹房', icon: '🏯', maxHp: 1000 }
      
      cell.building = {
        id: `building_${row}_${col}`,
        ...buildingConfig,
        hp: buildingConfig.maxHp,
      }
    }

    await saveGame()
  }

  async function nextPhase() {
    if (!player.value) return

    if (player.value.phase === 'day') {
      player.value.phase = 'night'
    } else {
      player.value.phase = 'day'
      player.value.day++
    }

    restoreResources(20)
    await saveGame()
  }

  function restoreResources(percent: number) {
    if (!player.value) return

    player.value.characters.forEach(char => {
      const hpRestore = Math.floor(char.maxHp * percent / 100)
      const mpRestore = Math.floor(char.maxMp * percent / 100)
      char.hp = Math.min(char.hp + hpRestore, char.maxHp)
      char.mp = Math.min(char.mp + mpRestore, char.maxMp)
    })
  }

  function startBattle(mode: 'offensive' | 'defensive', terrain: string, difficulty: 'easy' | 'normal' | 'hard' | 'nightmare' | 'deadly' = 'normal', selectedCharacterIds?: string[], selectedFactions?: string[]) {
    if (!player.value) return

    // 重置战斗结果状态，防止上一局的结果影响新战斗
    battleResult.value = null

    const config = BATTLE_CONFIG[mode]
    const difficultyConfig = DIFFICULTY_CONFIG[difficulty]
    const tiles: BattleTile[][] = []
    const buildings: BattleBuilding[] = []
    const collectibles: BattleCollectible[] = []
    
    console.log('=== 开始战斗 ===')
    console.log('模式:', mode)
    console.log('地形类型:', terrain)
    console.log('难度:', difficulty)
    console.log('地图配置:', config)
    console.log('敌方阵营:', selectedFactions)
    
    // 1. 先初始化完整的空白地图
    for (let row = 0; row < config.height; row++) {
      tiles[row] = []
      for (let col = 0; col < config.width; col++) {
        let tileTerrain: TerrainType = 'empty'
        let tileBuilding: BattleBuilding | null = null
        
        // 首先生成基础随机地形
        const probabilities = TERRAIN_PROBABILITIES[terrain as keyof typeof TERRAIN_PROBABILITIES] || TERRAIN_PROBABILITIES.plain
        const rand = Math.random()
        if (rand < probabilities.river) {
          tileTerrain = 'river'
        } else if (rand < probabilities.river + probabilities.obstacle) {
          tileTerrain = 'obstacle'
        }
        
        tiles[row][col] = {
          row,
          col,
          terrain: tileTerrain,
          character: null,
          building: tileBuilding,
        }
      }
    }

    // 2. 防御模式下，用玩家家园覆盖中央9x9区域
    // 先筛选玩家角色并计算等级，用于计算建筑血量
    let playerCharsForLevel: any[]
    if (selectedCharacterIds && selectedCharacterIds.length > 0) {
      playerCharsForLevel = player.value.characters.filter(c => selectedCharacterIds.includes(c.id) && c.hp > 0)
    } else {
      playerCharsForLevel = player.value.characters.filter(c => c.hp > 0).slice(0, 5)
    }
    const buildingLevel = Math.floor(playerCharsForLevel.reduce((sum: number, char: any) => sum + char.level, 0) / playerCharsForLevel.length) || 1
    const getBuildingHp = (baseHp: number) => Math.floor(baseHp * (1 + 0.1 * (buildingLevel - 1)))
    console.log('建筑等级:', buildingLevel)
    
    if (mode === 'defensive') {
      const homeOffsetRow = Math.floor((config.height - 9) / 2)
      const homeOffsetCol = Math.floor((config.width - 9) / 2)
      
      console.log('家园地图数据:', player.value.homeGrid)
      
      for (let homeRow = 0; homeRow < 9; homeRow++) {
        for (let homeCol = 0; homeCol < 9; homeCol++) {
          const battleRow = homeOffsetRow + homeRow
          const battleCol = homeOffsetCol + homeCol
          const homeCell = player.value.homeGrid[homeRow][homeCol]
          
          console.log(`家园格子 [${homeRow},${homeCol}] -> 战场 [${battleRow},${battleCol}]:`, homeCell)
          
          // 重置地形为空地
          tiles[battleRow][battleCol].terrain = 'empty'
          
          // 如果家园有建筑物，则添加到战场
          if (homeCell.building) {
            const buildingConfig = BUILDING_CONFIG[homeCell.building.type]
            const calculatedMaxHp = getBuildingHp(buildingConfig.maxHp)
            const newBuilding: BattleBuilding = {
              id: `building_${homeRow}_${homeCol}`,
              type: homeCell.building.type,
              name: buildingConfig.name,
              icon: buildingConfig.icon,
              maxHp: calculatedMaxHp,
              hp: calculatedMaxHp,
              row: battleRow,
              col: battleCol,
              isPlayer: true,
              spawnRound: buildingConfig.spawnRound || 0,
              hasSpawnedBonus: false,
            }
            buildings.push(newBuilding)
            tiles[battleRow][battleCol].building = newBuilding
          } else if (homeCell.terrain !== 'empty') {
            // 如果有地形，也应用
            tiles[battleRow][battleCol].terrain = homeCell.terrain
          }
        }
      }
    } else {
      // 进攻模式：清理玩家出生区域（底部3行），确保没有河流或障碍物
      const spawnStartRow = config.height - 3
      for (let r = spawnStartRow; r < config.height; r++) {
        for (let c = 0; c < config.width; c++) {
          if (tiles[r][c].terrain !== 'empty') {
            tiles[r][c].terrain = 'empty'
          }
        }
      }
    }
    
    console.log('生成的地形:', tiles)
    console.log('生成的建筑物:', buildings)

    let playerChars
    if (selectedCharacterIds && selectedCharacterIds.length > 0) {
      playerChars = player.value.characters.filter(c => selectedCharacterIds.includes(c.id) && c.hp > 0)
      console.log('使用选中角色:', selectedCharacterIds, '筛选出:', playerChars)
    } else {
      playerChars = player.value.characters.filter(c => c.hp > 0).slice(0, 5)
      console.log('使用默认角色:', playerChars)
    }
    
    const players: BattleCharacter[] = []
    const enemies: BattleCharacter[] = []

    // 3. 计算敌人等级：我方参战角色平均等级向下取整
    const enemyLevel = Math.floor(playerChars.reduce((sum, char) => sum + char.level, 0) / playerChars.length) || 1
    console.log('敌人等级:', enemyLevel)

    // 3. 放置玩家角色
    // 预先收集玩家出生区域的所有有效空位
    let validPositions: {row: number, col: number}[] = []
    
    if (mode === 'defensive') {
      // 防御模式：在中央9x9区域收集空位
      const homeOffsetRow = Math.floor((config.height - 9) / 2)
      const homeOffsetCol = Math.floor((config.width - 9) / 2)
      for (let r = homeOffsetRow; r < homeOffsetRow + 9 && r < config.height; r++) {
        for (let c = homeOffsetCol; c < homeOffsetCol + 9 && c < config.width; c++) {
          const tile = tiles[r]?.[c]
          const hasBuilding = buildings.some(b => b.row === r && b.col === c)
          if (tile && tile.terrain === 'empty' && !hasBuilding) {
            validPositions.push({row: r, col: c})
          }
        }
      }
    } else {
      // 进攻模式：在地图下方区域收集空位（底部2行）
      const startRow = config.height - 3
      for (let r = startRow; r < config.height; r++) {
        for (let c = 0; c < config.width; c++) {
          const tile = tiles[r]?.[c]
          const hasBuilding = buildings.some(b => b.row === r && b.col === c)
          if (tile && tile.terrain === 'empty' && !hasBuilding) {
            validPositions.push({row: r, col: c})
          }
        }
      }
    }
    
    // 随机打乱空位
    function shuffleArray(arr: any[]) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    shuffleArray(validPositions);
    
    // 按顺序放置玩家角色
    playerChars.forEach((char, index) => {
      if (index < validPositions.length) {
        const pos = validPositions[index]
        // 初始化玩家的 skillCooldowns
        const skillCooldowns: Record<string, number> = {}
        for (const skill of char.skills) {
          skillCooldowns[skill.id] = skill.currentCooldown
        }
        
        const newPlayer: BattleCharacter = {
          id: `battle_${char.id}`,
          characterId: char.id,
          row: pos.row,
          col: pos.col,
          hp: char.hp,
          mp: char.mp,
          maxHp: char.maxHp,
          maxMp: char.maxMp,
          hasMoved: false,
          hasActed: false,
          isDefending: false,
          isPlayer: true,
          level: char.level,
          skillCooldowns,
          totalDamage: 0,
          totalHeal: 0,
          defense: char.defense,
          attack: char.attack,
          moveRange: char.moveRange,
          attackRange: char.attackRange,
          statuses: [],
          faction: char.faction,
          job: char.job,
        }
        players.push(newPlayer)
        tiles[pos.row][pos.col].character = newPlayer
        console.log('添加玩家角色到战场:', char.id, char.name, char.avatar, '位置:', pos.row, pos.col, '防御力:', char.defense, '攻击力:', char.attack)
      } else {
        console.error('没有足够的空位放置角色:', char.name)
      }
    })

    // 4. 放置敌人 - 根据难度计算数量
    const baseEnemyCount = playerChars.length
    let enemyCount = Math.max(1, Math.ceil(baseEnemyCount * difficultyConfig.multiplier))
    if (difficulty === 'easy') {
      enemyCount = 1
    }
    
    // 从选中的阵营中筛选敌人角色
    const enabledFactions = selectedFactions && selectedFactions.length > 0 ? selectedFactions : ['ghost']
    const availableEnemyTemplates = HIREABLE_CHARACTERS.filter(char => enabledFactions.includes(char.faction) && char.job !== '虚影')
    
    // 如果没有可用的敌人角色，回退到鬼界
    const finalEnemyFactions = availableEnemyTemplates.length > 0 ? enabledFactions : ['ghost']
    const enemyTemplates = HIREABLE_CHARACTERS.filter(char => finalEnemyFactions.includes(char.faction) && char.job !== '虚影')
    
    console.log('选中的敌方阵营:', enabledFactions)
    console.log('可用敌人模板数量:', enemyTemplates.length)
    console.log('基础敌人数量:', baseEnemyCount, '难度倍数:', difficultyConfig.multiplier, '最终敌人数量:', enemyCount)

    for (let index = 0; index < enemyCount; index++) {
      let placed = false
      let attempts = 0
      
      // 随机从选中阵营的角色模板中选择一个
      const randomTemplate = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)]
      
      while (!placed && attempts < 100) {
        let row: number, col: number
        
        if (mode === 'defensive') {
          // 防御模式：在地图四周边缘随机放置
          const edge = Math.floor(Math.random() * 4) // 0=上,1=右,2=下,3=左
          switch (edge) {
            case 0: // 上边
              row = 0
              col = Math.floor(Math.random() * config.width)
              break
            case 1: // 右边
              row = Math.floor(Math.random() * config.height)
              col = config.width - 1
              break
            case 2: // 下边
              row = config.height - 1
              col = Math.floor(Math.random() * config.width)
              break
            case 3: // 左边
              row = Math.floor(Math.random() * config.height)
              col = 0
              break
          }
        } else {
          // 进攻模式：在地图上方随机放置
          row = Math.floor(Math.random() * 4)
          col = Math.floor(Math.random() * config.width)
        }
        
        // 检查位置是否有效
        const tile = tiles[row]?.[col]
        const hasBuilding = buildings.some(b => b.row === row && b.col === col)
        const hasCharacter = [...players, ...enemies].some(c => c.row === row && c.col === col)
        
        if (tile && tile.terrain === 'empty' && !hasBuilding && !hasCharacter) {
          const newEnemy = createBattleCharacter(randomTemplate, enemyLevel, row, col, false)
          newEnemy.id = `enemy_${index}`
          enemies.push(newEnemy)
          tiles[row][col].character = newEnemy
          placed = true
          console.log('添加敌人到战场:', randomTemplate.name, '等级:', enemyLevel, '攻击:', newEnemy.attack, '防御:', newEnemy.defense, '位置:', row, col)
        }
        attempts++
      }
    }
    
    // 5. 根据敌方阵营放置建筑
    // 血心：鬼界特有建筑
    // 兵营/天启炮：人界特有建筑
    const shouldPlaceHeart = enabledFactions.includes('ghost')
    const shouldPlaceBarracks = enabledFactions.includes('human')
    const shouldPlaceTianqiPao = enabledFactions.includes('human')
    
    // 收集所有可能生成的建筑
    const possibleBuildings: {type: string, configKey: string, id: string}[] = []
    if (shouldPlaceHeart) possibleBuildings.push({type: 'heart', configKey: 'heart', id: 'enemy_heart'})
    if (shouldPlaceBarracks) possibleBuildings.push({type: 'barracks', configKey: 'barracks', id: 'enemy_barracks'})
    if (shouldPlaceTianqiPao) possibleBuildings.push({type: 'tianqiPao', configKey: 'tianqiPao', id: 'enemy_tianqipao'})
    
    // 根据难度决定生成策略
    let buildingsToSpawn = possibleBuildings
    if (difficulty === 'easy' || difficulty === 'normal') {
      // 简单/正常难度：只随机生成一个建筑
      if (possibleBuildings.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleBuildings.length)
        buildingsToSpawn = [possibleBuildings[randomIndex]]
      }
    }
    
    // 放置选中的建筑
    for (const buildingInfo of buildingsToSpawn) {
      let placed = false
      let attempts = 0
      while (!placed && attempts < 100) {
        let row: number, col: number
        
        if (mode === 'defensive') {
          const edge = Math.floor(Math.random() * 4)
          switch (edge) {
            case 0: row = 0; col = Math.floor(Math.random() * config.width); break
            case 1: row = Math.floor(Math.random() * config.height); col = config.width - 1; break
            case 2: row = config.height - 1; col = Math.floor(Math.random() * config.width); break
            case 3: row = Math.floor(Math.random() * config.height); col = 0; break
          }
        } else {
          row = Math.floor(Math.random() * 4)
          col = Math.floor(Math.random() * config.width)
        }
        
        const tile = tiles[row]?.[col]
        const hasBuilding = buildings.some(b => b.row === row && b.col === col)
        const hasCharacter = [...players, ...enemies].some(c => c.row === row && c.col === col)
        
        if (tile && tile.terrain === 'empty' && !hasBuilding && !hasCharacter) {
          const buildingConfig = BUILDING_CONFIG[buildingInfo.configKey]
          const calculatedMaxHp = getBuildingHp(buildingConfig.maxHp)
          const newBuilding: BattleBuilding = {
            id: buildingInfo.id,
            type: buildingInfo.type as any,
            name: buildingConfig.name,
            icon: buildingConfig.icon,
            maxHp: calculatedMaxHp,
            hp: calculatedMaxHp,
            row,
            col,
            isPlayer: false,
            spawnRound: buildingConfig.spawnRound || 0,
            hasSpawnedBonus: false,
            ...(buildingInfo.type === 'tianqiPao' ? { targetPositions: [] } : {})
          }
          buildings.push(newBuilding)
          tiles[row][col].building = newBuilding
          placed = true
          console.log(`添加${buildingConfig.name}建筑到战场 (等级${buildingLevel}, 血量${calculatedMaxHp}):`, row, col)
        }
        attempts++
      }
    }

    // 5. 生成灵草（3个位置随机）
    const collectibleCount = 3 // 固定3个
    for (let i = 0; i < collectibleCount; i++) {
      let placed = false
      let attempts = 0
      while (!placed && attempts < 50) {
        const row = Math.floor(Math.random() * config.height)
        const col = Math.floor(Math.random() * config.width)
        const tile = tiles[row][col]
        const hasBuilding = buildings.some(b => b.row === row && b.col === col)
        const hasCharacter = [...players, ...enemies].some(c => c.row === row && c.col === col)
        const hasCollectible = collectibles.some(c => c.row === row && c.col === col)
        
        if (tile && tile.terrain === 'empty' && !hasBuilding && !hasCharacter && !hasCollectible) {
          const collectibleConfig = COLLECTIBLE_CONFIG.spirit_grass
          collectibles.push({
            id: `collect_${i}`,
            type: 'spirit_grass',
            name: collectibleConfig.name,
            icon: collectibleConfig.icon,
            description: collectibleConfig.description,
            hpRestore: collectibleConfig.hpRestore,
            mpRestore: collectibleConfig.mpRestore,
            row,
            col
          })
          placed = true
        }
        attempts++
      }
    }

    battleMap.value = {
      id: `battle_${Date.now()}`,
      width: config.width,
      height: config.height,
      mode,
      terrainType: terrain,
      tiles,
      players,
      enemies,
      buildings,
      collectibles,
      loot: [],
      heartPosition: buildings.find(b => b.type === 'heart') ? { row: buildings.find(b => b.type === 'heart')!.row, col: buildings.find(b => b.type === 'heart')!.col } : undefined,
      turn: 1,
      battlePhase: 'player',
      weather: 'normal',
      snowAreas: [],
      fireAreas: [],
      enemyLevel,
      initialEnemyCount: enemies.length,
      defeatedCharacters: [],
      destroyedBuildings: [],
      playerReiki: 0,
      playerShaQi: 0,
      enemyReiki: 0,
      enemyShaQi: 0,
    }
    updateWeather()

    console.log('战场玩家角色:', players);

    isInBattle.value = true;
    battleLog.value = ['战斗开始！'];
    // 重置阵营指令和集结点状态
    factionCommand.value = 'attack';
    gatheringPoints.value = [];
    isSelectingGatherPoints.value = false;
  }

  interface BattleResult {
    type: 'victory' | 'defeat' | 'escape'
    defeatedEnemyCount: number
    destroyedBuildingCount: number
    enemyLevel: number
    goldGained: number
    loot: { name: string; count: number }[]
    characterExp: { name: string; exp: number; isDefeated: boolean }[]
  }
  
  const battleResult = ref<BattleResult | null>(null)
  
  async function endBattle(victory: boolean, isEscape: boolean = false) {
    if (!player.value || !battleMap.value) return;

    const enemyCount = battleMap.value.initialEnemyCount;
    const enemyLevel = battleMap.value.enemyLevel;
    // 击败敌人数量：从 defeatedCharacters 列表统计，比 initialEnemyCount - remaining 更准确
    const defeatedEnemyCount = (battleMap.value.defeatedCharacters || []).filter(c => !c.isPlayer).length;
    // 计算摧毁的敌方建筑数量
    const destroyedBuildingCount = (battleMap.value.destroyedBuildings || []).filter(b => b.isPlayer !== true).length
    
    let goldGained = 0;
    const loot: { name: string; count: number }[] = [];
    const characterExp: { name: string; exp: number; isDefeated: boolean }[] = [];
    
    // 计算所有参战玩家角色（包括已退场的）
    const allPlayerChars = [...battleMap.value.players, ...(battleMap.value.defeatedCharacters || [])].filter(c => c.isPlayer);
    
    if (victory) {
      // 胜利：结算经验+金币+战利品
      
      // 1. 处理地图上拾取的物资（剩余的收集物）
      battleMap.value.collectibles.forEach(collectible => {
        const template = CONSUMABLE_TEMPLATES.find(t => t.name === collectible.name);
        if (template) {
          const existingIndex = player.value.inventory.findIndex(
            item => item.name === collectible.name && item.type === template.type
          );
          if (existingIndex >= 0) {
            player.value.inventory[existingIndex].count += 1;
          } else {
            player.value.inventory.push({
              ...template,
              id: `item_${Date.now()}_${Math.random()}`,
              count: 1,
            });
          }
          // 记录战利品
          const existingLoot = loot.find(l => l.name === collectible.name);
          if (existingLoot) {
            existingLoot.count += 1;
          } else {
            loot.push({ name: collectible.name, count: 1 });
          }
          battleLog.value.push(`获得${collectible.name}！`);
        }
      });
      
      // 2. 处理已经使用/拾取的物资（loot数组）
      battleMap.value.loot.forEach(item => {
        const existingIndex = player.value.inventory.findIndex(
          i => i.name === item.name && i.type === item.type
        );
        if (existingIndex >= 0) {
          player.value.inventory[existingIndex].count += item.count;
        } else {
          player.value.inventory.push({
            ...item,
            id: `item_${Date.now()}_${Math.random()}`,
          });
        }
        // 记录战利品
        const existingLoot = loot.find(l => l.name === item.name);
        if (existingLoot) {
          existingLoot.count += item.count;
        } else {
          loot.push({ name: item.name, count: item.count });
        }
        battleLog.value.push(`获得${item.name}！`);
      });

      // 3. 固定获得1个万物宝箱
      const wanwuChestConfig = CHEST_CONFIG.wanwu
      const wanwuIndex = player.value.inventory.findIndex(
        item => item.name === wanwuChestConfig.name && item.type === 'consumable'
      );
      if (wanwuIndex >= 0) {
        player.value.inventory[wanwuIndex].count += 1;
      } else {
        player.value.inventory.push({
          ...wanwuChestConfig,
          id: `item_${Date.now()}_${Math.random()}`,
          count: 1,
          type: 'consumable',
          subtype: 'chest',
        });
      }
      loot.push({ name: wanwuChestConfig.name, count: 1 });
      battleLog.value.push(`获得1个${wanwuChestConfig.name}！`);
      
      // 4. 获得敌人数量个法器宝箱
      const faqiChestConfig = CHEST_CONFIG.faqi
      const faqiIndex = player.value.inventory.findIndex(
        item => item.name === faqiChestConfig.name && item.type === 'consumable'
      );
      if (faqiIndex >= 0) {
        player.value.inventory[faqiIndex].count += enemyCount;
      } else {
        player.value.inventory.push({
          ...faqiChestConfig,
          id: `item_${Date.now()}_${Math.random()}`,
          count: enemyCount,
          type: 'consumable',
          subtype: 'chest',
        });
      }
      loot.push({ name: faqiChestConfig.name, count: enemyCount });
      battleLog.value.push(`获得${enemyCount}个${faqiChestConfig.name}！`);
      
      // 5. 计算金币奖励：100 + 敌人数量 * 20 * 敌人等级
      goldGained = 100 + enemyCount * 20 * enemyLevel;
      player.value.gold += goldGained;
      battleLog.value.push(`战斗胜利！获得${goldGained}金币`);
      
      // 5. 计算经验奖励：每个参战角色获得 敌人数量*10*敌人等级 + 摧毁建筑数量*30*敌人等级
      const baseExp = enemyCount * 10 * enemyLevel + destroyedBuildingCount * 30 * enemyLevel;
      
      allPlayerChars.forEach(battleChar => {
        const originalChar = player.value.characters.find(c => c.id === battleChar.characterId);
        if (!originalChar) return;
        
        const isDefeated = battleChar.hp <= 0;
        const expGained = isDefeated ? Math.floor(baseExp / 2) : baseExp;
        
        if (addExpToCharacter(battleChar.characterId, expGained)) {
          characterExp.push({ name: originalChar.name, exp: expGained, isDefeated });
          if (isDefeated) {
            battleLog.value.push(`【${originalChar.name}】战败，获得${expGained}经验值！`);
          } else {
            battleLog.value.push(`【${originalChar.name}】获得${expGained}经验值！`);
          }
        }
      });
      
      battleLog.value.push('战斗胜利！');
    } else {
      // 逃离或战败：只结算经验
      // 经验值为 敌方等级 * (击败敌人数量*5 + 摧毁建筑数量*15)
      const expPerCharacter = enemyLevel * (defeatedEnemyCount * 5 + destroyedBuildingCount * 15);
      
      allPlayerChars.forEach(battleChar => {
        const originalChar = player.value.characters.find(c => c.id === battleChar.characterId);
        if (!originalChar) return;
        
        const isDefeated = battleChar.hp <= 0;
        
        if (addExpToCharacter(battleChar.characterId, expPerCharacter)) {
          characterExp.push({ name: originalChar.name, exp: expPerCharacter, isDefeated });
          battleLog.value.push(`【${originalChar.name}】获得${expPerCharacter}经验值！`);
        }
      });
      
      if (isEscape) {
        battleLog.value.push('逃离战斗！');
      } else {
        battleLog.value.push('战斗失败！');
      }
    }
    
    // 设置结算结果
    battleResult.value = {
      type: victory ? 'victory' : (isEscape ? 'escape' : 'defeat'),
      defeatedEnemyCount,
      destroyedBuildingCount,
      enemyLevel,
      goldGained,
      loot,
      characterExp,
    };

    // 战斗结束后自动 + 半天：白天 ↔ 黑夜切换
    if (player.value.phase === 'day') {
      player.value.phase = 'night';
    } else {
      player.value.phase = 'day';
      player.value.day++;
    }

    restoreResources(30);
    isInBattle.value = false;
    // 延迟设置 battleMap 为 null，给 UI 一些时间完成渲染
    setTimeout(() => {
      battleMap.value = null;
    }, 100);
    await saveGame();
  }

  async function upgradeEquipment(itemId: string): Promise<boolean> {
    if (!player.value) return false;

    const item = player.value.inventory.find(i => i.id === itemId);
    if (!item || item.type !== 'equipment' || !item.baseStats) return false;

    if (item.level >= 11) {
      return false;
    }

    const cost = getEquipmentUpgradeCost(item);
    if (player.value.gold < cost) {
      return false;
    }

    player.value.gold -= cost;
    item.level += 1;

    // 更新已装备的相同物品
    for (const char of player.value.characters) {
      const eq = char.equipment;
      const slots = ['weapon', 'armor', 'helmet', 'shoes', 'accessory'] as const;
      for (const slot of slots) {
        if (eq[slot]?.id === itemId) {
          (eq[slot] as Item).level = item.level;
        }
      }
    }

    await saveGame();
    return true;
  }

  // 这个函数现在不再使用，宝箱通过消耗品使用获得
  function openChestStore(): Item | null {
    return null;
  }

  // 天下市集：购买装备
  async function buyShopEquipment(template: any): Promise<boolean> {
    if (!player.value || !template) return false;

    if (!template.baseStats) return false;
    const total = (template.baseStats.attack || 0) + (template.baseStats.defense || 0) + (template.baseStats.hp || 0) + (template.baseStats.mp || 0) + (template.baseStats.moveRange || 0) + (template.baseStats.attackRange || 0);

    // 计算 rarity：根据属性总数值决定（与 RARITY_CONFIG 键名一致）
    let rarity = 'common'
    if (total >= 150) rarity = 'peerless'
    else if (total >= 100) rarity = 'celestial'
    else if (total >= 70) rarity = 'treasure'
    else if (total >= 40) rarity = 'exceptional'
    else if (total >= 20) rarity = 'rare'

    // 装备价格：属性总和 × 25 × (1 + 品质加成)
    const finalRarity = template.rarity || rarity
    const rarityBonus = RARITY_CONFIG[finalRarity].bonus
    const cost = Math.floor(total * 25 * (1 + rarityBonus))

    if (player.value.gold < cost) {
      return false;
    }

    const newItem: Item = {
      ...template,
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      rarity: template.rarity || rarity,
      level: 1,
      count: 1,
    }

    // 扣除金币并添加到背包
    player.value.gold -= cost;
    const existing = player.value.inventory.find(i => i.name === newItem.name && i.type === 'equipment')
    if (existing) {
      existing.count++
    } else {
      player.value.inventory.push(newItem)
    }

    await saveGame();
    return true;
  }

  // 出售装备
  async function sellEquipment(itemId: string, price: number): Promise<boolean> {
    if (!player.value) return false;

    const itemIndex = player.value.inventory.findIndex(i => i.id === itemId)
    if (itemIndex === -1) return false;

    const item = player.value.inventory[itemIndex]
    if (item.count > 1) {
      item.count--
    } else {
      player.value.inventory.splice(itemIndex, 1)
    }

    player.value.gold += price
    await saveGame();
    return true;
  }

  // 天下市集：购买消耗品
  async function buyShopConsumable(template: any, price: number): Promise<boolean> {
    if (!player.value || !template) return false;
    if (player.value.gold < price) {
      return false;
    }

    const newItem: Item = {
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: template.name,
      icon: template.icon,
      type: 'consumable',
      rarity: template.rarity || 'common',
      level: 1,
      count: 1,
      description: template.description,
    }

    player.value.gold -= price;
    const existing = player.value.inventory.find(i => i.name === newItem.name && i.type === 'consumable')
    if (existing) {
      existing.count++
    } else {
      player.value.inventory.push(newItem)
    }

    await saveGame();
    return true;
  }

  // 天气系统函数
  function updateWeather() {
    if (!battleMap.value) return

    const rand = Math.random()
    let newWeather: WeatherType = 'normal'

    // 15% 小雪，15% 中雪，10% 大雪，10% 山火，10% 天火
    if (rand < 0.15) {
      newWeather = 'light_snow'
    } else if (rand < 0.30) {
      newWeather = 'medium_snow'
    } else if (rand < 0.40) {
      newWeather = 'heavy_snow'
    } else if (rand < 0.50) {
      newWeather = 'mountain_fire'
    } else if (rand < 0.60) {
      newWeather = 'sky_fire'
    }

    battleMap.value.weather = newWeather
    generateSnowAreas()
    generateFireAreas()

    const weatherNames: Record<WeatherType, string> = {
      normal: '晴朗',
      light_snow: '小雪',
      medium_snow: '中雪',
      heavy_snow: '大雪',
      mountain_fire: '山火',
      sky_fire: '天火'
    }
    battleLog.value.push(`天气变为：${weatherNames[newWeather]}`)
  }

  function generateSnowAreas() {
    if (!battleMap.value) return

    const { width, height, weather } = battleMap.value
    // 保留技能产生的雪地（有 source === 'skill' 的）
    const skillSnowAreas = battleMap.value.snowAreas.filter(s => s.source === 'skill')
    battleMap.value.snowAreas = skillSnowAreas

    if (weather === 'normal') return

    const snowAreas: SnowArea[] = []
    const usedPositions = new Set<string>()

    let config: { areaCount: number; areaSize: number }
    switch (weather) {
      case 'light_snow':
        config = { areaCount: 4, areaSize: 2 }
        break
      case 'medium_snow':
        config = { areaCount: 3, areaSize: 3 }
        break
      case 'heavy_snow':
        config = { areaCount: 4, areaSize: 3 }
        break
      default:
        return
    }

    for (let i = 0; i < config.areaCount; i++) {
      let attempts = 0
      while (attempts < 50) {
        const startRow = Math.floor(Math.random() * (height - config.areaSize + 1))
        const startCol = Math.floor(Math.random() * (width - config.areaSize + 1))

        // 添加整个区域的雪地
        let valid = true
        for (let r = 0; r < config.areaSize; r++) {
          for (let c = 0; c < config.areaSize; c++) {
            const key = `${startRow + r},${startCol + c}`
            if (usedPositions.has(key)) {
              valid = false
              break
            }
          }
          if (!valid) break
        }

        if (valid) {
          for (let r = 0; r < config.areaSize; r++) {
            for (let c = 0; c < config.areaSize; c++) {
              const row = startRow + r
              const col = startCol + c
              const key = `${row},${col}`
              usedPositions.add(key)
              snowAreas.push({ row, col, source: 'weather' })
            }
          }
          break
        }
        attempts++
      }
    }

    battleMap.value.snowAreas = [...skillSnowAreas, ...snowAreas]
  }

  function generateFireAreas() {
    if (!battleMap.value) return

    const { width, height, weather } = battleMap.value
    // 保留技能产生的火焰区域
    const skillFireAreas = battleMap.value.fireAreas.filter(f => f.source === 'skill')
    battleMap.value.fireAreas = skillFireAreas

    if (weather !== 'mountain_fire' && weather !== 'sky_fire') return

    const fireAreas: FireArea[] = []
    const usedPositions = new Set<string>()

    // 山火：2个2x2大小的区域；天火：2个3x3大小的区域
    const areaCount = 2
    const areaSize = weather === 'sky_fire' ? 3 : 2

    for (let i = 0; i < areaCount; i++) {
      let attempts = 0
      while (attempts < 50) {
        const startRow = Math.floor(Math.random() * (height - areaSize + 1))
        const startCol = Math.floor(Math.random() * (width - areaSize + 1))

        let valid = true
        for (let r = 0; r < areaSize; r++) {
          for (let c = 0; c < areaSize; c++) {
            const key = `${startRow + r},${startCol + c}`
            if (usedPositions.has(key)) {
              valid = false
              break
            }
          }
          if (!valid) break
        }

        if (valid) {
          for (let r = 0; r < areaSize; r++) {
            for (let c = 0; c < areaSize; c++) {
              const row = startRow + r
              const col = startCol + c
              const key = `${row},${col}`
              usedPositions.add(key)
              fireAreas.push({ row, col, source: 'weather' })
            }
          }
          break
        }
        attempts++
      }
    }

    battleMap.value.fireAreas = [...skillFireAreas, ...fireAreas]
  }

  function isFireArea(row: number, col: number): boolean {
    if (!battleMap.value) return false
    return battleMap.value.fireAreas.some(f => f.row === row && f.col === col)
  }

  function isCharacterInFire(char: BattleCharacter): boolean {
    return isFireArea(char.row, char.col)
  }

  function cleanupExpiredSnowAreas(phase: 'player' | 'enemy') {
    if (!battleMap.value) return
    // 清除在指定回合阶段结束后应过期的技能雪地
    battleMap.value.snowAreas = battleMap.value.snowAreas.filter(
      s => !(s.source === 'skill' && s.expiresAfterPhase === phase)
    )
  }

  function isSnowArea(row: number, col: number): boolean {
    if (!battleMap.value) return false
    return battleMap.value.snowAreas.some(s => s.row === row && s.col === col)
  }

  function isCharacterInSnow(char: BattleCharacter): boolean {
    return isSnowArea(char.row, char.col)
  }

  function useCollectible(collectibleId: string, charId: string) {
    if (!battleMap.value) return false;

    const collectible = battleMap.value.collectibles.find(c => c.id === collectibleId);
    if (!collectible) return false;
    
    // 查找角色（可能是玩家也可能是敌人）
    const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
    const char = allChars.find(c => c.id === charId);
    if (!char) return false;

    // 查找角色模板
    const charTemplate = findCharacterTemplateInStore(char.characterId);
    if (!charTemplate) return false;

    // 使用收集物恢复生命和法力
    if (collectible.hpRestore) {
      const restoreAmount = Math.floor(charTemplate.maxHp * collectible.hpRestore / 100);
      char.hp = Math.min(char.hp + restoreAmount, charTemplate.maxHp);
    }
    if (collectible.mpRestore) {
      const restoreAmount = Math.floor(charTemplate.maxMp * collectible.mpRestore / 100);
      char.mp = Math.min(char.mp + restoreAmount, charTemplate.maxMp);
    }

    // 移除收集物
    const idx = battleMap.value.collectibles.findIndex(c => c.id === collectibleId);
    if (idx !== -1) battleMap.value.collectibles.splice(idx, 1);

    battleLog.value.push(`【${charTemplate.name}】使用${collectible.name}！`);

    return true;
  }

  function collectCollectible(collectibleId: string) {
    if (!battleMap.value) return false;

    const collectible = battleMap.value.collectibles.find(c => c.id === collectibleId);
    if (!collectible) return false;

    const template = CONSUMABLE_TEMPLATES.find(t => t.name === collectible.name);
    if (template) {
      battleMap.value.loot.push({ ...template, id: `loot_${Date.now()}`, count: 1 });
    }

    const idx = battleMap.value.collectibles.findIndex(c => c.id === collectibleId);
    if (idx !== -1) battleMap.value.collectibles.splice(idx, 1);

    battleLog.value.push(`拾取${collectible.name}！`);

    return true;
  }

  // 统一创建战斗角色的函数
  function createBattleCharacter(
    template: typeof HIREABLE_CHARACTERS[0],
    level: number,
    row: number,
    col: number,
    isPlayer: boolean,
    hasMoved: boolean = false,
    hasActed: boolean = false
  ): BattleCharacter {
    const growth = CHARACTER_GROWTH[template.id] || { maxHp: 0, maxMp: 0, attack: 0, defense: 0 }
    const levelBonus = level - 1
    
    const maxHp = template.baseMaxHp + growth.maxHp * levelBonus
    const maxMp = template.baseMaxMp + growth.maxMp * levelBonus
    const attack = template.baseAttack + growth.attack * levelBonus
    const defense = template.baseDefense + growth.defense * levelBonus
    const moveRange = template.moveRange !== undefined ? template.moveRange : 2
    const attackRange = template.attackRange !== undefined ? template.attackRange : 1
    
    const skillCooldowns: Record<string, number> = {}
    for (const skill of template.skills) {
      skillCooldowns[skill.id] = 0
    }
    
    return {
      id: `${template.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      characterId: template.id,
      row,
      col,
      hp: maxHp,
      mp: maxMp,
      maxHp,
      maxMp,
      attack,
      defense,
      baseAttack: attack,
      baseDefense: defense,
      moveRange,
      attackRange,
      hasMoved,
      hasActed,
      isDefending: false,
      isPlayer,
      faction: template.faction,
      job: template.job,
      level,
      statuses: [],
      skillCooldowns,
      totalDamage: 0,
      totalHeal: 0,
      skills: buildSkillsForCharacterId(template.id),
    }
  }

  // 检查并自动使用角色所在位置的收集物
  function autoUseCollectibleAtPosition(char: BattleCharacter) {
    if (!battleMap.value) return false;

    // 查找角色位置是否有收集物
    const collectible = battleMap.value.collectibles.find(
      c => c.row === char.row && c.col === char.col
    );

    if (collectible) {
      // 先将收集物添加到战利品
      const template = CONSUMABLE_TEMPLATES.find(t => t.name === collectible.name);
      if (template) {
        battleMap.value.loot.push({ ...template, id: `loot_${Date.now()}`, count: 1 });
      }
      // 然后自动使用收集物
      return useCollectible(collectible.id, char.id);
    }

    return false;
  }

  // ========== 状态系统核心函数 ==========

  // 判断角色是否有某个状态
  function hasStatus(char: BattleCharacter, status: StatusType): boolean {
    return char.statuses?.some(s => s.type === status) ?? false;
  }

  function getStatusStacks(char: BattleCharacter, status: StatusType): number {
    if (!char.statuses) return 0;
    return char.statuses.filter(s => s.type === status).length;
  }

  // 汇总角色当前所有状态对攻击力的百分比加成（例如愤怒+20%）
  function getStatusAttackPercent(char: BattleCharacter): number {
    if (!char.statuses || char.statuses.length === 0) return 0;
    let total = 0;
    for (const s of char.statuses) {
      const key = typeof s === 'object' && s.type ? s.type : s;
      const cfg = STATUS_CONFIG[key as StatusType];
      if (cfg?.effects?.attackPercent) total += cfg.effects.attackPercent;
    }
    return total;
  }

  // 汇总角色当前所有状态对防御力的百分比加成（例如刚毅+30%，不灭+50%，愤怒-20%）
  function getStatusDefensePercent(char: BattleCharacter): number {
    if (!char.statuses || char.statuses.length === 0) return 0;
    let total = 0;
    for (const s of char.statuses) {
      const key = typeof s === 'object' && s.type ? s.type : s;
      const cfg = STATUS_CONFIG[key as StatusType];
      if (cfg?.effects?.defensePercent) total += cfg.effects.defensePercent;
    }
    return total;
  }

  // 汇总角色当前所有状态对移动范围的影响（例如迅捷+1，瘸腿-1）
  function getStatusMoveRange(char: BattleCharacter): number {
    if (!char.statuses || char.statuses.length === 0) return 0;
    let total = 0;
    for (const s of char.statuses) {
      const key = typeof s === 'object' && s.type ? s.type : s;
      const cfg = STATUS_CONFIG[key as StatusType];
      if (cfg?.effects?.moveRange) total += cfg.effects.moveRange;
    }
    return total;
  }

  // 汇总角色当前所有状态对攻击范围的影响（例如鹰眼+1，障目-1）
  function getStatusAttackRange(char: BattleCharacter): number {
    if (!char.statuses || char.statuses.length === 0) return 0;
    let total = 0;
    for (const s of char.statuses) {
      const key = typeof s === 'object' && s.type ? s.type : s;
      const cfg = STATUS_CONFIG[key as StatusType];
      if (cfg?.effects?.attackRange) total += cfg.effects.attackRange;
    }
    return total;
  }

  // 获取阵营攻击加成百分比（基于煞气）
  function getFactionAttackBonus(char: BattleCharacter): number {
    if (!battleMap.value) return 0;
    const shaQi = char.isPlayer ? battleMap.value.playerShaQi : battleMap.value.enemyShaQi;
    if (shaQi >= 100) return 10;
    if (shaQi >= 60) return 5;
    return 0;
  }

  // 获取阵营防御加成百分比（基于灵气）
  function getFactionDefenseBonus(char: BattleCharacter): number {
    if (!battleMap.value) return 0;
    const reiki = char.isPlayer ? battleMap.value.playerReiki : battleMap.value.enemyReiki;
    
    if (reiki >= 100) return 40;
    if (reiki >= 60) return 20;
    return 0;
  }

  // 统一应用状态影响后的攻击力：在角色基础攻击力（已含装备）上叠加攻击加成、状态攻击加成和阵营攻击加成
  function computeAttackPower(attacker: BattleCharacter): number {
    let attackPower = attacker.attack || 20;
    const statusAttack = getStatusAttackPercent(attacker);
    if (statusAttack !== 0) attackPower = Math.floor(attackPower * (1 + statusAttack / 100));
    if (attacker.attackBoost) attackPower = Math.floor(attackPower * (1 + attacker.attackBoost / 100));
    
    // 阵营攻击加成：煞气>=60时+5%，煞气>=100时+10%
    const factionAttackBonus = getFactionAttackBonus(attacker);
    if (factionAttackBonus !== 0) attackPower = Math.floor(attackPower * (1 + factionAttackBonus / 100));
    
    return Math.max(0, attackPower);
  }

  // 统一应用状态影响后的防御力：在角色基础防御上叠加防御状态加成、防御姿态、各种减防和阵营防御加成
  function computeDefensePower(target: BattleCharacter): number {
    let defense = target.defense || 5;
    const statusDefense = getStatusDefensePercent(target);
    if (statusDefense !== 0) defense = Math.floor(defense * (1 + statusDefense / 100));
    if (target.isDefending) defense = Math.floor(defense * 1.2);
    if (target.defenseReduction) defense = Math.floor(defense * (1 - target.defenseReduction / 100));
    if (target.defenseReductionPermanent) defense = Math.floor(defense * (1 - target.defenseReductionPermanent / 100));
    
    // 阵营防御加成：灵气>=60时+20%，灵气>=100时+40%，煞气>=100时额外+10%
    const factionDefenseBonus = getFactionDefenseBonus(target);
    if (factionDefenseBonus !== 0) defense = Math.floor(defense * (1 + factionDefenseBonus / 100));
    
    return Math.max(0, defense);
  }

  // 获取技能自身状态效果的持续时间
  function getSelfStatusDuration(skill: Skill, index: number): number {
    if (skill.selfStatusEffectsDurations?.[index] !== undefined) {
      return skill.selfStatusEffectsDurations[index];
    }
    if (skill.statusEffectDuration !== undefined) {
      return skill.statusEffectDuration;
    }
    return 0;
  }

  // 给角色添加一个状态（支持持续回合数，相同状态取最长时长）
  function addStatusToCharacter(char: BattleCharacter, status: StatusType, silent: boolean = false, duration: number = 0) {
    if (!char.statuses) char.statuses = [];
    
    const existingStatus = char.statuses.find(s => s.type === status);
    
    if (existingStatus) {
      if (duration > 0 && existingStatus.duration !== 0 && duration > existingStatus.duration) {
        existingStatus.duration = duration;
      }
      return;
    }
    
    char.statuses.push({ type: status, duration });
    
    if (status === 'crumble') {
      const origMaxHp = char.maxHp;
      char.maxHpBeforeCrumble = origMaxHp;
      char.maxHp = Math.floor(origMaxHp * 0.8);
      char.hp = Math.min(char.hp, char.maxHp);
    }
    
    // 状态施加视觉反馈
    if (!silent && battleMap.value) {
      triggerStatusApplyEffect(char.row, char.col, status);
    }
    
    if (!silent) {
      const template = findCharacterTemplateInStore(char.characterId);
      battleLog.value.push(`【${template?.name || char.characterId}】进入【${STATUS_CONFIG[status].name}】状态`);
    }
  }

  // 给角色移除一个状态
  function removeStatusFromCharacter(char: BattleCharacter, status: StatusType) {
    if (!char.statuses) return;
    const idx = char.statuses.findIndex(s => s.type === status);
    if (idx >= 0) {
      char.statuses.splice(idx, 1);
      // 解除脆皮：恢复原本的生命值上限
      if (status === 'crumble' && char.maxHpBeforeCrumble) {
        char.maxHp = char.maxHpBeforeCrumble;
        char.maxHpBeforeCrumble = undefined;
      }
      const template = findCharacterTemplateInStore(char.characterId);
      battleLog.value.push(`【${template?.name || char.characterId}】解除了【${STATUS_CONFIG[status].name}】状态`);
    }
  }

  // 操作时触发的状态：中毒（每次操作扣6%最大生命值）
  function triggerStatusOnAction(char: BattleCharacter) {
    if (!char) return;
    const template = findCharacterTemplateInStore(char.characterId);

    // 中毒：每次操作扣6%最大生命值
    if (hasStatus(char, 'poison')) {
      const damage = Math.max(1, Math.floor(char.maxHp * 0.06));
      char.hp -= damage;
      battleLog.value.push(`【${template?.name || char.characterId}】因【中毒】损失${damage}点生命值`);
      if (char.hp <= 0) {
        triggerDefeatAnimation(char.row, char.col, 'self')
        removeCharacterFromBattle(char.id, char.isPlayer);
        if (battleMap.value?.tiles[char.row]?.[char.col]) {
          battleMap.value.tiles[char.row][char.col].character = null;
        }
        battleLog.value.push(`【${template?.name || char.characterId}】因【中毒】身亡！`);
        checkBattleEnd();
      }
    }
  }

  // 回合结束时触发的状态：燃烧（扣10%最大生命值+5%最大法力值）、流血（扣12%最大生命值）
  function triggerStatusOnTurnEnd(chars: BattleCharacter[]) {
    if (!battleMap.value) return;
    for (const char of chars) {
      if (char.hp <= 0) continue;
      const template = findCharacterTemplateInStore(char.characterId);

      // 燃烧：每回合结束扣10%最大生命值 + 5%最大法力值
      if (hasStatus(char, 'burning')) {
        const hpDamage = Math.max(1, Math.floor(char.maxHp * 0.10));
        const mpDamage = Math.max(1, Math.floor(char.maxMp * 0.05));
        char.hp -= hpDamage;
        char.mp = Math.max(0, char.mp - mpDamage);
        battleLog.value.push(`【${template?.name || char.characterId}】因【燃烧】损失${hpDamage}点生命值和${mpDamage}点法力值`);
        if (char.hp <= 0) {
          triggerDefeatAnimation(char.row, char.col, 'self')
          removeCharacterFromBattle(char.id, char.isPlayer);
          if (battleMap.value.tiles[char.row]?.[char.col]) {
            battleMap.value.tiles[char.row][char.col].character = null;
          }
          battleLog.value.push(`【${template?.name || char.characterId}】因【燃烧】身亡！`);
          continue;
        }
      }

      // 流血：每回合结束扣12%最大生命值
      if (hasStatus(char, 'bleeding')) {
        const damage = Math.max(1, Math.floor(char.maxHp * 0.12));
        char.hp -= damage;
        battleLog.value.push(`【${template?.name || char.characterId}】因【流血】损失${damage}点生命值`);
        if (char.hp <= 0) {
          triggerDefeatAnimation(char.row, char.col, 'self')
          removeCharacterFromBattle(char.id, char.isPlayer);
          if (battleMap.value.tiles[char.row]?.[char.col]) {
            battleMap.value.tiles[char.row][char.col].character = null;
          }
          battleLog.value.push(`【${template?.name || char.characterId}】因【流血】身亡！`);
        }
      }

      // 消散：每回合结束扣25%最大生命值
      if (hasStatus(char, 'dissipate')) {
        const damage = Math.max(1, Math.floor(char.maxHp * 0.25));
        char.hp -= damage;
        battleLog.value.push(`【${template?.name || char.characterId}】因【消散】损失${damage}点生命值`);
        if (char.hp <= 0) {
          triggerDefeatAnimation(char.row, char.col, 'self')
          removeCharacterFromBattle(char.id, char.isPlayer);
          if (battleMap.value.tiles[char.row]?.[char.col]) {
            battleMap.value.tiles[char.row][char.col].character = null;
          }
          battleLog.value.push(`【${template?.name || char.characterId}】因【消散】身亡！`);
        }
      }

      // 紊乱：每回合结束扣10%最大法力值
      if (hasStatus(char, 'disorder')) {
        const mpDamage = Math.max(1, Math.floor(char.maxMp * 0.10));
        char.mp = Math.max(0, char.mp - mpDamage);
        battleLog.value.push(`【${template?.name || char.characterId}】因【紊乱】损失${mpDamage}点法力值`);
      }

      // 愈合：每回合结束恢复5%最大生命值
      if (hasStatus(char, 'heal')) {
        const healAmount = Math.max(1, Math.floor(char.maxHp * 0.05));
        char.hp = Math.min(char.maxHp, char.hp + healAmount);
        battleLog.value.push(`【${template?.name || char.characterId}】因【愈合】恢复${healAmount}点生命值`);
      }

      // 再生：每回合结束恢复10%最大生命值
      if (hasStatus(char, 'regen')) {
        const healAmount = Math.max(1, Math.floor(char.maxHp * 0.10));
        char.hp = Math.min(char.maxHp, char.hp + healAmount);
        battleLog.value.push(`【${template?.name || char.characterId}】因【再生】恢复${healAmount}点生命值`);
      }

      // 调息：每回合结束恢复5%最大法力值
      if (hasStatus(char, 'tune')) {
        const mpHealAmount = Math.max(1, Math.floor(char.maxMp * 0.05));
        char.mp = Math.min(char.maxMp, char.mp + mpHealAmount);
        battleLog.value.push(`【${template?.name || char.characterId}】因【调息】恢复${mpHealAmount}点法力值`);
      }

      // 静心：每回合结束恢复10%最大法力值
      if (hasStatus(char, 'meditate')) {
        const mpHealAmount = Math.max(1, Math.floor(char.maxMp * 0.10));
        char.mp = Math.min(char.maxMp, char.mp + mpHealAmount);
        battleLog.value.push(`【${template?.name || char.characterId}】因【静心】恢复${mpHealAmount}点法力值`);
      }

      // 眩晕：回合结束后自动清除（本回合只能防御）
      if (hasStatus(char, 'stun')) {
        removeStatusFromCharacter(char, 'stun');
        battleLog.value.push(`【${template?.name || char.characterId}】从【眩晕】中恢复`);
      }

      // 更新状态持续回合数，移除过期状态
      if (char.statuses) {
        for (let i = char.statuses.length - 1; i >= 0; i--) {
          const status = char.statuses[i];
          if (status.duration > 0) {
            status.duration--;
            if (status.duration <= 0) {
              char.statuses.splice(i, 1);
              battleLog.value.push(`【${template?.name || char.characterId}】的【${STATUS_CONFIG[status.type]?.name || status.type}】状态已解除`);
            }
          }
        }
      }
    }
    checkBattleEnd();
  }

  // ========== 状态系统核心函数结束 ==========

  function moveCharacter(battleCharId: string, row: number, col: number): boolean {
    if (!battleMap.value) return false

    const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
    const char = allChars.find(c => c.id === battleCharId)
    if (!char || char.hasMoved) return false

    // 寒冷状态：无法移动
    if (hasStatus(char, 'cold')) return false

    const tile = battleMap.value.tiles[row]?.[col]
    if (!tile || !TERRAIN_CONFIG[tile.terrain]?.passable) return false

    const occupied = allChars.find(c => c.row === row && c.col === col && c.id !== battleCharId)
    if (occupied) return false

    const building = battleMap.value.buildings.find(b => b.row === row && b.col === col)
    if (building) return false

    const moveRange = getCharacterMoveRange(char)
    if (!moveRange.some(r => r.row === row && r.col === col)) return false

    // 计算移动距离
    const distance = Math.abs(row - char.row) + Math.abs(col - char.col)
    char.movedDistance = (char.movedDistance || 0) + distance

    // 记录旧位置用于轨迹特效
    const oldRow = char.row
    const oldCol = char.col

    // 移动角色
    char.row = row
    char.col = col
    char.hasMoved = true

    // 触发移动轨迹粒子
    triggerMoveTrail(oldRow, oldCol, row, col, char.isPlayer)

    // 检查并自动使用收集物（AI角色）
    autoUseCollectibleAtPosition(char)

    // 触发中毒（操作时触发的状态）
    triggerStatusOnAction(char)

    return true
  }

  function getCharacterMoveRange(char: BattleCharacter): { row: number; col: number }[] {
    if (!battleMap.value) return []

    // 如果角色在雪地中，无法移动
    if (isCharacterInSnow(char)) {
      return []
    }

    const range: { row: number; col: number }[] = []
    const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
    
    // 使用角色实际的移动范围（已含装备加成），并叠加状态对移动范围的影响（迅捷+1，瘸腿-1）
    const baseMove = char.moveRange !== undefined ? char.moveRange : 3
    const moveDist = Math.max(0, baseMove + getStatusMoveRange(char))
    
    // 使用 BFS 计算可移动范围
    const visited: boolean[][] = Array(battleMap.value.height).fill(null).map(() => Array(battleMap.value.width).fill(false))
    const queue: { row: number; col: number; distance: number }[] = [
      { row: char.row, col: char.col, distance: 0 }
    ]
    visited[char.row][char.col] = true
    
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      
      if (current.distance > 0) {
        range.push({ row: current.row, col: current.col })
      }
      
      if (current.distance >= moveDist) {
        continue
      }
      
      for (const dir of directions) {
        const newRow = current.row + dir.row
        const newCol = current.col + dir.col
        
        if (newRow < 0 || newRow >= battleMap.value.height || newCol < 0 || newCol >= battleMap.value.width) {
          continue
        }
        
        if (visited[newRow][newCol]) {
          continue
        }
        
        const tile = battleMap.value.tiles[newRow]?.[newCol]
        if (!tile || !TERRAIN_CONFIG[tile.terrain]?.passable) {
          continue
        }
        
        const occupied = allChars.find(ch => ch.row === newRow && ch.col === newCol && ch.id !== char.id)
        if (occupied) {
          continue
        }
        
        const building = battleMap.value.buildings.find(b => b.row === newRow && b.col === newCol)
        if (building) {
          continue
        }
        
        visited[newRow][newCol] = true
        queue.push({ row: newRow, col: newCol, distance: current.distance + 1 })
      }
    }

    return range
  }

  function getAttackableTargets(char: BattleCharacter): (BattleCharacter | BattleBuilding | any)[] {
    if (!battleMap.value) return []
    const targets: (BattleCharacter | BattleBuilding | any)[] = []
    // 使用角色实际的攻击范围（已含装备加成），并叠加状态对攻击范围的影响（鹰眼+1，障目-1）
    const baseAttackRange = char.attackRange || 1
    const attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char))
    if (char.isPlayer) {
      battleMap.value.enemies.forEach(enemy => {
        const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
        if (dist <= attackRange) {
          targets.push(enemy)
        }
      })
      battleMap.value.buildings.forEach(building => {
        if (!building.isPlayer) {
          const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
          if (dist <= attackRange) {
            targets.push(building)
          }
        }
      })
    } else {
      battleMap.value.players.forEach(player => {
        const dist = Math.abs(player.row - char.row) + Math.abs(player.col - char.col)
        if (dist <= attackRange) {
          targets.push(player)
        }
      })
      
      battleMap.value.buildings.forEach(building => {
        if (building.isPlayer) {
          const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
          if (dist <= attackRange) {
            targets.push(building)
          }
        }
      })
    }
    
    // 添加障碍物
    for (let r = -attackRange; r <= attackRange; r++) {
      for (let c = -attackRange; c <= attackRange; c++) {
        const nr = char.row + r
        const nc = char.col + c
        if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
          if (battleMap.value.tiles[nr]?.[nc]?.terrain === 'obstacle') {
            const distance = Math.abs(r) + Math.abs(c)
            if (distance <= attackRange) {
              targets.push({
                id: `obstacle_${nr}_${nc}`,
                row: nr,
                col: nc,
                isObstacle: true
              })
            }
          }
        }
      }
    }

    return targets
  }

  function getAttackableEnemies(char: BattleCharacter): BattleCharacter[] {
    if (!battleMap.value) return []

    const targets = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
    const charTemplate = findCharacterTemplateInStore(char.characterId)
    const attackRange = charTemplate?.baseAttackRange || 1
    const attackable: BattleCharacter[] = []

    targets.forEach(target => {
      const dist = Math.abs(target.row - char.row) + Math.abs(target.col - char.col)
      if (dist <= attackRange) {
        attackable.push(target)
      }
    })

    return attackable
  }

  function attack(attackerId: string, targetId: string): boolean {
    if (!battleMap.value) return false

    const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find(c => c.id === attackerId)

    if (!attacker || attacker.hasActed) return false

    // 恐惧状态：无法攻击或使用技能，只能移动
    if (hasStatus(attacker, 'fear')) return false

    // 先判断是不是攻击障碍物
    if (targetId.startsWith('obstacle_')) {
      // 攻击障碍物
      const obstacleRow = parseInt(targetId.split('_')[1])
      const obstacleCol = parseInt(targetId.split('_')[2])
      
      if (battleMap.value.tiles[obstacleRow]?.[obstacleCol]?.terrain === 'obstacle') {
        battleMap.value.tiles[obstacleRow]![obstacleCol]!.terrain = 'empty'
        // 获取攻击者名称
        const attackerTemplate = findCharacterTemplateInStore(attacker.characterId)
        battleLog.value.push(`【${attackerTemplate?.name || attacker.characterId}】摧毁了障碍物！`)
        attacker.hasActed = true
        // 触发中毒（操作时触发的状态）
        triggerStatusOnAction(attacker)
        return true
      }
      return false
    }

    // 攻击角色
    const target = [...battleMap.value.players, ...battleMap.value.enemies].find(c => c.id === targetId)
    if (!target) return false

    // 获取攻击者和目标模板
    const attackerTemplate = findCharacterTemplateInStore(attacker.characterId)
    const targetTemplate = findCharacterTemplateInStore(target.characterId)

    const attackable = getAttackableEnemies(attacker)
    if (!attackable.find(t => t.id === targetId)) return false

    // 计算攻击力和防御力：使用战斗角色存储的属性（带装备加成）
    const attackPower = computeAttackPower(attacker)
    const defense = computeDefensePower(target)
    
    // 伤害计算：攻击 - 防御
    const damage = Math.max(1, attackPower - defense)
    target.hp -= damage
    
    // 更新伤害统计
    if (attacker.totalDamage === undefined) attacker.totalDamage = 0
    attacker.totalDamage += damage
    
    // 添加被攻击抖动特效
    triggerShake(target.row, target.col, 'character')
    
    // 触发普通攻击投射物
    const attackerAttribute = attackerTemplate?.attribute || 'normal'
    const normalProjType = getProjectileTypeForNormalAttack(attackerAttribute)
    triggerProjectile(attacker.row, attacker.col, target.row, target.col, normalProjType, attackerAttribute)
    
    // 受击闪白 + 血条冲击反馈
    triggerHitFlash(target.row, target.col, attackerAttribute)
    
    // 触发普通攻击技能光效（使用角色属性颜色）
    triggerSkillEffect(target.row, target.col, attackerAttribute, 'small', 'attack')
    
    // 显示伤害飘字（带震动效果）
    showFloatingText(target.row, target.col, damage, 'damage', attackerAttribute, true)
    
    battleLog.value.push(`【${attackerTemplate?.name || attacker.characterId}】攻击【${targetTemplate?.name || target.characterId}】，造成${damage}点伤害`)

    attacker.hasActed = true

    if (target.hp <= 0) {
      // 被击败退场动画
      triggerDefeatAnimation(target.row, target.col, 'kill')
      removeCharacterFromBattle(target.id, target.isPlayer)
      battleMap.value.tiles[target.row][target.col].character = null
      const finalTargetTemplate = findCharacterTemplateInStore(target.characterId)
      battleLog.value.push(`【${finalTargetTemplate?.name || target.characterId}】被击败！`)
    }

    // 普通攻击只清除目标位置的障碍物（如果目标在障碍物上）
    if (battleMap.value.tiles[target.row]?.[target.col]?.terrain === 'obstacle') {
      battleMap.value.tiles[target.row]![target.col]!.terrain = 'empty'
      battleLog.value.push(`【${attackerTemplate?.name || attacker.characterId}】攻击时摧毁了目标位置的障碍物！`)
    }

    // 触发中毒（操作时触发的状态）
    triggerStatusOnAction(attacker)

    checkBattleEnd()

    return true
  }

  function attackBuilding(attackerId: string, buildingId: string): boolean {
    if (!battleMap.value) return false

    const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find(c => c.id === attackerId)
    const building = battleMap.value.buildings.find(b => b.id === buildingId)

    if (!attacker || !building || attacker.hasActed) return false

    // 恐惧状态：无法攻击建筑
    if (hasStatus(attacker, 'fear')) return false

    const attackable = getAttackableTargets(attacker)
    if (!attackable.find(t => 'type' in t && t.id === buildingId)) return false

    // 查找攻击者模板
    const attackerTemplate = findCharacterTemplateInStore(attacker.characterId)
    
    // 使用基础攻击力
    let attackPower = attackerTemplate?.baseAttack || 20

    // 建筑防御为0，直接造成伤害
    const damage = Math.max(1, attackPower)
    building.hp -= damage
    
    // 更新伤害统计
    if (attacker.totalDamage === undefined) attacker.totalDamage = 0
    attacker.totalDamage += damage

    // 添加被攻击抖动特效
    triggerShake(building.row, building.col, 'building')
    
    // 显示伤害飘字
    showFloatingText(building.row, building.col, damage, 'damage')

    battleLog.value.push(`【${attackerTemplate?.name || attacker.characterId}】对【${building.name}】造成 ${damage} 点伤害`)

    // 处理血心建筑：如果是血心且第一次被攻击，额外产出一个变异丧尸
    if (building.type === 'heart' && !building.hasSpawnedBonus) {
      building.hasSpawnedBonus = true
      spawnVariantZombieFromHeart(building)
    }

    attacker.hasActed = true

    if (building.hp <= 0) {
      removeBuildingFromBattle(buildingId)
      battleMap.value.tiles[building.row]![building.col]!.building = null
      battleLog.value.push(`【${building.name}】被摧毁！`)
    }

    // 攻击建筑只清除目标位置的障碍物（如果有的话）
    if (battleMap.value.tiles[building.row]?.[building.col]?.terrain === 'obstacle') {
      battleMap.value.tiles[building.row]![building.col]!.terrain = 'empty'
      battleLog.value.push(`【${attackerTemplate?.name || attacker.characterId}】攻击建筑时摧毁了目标位置的障碍物！`)
    }

    // 触发中毒（操作时触发的状态）
    triggerStatusOnAction(attacker)

    checkBattleEnd()

    return true
  }

  function spawnOrdinaryZombieFromHeart(heartBuilding: BattleBuilding) {
    if (!battleMap.value) return

    const zombieType = 'ordinary_zombie'
    const zombieTemplate = HIREABLE_CHARACTERS.find(c => c.id === zombieType)
    
    if (!zombieTemplate) return

    const emptyPositions = getBuildingAdjacentEmptyPositions(heartBuilding)
    if (emptyPositions.length === 0) return

    const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    
    // 使用模板中的最大生命值
    let maxHp = zombieTemplate.maxHp
    let maxMp = zombieTemplate.maxMp
    let baseAttack = zombieTemplate.baseAttack ?? zombieTemplate.attack
    let baseDefense = zombieTemplate.baseDefense ?? zombieTemplate.defense
    let moveRange = zombieTemplate.moveRange || 2
    let attackRange = zombieTemplate.attackRange || 1

    const newZombie: BattleCharacter = {
      id: `zombie_${Date.now()}_${Math.random()}`,
      characterId: zombieType,
      row: pos.row,
      col: pos.col,
      hp: maxHp,
      mp: maxMp,
      maxHp: maxHp,
      maxMp: maxMp,
      attack: baseAttack,
      defense: baseDefense,
      baseAttack: baseAttack,
      baseDefense: baseDefense,
      moveRange: moveRange,
      attackRange: attackRange,
      hasMoved: false,
      hasActed: false,
      isDefending: false,
      isPlayer: false,
      level: battleMap.value.enemyLevel,
      statuses: [],
      faction: zombieTemplate.faction,
      job: zombieTemplate.job,
    }
    
    battleMap.value.enemies.push(newZombie)
    battleMap.value.tiles[pos.row][pos.col].character = newZombie
    
    battleLog.value.push(`血心生成了一只【${zombieTemplate.name}】！`)
  }

  function spawnVariantZombieFromHeart(heartBuilding: BattleBuilding) {
    if (!battleMap.value) return

    const zombieTypes = ['fat_zombie', 'swift_zombie', 'long_tongue_zombie']
    const randomType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)]
    const zombieTemplate = HIREABLE_CHARACTERS.find(c => c.id === randomType)
    
    if (!zombieTemplate) return

    const emptyPositions = getBuildingAdjacentEmptyPositions(heartBuilding)
    if (emptyPositions.length === 0) return

    const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    
    // 使用模板中的最大生命值
    let maxHp = zombieTemplate.maxHp
    let maxMp = zombieTemplate.maxMp
    let baseAttack = zombieTemplate.baseAttack ?? zombieTemplate.attack
    let baseDefense = zombieTemplate.baseDefense ?? zombieTemplate.defense
    let moveRange = zombieTemplate.moveRange || 2
    let attackRange = zombieTemplate.attackRange || 1
    
    const newZombie: BattleCharacter = {
      id: `zombie_${Date.now()}_${Math.random()}`,
      characterId: randomType,
      row: pos.row,
      col: pos.col,
      hp: maxHp,
      mp: maxMp,
      maxHp: maxHp,
      maxMp: maxMp,
      attack: baseAttack,
      defense: baseDefense,
      baseAttack: baseAttack,
      baseDefense: baseDefense,
      moveRange: moveRange,
      attackRange: attackRange,
      hasMoved: false,
      hasActed: false,
      isDefending: false,
      isPlayer: false,
      level: battleMap.value.enemyLevel,
      statuses: [],
      faction: zombieTemplate.faction,
      job: zombieTemplate.job,
    }
    
    battleMap.value.enemies.push(newZombie)
    battleMap.value.tiles[pos.row][pos.col].character = newZombie
    
    battleLog.value.push(`血心受到攻击，额外产出了一只【${zombieTemplate.name}】！`)
  }

  // 通用：血心建筑第一次受到攻击时额外产出一只变异丧尸
  function trySpawnZombieFromHeart(building: BattleBuilding) {
    if (building.type === 'heart' && !building.hasSpawnedBonus) {
      building.hasSpawnedBonus = true
      spawnVariantZombieFromHeart(building)
    }
  }

  function spawnSoldierFromBarracks(barracksBuilding: BattleBuilding) {
    if (!battleMap.value) return

    // 找到所有职业为士兵的角色
    const soldierTemplates = HIREABLE_CHARACTERS.filter(c => c.faction === 'human' && c.job === '士兵')
    
    if (soldierTemplates.length === 0) return

    // 随机选择一个士兵模板
    const randomTemplate = soldierTemplates[Math.floor(Math.random() * soldierTemplates.length)]

    const emptyPositions = getBuildingAdjacentEmptyPositions(barracksBuilding)
    if (emptyPositions.length === 0) return

    const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    
    // 获取角色属性
    let maxHp = randomTemplate.maxHp
    let maxMp = randomTemplate.maxMp
    
    const newSoldier: BattleCharacter = {
      id: `soldier_${Date.now()}_${Math.random()}`,
      characterId: randomTemplate.id,
      row: pos.row,
      col: pos.col,
      hp: maxHp,
      mp: maxMp,
      maxHp: maxHp,
      maxMp: maxMp,
      attack: randomTemplate.attack,
      defense: randomTemplate.defense,
      hasMoved: false,
      hasActed: false,
      isDefending: false,
      isPlayer: false,
      level: randomTemplate.level,
      statuses: [],
      faction: randomTemplate.faction,
      job: randomTemplate.job,
    }
    
    battleMap.value.enemies.push(newSoldier)
    battleMap.value.tiles[pos.row][pos.col].character = newSoldier
    
    battleLog.value.push(`兵营生成了一名【敌方${randomTemplate.name}】！`)
  }

  function defend(charId: string): boolean {
    if (!battleMap.value) return false

    const char = [...battleMap.value.players, ...battleMap.value.enemies].find(c => c.id === charId)
    if (!char || char.hasActed) return false

    // 恐惧状态：无法防御（只能移动）
    if (hasStatus(char, 'fear')) return false

    char.hasMoved = true
    char.hasActed = true
    char.isDefending = true
    const charTemplate = findCharacterTemplateInStore(char.characterId)
    battleLog.value.push(`【${charTemplate?.name || char.characterId}】进入防御姿态！`)

    // 防御属于被动姿态，不触发中毒等操作类状态
    // （仅移动/攻击/技能会触发中毒扣血）

    return true
  }

  // 统一治疗技能处理函数
  function processHealSkill(
    attacker: BattleCharacter,
    skill: Skill,
    targetId?: string | string[]
  ): boolean {
    if (!battleMap.value) return false

    const charTemplate = findCharacterTemplateInStore(attacker.characterId)
    if (!charTemplate) return false

    const isMultiTarget = Array.isArray(targetId)
    const targetIds: string[] = isMultiTarget ? [...targetId] : (targetId ? [targetId] : [])
    const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies

    // AOE治疗技能（以自身为中心）
    if (skill.areaRange && skill.range === 0) {
      const areaRange = skill.areaRange
      const aoeTargets = allyPool.filter(ally => {
        const dist = Math.abs(ally.row - attacker.row) + Math.abs(ally.col - attacker.col)
        return dist <= areaRange
      })

      let attackPower = charTemplate.attack || charTemplate.baseAttack || 20
      
      // 计算治疗量（按技能特殊公式）
      let hpHealAmount = skill.power > 0 ? Math.floor(attackPower * (skill.power / 100)) : 0
      let mpHealAmount = 0
      
      if (skill.id === 'fu_guang_lue_ying') {
        // 浮光掠影：50%生命 + 50%法力
        mpHealAmount = hpHealAmount
      } else if (skill.id === 'yin_yang_qi_he') {
        // 阴阳气合：50%法力
        hpHealAmount = 0
        mpHealAmount = Math.floor(attackPower * (skill.power / 100))
      } else if (skill.id === 'bi_hai_chao_sheng') {
        // 碧海潮生：120%生命
        hpHealAmount = Math.floor(attackPower * 1.2)
        mpHealAmount = 0
      } else if (skill.id === 'kongshan_niaoyu') {
        // 空山鸟语：50%生命 + 20%法力
        hpHealAmount = Math.floor(attackPower * 0.5)
        mpHealAmount = Math.floor(attackPower * 0.2)
      } else if (skill.id === 'di_mai_xuan_dun') {
        // 地脉玄盾：恢复玄武生命值上限的9%
        const selfMaxHp = charTemplate.maxHp || attacker.maxHp || 100
        hpHealAmount = Math.floor(selfMaxHp * (skill.selfHealMaxHpPct || 0.09))
        mpHealAmount = 0
      }

      const healedNames: string[] = []
      let totalHealed = 0

      // 治疗自身
      const selfTemplate = findCharacterTemplateInStore(attacker.characterId)
      const selfMaxHp = selfTemplate?.maxHp || attacker.maxHp || 100
      const selfMaxMp = selfTemplate?.maxMp || attacker.maxMp || 100
      
      if (hpHealAmount > 0) {
        // 治疗自身HP
        if (attacker.hp < selfMaxHp) {
          const oldHp = attacker.hp
          attacker.hp = Math.min(attacker.hp + hpHealAmount, selfMaxHp)
          const actualHeal = attacker.hp - oldHp
          if (actualHeal > 0) {
            totalHealed += actualHeal
            showFloatingText(attacker.row, attacker.col, actualHeal, 'heal')
            healedNames.push(selfTemplate?.name || attacker.characterId)
          }
        }
      }
      
      // 治疗自身MP
      if (mpHealAmount > 0 && attacker.mp < selfMaxMp) {
        const oldMp = attacker.mp
        attacker.mp = Math.min(attacker.mp + mpHealAmount, selfMaxMp)
        const actualHeal = attacker.mp - oldMp
        if (actualHeal > 0) {
          showFloatingText(attacker.row, attacker.col, actualHeal, 'mp')
        }
      }

      // 治疗范围内友方
      for (const target of aoeTargets) {
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const targetMaxHp = targetTemplate?.maxHp || target.maxHp || 100
        const targetMaxMp = targetTemplate?.maxMp || target.maxMp || 100

        // HP治疗
        if (hpHealAmount > 0) {
          const oldHp = target.hp
          target.hp = Math.min(target.hp + hpHealAmount, targetMaxHp)
          const actualHeal = target.hp - oldHp
          if (actualHeal > 0) {
            totalHealed += actualHeal
            showFloatingText(target.row, target.col, actualHeal, 'heal')
            healedNames.push(targetTemplate?.name || target.characterId)
          }
        }

        // MP治疗
        if (mpHealAmount > 0 && target.mp < targetMaxMp) {
          const oldMp = target.mp
          target.mp = Math.min(target.mp + mpHealAmount, targetMaxMp)
          const actualHeal = target.mp - oldMp
          if (actualHeal > 0) {
            showFloatingText(target.row, target.col, actualHeal, 'mp')
          }
        }
      }

      // 自身状态效果
      if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
        const statusNames: string[] = []
        skill.selfStatusEffects.forEach((effect, index) => {
          const duration = getSelfStatusDuration(skill, index)
          addStatusToCharacter(attacker, effect, true, duration)
          statusNames.push(`${STATUS_CONFIG[effect]?.name || effect}${duration > 0 ? `（${duration}回合）` : ''}`)
        })
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】自身获得【${statusNames.join('、')}】状态！`)
      }
      
      // 目标状态效果（如碧海潮生给目标加愈合状态等）
      if (skill.id === 'bi_hai_chao_sheng') {
        // 碧海潮生：自身获得愈合状态（已在selfStatusEffects处理）
      } else if (skill.id === 'fu_guang_lue_ying') {
        // 浮光掠影：所有目标获得迅捷状态
        for (const target of aoeTargets) {
          addStatusToCharacter(target, 'swift', true)
        }
        addStatusToCharacter(attacker, 'swift', true)
      } else if (skill.id === 'yin_yang_qi_he') {
        // 阴阳气合：所有目标获得调息状态
        for (const target of aoeTargets) {
          addStatusToCharacter(target, 'tune', true)
        }
        addStatusToCharacter(attacker, 'tune', true)
      }

      // 更新治疗统计
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += totalHealed

      // 战斗日志（包含恢复数据）
      const healText = mpHealAmount > 0 && hpHealAmount > 0 
        ? `${hpHealAmount}生命和${mpHealAmount}法力` 
        : hpHealAmount > 0 ? `${hpHealAmount}生命` : `${mpHealAmount}法力`
      
      if (healedNames.length > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${healedNames.join('、')}】${healText}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有需要治疗的目标！`)
      }

      return true
    }

    // 单体/多目标治疗技能
    if (targetIds.length === 0 && skill.selfHealPct) {
      // 自身治疗技能（无需目标）
      const healAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      attacker.hp = Math.min(attacker.hp + healAmount, attacker.maxHp)
      if (attacker.totalHeal === undefined) attacker.totalHeal = 0
      attacker.totalHeal += healAmount
      showFloatingText(attacker.row, attacker.col, healAmount, 'heal')
      battleLog.value.push(`自身恢复${healAmount}点生命值`)

      // 自身法力治疗百分比
      if (skill.selfMpHealPct) {
        const mpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct)
        attacker.mp = Math.min(attacker.mp + mpHealAmount, attacker.maxMp)
        showFloatingText(attacker.row, attacker.col, mpHealAmount, 'mp')
        battleLog.value.push(`自身恢复${mpHealAmount}点法力值`)
      }

      if (skill.dispelAllDebuffs) {
        // 驱散所有负面状态
        const dispelledStatuses: string[] = []
        NEGATIVE_STATUSES.forEach(status => {
          if (hasStatus(attacker, status)) {
            removeStatusFromCharacter(attacker, status)
            dispelledStatuses.push(STATUS_CONFIG[status]?.name || status)
          }
        })
        if (dispelledStatuses.length > 0) {
          battleLog.value.push(`驱散自身所有负面状态：【${dispelledStatuses.join('、')}】`)
        }
      } else if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
        // 随机驱散负面状态
        const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
        if (negStatuses.length > 0) {
          const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
          toDispel.forEach(status => {
            removeStatusFromCharacter(attacker, status)
            battleLog.value.push(`驱散自身【${STATUS_CONFIG[status]?.name || status}】状态`)
          })
        }
      }

      // 自身状态效果
      if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
        const duration = skill.statusEffectDuration || 0
        skill.selfStatusEffects.forEach(status => {
          addStatusToCharacter(attacker, status, false, duration)
          battleLog.value.push(`自身获得【${STATUS_CONFIG[status]?.name || status}】状态${duration > 0 ? `（持续${duration}回合）` : ''}`)
        })
      }
      return true
    }

    // 收集目标
    const maxTargets = skill.targetCount || 1
    const actualTargetIds = targetIds.slice(0, maxTargets)
    const targets: BattleCharacter[] = []

    for (const tid of actualTargetIds) {
      const target = allyPool.find(p => p.id === tid)
      if (target) targets.push(target)
    }

    if (targets.length === 0) return false

    // 计算治疗量
    let attackPower = charTemplate.attack || charTemplate.baseAttack || 20
    const healAmount = skill.power > 0 ? Math.floor(attackPower * (skill.power / 100)) : 0
    let hpHealAmount = healAmount
    let mpHealAmount = healAmount

    // 特殊治疗公式处理
    if (skill.id === 'ai_de_bao_bao') {
      // 爱的抱抱：0.05*自身最大生命值 + 0.1*目标最大生命值（HP和MP）
      const selfMaxHp = charTemplate.maxHp || 100
      const selfMaxMp = charTemplate.maxMp || 100
      const firstTarget = targets[0]
      const firstTargetTemplate = findCharacterTemplateInStore(firstTarget.characterId)
      const targetMaxHp = firstTargetTemplate?.maxHp || firstTarget.maxHp || 100
      const targetMaxMp = firstTargetTemplate?.maxMp || firstTarget.maxMp || 100
      
      hpHealAmount = Math.floor(selfMaxHp * 0.05 + targetMaxHp * 0.1)
      mpHealAmount = Math.floor(selfMaxMp * 0.05 + targetMaxMp * 0.1)
    } else if (skill.id === 'ai_de_fei_wen') {
      // 爱的飞吻：0.05*自身最大生命值 + 0.1*目标最大生命值（只恢复HP）
      const selfMaxHp = charTemplate.maxHp || 100
      const firstTarget = targets[0]
      const firstTargetTemplate = findCharacterTemplateInStore(firstTarget.characterId)
      const targetMaxHp = firstTargetTemplate?.maxHp || firstTarget.maxHp || 100
      
      hpHealAmount = Math.floor(selfMaxHp * 0.05 + targetMaxHp * 0.1)
      mpHealAmount = 0
    } else if (skill.id === 'ai_de_hui_yi') {
      // 爱的回忆：恢复自身10%生命和10%法力
      hpHealAmount = Math.floor((charTemplate.maxHp || 100) * 0.1)
      mpHealAmount = Math.floor((charTemplate.maxMp || 100) * 0.1)
    } else if (skill.id === 'miao_shou') {
      // 妙手：恢复100%攻击力的生命值
      hpHealAmount = Math.floor(attackPower * (skill.power / 100))
      mpHealAmount = 0
    } else if (skill.id === 'tian_ya_qing_qing') {
      // 天雅倾情：恢复自身10%生命值和法力值上限
      hpHealAmount = Math.floor((charTemplate.maxHp || 100) * 0.1)
      mpHealAmount = Math.floor((charTemplate.maxMp || 100) * 0.1)
    } else if (skill.id === 'yu_yin_rao_liang') {
      // 余音绕梁：110%生命 + 40%法力
      hpHealAmount = Math.floor(attackPower * 1.1)
      mpHealAmount = Math.floor(attackPower * 0.4)
    } else if (skill.id === 'feng_mo_qin_xin') {
      // 疯魔琴心：120%生命
      hpHealAmount = Math.floor(attackPower * 1.2)
      mpHealAmount = 0
    } else if (skill.id === 'mu_feng_wei_shang') {
      // 沐风为裳：50%生命 + 60%法力
      hpHealAmount = Math.floor(attackPower * 0.5)
      mpHealAmount = Math.floor(attackPower * 0.6)
    } else if (skill.id === 'bi_hai_chao_sheng') {
      // 碧海潮生：120%生命
      hpHealAmount = Math.floor(attackPower * 1.2)
      mpHealAmount = 0
    } else if (skill.id === 'tao_hua_zhuo_zhuo') {
      // 桃花灼灼：120%生命
      hpHealAmount = Math.floor(attackPower * 1.2)
      mpHealAmount = 0
    } else if (skill.id === 'nature_power') {
      // 自然之力：60%生命
      hpHealAmount = Math.floor(attackPower * 0.6)
      mpHealAmount = 0
    } else if (skill.id === 'wu_di_niu_niu') {
      // 无敌牛牛：100%生命
      hpHealAmount = Math.floor(attackPower * 1.0)
      mpHealAmount = 0
    }

    // 对每个目标进行治疗
    const healedNames: string[] = []
    let totalHealed = 0

    for (const target of targets) {
      const targetTemplate = findCharacterTemplateInStore(target.characterId)
      const targetMaxHp = targetTemplate?.maxHp || target.maxHp || 100
      const targetMaxMp = targetTemplate?.maxMp || target.maxMp || 100

      // 妙手：恢复100%攻击力的生命值（每个目标独立计算）
      let currentHpHealAmount = hpHealAmount
      let currentMpHealAmount = mpHealAmount

      // 治疗HP
      if (currentHpHealAmount > 0) {
        const oldHp = target.hp
        target.hp = Math.min(target.hp + currentHpHealAmount, targetMaxHp)
        const realHeal = target.hp - oldHp
        if (realHeal > 0) {
          totalHealed += realHeal
          showFloatingText(target.row, target.col, realHeal, 'heal')
          healedNames.push(targetTemplate?.name || target.characterId)
        }
      }

      // 治疗MP
      if (currentMpHealAmount > 0 && target.mp < targetMaxMp) {
        const oldMp = target.mp
        target.mp = Math.min(target.mp + currentMpHealAmount, targetMaxMp)
        const actualHeal = target.mp - oldMp
        if (actualHeal > 0) {
          showFloatingText(target.row, target.col, actualHeal, 'mp')
        }
      }

      // 驱散不良状态
      if (skill.id === 'ai_de_bao_bao' || skill.id === 'ai_de_fei_wen' || 
          skill.id === 'ai_de_hui_yi' || skill.id === 'jin_ji_zhi_liao' ||
          skill.id === 'zhi_yu_zhi_guang' || skill.id === 'mu_feng_wei_shang' ||
          skill.id === 'wu_di_niu_niu' || skill.id === 'miao_shou') {
        const dispelledStatuses: string[] = []
        NEGATIVE_STATUSES.forEach(status => {
          if (hasStatus(target, status)) {
            removeStatusFromCharacter(target, status)
            dispelledStatuses.push(STATUS_CONFIG[status]?.name || status)
          }
        })
        if (dispelledStatuses.length > 0) {
          battleLog.value.push(`驱散【${targetTemplate?.name || target.characterId}】的【${dispelledStatuses.join('、')}】状态！`)
        }
      }

      // 目标状态效果
      if (skill.id === 'tao_hua_zhuo_zhuo') {
        addStatusToCharacter(target, 'heal', true)
      } else if (skill.id === 'feng_mo_qin_xin') {
        addStatusToCharacter(target, 'strong', true)
      } else if (skill.id === 'yu_yin_rao_liang') {
        addStatusToCharacter(target, 'tune', true)
      }
    }

    // 沐风为裳：同时恢复自身
    if (skill.id === 'mu_feng_wei_shang') {
      const selfMaxHp = charTemplate.maxHp || 100
      const selfMaxMp = charTemplate.maxMp || 100
      
      attacker.hp = Math.min(attacker.hp + hpHealAmount, selfMaxHp)
      attacker.mp = Math.min(attacker.mp + mpHealAmount, selfMaxMp)
      totalHealed += hpHealAmount + mpHealAmount
      healedNames.push(charTemplate?.name || attacker.characterId)
      showFloatingText(attacker.row, attacker.col, hpHealAmount, 'heal')
    }

    // 自身治疗百分比（如万古结界恢复15%生命）
    if (skill.selfHealPct && attacker.hp < attacker.maxHp) {
      const selfHealAmount = Math.floor(attacker.maxHp * skill.selfHealPct)
      const oldHp = attacker.hp
      attacker.hp = Math.min(attacker.hp + selfHealAmount, attacker.maxHp)
      const actualHeal = attacker.hp - oldHp
      if (actualHeal > 0) {
        totalHealed += actualHeal
        showFloatingText(attacker.row, attacker.col, actualHeal, 'heal')
        if (!healedNames.includes(charTemplate?.name || attacker.characterId)) {
          healedNames.push(charTemplate?.name || attacker.characterId)
        }
      }
    }

    // 自身法力治疗百分比（如红盖迷踪恢复10%法力）
    if (skill.selfMpHealPct && attacker.mp < attacker.maxMp) {
      const selfMpHealAmount = Math.floor(attacker.maxMp * skill.selfMpHealPct)
      const oldMp = attacker.mp
      attacker.mp = Math.min(attacker.mp + selfMpHealAmount, attacker.maxMp)
      const actualMpHeal = attacker.mp - oldMp
      if (actualMpHeal > 0) {
        showFloatingText(attacker.row, attacker.col, actualMpHeal, 'mp')
      }
    }

    // 驱散所有负面状态（如万古结界）
    if (skill.dispelAllDebuffs) {
      const dispelledStatuses: string[] = []
      NEGATIVE_STATUSES.forEach(status => {
        if (hasStatus(attacker, status)) {
          removeStatusFromCharacter(attacker, status)
          dispelledStatuses.push(STATUS_CONFIG[status]?.name || status)
        }
      })
      if (dispelledStatuses.length > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】驱散所有负面状态：【${dispelledStatuses.join('、')}】`)
      }
    }

    // 随机驱散负面状态
    if (skill.dispelRandomDebuffs && skill.dispelRandomDebuffs > 0) {
      const negStatuses = NEGATIVE_STATUSES.filter(status => hasStatus(attacker, status))
      if (negStatuses.length > 0) {
        const toDispel = negStatuses.sort(() => Math.random() - 0.5).slice(0, skill.dispelRandomDebuffs)
        toDispel.forEach(status => {
          removeStatusFromCharacter(attacker, status)
        })
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】驱散【${toDispel.map(s => STATUS_CONFIG[s]?.name || s).join('、')}】状态`)
      }
    }

    // 自身状态效果（如万古结界获得不灭状态）
    if (skill.selfStatusEffects && skill.selfStatusEffects.length > 0) {
      const statusNames: string[] = []
      skill.selfStatusEffects.forEach((effect, index) => {
        const duration = getSelfStatusDuration(skill, index)
        addStatusToCharacter(attacker, effect, true, duration)
        statusNames.push(`${STATUS_CONFIG[effect]?.name || effect}${duration > 0 ? `（${duration}回合）` : ''}`)
      })
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】获得【${statusNames.join('、')}】状态！`)
    }

    // 更新治疗统计
    if (attacker.totalHeal === undefined) attacker.totalHeal = 0
    attacker.totalHeal += totalHealed

    // 战斗日志
    if (healedNames.length > 0) {
      const healText = mpHealAmount > 0 ? `${hpHealAmount}生命和${mpHealAmount}法力` : `${hpHealAmount}生命`
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${healedNames.join('、')}】${healText}！`)
    } else {
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有找到有效目标`)
    }

    return true
  }

  function useSkill(skillId: string, attackerId: string, targetId?: string | string[]): boolean {
    if (!battleMap.value || !player.value) return false

    const attacker = [...battleMap.value.players, ...battleMap.value.enemies].find(c => c.id === attackerId)
    if (!attacker || attacker.hasActed) return false

    const charTemplate = findCharacterTemplateInStore(attacker.characterId)
    if (!charTemplate) return false

    const skill = charTemplate.skills.find(s => s.id === skillId)
    if (!skill) return false

    // Check cooldown
    if (attacker.isPlayer) {
      const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
      if (attackerChar) {
        // 初始上场的玩家角色：从玩家角色列表中检查冷却
        const playerSkill = attackerChar.skills.find(s => s.id === skillId)
        if (!playerSkill || playerSkill.currentCooldown > 0) return false
      } else {
        // 召唤出来的玩家阵营角色：使用 skillCooldowns 检查冷却
        if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
        if ((attacker.skillCooldowns[skillId] || 0) > 0) return false
      }
    } else {
      // Enemy: check skillCooldowns
      if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
      if ((attacker.skillCooldowns[skillId] || 0) > 0) return false
    }
    
    if (attacker.mp < skill.mpCost) return false
    
    // 阵营灵气/煞气消耗检查
    if (skill.reikiCost && battleMap.value) {
      const currentReiki = attacker.isPlayer ? battleMap.value.playerReiki : battleMap.value.enemyReiki
      if (currentReiki < skill.reikiCost) return false
    }
    if (skill.shaQiCost && battleMap.value) {
      const currentShaQi = attacker.isPlayer ? battleMap.value.playerShaQi : battleMap.value.enemyShaQi
      if (currentShaQi < skill.shaQiCost) return false
    }
    
    // HP threshold check for skills that require minimum HP
    if (skill.selfHpThreshold !== undefined) {
      const hpRatio = attacker.hp / (attacker.maxHp || 1)
      if (hpRatio < skill.selfHpThreshold) return false
    }
    
    // HP > ATK check for skills that require it
    if (skill.requireHpGtAtk) {
      if (attacker.hp <= attacker.attack) return false
    }
    
    // 召唤数量限制检查
    if (skill.summonMaxCount && skill.summonCountId && battleMap.value) {
      const currentSide = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
      const existingCount = currentSide.filter(c => c.characterId === skill.summonCountId).length
      if (existingCount >= skill.summonMaxCount) return false
    }
    
    // 沉默状态：无法使用技能
    if (hasStatus(attacker, 'silenced')) return false

    // 恐惧状态：无法攻击或使用技能，只能移动
    if (hasStatus(attacker, 'fear')) return false

    attacker.mp -= skill.mpCost

    // 扣除阵营灵气/煞气
    if (skill.reikiCost && battleMap.value) {
      if (attacker.isPlayer) {
        battleMap.value.playerReiki = Math.max(0, battleMap.value.playerReiki - skill.reikiCost)
      } else {
        battleMap.value.enemyReiki = Math.max(0, battleMap.value.enemyReiki - skill.reikiCost)
      }
    }
    if (skill.shaQiCost && battleMap.value) {
      if (attacker.isPlayer) {
        battleMap.value.playerShaQi = Math.max(0, battleMap.value.playerShaQi - skill.shaQiCost)
      } else {
        battleMap.value.enemyShaQi = Math.max(0, battleMap.value.enemyShaQi - skill.shaQiCost)
      }
    }

    // 归一化目标ID数组
    const isMultiTarget = Array.isArray(targetId)
    const targetIds: string[] = isMultiTarget ? [...targetId] : (targetId ? [targetId] : [])
    const singleTargetId: string | undefined = !isMultiTarget ? targetId : undefined

    // 解析目标位置（如果singleTargetId是pos_row_col格式）
    let targetPos: { row: number; col: number } | null = null
    if (singleTargetId && singleTargetId.startsWith('pos_')) {
      const parts = singleTargetId.split('_')
      if (parts.length === 3) {
        targetPos = {
          row: parseInt(parts[1]),
          col: parseInt(parts[2])
        }
      }
    }

    // 处理障碍物目标（obstacle_row_col格式）
    if (singleTargetId && singleTargetId.startsWith('obstacle_')) {
      const parts = singleTargetId.split('_')
      if (parts.length === 3) {
        const row = parseInt(parts[1])
        const col = parseInt(parts[2])
        battleMap.value.tiles[row]![col]!.terrain = 'empty'
        const damage = Math.floor(skill.power / 100 * (charTemplate.attack || charTemplate.baseAttack || 20))

        // 处理有自身buff的技能：即使目标是障碍物，也触发自身效果
        // 【红花绿叶】：提高自身血量上限并恢复（攻击力的80%）
        // 【蛮甲冲击】：使自身进入【刚毅】状态（防御力+30%，持续到战斗结束）
        if (skillId === 'hong_hua_lv_ye') {
          const attackPower = computeAttackPower(attacker)
          const hpBuff = Math.floor(attackPower * 0.8)
          attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff
          attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)
          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += hpBuff
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】摧毁了一个障碍物！生命值上限+${hpBuff}并恢复${hpBuff}生命！`)
        } else if (skillId === 'man_jia_chong_ji') {
          addStatusToCharacter(attacker, 'resolute', true)
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】摧毁了一个障碍物！自身进入【刚毅】状态！`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】摧毁了一个障碍物！`)
        }

        attacker.hasActed = true
        if (attacker.isPlayer) {
          const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
          if (attackerChar) {
            const playerSkill = attackerChar.skills.find(s => s.id === skillId)
            if (playerSkill) playerSkill.currentCooldown = skill.cooldown || 1
          }
        } else {
          if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
          attacker.skillCooldowns[skillId] = skill.cooldown || 1
        }
        // 触发中毒（操作时触发的状态）
        triggerStatusOnAction(attacker)
        return true
      }
    }

    // 通用障碍物目标预处理：处理所有以 obstacle_ 开头的目标
    if (targetIds.length > 0) {
      const obstacleTargets: { row: number; col: number }[] = []
      const remainingTargetIds: string[] = []
      
      for (const tid of targetIds) {
        if (tid.startsWith('obstacle_')) {
          const parts = tid.split('_')
          if (parts.length === 3) {
            obstacleTargets.push({ row: parseInt(parts[1]), col: parseInt(parts[2]) })
          }
        } else {
          remainingTargetIds.push(tid)
        }
      }
      
      if (obstacleTargets.length > 0) {
        const attackPower = computeAttackPower(attacker)
        obstacleTargets.forEach(pos => {
          if (battleMap.value) {
            battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
          }
          triggerShake(pos.row, pos.col, 'character')
          triggerSkillEffect(pos.row, pos.col, skill.attribute || 'normal', 'medium', skill.type as any)
        })
        
        const obstacleNames = obstacleTargets.map(() => '障碍物')
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，摧毁了${obstacleTargets.length}个障碍物！`)
        
        // 如果没有其他目标了，直接结算
        if (remainingTargetIds.length === 0) {
          attacker.hasActed = true
          if (attacker.isPlayer) {
            const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
            if (attackerChar) {
              const playerSkill = attackerChar.skills.find(s => s.id === skillId)
              if (playerSkill) playerSkill.currentCooldown = skill.cooldown || 1
            }
          } else {
            if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
            attacker.skillCooldowns[skillId] = skill.cooldown || 1
          }
          triggerStatusOnAction(attacker)
          return true
        }
        
        // 有剩余目标，继续处理
        targetIds.length = 0
        targetIds.push(...remainingTargetIds)
      }
    }

    if (skill.category === 'aoe') {
      let centerRow = attacker.row
      let centerCol = attacker.col
      
      if (targetId && targetId.startsWith('pos_')) {
        const [, rowStr, colStr] = targetId.split('_')
        centerRow = parseInt(rowStr)
        centerCol = parseInt(colStr)
      }
      
      processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate)
      
      attacker.hasActed = true
      if (attacker.isPlayer) {
        const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
        if (attackerChar) {
          const playerSkill = attackerChar.skills.find(s => s.id === skillId)
          if (playerSkill) playerSkill.currentCooldown = skill.cooldown || 1
        }
      } else {
        if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
        attacker.skillCooldowns[skillId] = skill.cooldown || 1
      }
      triggerStatusOnAction(attacker)
      return true
    }

    // 特殊处理「爱的抱抱」「爱的飞吻」「爱的回忆」「余音绕梁」「疯魔琴心」等治疗技能
    // 统一使用 processHealSkill 处理
    const healSkillIds = ['ai_de_bao_bao', 'ai_de_fei_wen', 'ai_de_hui_yi', 'yu_yin_rao_liang', 'feng_mo_qin_xin', 'ning_xin_jue', 'wan_gu_jie_jie']
    if (healSkillIds.includes(skillId)) {
      processHealSkill(attacker, skill, targetId)
    }
    // 特殊处理「噬心食髓」技能
    else if (skillId === 'shi_xin_shi_sui') {
      // 选择3格范围内的1个敌方角色，造成150%攻击力的伤害，并陷入【中毒】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加中毒状态
          addStatusToCharacter(target, 'poison', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【中毒】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「天罗地网」技能
    else if (skillId === 'tian_luo_di_wang') {
      // 选择3格范围内的2个敌方角色，造成120%攻击力的伤害，并陷入【瘸腿】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        for (const tid of actualTargetIds) {
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')

            // 施加瘸腿状态
            addStatusToCharacter(target, 'lame', true)

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += totalDamageAll

        if (damagedTargets.length > 0) {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${damagedTargets.join('、')}】分别造成伤害并陷入【瘸腿】状态`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有命中有效目标`)
        }
      }
    }
    // 特殊处理「桃之夭夭」技能
    else if (skillId === 'tao_zhi_yao_yao') {
      // 选择3格范围内的1个敌方角色，造成150%攻击力的伤害，并陷入【迷离】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加迷离状态
          addStatusToCharacter(target, 'mili', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【迷离】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「桃花灼灼」「浮光掠影」「阴阳气合」等治疗技能
    const healSkillIds2 = ['tao_hua_zhuo_zhuo', 'fu_guang_lue_ying', 'yin_yang_qi_he']
    if (healSkillIds2.includes(skillId)) {
      processHealSkill(attacker, skill, targetId)
    }
    // 特殊处理「藏剑一叶」技能
    else if (skillId === 'cang_jian_yi_ye') {
      // 选择2格菱形范围内的1个敌方单位，造成200%攻击力的伤害，并使目标陷入【迷离】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加迷离状态
          addStatusToCharacter(target, 'mili', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【迷离】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「沐风为裳」等治疗技能
    const healSkillIds3 = ['mu_feng_wei_shang']
    if (healSkillIds3.includes(skillId)) {
      processHealSkill(attacker, skill, targetId)
    }
    // 特殊处理「怒砸葫芦」技能
    else if (skillId === 'nu_za_hu_lu') {
      // 选择3格范围内的2个敌方角色，造成150%攻击力的伤害，自身获得【脆皮】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        for (const tid of actualTargetIds) {
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += totalDamageAll

        // 自身获得脆皮状态
        addStatusToCharacter(attacker, 'crumble', true)

        if (damagedTargets.length > 0) {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${damagedTargets.join('、')}】分别造成伤害并进入【脆皮】状态`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有命中有效目标`)
        }
      }
    }
    // 特殊处理「碧海潮生」等AOE治疗技能
    const healSkillIds4 = ['bi_hai_chao_sheng']
    if (healSkillIds4.includes(skillId)) {
      processHealSkill(attacker, skill, targetId)
    }
    // 特殊处理「墨影剑光」技能
    else if (skillId === 'mo_ying_jian_guang') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理「幽驹袭天」技能
    else if (skillId === 'you_ju_xi_tian') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理「水漫金山」技能
    else if (skillId === 'shui_man_jin_shan') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    
      // 设置冷却和状态
      attacker.hasActed = true
      if (attacker.isPlayer) {
        const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
        if (attackerChar) {
          const playerSkill = attackerChar.skills.find(s => s.id === skillId)
          if (playerSkill) playerSkill.currentCooldown = skill.cooldown || 1
        }
      } else {
        if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
        attacker.skillCooldowns[skillId] = skill.cooldown || 1
      }
      triggerStatusOnAction(attacker)
      return true
    }
    // 特殊处理「红莲花火」技能
    else if (skillId === 'hong_lian_hua_huo') {
      // 选择3格范围内的1个敌方目标，造成150%攻击力伤害并施加【燃烧】
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetId) {
        const actualIds = Array.isArray(targetId) ? targetId.slice(0, 1) : [targetId]
        for (const tid of actualIds) {
          const target = enemyPool.find(p => p.id === tid)
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            addStatusToCharacter(target, 'burning', true)
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害并使其陷入【燃烧】状态`)
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => b.id === tid)
            if (building) {
              const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「蛇剑毒吻」技能
    else if (skillId === 'she_jian_du_wen') {
      // 选择3格范围内的2个敌方目标，造成120%攻击力伤害并施加【流血】
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetId) {
        const actualIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]
        for (const tid of actualIds) {
          const target = enemyPool.find(p => p.id === tid)
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            addStatusToCharacter(target, 'bleeding', true)
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害并使其陷入【流血】状态`)
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => b.id === tid)
            if (building) {
              const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「邪神低语」技能
    else if (skillId === 'xie_shen_di_yu') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理「扰乱心神」技能
    else if (skillId === 'rao_luan_xin_shen') {
      // 选择2格菱形范围内的1个敌方目标，造成180%攻击力伤害，并驱散目标所有正面状态
      let targetPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      let buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const damageResults: string[] = []
      let handled = 0

      const attackPower = attacker.attack
      const validTargets = targetPool.filter(t => t.id !== attacker.id && Math.abs(t.row - attacker.row) + Math.abs(t.col - attacker.col) <= 2)
      let chosenId = singleTargetId
      if (chosenId && chosenId !== 'empty') {
        const found = validTargets.find(t => t.id === chosenId)
        if (!found) chosenId = ''
      }
      if (!chosenId || chosenId === 'empty') {
        if (validTargets.length > 0) {
          const sorted = [...validTargets].sort((a, b) => b.attack - a.attack)
          chosenId = sorted[0].id
        }
      }
      for (const tid of chosenId ? [chosenId] : []) {
        const target = targetPool.find(t => t.id === tid)
        if (target) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const damage = Math.max(1, Math.floor((skill.power / 100) * attackPower - target.defense))
          target.hp -= damage
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage
          triggerShake(target.row, target.col, 'enemy')
          showFloatingText(target.row, target.col, damage, 'damage')

          const positiveStatuses = Object.keys(STATUS_CONFIG).filter(
            (sid: string) => (STATUS_CONFIG as any)[sid]?.tag === 'positive'
          )
          let dispelCount = 0
          for (const sid of positiveStatuses) {
            const st = (target as any).statuses?.find((s: any) => s.type === sid)
            if (st) {
              (target as any).statuses = (target as any).statuses.filter((s: any) => s.type !== sid)
              dispelCount++
            }
          }

          let log = `对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`
          if (dispelCount > 0) log += `，并驱散${dispelCount}个正面状态`
          damageResults.push(log)
          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
          handled++
        } else {
          const building = buildingPool.find(b => b.id === tid)
          if (building) {
            const damage = Math.max(1, Math.floor((skill.power / 100) * attackPower))
            building.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(building.row, building.col, 'building')
            showFloatingText(building.row, building.col, damage, 'damage')
            damageResults.push(`对【${building.name}】造成${damage}点伤害`)
            if (building.hp <= 0) {
              removeBuildingFromBattle(building.id)
              battleLog.value.push(`【${building.name}】被摧毁！`)
            }
            handled++
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「奕剑听雨」技能
    else if (skillId === 'yi_jian_ting_yu') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
      addStatusToCharacter(attacker, 'strong', true)
      addStatusToCharacter(attacker, 'swift', true)
      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，自身获得【强力】和【迅捷】状态`)
    }
    // 特殊处理「凌云飞剑」技能
    else if (skillId === 'ling_yun_fei_jian') {
      // 选择3格菱形范围内的3个敌方目标，造成130%攻击力伤害
      const range = skill.range || 3
      const maxTargets = skill.targetCount || 3
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetIds && targetIds.length > 0) {
        const actualIds = [...targetIds].slice(0, maxTargets)
        for (const tid of actualIds) {
          // 过滤菱形范围内的目标
          const target = enemyPool.find(p => {
            if (p.id !== tid) return false
            const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col)
            return dist <= range
          })
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => {
              if (b.id !== tid) return false
              const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
              return dist <= range
            })
            if (building) {
              const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「聚气成刃」技能
    else if (skillId === 'ju_qi_cheng_ren') {
      // 选择3格菱形范围内的2个敌方目标，造成150%攻击力伤害
      const range = skill.range || 3
      const maxTargets = skill.targetCount || 2
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetIds && targetIds.length > 0) {
        const actualIds = [...targetIds].slice(0, maxTargets)
        for (const tid of actualIds) {
          const target = enemyPool.find(p => {
            if (p.id !== tid) return false
            const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col)
            return dist <= range
          })
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => {
              if (b.id !== tid) return false
              const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
              return dist <= range
            })
            if (building) {
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「阴阳傀儡术」技能
    else if (skillId === 'yin_yang_kui_lei_shu') {
      // 选择3格菱形范围内的1个敌方目标，造成180%攻击力伤害，并使目标陷入【脆弱】状态
      const range = skill.range || 3
      const maxTargets = skill.targetCount || 1
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetIds && targetIds.length > 0) {
        const actualIds = [...targetIds].slice(0, maxTargets)
        for (const tid of actualIds) {
          const target = enemyPool.find(p => {
            if (p.id !== tid) return false
            const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col)
            return dist <= range
          })
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害，并陷入【脆弱】状态`)
            addStatusToCharacter(target, 'fragile')
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => {
              if (b.id !== tid) return false
              const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
              return dist <= range
            })
            if (building) {
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「猛虎下山」技能
    else if (skillId === 'meng_hu_xia_shan') {
      const range = skill.range || 1
      const maxTargets = skill.targetCount || 1
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetIds && targetIds.length > 0) {
        const actualIds = [...targetIds].slice(0, maxTargets)
        for (const tid of actualIds) {
          const target = enemyPool.find(p => {
            if (p.id !== tid) return false
            const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col)
            return dist <= range
          })
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => {
              if (b.id !== tid) return false
              const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
              return dist <= range
            })
            if (building) {
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「猛虎嘶吼」技能
    else if (skillId === 'meng_hu_si_hou') {
      const range = skill.range || 3
      const maxTargets = skill.targetCount || 2
      const enemyPool = attacker.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const buildingPool = battleMap.value.buildings.filter(b => b.isPlayer !== attacker.isPlayer)
      const attackPower = computeAttackPower(attacker)
      const damageResults: string[] = []
      let handled = 0

      if (targetIds && targetIds.length > 0) {
        const actualIds = [...targetIds].slice(0, maxTargets)
        for (const tid of actualIds) {
          const target = enemyPool.find(p => {
            if (p.id !== tid) return false
            const dist = Math.abs(p.row - attacker.row) + Math.abs(p.col - attacker.col)
            return dist <= range
          })
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
            target.hp -= damage
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害，并陷入【脆弱】状态`)
            addStatusToCharacter(target, 'fragile')
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
            }
            handled++
          } else {
            const building = buildingPool.find(b => {
              if (b.id !== tid) return false
              const dist = Math.abs(b.row - attacker.row) + Math.abs(b.col - attacker.col)
              return dist <= range
            })
            if (building) {
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              building.hp -= damage
              if (attacker.totalDamage === undefined) attacker.totalDamage = 0
              attacker.totalDamage += damage
              triggerShake(building.row, building.col, 'building')
              showFloatingText(building.row, building.col, damage, 'damage')
              damageResults.push(`对【${building.name}】造成${damage}点伤害`)
              if (building.hp <= 0) {
                removeBuildingFromBattle(building.id)
                battleLog.value.push(`【${building.name}】被摧毁！`)
              }
              handled++
            }
          }
        }
      }

      if (handled > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，未命中任何目标！`)
      }
    }
    // 特殊处理「远程导弹」技能
    else if (skillId === 'yuan_cheng_dao_dan') {
      let centerRow = attacker.row
      let centerCol = attacker.col
      
      if (targetPos) {
        centerRow = targetPos.row
        centerCol = targetPos.col
      } else if (singleTargetId && singleTargetId !== 'empty') {
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const targetChar = allChars.find(c => c.id === singleTargetId)
        if (targetChar) {
          centerRow = targetChar.row
          centerCol = targetChar.col
        } else {
          const targetBuilding = battleMap.value.buildings.find(b => b.id === singleTargetId)
          if (targetBuilding) {
            centerRow = targetBuilding.row
            centerCol = targetBuilding.col
          }
        }
      }
      processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate)
    }
    // 特殊处理「千里冰封」技能
    else if (skillId === 'qian_li_bing_feng') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    } 
    // 特殊处理「凶猛攻击」技能
    else if (skillId === 'fierce_attack') {
      // 对范围1格的指定目标，造成150%攻击力的伤害
      let hadValidTargets = false
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        hadValidTargets = targets.length > 0
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          // 使用战斗角色存储的属性（带装备加成）
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower + (skill.hpPct || 0) * attacker.hp - defense)))
          target.hp -= damage
          
          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage
          
          // 添加被攻击抖动特效
          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
          
          // 清除范围内的所有障碍物（凶猛攻击范围1格）
          const range1 = 1
          let destroyedCount = 0
          for (let r = -range1; r <= range1; r++) {
            for (let c = -range1; c <= range1; c++) {
              const nr = attacker.row + r
              const nc = attacker.col + c
              const distance = Math.abs(r) + Math.abs(c)
              if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
                if (distance <= range1 && battleMap.value.tiles[nr]?.[nc]?.terrain === 'obstacle') {
                  battleMap.value.tiles[nr]![nc]!.terrain = 'empty'
                  destroyedCount++
                }
              }
            }
          }
          if (destroyedCount > 0) {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，摧毁了${destroyedCount}个障碍物！`)
          }
        }
      }
    }
    // 特殊处理「暗影刺杀」技能
    else if (skillId === 'shadow_assassination') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理「投掷手雷」技能（参考远程导弹）
    else if (skillId === 'throw_grenade') {
      // 以选择的格子为中心，菱形范围1格的敌方目标
      let centerRow = attacker.row
      let centerCol = attacker.col
      
      if (targetPos) {
        centerRow = targetPos.row
        centerCol = targetPos.col
      } else if (singleTargetId && singleTargetId !== 'empty') {
        // 尝试从目标ID查找角色或建筑位置
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const targetChar = allChars.find(c => c.id === singleTargetId)
        if (targetChar) {
          centerRow = targetChar.row
          centerCol = targetChar.col
        } else {
          const targetBuilding = battleMap.value.buildings.find(b => b.id === singleTargetId)
          if (targetBuilding) {
            centerRow = targetBuilding.row
            centerCol = targetBuilding.col
          }
        }
      }
      const areaRange = skill.areaRange || 1
      
      // 收集敌方角色（曼哈顿距离 <= areaRange）
      const enemyChars = attacker.isPlayer 
        ? battleMap.value.enemies.filter(enemy => {
            const dist = Math.abs(enemy.row - centerRow) + Math.abs(enemy.col - centerCol)
            return dist <= areaRange
          })
        : battleMap.value.players.filter(playerChar => {
            const dist = Math.abs(playerChar.row - centerRow) + Math.abs(playerChar.col - centerCol)
            return dist <= areaRange
          })
      
      // 收集敌方建筑（曼哈顿距离 <= areaRange）
      const enemyBuildings = battleMap.value.buildings.filter(building => {
        const dist = Math.abs(building.row - centerRow) + Math.abs(building.col - centerCol)
        return dist <= areaRange && building.isPlayer !== attacker.isPlayer
      })
      
      // 收集范围内的障碍物位置（曼哈顿距离 <= areaRange）
      const obstaclePositions: { row: number; col: number }[] = []
      const aoeGridPositions: { row: number; col: number }[] = []
      for (let dr = -areaRange; dr <= areaRange; dr++) {
        for (let dc = -areaRange; dc <= areaRange; dc++) {
          const dist = Math.abs(dr) + Math.abs(dc)
          if (dist <= areaRange) {
            const r = centerRow + dr
            const c = centerCol + dc
            if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
              aoeGridPositions.push({ row: r, col: c })
              if (battleMap.value.tiles[r]![c]!.terrain === 'obstacle') {
                obstaclePositions.push({ row: r, col: c })
              }
            }
          }
        }
      }
      
      triggerAOEEffects(centerRow, centerCol, areaRange, skill.attribute || 'normal', 'diamond', 'attack', '轰炸')
      
      // 投射物动画
      const projType = getProjectileTypeForSkill(skill)
      if (projType) {
        triggerProjectile(attacker.row, attacker.col, centerRow, centerCol, projType, skill.attribute || 'fire')
      }
      
      const hadValidTargets = enemyChars.length > 0 || enemyBuildings.length > 0 || obstaclePositions.length > 0
      
      const damageResults: string[] = []
      
      // 攻击敌方角色
      enemyChars.forEach(target => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const attackPower = computeAttackPower(attacker)
        
        const defense = computeDefensePower(target)
        
        const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
        target.hp -= damage
        
        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage
        
        triggerShake(target.row, target.col, 'character')
        triggerHitFlash(target.row, target.col)
        
        showFloatingText(target.row, target.col, damage, 'damage')
        
        damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)
        
        if (target.hp <= 0) {
          removeCharacterFromBattle(target.id, target.isPlayer)
          triggerDefeatAnimation(target.row, target.col, 'kill')
          battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
        }
      })
      
      // 攻击敌方建筑
      enemyBuildings.forEach(building => {
        const attackPower = computeAttackPower(attacker)
        
        const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
        building.hp -= damage
        
        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage
        
        triggerShake(building.row, building.col, 'building')
        triggerHitFlash(building.row, building.col, attribute)
        
        showFloatingText(building.row, building.col, damage, 'damage', attribute, true)
        
        damageResults.push(`对【${building.name}】造成${damage}点伤害`)
        
        if (building.type === 'heart' && !building.hasSpawnedBonus) {
          building.hasSpawnedBonus = true
          spawnVariantZombieFromHeart(building)
        }
        
        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id)
          triggerDefeatAnimation(building.row, building.col, 'kill')
          battleLog.value.push(`【${building.name}】被摧毁！`)
        }
      })
      
      // 清除范围内障碍物
      obstaclePositions.forEach(pos => {
        battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
        triggerShake(pos.row, pos.col, 'terrain')
        damageResults.push('摧毁了一个障碍物')
      })
      
      if (hadValidTargets) {
        const summary = damageResults.join('，')
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】命中 ${enemyChars.length + enemyBuildings.length + obstaclePositions.length} 个目标：${summary}`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标`)
      }
    }
    // 特殊处理「口吐粘液」技能
    else if (skillId === 'spit_slime') {
      // 向2格范围内的指定目标吐出粘液，造成140%攻击力的伤害，并且防御力减少50%
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          // 使用战斗角色存储的属性（带装备加成）
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          
          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage

          // 添加被攻击抖动特效
          triggerShake(target.row, target.col, 'character')
          
          // 使目标进入【虚弱】状态（防御力-50%，持续到战斗结束，可叠加）
          addStatusToCharacter(target, 'weak', true)
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！【${targetTemplate?.name || target.characterId}】进入【虚弱】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    } 
    // 特殊处理「二爷咆哮」技能：对目标造成150%攻击力伤害，并使自身进入【愤怒】状态
    else if (skillId === 'er_ye_pao_xiao') {
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          // 使用战斗角色存储的属性（带装备加成）
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          
          // 添加被攻击抖动特效
          triggerShake(target.row, target.col, 'character')
          
          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage
          
          // 使自身进入【愤怒】状态（攻击力+20%，防御力-20%）
          addStatusToCharacter(attacker, 'fury')
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害，自身进入【愤怒】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    } 
    // 特殊处理「邪恶捆绑」技能
    else if (skillId === 'xie_e_kun_bang') {
      // 对4格范围内的一个指定目标造成150%攻击力的伤害，并使目标陷入【禁锢】状态
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          // 使用战斗角色存储的属性（带装备加成）
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          
          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage

          // 添加被攻击抖动特效
          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加禁锢状态
          addStatusToCharacter(target, 'imprison')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！【${targetTemplate?.name || target.characterId}】陷入【禁锢】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    } 
    // 特殊处理「汲取生命」技能
    else if (skillId === 'life_drain') {
      // 对5格范围内的一个指定目标造成120%攻击力的伤害，并恢复自身造成伤害33%的生命值
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          // 使用战斗角色存储的属性（带装备加成）
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          const healAmount = Math.floor(damage * (skill.lifesteal || 0.333))
          target.hp -= damage
          
          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage
          
          // 添加被攻击抖动特效
          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！`)
          
          // 恢复自身生命值
          const attackerCharTemplate = findCharacterTemplateInStore(attacker.characterId)
          const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100
          attacker.hp = Math.min(attacker.hp + healAmount, maxHp)
          
          // 更新治疗统计
          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += healAmount
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】恢复了${healAmount}点生命值（造成伤害的33%）！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    }
    // 特殊处理「息壤再生」技能
    else if (skillId === 'xi_rang_zai_sheng') {
      // 选择相邻1格范围内的一个敌方目标，造成120%攻击力的伤害，恢复自身60%攻击力的生命值，自身获得【刚毅】状态
      if (targetId) {
        const targets = attacker.isPlayer 
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)
        
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const attackPower = computeAttackPower(attacker)
          
          const defense = computeDefensePower(target)
          
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          const healAmount = Math.floor(0.6 * (charTemplate.attack || charTemplate.baseAttack || 20))
          target.hp -= damage
          
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage
          
          triggerShake(target.row, target.col, 'character')
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！`)
          
          // 恢复自身生命值
          const attackerCharTemplate = findCharacterTemplateInStore(attacker.characterId)
          const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100
          attacker.hp = Math.min(attacker.hp + healAmount, maxHp)
          
          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += healAmount
          
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】恢复了${healAmount}点生命值！`)
          
          // 自身获得【刚毅】状态
          addStatusToCharacter(attacker, 'resolute')
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】进入【刚毅】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    }
    // 特殊处理【冰封之门】技能：在选中的空格位置生成障碍物
    else if (skillId === 'bing_feng_zhi_men') {
      let createdCount = 0
      const maxTargets = skill.targetCount || 2
      const map = battleMap.value
      for (let i = 0; i < Math.min(targetIds.length, maxTargets); i++) {
        const tid = targetIds[i]
        if (!tid || !tid.startsWith('pos_')) continue
        const parts = tid.split('_')
        if (parts.length !== 3) continue
        const r = parseInt(parts[1])
        const c = parseInt(parts[2])
        if (isNaN(r) || isNaN(c)) continue
        if (r < 0 || r >= map.height || c < 0 || c >= map.width) continue
        const tile = map.tiles[r]?.[c]
        if (!tile) continue
        // 确保格子是空格（没有角色、没有建筑、不是障碍物/河流）
        const hasChar = [...map.players, ...map.enemies].some(x => x.row === r && x.col === c)
        const hasBuilding = map.buildings.some(b => b.row === r && b.col === c)
        if (hasChar || hasBuilding) continue
        if (tile.terrain === 'obstacle' || tile.terrain === 'river') continue
        // 在空格生成障碍物
        tile.terrain = 'obstacle'
        createdCount++
        triggerShake(r, c, 'character')
      }
      if (createdCount > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，生成了${createdCount}个障碍物！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有合适的目标位置。`)
      }
    }
    // 特殊处理【绝处逢生】技能
    else if (skillId === 'jue_chu_feng_sheng') {
      // 消耗自身最大生命值20%的生命（消耗后生命值至少为1）
      const attackerCharTemplate = findCharacterTemplateInStore(attacker.characterId)
      const maxHp = attackerCharTemplate?.maxHp || attackerCharTemplate?.baseMaxHp || 100
      const hpCost = Math.floor(maxHp * 0.2)
      const newHp = Math.max(1, attacker.hp - hpCost)
      attacker.hp = newHp

      // 显示伤害飘字（自身消耗）
      showFloatingText(attacker.row, attacker.col, hpCost, 'damage')

      // 进入【愤怒】状态（攻击力+20%，防御力-20%，持续到战斗结束）
      addStatusToCharacter(attacker, 'fury')

      battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，消耗${hpCost}点生命值，进入【愤怒】状态！`)
    }
    // 特殊处理【红花绿叶】技能
    else if (skillId === 'hong_hua_lv_ye') {
      // 选择1格范围内的1个指定目标，造成攻击力120%的伤害
      // 同时提高生命值上限并恢复生命值，提高和恢复量为攻击力的80%
      if (targetId) {
        // 计算攻击力（包含装备加成和技能效果）- 先计算好用于自身buff
        const attackPower = computeAttackPower(attacker)

        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 3. 只要有有效目标就提高自身血量上限并恢复（攻击力的80%）
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          const hpBuff = Math.floor(attackPower * 0.8)
          attacker.maxHp = (attacker.maxHp || charTemplate?.maxHp || 100) + hpBuff
          attacker.hp = Math.min(attacker.hp + hpBuff, attacker.maxHp)

          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += hpBuff

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！生命值上限+${hpBuff}并恢复${hpBuff}生命！`)
        }
      }
    }
    // 特殊处理【天寒地冻】技能
    else if (skillId === 'tian_han_di_dong') {
      // 选择3格范围内的1个角色，造成攻击力150%的伤害
      // 同时在目标脚下产生雪地，持续1回合
      if (targetId) {
        // 1. 对目标造成150%攻击力的伤害
        const damageTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        if (damageTargets.length > 0) {
          const target = damageTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          const attackPower = computeAttackPower(attacker)

          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage

          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage

          triggerShake(target.row, target.col, 'character')

          // 2. 在目标脚下产生雪地，持续1回合
          // 玩家使用：雪地持续到下一次敌方回合结束 → expiresAfterPhase = 'enemy'
          // 敌方使用：雪地持续到下一次玩家回合结束 → expiresAfterPhase = 'player'
          const expiresAfterPhase: 'player' | 'enemy' = attacker.isPlayer ? 'enemy' : 'player'

          // 避免在同一位置重复添加
          const alreadyHasSnow = battleMap.value.snowAreas.some(
            s => s.row === target.row && s.col === target.col
          )
          if (!alreadyHasSnow) {
            battleMap.value.snowAreas.push({
              row: target.row,
              col: target.col,
              source: 'skill',
              expiresAfterPhase: expiresAfterPhase,
            })
          }

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！目标脚下产生雪地！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        }
      }
    }
    // 特殊处理【恐怖尖叫】技能
    else if (skillId === 'terror_scream') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理【腐蚀粘液】技能
    else if (skillId === 'fushi_nianye') {
      // 生命值<=20%时才能使用，以自身为中心，2格范围内所有敌方目标造成225%攻击力伤害
      // 同时减少目标50%防御（持续到战斗结束），使用后自身直接战败退场
      const areaRange = skill.areaRange || 2

      // 检查生命值条件（仅玩家角色需要检查，AI会自己判断）
      const attackerMaxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100)
      const hpPercent = attacker.hp / attackerMaxHp

      if (hpPercent > 0.2 && attacker.isPlayer) {
        // 玩家使用时生命值不符合条件
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】生命值过高，无法使用【${skill.name}】！`)
        return
      }

      // 收集范围内的敌方角色
      const enemyTargets = attacker.isPlayer
        ? battleMap.value.enemies.filter(enemy => {
            const rowDiff = Math.abs(enemy.row - attacker.row)
            const colDiff = Math.abs(enemy.col - attacker.col)
            return rowDiff <= areaRange && colDiff <= areaRange
          })
        : battleMap.value.players.filter(playerChar => {
            const rowDiff = Math.abs(playerChar.row - attacker.row)
            const colDiff = Math.abs(playerChar.col - attacker.col)
            return rowDiff <= areaRange && colDiff <= areaRange
          })

      // 收集范围内的敌方建筑
      const enemyBuildings = battleMap.value.buildings.filter(building => {
        const rowDiff = Math.abs(building.row - attacker.row)
        const colDiff = Math.abs(building.col - attacker.col)
        return rowDiff <= areaRange && colDiff <= areaRange && building.isPlayer !== attacker.isPlayer
      })

      // 收集范围内的障碍物位置（正方形范围）
      const obstaclePositions: { row: number; col: number }[] = []
      for (let dr = -areaRange; dr <= areaRange; dr++) {
        for (let dc = -areaRange; dc <= areaRange; dc++) {
          const r = attacker.row + dr
          const c = attacker.col + dc
          if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
            if (battleMap.value.tiles[r]![c]!.terrain === 'obstacle') {
              obstaclePositions.push({ row: r, col: c })
            }
          }
        }
      }

      // 计算攻击力（包含装备加成和技能效果）
      const attackPower = computeAttackPower(attacker)

      // 对范围内敌方角色造成伤害并减少防御
      const damageResults: string[] = []
      const defeatedNames: string[] = []

      enemyTargets.forEach(target => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const defense = computeDefensePower(target)

        const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
        target.hp -= damage

        // 使目标进入【虚弱】状态（防御力-50%，持续到战斗结束）
        addStatusToCharacter(target, 'weak', true)

        // 更新伤害统计
        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage

        // 触发抖动
        triggerShake(target.row, target.col, 'character')
        
        showFloatingText(target.row, target.col, damage, 'damage')

        damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

        if (target.hp <= 0) {
          removeCharacterFromBattle(target.id, target.isPlayer)
          defeatedNames.push(targetTemplate?.name || target.characterId)
        }
      })

      // 对范围内敌方建筑造成伤害
      const destroyedBuildings: string[] = []
      enemyBuildings.forEach(building => {
        const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
        building.hp -= damage

        // 更新伤害统计
        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage

        // 触发抖动
        triggerShake(building.row, building.col, 'building')
        
        showFloatingText(building.row, building.col, damage, 'damage')

        damageResults.push(`对【${building.name}】造成${damage}点伤害`)

        trySpawnZombieFromHeart(building)

        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id)
          battleMap.value!.tiles[building.row]![building.col]!.building = null
          destroyedBuildings.push(building.name)
        }
      })

      // 清除范围内的障碍物
      obstaclePositions.forEach(pos => {
        battleMap.value.tiles[pos.row]![pos.col]!.terrain = 'empty'
        triggerShake(pos.row, pos.col, 'character')
      })
      if (obstaclePositions.length > 0) {
        damageResults.push(`清除了${obstaclePositions.length}个障碍物`)
      }

      // 合并日志输出
      const totalHits = enemyTargets.length + enemyBuildings.length + obstaclePositions.length
      if (totalHits > 0) {
        const summary = damageResults.join('，')
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】命中 ${totalHits} 个目标：${summary}，受击目标防御力-50%`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标`)
      }

      defeatedNames.forEach(name => {
        battleLog.value.push(`【${name}】被击败！`)
      })
      destroyedBuildings.forEach(name => {
        battleLog.value.push(`【${name}】被摧毁！`)
      })

      // 使用后自身直接战败退场
      const attackerName = charTemplate?.name || attacker.characterId
      battleLog.value.push(`【${attackerName}】在腐蚀粘液的爆炸中化为灰烬！`)
      removeCharacterFromBattle(attacker.id, attacker.isPlayer)
    }
    // 特殊处理【天崩地裂】技能
    else if (skillId === 'tian_beng_di_lie') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理【举火焚天】技能：对目标造成120%攻击力伤害，并使自身进入【强力】状态（攻击+10%）
    else if (skillId === 'ju_huo_fen_tian') {
      if (targetId) {
        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）- 先计算好
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 3. 有有效目标时，使自身进入【强力】状态（攻击+10%）
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          // 使自身进入【强力】状态
          addStatusToCharacter(attacker, 'strong')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！自身进入【强力】状态！`)
        }
      }
    }
    // 特殊处理【落土飞岩】技能
    else if (skillId === 'luo_tu_fei_yan') {
      if (targetId) {
        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 3. 有有效目标时，使自身进入【强力】状态
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          addStatusToCharacter(attacker, 'strong')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！自身进入【强力】状态！`)
        }
      }
    }
    // 特殊处理【大地重击】技能
    else if (skillId === 'da_di_zhong_ji') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理【魔殓鬼手】技能
    else if (skillId === 'mo_lian_gui_shou') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理【蛮甲冲击】技能：对目标造成伤害，并使自身进入【刚毅】状态（防御+30%）
    else if (skillId === 'man_jia_chong_ji') {
      if (targetId) {
        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 有有效目标时，使自身进入【刚毅】状态（防御力+30%，持续到战斗结束）
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          // 进入【刚毅】状态
          addStatusToCharacter(attacker, 'resolute')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！自身进入【刚毅】状态！`)
        }
      }
    }
    // 特殊处理【碎裂重击】技能
    else if (skillId === 'sui_lie_zhong_ji') {
      // 选择相邻1格的1个目标，造成攻击力200%的伤害，并使目标陷入【眩晕】状态（持续1回合）
      if (targetId) {
        // 1. 对角色目标造成伤害并施加眩晕
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加眩晕状态（持续1回合，回合结束时自动清除）
          addStatusToCharacter(target, 'stun')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【眩晕】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理【碎星】技能
    else if (skillId === 'sui_xing') {
      // 选择4格范围内的1个敌方单位，造成200%攻击力的伤害，并使目标陷入【流血】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          const damage = calculateSkillDamage(attacker, target, skill)
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')

          showFloatingText(target.row, target.col, damage, 'damage')

          addStatusToCharacter(target, 'bleeding', true)

          const skillAttribute = skill.attribute || 'normal'
          triggerSkillEffect(target.row, target.col, skillAttribute, 'medium', 'attack', '指定', attacker.row, attacker.col)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标进入【流血】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = calculateSkillDamage(attacker, targetBuilding, skill)
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理【灵气丝】技能
    else if (skillId === 'lingqisi') {
      // 选择3格范围内的一个指定目标，造成攻击力130%的伤害，同时恢复自身造成伤害38%的生命
      if (targetId) {
        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 3. 有有效目标时，恢复自身50%攻击力的生命
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          // 恢复自身造成伤害38%的生命
          const healAmount = Math.floor(totalDamage * (skill.lifesteal || 0.385))
          const maxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100)
          attacker.hp = Math.min(attacker.hp + healAmount, maxHp)

          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += healAmount

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！恢复${healAmount}点生命（造成伤害的38%）！`)
        }
      }
    }
    // 特殊处理【摘叶飞花】技能
    else if (skillId === 'zhai_ye_fei_hua') {
      // 选择3格范围内的1个指定目标，造成(100%+20%*与目标距离)攻击力的伤害，并使目标进入【流血】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        // 计算与目标的距离
        let distance = 1
        if (charTargets.length > 0) {
          const target = charTargets[0]
          distance = Math.abs(target.row - attacker.row) + Math.abs(target.col - attacker.col)
        } else if (buildingTargets.length > 0) {
          const target = buildingTargets[0]
          distance = Math.abs(target.row - attacker.row) + Math.abs(target.col - attacker.col)
        }

        // 伤害威力 = (100% + 20%*距离)
        const effectivePower = skill.power + 20 * distance

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((effectivePower / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加流血状态
          addStatusToCharacter(target, 'bleeding', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标进入【流血】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(effectivePower / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理【万叶飞花】技能
    else if (skillId === 'wan_ye_fei_hua') {
      // 选择3格范围内的最多2个指定目标，分别造成攻击力110%的伤害，并使目标进入【流血】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        // 对每个目标造成伤害
        for (const tid of actualTargetIds) {
          // 1. 对角色目标造成伤害
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          // 2. 对建筑目标也造成伤害
          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')

            // 施加流血状态
            addStatusToCharacter(target, 'bleeding', true)

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (totalDamageAll > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamageAll
          const targetsStr = damagedTargets.join('、')
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetsStr}】造成总计${totalDamageAll}点伤害！目标进入【流血】状态！`)
        }
      }
    }
    // 特殊处理【阴阳玉手印】技能
    else if (skillId === 'yin_yang_yu_shou_yin') {
      // 选择3格范围内的最多3个指定目标，总计造成300%攻击力的伤害，根据选择的目标数量均摊伤害
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 3) : [targetId]
        const targetCount = actualTargetIds.length

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        // 每个目标的伤害威力 = 总威力 / 目标数
        const perTargetPower = Math.floor(skill.power / targetCount)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        // 对每个目标造成伤害
        for (const tid of actualTargetIds) {
          // 1. 对角色目标造成伤害
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          // 2. 对建筑目标也造成伤害
          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((perTargetPower / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')
            
            showFloatingText(target.row, target.col, damage, 'damage')

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(perTargetPower / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (totalDamageAll > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamageAll
          const targetsStr = damagedTargets.join('、')
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetsStr}】造成总计${totalDamageAll}点伤害！（每个目标${Math.floor(perTargetPower)}%攻击力伤害）`)
        }
      }
    }
    // 特殊处理【吸血】技能
    else if (skillId === 'xi_xue') {
      // 选择相邻1格的1个目标，造成120%攻击力的伤害，并恢复自身造成伤害67%的生命值
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力（包含装备加成和技能效果）
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        // 3. 有有效目标时，恢复自身80%攻击力的生命
        if (charTargets.length > 0 || buildingTargets.length > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage

          // 恢复自身造成伤害67%的生命
          const healAmount = Math.floor(totalDamage * (skill.lifesteal || 0.667))
          const maxHp = attacker.maxHp || (charTemplate?.maxHp || charTemplate?.baseMaxHp || 100)
          const oldHp = attacker.hp
          attacker.hp = Math.min(attacker.hp + healAmount, maxHp)
          const actualHeal = attacker.hp - oldHp

          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += actualHeal

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！恢复${actualHeal}点生命（造成伤害的67%）！`)
        }
      }
    }
    // 特殊处理【灵魂诅咒】技能
    else if (skillId === 'ling_hun_zu_zhou') {
      // 选择5格范围内的1个目标，造成110%攻击力的伤害，并使目标进入【沉默】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加沉默状态，持续3回合
          addStatusToCharacter(target, 'silenced', false, 3)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标进入【沉默】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理【灵魂扰乱】技能
    else if (skillId === 'ling_hun_rao_luan') {
      // 选择3格范围内的2个指定目标，分别造成75%攻击力的伤害，并使目标进入【心乱】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        // 计算攻击力
        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        // 对每个目标造成伤害
        for (const tid of actualTargetIds) {
          // 1. 对角色目标造成伤害
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          // 2. 对建筑目标也造成伤害
          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')

            // 施加心乱状态
            addStatusToCharacter(target, 'xinluan')

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (totalDamageAll > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamageAll
          const targetsStr = damagedTargets.join('、')
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetsStr}】造成总计${totalDamageAll}点伤害！目标进入【心乱】状态！`)
        }
      }
    }
    // 特殊处理【魅惑】技能
    else if (skillId === 'mei_huo') {
      // 选择2格范围内的1个目标，造成120%攻击力的伤害，并使目标进入【心乱】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        // 1. 对角色目标造成伤害
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        // 2. 对建筑目标也造成伤害
        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        // 计算攻击力
        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加心乱状态
          addStatusToCharacter(target, 'xinluan')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标进入【心乱】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「普通护理」技能
    else if (skillId === 'pu_tong_hu_li') {
      // 选择2格范围内的1个友方目标，恢复生命值和法力值，恢复量为50%的攻击力
      if (targetId) {
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const targets = allyPool.filter(p => p.id === targetId)
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          if (charTemplate && targetTemplate) {
            const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * 0.5)
            target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp)
            target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp)

            // 显示治疗和法力飘字
            showFloatingText(target.row, target.col, healAmount, 'heal')
            showFloatingText(target.row, target.col, healAmount, 'mp')

            if (attacker.totalHeal === undefined) attacker.totalHeal = 0
            attacker.totalHeal += healAmount

            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${healAmount}生命和${healAmount}法力！`)
          }
        }
      }
    }
    // 特殊处理「紧急治疗」技能
    else if (skillId === 'jin_ji_zhi_liao') {
      // 选择2格范围内的1个友方目标，恢复生命值和法力值，恢复量为100%的攻击力，并驱散目标所有不良状态
      if (targetId) {
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const targets = allyPool.filter(p => p.id === targetId)
        if (targets.length > 0) {
          const target = targets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          if (charTemplate && targetTemplate) {
            const healAmount = Math.floor(charTemplate.attack || charTemplate.baseAttack || 20)
            target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp)
            target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp)

            // 显示治疗和法力飘字
            showFloatingText(target.row, target.col, healAmount, 'heal')
            showFloatingText(target.row, target.col, healAmount, 'mp')

            // 驱散目标所有不良状态（基于 STATUS_CONFIG 的 tag，新增负面状态会自动识别）
            const dispelledStatuses: string[] = []
            NEGATIVE_STATUSES.forEach(status => {
              if (hasStatus(target, status)) {
                removeStatusFromCharacter(target, status)
                dispelledStatuses.push(STATUS_CONFIG[status].name)
              }
            })

            if (attacker.totalHeal === undefined) attacker.totalHeal = 0
            attacker.totalHeal += healAmount

            if (dispelledStatuses.length > 0) {
              battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${healAmount}生命和${healAmount}法力！驱散目标的【${dispelledStatuses.join('、')}】状态！`)
            } else {
              battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${healAmount}生命和${healAmount}法力！`)
            }
          }
        }
      }
    }
    // 特殊处理「高山流水」技能
    else if (skillId === 'gao_shan_liu_shui') {
      // 选择4格范围内的2个友方目标，恢复生命值和法力值各75%的攻击力，并驱散目标所有不良状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? targetId.slice(0, 2) : [targetId]
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const targets = allyPool.filter(c => actualTargetIds.includes(c.id))
        
        if (charTemplate) {
          const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * 0.75)
          
          for (const target of targets) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            if (!targetTemplate) continue
            
            target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp)
            target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp)
            
            // 显示治疗和法力飘字
            showFloatingText(target.row, target.col, healAmount, 'heal')
            showFloatingText(target.row, target.col, healAmount, 'mp')
            
            // 驱散目标所有不良状态（基于 STATUS_CONFIG 的 tag，新增负面状态会自动识别）
            const dispelledStatuses: string[] = []
            NEGATIVE_STATUSES.forEach(status => {
              if (hasStatus(target, status)) {
                removeStatusFromCharacter(target, status)
                dispelledStatuses.push(STATUS_CONFIG[status].name)
              }
            })
            
            if (attacker.totalHeal === undefined) attacker.totalHeal = 0
            attacker.totalHeal += healAmount
            
            if (dispelledStatuses.length > 0) {
              battleLog.value.push(`【${charTemplate.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate.name || target.characterId}】${healAmount}生命和${healAmount}法力！驱散目标的【${dispelledStatuses.join('、')}】状态！`)
            } else {
              battleLog.value.push(`【${charTemplate.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate.name || target.characterId}】${healAmount}生命和${healAmount}法力！`)
            }
          }
        }
      }
    }
    // 特殊处理「炼狱火海」技能
    else if (skillId === 'lian_yu_huo_hai') {
      processAOEAttackSkill(attacker, skill, attacker.row, attacker.col, charTemplate)
    }
    // 特殊处理「亡者之气」技能
    else if (skillId === 'wang_zhe_zhi_qi') {
      // 选择3格范围内的2个目标，造成100%攻击力的伤害，并使目标陷入【心乱】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        // 计算攻击力
        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        // 对每个目标造成伤害并施加心乱状态
        for (const tid of actualTargetIds) {
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')

            // 施加心乱状态
            addStatusToCharacter(target, 'xinluan')

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        // 更新总伤害统计
        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += totalDamageAll

        // 日志输出
        if (damagedTargets.length > 0) {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${damagedTargets.join('、')}】分别造成伤害并陷入【紊乱】状态`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有命中有效目标`)
        }
      }
    }
    // 特殊处理「骷髅血手印」技能
    else if (skillId === 'ku_lou_xue_shou_yin') {
      // 选择3格范围内的1个目标，造成160%攻击力的伤害，并使目标陷入【流血】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加流血状态
          addStatusToCharacter(target, 'bleeding', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【流血】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「六魂恐咒」技能
    else if (skillId === 'liu_hun_kong_zhou') {
      // 选择2格范围内的1个目标，造成150%攻击力的伤害，并使目标陷入【中毒】和【沉默】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加中毒和沉默状态
          addStatusToCharacter(target, 'poison')
          addStatusToCharacter(target, 'silenced')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【中毒】与【沉默】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「治愈之光」技能
    else if (skillId === 'zhi_yu_zhi_guang') {
      // 选择3格范围内的1个友方目标，恢复自己和该目标100%攻击力的生命值与法力值，并驱散目标所有不良状态
      if (targetId) {
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const allyTargets = allyPool.filter(p => p.id === targetId)
        // 施法者自己也是治疗目标
        const self = attacker

        if (charTemplate) {
          const healAmount = Math.floor((charTemplate.attack || charTemplate.baseAttack || 20) * (skill.power / 100))

          // 治疗施法者自己
          const selfTemplate = findCharacterTemplateInStore(self.characterId)
          if (selfTemplate) {
            self.hp = Math.min(self.hp + healAmount, selfTemplate.maxHp)
            self.mp = Math.min(self.mp + healAmount, selfTemplate.maxMp)
            if (attacker.totalHeal === undefined) attacker.totalHeal = 0
            attacker.totalHeal += healAmount
          }

          // 治疗并驱散友方目标
          if (allyTargets.length > 0) {
            const target = allyTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            if (targetTemplate) {
              target.hp = Math.min(target.hp + healAmount, targetTemplate.maxHp)
              target.mp = Math.min(target.mp + healAmount, targetTemplate.maxMp)

              // 驱散目标所有不良状态（基于 STATUS_CONFIG 的 tag，新增负面状态会自动识别）
              const dispelledStatuses: string[] = []
              NEGATIVE_STATUSES.forEach(status => {
                if (hasStatus(target, status)) {
                  removeStatusFromCharacter(target, status)
                  dispelledStatuses.push(STATUS_CONFIG[status].name)
                }
              })

              if (attacker.totalHeal === undefined) attacker.totalHeal = 0
              attacker.totalHeal += healAmount

              if (dispelledStatuses.length > 0) {
                battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复自身与【${targetTemplate?.name || target.characterId}】各${healAmount}生命和${healAmount}法力！驱散目标的【${dispelledStatuses.join('、')}】状态！`)
              } else {
                battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复自身与【${targetTemplate?.name || target.characterId}】各${healAmount}生命和${healAmount}法力！`)
              }
            }
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复自身${healAmount}生命和${healAmount}法力！`)
          }
        }
      }
    }
    // 特殊处理「天雅倾情」技能
    else if (skillId === 'tian_ya_qing_qing') {
      // 选择4格范围内的1个友方目标，恢复生命值和法力值，恢复量为自身10%生命值和法力值上限，并消除所有不良状态
      if (targetId) {
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const allyTargets = allyPool.filter(p => p.id === targetId)

        if (charTemplate) {
          const hpHeal = Math.floor((charTemplate.maxHp || char.maxHp || 100) * 0.1)
          const mpHeal = Math.floor((charTemplate.maxMp || char.maxMp || 50) * 0.1)

          if (allyTargets.length > 0) {
            const target = allyTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            if (targetTemplate) {
              target.hp = Math.min(target.hp + hpHeal, targetTemplate.maxHp)
              target.mp = Math.min(target.mp + mpHeal, targetTemplate.maxMp)

              // 消除目标所有不良状态（基于 STATUS_CONFIG 的 tag，新增负面状态会自动识别）
              const dispelledStatuses: string[] = []
              NEGATIVE_STATUSES.forEach(status => {
                if (hasStatus(target, status)) {
                  removeStatusFromCharacter(target, status)
                  dispelledStatuses.push(STATUS_CONFIG[status].name)
                }
              })

              if (attacker.totalHeal === undefined) attacker.totalHeal = 0
              attacker.totalHeal += hpHeal

              if (dispelledStatuses.length > 0) {
                battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${hpHeal}生命和${mpHeal}法力！驱散目标的【${dispelledStatuses.join('、')}】状态！`)
              } else {
                battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${hpHeal}生命和${mpHeal}法力！`)
              }
            }
          }
        }
      }
    }
    // 特殊处理「EMP冲击波」技能
    else if (skillId === 'emp_chong_ji_bo') {
      // 选择3格范围内的1个目标，造成150%攻击力的伤害，并使目标陷入【沉默】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加沉默状态，持续3回合
          addStatusToCharacter(target, 'silenced', false, 3)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【沉默】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理「辐射打击」技能
    else if (skillId === 'fu_she_da_ji') {
      // 选择4格范围内的1个目标，造成150%攻击力的伤害，并使目标陷入【中毒】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === actualTargetId)
          : battleMap.value.players.filter(p => p.id === actualTargetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === actualTargetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加中毒状态
          addStatusToCharacter(target, 'poison', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！目标陷入【中毒】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')
          
          showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

          if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
            targetBuilding.hasSpawnedBonus = true
            spawnVariantZombieFromHeart(targetBuilding)
          }

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 统一处理所有召唤类技能
    else if (skill.category === 'summon') {
      processSummonSkill(attacker, skill, targetId ? (Array.isArray(targetId) ? targetId : [targetId]) : [], charTemplate)
    }
    else if (skill.category === '直线') {
      if (typeof targetId === 'string' && ['up', 'down', 'left', 'right'].includes(targetId)) {
        processLineAttackSkill(attacker, skill, targetId as 'up' | 'down' | 'left' | 'right', charTemplate)
      }
    }
    else if (skill.category === '横扫') {
      if (typeof targetId === 'string' && ['up', 'down', 'left', 'right'].includes(targetId)) {
        processSweepAttackSkill(attacker, skill, targetId as 'up' | 'down' | 'left' | 'right', charTemplate)
      }
    }
    else if (skillId === 'an_ye_jin_sheng') {
      if (targetId) {
        const targetIdsList = Array.isArray(targetId) ? targetId : [targetId]
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const attackPower = computeAttackPower(attacker)
        
        const damageResults: string[] = []
        const defeatedNames: string[] = []
        
        targetIdsList.forEach(tid => {
          const target = allChars.find(c => c.id === tid)
          if (target) {
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            
            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage
            
            triggerShake(target.row, target.col, 'character')
            
            // 施加沉默状态，持续3回合
            addStatusToCharacter(target, 'silenced', false, 3)
            
            damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)
            
            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              defeatedNames.push(targetTemplate?.name || target.characterId)
            }
          }
        })
        
        if (damageResults.length > 0) {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！目标进入【沉默】状态！`)
        }
        
        defeatedNames.forEach(name => {
          battleLog.value.push(`【${name}】被击败！`)
        })
      }
    }
    else if (skill.type === 'heal') {
      // 使用统一的治疗技能处理函数
      processHealSkill(attacker, skill, targetId)
    } else if (skillId === 'ju_du_shi_gu') {
      // 巨毒噬骨：对3格范围内1个目标造成120%攻击力伤害，并施加中毒状态
      if (targetId) {
        // 获取目标角色
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const target = allChars.find(c => c.id === (Array.isArray(targetId) ? targetId[0] : targetId))

        if (target) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          // 计算攻击力（包含装备加成和技能效果）
          const attackPower = computeAttackPower(attacker)

          // 计算目标防御
          const defense = computeDefensePower(target)

          // 造成伤害
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage

          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加中毒状态
          addStatusToCharacter(target, 'poison', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！目标进入【中毒】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        } else {
          // 检查目标是否是建筑
          const buildingTarget = battleMap.value.buildings.find(b => b.id === (Array.isArray(targetId) ? targetId[0] : targetId))
          if (buildingTarget && buildingTarget.isPlayer !== attacker.isPlayer) {
            const attackPower = computeAttackPower(attacker)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
            buildingTarget.hp -= damage

            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage

            triggerShake(buildingTarget.row, buildingTarget.col, 'building')

            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${buildingTarget.name}】造成${damage}点伤害！`)

            if (buildingTarget.hp <= 0) {
              removeBuildingFromBattle(buildingTarget.id)
              battleLog.value.push(`【${buildingTarget.name}】被摧毁！`)
            }
          }
        }
      }
    } else if (skillId === 'die_xue_ci_ji') {
      // 喋血刺击：选择相邻1格的1个目标，造成攻击力150%的伤害，并使目标进入【流血】状态
      if (targetId) {
        // 获取目标角色
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const target = allChars.find(c => c.id === (Array.isArray(targetId) ? targetId[0] : targetId))

        if (target) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          // 计算攻击力（包含装备加成和技能效果）
          const attackPower = computeAttackPower(attacker)

          // 计算目标防御
          const defense = computeDefensePower(target)

          // 造成伤害
          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage

          // 更新伤害统计
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += damage

          triggerShake(target.row, target.col, 'character')
          
          showFloatingText(target.row, target.col, damage, 'damage')

          // 施加流血状态
          addStatusToCharacter(target, 'bleeding', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害！目标进入【流血】状态！`)

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetTemplate?.name || target.characterId}】被击败！`)
          }
        } else {
          // 检查目标是否是建筑
          const buildingTarget = battleMap.value.buildings.find(b => b.id === (Array.isArray(targetId) ? targetId[0] : targetId))
          if (buildingTarget && buildingTarget.isPlayer !== attacker.isPlayer) {
            const attackPower = computeAttackPower(attacker)
            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
            buildingTarget.hp -= damage

            if (attacker.totalDamage === undefined) attacker.totalDamage = 0
            attacker.totalDamage += damage

            triggerShake(buildingTarget.row, buildingTarget.col, 'building')

            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${buildingTarget.name}】造成${damage}点伤害！`)

            if (buildingTarget.hp <= 0) {
              removeBuildingFromBattle(buildingTarget.id)
              battleLog.value.push(`【${buildingTarget.name}】被摧毁！`)
            }
          }
        }
      }
    } else if (skillId === 'zi_bao_du_ye') {
      // 自爆毒液：自身为中心3*3方形范围，对所有敌方目标造成150%伤害并施加中毒状态，自身战败退场
      const areaRange = skill.areaRange || 1

      // 收集范围内的敌方角色（正方形范围）
      const enemyTargets = attacker.isPlayer
        ? battleMap.value.enemies.filter(enemy => {
            const rowDiff = Math.abs(enemy.row - attacker.row)
            const colDiff = Math.abs(enemy.col - attacker.col)
            return rowDiff <= areaRange && colDiff <= areaRange
          })
        : battleMap.value.players.filter(playerChar => {
            const rowDiff = Math.abs(playerChar.row - attacker.row)
            const colDiff = Math.abs(playerChar.col - attacker.col)
            return rowDiff <= areaRange && colDiff <= areaRange
          })

      // 收集范围内的敌方建筑
      const enemyBuildings = battleMap.value.buildings.filter(building => {
        const rowDiff = Math.abs(building.row - attacker.row)
        const colDiff = Math.abs(building.col - attacker.col)
        return rowDiff <= areaRange && colDiff <= areaRange && building.isPlayer !== attacker.isPlayer
      })

      // 计算攻击力（包含装备加成和技能效果）
      const attackPower = computeAttackPower(attacker)

      // 对范围内敌方角色造成伤害并施加中毒
      const damageResults: string[] = []
      const defeatedNames: string[] = []

      enemyTargets.forEach(target => {
        const targetTemplate = findCharacterTemplateInStore(target.characterId)
        const defense = computeDefensePower(target)

        const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
        target.hp -= damage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage

        triggerShake(target.row, target.col, 'character')

        addStatusToCharacter(target, 'poison')
        damageResults.push(`对【${targetTemplate?.name || target.characterId}】造成${damage}点伤害`)

        if (target.hp <= 0) {
          removeCharacterFromBattle(target.id, target.isPlayer)
          defeatedNames.push(targetTemplate?.name || target.characterId)
        }
      })

      // 对范围内建筑造成伤害
      const destroyedBuildingNames: string[] = []
      enemyBuildings.forEach(building => {
        const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower)))
        building.hp -= damage

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += damage

        triggerShake(building.row, building.col, 'building')
        
        showFloatingText(building.row, building.col, damage, 'damage')

        damageResults.push(`对【${building.name}】造成${damage}点伤害`)

        trySpawnZombieFromHeart(building)

        if (building.hp <= 0) {
          removeBuildingFromBattle(building.id)
          destroyedBuildingNames.push(building.name)
        }
      })

      // 战斗日志：技能效果
      if (damageResults.length > 0) {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，${damageResults.join('，')}！目标进入【中毒】状态！`)
      } else {
        battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但范围内没有可攻击目标！`)
      }

      defeatedNames.forEach(name => {
        battleLog.value.push(`【${name}】被击败！`)
      })
      destroyedBuildingNames.forEach(name => {
        battleLog.value.push(`【${name}】被摧毁！`)
      })

      // 自爆：自身战败退场
      const selfName = charTemplate?.name || attacker.characterId
      triggerDefeatAnimation(attacker.row, attacker.col, 'self')
      removeCharacterFromBattle(attacker.id, attacker.isPlayer)
      battleLog.value.push(`【${selfName}】在自爆毒液中战败退场！`)

      checkBattleEnd()
    }
    // 特殊处理【告别暝灯】技能
    else if (skillId === 'gao_bie_ming_deng') {
      // 选择3格范围内的2个敌方单位，造成120%攻击力的伤害，并且使目标陷入【脆皮】状态
      if (targetId) {
        const actualTargetIds = Array.isArray(targetId) ? [...targetId].slice(0, 2) : [targetId]

        const attackPower = computeAttackPower(attacker)

        let totalDamageAll = 0
        const damagedTargets: string[] = []

        for (const tid of actualTargetIds) {
          let charTargets = attacker.isPlayer
            ? battleMap.value.enemies.filter(e => e.id === tid)
            : battleMap.value.players.filter(p => p.id === tid)

          let buildingTargets = battleMap.value.buildings.filter(b => b.id === tid && b.isPlayer !== attacker.isPlayer)

          if (charTargets.length > 0) {
            const target = charTargets[0]
            const targetTemplate = findCharacterTemplateInStore(target.characterId)
            const defense = computeDefensePower(target)

            const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
            target.hp -= damage
            totalDamageAll += damage
            const tName = targetTemplate?.name || target.characterId
            damagedTargets.push(tName)

            triggerShake(target.row, target.col, 'character')

            addStatusToCharacter(target, 'crumble', true)

            if (target.hp <= 0) {
              removeCharacterFromBattle(target.id, target.isPlayer)
              battleLog.value.push(`【${tName}】被击败！`)
            }
          } else if (buildingTargets.length > 0) {
            const targetBuilding = buildingTargets[0]
            const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
            targetBuilding.hp -= damage
            totalDamageAll += damage
            damagedTargets.push(targetBuilding.name)

            triggerShake(targetBuilding.row, targetBuilding.col, 'building')
            
            showFloatingText(targetBuilding.row, targetBuilding.col, damage, 'damage')

            if (targetBuilding.type === 'heart' && !targetBuilding.hasSpawnedBonus) {
              targetBuilding.hasSpawnedBonus = true
              spawnVariantZombieFromHeart(targetBuilding)
            }

            if (targetBuilding.hp <= 0) {
              removeBuildingFromBattle(targetBuilding.id)
              battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
              battleLog.value.push(`【${targetBuilding.name}】被摧毁！`)
            }
          }
        }

        if (attacker.totalDamage === undefined) attacker.totalDamage = 0
        attacker.totalDamage += totalDamageAll

        if (damagedTargets.length > 0) {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${damagedTargets.join('、')}】分别造成伤害！目标陷入【脆皮】状态！`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有命中有效目标`)
        }
      }
    }
    // 特殊处理【月之引力】技能
    else if (skillId === 'yue_zhi_yin_li') {
      // 选择2格菱形范围内的1个同阵营目标，使自身和该目标都获得【愈合】和【调息】状态
      if (targetId) {
        const actualTargetId = Array.isArray(targetId) ? targetId[0] : targetId

        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const target = allyPool.find(p => p.id === actualTargetId)

        if (target) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId)

          addStatusToCharacter(attacker, 'heal', true)
          addStatusToCharacter(attacker, 'meditate', true)
          addStatusToCharacter(target, 'heal', true)
          addStatusToCharacter(target, 'meditate', true)

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，自身和【${targetTemplate?.name || target.characterId}】获得【愈合】和【调息】状态！`)
        } else {
          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，但没有找到有效目标！`)
        }
      }
    }
    else if (skillId === 'po_jing_chong_yuan') {
      // 破镜重圆：选择2格菱形范围内的1个目标，造成150%攻击力的伤害，并且如果目标有增益状态，则自身也获得相同的增益状态
      if (targetId) {
        let charTargets = attacker.isPlayer
          ? battleMap.value.enemies.filter(e => e.id === targetId)
          : battleMap.value.players.filter(p => p.id === targetId)

        let buildingTargets = battleMap.value.buildings.filter(b => b.id === targetId && b.isPlayer !== attacker.isPlayer)

        const attackPower = computeAttackPower(attacker)

        let totalDamage = 0
        let targetName = ''

        if (charTargets.length > 0) {
          const target = charTargets[0]
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const defense = computeDefensePower(target)

          const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
          target.hp -= damage
          totalDamage += damage
          targetName = targetTemplate?.name || target.characterId

          triggerShake(target.row, target.col, 'character')

          // 复制目标的增益状态到自身
          const buffStatuses = ['fury', 'strong', 'fierce', 'swift', 'resolute', 'eagle_eye', 'heal', 'regen', 'tune', 'meditate', 'undying']
          const copiedStatusNames: string[] = []
          if (target.statuses) {
            target.statuses.forEach(status => {
              if (buffStatuses.includes(status)) {
                addStatusToCharacter(attacker, status)
                const statusName = STATUS_CONFIG[status as StatusType]?.name || status
                copiedStatusNames.push(statusName)
              }
            })
          }

          if (copiedStatusNames.length > 0) {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！复制了目标的【${copiedStatusNames.join('】【')}】状态！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)
          }

          if (target.hp <= 0) {
            removeCharacterFromBattle(target.id, target.isPlayer)
            battleLog.value.push(`【${targetName}】被击败！`)
          }
        } else if (buildingTargets.length > 0) {
          const targetBuilding = buildingTargets[0]
          const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
          targetBuilding.hp -= damage
          totalDamage += damage
          targetName = targetBuilding.name

          triggerShake(targetBuilding.row, targetBuilding.col, 'building')

          battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，对【${targetName}】造成${totalDamage}点伤害！`)

          if (targetBuilding.hp <= 0) {
            removeBuildingFromBattle(targetBuilding.id)
            battleMap.value!.tiles[targetBuilding.row]![targetBuilding.col]!.building = null
            battleLog.value.push(`【${targetName}】被摧毁！`)
          }
        }

        if (totalDamage > 0) {
          if (attacker.totalDamage === undefined) attacker.totalDamage = 0
          attacker.totalDamage += totalDamage
        }
      }
    }
    // 特殊处理【箭雨】技能
    else if (skillId === 'jian_yu') {
      // 箭雨：选择4格范围内的1个格子为目标，对2格菱形范围内所有敌方目标造成伤害
      let centerRow = attacker.row
      let centerCol = attacker.col

      if (targetPos) {
        centerRow = targetPos.row
        centerCol = targetPos.col
      } else if (singleTargetId && singleTargetId !== 'empty') {
        const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
        const targetChar = allChars.find(c => c.id === singleTargetId)
        if (targetChar) {
          centerRow = targetChar.row
          centerCol = targetChar.col
        } else {
          const targetBuilding = battleMap.value.buildings.find(b => b.id === singleTargetId)
          if (targetBuilding) {
            centerRow = targetBuilding.row
            centerCol = targetBuilding.col
          }
        }
      }
      processAOEAttackSkill(attacker, skill, centerRow, centerCol, charTemplate)
    }
    // 特殊处理【妙手】技能
    else if (skillId === 'miao_shou') {
      if (targetId) {
        const allyPool = attacker.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const target = allyPool.find(p => p.id === targetId)
        if (target && charTemplate) {
          const targetTemplate = findCharacterTemplateInStore(target.characterId)
          const attackPower = computeAttackPower(attacker)
          const healAmount = Math.floor(attackPower * (skill.power / 100))
          
          const currentMaxHp = target.maxHp || (targetTemplate?.maxHp || 100)
          const actualHeal = Math.min(healAmount, currentMaxHp - target.hp)
          target.hp = Math.min(target.hp + healAmount, currentMaxHp)
          
          showFloatingText(target.row, target.col, actualHeal, 'heal')
          
          addStatusToCharacter(target, 'heal', true)
          
          const dispelledStatuses: string[] = []
          NEGATIVE_STATUSES.forEach(status => {
            if (hasStatus(target, status)) {
              removeStatusFromCharacter(target, status)
              dispelledStatuses.push(STATUS_CONFIG[status].name)
            }
          })
          
          if (attacker.totalHeal === undefined) attacker.totalHeal = 0
          attacker.totalHeal += actualHeal
          
          if (dispelledStatuses.length > 0) {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${actualHeal}生命！【${targetTemplate?.name || target.characterId}】获得【愈合】状态！驱散【${targetTemplate?.name || target.characterId}】的【${dispelledStatuses.join('、')}】状态！`)
          } else {
            battleLog.value.push(`【${charTemplate?.name || attacker.characterId}】使用技能【${skill.name}】，恢复【${targetTemplate?.name || target.characterId}】${actualHeal}生命！【${targetTemplate?.name || target.characterId}】获得【愈合】状态！`)
          }
        }
      }
    } else {
      processSingleOrMultiTargetSkill(attacker, skill, targetIds, charTemplate)
    }

    

    attacker.hasActed = true
    
    // Apply cooldown
    if (attacker.isPlayer) {
      const attackerChar = player.value.characters.find(c => c.id === attacker.characterId)
      if (attackerChar) {
        // 初始上场的玩家角色：设置玩家角色列表中的冷却
        const playerSkill = attackerChar.skills.find(s => s.id === skillId)
        if (playerSkill) playerSkill.currentCooldown = skill.cooldown
      } else {
        // 召唤出来的玩家阵营角色：使用 skillCooldowns 设置冷却
        if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
        attacker.skillCooldowns[skillId] = skill.cooldown
      }
    } else {
      if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
      attacker.skillCooldowns[skillId] = skill.cooldown
    }

    // 触发中毒（操作时触发的状态）
    triggerStatusOnAction(attacker)

    // 在攻击者位置触发技能光效
    const skillAttribute = skill.attribute || 'normal'
    const skillType = skill.type as 'attack' | 'heal' | 'support' | 'summon' | 'special' || 'attack'
    if (skill.type === 'attack' || skill.type === 'support') {
      triggerSkillEffect(attacker.row, attacker.col, skillAttribute, 'large', skillType)
      
      // 在目标位置触发技能光效
      if (targetIds && targetIds.length > 0) {
        targetIds.forEach(tid => {
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
          const targetChar = allChars.find(c => c.id === tid)
          if (targetChar) {
            triggerSkillEffect(targetChar.row, targetChar.col, skillAttribute, 'medium', skillType)
          }
          const targetBuilding = battleMap.value.buildings.find(b => b.id === tid)
          if (targetBuilding) {
            triggerSkillEffect(targetBuilding.row, targetBuilding.col, skillAttribute, 'medium', skillType)
          }
        })
      }
    }

    checkBattleEnd()

    return true
  }
  
  // 辅助函数：移除角色并保存到 defeatedCharacters 列表
  function removeCharacterFromBattle(charId: string, isPlayer: boolean) {
    if (!battleMap.value) return
    
    if (isPlayer) {
      const idx = battleMap.value.players.findIndex(p => p.id === charId)
      if (idx !== -1) {
        const char = battleMap.value.players[idx]
        // 保存到 defeatedCharacters 列表
        if (!battleMap.value.defeatedCharacters) {
          battleMap.value.defeatedCharacters = []
        }
        battleMap.value.defeatedCharacters.push(char)
        battleMap.value.players.splice(idx, 1)
      }
    } else {
      const idx = battleMap.value.enemies.findIndex(e => e.id === charId)
      if (idx !== -1) {
        const char = battleMap.value.enemies[idx]
        // 保存到 defeatedCharacters 列表
        if (!battleMap.value.defeatedCharacters) {
          battleMap.value.defeatedCharacters = []
        }
        battleMap.value.defeatedCharacters.push(char)
        battleMap.value.enemies.splice(idx, 1)
      }
    }
  }
  
  // 辅助函数：移除建筑并保存到 destroyedBuildings 列表
  function removeBuildingFromBattle(buildingId: string) {
    if (!battleMap.value) return
    
    const idx = battleMap.value.buildings.findIndex(b => b.id === buildingId)
    if (idx !== -1) {
      const building = battleMap.value.buildings[idx]
      // 保存到 destroyedBuildings 列表
      if (!battleMap.value.destroyedBuildings) {
        battleMap.value.destroyedBuildings = []
      }
      battleMap.value.destroyedBuildings.push(building)
      battleMap.value.buildings.splice(idx, 1)
    }
  }

  function checkBattleEnd(): boolean {
    if (!battleMap.value) return false

    // 检查是否还有敌方建筑
    const hasEnemyBuildings = battleMap.value.buildings.some(b => !b.isPlayer)
    
    if (battleMap.value.enemies.length === 0 && !hasEnemyBuildings) {
      setTimeout(async () => await endBattle(true), 500)
      return true
    } else if (battleMap.value.players.length === 0) {
      setTimeout(async () => await endBattle(false), 500)
      return true
    }
    return false
  }

  function toggleSpeed() {
    if (gameSpeed.value === 1) {
      gameSpeed.value = 2
    } else if (gameSpeed.value === 2) {
      gameSpeed.value = 3
    } else {
      gameSpeed.value = 1
    }
  }

  // 计算角色对目标的伤害
  // 从所有角色中查找模板
  function findCharacterTemplateInStore(charId: string) {
    // 先从玩家角色中查找
    const playerChar = player?.value?.characters.find(c => c.id === charId)
    if (playerChar) return playerChar
    // 再从初始角色和可雇佣角色中查找
    const allChars = [...INITIAL_CHARACTERS, ...HIREABLE_CHARACTERS]
    return allChars.find(c => c.id === charId)
  }

  function calculateDamage(attacker: BattleCharacter, target: BattleCharacter | BattleBuilding): number {
    if (!battleMap.value) return 0
    
    // 使用战斗角色存储的攻击力（带装备加成）
    const attackerTemplate = findCharacterTemplateInStore(attacker.characterId)
    const attackPower = computeAttackPower(attacker)
    
    // 对于角色
    if ('characterId' in target) {
      // 使用战斗角色存储的防御力（带装备加成）
      const defense = computeDefensePower(target)
      
      return Math.max(1, attackPower - defense)
    }
    
    // 对于建筑，防御为0
    return attackPower
  }

  function calculateSkillDamage(attacker: BattleCharacter, target: BattleCharacter | BattleBuilding, skill: Skill): number {
    if (!battleMap.value) return 0

    const attackPower = computeAttackPower(attacker)

    if ('characterId' in target) {
      const defense = computeDefensePower(target)

      if (skill.damageFormula === 'atk_plus_hp_pct') {
        const hpPct = skill.hpPct || 0
        return Math.max(1, Math.floor((skill.power / 100 * attackPower + attacker.hp * hpPct) - defense))
      } else {
        return Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
      }
    } else {
      if (skill.damageFormula === 'atk_plus_hp_pct') {
        return Math.max(1, Math.floor(attackPower))
      } else {
        return Math.max(1, Math.floor(skill.power / 100 * attackPower))
      }
    }
  }
  
  // 计算两点之间的曼哈顿距离
  function getDistance(row1: number, col1: number, row2: number, col2: number): number {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2)
  }
  
  // 找到离角色最近的集结点
  function getNearestGatherPoint(char: BattleCharacter): { row: number; col: number } | null {
    if (gatheringPoints.value.length === 0) return null
    
    let nearest = gatheringPoints.value[0]
    let minDist = getDistance(char.row, char.col, nearest.row, nearest.col)
    
    for (const point of gatheringPoints.value.slice(1)) {
      const dist = getDistance(char.row, char.col, point.row, point.col)
      if (dist < minDist) {
        minDist = dist
        nearest = point
      }
    }
    
    return nearest
  }
  
  // 获取技能可攻击的目标
  function getSkillAttackTargets(char: BattleCharacter, skill: Skill): (BattleCharacter | BattleBuilding | any)[] {
    if (!battleMap.value) return []
    const targets: (BattleCharacter | BattleBuilding | any)[] = []
    
    // AOE技能使用areaRange，其他技能使用range
    const skillRange = skill.category === 'aoe' ? (skill.areaRange || skill.range || 1) : (skill.range || 1)
    
    // 检查敌方角色
    const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
    for (const enemy of enemies) {
      const distance = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
      if (distance <= skillRange) {
        targets.push(enemy)
      }
    }
    
    // 检查建筑
    for (const building of battleMap.value.buildings) {
      if (building.isPlayer !== char.isPlayer) {
        const distance = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
        if (distance <= skillRange) {
          targets.push(building)
        }
      }
    }
    
    // 检查障碍物（技能可以攻击障碍物）
    for (let r = -skillRange; r <= skillRange; r++) {
      for (let c = -skillRange; c <= skillRange; c++) {
        const nr = char.row + r
        const nc = char.col + c
        const distance = Math.abs(r) + Math.abs(c)
        if (nr >= 0 && nr < battleMap.value.height && nc >= 0 && nc < battleMap.value.width) {
          if (distance <= skillRange && battleMap.value.tiles[nr]?.[nc]?.terrain === 'obstacle') {
            targets.push({ id: `obstacle_${nr}_${nc}`, row: nr, col: nc, isObstacle: true })
          }
        }
      }
    }
    
    return targets
  }

  // 获取技能可攻击的目标（按伤害从高到低排序，仅保留有效目标）
  function getBestSkillTargets(char: BattleCharacter, skill: Skill): (BattleCharacter | BattleBuilding)[] {
    if (!battleMap.value) return []
    const allTargets = getSkillAttackTargets(char, skill)
    const validTargets = allTargets.filter((t: any) => !t.isObstacle)
    
    const attackPower = computeAttackPower(char)
    
    const targetsWithDamage = validTargets.map((target: any) => {
      let damage: number
      if ('characterId' in target) {
        const defense = computeDefensePower(target)
        damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
      } else if ('hp' in target && 'maxHp' in target) {
        damage = Math.floor(skill.power / 100 * attackPower)
      } else {
        damage = 0
      }
      return { target: target as (BattleCharacter | BattleBuilding), damage }
    })
    
    targetsWithDamage.sort((a, b) => b.damage - a.damage)
    return targetsWithDamage.map(t => t.target)
  }
  
  async function executeCharacterAi(char: BattleCharacter, isPlayer: boolean) {
    if (!battleMap.value) return
    
    currentAiCharacter.value = char.id
    
    try {
      console.log(`[AI] ${char.id} | pos:(${char.row},${char.col}) | moved:${char.hasMoved} acted:${char.hasActed}`)

      if (char.hasMoved && char.hasActed) {
        console.log(`[AI] ${char.id} | already moved and acted, skipping`)
        return
      }

      // 眩晕：本回合只能防御，不能移动/攻击/使用技能
      if (hasStatus(char, 'stun')) {
        char.isDefending = true
        char.hasActed = true
        const template = findCharacterTemplateInStore(char.characterId)
        battleLog.value.push(`【${template?.name || char.characterId}】因【眩晕】本回合无法行动，只能防御`)
        return
      }

      if (isPlayer && factionCommand.value === 'gather') {
        await executeGatherMode(char)
      } else {
        await executeAttackMode(char)
      }
    } finally {
      currentAiCharacter.value = null
    }
  }
  
  function getMinManhattanDistance(char: BattleCharacter, enemies: BattleCharacter[], buildings: any[]): number {
    let minDistance = Infinity
    
    for (const enemy of enemies) {
      if (enemy.hp > 0) {
        const distance = Math.abs(char.row - enemy.row) + Math.abs(char.col - enemy.col)
        if (distance < minDistance) {
          minDistance = distance
        }
      }
    }
    
    for (const building of buildings) {
      if (building.hp > 0) {
        const distance = Math.abs(char.row - building.row) + Math.abs(char.col - building.col)
        if (distance < minDistance) {
          minDistance = distance
        }
      }
    }
    
    return minDistance === Infinity ? 999 : minDistance
  }
  
  // 全军出击模式
  async function executeAttackMode(char: BattleCharacter) {
    try {
      if (!battleMap.value) return
      
      const charTemplate = findCharacterTemplateInStore(char.characterId)
    const playerChar = player.value?.characters.find(c => c.id === char.characterId)
    
    let availableSkills: Skill[] = []
    // 计算HP百分比（用于HP限制技能的检查）
    const charMaxHp = char.maxHp || charTemplate?.baseMaxHp || 100
    const hpPercent = char.hp / charMaxHp

    if (char.isPlayer && playerChar) {
      availableSkills = playerChar.skills.filter(skill => {
        if (skill.currentCooldown !== 0 || char.mp < skill.mpCost) return false
        // 阵营灵气/煞气检查
        if (skill.reikiCost && battleMap.value && battleMap.value.playerReiki < skill.reikiCost) return false
        if (skill.shaQiCost && battleMap.value && battleMap.value.playerShaQi < skill.shaQiCost) return false
        // 腐蚀粘液：HP<=20%时才能使用
        if (skill.id === 'fushi_nianye' && hpPercent > 0.2) return false
        // 通用HP阈值检查
        if (skill.selfHpThreshold !== undefined && hpPercent < skill.selfHpThreshold) return false
        // HP > ATK检查
        if (skill.requireHpGtAtk && char.hp <= char.attack) return false
        // 召唤数量限制检查
        if (skill.summonMaxCount && skill.summonCountId && battleMap.value) {
          const existingCount = battleMap.value.players.filter(c => c.characterId === skill.summonCountId).length
          if (existingCount >= skill.summonMaxCount) return false
        }
        return true
      })
    } else {
      availableSkills = (charTemplate?.skills || []).filter(skill => {
        const cooldown = char.skillCooldowns ? char.skillCooldowns[skill.id] : 0
        if ((cooldown || 0) !== 0 || char.mp < skill.mpCost) return false
        // 阵营灵气/煞气检查
        if (skill.reikiCost && battleMap.value && battleMap.value.enemyReiki < skill.reikiCost) return false
        if (skill.shaQiCost && battleMap.value && battleMap.value.enemyShaQi < skill.shaQiCost) return false
        // 腐蚀粘液：HP<=20%时才能使用
        if (skill.id === 'fushi_nianye' && hpPercent > 0.2) return false
        // 通用HP阈值检查
        if (skill.selfHpThreshold !== undefined && hpPercent < skill.selfHpThreshold) return false
        // HP > ATK检查
        if (skill.requireHpGtAtk && char.hp <= char.attack) return false
        // 召唤数量限制检查
        if (skill.summonMaxCount && skill.summonCountId && battleMap.value) {
          const existingCount = battleMap.value.enemies.filter(c => c.characterId === skill.summonCountId).length
          if (existingCount >= skill.summonMaxCount) return false
        }
        return true
      })
    }
    
    const originalRow = char.row
    const originalCol = char.col
    
    let bestMove: { row: number; col: number } | null = null
    let bestTarget: (BattleCharacter | BattleBuilding) | null = null
    let bestSkill: Skill | null = null
    let maxDamage = 0
    
    const rawMoveRange = !char.hasMoved ? getCharacterMoveRange(char) : []
    const moveRange = !char.hasMoved 
      ? [{ row: originalRow, col: originalCol }, ...rawMoveRange]
      : [{ row: originalRow, col: originalCol }]
    
    // 使用角色实际的攻击范围（已含装备加成），并叠加状态效果
    const baseAttackRangeVal = char.attackRange || 1
    const statusAttackRange = getStatusAttackRange(char)
    const effectiveAttackRange = Math.max(0, baseAttackRangeVal + statusAttackRange)
    
    for (const pos of moveRange) {
      char.row = pos.row
      char.col = pos.col
      
      // 检查普攻对敌人的伤害
      const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
      for (const enemy of enemies) {
        const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
        if (dist <= effectiveAttackRange) {
          const damage = calculateDamage(char, enemy)
          console.log(`[AI] ${char.id} | melee attack on ${enemy.id} at dist ${dist}, range ${effectiveAttackRange}, damage: ${damage}`)
          if (damage > maxDamage) {
            maxDamage = damage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = enemy
            bestSkill = null
          }
        }
      }
      
      // 检查技能伤害（使用技能的实际范围）- 计算对敌方角色和建筑物的伤害，但不计算障碍物
      for (const skill of availableSkills) {
        // 特殊处理：奕剑听雨 - 以自身为中心的AOE攻击技能
        if (skill.id === 'yi_jian_ting_yu') {
          const areaRange = skill.areaRange || 2
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }
        // 特殊处理：水漫金山 - 以自身为中心的AOE攻击技能
        if (skill.id === 'shui_man_jin_shan') {
          const areaRange = skill.areaRange || 3
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：墨影剑光 - 以自身为中心的AOE攻击技能
        if (skill.id === 'mo_ying_jian_guang') {
          const areaRange = skill.areaRange || 3
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：千里冰封 - 以自身为中心的AOE攻击技能
        if (skill.id === 'qian_li_bing_feng') {
          const areaRange = skill.areaRange || 3
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：天崩地裂 - 以自身为中心的AOE攻击技能（正方形范围）
        if (skill.id === 'tian_beng_di_lie') {
          const areaRange = skill.areaRange || 1
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害（正方形范围）
          for (const enemy of enemies) {
            const rowDist = Math.abs(enemy.row - char.row)
            const colDist = Math.abs(enemy.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害（正方形范围）
          for (const building of buildings) {
            const rowDist = Math.abs(building.row - char.row)
            const colDist = Math.abs(building.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：大地重击 - 以自身为中心的AOE攻击技能
        if (skill.id === 'da_di_zhong_ji') {
          const areaRange = skill.areaRange || 2
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：魔殓鬼手 - 以自身为中心的AOE攻击技能（正方形范围）
        if (skill.id === 'mo_lian_gui_shou') {
          const areaRange = skill.areaRange || 1
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害（正方形范围）
          for (const enemy of enemies) {
            const rowDist = Math.abs(enemy.row - char.row)
            const colDist = Math.abs(enemy.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害（正方形范围）
          for (const building of buildings) {
            const rowDist = Math.abs(building.row - char.row)
            const colDist = Math.abs(building.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          // 魔殓鬼手会恢复造成伤害的35%生命值，所以伤害价值更高
          totalDamage = Math.floor(totalDamage * 1.35)

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：自爆毒液 - 以自身为中心的AOE攻击技能（正方形范围）
        if (skill.id === 'zi_bao_du_ye') {
          const areaRange = skill.areaRange || 1
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害（正方形范围）
          for (const enemy of enemies) {
            const rowDist = Math.abs(enemy.row - char.row)
            const colDist = Math.abs(enemy.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害（正方形范围）
          for (const building of buildings) {
            const rowDist = Math.abs(building.row - char.row)
            const colDist = Math.abs(building.col - char.col)
            if (rowDist <= areaRange && colDist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          // 自爆毒液会让自己战败，所以需要谨慎使用（只有当收益大于风险时才使用）
          // 简单处理：只有当伤害足够高时才使用
          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：炼狱火海 - 以自身为中心的AOE攻击技能
        if (skill.id === 'lian_yu_huo_hai') {
          const areaRange = skill.areaRange || 2
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：邪神低语 - 以自身为中心的AOE攻击技能
        if (skill.id === 'xie_shen_di_yu') {
          const areaRange = skill.areaRange || 2
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：轰炸类AOE技能 - 选择目标格子为中心的AOE攻击
        if (skill.category === 'aoe' && skill.targetCountTag === '轰炸') {
          const bestCenterPos = findBestBombingCenter(char, skill)

          if (bestCenterPos) {
            // 计算该中心位置的总伤害
            const areaRange = skill.areaRange || 1
            const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
            const buildings = battleMap.value.buildings
            let totalAreaDamage = 0
            for (const enemy of enemies) {
              const enemyDist = Math.abs(enemy.row - bestCenterPos.row) + Math.abs(enemy.col - bestCenterPos.col)
              if (enemyDist <= areaRange) {
                const defense = computeDefensePower(enemy)
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
                totalAreaDamage += damage
              }
            }
            for (const building of buildings) {
              const buildingDist = Math.abs(building.row - bestCenterPos.row) + Math.abs(building.col - bestCenterPos.col)
              if (buildingDist <= areaRange && building.isPlayer !== char.isPlayer) {
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
                totalAreaDamage += damage
              }
            }

            if (totalAreaDamage > 0 && totalAreaDamage > maxDamage) {
              maxDamage = totalAreaDamage
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = bestCenterPos as any
              bestSkill = skill
            }
          }
          continue
        }

        // 特殊处理：恐怖尖叫 - 以自身为中心的AOE攻击技能
        if (skill.id === 'terror_scream') {
          const areaRange = skill.areaRange || 3
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          let totalDamage = 0

          // 计算对范围内敌方角色的伤害
          for (const enemy of enemies) {
            const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
            if (dist <= areaRange) {
              const defense = computeDefensePower(enemy)
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
              totalDamage += damage
            }
          }

          // 计算对范围内敌方建筑的伤害
          for (const building of buildings) {
            const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
            if (dist <= areaRange && building.isPlayer !== char.isPlayer) {
              const attackPower = computeAttackPower(char)
              const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
              totalDamage += damage
            }
          }

          if (totalDamage > 0 && totalDamage > maxDamage) {
            maxDamage = totalDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：碧海潮生 - 以自身为中心的AOE治疗技能
        if (skill.id === 'bi_hai_chao_sheng') {
          const areaRange = skill.areaRange || 3
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          let totalHeal = 0

          const attackPower = char.attack || (charTemplate?.baseAttack || 20)
          const healAmountPerTarget = Math.floor(attackPower * (skill.power / 100))

          // 检查自己
          const selfTemplate = findCharacterTemplateInStore(char.characterId)
          const selfMaxHp = selfTemplate?.maxHp || char.maxHp || 100
          const selfMissingHp = selfMaxHp - char.hp
          if (selfMissingHp > 0) {
            const actualHeal = Math.min(healAmountPerTarget, selfMissingHp)
            totalHeal += actualHeal * 3.0
          }

          // 检查友方角色
          for (const ally of allies) {
            const dist = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (dist <= areaRange && ally.id !== char.id) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
              const missingHp = allyMaxHp - ally.hp
              if (missingHp > 0) {
                const actualHeal = Math.min(healAmountPerTarget, missingHp)
                totalHeal += actualHeal * 3.0
              }
            }
          }

          if (totalHeal > 0 && totalHeal > maxDamage) {
            maxDamage = totalHeal
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = null
            bestSkill = skill
          } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
            totalHeal = 10
            if (totalHeal > maxDamage) {
              maxDamage = totalHeal
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = null
              bestSkill = skill
            }
          }
          continue
        }
        
        // 特殊处理：直线攻击技能
        if (skill.category === '直线') {
          const lineRange = skill.range || 1
          const lineWidth = skill.lineWidth || 1
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right']
          let maxLineDamage = 0
          let bestDirection: ('up' | 'down' | 'left' | 'right') | null = null

          const halfWidth = Math.floor(lineWidth / 2)
          const widthOffsets = lineWidth === 1 ? [0] : Array.from({ length: lineWidth }, (_, i) => i - halfWidth)

          for (const dir of directions) {
            let totalDamage = 0
            
            // 计算直线范围内的所有位置
            const linePositions: { row: number; col: number }[] = []
            switch (dir) {
              case 'up':
                for (let i = 1; i <= lineRange; i++) {
                  const r = char.row - i
                  if (r >= 0 && r < battleMap.value.height) {
                    for (const wOff of widthOffsets) {
                      const c = char.col + wOff
                      if (c >= 0 && c < battleMap.value.width) {
                        linePositions.push({ row: r, col: c })
                      }
                    }
                  }
                }
                break
              case 'down':
                for (let i = 1; i <= lineRange; i++) {
                  const r = char.row + i
                  if (r >= 0 && r < battleMap.value.height) {
                    for (const wOff of widthOffsets) {
                      const c = char.col + wOff
                      if (c >= 0 && c < battleMap.value.width) {
                        linePositions.push({ row: r, col: c })
                      }
                    }
                  }
                }
                break
              case 'left':
                for (let i = 1; i <= lineRange; i++) {
                  const c = char.col - i
                  if (c >= 0 && c < battleMap.value.width) {
                    for (const wOff of widthOffsets) {
                      const r = char.row + wOff
                      if (r >= 0 && r < battleMap.value.height) {
                        linePositions.push({ row: r, col: c })
                      }
                    }
                  }
                }
                break
              case 'right':
                for (let i = 1; i <= lineRange; i++) {
                  const c = char.col + i
                  if (c >= 0 && c < battleMap.value.width) {
                    for (const wOff of widthOffsets) {
                      const r = char.row + wOff
                      if (r >= 0 && r < battleMap.value.height) {
                        linePositions.push({ row: r, col: c })
                      }
                    }
                  }
                }
                break
            }

            // 计算对直线范围内敌方角色的伤害
            for (const enemy of enemies) {
              if (linePositions.some(pos => pos.row === enemy.row && pos.col === enemy.col)) {
                const defense = computeDefensePower(enemy)
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
                totalDamage += damage
              }
            }

            // 计算对直线范围内敌方建筑的伤害
            for (const building of buildings) {
              if (linePositions.some(pos => pos.row === building.row && pos.col === building.col) && building.isPlayer !== char.isPlayer) {
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
                totalDamage += damage
              }
            }

            if (totalDamage > maxLineDamage) {
              maxLineDamage = totalDamage
              bestDirection = dir
            }
          }

          if (maxLineDamage > 0 && maxLineDamage > maxDamage) {
            maxDamage = maxLineDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = { direction: bestDirection } as any
            bestSkill = skill
          }
          continue
        }

        // 特殊处理：横扫攻击技能
        if (skill.category === '横扫') {
          const sweepLength = skill.sweepLength || 3
          const sweepWidth = skill.sweepWidth || 2
          const startJ = sweepWidth % 2 === 0 ? -(sweepWidth / 2 - 1) : -Math.floor(sweepWidth / 2)
          const endJ = sweepWidth % 2 === 0 ? sweepWidth / 2 : Math.floor(sweepWidth / 2)
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const buildings = battleMap.value.buildings
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right']
          let maxSweepDamage = 0
          let bestSweepDirection: ('up' | 'down' | 'left' | 'right') | null = null

          for (const dir of directions) {
            let totalDamage = 0

            const sweepPositions: { row: number; col: number }[] = []
            for (let i = 1; i <= sweepLength; i++) {
              for (let j = startJ; j <= endJ; j++) {
                let r = char.row
                let c = char.col
                switch (dir) {
                  case 'up':
                    r = char.row - i
                    c = char.col + j
                    break
                  case 'down':
                    r = char.row + i
                    c = char.col + j
                    break
                  case 'left':
                    r = char.row + j
                    c = char.col - i
                    break
                  case 'right':
                    r = char.row + j
                    c = char.col + i
                    break
                }
                if (r >= 0 && r < battleMap.value.height && c >= 0 && c < battleMap.value.width) {
                  sweepPositions.push({ row: r, col: c })
                }
              }
            }

            for (const enemy of enemies) {
              if (sweepPositions.some(pos => pos.row === enemy.row && pos.col === enemy.col)) {
                const defense = computeDefensePower(enemy)
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower - defense))
                totalDamage += damage
              }
            }

            for (const building of buildings) {
              if (sweepPositions.some(pos => pos.row === building.row && pos.col === building.col) && building.isPlayer !== char.isPlayer) {
                const attackPower = computeAttackPower(char)
                const damage = Math.max(1, Math.floor(skill.power / 100 * attackPower))
                totalDamage += damage
              }
            }

            if (totalDamage > maxSweepDamage) {
              maxSweepDamage = totalDamage
              bestSweepDirection = dir
            }
          }

          if (maxSweepDamage > 0 && maxSweepDamage > maxDamage) {
            maxDamage = maxSweepDamage
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = { direction: bestSweepDirection } as any
            bestSkill = skill
          }
          continue
        }
        
        if (skill.type === 'attack') {
          const skillTargets = getSkillAttackTargets(char, skill)
          if (skillTargets.length > 0) {
            // 收集所有候选目标及其伤害
            const targetDamages: { target: BattleCharacter | BattleBuilding; damage: number }[] = []
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length === 0) continue // 没有有效目标，跳过这个技能
            
            // 计算这个位置的移动距离（如果这是一个移动位置）
            const moveDistance = (pos.row !== originalRow || pos.col !== originalCol) 
              ? Math.abs(pos.row - originalRow) + Math.abs(pos.col - originalCol) 
              : (char.movedDistance || 0)
            
            for (const target of validTargets) {
              if ('characterId' in target) {
                const defense = computeDefensePower(target)

                // 攻击者的实际攻击力（包含装备加成和永久buff）
                const attackPower = computeAttackPower(char)

                // 对于暗影刺杀，伤害公式是 (1 + 0.3 * 移动距离) * 攻击力
                let damage
                if (skill.id === 'shadow_assassination') {
                  const damageMultiplier = 1 + 0.3 * moveDistance
                  damage = Math.max(1, Math.floor((damageMultiplier * attackPower - defense)))
                } else {
                  damage = Math.max(1, Math.floor((skill.power / 100 * attackPower - defense)))
                }

                targetDamages.push({ target, damage })
              } else if ('hp' in target && 'maxHp' in target) {
                // 建筑物伤害
                const attackPower = computeAttackPower(char)

                let damage
                if (skill.id === 'shadow_assassination') {
                  const damageMultiplier = 1 + 0.3 * moveDistance
                  damage = Math.floor(damageMultiplier * attackPower)
                } else {
                  damage = Math.floor(skill.power / 100 * attackPower)
                }
                targetDamages.push({ target, damage })
              }
            }

            // 根据技能类型决定如何计算总伤害
            let totalDamage = 0
            let bestSkillTarget: BattleCharacter | BattleBuilding | null = null
            
            if (skill.category === '指定') {
              // 指定类技能：只计算 targetCount 个最高伤害目标
              const targetCount = skill.targetCount || 1
              // 按伤害从高到低排序
              targetDamages.sort((a, b) => b.damage - a.damage)
              const selected = targetDamages.slice(0, targetCount)
              totalDamage = selected.reduce((sum, t) => sum + t.damage, 0)
              bestSkillTarget = selected[0]?.target || null
            } else {
              // 其他技能（AOE、轰炸等）：累加所有目标伤害
              totalDamage = targetDamages.reduce((sum, t) => sum + t.damage, 0)
              bestSkillTarget = targetDamages[0]?.target || null
            }
            
            if (totalDamage > 0 && totalDamage > maxDamage) {
              maxDamage = totalDamage
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = bestSkillTarget
              bestSkill = skill
            }
          }
        }
        // 特殊处理「高山流水」技能：多目标治疗评估
        else if (skill.id === 'gao_shan_liu_shui') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          const skillRange = skill.range || 4
          const targetCount = skill.targetCount || 2

          // 收集范围内所有受伤友军及其缺失血量
          const woundedAllies: { ally: BattleCharacter; missingHp: number }[] = []
          for (const ally of allies) {
            const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (distance <= skillRange) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
              const missingHp = allyMaxHp - ally.hp
              if (missingHp > 0) {
                woundedAllies.push({ ally, missingHp })
              }
            }
          }

          if (woundedAllies.length > 0) {
            // 按缺失血量排序，优先治疗最受伤的
            woundedAllies.sort((a, b) => b.missingHp - a.missingHp)
            let attackPower = char.attack || (charTemplate?.baseAttack || 20)
            const healAmountPerTarget = Math.floor(attackPower * 1.2)
            let totalHeal = 0

            for (let i = 0; i < Math.min(targetCount, woundedAllies.length); i++) {
              totalHeal += Math.min(healAmountPerTarget, woundedAllies[i].missingHp)
            }

            const effectiveValue = totalHeal * 1.0
            if (effectiveValue > maxDamage) {
              maxDamage = effectiveValue
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = woundedAllies[0].ally
              bestSkill = skill
            }
          } else if (allies.length > 0 && maxDamage === 0) {
            if (10 > maxDamage) {
              maxDamage = 10
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = allies[0]
              bestSkill = skill
            }
          }
        }
        // 特殊处理「桃花灼灼」技能：多目标治疗评估
        else if (skill.id === 'tao_hua_zhuo_zhuo') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          const skillRange = skill.range || 3
          const targetCount = skill.targetCount || 2

          // 收集范围内所有受伤友军及其缺失血量
          const woundedAllies: { ally: BattleCharacter; missingHp: number }[] = []
          for (const ally of allies) {
            const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (distance <= skillRange) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
              const missingHp = allyMaxHp - ally.hp
              if (missingHp > 0) {
                woundedAllies.push({ ally, missingHp })
              }
            }
          }

          if (woundedAllies.length > 0) {
            // 按缺失血量排序，优先治疗最受伤的
            woundedAllies.sort((a, b) => b.missingHp - a.missingHp)
            let attackPower = char.attack || (charTemplate?.baseAttack || 20)
            const healAmountPerTarget = Math.floor(attackPower * (skill.power / 100))
            let totalHeal = 0

            for (let i = 0; i < Math.min(targetCount, woundedAllies.length); i++) {
              totalHeal += Math.min(healAmountPerTarget, woundedAllies[i].missingHp)
            }

            const effectiveValue = totalHeal * 1.0
            if (effectiveValue > maxDamage) {
              maxDamage = effectiveValue
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = woundedAllies[0].ally
              bestSkill = skill
            }
          } else if (allies.length > 0 && maxDamage === 0) {
            if (10 > maxDamage) {
              maxDamage = 10
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = allies[0]
              bestSkill = skill
            }
          }
        }
        // 特殊处理「浮光掠影」技能：范围群体治疗评估
        else if (skill.id === 'fu_guang_lue_ying') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          const areaRange = skill.areaRange || 2
          let totalHeal = 0
          let bestAlly: BattleCharacter | null = null
          let attackPower = char.attack || (charTemplate?.baseAttack || 20)
          const healAmountPerTarget = Math.floor(attackPower * (skill.power / 100))

          for (const ally of allies) {
            const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (distance <= areaRange) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
              const missingHp = allyMaxHp - ally.hp
              if (missingHp > 0) {
                totalHeal += Math.min(healAmountPerTarget, missingHp)
                if (!bestAlly) bestAlly = ally
              }
            }
          }
          const effectiveValue = totalHeal * 1.5
          if (effectiveValue > 0 && effectiveValue > maxDamage) {
            maxDamage = effectiveValue
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = bestAlly || char
            bestSkill = skill
          } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
            if (10 > maxDamage) {
              maxDamage = 10
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = allies[0]
              bestSkill = skill
            }
          }
        }
        // 特殊处理「阴阳气合」技能：范围群体法力恢复评估
        else if (skill.id === 'yin_yang_qi_he') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          const areaRange = skill.areaRange || 2
          let totalHeal = 0
          let bestAlly: BattleCharacter | null = null
          let attackPower = char.attack || (charTemplate?.baseAttack || 20)
          const mpHealAmountPerTarget = Math.floor(attackPower * (skill.power / 100))

          for (const ally of allies) {
            const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (distance <= areaRange) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 50
              const missingMp = allyMaxMp - ally.mp
              if (missingMp > 0) {
                totalHeal += Math.min(mpHealAmountPerTarget, missingMp)
                if (!bestAlly) bestAlly = ally
              }
            }
          }
          const effectiveValue = totalHeal * 1.2
          if (effectiveValue > 0 && effectiveValue > maxDamage) {
            maxDamage = effectiveValue
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = bestAlly || char
            bestSkill = skill
          } else if (totalHeal === 0 && allies.length > 0 && maxDamage === 0) {
            if (10 > maxDamage) {
              maxDamage = 10
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = allies[0]
              bestSkill = skill
            }
          }
        }
        // 特殊处理「藏剑一叶」技能：单体高伤+迷离，使用通用伤害评估（已在外层 fallback 处理）
        // 特殊处理「沐风为裳」技能：治疗3格内1个友方+自身，评估综合生命+法力恢复
        else if (skill.id === 'mu_feng_wei_shang') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          const skillRange = skill.range || 3
          let attackPower = char.attack || (charTemplate?.baseAttack || 20)
          const hpHeal = Math.floor(attackPower * 0.5)
          const mpHeal = Math.floor(attackPower * 0.6)

          let bestAlly: BattleCharacter | null = null
          let bestScore = 0

          // 自身恢复评分
          const selfMaxHp = charTemplate?.maxHp || char.maxHp || 100
          const selfMaxMp = charTemplate?.maxMp || char.maxMp || 50
          const selfMissingHp = selfMaxHp - char.hp
          const selfMissingMp = selfMaxMp - char.mp
          const selfScore = Math.min(hpHeal, selfMissingHp) * 1.5 + Math.min(mpHeal, selfMissingMp) * 1.0

          for (const ally of allies) {
            const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
            if (distance <= skillRange) {
              const allyTemplate = findCharacterTemplateInStore(ally.characterId)
              const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
              const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 50
              const missingHp = allyMaxHp - ally.hp
              const missingMp = allyMaxMp - ally.mp

              let allyScore = 0
              if (missingHp > 0) allyScore += Math.min(hpHeal, missingHp) * 1.5
              if (missingMp > 0) allyScore += Math.min(mpHeal, missingMp) * 1.0

              // 负面状态驱散加成
              let hasNegativeStatus = false
              for (const status of NEGATIVE_STATUSES) {
                if (hasStatus(ally, status)) {
                  hasNegativeStatus = true
                  break
                }
              }
              if (hasNegativeStatus) allyScore += 30

              const totalScore = selfScore + allyScore
              if (totalScore > bestScore) {
                bestScore = totalScore
                bestAlly = ally
              }
            }
          }

          // 自身也可作为目标（即不指定其他友方时，只恢复自己+驱散自己的不良状态）
          if (bestScore < selfScore + 20 && !bestAlly) {
            bestAlly = char
            bestScore = selfScore + 20
          }

          if (bestScore > maxDamage && bestAlly) {
            maxDamage = bestScore
            bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
            bestTarget = bestAlly
            bestSkill = skill
          }
        }
        // 统一处理所有召唤类技能：检查附近是否有空格可以召唤，优先向敌人移动
        else if (skill.category === 'summon') {
          const skillRange = skill.range || 2
          const map = battleMap.value
          const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
          const targetCount = skill.targetCount || 1
          let emptySpaceCount = 0
          let minDistanceToEnemy = Infinity

          if (map) {
            for (let dr = -skillRange; dr <= skillRange; dr++) {
              for (let dc = -skillRange; dc <= skillRange; dc++) {
                const dist = Math.abs(dr) + Math.abs(dc)
                if (dist > 0 && dist <= skillRange) {
                  const r = char.row + dr
                  const c = char.col + dc
                  if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                    const tile = map.tiles[r]?.[c]
                    const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === r && x.col === c)
                    const hasBuilding = (map.buildings || []).some(b => b.row === r && b.col === c)
                    if (tile && tile.terrain === 'empty' && !hasChar && !hasBuilding) {
                      emptySpaceCount++
                      const enemyDist = enemies.length > 0 ? Math.min(...enemies.map(e => Math.abs(e.row - r) + Math.abs(e.col - c))) : Infinity
                      if (enemyDist < minDistanceToEnemy) {
                        minDistanceToEnemy = enemyDist
                      }
                    }
                  }
                }
              }
            }
          }

          if (emptySpaceCount >= targetCount) {
            const distanceBonus = enemies.length > 0 ? (10 - Math.min(minDistanceToEnemy, 10)) : 0
            const summonValue = 9999 + distanceBonus
            if (summonValue > maxDamage) {
              maxDamage = summonValue
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = char
              bestSkill = skill
            }
          }
        }
        // 检查通用治疗技能（对友方角色）
        else if (skill.type === 'heal') {
          const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
          
          // AOE治疗技能（以自身为中心）
          if (skill.range === 0 && skill.areaRange) {
            const areaRange = skill.areaRange
            let attackPower = char.attack || (charTemplate?.baseAttack || 20)
            let healAmountPerTarget: number
            
            if (skill.id === 'bi_hai_chao_sheng') {
              healAmountPerTarget = Math.floor(attackPower * 1.2)
            } else if (skill.id === 'fu_guang_lue_ying') {
              healAmountPerTarget = Math.floor(attackPower * 0.5)
            } else if (skill.id === 'yin_yang_qi_he') {
              healAmountPerTarget = Math.floor(attackPower * 0.4)
            } else {
              healAmountPerTarget = Math.floor(attackPower * (skill.power / 100))
            }
            
            let totalHealValue = 0
            for (const ally of allies) {
              const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
              if (distance <= areaRange) {
                const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                const missingHp = allyMaxHp - ally.hp
                if (missingHp > 0) {
                  const actualHeal = Math.min(healAmountPerTarget, missingHp)
                  totalHealValue += actualHeal
                }
              }
            }
            // AOE治疗价值：总治疗量 * 2.0（因为影响多个目标）
            const effectiveValue = totalHealValue * 2.0
            if (effectiveValue > maxDamage) {
              maxDamage = effectiveValue
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = null
              bestSkill = skill
            }
          } else {
            const skillRange = skill.range || 1
            let bestHealAmount = 0
            let bestHealTarget: BattleCharacter | null = null

            // 计算自身血量百分比，用于调整治疗优先级
            const selfMaxHp = charTemplate?.maxHp || char.maxHp || 100
            const selfHpPercent = char.hp / selfMaxHp
            let selfHpBonus = 1.0
            if (selfHpPercent < 0.3) {
              selfHpBonus = 2.0  // 自身血量低于30%，治疗价值翻倍
            } else if (selfHpPercent < 0.5) {
              selfHpBonus = 1.5  // 自身血量低于50%，治疗价值增加50%
            }

            for (const ally of allies) {
              const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
              if (distance <= skillRange) {
                const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                const missingHp = allyMaxHp - ally.hp
                if (missingHp > 0) {
                  let healAmount: number
                  if (skill.id === 'tian_ya_qing_qing') {
                    // 天雅倾情：恢复自身10%生命值和法力值上限
                    healAmount = Math.floor(allyMaxHp * 0.1)
                  } else if (skill.id === 'ai_de_bao_bao' || skill.id === 'ai_de_fei_wen') {
                    // 爱的抱抱/爱的飞吻：0.05*自身最大生命值 + 0.1*目标最大生命值
                    healAmount = Math.floor(selfMaxHp * 0.05 + allyMaxHp * 0.1)
                  } else if (skill.id === 'ai_de_hui_yi') {
                    // 爱的回忆：恢复自身10%最大生命值（仅自己）
                    if (ally.id !== char.id) continue
                    healAmount = Math.floor(selfMaxHp * 0.1)
                  } else if (skill.id === 'mu_feng_wei_shang') {
                    // 沐风为裳：50%生命 + 60%法力
                    let atkPower = char.attack || (charTemplate?.baseAttack || 20)
                    healAmount = Math.floor(atkPower * 0.5)
                  } else {
                    let attackPower = char.attack || (charTemplate?.baseAttack || 20)
                    healAmount = Math.floor(attackPower * (skill.power / 100))
                  }
                  const actualHeal = Math.min(healAmount, missingHp)
                  // 自身目标额外加成
                  const selfBonus = ally.id === char.id ? selfHpBonus : 1.0
                  const effectiveValue = actualHeal * 3.0 * selfBonus
                  if (effectiveValue > bestHealAmount) {
                    bestHealAmount = effectiveValue
                    bestHealTarget = ally
                  }
                }
              }
            }

            if (bestHealAmount > maxDamage) {
              maxDamage = bestHealAmount
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = bestHealTarget
              bestSkill = skill
            }
          }
        }
        else if (skill.type === 'support') {
          if (skill.id === 'yue_zhi_yin_li') {
            const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
            const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
            const skillRange = skill.range || 2
            let hasValidTarget = false
            for (const ally of allies) {
              const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
              if (distance <= skillRange && ally.id !== char.id) {
                hasValidTarget = true
                break
              }
            }
            if (hasValidTarget) {
              const distanceToEnemy = enemies.length > 0 ? Math.min(...enemies.map(e => Math.abs(e.row - char.row) + Math.abs(e.col - char.col))) : Infinity
              const distanceBonus = enemies.length > 0 ? (10 - Math.min(distanceToEnemy, 10)) : 0
              const supportValue = 25 + distanceBonus
              if (supportValue > maxDamage) {
                maxDamage = supportValue
                bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
                bestTarget = char
                bestSkill = skill
              }
            }
          }
          else if (skill.id === 'jue_chu_feng_sheng') {
            const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
            const maxHp = charTemplate?.maxHp || char.maxHp || 100
            const hpCost = Math.floor(maxHp * 0.2)
            if (char.hp > hpCost) {
              const distanceToEnemy = enemies.length > 0 ? Math.min(...enemies.map(e => Math.abs(e.row - char.row) + Math.abs(e.col - char.col))) : Infinity
              const distanceBonus = enemies.length > 0 ? (10 - Math.min(distanceToEnemy, 10)) : 0
              const supportValue = 5 + distanceBonus
              if (supportValue > maxDamage) {
                maxDamage = supportValue
                bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
                bestTarget = char
                bestSkill = skill
              }
            }
          }
          else if (skill.category !== 'special') {
            let hasValidTarget = false
            
            if (skill.type === 'support') {
              const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
              const skillRange = skill.range || 2
              
              for (const ally of allies) {
                const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
                if (distance <= skillRange) {
                  if (skill.id === 'pu_tong_hu_li' || skill.id === 'jin_ji_zhi_liao' || skill.id === 'zhi_yu_zhi_guang' || skill.id === 'tian_ya_qing_qing') {
                    const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                    const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                    if (ally.hp < allyMaxHp) {
                      hasValidTarget = true
                      break
                    }
                  } else if (skill.id === 'yu_yin_rao_liang' || skill.id === 'feng_mo_qin_xin') {
                    const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                    const allyMaxMp = allyTemplate?.maxMp || ally.maxMp || 100
                    if (ally.mp < allyMaxMp) {
                      hasValidTarget = true
                      break
                    }
                  } else {
                    hasValidTarget = true
                    break
                  }
                }
              }
            }
            
            if (hasValidTarget) {
              const supportValue = 15
              if (supportValue > maxDamage) {
                maxDamage = supportValue
                bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
                bestTarget = char
                bestSkill = skill
              }
            }
          }
        }
      }
      
      // 检查敌方建筑
      for (const building of battleMap.value.buildings) {
        if (char.isPlayer ? !building.isPlayer : building.isPlayer) {
          const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
          if (dist <= effectiveAttackRange) {
            const attackPower = computeAttackPower(char)
            console.log(`[AI] ${char.id} | building attack on ${building.id} at dist ${dist}, range ${effectiveAttackRange}, attackPower: ${attackPower}`)
            if (attackPower > maxDamage) {
              maxDamage = attackPower
              bestMove = (pos.row === originalRow && pos.col === originalCol) ? null : pos
              bestTarget = building
              bestSkill = null
            }
          }
        }
      }
    }
    
    char.row = originalRow
    char.col = originalCol
    
    // 检查当前位置是否能执行最佳动作（不需要移动）
    const currentPositionCanAct = !bestMove || (bestMove.row === originalRow && bestMove.col === originalCol)
    
    // 如果当前位置能执行动作，直接执行
    if (maxDamage > 0 && currentPositionCanAct) {
      console.log(`[AI] ${char.id} | current position can act, maxDamage:${maxDamage}, bestSkill:${bestSkill?.name || 'null'}, bestTarget:${bestTarget?.id || 'null'}`)
      if (!char.hasActed) {
        if (bestSkill) {
          // 对于直线/横扫攻击技能，传递方向参数
          if ((bestSkill.category === '直线' || bestSkill.category === '横扫') && bestTarget && 'direction' in bestTarget) {
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} in direction ${bestTarget.direction}`)
            useSkill(bestSkill.id, char.id, bestTarget.direction)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.category === 'aoe' && bestSkill.targetCountTag !== '轰炸') {
            // 以自身为中心的AOE技能（非轰炸类）：传null，使用自身位置
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-centered AOE)`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.category === 'aoe' && bestSkill.targetCountTag === '轰炸') {
            // 轰炸类AOE技能：选择伤害最大的格子为中心，传递 pos_row_col
            const bestCenterPos = findBestBombingCenter(char, bestSkill)

            if (bestCenterPos) {
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at pos(${bestCenterPos.row},${bestCenterPos.col})`)
              useSkill(bestSkill.id, char.id, `pos_${bestCenterPos.row}_${bestCenterPos.col}`)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.id === 'bing_feng_zhi_men') {
            // 冰封之门：选择 range 范围内的最多 targetCount 个空格，传 pos_row_col 数组
            const targetCount = bestSkill.targetCount || 2
            const range = bestSkill.range || 2
            const map = battleMap.value
            const candidatePositions: string[] = []
            if (map) {
              for (let dr = -range; dr <= range; dr++) {
                for (let dc = -range; dc <= range; dc++) {
                  const dist = Math.abs(dr) + Math.abs(dc)
                  if (dist > 0 && dist <= range) {
                    const r = char.row + dr
                    const c = char.col + dc
                    if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                      const tile = map.tiles[r]?.[c]
                      const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === r && x.col === c)
                      const hasBuilding = (map.buildings || []).some(b => b.row === r && b.col === c)
                      if (tile && tile.terrain === 'empty' && !hasChar && !hasBuilding) {
                        candidatePositions.push(`pos_${r}_${c}`)
                      }
                    }
                  }
                }
              }
            }
            if (candidatePositions.length > 0) {
              const positions = candidatePositions.slice(0, targetCount)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at ${positions.join(',')}`)
              useSkill(bestSkill.id, char.id, positions)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.id === 'gao_shan_liu_shui') {
            // 高山流水：选择4格范围内的最多2个友方目标（优先选择血量缺失最多的）
            const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
            const skillRange = bestSkill.range || 4
            const targetCount = bestSkill.targetCount || 2
            const woundedAllies: { ally: BattleCharacter; missingHp: number }[] = []

            for (const ally of allies) {
              const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
              if (distance <= skillRange) {
                const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                const missingHp = allyMaxHp - ally.hp
                if (missingHp > 0) {
                  woundedAllies.push({ ally, missingHp })
                }
              }
            }

            if (woundedAllies.length > 0) {
              woundedAllies.sort((a, b) => b.missingHp - a.missingHp)
              const targetIds = woundedAllies.slice(0, targetCount).map(t => t.ally.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no wounded allies for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.category === 'summon') {
            // 统一处理所有召唤类技能：选择范围内离敌人最近的空格
            const skillRange = bestSkill.range || 2
            const targetCount = bestSkill.targetCount || 1
            const map = battleMap.value
            const candidatePositions: { pos: string; dist: number; row: number; col: number }[] = []
            if (map) {
              const enemies = char.isPlayer ? map.enemies : map.players
              for (let dr = -skillRange; dr <= skillRange; dr++) {
                for (let dc = -skillRange; dc <= skillRange; dc++) {
                  const dist = Math.abs(dr) + Math.abs(dc)
                  if (dist > 0 && dist <= skillRange) {
                    const r = char.row + dr
                    const c = char.col + dc
                    if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                      const tile = map.tiles[r]?.[c]
                      const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === r && x.col === c)
                      const hasBuilding = (map.buildings || []).some(b => b.row === r && b.col === c)
                      if (tile && tile.terrain === 'empty' && !hasChar && !hasBuilding) {
                        const minDistToEnemy = enemies.reduce((min, e) => Math.min(min, Math.abs(e.row - r) + Math.abs(e.col - c)), Infinity)
                        candidatePositions.push({ pos: `pos_${r}_${c}`, dist: minDistToEnemy, row: r, col: c })
                      }
                    }
                  }
                }
              }
            }
            if (candidatePositions.length >= targetCount) {
              candidatePositions.sort((a, b) => a.dist - b.dist)
              const positions = candidatePositions.slice(0, targetCount).map(p => p.pos)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at ${positions.join(',')}`)
              useSkill(bestSkill.id, char.id, positions)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else if (candidatePositions.length > 0) {
              candidatePositions.sort((a, b) => a.dist - b.dist)
              const position = candidatePositions[0].pos
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at ${position}`)
              useSkill(bestSkill.id, char.id, position)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.id === 'an_ye_jin_sheng') {
            // 暗夜噤声：选择3格范围内的2个敌方目标
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'jing_zhun_da_ji') {
            // 精准打击：传递2个目标ID数组
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'ni_tian_can_ren') {
            // 逆天残刃：传递最多3个目标ID数组
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'dao_guang_jian_ying' || bestSkill.id === 'xing_huo_liao_yuan') {
            // 刀光剑影/星火燎原：传递最多2个目标ID数组
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'qian_zhu_sui_ying') {
            // 千蛛碎影：传递最多3个目标ID数组
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'ju_du_shi_gu') {
            // 巨毒噬骨：单目标，会触发中毒状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'die_xue_ci_ji') {
            // 喋血刺击：单目标，会触发出血状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'sui_lie_zhong_ji') {
            // 碎裂重击：单目标，会触发眩晕状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'xi_xue') {
            // 吸血：单目标，造成伤害并回血
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'ling_hun_zu_zhou' || bestSkill.id === 'ku_lou_xue_shou_yin' || bestSkill.id === 'liu_hun_kong_zhou' || bestSkill.id === 'emp_chong_ji_bo' || bestSkill.id === 'fu_she_da_ji' || bestSkill.id === 'shi_xin_shi_sui') {
            // 灵魂诅咒/骷髅血手印/六魂恐咒/EMP冲击波/辐射打击/噬心食髓：单目标，造成伤害并触发不良状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'ling_hun_rao_luan' || bestSkill.id === 'wang_zhe_zhi_qi' || bestSkill.id === 'tian_luo_di_wang') {
            // 灵魂扰乱/亡者之气/天罗地网：传递最多2个目标ID数组，会触发心乱/瘸腿状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'mei_huo') {
            // 魅惑：单目标，造成伤害并触发紊乱状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.type === 'heal') {
            // 所有治疗技能：对友方角色进行治疗
            const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
            const skillRange = bestSkill.range || 1

            if (skillRange === 0 && bestSkill.areaRange) {
              // 自身为中心的AOE治疗（如碧海潮生、空山鸟语）
              console.log(`[AI] ${char.id} | using heal AOE skill ${bestSkill.name} (self-centered)`)
              useSkill(bestSkill.id, char.id, null)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else if (bestSkill.id === 'ai_de_hui_yi' || bestSkill.id === 'wu_di_niu_niu' || bestSkill.id === 'ning_xin_jue' || bestSkill.id === 'wan_gu_jie_jie') {
              // 自身治疗技能
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-targeting)`)
              useSkill(bestSkill.id, char.id, char.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              // 目标治疗：选择友方中血量缺失最多的目标
              const targetCount = bestSkill.targetCount || 1
              let healTargets: BattleCharacter[] = []

              for (const ally of allies) {
                const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
                if (distance <= skillRange) {
                  const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                  const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                  const missingHp = allyMaxHp - ally.hp
                  if (missingHp > 0) {
                    healTargets.push(ally)
                  }
                }
              }

              if (healTargets.length > 0) {
                // 按缺失血量从多到少排序
                healTargets.sort((a, b) => {
                  const aT = findCharacterTemplateInStore(a.characterId)
                  const aMax = aT?.maxHp || a.maxHp || 100
                  const bT = findCharacterTemplateInStore(b.characterId)
                  const bMax = bT?.maxHp || b.maxHp || 100
                  return (bMax - b.hp) - (aMax - a.hp)
                })

                const selected = healTargets.slice(0, targetCount)
                if (targetCount > 1) {
                  const targetIds = selected.map(t => t.id)
                  console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
                  useSkill(bestSkill.id, char.id, targetIds)
                } else {
                  console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${selected[0].id}`)
                  useSkill(bestSkill.id, char.id, selected[0].id)
                }
                console.log(`[AI] ${char.id} | skill used successfully`)
              } else {
                console.log(`[AI] ${char.id} | no valid heal targets, skipping skill`)
              }
            }
          } else if (bestSkill.id === 'jue_chu_feng_sheng') {
            // 绝处逢生：对自己使用，消耗生命获得愤怒状态
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-targeting)`)
            useSkill(bestSkill.id, char.id, char.id)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.id === 'yue_zhi_yin_li') {
            // 月之引力：选择2格范围内的1个同阵营目标，使自身和该目标都获得愈合和调息状态
            const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
            const skillRange = bestSkill.range || 2
            let targetAlly = null
            for (const ally of allies) {
              const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
              if (distance <= skillRange && ally.id !== char.id) {
                targetAlly = ally
                break
              }
            }
            if (targetAlly) {
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetAlly.id}`)
              useSkill(bestSkill.id, char.id, targetAlly.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid allies for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.type === 'support' && bestSkill.category !== 'special') {
            // 其他辅助技能：使用评估时选定的目标
            console.log(`[AI] ${char.id} | using support skill ${bestSkill.name} on ${bestTarget?.id || 'self'}`)
            useSkill(bestSkill.id, char.id, bestTarget?.id || char.id)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.id === 'zhai_ye_fei_hua') {
            // 摘叶飞花：单目标，距离越远伤害越高，会触发出血状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'wan_ye_fei_hua') {
            // 万叶飞花：传递最多2个目标ID数组，会触发出血状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'yin_yang_yu_shou_yin') {
            // 阴阳玉手印：传递最多3个目标ID数组，伤害均摊
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'yi_jian_ting_yu') {
            // 奕剑听雨：以自身为中心的AOE攻击技能，传null
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-centered AOE)`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.id === 'ling_yun_fei_jian' || bestSkill.id === 'mo_yu_he_ling') {
            // 凌云飞剑/墨羽鹤翎：传递最多3个目标ID数组，对敌方目标造成伤害
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'ju_qi_cheng_ren') {
            // 聚气成刃：传递最多2个目标ID数组，对敌方目标造成伤害
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'yin_yang_kui_lei_shu') {
            // 阴阳傀儡术：单目标，造成伤害并触发脆弱状态
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'meng_hu_xia_shan') {
            // 猛虎下山：相邻1格范围内的1个敌方目标
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.id === 'meng_hu_si_hou') {
            // 猛虎嘶吼：3格菱形范围内的2个敌方目标，造成伤害并触发脆弱
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else if (bestSkill.category === 'aoe' && bestSkill.targetCountTag !== '轰炸') {
            // 以自身为中心的AOE技能（非轰炸类）：传null，使用自身位置
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-centered AOE)`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.category === '指定') {
            // 指定类技能：根据targetCount选择多个目标
            const sortedTargets = getBestSkillTargets(char, bestSkill)
            if (sortedTargets.length > 0) {
              const targetCount = bestSkill.targetCount || 1
              const selectedTargets = sortedTargets.slice(0, targetCount)
              const targetIds = selectedTargets.map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds.length > 1 ? targetIds : targetIds[0])
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          } else {
            // 对于其他需要目标的技能，使用按伤害排序的最佳目标
            const sortedTargets = getBestSkillTargets(char, bestSkill)
            if (sortedTargets.length > 0) {
              const target = sortedTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets after moving, skipping skill`)
            }
          }
        } else if (bestTarget) {
          // 对于普通攻击，重新检查目标是否还在范围内
          // 使用角色实际的攻击范围（已含装备加成）
          const baseAttackRange = char.attackRange || 1
          const attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char))
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
          let targetStillValid = false
          
          if ('characterId' in bestTarget) {
            const target = allChars.find(c => c.id === bestTarget.id)
            if (target) {
              const distance = Math.abs(target.row - char.row) + Math.abs(target.col - char.col)
              targetStillValid = distance <= attackRange
            }
          } else if ('hp' in bestTarget && 'maxHp' in bestTarget) {
            const building = battleMap.value.buildings.find(b => b.id === bestTarget.id)
            if (building) {
              const distance = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
              targetStillValid = distance <= attackRange
            }
          }
          
          if (targetStillValid) {
            console.log(`[AI] ${char.id} | attacking ${bestTarget.id}`)
            if ('characterId' in bestTarget) {
              attack(char.id, bestTarget.id)
            } else {
              attackBuilding(char.id, bestTarget.id)
            }
            console.log(`[AI] ${char.id} | attack completed`)
          } else {
            console.log(`[AI] ${char.id} | target no longer valid after moving, skipping attack`)
          }
        }
      }
    }
    
    // 如果需要移动到最佳位置才能执行动作，先移动
    if (maxDamage > 0 && bestMove && !char.hasMoved && !currentPositionCanAct) {
      console.log(`[AI] ${char.id} | need to move to act, moving to ${bestMove.row},${bestMove.col}`)
      moveCharacter(char.id, bestMove.row, bestMove.col)
      await new Promise(resolve => setTimeout(resolve, 300 / (gameSpeed.value || 1)))
      console.log(`[AI] ${char.id} | moved successfully`)
      
      // 移动后再次评估并执行动作
      if (!char.hasActed) {
        if (bestSkill) {
          // 对于直线/横扫攻击技能，传递方向参数
          if ((bestSkill.category === '直线' || bestSkill.category === '横扫') && bestTarget && 'direction' in bestTarget) {
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} in direction ${bestTarget.direction}`)
            useSkill(bestSkill.id, char.id, bestTarget.direction)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.id === 'shadow_assassination' || bestSkill.id === 'fushi_nianye') {
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name}`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.category === 'aoe' && bestSkill.targetCountTag === '轰炸') {
            // 轰炸类AOE技能：选择伤害最大的格子为中心，传递 pos_row_col
            const bestCenterPos = findBestBombingCenter(char, bestSkill)

            if (bestCenterPos) {
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at pos(${bestCenterPos.row},${bestCenterPos.col})`)
              useSkill(bestSkill.id, char.id, `pos_${bestCenterPos.row}_${bestCenterPos.col}`)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              console.log(`[AI] ${char.id} | no valid targets for ${bestSkill.name}, skipping skill`)
            }
          } else if (bestSkill.category === 'summon') {
            // 统一处理所有召唤类技能
            const skillRange = bestSkill.range || 2
            const targetCount = bestSkill.targetCount || 1
            const map = battleMap.value
            const candidatePositions: { pos: string; dist: number; row: number; col: number }[] = []
            if (map) {
              const enemies = char.isPlayer ? map.enemies : map.players
              for (let dr = -skillRange; dr <= skillRange; dr++) {
                for (let dc = -skillRange; dc <= skillRange; dc++) {
                  const dist = Math.abs(dr) + Math.abs(dc)
                  if (dist > 0 && dist <= skillRange) {
                    const r = char.row + dr
                    const c = char.col + dc
                    if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
                      const tile = map.tiles[r]?.[c]
                      const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === r && x.col === c)
                      const hasBuilding = (map.buildings || []).some(b => b.row === r && b.col === c)
                      if (tile && tile.terrain === 'empty' && !hasChar && !hasBuilding) {
                        const minDistToEnemy = enemies.reduce((min, e) => Math.min(min, Math.abs(e.row - r) + Math.abs(e.col - c)), Infinity)
                        candidatePositions.push({ pos: `pos_${r}_${c}`, dist: minDistToEnemy, row: r, col: c })
                      }
                    }
                  }
                }
              }
              if (candidatePositions.length >= targetCount) {
                candidatePositions.sort((a, b) => a.dist - b.dist)
                const positions = candidatePositions.slice(0, targetCount).map(p => p.pos)
                console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at ${positions.join(',')}`)
                useSkill(bestSkill.id, char.id, positions)
                console.log(`[AI] ${char.id} | skill used successfully`)
              } else if (candidatePositions.length > 0) {
                candidatePositions.sort((a, b) => a.dist - b.dist)
                const position = candidatePositions[0].pos
                console.log(`[AI] ${char.id} | using skill ${bestSkill.name} at ${position}`)
                useSkill(bestSkill.id, char.id, position)
                console.log(`[AI] ${char.id} | skill used successfully`)
              } else {
                console.log(`[AI] ${char.id} | no valid empty tiles for ${bestSkill.name}, skipping skill`)
              }
            }
          } else if (bestSkill.id === 'an_ye_jin_sheng') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'jing_zhun_da_ji') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'ni_tian_can_ren') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'dao_guang_jian_ying' || bestSkill.id === 'xing_huo_liao_yuan') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'qian_zhu_sui_ying') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'ju_du_shi_gu' || bestSkill.id === 'die_xue_ci_ji' || bestSkill.id === 'sui_lie_zhong_ji' || bestSkill.id === 'xi_xue' || bestSkill.id === 'ling_hun_zu_zhou' || bestSkill.id === 'ku_lou_xue_shou_yin' || bestSkill.id === 'liu_hun_kong_zhou' || bestSkill.id === 'emp_chong_ji_bo' || bestSkill.id === 'fu_she_da_ji' || bestSkill.id === 'shi_xin_shi_sui' || bestSkill.id === 'mei_huo') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'ling_hun_rao_luan' || bestSkill.id === 'wang_zhe_zhi_qi' || bestSkill.id === 'tian_luo_di_wang') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.type === 'heal') {
            // 所有治疗技能：对友方角色进行治疗
            const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
            const skillRange = bestSkill.range || 1

            if (skillRange === 0 && bestSkill.areaRange) {
              // 自身为中心的AOE治疗（如碧海潮生、空山鸟语）
              console.log(`[AI] ${char.id} | using heal AOE skill ${bestSkill.name} (self-centered)`)
              useSkill(bestSkill.id, char.id, null)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else if (bestSkill.id === 'ai_de_hui_yi' || bestSkill.id === 'wu_di_niu_niu' || bestSkill.id === 'ning_xin_jue' || bestSkill.id === 'wan_gu_jie_jie') {
              // 自身治疗技能
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-targeting)`)
              useSkill(bestSkill.id, char.id, char.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            } else {
              // 目标治疗：选择友方中血量缺失最多的目标
              const targetCount = bestSkill.targetCount || 1
              let healTargets: BattleCharacter[] = []

              for (const ally of allies) {
                const distance = Math.abs(ally.row - char.row) + Math.abs(ally.col - char.col)
                if (distance <= skillRange) {
                  const allyTemplate = findCharacterTemplateInStore(ally.characterId)
                  const allyMaxHp = allyTemplate?.maxHp || ally.maxHp || 100
                  const missingHp = allyMaxHp - ally.hp
                  if (missingHp > 0) {
                    healTargets.push(ally)
                  }
                }
              }

              if (healTargets.length > 0) {
                // 按缺失血量从多到少排序
                healTargets.sort((a, b) => {
                  const aT = findCharacterTemplateInStore(a.characterId)
                  const aMax = aT?.maxHp || a.maxHp || 100
                  const bT = findCharacterTemplateInStore(b.characterId)
                  const bMax = bT?.maxHp || b.maxHp || 100
                  return (bMax - b.hp) - (aMax - a.hp)
                })

                const selected = healTargets.slice(0, targetCount)
                if (targetCount > 1) {
                  const targetIds = selected.map(t => t.id)
                  console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
                  useSkill(bestSkill.id, char.id, targetIds)
                } else {
                  console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${selected[0].id}`)
                  useSkill(bestSkill.id, char.id, selected[0].id)
                }
                console.log(`[AI] ${char.id} | skill used successfully`)
              } else {
                console.log(`[AI] ${char.id} | no valid heal targets, skipping skill`)
              }
            }
          } else if (bestSkill.id === 'zhai_ye_fei_hua') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'wan_ye_fei_hua') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'yin_yang_yu_shou_yin') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'yi_jian_ting_yu') {
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-centered AOE)`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else if (bestSkill.id === 'ling_yun_fei_jian' || bestSkill.id === 'mo_yu_he_ling') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(3, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'ju_qi_cheng_ren') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'yin_yang_kui_lei_shu') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'meng_hu_xia_shan') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'meng_hu_si_hou') {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const count = Math.min(2, validTargets.length)
              const targetIds = validTargets.slice(0, count).map(t => t.id)
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${targetIds.join(',')}`)
              useSkill(bestSkill.id, char.id, targetIds)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          } else if (bestSkill.id === 'qian_li_bing_feng' || bestSkill.id === 'terror_scream' || bestSkill.id === 'tian_beng_di_lie' || bestSkill.id === 'da_di_zhong_ji' || bestSkill.id === 'mo_lian_gui_shou' || bestSkill.id === 'zi_bao_du_ye' || bestSkill.id === 'lian_yu_huo_hai' || bestSkill.id === 'shui_man_jin_shan' || bestSkill.id === 'bi_hai_chao_sheng') {
            console.log(`[AI] ${char.id} | using skill ${bestSkill.name} (self-centered AOE)`)
            useSkill(bestSkill.id, char.id, null)
            console.log(`[AI] ${char.id} | skill used successfully`)
          } else {
            const skillTargets = getSkillAttackTargets(char, bestSkill)
            const validTargets = skillTargets.filter(t => !t.isObstacle)
            if (validTargets.length > 0) {
              const target = validTargets[0]
              console.log(`[AI] ${char.id} | using skill ${bestSkill.name} on ${target.id}`)
              useSkill(bestSkill.id, char.id, target.id)
              console.log(`[AI] ${char.id} | skill used successfully`)
            }
          }
        } else if (bestTarget) {
          const baseAttackRange = char.attackRange || 1
          const attackRange = Math.max(0, baseAttackRange + getStatusAttackRange(char))
          const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
          let targetStillValid = false
          
          if ('characterId' in bestTarget) {
            const target = allChars.find(c => c.id === bestTarget.id)
            if (target) {
              const distance = Math.abs(target.row - char.row) + Math.abs(target.col - char.col)
              targetStillValid = distance <= attackRange
            }
          } else if ('hp' in bestTarget && 'maxHp' in bestTarget) {
            const building = battleMap.value.buildings.find(b => b.id === bestTarget.id)
            if (building) {
              const distance = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
              targetStillValid = distance <= attackRange
            }
          }
          
          if (targetStillValid) {
            console.log(`[AI] ${char.id} | attacking ${bestTarget.id}`)
            if ('characterId' in bestTarget) {
              attack(char.id, bestTarget.id)
            } else {
              attackBuilding(char.id, bestTarget.id)
            }
            console.log(`[AI] ${char.id} | attack completed`)
          }
        }
      }
    }
    
    // 如果不能造成伤害，移动到最近的敌人或建筑并防御
    if (!char.hasActed) {
      console.log(`[AI] ${char.id} | cannot attack, moving to nearest enemy or building`)
      const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const enemyBuildings = battleMap.value.buildings.filter(b => char.isPlayer ? !b.isPlayer : b.isPlayer)
      
      let nearestTarget: (BattleCharacter | BattleBuilding) | null = null
      let minDistance = Infinity
      
      if (enemies.length > 0) {
        for (const enemy of enemies) {
          const dist = getDistance(char.row, char.col, enemy.row, enemy.col)
          if (dist < minDistance) {
            minDistance = dist
            nearestTarget = enemy
          }
        }
      }
      
      if (enemyBuildings.length > 0) {
        for (const building of enemyBuildings) {
          const dist = getDistance(char.row, char.col, building.row, building.col)
          if (dist < minDistance) {
            minDistance = dist
            nearestTarget = building
          }
        }
      }
      
      if (nearestTarget) {
        const moveRange = getCharacterMoveRange(char)
        console.log(`[AI] ${char.id} | moveRange size: ${moveRange.length}, nearest target: ${('characterId' in nearestTarget) ? nearestTarget.characterId : nearestTarget.id}`)
        let bestPosition: { row: number; col: number } | null = null
        let bestDistance = Infinity
        
        for (const pos of moveRange) {
          const dist = getDistance(pos.row, pos.col, nearestTarget.row, nearestTarget.col)
          if (dist < bestDistance) {
            bestDistance = dist
            bestPosition = pos
          }
        }
        
        if (bestPosition && !char.hasMoved) {
          console.log(`[AI] ${char.id} | moving to ${bestPosition.row},${bestPosition.col}`)
          moveCharacter(char.id, bestPosition.row, bestPosition.col)
          await new Promise(resolve => setTimeout(resolve, 300 / (gameSpeed.value || 1)))
          console.log(`[AI] ${char.id} | moved successfully`)
        } else {
          console.log(`[AI] ${char.id} | no valid move position found or already moved`)
        }
      } else {
        console.log(`[AI] ${char.id} | no enemies or buildings found in range, trying to move towards nearest enemy`)
        // 如果没有敌人和建筑在攻击范围内，寻找地图上最近的敌人并向其移动
        const allEnemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
        if (allEnemies.length > 0) {
          let nearestEnemy: BattleCharacter | null = null
          let minDist = Infinity
          for (const enemy of allEnemies) {
            const dist = getDistance(char.row, char.col, enemy.row, enemy.col)
            if (dist < minDist) {
              minDist = dist
              nearestEnemy = enemy
            }
          }
          if (nearestEnemy && !char.hasMoved) {
            const moveRange = getCharacterMoveRange(char)
            let bestPosition: { row: number; col: number } | null = null
            let bestDistance = Infinity
            for (const pos of moveRange) {
              const dist = getDistance(pos.row, pos.col, nearestEnemy.row, nearestEnemy.col)
              if (dist < bestDistance) {
                bestDistance = dist
                bestPosition = pos
              }
            }
            if (bestPosition) {
              console.log(`[AI] ${char.id} | moving towards nearest enemy at ${bestPosition.row},${bestPosition.col}`)
              moveCharacter(char.id, bestPosition.row, bestPosition.col)
              await new Promise(resolve => setTimeout(resolve, 300 / (gameSpeed.value || 1)))
              console.log(`[AI] ${char.id} | moved successfully`)
            }
          }
        }
      }
    }
    
    // 最后防御：移动后或无法攻击时防御，除非中毒状态需要优先治疗
    if (!char.hasActed) {
      const hasPoison = hasStatus(char, 'poison')
      const poisonStacks = getStatusStacks(char, 'poison') || 1
      const poisonDamage = poisonStacks * 50
      const hpPercent = char.hp / (char.maxHp || 100)
      
      if (hasPoison && poisonDamage > char.hp * 0.3 && hpPercent < 0.8) {
        console.log(`[AI] ${char.id} | poisoned and in danger, trying to heal instead of defend`)
        const allies = char.isPlayer ? battleMap.value.players : battleMap.value.enemies
        const availableSkills = (charTemplate?.skills || []).filter(skill => {
          const cooldown = char.skillCooldowns ? char.skillCooldowns[skill.id] : 0
          return cooldown === 0 && char.mp >= skill.mpCost && (skill.type === 'heal' || skill.id === 'bi_hai_chao_sheng' || skill.id === 'mu_feng_wei_shang')
        })
        
        if (availableSkills.length > 0) {
          const bestSkill = availableSkills[0]
          const alliesWithMissingHp = allies.filter(a => {
            const allyTemplate = findCharacterTemplateInStore(a.characterId)
            const allyMaxHp = allyTemplate?.maxHp || a.maxHp || 100
            return a.hp < allyMaxHp
          })
          
          if (alliesWithMissingHp.length > 0) {
            const healTarget = alliesWithMissingHp.sort((a, b) => {
              const aMax = (findCharacterTemplateInStore(a.characterId)?.maxHp || a.maxHp || 100)
              const bMax = (findCharacterTemplateInStore(b.characterId)?.maxHp || b.maxHp || 100)
              return (bMax - b.hp) - (aMax - a.hp)
            })[0]
            console.log(`[AI] ${char.id} | using heal skill ${bestSkill.name} on poisoned target`)
            useSkill(bestSkill.id, char.id, healTarget.id)
            return
          }
        }
      }
      
      console.log(`[AI] ${char.id} | entering defense mode`)
      defend(char.id)
      console.log(`[AI] ${char.id} | defense completed`)
    }
    } catch (error) {
      console.error(`[AI ERROR] executeAttackMode failed for ${char.id}:`, error)
      if (!char.hasActed) {
        const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
        const enemyBuildings = battleMap.value.buildings.filter(b => char.isPlayer ? !b.isPlayer : b.isPlayer)
        if (enemies.length === 0 && enemyBuildings.length === 0) {
          defend(char.id)
        }
      }
    }
  }
  
  // 处理无法造成伤害的情况
  async function handleNoDamageSituation(char: BattleCharacter) {
    if (!battleMap.value || char.hasActed) return
    
    // 移动到最近的敌方
    await moveToNearestEnemy(char)
    if (!char.hasActed) {
      const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const enemyBuildings = battleMap.value.buildings.filter(b => char.isPlayer ? !b.isPlayer : b.isPlayer)
      if (enemies.length === 0 && enemyBuildings.length === 0) {
        defend(char.id)
      }
    }
  }
  
  // 向最近的敌方移动的辅助函数
  async function moveToNearestEnemy(char: BattleCharacter) {
    if (!battleMap.value) return
    
    const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
    if (enemies.length === 0) return
    
    // 找到最近的敌人
    let nearestEnemy = enemies[0]
    let minDistance = getDistance(char.row, char.col, nearestEnemy.row, nearestEnemy.col)
    
    for (const enemy of enemies.slice(1)) {
      const dist = getDistance(char.row, char.col, enemy.row, enemy.col)
      if (dist < minDistance) {
        minDistance = dist
        nearestEnemy = enemy
      }
    }
    
    // 找到可移动范围内离敌人最近的位置
    const moveRange = getCharacterMoveRange(char)
    let bestPosition: { row: number; col: number } | null = null
    let bestDistance = Infinity
    
    for (const pos of moveRange) {
      const dist = getDistance(pos.row, pos.col, nearestEnemy.row, nearestEnemy.col)
      if (dist < bestDistance) {
        bestDistance = dist
        bestPosition = pos
      }
    }
    
    // 如果找到更好的位置，则移动
    if (bestPosition) {
      moveCharacter(char.id, bestPosition.row, bestPosition.col)
      await new Promise(resolve => setTimeout(resolve, 300 / (gameSpeed.value || 1)))
    }
  }
  
  // 全军集结模式
  async function executeGatherMode(char: BattleCharacter) {
    if (!battleMap.value) return
    
    const nearestPoint = getNearestGatherPoint(char)
    if (!nearestPoint) {
      // 如果没有集结点，切换到攻击模式
      await executeAttackMode(char)
      return
    }
    
    // 首先，在当前位置检查是否能攻击到敌人
    if (!char.hasActed) {
      const currentTargets = getAttackableTargets(char)
      if (currentTargets.length > 0) {
        // 攻击能造成最大伤害的目标
        let bestTarget = currentTargets[0]
        let maxDamage = calculateDamage(char, bestTarget)
        
        for (const target of currentTargets.slice(1)) {
          const damage = calculateDamage(char, target)
          if (damage > maxDamage) {
            maxDamage = damage
            bestTarget = target
          }
        }
        
        if ('characterId' in bestTarget) {
          attack(char.id, bestTarget.id)
        } else {
          attackBuilding(char.id, bestTarget.id)
        }
      }
    }
    
    // 优先移动向最近的集结点
    if (!char.hasMoved) {
      const moveRange = getCharacterMoveRange(char)
      
      if (moveRange.length > 0) {
        let bestMove = moveRange[0]
        let minDist = getDistance(bestMove.row, bestMove.col, nearestPoint.row, nearestPoint.col)
        
        for (const pos of moveRange.slice(1)) {
          const dist = getDistance(pos.row, pos.col, nearestPoint.row, nearestPoint.col)
          if (dist < minDist) {
            minDist = dist
            bestMove = pos
          }
        }
        
        // 移动到最佳位置
        moveCharacter(char.id, bestMove.row, bestMove.col)
        
        // 移动后尝试攻击
        if (!char.hasActed) {
          const newTargets = getAttackableTargets(char)
          if (newTargets.length > 0) {
            const target = newTargets[Math.floor(Math.random() * newTargets.length)]
            if ('characterId' in target) {
              attack(char.id, target.id)
            } else {
              attackBuilding(char.id, target.id)
            }
          } else {
            // 不能攻击：仅在没有敌人和建筑时才防御
            const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
            const enemyBuildings = battleMap.value.buildings.filter(b => char.isPlayer ? !b.isPlayer : b.isPlayer)
            if (enemies.length === 0 && enemyBuildings.length === 0) {
              defend(char.id)
            }
          }
        }
      }
    } else if (!char.hasActed) {
      // 不能移动：仅在没有敌人和建筑时才防御
      const enemies = char.isPlayer ? battleMap.value.enemies : battleMap.value.players
      const enemyBuildings = battleMap.value.buildings.filter(b => char.isPlayer ? !b.isPlayer : b.isPlayer)
      if (enemies.length === 0 && enemyBuildings.length === 0) {
        defend(char.id)
      }
    }
  }

  async function executePlayerAiTurn() {
    if (!battleMap.value) return

    const playerChars = battleMap.value.players.filter(p => !p.hasMoved || !p.hasActed)
    
    for (const char of playerChars) {
      // 如果战斗已结束（敌方全灭或玩家全灭），立即停止执行
      if (battleResult.value || battleMap.value.enemies.length === 0 || battleMap.value.players.length === 0) return
      await new Promise(resolve => setTimeout(resolve, 750 / gameSpeed.value))
      await executeCharacterAi(char, true)
    }
  }

  async function endPlayerTurn() {
    if (!battleMap.value) return

    console.log('=== 回合' + battleMap.value.turn + ' 结束 ===')
    console.log('玩家:', battleMap.value.players.map(p => `${p.characterId}(${p.row},${p.col}) moved:${p.hasMoved} acted:${p.hasActed}`))
    console.log('敌人:', battleMap.value.enemies.map(e => `${e.characterId}(${e.row},${e.col})`))

    // 先检查是否有未行动的玩家角色
    let playerChars = battleMap.value.players.filter(p => !p.hasMoved || !p.hasActed)
    if (playerChars.length > 0) {
      battleLog.value.push('剩余角色自动行动中...')
      
      // 按照到最近敌方目标的曼哈顿距离排序（最近的先行动）
      playerChars = playerChars.sort((a, b) => {
        const aDistance = getMinManhattanDistance(a, battleMap.value.enemies, battleMap.value.buildings.filter(b => b.owner !== player.value.id))
        const bDistance = getMinManhattanDistance(b, battleMap.value.enemies, battleMap.value.buildings.filter(b => b.owner !== player.value.id))
        return aDistance - bDistance
      })
      
      for (const char of playerChars) {
        // 如果战斗已结束（敌方全灭或玩家全灭），立即停止执行
        if (battleResult.value || battleMap.value.enemies.length === 0 || battleMap.value.players.length === 0) return
        await new Promise(resolve => setTimeout(resolve, 750 / gameSpeed.value))
        await executeCharacterAi(char, true)
      }
    }

    // 战斗已结束则不再执行回合结束逻辑
    if (battleResult.value || battleMap.value.enemies.length === 0) return

    // 重置玩家角色已完成回合状态，除了防御状态
    battleMap.value.players.forEach(p => {
      p.hasMoved = false
      p.hasActed = false
      p.isDefending = false
    })

    battleMap.value.battlePhase = 'enemy'
    // 玩家回合结束：清除设置为玩家回合结束后过期的技能雪地
    cleanupExpiredSnowAreas('player')
    battleLog.value.push('敌方回合开始')
    setTimeout(() => executeEnemyTurn(), 750 / gameSpeed.value)
  }

  function getBuilding4AdjacentEmptyPositions(building: BattleBuilding): { row: number; col: number }[] {
    if (!battleMap.value) return []
    
    const positions: { row: number; col: number }[] = []
    const offsets = [
      { row: -1, col: 0 }, // 上
      { row: 1, col: 0 },  // 下
      { row: 0, col: -1 }, // 左
      { row: 0, col: 1 }   // 右
    ]
    
    offsets.forEach(offset => {
      const newRow = building.row + offset.row
      const newCol = building.col + offset.col
      
      // 检查是否在地图范围内
      if (newRow >= 0 && newRow < battleMap.value.height &&
          newCol >= 0 && newCol < battleMap.value.width) {
        const tile = battleMap.value.tiles[newRow]?.[newCol]
        
        // 检查是否是空地
        if (tile && tile.terrain === 'empty' && !tile.building) {
          // 检查是否有角色
          const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some(
            char => char.row === newRow && char.col === newCol
          )
          // 检查是否有收集物
          const hasCollectible = battleMap.value.collectibles.some(
            col => col.row === newRow && col.col === newCol
          )
          
          if (!hasCharacter && !hasCollectible) {
            positions.push({ row: newRow, col: newCol })
          }
        }
      }
    })
    
    return positions
  }
  
  function getBuildingAdjacentEmptyPositions(building: BattleBuilding): { row: number; col: number }[] {
    if (!battleMap.value) return []
    
    const positions: { row: number; col: number }[] = []
    
    // 查找2格范围内的所有位置
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue // 跳过建筑本身的位置
        
        const newRow = building.row + dr
        const newCol = building.col + dc
        
        // 检查是否在地图范围内
        if (newRow >= 0 && newRow < battleMap.value.height &&
            newCol >= 0 && newCol < battleMap.value.width) {
          const tile = battleMap.value.tiles[newRow]?.[newCol]
          
          // 检查是否是空地
          if (tile && tile.terrain === 'empty' && !tile.building) {
            // 检查是否有角色
            const hasCharacter = [...battleMap.value.players, ...battleMap.value.enemies].some(
              char => char.row === newRow && char.col === newCol
            )
            // 检查是否有收集物
            const hasCollectible = battleMap.value.collectibles.some(
              col => col.row === newRow && col.col === newCol
            )
            
            if (!hasCharacter && !hasCollectible) {
              positions.push({ row: newRow, col: newCol })
            }
          }
        }
      }
    }
    
    return positions
  }

  function trySpawnBuildingItems() {
    if (!battleMap.value) return
    
    const currentTurn = battleMap.value.turn
    
    console.log('=== trySpawnBuildingItems ===')
    console.log('当前回合:', currentTurn)
    console.log('建筑物列表:', battleMap.value.buildings)
    
    battleMap.value.buildings.forEach(building => {
      console.log(`检查建筑: ${building.name}, isPlayer: ${building.isPlayer}, hasSpawnedBonus: ${building.hasSpawnedBonus}`)
      
      // 处理血心建筑（敌方）
      if (building.type === 'heart' && !building.isPlayer) {
        // 每4回合生成一个普通丧尸（第4、8、12...回合）
        if (building.spawnRound && currentTurn > 0 && currentTurn % building.spawnRound === 0) {
          console.log('血心触发生成')
          spawnOrdinaryZombieFromHeart(building)
        }
        return
      }

      // 处理兵营建筑（敌方）
      if (building.type === 'barracks' && !building.isPlayer) {
        const config = BUILDING_CONFIG.barracks
        if (config.spawnRound && currentTurn > 0 && currentTurn % config.spawnRound === 0) {
          console.log('兵营触发生成')
          spawnSoldierFromBarracks(building)
          battleLog.value.push(`兵营每5回合生成了一个士兵！`)
        }
        return
      }
      
      // 处理天启炮建筑（敌方）
      if (building.type === 'tianqiPao' && !building.isPlayer) {
        if (!building.targetPositions) {
          building.targetPositions = []
        }
        
        // 去掉 currentTurn > 0 的限制，让第一回合就开始瞄准
        if (currentTurn % 2 === 1) {
          // 奇数回合：瞄准阶段（包括第一回合）
          const targets: { row: number; col: number }[] = []
          const playerTargets = []
          
          // 收集所有玩家角色位置
          battleMap.value.players.forEach(p => {
            playerTargets.push({ row: p.row, col: p.col, type: 'character' as const, target: p })
          })
          
          // 收集所有玩家建筑位置
          battleMap.value.buildings.forEach(b => {
            if (b.isPlayer) {
              playerTargets.push({ row: b.row, col: b.col, type: 'building' as const, target: b })
            }
          })
          
          // 随机选择2个目标位置
          if (playerTargets.length > 0) {
            const shuffled = [...playerTargets].sort(() => Math.random() - 0.5)
            const selected = shuffled.slice(0, Math.min(2, shuffled.length))
            
            selected.forEach(t => {
              targets.push({ row: t.row, col: t.col })
            })
          }
          
          building.targetPositions = targets
          
          if (targets.length > 0) {
            const posStr = targets.map(t => `(${t.row},${t.col})`).join(' 和 ')
            battleLog.value.push(`天启炮瞄准了位置 ${posStr}！`)
          }
        } else {
          // 偶数回合：攻击阶段
          if (building.targetPositions.length > 0) {
            battleLog.value.push(`天启炮发射！`)
            
            building.targetPositions.forEach(targetPos => {
              // 检查该位置是否有角色
              const characterAtPos = [...battleMap.value.players, ...battleMap.value.enemies].find(
                c => c.row === targetPos.row && c.col === targetPos.col
              )
              
              // 检查该位置是否有建筑
              const buildingAtPos = battleMap.value.buildings.find(
                b => b.row === targetPos.row && b.col === targetPos.col
              )
              
              if (characterAtPos && characterAtPos.isPlayer) {
                // 对玩家角色造成90%生命值上限的伤害
                const characterTemplate = findCharacterTemplateInStore(characterAtPos.characterId)
                const maxHp = characterTemplate?.maxHp || characterTemplate?.baseMaxHp || characterAtPos.hp
                const damage = Math.floor(maxHp * 0.9)
                const actualDamage = Math.max(1, damage)
                
                characterAtPos.hp = Math.max(0, characterAtPos.hp - actualDamage)
                
                // 添加被攻击抖动特效
                triggerShake(characterAtPos.row, characterAtPos.col, 'character')
                
                battleLog.value.push(`天启炮对【${characterTemplate?.name || '角色'}】造成 ${actualDamage} 点伤害！`)
                
                // 更新天启炮的伤害统计
                if (!building.totalDamage) building.totalDamage = 0
                building.totalDamage += actualDamage
                
                if (characterAtPos.hp <= 0) {
                  removeCharacterFromBattle(characterAtPos.id, characterAtPos.isPlayer)
                  battleLog.value.push(`${characterTemplate?.name || '角色'} 被天启炮击杀！`)
                }
              } else if (buildingAtPos && buildingAtPos.isPlayer) {
                // 对玩家建筑造成45%生命值上限的伤害
                const damage = Math.floor(buildingAtPos.maxHp * 0.45)
                const actualDamage = Math.max(1, damage)
                
                buildingAtPos.hp = Math.max(0, buildingAtPos.hp - actualDamage)
                battleLog.value.push(`天启炮对【${buildingAtPos.name}】造成 ${actualDamage} 点伤害！`)
                
                // 更新天启炮的伤害统计
                if (!building.totalDamage) building.totalDamage = 0
                building.totalDamage += actualDamage
                
                if (buildingAtPos.hp <= 0) {
                  removeBuildingFromBattle(buildingAtPos.id)
                  battleMap.value.tiles[buildingAtPos.row]![buildingAtPos.col]!.building = null
                  battleLog.value.push(`${buildingAtPos.name} 被天启炮摧毁！`)
                }
              }
            })
            
            // 清空瞄准位置
            building.targetPositions = []
          }
        }
        return
      }
      
      // 处理灵田建筑（我方）
      if (building.type === 'spiritField' && building.isPlayer) {
        const config = BUILDING_CONFIG.spiritField
        // 只在第5回合生成一次
        if (!building.hasSpawnedBonus && config.spawnRound && currentTurn === config.spawnRound) {
          console.log('灵田触发生成')
          const emptyPositions = getBuilding4AdjacentEmptyPositions(building)
          console.log('灵田周围空位置:', emptyPositions)
          
          if (emptyPositions.length > 0) {
            const itemConfig = COLLECTIBLE_CONFIG.spirit_grass
            const count = Math.min(4, emptyPositions.length)
            
            for (let i = 0; i < count; i++) {
              const pos = emptyPositions[i]
              battleMap.value!.collectibles.push({
                id: `collect_${Date.now()}_${Math.random()}`,
                type: 'spirit_grass',
                name: itemConfig.name,
                icon: itemConfig.icon,
                description: itemConfig.description,
                hpRestore: itemConfig.hpRestore,
                mpRestore: itemConfig.mpRestore,
                row: pos.row,
                col: pos.col
              })
            }
            building.hasSpawnedBonus = true
            battleLog.value.push(`灵田在4个相邻空格上生成了 ${count} 株灵草！`)
          }
        }
        return
      }
      
      // 处理丹房建筑（我方）
      if (building.type === 'elixirRoom' && building.isPlayer) {
        const config = BUILDING_CONFIG.elixirRoom
        // 只在第5回合生成一次
        if (!building.hasSpawnedBonus && config.spawnRound && currentTurn === config.spawnRound) {
          console.log('丹房触发生成')
          const emptyPositions = getBuilding4AdjacentEmptyPositions(building)
          console.log('丹房周围空位置:', emptyPositions)
          
          if (emptyPositions.length > 0) {
            const itemConfig = COLLECTIBLE_CONFIG.elixir
            const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            
            battleMap.value.collectibles.push({
              id: `collect_${Date.now()}_${Math.random()}`,
              type: 'elixir',
              name: itemConfig.name,
              icon: itemConfig.icon,
              description: itemConfig.description,
              hpRestore: itemConfig.hpRestore,
              mpRestore: itemConfig.mpRestore,
              row: pos.row,
              col: pos.col
            })
            building.hasSpawnedBonus = true
            battleLog.value.push(`丹房在4个相邻空格上生成了一个丹药！`)
          }
        }
        return
      }
    })
  }

  async function executeEnemyTurn() {
    if (!battleMap.value || !player.value) return

    // 按照到最近玩家目标的曼哈顿距离排序（最近的先行动）
    const sortedEnemies = [...battleMap.value.enemies].sort((a, b) => {
      const aDistance = getMinManhattanDistance(a, battleMap.value.players, battleMap.value.buildings.filter(b => b.owner === player.value.id))
      const bDistance = getMinManhattanDistance(b, battleMap.value.players, battleMap.value.buildings.filter(b => b.owner === player.value.id))
      return aDistance - bDistance
    })

    for (const enemy of sortedEnemies) {
      // 如果战斗已结束（玩家全灭或敌方全灭），立即停止执行
      if (battleResult.value || battleMap.value.players.length === 0 || battleMap.value.enemies.length === 0) return
      await new Promise(resolve => setTimeout(resolve, 750 / gameSpeed.value))
      await executeCharacterAi(enemy, false)
    }

    // 战斗已结束则不再执行回合结束逻辑
    if (battleResult.value || battleMap.value.players.length === 0) return

    // 回合结束：所有角色触发燃烧/流血状态（敌我双方全部行动后）
    triggerStatusOnTurnEnd([...battleMap.value.players, ...battleMap.value.enemies])

    // 回合结束：火焰区域伤害（山火/天火区域的角色损失10%生命和10%法力）
    if (battleMap.value.fireAreas.length > 0) {
      const weather = battleMap.value.weather
      const weatherName = weather === 'sky_fire' ? '天火' : '山火'
      const allChars = [...battleMap.value.players, ...battleMap.value.enemies]
      const fireDamageLogs: string[] = []
      
      allChars.forEach(char => {
        if (isCharacterInFire(char)) {
          const charTemplate = findCharacterTemplateInStore(char.characterId)
          const maxHp = charTemplate?.maxHp || char.maxHp || 100
          const maxMp = charTemplate?.maxMp || char.maxMp || 100
          
          const hpDamage = Math.max(1, Math.floor(maxHp * 0.1))
          const mpDamage = Math.max(1, Math.floor(maxMp * 0.1))
          
          char.hp = Math.max(1, char.hp - hpDamage)
          char.mp = Math.max(0, char.mp - mpDamage)
          
          showFloatingText(char.row, char.col, hpDamage, 'damage')
          if (mpDamage > 0) {
            showFloatingText(char.row, char.col, mpDamage, 'mp')
          }
          
          triggerShake(char.row, char.col, 'character')
          fireDamageLogs.push(`【${charTemplate?.name || char.characterId}】因${weatherName}损失${hpDamage}生命和${mpDamage}法力`)
          
          if (char.hp <= 0) {
            char.hp = 1
          }
        }
      })
      
      if (fireDamageLogs.length > 0) {
        battleLog.value.push(`${weatherName}效果：${fireDamageLogs.join('；')}`)
      }
    }

    // 重置敌人状态
    battleMap.value.enemies.forEach(e => {
      e.hasMoved = false
      e.hasActed = false
      e.isDefending = false
      e.movedDistance = 0
      // Decrease enemy skill cooldowns
      if (e.skillCooldowns) {
        for (const skillId in e.skillCooldowns) {
          if (e.skillCooldowns[skillId] > 0) {
            e.skillCooldowns[skillId]--
          }
        }
      }
    })

    // 重置玩家角色状态（包括防御状态）
    battleMap.value.players.forEach(p => {
      p.hasMoved = false
      p.hasActed = false
      p.isDefending = false
      p.movedDistance = 0
      
      // 减少玩家技能冷却时间
      const char = player.value?.characters.find(c => c.id === p.characterId)
      char?.skills.forEach(s => {
        if (s.currentCooldown > 0) s.currentCooldown--
      })
    })

    battleMap.value.turn++
    battleMap.value.battlePhase = 'player'
    
    // 灵气阵营：人界、神界、仙界；煞气阵营：魔界、鬼界、妖界
    const reikiFactions = ['human', 'god', 'immortal']
    const shaqiFactions = ['demon', 'ghost', 'beast']
    
    console.log('=== 灵气煞气计算 ===')
    console.log('玩家角色:', battleMap.value.players.map(p => `${p.characterId} faction:${p.faction} job:${p.job} hp:${p.hp}`))
    console.log('敌方角色:', battleMap.value.enemies.map(e => `${e.characterId} faction:${e.faction} job:${e.job} hp:${e.hp}`))
    
    // 计算玩家阵营灵气加成：存活的灵气阵营角色位阶之和
    const playerReikiBonus = battleMap.value.players
      .filter(p => p.hp > 0 && reikiFactions.includes(p.faction))
      .reduce((sum, p) => sum + (JOB_CONFIG[p.job]?.rank || 1), 0)
    
    console.log('玩家灵气加成:', playerReikiBonus)
    
    // 计算玩家阵营煞气加成：存活的煞气阵营角色位阶之和
    const playerShaQiBonus = battleMap.value.players
      .filter(p => p.hp > 0 && shaqiFactions.includes(p.faction))
      .reduce((sum, p) => sum + (JOB_CONFIG[p.job]?.rank || 1), 0)
    
    console.log('玩家煞气加成:', playerShaQiBonus)
    
    // 计算敌方阵营灵气加成
    const enemyReikiBonus = battleMap.value.enemies
      .filter(e => e.hp > 0 && reikiFactions.includes(e.faction))
      .reduce((sum, e) => sum + (JOB_CONFIG[e.job]?.rank || 1), 0)
    
    console.log('敌方灵气加成:', enemyReikiBonus)
    
    // 计算敌方阵营煞气加成
    const enemyShaQiBonus = battleMap.value.enemies
      .filter(e => e.hp > 0 && shaqiFactions.includes(e.faction))
      .reduce((sum, e) => sum + (JOB_CONFIG[e.job]?.rank || 1), 0)
    
    console.log('敌方煞气加成:', enemyShaQiBonus)
    
    // 计算实际增加值（基础10 + 阵营加成）
    const playerReikiGain = 10 + playerReikiBonus
    const playerShaQiGain = 10 + playerShaQiBonus
    const enemyReikiGain = 10 + enemyReikiBonus
    const enemyShaQiGain = 10 + enemyShaQiBonus
    
    // 更新灵气和煞气值（上限100）
    battleMap.value.playerReiki = Math.min(100, battleMap.value.playerReiki + playerReikiGain)
    battleMap.value.playerShaQi = Math.min(100, battleMap.value.playerShaQi + playerShaQiGain)
    battleMap.value.enemyReiki = Math.min(100, battleMap.value.enemyReiki + enemyReikiGain)
    battleMap.value.enemyShaQi = Math.min(100, battleMap.value.enemyShaQi + enemyShaQiGain)
    
    console.log('灵气煞气最终值:', 
      `playerReiki:${battleMap.value.playerReiki}`, 
      `playerShaQi:${battleMap.value.playerShaQi}`,
      `enemyReiki:${battleMap.value.enemyReiki}`,
      `enemyShaQi:${battleMap.value.enemyShaQi}`)
    
    // 添加回合结束字幕
    battleLog.value.push(`回合结束，我方灵气值+${playerReikiGain}，煞气值+${playerShaQiGain}`)
    battleLog.value.push(`回合结束，敌方灵气值+${enemyReikiGain}，煞气值+${enemyShaQiGain}`)
    
    cleanupExpiredSnowAreas('enemy')
    battleLog.value.push(`第 ${battleMap.value.turn} 回合开始`)
    
    updateWeather()
    
    trySpawnBuildingItems()
  }

  return {
    player,
    currentCharacter,
    battleMap,
    isInBattle,
    isLoading,
    battleLog,
    gameSpeed,
    shakingTargets,
    skillEffects,
    floatingTexts,
    triggerShake,
    // 新视觉特效系统
    hitFlashTargets,
    triggerHitFlash,
    defeatRecords,
    triggerDefeatAnimation,
    projectiles,
    triggerProjectile,
    statusApplyEffects,
    triggerStatusApplyEffect,
    summonEffects,
    triggerSummonEffect,
    moveTrailEffects,
    triggerMoveTrail,
    getProjectileTypeForSkill,
    getProjectileTypeForNormalAttack,
    // ============
    factionCommand,
    gatheringPoints,
    isSelectingGatherPoints,
    aliveCharacters,
    totalAttack,
    totalDefense,
    totalMaxHp,
    totalMaxMp,
    totalMoveRange,
    totalAttackRange,
    battleResult,
    initGame,
    loadGame,
    saveGame,
    hasSaveData,
    getSaveSlots,
    saveToSlot,
    loadFromSlot,
    hireCharacter,
    equipItem,
    unequipItem,
    useConsumable,
    updateHomeGrid,
    nextPhase,
    restoreResources,
    startBattle,
    currentAiCharacter,
    endBattle,
    moveCharacter,
    getCharacterMoveRange,
    getAttackableEnemies,
    getAttackableTargets,
    attack,
    attackBuilding,
    useSkill,
    defend,
    endPlayerTurn,
    toggleSpeed,
    useCollectible,
    collectCollectible,
    addExpToCharacter,
    upgradeEquipment,
    openChestStore,
    buyShopEquipment,
    buyShopConsumable,
    sellEquipment,
    updateWeather,
    generateSnowAreas,
    generateFireAreas,
    isSnowArea,
    isFireArea,
    isCharacterInSnow,
    isCharacterInFire,
    setFactionCommand,
    toggleGatherPointSelection,
    addGatheringPoint,
    removeGatheringPoint,
    confirmGatheringPoints,
    getSkillAttackTargets,
    findCharacterTemplateInStore,
    computeAttackPower,
    computeDefensePower,
    // 状态系统
    addStatusToCharacter,
    removeStatusFromCharacter,
  }
})