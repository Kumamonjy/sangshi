<template>
  <view class="container">
    <view class="header">
      <view class="header-left">
        <button class="back-btn" @click="goBack">
          <text class="icon">←</text>
        </button>
        <button class="settings-btn" @click="openSettings">
          <text class="icon">⚙️</text>
        </button>
      </view>
      <view class="header-center">
        <text class="title">养成战棋</text>
      </view>
      <view class="header-right">
        <button class="save-btn" @click="onSaveGame">
          <text class="icon">💾</text>
        </button>
      </view>
    </view>

    <view class="gold-section">
      <text class="gold-text">💰 {{ gameStore.gold }}</text>
    </view>

    <view class="main-content">
      <button class="main-btn" @click="goToCharacter">
        <text class="btn-icon">👤</text>
        <text class="btn-text">人物信息</text>
      </button>

      <button class="main-btn battle-btn" @click="startBattle">
        <text class="btn-icon">⚔️</text>
        <text class="btn-text">开始战斗</text>
      </button>

      <button class="main-btn" @click="goToHire">
        <text class="btn-icon">📝</text>
        <text class="btn-text">雇佣/解雇</text>
      </button>
    </view>

    <view class="footer">
      <text class="tip-text">战斗胜利可获得经验和金币，提升主角等级与属性；战斗中可点击加速按钮切换速度；可通过雇佣按钮扩展主角团；回合可选择原地防御提升本回合10%防御</text>
    </view>

    <view v-if="showSettings" class="modal-mask" @click="showSettings = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">设置</text>
          <button class="close-btn" @click="showSettings = false">✕</button>
        </view>
        <view class="modal-body">
          <view class="setting-item">
            <text class="setting-label">敌方总人数 (3-10)</text>
            <slider 
              :value="gameStore.settings.enemyCount" 
              :min="3" 
              :max="10" 
              @change="onEnemyCountChange"
              activeColor="#667eea"
              backgroundColor="#ddd"
            />
            <text class="setting-value">{{ gameStore.settings.enemyCount }}</text>
          </view>

          <view class="setting-item">
            <text class="setting-label">我方总人数 (3-10)</text>
            <slider 
              :value="gameStore.settings.allyAiCount" 
              :min="3" 
              :max="10" 
              @change="onAllyAiCountChange"
              activeColor="#667eea"
              backgroundColor="#ddd"
            />
            <text class="setting-value">{{ gameStore.settings.allyAiCount }}</text>
          </view>

          <view class="setting-summary">
            <text class="summary-text">我方 {{ gameStore.settings.allyAiCount }} vs 敌方 {{ gameStore.settings.enemyCount }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="confirm-btn" @click="showSettings = false">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const gameStore = useGameStore()
const showSettings = ref(false)

function goBack() {
  uni.showModal({
    title: '返回开始界面',
    content: '确定要返回开始界面吗？未保存的数据将丢失。',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}

function openSettings() {
  gameStore.initSettings()
  showSettings.value = true
}

function goToCharacter() {
  uni.navigateTo({ url: '/pages/character/character' })
}

function goToHire() {
  uni.navigateTo({ url: '/pages/hire/hire' })
}

function startBattle() {
  uni.navigateTo({ url: '/pages/select/select' })
}

async function onSaveGame() {
  uni.showModal({
    title: '保存游戏',
    editable: true,
    placeholderText: '请输入存档名称',
    success: async (res) => {
      if (res.confirm && res.content) {
        const saveName = res.content.trim() || '存档'
        const result = await gameStore.saveGame(saveName)
        
        if (result.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else if (result.needDeleteOldest && result.oldestSlotIndex !== undefined) {
          uni.showModal({
            title: '存档已满',
            content: '存档数量已达到上限（3个），是否删除最旧的存档并保存？',
            confirmText: '确定',
            cancelText: '取消',
            success: async (confirmRes) => {
              if (confirmRes.confirm) {
                const overwriteSuccess = await gameStore.saveGameOverwrite(saveName, result.oldestSlotIndex!)
                if (overwriteSuccess) {
                  uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                  })
                } else {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                  })
                }
              }
            }
          })
        } else {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

function onEnemyCountChange(e: { detail: { value: number } }) {
  gameStore.updateSettings({ enemyCount: e.detail.value })
}

function onAllyAiCountChange(e: { detail: { value: number } }) {
  gameStore.updateSettings({ allyAiCount: e.detail.value })
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
  padding: 80rpx 60rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-left {
  width: 200rpx;
  display: flex;
  justify-content: space-between;
}

.back-btn, .settings-btn, .save-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.icon {
  font-size: 44rpx;
}

.header-center {
  flex: 1;
  text-align: center;
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-right {
  width: 160rpx;
  text-align: right;
}

.gold-text {
  font-size: 40rpx;
  color: #ffd700;
  font-weight: bold;
}

.gold-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
  gap: 60rpx;
  flex-wrap: wrap;
}

.main-btn {
  width: 280rpx;
  height: 180rpx;
  background: #ffffff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #eee;
}

.battle-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: transparent;

  .btn-text {
    color: #ffffff;
  }
}

.btn-icon {
  font-size: 56rpx;
  margin-bottom: 2rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.footer {
  padding: 60rpx;
  text-align: center;
}

.tip-text {
  font-size: 32rpx;
  color: #999;
  line-height: 1.6;
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
  width: 85%;
  max-width: 900rpx;
  background: #ffffff;
  border-radius: 28rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
}

.close-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-size: 40rpx;
  border: none;
}

.modal-body {
  padding: 40rpx;
}

.setting-item {
  margin-bottom: 40rpx;
}

.setting-label {
  font-size: 36rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.setting-value {
  font-size: 36rpx;
  color: #667eea;
  font-weight: bold;
  margin-top: 12rpx;
  display: block;
  text-align: right;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.range-input {
  flex: 1;
  height: 100rpx;
  border: 3rpx solid #ddd;
  border-radius: 16rpx;
  padding: 0 28rpx;
  font-size: 36rpx;
}

.range-separator {
  font-size: 44rpx;
  color: #999;
}

.setting-summary {
  margin-top: 40rpx;
  padding: 28rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  text-align: center;
}

.summary-text {
  font-size: 36rpx;
  color: #667eea;
  font-weight: bold;
}

.modal-footer {
  padding: 40rpx;
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 44rpx;
  font-weight: bold;
  border-radius: 16rpx;
  border: none;
}
</style>