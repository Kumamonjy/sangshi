<template>
  <view class="container">
    <view class="header">
      <view class="header-left">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </button>
      </view>
      <view class="header-center">
        <text class="title">雇佣/解雇</text>
      </view>
      <view class="header-right">
        <text class="gold-text">💰 {{ gameStore.gold }}</text>
      </view>
    </view>

    <view class="hire-section">
      <button class="hire-btn" @click="hireHero">
        <text class="hire-icon">➕</text>
        <text class="hire-text">雇佣新角色 (100金币)</text>
      </button>
    </view>

    <view class="hero-list">
      <text class="list-title">当前角色 ({{ gameStore.heroes.length }}人)</text>
      <view v-if="gameStore.heroes.length === 0" class="empty-list">
        <text class="empty-text">暂无角色</text>
      </view>
      <view v-for="hero in gameStore.heroes" :key="hero.id" class="hero-item">
        <view class="hero-info">
          <view class="hero-icon-small">
            <text>{{ getClassEmoji(hero.classType) }}</text>
          </view>
          <view class="hero-details">
            <text class="hero-name">{{ hero.name }}</text>
            <text class="hero-level">等级 {{ hero.level }} · {{ getClassName(hero.classType) }}</text>
          </view>
        </view>
        <view class="hero-actions">
          <button 
            class="rename-btn" 
            @click="showRenameModal(hero)"
          >
            <text>✏️</text>
          </button>
          <button 
            class="fire-btn" 
            :disabled="gameStore.heroes.length <= 1"
            @click="confirmFire(hero)"
          >
            <text>🗑️</text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="showRename" class="modal-mask" @click="showRename = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">重命名</text>
          <button class="close-btn" @click="showRename = false">✕</button>
        </view>
        <view class="modal-body">
          <input 
            v-model="newName" 
            class="name-input" 
            placeholder="输入新名称"
            :maxlength="20"
          />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showRename = false">取消</button>
          <button class="confirm-btn" @click="doRename">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { CLASS_CONFIG } from '../../utils/gameData'
import type { Unit } from '../../utils/gameData'

const gameStore = useGameStore()
const showRename = ref(false)
const selectedHero = ref<Unit | null>(null)
const newName = ref('')

function goBack() {
  uni.navigateBack()
}

function hireHero() {
  const result = gameStore.hireHero()
  uni.showToast({
    title: result.message,
    icon: result.success ? 'success' : 'none'
  })
}

function confirmFire(hero: Unit) {
  if (gameStore.heroes.length <= 1) {
    uni.showToast({
      title: '主角团至少保留1名角色',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认解雇',
    content: `确定要解雇 ${hero.name} 吗？将获得50金币。`,
    success: (res) => {
      if (res.confirm) {
        const result = gameStore.fireHero(hero.id)
        uni.showToast({
          title: result.message,
          icon: result.success ? 'success' : 'none'
        })
      }
    }
  })
}

function showRenameModal(hero: Unit) {
  selectedHero.value = hero
  newName.value = hero.name
  showRename.value = true
}

function doRename() {
  if (selectedHero.value && newName.value.trim()) {
    gameStore.renameHero(selectedHero.value.id, newName.value.trim())
    uni.showToast({
      title: '重命名成功',
      icon: 'success'
    })
    showRename.value = false
  } else {
    uni.showToast({
      title: '请输入有效名称',
      icon: 'none'
    })
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

.header-left {
  width: 80rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.back-icon {
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

.header-right {
  width: 150rpx;
  text-align: right;
}

.gold-text {
  font-size: 28rpx;
  color: #ffd700;
  font-weight: bold;
}

.hire-section {
  padding: 30rpx;
}

.hire-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 15rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  border: none;
}

.hire-icon {
  font-size: 40rpx;
}

.hire-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.hero-list {
  padding: 0 30rpx 30rpx;
}

.list-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.empty-list {
  text-align: center;
  padding: 60rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.hero-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 25rpx;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.hero-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-icon-small {
  width: 70rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
}

.hero-details {
  flex: 1;
}

.hero-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.hero-level {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 5rpx;
}

.hero-actions {
  display: flex;
  gap: 15rpx;
}

.rename-btn, .fire-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  font-size: 28rpx;
}

.rename-btn {
  background: #f0f0f0;
}

.fire-btn {
  background: #ffebee;
  
  &:disabled {
    background: #f5f5f5;
    opacity: 0.5;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-size: 28rpx;
  border: none;
}

.modal-body {
  padding: 30rpx;
}

.name-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
</style>