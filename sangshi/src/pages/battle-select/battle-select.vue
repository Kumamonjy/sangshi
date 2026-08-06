<template>
  <view class="battle-select-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">准备战斗</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="section">
      <text class="section-title">游戏模式</text>
      <view class="mode-list">
        <view 
          v-for="mode in gameModes" 
          :key="mode.id"
          class="mode-item"
          :class="{ active: selectedMode === mode.id }"
          @click="selectedMode = mode.id"
        >
          <text class="mode-icon">{{ mode.icon }}</text>
          <view class="mode-info">
            <text class="mode-name">{{ mode.name }}</text>
            <text class="mode-desc">{{ mode.desc }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">战斗难度</text>
      <view class="difficulty-list">
        <view 
          v-for="difficulty in difficultyTypes" 
          :key="difficulty.id"
          class="difficulty-item"
          :class="{ active: selectedDifficulty === difficulty.id }"
          @click="selectedDifficulty = difficulty.id"
        >
          <text class="difficulty-name">{{ difficulty.name }}</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">战斗地形</text>
      <view class="terrain-list">
        <view 
          v-for="terrain in terrainTypes" 
          :key="terrain.id"
          class="terrain-item"
          :class="{ active: selectedTerrain === terrain.id }"
          @click="selectedTerrain = terrain.id"
        >
          <text class="terrain-icon">{{ terrain.icon }}</text>
          <view class="terrain-info">
            <text class="terrain-name">{{ terrain.name }}</text>
            <text class="terrain-desc">{{ terrain.desc }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">敌方阵营</text>
        <text class="selected-count">
          已选择 {{ selectedFactions.length }} 个阵营
        </text>
      </view>
      <view class="faction-list">
        <view 
          v-for="faction in allFactions" 
          :key="faction.id"
          class="faction-item"
          :class="{ 
            active: selectedFactions.includes(faction.id),
            disabled: !faction.enabled
          }"
          @click="toggleFactionSelection(faction.id, faction.enabled)"
        >
          <text class="faction-icon">{{ faction.icon }}</text>
          <view class="faction-info">
            <text class="faction-name">{{ faction.name }}</text>
            <text v-if="!faction.enabled" class="faction-status">敬请期待</text>
            <text v-else class="faction-status">可选</text>
          </view>
          <view v-if="selectedFactions.includes(faction.id)" class="faction-check">
            <text class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section">
      <view class="section-header">
        <text class="section-title">参战角色</text>
        <text class="selected-count">
          已选择 {{ selectedCharacterIds.length }} / {{ maxCharacters }}
        </text>
      </view>
      <view v-if="gameStore.player?.characters.length === 0" class="empty-char">
        <text>暂无角色，请先招募角色</text>
      </view>
      <view class="character-list">
        <view 
          v-for="char in gameStore.player?.characters" 
          :key="char.id" 
          class="character-item"
          :class="{ 
            disabled: char.hp <= 0,
            selected: selectedCharacterIds.includes(char.id)
          }"
          @click="toggleCharacterSelection(char)"
        >
          <image v-if="isAvatarUrl(getCharacterAvatar(char))" :src="getCharacterAvatar(char)" class="char-avatar-image" mode="aspectFill"></image>
          <text v-else class="char-avatar">{{ getCharacterAvatar(char) }}</text>
          <view class="char-info">
            <view class="char-header">
              <text class="char-name">{{ char.name }}</text>
              <text class="char-level">Lv.{{ char.level }}</text>
            </view>
            <view class="char-stats">
              <view class="stat-bar hp-bar">
                <text class="stat-icon">❤️</text>
                <view class="bar-container">
                  <view class="bar-fill hp-fill" :style="{ width: (char.hp / char.maxHp * 100) + '%' }"></view>
                </view>
                <text class="stat-value">{{ char.hp }}/{{ char.maxHp }}</text>
              </view>
              <view class="stat-bar mp-bar">
                <text class="stat-icon">💙</text>
                <view class="bar-container">
                  <view class="bar-fill mp-fill" :style="{ width: (char.mp / char.maxMp * 100) + '%' }"></view>
                </view>
                <text class="stat-value">{{ char.mp }}/{{ char.maxMp }}</text>
              </view>
              <view class="stat-bar exp-bar">
                <text class="stat-icon">✨</text>
                <view class="bar-container">
                  <view class="bar-fill exp-fill" :style="{ width: (char.exp / getExpRequired(char.level) * 100) + '%' }"></view>
                </view>
                <text class="stat-value">{{ char.exp }}/{{ getExpRequired(char.level) }}</text>
              </view>
            </view>
          </view>
          <text v-if="char.hp <= 0" class="dead-text">阵亡</text>
          <view v-else class="check-box">
            <text v-if="selectedCharacterIds.includes(char.id)" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="start-btn" @click="startBattle">
      <text>开始战斗</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { getExpRequired, DIFFICULTY_CONFIG, INITIAL_CHARACTERS, HIREABLE_CHARACTERS, getAvatarPath } from '../../utils/gameData'

const gameStore = useGameStore()

const selectedMode = ref<'offensive' | 'defensive'>('offensive')
const selectedDifficulty = ref<'easy' | 'normal' | 'hard' | 'nightmare' | 'deadly'>('normal')
const selectedTerrain = ref('plain')
const selectedCharacterIds = ref<string[]>([])
const selectedFactions = ref<string[]>(['human', 'ghost', 'beast', 'immortal', 'god', 'demon'])
const maxCharacters = 15

const gameModes = [
  { id: 'offensive' as const, name: '主动进攻', icon: '🗡️', desc: '主动出击，击败敌人' },
  { id: 'defensive' as const, name: '家园防御', icon: '🏠', desc: '保护家园，抵御入侵' },
]

const allFactions = [
  { id: 'human', name: '人界', icon: '👤', enabled: true },
  { id: 'ghost', name: '鬼界', icon: '💀', enabled: true },
  { id: 'beast', name: '妖界', icon: '👹', enabled: true },
  { id: 'immortal', name: '仙界', icon: '☁️', enabled: true },
  { id: 'god', name: '神界', icon: '⭐', enabled: true },
  { id: 'demon', name: '魔界', icon: '🔥', enabled: true },
]

const difficultyTypes = Object.entries(DIFFICULTY_CONFIG).map(([id, config]) => ({
  id: id as 'easy' | 'normal' | 'hard' | 'nightmare' | 'deadly',
  name: config.name,
}))

const terrainTypes = [
  { id: 'river', name: '水域', icon: '🌊', desc: '河流11% · 障碍物7%' },
  { id: 'plain', name: '平原', icon: '🌾', desc: '河流5% · 障碍物13%' },
  { id: 'mountain', name: '山地', icon: '⛰️', desc: '河流1% · 障碍物17%' },
]

function goBack() {
  uni.navigateBack()
}

function isAvatarUrl(avatar: string | undefined): boolean {
  if (!avatar) return false
  return avatar.startsWith('/static/') || avatar.startsWith('http://') || avatar.startsWith('https://')
}

// 使用 gameData.ts 中的共享 getAvatarPath 函数

function getCharacterAvatar(char: any): string {
  const path = getAvatarPath(char.id)
  if (path) return path
  return char.avatar || '👤'
}

function toggleCharacterSelection(char: any) {
  if (char.hp <= 0) return
  
  const index = selectedCharacterIds.value.indexOf(char.id)
  if (index === -1) {
    if (selectedCharacterIds.value.length >= maxCharacters) {
      uni.showToast({ title: `最多选择${maxCharacters}个角色`, icon: 'none' })
      return
    }
    selectedCharacterIds.value.push(char.id)
  } else {
    selectedCharacterIds.value.splice(index, 1)
  }
}

function toggleFactionSelection(factionId: string, enabled: boolean) {
  if (!enabled) {
    uni.showToast({ title: '该阵营暂未开放', icon: 'none' })
    return
  }
  
  const index = selectedFactions.value.indexOf(factionId)
  if (index === -1) {
    selectedFactions.value.push(factionId)
  } else {
    if (selectedFactions.value.length <= 1) {
      uni.showToast({ title: '至少选择一个阵营', icon: 'none' })
      return
    }
    selectedFactions.value.splice(index, 1)
  }
}

function startBattle() {
  console.log('开始战斗检查', { 
    hasPlayer: !!gameStore.player, 
    charsCount: gameStore.player?.characters.length,
    selectedCount: selectedCharacterIds.value.length,
    difficulty: selectedDifficulty.value,
    selectedFactions: selectedFactions.value
  })
  
  const aliveChars = gameStore.player?.characters.filter(c => c.hp > 0)
  if (!aliveChars || aliveChars.length === 0) {
    uni.showToast({ title: '没有可参战的角色', icon: 'none' })
    return
  }
  
  if (selectedCharacterIds.value.length === 0) {
    uni.showToast({ title: '请选择至少1个角色', icon: 'none' })
    return
  }
  
  if (selectedFactions.value.length === 0) {
    uni.showToast({ title: '请选择至少1个敌方阵营', icon: 'none' })
    return
  }
  
  console.log('开始战斗，选中角色:', selectedCharacterIds.value, '敌方阵营:', selectedFactions.value)
  
  gameStore.startBattle(selectedMode.value, selectedTerrain.value, selectedDifficulty.value, selectedCharacterIds.value, selectedFactions.value)
  uni.navigateTo({ url: '/pages/battle/battle' })
}

// 自动选择存活的角色
function autoSelectCharacters() {
  if (gameStore.player) {
    const aliveChars = gameStore.player.characters.filter(c => c.hp > 0).slice(0, maxCharacters)
    selectedCharacterIds.value = aliveChars.map(c => c.id)
    console.log('自动选择角色:', selectedCharacterIds.value)
  }
}

onMounted(() => {
  autoSelectCharacters()
})

// 监听 gameStore.player 的变化
watch(() => gameStore.player, () => {
  autoSelectCharacters()
}, { immediate: true })
</script>

<style lang="scss">
.battle-select-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 0 32rpx 32rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 0 24rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  font-size: 36rpx;
  color: #eaeaea;
}

.title {
  font-size: 36rpx;
  color: #eaeaea;
  font-weight: 600;
}

.placeholder {
  width: 64rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  color: #a0aec0;
  display: block;
}

.selected-count {
  font-size: 24rpx;
  color: #fbbf24;
}

.mode-list {
  display: flex;
  gap: 16rpx;
}

.mode-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  
  &.active {
    background: rgba(233, 69, 96, 0.2);
    border-color: #e94560;
  }
}

.mode-icon {
  font-size: 48rpx;
}

.mode-info {
  text-align: center;
  margin-top: 12rpx;
}

.mode-name {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 500;
  display: block;
}

.mode-desc {
  font-size: 22rpx;
  color: #718096;
  margin-top: 4rpx;
}

.difficulty-list {
  display: flex;
  gap: 12rpx;
}

.difficulty-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 12rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  
  &.active {
    background: rgba(168, 85, 247, 0.2);
    border-color: #a855f7;
  }
}

.difficulty-name {
  font-size: 24rpx;
  color: #eaeaea;
  font-weight: 500;
}

.terrain-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.terrain-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  
  &.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }
}

.terrain-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.terrain-info {
  flex: 1;
}

.terrain-name {
  font-size: 28rpx;
  color: #eaeaea;
  display: block;
}

.terrain-desc {
  font-size: 22rpx;
  color: #718096;
  margin-top: 4rpx;
}

.faction-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.faction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  position: relative;
  
  &.active {
    border-color: #e94560;
    background: rgba(233, 69, 96, 0.15);
  }
  
  &.disabled {
    opacity: 0.4;
    background: rgba(255, 255, 255, 0.02);
  }
}

.faction-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.faction-info {
  text-align: center;
}

.faction-name {
  font-size: 26rpx;
  color: #eaeaea;
  font-weight: 600;
  display: block;
}

.faction-status {
  font-size: 20rpx;
  color: #a0aec0;
  margin-top: 6rpx;
  display: block;
}

.faction-check {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 36rpx;
  height: 36rpx;
  background: #e94560;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}

.empty-char {
  padding: 40rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #718096;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  
  &.disabled {
    opacity: 0.5;
  }
  
  &.selected {
    border-color: #4ade80;
    background: rgba(74, 222, 128, 0.1);
  }
}

.char-avatar {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.char-avatar-image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.char-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.char-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.char-name {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 500;
}

.char-level {
  font-size: 24rpx;
  color: #fbbf24;
  font-weight: 600;
}

.char-stats {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 20rpx;
}

.bar-container {
  flex: 1;
  height: 10rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp-fill {
  background: linear-gradient(90deg, #4ade80, #22c55e);
}

.mp-fill {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.exp-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.stat-value {
  font-size: 20rpx;
  color: #a0aec0;
  min-width: 90rpx;
  text-align: right;
}

.dead-text {
  font-size: 24rpx;
  color: #ef4444;
  margin-right: 16rpx;
  flex-shrink: 0;
  width: 70rpx;
  text-align: right;
}

.check-box {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.check-icon {
  font-size: 28rpx;
  color: #4ade80;
  font-weight: bold;
}

.start-btn {
  margin-top: 16rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #e94560, #be185d);
  border-radius: 16rpx;
  text-align: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  
  &:active {
    opacity: 0.9;
  }
}
</style>
