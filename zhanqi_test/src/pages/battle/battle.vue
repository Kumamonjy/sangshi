<template>
  <view class="container">
    <view class="battle-header">
      <view class="header-left">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </button>
      </view>
      <view class="header-center">
        <text class="turn-text">回合 {{ battle.turnNumber }}</text>
        <text class="turn-indicator" :class="battle.currentTurn">{{ battle.currentTurn === 'player' ? '我方回合' : '敌方回合' }}</text>
      </view>
      <view class="header-right">
        <view class="speed-controls">
          <button 
            v-for="s in [1, 2, 3]" 
            :key="s"
            class="speed-btn"
            :class="{ active: battle.speed === s }"
            @click="setSpeed(s as 1 | 2 | 3)"
          >
            <text>{{ s }}x</text>
          </button>
        </view>
        <button 
          class="call-reinforcements-btn" 
          :disabled="battle.summonCount >= battle.maxSummons || battle.currentTurn === 'enemy'"
          @click="callReinforcements"
        >
          <text>呼叫支援 ({{ battle.summonCount }}/{{ battle.maxSummons }})</text>
        </button>
      </view>
    </view>

    <view class="map-container">
      <view class="map-grid">
        <view 
          v-for="row in 12" 
          :key="row" 
          class="map-row"
        >
          <view 
            v-for="col in 11" 
            :key="col"
            class="map-cell"
            :class="{
              obstacle: isObstacle(row - 1, col - 1),
              selected: isSelected(row - 1, col - 1),
              movable: isMovable(row - 1, col - 1),
              attackable: isAttackable(row - 1, col - 1),
              'skill-range': isInSkillRange(row - 1, col - 1),
              'skill-target': isSkillTarget(row - 1, col - 1),
              'snow-area': isSnowArea(row - 1, col - 1),
              'thunder-area': isThunderArea(row - 1, col - 1)
            }"
            @click="onCellClick(row - 1, col - 1)"
          >
            <view v-if="isObstacle(row - 1, col - 1)" class="obstacle-icon">
              <text>🗿</text>
            </view>
            <view v-else-if="isHealingGrass(row - 1, col - 1)" class="healing-grass">
              <text>🌿</text>
            </view>
            <view v-if="isSnowArea(row - 1, col - 1)" class="snow-icon">
              <text>❄️</text>
            </view>
            <view v-if="isThunderArea(row - 1, col - 1)" class="thunder-icon">
              <text>⚡</text>
            </view>
            <view 
              v-if="getUnitAt(row - 1, col - 1)"
              class="unit"
              :class="{
                enemy: getUnitAt(row - 1, col - 1)?.isEnemy,
                selected: battle.selectedUnit?.position.row === row - 1 && battle.selectedUnit?.position.col === col - 1,
                ai: getUnitAt(row - 1, col - 1)?.isAI,
                hero: getUnitAt(row - 1, col - 1)?.isHero,
                warrior: getUnitAt(row - 1, col - 1)?.classType === 'warrior',
                knight: getUnitAt(row - 1, col - 1)?.classType === 'knight',
                archer: getUnitAt(row - 1, col - 1)?.classType === 'archer',
                mage: getUnitAt(row - 1, col - 1)?.classType === 'mage',
                witch: getUnitAt(row - 1, col - 1)?.classType === 'witch',
                assassin: getUnitAt(row - 1, col - 1)?.classType === 'assassin',
                architect: getUnitAt(row - 1, col - 1)?.classType === 'architect',
                strategist: getUnitAt(row - 1, col - 1)?.classType === 'strategist'
              }"
            >
              <view class="unit-content">
                <template v-if="getUnitAt(row - 1, col - 1) && isMainHeroUnit(getUnitAt(row - 1, col - 1)!)">
                  <image class="unit-image" :src="getHeroImagePath(getUnitAt(row - 1, col - 1)!)" mode="aspectFill" />
                </template>
                <text v-else class="unit-icon">{{ getClassEmoji(getUnitAt(row - 1, col - 1)?.classType || '') }}</text>
                <text v-if="getUnitAt(row - 1, col - 1)?.isHero" class="hero-badge">★</text>
              </view>
              <view class="unit-hp-bar">
                <view 
                  class="unit-hp-fill" 
                  :class="{ 
                    'is-enemy': getUnitAt(row - 1, col - 1)?.isEnemy
                  }"
                  :style="{ width: (getUnitAt(row - 1, col - 1)?.hp || 0) / (getUnitAt(row - 1, col - 1)?.maxHp || 1) * 100 + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="subtitle-panel" v-if="subtitle">
      <text class="subtitle-text">{{ subtitle }}</text>
    </view>

    <view class="bottom-panel">
      <view v-if="battle.selectedUnit && !battle.selectedUnit.isEnemy && !battle.selectedUnit.isAI" class="action-panel">
        <view class="unit-stats">
          <view class="stat-row">
            <text class="stat-label">角色:</text>
            <text class="stat-value">{{ battle.selectedUnit.name }}</text>
            <text class="stat-class">{{ getClassName(battle.selectedUnit.classType) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">等级:</text>
            <text class="stat-value">{{ battle.selectedUnit.level }}</text>
            <text class="stat-label">HP:</text>
            <text class="stat-value hp">{{ battle.selectedUnit.hp }}/{{ battle.selectedUnit.maxHp }}</text>
            <text class="stat-label">攻击:</text>
            <text class="stat-value">{{ getRealAttack(battle.selectedUnit) }}</text>
            <text class="stat-label">防御:</text>
            <text class="stat-value">{{ getRealDefense(battle.selectedUnit) }}</text>
          </view>
        </view>
        <view class="action-buttons">
          <button 
            class="action-btn move-btn"
            :disabled="battle.selectedUnit.hasMoved || isSnowArea(battle.selectedUnit.position.row, battle.selectedUnit.position.col)"
            @click="toggleMoveMode"
          >
            <text class="btn-icon">👟</text>
            <text class="btn-text">移动</text>
          </button>
          <button 
            class="action-btn attack-btn"
            :disabled="battle.selectedUnit.hasAttacked"
            @click="toggleAttackMode"
          >
            <text class="btn-icon">⚔️</text>
            <text class="btn-text">攻击</text>
          </button>
          <button 
            class="action-btn skill-btn"
            :disabled="battle.selectedUnit.hasAttacked || battle.selectedUnit.skill.currentCooldown > 0"
            @click="toggleSkillMode"
          >
            <text class="btn-icon">✨</text>
            <text class="btn-text">技能{{ battle.selectedUnit.skill.currentCooldown > 0 ? '(' + battle.selectedUnit.skill.currentCooldown + ')' : '' }}</text>
          </button>
          <button 
            class="action-btn defend-btn"
            :disabled="battle.selectedUnit.hasAttacked"
            @click="defend"
          >
            <text class="btn-icon">🛡️</text>
            <text class="btn-text">防御</text>
          </button>
        </view>
        <view v-if="battle.moveMode || battle.attackMode || battle.skillMode" class="action-hint">
          <text v-if="battle.moveMode">点击蓝色格子移动</text>
          <text v-else-if="battle.attackMode">点击敌人攻击</text>
          <text v-else-if="battle.skillMode && battle.selectedUnit?.classType === 'architect'">
            选择最多3个格子（有障碍物清除，无则生成），已选择：{{ battle.skillTargets.length }}/3
          </text>
          <text v-else-if="battle.skillMode && battle.selectedUnit?.classType === 'strategist'">
            选择2个目标（角色或障碍物）交换位置，已选择：{{ battle.skillTargets.length }}/2
          </text>
          <text v-else-if="battle.skillMode">点击释放技能</text>
          <view class="hint-buttons">
            <button v-if="battle.skillMode && battle.selectedUnit?.classType === 'architect'" 
                    class="confirm-btn" 
                    :disabled="battle.skillTargets.length === 0"
                    @click="confirmArchitectSkill"
            >
              确认
            </button>
            <button v-if="battle.skillMode && battle.selectedUnit?.classType === 'strategist'" 
                    class="confirm-btn" 
                    :disabled="battle.skillTargets.length !== 2"
                    @click="confirmStrategistSkill"
            >
              确认
            </button>
            <button class="cancel-btn" @click="cancelAction">取消</button>
          </view>
        </view>
      </view>
      <view v-else-if="battle.selectedUnit && battle.selectedUnit.isEnemy" class="action-panel">
        <view class="unit-stats enemy-stats">
          <view class="stat-row">
            <text class="stat-label">角色:</text>
            <text class="stat-value enemy">{{ battle.selectedUnit.name }}</text>
            <text class="stat-class">{{ getClassName(battle.selectedUnit.classType) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">等级:</text>
            <text class="stat-value">{{ battle.selectedUnit.level }}</text>
            <text class="stat-label">HP:</text>
            <text class="stat-value hp enemy">{{ battle.selectedUnit.hp }}/{{ battle.selectedUnit.maxHp }}</text>
            <text class="stat-label">攻击:</text>
            <text class="stat-value">{{ getRealAttack(battle.selectedUnit) }}</text>
            <text class="stat-label">防御:</text>
            <text class="stat-value">{{ getRealDefense(battle.selectedUnit) }}</text>
          </view>
        </view>
      </view>
      <view v-else-if="battle.selectedUnit && !battle.selectedUnit.isEnemy && battle.selectedUnit.isAI" class="action-panel">
        <view class="unit-stats ally-ai-stats">
          <view class="stat-row">
            <text class="stat-label">角色:</text>
            <text class="stat-value ally-ai">{{ battle.selectedUnit.name }}</text>
            <text class="stat-class">{{ getClassName(battle.selectedUnit.classType) }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">等级:</text>
            <text class="stat-value">{{ battle.selectedUnit.level }}</text>
            <text class="stat-label">HP:</text>
            <text class="stat-value hp ally-ai">{{ battle.selectedUnit.hp }}/{{ battle.selectedUnit.maxHp }}</text>
            <text class="stat-label">攻击:</text>
            <text class="stat-value">{{ getRealAttack(battle.selectedUnit) }}</text>
            <text class="stat-label">防御:</text>
            <text class="stat-value">{{ getRealDefense(battle.selectedUnit) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="action-panel">
        <view class="info-content">
          <view class="info-row">
            <text class="turn-label">当前回合:</text>
            <text class="turn-status" :class="battle.currentTurn">{{ battle.currentTurn === 'player' ? '我方回合' : '敌方回合' }}</text>
          </view>
          <view class="info-row">
            <text class="turn-label">回合数:</text>
            <text class="stat-value">{{ battle.turnNumber }}</text>
          </view>
          <view class="info-row">
            <text class="turn-label">己方:</text>
            <text class="stat-value ally">{{ alivePlayerUnits.length }}</text>
            <text class="turn-label">敌方:</text>
            <text class="stat-value enemy">{{ aliveEnemyUnits.length }}</text>
          </view>
        </view>
      </view>
      <view class="bottom-actions">
        <view class="battle-log-btn" @click="showBattleLog = true">
          <text>📜 战斗记录</text>
        </view>
        <view class="end-turn-wrapper" @click="endTurn">
          <view 
            class="end-turn-btn" 
            :class="{ disabled: battle.currentTurn !== 'player' }"
          >结束行动</view>
        </view>
      </view>
    </view>

    <view v-if="showBattleLog" class="battle-log-modal" @click.self="showBattleLog = false">
      <view class="battle-log-content">
        <view class="battle-log-header">
          <text class="battle-log-title">📜 战斗记录</text>
          <view class="battle-log-close" @click="showBattleLog = false">✕</view>
        </view>
        <scroll-view scroll-y class="battle-log-body">
          <view v-for="entry in battleLog" :key="entry.turn" class="battle-log-turn-group">
            <view class="battle-log-turn-header">
              <text class="battle-log-turn-number">回合 {{ entry.turn }}</text>
            </view>
            <view class="battle-log-turn-messages">
              <view v-for="(message, idx) in entry.messages" :key="idx" class="battle-log-item">
                <text>{{ message }}</text>
              </view>
            </view>
          </view>
          <view v-if="battleLog.length === 0" class="battle-log-empty">
            <text>暂无战斗记录</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="battle.gameResult" class="result-modal">
      <view class="result-content">
        <text class="result-icon">{{ battle.gameResult === 'victory' ? '🎉' : '💀' }}</text>
        <text class="result-title">{{ battle.gameResult === 'victory' ? '胜利！' : '失败...' }}</text>
        <text class="result-text">
          {{ battle.gameResult === 'victory' 
            ? '恭喜获得金币和经验！记得保存游戏' 
            : '我方全军覆没...记得保存游戏' 
          }}
        </text>
        <button class="result-btn" @click="goBack">
          <text>{{ battle.gameResult === 'victory' ? '继续游戏' : '返回主页' }}</text>
        </button>
      </view>
    </view>

    <view v-if="showAiJoinMessage" class="ai-join-message">
      <text>{{ aiJoinMessage }}</text>
    </view>

    <view v-if="battle.aiJoinPending" class="ai-join-modal">
      <view class="ai-join-content">
        <text class="ai-join-title">有人加入战斗！</text>
        <text class="ai-join-class">{{ getClassName(battle.pendingAiClass || '') }}</text>
        <text class="ai-join-side">{{ battle.pendingAiSide === 'ally' ? '加入我方' : '加入敌方' }}</text>
        <button class="ai-join-btn" @click="addAiUnit">
          <text>确认</text>
        </button>
      </view>
    </view>

    <view v-if="showUnitInfo && battle.selectedUnit" class="unit-info-modal">
      <view class="unit-info-content">
        <view class="unit-info-header">
          <text class="unit-info-title">{{ battle.selectedUnit.name }}</text>
          <button class="close-btn" @click="showUnitInfo = false">✕</button>
        </view>
        <view class="unit-info-body">
          <view class="info-row">
            <text class="info-label">职业</text>
            <text class="info-value">{{ getClassName(battle.selectedUnit.classType) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">等级</text>
            <text class="info-value">{{ battle.selectedUnit.level }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">生命值</text>
            <text class="info-value">{{ battle.selectedUnit.hp }}/{{ battle.selectedUnit.maxHp }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">攻击力</text>
            <text class="info-value">{{ getRealAttack(battle.selectedUnit) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">防御力</text>
            <text class="info-value">{{ getRealDefense(battle.selectedUnit) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">移动力</text>
            <text class="info-value">{{ battle.selectedUnit.moveRange }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">攻击射程</text>
            <text class="info-value">{{ battle.selectedUnit.attackRange }}</text>
          </view>
          <view class="skill-info">
            <text class="skill-name">{{ battle.selectedUnit.skill.name }}</text>
            <text class="skill-desc">{{ battle.selectedUnit.skill.description }}</text>
            <text class="skill-cd">冷却: {{ battle.selectedUnit.skill.cooldown }}回合</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { CLASS_CONFIG, isObstacle, getSkillRangePositions } from '../../utils/gameData'
import type { Unit } from '../../utils/gameData'

const showUnitInfo = ref(false)
const showBattleLog = ref(false)

const gameStore = useGameStore()
const battle = computed(() => gameStore.battle)
const battleLog = computed(() => gameStore.battleLog)
const alivePlayerUnits = computed(() => gameStore.alivePlayerUnits)
const aliveEnemyUnits = computed(() => gameStore.aliveEnemyUnits)
const aiJoinMessage = computed(() => gameStore.aiJoinMessage)
const showAiJoinMessage = computed(() => gameStore.showAiJoinMessage)
const subtitle = computed(() => gameStore.subtitle)

function isSnowArea(row: number, col: number): boolean {
  return battle.value.snowAreas?.some(s => s.row === row && s.col === col) || false
}

function isThunderArea(row: number, col: number): boolean {
  return battle.value.thunderAreas?.some(t => t.row === row && t.col === col) || false
}

const movablePositions = computed(() => {
  if (!battle.value.selectedUnit || !battle.value.moveMode) return []
  // 如果选中的角色在雪地上，则无法移动
  if (isSnowArea(battle.value.selectedUnit.position.row, battle.value.selectedUnit.position.col)) {
    return []
  }
  return gameStore.getAvailablePositions(battle.value.units, battle.value.selectedUnit, battle.value.selectedUnit.moveRange, battle.value.thunderAreas)
})

const attackableTargets = computed(() => {
  if (!battle.value.selectedUnit || !battle.value.attackMode) return []
  return gameStore.getAttackablePositions(battle.value.units, battle.value.selectedUnit)
})

const skillRangePositions = computed(() => {
  if (!battle.value.selectedUnit || !battle.value.skillMode) return []
  return getSkillRangePositions(battle.value.selectedUnit, battle.value.units)
})

function goBack() {
  gameStore.clearBattle()
  uni.navigateBack()
}

function callReinforcements() {
  gameStore.callReinforcements()
}

function getUnitAt(row: number, col: number): Unit | undefined {
  return battle.value.units.find(u => u.position.row === row && u.position.col === col)
}

function isSelected(row: number, col: number): boolean {
  return battle.value.selectedUnit?.position.row === row && battle.value.selectedUnit?.position.col === col
}

function isHealingGrass(row: number, col: number): boolean {
  return battle.value.healingGrass?.some(g => g.row === row && g.col === col) || false
}

function isMovable(row: number, col: number): boolean {
  return movablePositions.value.some(p => p.row === row && p.col === col)
}

function isAttackable(row: number, col: number): boolean {
  return attackableTargets.value.some(p => p.row === row && p.col === col)
}

function isInSkillRange(row: number, col: number): boolean {
  return skillRangePositions.value.some(p => p.row === row && p.col === col)
}

function isSkillTarget(row: number, col: number): boolean {
  return battle.value.skillTargets.some(p => p.row === row && p.col === col)
}

function onCellClick(row: number, col: number) {
    if (battle.value.currentTurn !== 'player') return

    const clickedUnit = getUnitAt(row, col)

    if (battle.value.moveMode && isMovable(row, col)) {
      gameStore.moveUnit(battle.value.selectedUnit!.id, row, col)
      return
    }

    if (battle.value.attackMode && clickedUnit && clickedUnit.isEnemy) {
      gameStore.attackTarget(clickedUnit.id)
      return
    }

    if (battle.value.attackMode && isObstacle(row, col)) {
      gameStore.attackObstacle(row, col)
      return
    }

    if (battle.value.skillMode) {
      const isTargetSelected = isSkillTarget(row, col)
      const isTargetInRange = isInSkillRange(row, col)
      const isArchitectOrStrategist = 
        battle.value.selectedUnit?.classType === 'architect' || 
        battle.value.selectedUnit?.classType === 'strategist'
      
      if (isArchitectOrStrategist && (isTargetSelected || isTargetInRange)) {
        gameStore.useSkillTarget({ row, col })
        return
      } else if (isTargetInRange) {
        // 其他职业直接使用技能
        gameStore.useSkillTarget({ row, col })
        return
      }
    }

    if (!battle.value.moveMode && !battle.value.attackMode && !battle.value.skillMode) {
      if (clickedUnit) {
        gameStore.selectUnit(clickedUnit.id)
      } else {
        gameStore.deselectUnit()
      }
    }
  }

function toggleMoveMode() {
  if (battle.value.selectedUnit?.hasMoved || battle.value.selectedUnit?.hasActed) return
  gameStore.battle.moveMode = !gameStore.battle.moveMode
  gameStore.battle.attackMode = false
  gameStore.battle.skillMode = false
}

function toggleAttackMode() {
  if (battle.value.selectedUnit?.hasAttacked || battle.value.selectedUnit?.hasActed) return
  gameStore.battle.attackMode = !gameStore.battle.attackMode
  gameStore.battle.moveMode = false
  gameStore.battle.skillMode = false
}

function toggleSkillMode() {
  if (battle.value.selectedUnit?.hasAttacked || battle.value.selectedUnit?.hasActed || battle.value.selectedUnit?.skill.currentCooldown > 0) return
  gameStore.setSkillMode(!gameStore.battle.skillMode)
}

function cancelAction() {
  gameStore.battle.moveMode = false
  gameStore.battle.attackMode = false
  gameStore.battle.skillMode = false
  gameStore.battle.skillTargets = []
}

function defend() {
  gameStore.defend()
}

function confirmArchitectSkill() {
  gameStore.confirmArchitectSkill()
}

function confirmStrategistSkill() {
  gameStore.confirmStrategistSkill()
}

async function endTurn() {
  console.log('endTurn clicked, currentTurn:', gameStore.battle.currentTurn)
  if (gameStore.battle.currentTurn === 'player') {
    await gameStore.endPlayerTurn()
  }
}

function setSpeed(speed: 1 | 2 | 3) {
  gameStore.setSpeed(speed)
}

function addAiUnit() {
  gameStore.addAiUnit()
}

function getClassName(classType: string): string {
  return CLASS_CONFIG[classType as keyof typeof CLASS_CONFIG]?.name || classType
}

function getClassEmoji(classType: string): string {
  const emojis: Record<string, string> = {
    warrior: '🛡️',
    knight: '⚔️',
    archer: '🏹',
    mage: '🔮',
    witch: '💀',
    assassin: '🗡️',
    architect: '🏗️',
    strategist: '💡'
  }
  return emojis[classType] || '👤'
}

function isMainHeroUnit(unit: Unit): boolean {
  const mainHeroNames = ['熊熊', '兔兔', '大黑熊']
  return mainHeroNames.includes(unit.name)
}

function getHeroImagePath(unit: Unit): string {
  const heroIndex = ['熊熊', '兔兔', '大黑熊'].indexOf(unit.name)
  if (heroIndex >= 0) {
    return `/static/hero_${heroIndex + 1}.png`
  }
  return ''
}

function getClassShortName(classType: string): string {
  const names: Record<string, string> = {
    warrior: '战',
    knight: '骑',
    archer: '弓',
    mage: '法',
    witch: '巫',
    assassin: '刺',
    architect: '建'
  }
  return names[classType] || ''
}

function getRealDefense(unit: Unit): number {
  let defense = unit.defense * (1 + unit.permanentDefenseBonus / 100)
  if (unit.isDefending) {
    defense = defense * 1.1
  }
  if (unit.defenseBuffDuration > 0) {
    defense = defense + 3
  }
  return parseFloat(defense.toFixed(1))
}

function getRealAttack(unit: Unit): number {
  let attack = unit.attack * (1 + unit.permanentAttackBonus / 100)
  return parseFloat(attack.toFixed(1))
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.header-left {
  width: 100rpx;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.back-icon {
  font-size: 40rpx;
  color: #ffffff;
}

.header-center {
  flex: 1;
  text-align: center;
}

.turn-text {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.turn-indicator {
  font-size: 44rpx;
  font-weight: bold;
  display: block;
  margin-top: 8rpx;
  color: #ffffff;
}

.header-right {
  width: auto;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: flex-end;
}

.speed-controls {
  display: flex;
  gap: 10rpx;
}

.speed-btn {
  flex: 1;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 32rpx;
  border: none;

  &.active {
    background: rgba(255, 255, 255, 0.4);
    color: #ffffff;
  }
}

.call-reinforcements-btn {
  height: 70rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 35rpx;
  border: none;
  color: #ffffff;
  font-size: 26rpx;
  padding: 0 30rpx;
  white-space: nowrap;

  &:disabled {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.5);
  }
}

.map-container {
  flex: 1;
  padding: 20rpx;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e5e7eb;
}

.map-grid {
  display: flex;
  flex-direction: column;
  gap: 3rpx;
}

.map-row {
  display: flex;
  gap: 3rpx;
}

.map-cell {
  width: 56rpx;
  height: 56rpx;
  background: #ffffff;
  border-radius: 8rpx;
  position: relative;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);

  &.obstacle {
    background: #9ca3af;
  }

  &.selected {
    background: #4ade80;
    box-shadow: 0 0 15rpx #4ade80;
  }

  &.movable {
    background: rgba(74, 222, 128, 0.3);
    animation: pulse 1s infinite;
  }

  &.attackable {
    background: rgba(248, 113, 113, 0.3);
    animation: pulse 0.5s infinite;
  }

  &.skill-range {
    background: rgba(99, 102, 241, 0.2);
  }
  
  &.skill-target {
    background: rgba(139, 92, 246, 0.4);
    animation: pulse 0.5s infinite;
  }
  
  &.snow-area {
    background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
    box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.15);
  }
  
  &.thunder-area {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    box-shadow: 0 2rpx 8rpx rgba(168, 85, 247, 0.2);
  }
}

.snow-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28rpx;
  opacity: 0.7;
  z-index: 1;
  animation: snowfall 2s ease-in-out infinite;
}

.thunder-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32rpx;
  opacity: 0.8;
  z-index: 1;
  animation: thunderFlash 0.8s ease-in-out infinite;
}

.unit {
  position: relative;
  z-index: 2;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes snowfall {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.9;
  }
}

@keyframes thunderFlash {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
    filter: brightness(1);
  }
  25% { 
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
    filter: brightness(1.5);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
    filter: brightness(1);
  }
  75% { 
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.9;
    filter: brightness(1.3);
  }
}

.obstacle-icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36rpx;
}

.healing-grass {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36rpx;
  animation: grassSway 2s infinite;
}

@keyframes grassSway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.unit {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 8rpx;
  padding: 8rpx 4rpx;
  box-sizing: border-box;

  &.enemy {
    background: rgba(239, 68, 68, 0.15);
  }

  &.selected {
    box-shadow: 0 0 16rpx #4ade80;
    border: 3rpx solid #4ade80;
  }

  &.ai {
    border: 3rpx solid #fbbf24;
  }

  &.hero {
    border: 4rpx solid #ffd700;
    box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.5);
    animation: heroGlow 2s infinite;
  }

  &.warrior {
    background: rgba(239, 68, 68, 0.12);
  }

  &.knight {
    background: rgba(59, 130, 246, 0.12);
  }

  &.archer {
    background: rgba(34, 197, 94, 0.12);
  }

  &.mage {
    background: rgba(139, 92, 246, 0.12);
  }

  &.witch {
    background: rgba(236, 72, 153, 0.12);
  }

  &.assassin {
    background: rgba(50, 50, 50, 0.12);
  }

  &.architect {
    background: rgba(139, 69, 19, 0.12);
  }
}

@keyframes heroGlow {
  0%, 100% {
    box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 24rpx rgba(255, 215, 0, 0.8);
  }
}

.unit-content {
  position: relative;
  display: flex;
  align-items: center;
}

.unit-icon {
  font-size: 36rpx;
}

.unit-image {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
}

.hero-badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  font-size: 22rpx;
  color: #ffd700;
  text-shadow: 0 0 8rpx #ffd700;
}

.unit-class-badge {
  position: absolute;
  bottom: 24rpx;
  right: 6rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 3rpx 8rpx;
  border-radius: 6rpx;
}

.unit-hp-bar {
  width: 85%;
  height: 10rpx;
  background: #d1d5db;
  border-radius: 5rpx;
  margin-top: 4rpx;
  margin-bottom: 4rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.unit-hp-fill {
  height: 100%;
  background: #22c55e;
  border-radius: 3rpx;
  transition: width 0.3s;

  &.is-enemy {
    background: #ef4444;
  }
}

.ai-badge {
  position: absolute;
  top: 3rpx;
  right: 3rpx;
  font-size: 16rpx;
  color: #fbbf24;
  background: rgba(0, 0, 0, 0.5);
  padding: 3rpx 6rpx;
  border-radius: 6rpx;
}

.subtitle-panel {
  background: rgba(0, 0, 0, 0.7);
  padding: 15rpx 30rpx;
  margin: 0 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.subtitle-text {
  font-size: 28rpx;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom-panel {
  background: #ffffff;
  padding: 20rpx;
  border-top: 2rpx solid #e5e7eb;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
}

.action-panel {
  background: #ffffff;
  margin-bottom: 15rpx;
}

.unit-stats {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 15rpx;
}

.unit-stats.enemy-stats {
  background: rgba(239, 68, 68, 0.08);
  border: 3rpx solid rgba(239, 68, 68, 0.2);
}

.unit-stats.ally-ai-stats {
  background: rgba(59, 130, 246, 0.08);
  border: 3rpx solid rgba(59, 130, 246, 0.2);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 10rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.stat-label {
  font-size: 26rpx;
  color: #9ca3af;
  width: 70rpx;
}

.stat-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  min-width: 60rpx;

  &.hp {
    color: #22c55e;
  }

  &.hp.enemy {
    color: #ef4444;
  }

  &.hp.ally-ai {
    color: #3b82f6;
  }

  &.enemy {
    color: #f87171;
  }

  &.ally {
    color: #4ade80;
  }

  &.ally-ai {
    color: #60a5fa;
  }
}

.stat-class {
  font-size: 26rpx;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.turn-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.turn-status {
  font-size: 26rpx;
  font-weight: bold;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;

  &.player {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  &.enemy {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }
}

.action-buttons {
  display: flex;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.action-btn {
  flex: 1;
  height: 100rpx;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  opacity: 1;
  padding: 8rpx 4rpx;

  &:disabled {
    opacity: 0.4;
  }
}

.move-btn {
  background: #16a34a;
}

.attack-btn {
  background: #dc2626;
}

.skill-btn {
  background: #7c3aed;
}

.defend-btn {
  background: #3b82f6;
}

.btn-icon {
  font-size: 24rpx;
}

.action-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 10rpx 15rpx;
  border-radius: 10rpx;
  gap: 15rpx;

  text {
    font-size: 26rpx;
    color: #333;
    flex: 1;
    line-height: 1.3;
  }
}

.hint-buttons {
  display: flex;
  gap: 15rpx;
  align-items: center;
}

.confirm-btn {
  background: #16a34a;
  color: #ffffff;
  font-size: 26rpx;
  height: 60rpx;
  padding: 0 30rpx;
  border-radius: 8rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.4;
  }
}

.cancel-btn {
  background: #6b7280;
  color: #ffffff;
  font-size: 26rpx;
  height: 60rpx;
  padding: 0 30rpx;
  border-radius: 8rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 18rpx;
  color: #ffffff;
  margin-top: 2rpx;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  position: relative;
  z-index: 100;
}

.battle-log-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.battle-log-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.end-turn-wrapper {
  flex: 1;
  height: 80rpx;
  position: relative;
}

.end-turn-btn {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.end-turn-btn:not(.disabled) {
  cursor: pointer;
}

.end-turn-btn:not(.disabled):active {
  transform: scale(0.98);
  opacity: 0.9;
}

.end-turn-btn.disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: #d1d5db;
  cursor: not-allowed;
}

.battle-log-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.battle-log-content {
  width: 80%;
  max-height: 70%;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.battle-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.battle-log-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.battle-log-close {
  font-size: 36rpx;
  color: #ffffff;
  padding: 10rpx;
}

.battle-log-body {
  max-height: 500rpx;
  padding: 20rpx;
}

.battle-log-turn-group {
  margin-bottom: 20rpx;
}

.battle-log-turn-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.battle-log-turn-number {
  font-size: 26rpx;
  font-weight: bold;
  color: #ffffff;
}

.battle-log-turn-messages {
  padding-left: 10rpx;
}

.battle-log-item {
  padding: 12rpx 15rpx;
  font-size: 24rpx;
  color: #555;
  background: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}

.battle-log-item:last-child {
  margin-bottom: 0;
}

.battle-log-empty {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 26rpx;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-content {
  background: #ffffff;
  padding: 60rpx;
  border-radius: 30rpx;
  text-align: center;
}

.result-icon {
  font-size: 100rpx;
  display: block;
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-top: 20rpx;
}

.result-text {
  font-size: 28rpx;
  color: #9ca3af;
  display: block;
  margin-top: 15rpx;
}

.result-btn {
  margin-top: 30rpx;
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 10rpx;
  border: none;
}

.ai-join-message {
  position: fixed;
  top: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 20rpx 40rpx;
  border-radius: 20rpx;
  z-index: 999;
  animation: fadeInUp 0.3s;

  text {
    font-size: 28rpx;
    color: #fbbf24;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.ai-join-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ai-join-content {
  background: #ffffff;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
}

.ai-join-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.ai-join-class {
  font-size: 48rpx;
  color: #fbbf24;
  display: block;
  margin-top: 20rpx;
}

.ai-join-side {
  font-size: 30rpx;
  color: #9ca3af;
  display: block;
  margin-top: 10rpx;
}

.ai-join-btn {
  margin-top: 30rpx;
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 10rpx;
  border: none;
}

.unit-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.unit-info-content {
  background: #ffffff;
  padding: 30rpx;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
}

.unit-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #e5e7eb;
}

.unit-info-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  background: #6b7280;
  color: #ffffff;
  font-size: 28rpx;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unit-info-body {
  max-height: 60vh;
  overflow-y: auto;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.info-label {
  font-size: 28rpx;
  color: #9ca3af;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.skill-info {
  margin-top: 20rpx;
  padding: 20rpx;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 10rpx;
}

.skill-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #a78bfa;
  display: block;
}

.skill-desc {
  font-size: 26rpx;
  color: #9ca3af;
  display: block;
  margin-top: 10rpx;
}

.skill-cd {
  font-size: 24rpx;
  color: #fbbf24;
  display: block;
  margin-top: 10rpx;
}
</style>
