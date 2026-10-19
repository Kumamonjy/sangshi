<template>
  <view class="container">
    <view class="header">
      <view class="header-left">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </button>
      </view>
      <view class="header-center">
        <text class="title">人物信息</text>
      </view>
      <view class="header-right">
        <text class="hero-count">{{ currentIndex + 1 }}/{{ totalHeroes }}</text>
        <button class="switch-btn" @click="switchHero">
          <text class="switch-icon">↻</text>
        </button>
      </view>
    </view>

    <view v-if="currentHero" class="hero-card">
      <view class="hero-header">
        <view class="hero-icon">
          <image v-if="isMainHero" class="hero-image" :src="heroImagePath" mode="aspectFill" />
          <text v-else class="icon-text">{{ getClassEmoji(currentHero.classType) }}</text>
        </view>
        <view class="hero-title">
          <view class="name-edit-row">
            <text v-if="!isEditingName" class="hero-name">{{ currentHero.name }}</text>
            <input 
              v-else 
              class="name-input" 
              type="text" 
              v-model="newName" 
              maxlength="4"
              placeholder="输入1-4个中文字符"
            />
            <button 
              class="edit-name-btn"
              @click="toggleEditName"
            >
              <text>{{ isEditingName ? '✓' : '✎' }}</text>
            </button>
          </view>
          <text class="hero-class">职业：{{ getClassName(currentHero.classType) }}</text>
        </view>
        <view v-if="currentHero.isHero" class="hero-badge">
          <text class="badge-text">主角</text>
        </view>
      </view>

      <view class="class-switch-section">
        <text class="section-title">切换职业</text>
        <view class="class-grid">
          <button 
            v-for="cls in classList" 
            :key="cls.type"
            class="class-btn"
            :class="{ active: currentHero.classType === cls.type }"
            @click="changeClass(cls.type)"
          >
            <text class="class-icon">{{ cls.emoji }}</text>
            <text class="class-name">{{ cls.name }}</text>
          </button>
        </view>
        <text class="switch-hint">切换职业后经验值和天赋点保持不变</text>
      </view>

      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-label">等级</text>
          <text class="stat-value">{{ currentHero.level }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">经验</text>
          <text class="stat-value">{{ currentHero.exp }}/{{ getExpNeeded(currentHero.level) }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <view class="attributes-section">
        <text class="section-title">属性信息</text>
        <view class="attribute-grid">
          <view class="attribute-item">
            <text class="attribute-icon">❤️</text>
            <view class="attribute-info">
              <text class="attribute-name">生命值</text>
              <text class="attribute-value">{{ Math.round(currentHero.maxHp) }}</text>
            </view>
          </view>
          <view class="attribute-item">
            <text class="attribute-icon">🗡️</text>
            <view class="attribute-info">
              <text class="attribute-name">攻击力</text>
              <text class="attribute-value">{{ Math.round(currentHero.attack) }}</text>
            </view>
          </view>
          <view class="attribute-item">
            <text class="attribute-icon">🛡️</text>
            <view class="attribute-info">
              <text class="attribute-name">防御力</text>
              <text class="attribute-value">{{ Math.round(currentHero.defense) }}</text>
            </view>
          </view>
          <view class="attribute-item">
            <text class="attribute-icon">👟</text>
            <view class="attribute-info">
              <text class="attribute-name">移动力</text>
              <text class="attribute-value">{{ currentHero.moveRange }}</text>
            </view>
          </view>
          <view class="attribute-item">
            <text class="attribute-icon">🎯</text>
            <view class="attribute-info">
              <text class="attribute-name">攻击射程</text>
              <text class="attribute-value">{{ currentHero.attackRange }}</text>
            </view>
          </view>
          <view class="attribute-item">
            <text class="attribute-icon">⭐</text>
            <view class="attribute-info">
              <text class="attribute-name">天赋点</text>
              <text class="attribute-value">{{ currentHero.statPoints }}</text>
            </view>
          </view>
        </view>

        <view v-if="currentHero.isHero && currentHero.statPoints > 0" class="talent-section">
          <text class="section-title">天赋点分配</text>
          <view class="talent-grid">
            <button class="talent-btn" @click="addHp">
              <text class="talent-icon">❤️</text>
              <text class="talent-name">生命+30</text>
              <text class="talent-cost">消耗1点</text>
            </button>
            <button class="talent-btn" @click="addAttack">
              <text class="talent-icon">🗡️</text>
              <text class="talent-name">攻击+10</text>
              <text class="talent-cost">消耗1点</text>
            </button>
            <button class="talent-btn" @click="addDefense">
              <text class="talent-icon">🛡️</text>
              <text class="talent-name">防御+10</text>
              <text class="talent-cost">消耗1点</text>
            </button>
          </view>
        </view>
      </view>

      <view class="divider"></view>

      <view class="skill-section">
        <text class="section-title">技能信息</text>
        <view class="skill-card">
          <view class="skill-header">
            <text class="skill-name">{{ currentHero.skill.name }}</text>
            <text class="skill-cooldown">冷却: {{ currentHero.skill.cooldown }}回合</text>
          </view>
          <text class="skill-description">{{ currentHero.skill.description }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-text">暂无角色</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { CLASS_CONFIG, getExpForLevel } from '../../utils/gameData'
import type { Unit } from '../../utils/gameData'

const gameStore = useGameStore()
const currentIndex = ref(0)
const isEditingName = ref(false)
const newName = ref('')

const classList = [
  { type: 'warrior' as const, name: '战士', emoji: '⚔️' },
  { type: 'knight' as const, name: '骑士', emoji: '🛡️' },
  { type: 'archer' as const, name: '弓箭手', emoji: '🏹' },
  { type: 'mage' as const, name: '法师', emoji: '🔮' },
  { type: 'witch' as const, name: '巫师', emoji: '💀' },
  { type: 'assassin' as const, name: '刺客', emoji: '🗡️' },
  { type: 'architect' as const, name: '建筑师', emoji: '🏗️' },
  { type: 'strategist' as const, name: '军师', emoji: '💡' }
]

const currentHero = computed(() => {
  if (gameStore.heroes.length === 0) return null
  return gameStore.heroes[currentIndex.value]
})

const totalHeroes = computed(() => gameStore.heroes.length)

const isMainHero = computed(() => {
  if (!currentHero.value) return false
  const mainHeroNames = ['熊熊', '兔兔', '大黑熊']
  return mainHeroNames.includes(currentHero.value.name)
})

const heroImagePath = computed(() => {
  if (!currentHero.value) return ''
  const heroIndex = ['熊熊', '兔兔', '大黑熊'].indexOf(currentHero.value.name)
  if (heroIndex >= 0) {
    return `/static/hero_${heroIndex + 1}.png`
  }
  return ''
})

function goBack() {
  uni.navigateBack()
}

function switchHero() {
  if (gameStore.heroes.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % gameStore.heroes.length
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
    witch: '💀',
    assassin: '🗡️',
    architect: '🏗️',
    strategist: '💡'
  }
  return emojis[classType] || '👤'
}

function getExpNeeded(level: number): number {
  return getExpForLevel(level)
}

function changeClass(classType: 'warrior' | 'knight' | 'archer' | 'mage' | 'witch' | 'assassin' | 'architect' | 'strategist') {
  if (currentHero.value) {
    gameStore.changeHeroClass(currentIndex.value, classType)
    uni.showToast({
      title: '职业切换成功',
      icon: 'success'
    })
  }
}

function toggleEditName() {
  if (!currentHero.value) return
  
  if (isEditingName.value) {
    // 保存模式
    const trimmed = newName.value.trim()
    // 检查是否是1-4个中文字符
    const chineseRegex = /^[\u4e00-\u9fa5]{1,4}$/
    if (chineseRegex.test(trimmed)) {
      gameStore.renameHero(currentHero.value.id, trimmed)
      isEditingName.value = false
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '请输入1-4个中文字符',
        icon: 'none'
      })
    }
  } else {
    // 编辑模式
    newName.value = currentHero.value.name
    isEditingName.value = true
  }
}

function addHp() {
  if (currentHero.value && currentHero.value.statPoints > 0) {
    gameStore.addHeroStat(currentIndex.value, 'maxHp', 30)
    uni.showToast({
      title: '生命值+30',
      icon: 'success'
    })
  }
}

function addAttack() {
  if (currentHero.value && currentHero.value.statPoints > 0) {
    gameStore.addHeroStat(currentIndex.value, 'attack', 10)
    uni.showToast({
      title: '攻击力+10',
      icon: 'success'
    })
  }
}

function addDefense() {
  if (currentHero.value && currentHero.value.statPoints > 0) {
    gameStore.addHeroStat(currentIndex.value, 'defense', 10)
    uni.showToast({
      title: '防御力+10',
      icon: 'success'
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.back-btn, .switch-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.hero-count {
  font-size: 24rpx;
  color: #ffffff;
  white-space: nowrap;
}

.back-icon, .switch-icon {
  font-size: 32rpx;
  color: #ffffff;
}

.header-center {
  flex: 1;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.hero-card {
  margin: 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4rpx solid #ffd700;
}

.icon-text {
  font-size: 48rpx;
}

.hero-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.hero-title {
  flex: 1;
}

.name-edit-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hero-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.name-input {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 5rpx 10rpx;
  border: 2rpx solid #667eea;
  border-radius: 10rpx;
  flex: 1;
}

.edit-name-btn {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  font-size: 28rpx;
  color: #fff;
}

.hero-class {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-top: 5rpx;
}

.hero-badge {
  background: #ffd700;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #333;
  font-weight: bold;
}

.stats-section {
  display: flex;
  gap: 40rpx;
  margin-top: 30rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-top: 5rpx;
}

.divider {
  height: 2rpx;
  background: #eee;
  margin: 30rpx 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.attributes-section {
  margin-top: 10rpx;
}

.attribute-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.attribute-item {
  width: calc(50% - 8rpx);
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
}

.attribute-icon {
  font-size: 32rpx;
}

.attribute-info {
  flex: 1;
}

.attribute-name {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.attribute-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.skill-section {
  margin-top: 10rpx;
}

.skill-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25rpx;
  border-radius: 15rpx;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.skill-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.skill-cooldown {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.skill-description {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}

.class-switch-section {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #fff8e7;
  border-radius: 15rpx;
  border: 2rpx solid #ffd700;
}

.class-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 15rpx;
}

.class-btn {
  width: calc(20% - 12rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 10rpx;
  background: #ffffff;
  border-radius: 10rpx;
  border: 2rpx solid #ddd;
  transition: all 0.3s;

  &.active {
    border-color: #ffd700;
    background: #fff8e7;
    box-shadow: 0 0 10rpx rgba(255, 215, 0, 0.3);
  }
}

.class-icon {
  font-size: 32rpx;
}

.class-name {
  font-size: 20rpx;
  color: #333;
  margin-top: 5rpx;
}

.switch-hint {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 15rpx;
  display: block;
}

.talent-section {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f0f8ff;
  border-radius: 15rpx;
  border: 2rpx solid #667eea;
}

.talent-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 15rpx;
}

.talent-btn {
  width: calc(33.33% - 10rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 10rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15rpx;
  border: none;
  transition: all 0.3s;
}

.talent-icon {
  font-size: 36rpx;
}

.talent-name {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: bold;
  margin-top: 8rpx;
}

.talent-cost {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5rpx;
}
</style>