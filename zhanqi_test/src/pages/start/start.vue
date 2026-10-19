<template>
  <view class="container">
    <view class="logo-section">
      <image class="logo" src="/static/icon.png" mode="aspectFit" />
      <text class="title">养成战棋</text>
      <text class="subtitle">策略回合制战斗游戏</text>
    </view>

    <view class="menu-section">
      <button class="menu-btn new-game-btn" @click="onNewGame">
        <text class="btn-icon">🎮</text>
        <text class="btn-text">全新游戏</text>
      </button>

      <button class="menu-btn load-game-btn" @click="showSaveList">
        <text class="btn-icon">📁</text>
        <text class="btn-text">载入存档</text>
      </button>
    </view>

    <view class="version">
      <text class="version-text">v1.1.2</text>
    </view>

    <view v-if="showSaveModal" class="modal-mask" @click="showSaveModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择存档</text>
          <button class="close-btn" @click="showSaveModal = false">✕</button>
        </view>
        <view class="modal-body">
          <view v-if="getSaveSlots().length === 0" class="empty-state">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无存档</text>
          </view>
          <view v-else class="save-list">
            <view 
              v-for="slot in getSaveSlots()" 
              :key="slot.slotIndex" 
              class="save-item"
            >
              <view class="save-info" @click="onLoadSave(slot.slotIndex)">
                <text class="save-name">{{ slot.saveName || '存档' }}</text>
                <text class="save-time">{{ slot.savedAt }}</text>
                <text class="save-gold">💰 {{ slot.gold }}</text>
              </view>
              <view class="save-actions">
                <button class="action-btn load-btn" @click="onLoadSave(slot.slotIndex)">
                  <text>加载</text>
                </button>
                <button class="action-btn delete-btn" @click="onDeleteSave(slot.slotIndex)">
                  <text>删除</text>
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const gameStore = useGameStore()
const showSaveModal = ref(false)
const saveSlots = ref<Array<{ index: number; hasData: boolean; saveName?: string; savedAt?: string }>>([])

interface SaveSlot {
  gold: number
  heroes: any[]
  settings: any
  savedAt: string
  saveName: string
  slotIndex: number
}

async function refreshSaveSlots() {
  saveSlots.value = await gameStore.getSaveSlotsInfo()
}

function getSaveSlots(): SaveSlot[] {
  const slots: SaveSlot[] = []
  
  // 先尝试从已经获取的 saveSlots 中加载
  for (const slot of saveSlots.value) {
    if (slot.hasData) {
      // 尝试获取完整数据
      let data: any = null
      try {
        const fileName = `gameSave_${slot.index}.json`
        // 这里我们通过再次调用 loadFromFileSystem 来获取完整数据
        // 不过为了简单起见，我们先尝试本地存储
        const saveData = uni.getStorageSync(`gameSave_${slot.index}`)
        if (saveData) {
          data = JSON.parse(saveData)
        }
      } catch (e) {
        // 忽略
      }
      
      if (!data) {
        // 如果本地没有，创建一个基本的数据
        data = {
          saveName: slot.saveName || '存档',
          savedAt: slot.savedAt || '',
          gold: 0,
          heroes: [],
          settings: {}
        }
      }
      
      if (!data.saveName) data.saveName = `存档 ${slot.index + 1}`
      if (!data.gold) data.gold = 0
      
      slots.push({
        ...data,
        slotIndex: slot.index
      })
    }
  }
  
  // 如果没有存档，尝试从备份加载
  if (slots.length === 0) {
    const backupData = uni.getStorageSync('gameSave_backup')
    if (backupData) {
      try {
        let data = JSON.parse(backupData)
        if (!data.saveName) data.saveName = '备份存档'
        if (!data.gold) data.gold = 0
        slots.push({
          ...data,
          slotIndex: 0
        })
      } catch (e) {
        console.error('解析备份存档失败:', e)
      }
    }
  }
  
  return slots
}

function onNewGame() {
  uni.showModal({
    title: '全新游戏',
    content: '开始新游戏将重置所有数据，是否继续？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        gameStore.resetGame()
        uni.navigateTo({
          url: '/pages/index/index'
        })
      }
    }
  })
}

async function showSaveList() {
  await refreshSaveSlots()
  showSaveModal.value = true
}

async function onLoadSave(index: number) {
  uni.showModal({
    title: '加载存档',
    content: `确定要加载存档 ${index + 1} 吗？当前未保存的数据将丢失。`,
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        const success = await gameStore.loadGame(index)
        if (success) {
          showSaveModal.value = false
          uni.navigateTo({
            url: '/pages/index/index'
          })
          uni.showToast({
            title: '加载成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

async function onDeleteSave(index: number) {
  uni.showModal({
    title: '删除存档',
    content: `确定要删除存档 ${index + 1} 吗？此操作不可恢复。`,
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        // 删除本地存储的存档
        uni.removeStorageSync(`gameSave_${index}`)
        
        // 同时删除文件系统中的存档
        try {
          if (typeof plus !== 'undefined' && plus.io) {
            const saveFolderPath = plus.io.convertLocalFileSystemURL('_downloads/zhanqi')
            const filePath = `${saveFolderPath}/gameSave_${index}.json`
            
            plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
              entry.remove(() => {
                console.log('文件系统存档删除成功')
              }, (error) => {
                console.log('文件系统存档删除失败（可能不存在）:', error)
              })
            }, (error) => {
              console.log('文件系统存档不存在:', error)
            })
          }
        } catch (e) {
          console.log('删除文件系统存档失败:', e)
        }
        
        await refreshSaveSlots()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  refreshSaveSlots()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  border-radius: 40rpx;
  margin-bottom: 40rpx;
  background: rgba(255, 255, 255, 0.2);
}

.title {
  font-size: 72rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  width: 100%;
  max-width: 600rpx;
}

.menu-btn {
  width: 100%;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  border: none;
}

.new-game-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
}

.load-game-btn {
  background: rgba(255, 255, 255, 0.95);
}

.btn-icon {
  font-size: 56rpx;
  margin-right: 24rpx;
}

.btn-text {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.version {
  position: absolute;
  bottom: 60rpx;
}

.version-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  font-size: 32rpx;
  color: #666;
}

.modal-body {
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 36rpx;
  color: #999;
}

.save-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.save-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
}

.save-info {
  margin-bottom: 16rpx;
}

.save-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.save-time {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.save-gold {
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
}

.save-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 32rpx;
  font-weight: bold;
}

.load-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.delete-btn {
  background: #ff6b6b;
  color: #fff;
}
</style>
