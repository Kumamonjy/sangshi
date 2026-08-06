<template>
  <view class="container">
    <view class="header">
      <button class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </button>
      <text class="title">选择参战角色</text>
      <view class="header-right"></view>
    </view>

    <view class="content">
      <view class="selection-info">
        <text class="info-text">已选择 {{ selectedCount }} / {{ maxSelectable }} 人</text>
      </view>

      <view class="character-list">
        <view 
          v-for="hero in gameStore.heroes" 
          :key="hero.id"
          class="character-card"
          :class="{ selected: isSelected(hero.id), disabled: !isSelected(hero.id) && selectedCount >= maxSelectable }"
          @click="toggleSelect(hero.id)"
        >
          <view class="card-header">
            <text class="class-icon">{{ getClassEmoji(hero.classType) }}</text>
            <text class="hero-name">{{ hero.name }}</text>
            <text v-if="hero.isHero" class="hero-badge">★</text>
          </view>
          <view class="card-body">
            <view class="stat-row">
              <text class="stat-label">职业</text>
              <text class="stat-value">{{ getClassName(hero.classType) }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">等级</text>
              <text class="stat-value">{{ hero.level }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">HP</text>
              <text class="stat-value">{{ hero.hp }}/{{ hero.maxHp }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">攻击</text>
              <text class="stat-value">{{ hero.attack }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">防御</text>
              <text class="stat-value">{{ hero.defense }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="select-hint">{{ isSelected(hero.id) ? '已选择' : (selectedCount >= maxSelectable ? '已达上限' : '点击选择') }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <button 
        class="confirm-btn" 
        :disabled="selectedCount === 0"
        @click="confirmSelection"
      >
        <text>确认出战</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { CLASS_CONFIG } from '../../utils/gameData'

const gameStore = useGameStore()

const selectedCount = computed(() => gameStore.selectedBattleUnits.length)
const maxSelectable = computed(() => {
  return Math.min(gameStore.heroes.length, gameStore.settings.allyAiCount)
})

onMounted(() => {
  gameStore.clearBattleSelection()
  if (gameStore.heroes.length > 0) {
    const hero = gameStore.heroes.find(h => h.isHero)
    if (hero) {
      gameStore.toggleBattleUnitSelection(hero.id)
    }
  }
})

function goBack() {
  uni.navigateBack()
}

function isSelected(id: string): boolean {
  return gameStore.selectedBattleUnits.includes(id)
}

function toggleSelect(id: string) {
  if (!isSelected(id) && selectedCount.value >= maxSelectable.value) return
  gameStore.toggleBattleUnitSelection(id)
}

function confirmSelection() {
  if (selectedCount.value > 0) {
    gameStore.startBattle()
    uni.navigateTo({ url: '/pages/battle/battle' })
  }
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
    witch: '💀'
  }
  return emojis[classType] || '👤'
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-right {
  width: 80rpx;
}

.content {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
}

.selection-info {
  text-align: center;
  margin-bottom: 40rpx;
}

.info-text {
  font-size: 40rpx;
  color: #667eea;
  font-weight: bold;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.character-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  border: 4rpx solid #eee;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  &.selected {
    border-color: #4ade80;
    background: rgba(74, 222, 128, 0.08);
  }

  &.disabled {
    opacity: 0.5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.class-icon {
  font-size: 52rpx;
}

.hero-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.hero-badge {
  font-size: 36rpx;
  color: #ffd700;
}

.card-body {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 180rpx;
}

.stat-label {
  font-size: 32rpx;
  color: #999;
}

.stat-value {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.card-footer {
  margin-top: 24rpx;
  text-align: center;
}

.select-hint {
  font-size: 32rpx;
  color: #999;
}

.character-card.selected .select-hint {
  color: #4ade80;
  font-weight: bold;
}

.footer {
  padding: 40rpx;
  background: #ffffff;
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  width: 100%;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 44rpx;
  font-weight: bold;
  border-radius: 20rpx;
  border: none;

  &:disabled {
    background: #ddd;
    color: #999;
  }
}
</style>
