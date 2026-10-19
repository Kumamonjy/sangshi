<template>
  <view class="start-container">
    <view class="header">
      <text class="title">六道天下</text>
      <text class="subtitle">回合制战棋策略游戏</text>
    </view>
    
    <view class="content">
      <view class="world-tags">
        <view class="world-tag">人</view>
        <view class="world-tag">仙</view>
        <view class="world-tag">神</view>
        <view class="world-tag">魔</view>
        <view class="world-tag">鬼</view>
        <view class="world-tag">妖</view>
      </view>
      
      <view class="button-group">
        <view class="btn primary" @click="newGame">
          <text class="btn-text">全新游戏</text>
        </view>
        
        <view 
          class="btn secondary" 
          :class="{ disabled: !hasAnySave }"
          @click="showLoadModal = true"
        >
          <text class="btn-text">加载存档</text>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">六界纷争，由你主宰</text>
    </view>
    
    <view class="modal-overlay" v-if="showLoadModal" @click="showLoadModal = false">
      <view class="load-modal" @click.stop>
        <view class="modal-title">选择存档</view>
        <view class="load-slots">
          <view 
            v-for="slot in saveSlots" 
            :key="slot.id" 
            class="load-slot"
            :class="{ empty: slot.savedAt === 0 }"
            @click="selectLoadSlot(slot)"
          >
            <text class="slot-number">{{ slot.id }}</text>
            <view class="slot-info">
              <text class="slot-name">{{ slot.name || '空存档' }}</text>
              <text class="slot-time" v-if="slot.savedAt > 0">{{ formatTime(slot.savedAt) }}</text>
              <text class="slot-day" v-if="slot.player && slot.savedAt > 0">第{{ slot.player.day }}天</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const gameStore = useGameStore()
const showLoadModal = ref(false)
const saveSlots = ref<Array<{ id: number, name: string, savedAt: number, player: any }>>([])

const hasAnySave = computed(() => {
  return saveSlots.value.some(slot => slot.savedAt > 0)
})

onMounted(async () => {
  // Android 先尝试外部存储恢复存档
  if (uni.getSystemInfoSync().platform === 'android') {
    try {
      const { success } = await gameStore.loadGame()
      if (success) {
        console.log('从外部存储恢复了存档，刷新存档槽')
      }
    } catch (e) {
      console.error('外部存储恢复失败:', e)
    }
  }
  await refreshSaveSlots()
})

async function refreshSaveSlots() {
  saveSlots.value = await gameStore.getSaveSlots()
}

async function selectLoadSlot(slot: { id: number, name: string, savedAt: number, player: any }) {
  if (slot.savedAt > 0) {
    const result = await gameStore.loadFromSlot(slot.id)
    if (result.success) {
      showLoadModal.value = false
      uni.showToast({
        title: '加载成功！',
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        uni.hideToast()
        uni.redirectTo({ url: '/pages/index/index' })
      }, 1500)
    } else {
      uni.showToast({ title: '加载失败: ' + (result.error || '未知错误'), icon: 'none', duration: 3000 })
    }
  }
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function newGame() {
  gameStore.initGame()
  uni.navigateTo({ url: '/pages/index/index' })
}
</script>

<style lang="scss">
.start-container {
  min-height: 100vh;
  background-image: url('/static/backgrounds/jiazai_jiemian.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  /* background-attachment: fixed 在安卓小程序上可能导致背景闪烁/拉伸，改用默认scroll */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx;
  position: relative;
  overflow: hidden;
  /* 跨平台楷体字体链：iOS/Mac/Windows/安卓多品牌ROM优先楷体，安卓原生兜底思源宋体 */
  font-family: 'STXingkai', '华文行楷', 'STKaiti', '华文楷体', 'KaiTi', '楷体', '楷体_GB2312', 'DFKai-SB', 'BiauKai', 'TW-Kai', 'Noto Serif CJK SC', 'Noto Serif CJK', 'Source Han Serif SC', 'Source Han Serif CN', 'Songti SC', 'SimSun', serif;
}

.header {
  text-align: center;
  margin-top: 80rpx;
}

.title {
  font-size: 88rpx;
  font-weight: bold;
  color: #2d4a6b;
  text-shadow: 2rpx 2rpx 8rpx rgba(45, 74, 107, 0.2);
  display: block;
  letter-spacing: 8rpx;
  font-family: inherit;
}

.subtitle {
  font-size: 28rpx;
  color: #5a7a9a;
  margin-top: 20rpx;
  display: block;
  letter-spacing: 4rpx;
  font-family: inherit;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40rpx;
    height: 2rpx;
    background: #5a7a9a;
    opacity: 0.5;
  }
  
  &::before {
    left: -56rpx;
  }
  
  &::after {
    right: -56rpx;
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 60rpx;
}

.world-tags {
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.world-tag {
  width: 60rpx;
  height: 80rpx;
  background: linear-gradient(180deg, #b8d1e8 0%, #8fa8c0 100%);
  border: 2rpx solid #6e89a5;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #2d4a6b;
  font-weight: bold;
  font-family: inherit;
  position: relative;
  clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 100%, 0% 100%, 0% 10%);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  width: 100%;
  max-width: 420rpx;
}

.btn {
  padding: 32rpx;
  border-radius: 20rpx;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  
  &.primary {
    background: linear-gradient(180deg, #f08080 0%, #cc5555 100%);
    border: 2rpx solid #b84444;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
    }
  }
  
  &.secondary {
    background: linear-gradient(180deg, #8fa8c0 0%, #6e89a5 100%);
    border: 2rpx solid #5a7a9a;
    
    &:active:not(.disabled) {
      background: linear-gradient(180deg, #7e97af 0%, #5d7894 100%);
      transform: scale(0.98);
    }
    
    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

.btn-text {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 4rpx;
  font-family: inherit;
}

.footer {
  text-align: center;
  margin-bottom: 60rpx;
}

.footer-text {
  font-size: 28rpx;
  color: #3d5a7a;
  font-weight: 500;
  letter-spacing: 6rpx;
  font-family: inherit;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.load-modal {
  background: linear-gradient(180deg, #e8f0f8 0%, #d0d8e0 100%);
  border: 3rpx solid #5a7a9a;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 80%;
  max-width: 500rpx;
  box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.3);
  font-family: 'STXingkai', '华文行楷', 'STKaiti', '华文楷体', 'KaiTi', '楷体', '楷体_GB2312', 'DFKai-SB', 'BiauKai', 'TW-Kai', 'Noto Serif CJK SC', 'Noto Serif CJK', 'Source Han Serif SC', 'Source Han Serif CN', 'Songti SC', 'SimSun', serif;
}

.modal-title {
  font-size: 36rpx;
  color: #2d4a6b;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32rpx;
  font-family: 'STXingkai', '华文行楷', 'STKaiti', '华文楷体', 'KaiTi', '楷体', '楷体_GB2312', 'DFKai-SB', 'BiauKai', 'TW-Kai', 'Noto Serif CJK SC', 'Noto Serif CJK', 'Source Han Serif SC', 'Source Han Serif CN', 'Songti SC', 'SimSun', serif;
}

.load-slots {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.load-slot {
  background: rgba(45,74,107,0.08);
  border: 2rpx solid rgba(90,122,154,0.5);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: all 0.2s;
  
  &.empty {
    opacity: 0.5;
  }
  
  &:active:not(.empty) {
    transform: scale(0.98);
    background: rgba(45,74,107,0.15);
  }
}

.slot-number {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #8fa8c0 0%, #6e89a5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  font-weight: 700;
  font-family: inherit;
}

.slot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.slot-name {
  font-size: 28rpx;
  color: #2d4a6b;
  font-weight: 600;
  font-family: inherit;
}

.slot-time {
  font-size: 22rpx;
  color: #5a7a9a;
  font-family: inherit;
}

.slot-day {
  font-size: 22rpx;
  color: #7a8a9a;
  margin-top: 4rpx;
  font-family: inherit;
}
</style>