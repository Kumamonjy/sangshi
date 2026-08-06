<template>
  <view class="index-container">
    <view class="decor-top-left"></view>
    <view class="decor-top-right"></view>
    <view class="decor-bottom-left"></view>
    <view class="decor-bottom-right"></view>
    
    <view class="header">
      <view class="header-left">
        <view class="sun-moon" :class="gameStore.player?.phase"></view>
        <text class="day-info">第 {{ gameStore.player?.day }} 天</text>
        <text class="phase-info" :class="gameStore.player?.phase">{{ gameStore.player?.phase === 'day' ? '白日' : '夜晚' }}</text>
      </view>
      <view class="header-right">
        <text class="gold-icon">💰</text>
        <text class="gold-count">{{ gameStore.player?.gold }}</text>
      </view>
    </view>
    
    <view class="action-section">
      <view class="action-grid">
        <view class="action-item" @click="goToCharacter">
          <text class="action-icon">👤</text>
          <text class="action-text">人物信息</text>
        </view>
        <view class="action-item" @click="goToHome">
          <text class="action-icon">🏯</text>
          <text class="action-text">家园建设</text>
        </view>
        <view class="action-item" @click="goToBattleSelect">
          <text class="action-icon">🗡️</text>
          <text class="action-text">准备战斗</text>
        </view>
        <view class="action-item" @click="goToInventory">
          <text class="action-icon">🎒</text>
          <text class="action-text">背包仓库</text>
        </view>
      </view>
      
      <view class="bottom-buttons">
        <view class="action-item bottom-btn" @click="goToCharacterBook">
          <text class="action-icon">📚</text>
          <text class="action-text">天下百科</text>
        </view>
        <view class="action-item bottom-btn" @click="goToShop">
          <text class="action-icon">🏪</text>
          <text class="action-text">天下市集</text>
        </view>
      </view>
    </view>
    
    <view class="save-button" @click="showSaveModal = true">
      <text class="save-icon">📜</text>
      <text class="save-text">保存进度</text>
    </view>
    
    <view class="export-import-buttons">
      <view class="export-button" @click="exportSaveFile">
        <text class="save-icon">📤</text>
        <text class="save-text">导出存档</text>
      </view>
      <view class="import-button" @click="importSaveFile">
        <text class="save-icon">📥</text>
        <text class="save-text">导入存档</text>
      </view>
    </view>
    
    <view class="bottom-phase-buttons">
      <view class="phase-save-btn next-phase-btn" @click="nextPhase">
        <text class="save-icon">➡️</text>
        <text class="save-text">下一阶段</text>
      </view>
      <view class="phase-save-btn back-start-btn" @click="confirmBackToStart">
        <text class="save-icon">🏠</text>
        <text class="save-text">回到起点</text>
      </view>
    </view>
    
    <view class="footer"></view>
    
    <view class="modal-overlay" v-if="showSaveModal" @click="showSaveModal = false">
      <view class="save-modal" @click.stop>
        <view class="modal-title">选择存档位置</view>
        <view class="save-slots">
          <view 
            v-for="slot in saveSlots" 
            :key="slot.id" 
            class="save-slot"
            :class="{ occupied: slot.savedAt > 0 }"
            @click="selectSlot(slot)"
          >
            <text class="slot-number">{{ slot.id }}</text>
            <view class="slot-info">
              <text class="slot-name">{{ slot.name || '空存档' }}</text>
              <text class="slot-time" v-if="slot.savedAt > 0">{{ formatTime(slot.savedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="modal-overlay" v-if="showNameModal" @click="showNameModal = false">
      <view class="save-modal" @click.stop>
        <view class="modal-title">输入存档名称</view>
        <input 
          class="name-input" 
          v-model="saveName" 
          placeholder="请输入存档名称" 
          maxlength="20"
        />
        <view class="modal-buttons">
          <view class="modal-btn cancel" @click="showNameModal = false">取消</view>
          <view class="modal-btn confirm" @click="confirmSave">确认保存</view>
        </view>
      </view>
    </view>
    
    <view class="modal-overlay" v-if="showBackConfirmModal" @click="showBackConfirmModal = false">
      <view class="save-modal" @click.stop>
        <view class="modal-title">确认提示</view>
        <text class="modal-desc">没有保存的进度会无法找回。</text>
        <view class="modal-buttons">
          <view class="modal-btn cancel" @click="showBackConfirmModal = false">取消</view>
          <view class="modal-btn confirm" @click="confirmBack">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const gameStore = useGameStore()
const showSaveModal = ref(false)
const showNameModal = ref(false)
const showBackConfirmModal = ref(false)
const selectedSlot = ref<number | null>(null)
const saveName = ref('')
const saveSlots = ref<Array<{ id: number, name: string, savedAt: number, player: any }>>([])

onMounted(async () => {
  uni.hideToast()
  console.log('主界面加载', { hasPlayer: !!gameStore.player })
  if (!gameStore.player) {
    const hasSave = gameStore.hasSaveData()
    if (hasSave) {
      console.log('发现内部存储存档，自动加载')
      const { success } = await gameStore.loadGame()
      if (!success && uni.getSystemInfoSync().platform === 'android') {
        console.log('内部存储加载失败，尝试从外部存储恢复')
      }
    } else if (uni.getSystemInfoSync().platform === 'android') {
      console.log('没有内部存档，尝试从外部存储恢复')
      // 即使内部没有存档，也尝试从外部存储恢复
      const { success } = await gameStore.loadGame()
      
      // 提示用户
      if (!success) {
        setTimeout(() => {
          uni.showModal({
            title: '存档备份说明',
            content: '💡 重要提示：\n\n由于 Android 系统限制，请点击「📤 导出存档」按钮查看备份方法。\n\n您可以通过剪贴板备份整个文件夹两种方式备份存档，重装后通过剪贴板或复制文件夹恢复存档！',
            showCancel: false
          })
        }, 1000)
      }
    }
  }
  await refreshSaveSlots()
})

async function refreshSaveSlots() {
  saveSlots.value = await gameStore.getSaveSlots()
}

function selectSlot(slot: { id: number, name: string, savedAt: number }) {
  selectedSlot.value = slot.id
  saveName.value = slot.name || `存档 ${slot.id}`
  showSaveModal.value = false
  showNameModal.value = true
}

async function confirmSave() {
  if (selectedSlot.value) {
    const success = await gameStore.saveToSlot(selectedSlot.value, saveName.value)
    if (success) {
      uni.showToast({
        title: '保存成功！',
        icon: 'success'
      })
    }
  }
  showNameModal.value = false
  selectedSlot.value = null
  saveName.value = ''
  await refreshSaveSlots()
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function goToCharacter() {
  uni.navigateTo({ url: '/pages/character/character' })
}

function goToHome() {
  uni.navigateTo({ url: '/pages/home/home' })
}

function goToBattleSelect() {
  uni.navigateTo({ url: '/pages/battle-select/battle-select' })
}

function goToInventory() {
  uni.navigateTo({ url: '/pages/inventory/inventory' })
}

function goToCharacterBook() {
  uni.navigateTo({ url: '/pages/character-book/character-book' })
}

function goToShop() {
  uni.navigateTo({ url: '/pages/shop/shop' })
}

async function nextPhase() {
  await gameStore.nextPhase()
  uni.showToast({
    title: gameStore.player?.phase === 'day' 
      ? `进入第${gameStore.player?.day}天白天` 
      : '进入晚上',
    icon: 'none',
    duration: 1500
  })
}

function confirmBackToStart() {
  showBackConfirmModal.value = true
}

function confirmBack() {
  showBackConfirmModal.value = false
  uni.reLaunch({ url: '/pages/start/start' })
}

async function exportSaveFile() {
  if (!gameStore.player) {
    uni.showToast({ title: '没有存档可导出', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '正在备份...' })
    
    // 先保存当前进度
    await gameStore.saveGame()
    
    // 获取存档数据并显示
    const saveData = uni.getStorageSync('sangshi_save')
    console.log('准备导出的存档:', saveData)
    
    if (saveData) {
      uni.setClipboardData({
        data: saveData,
        success: () => {
          uni.hideLoading()
          uni.showModal({
            title: '备份成功',
            content: '✅ 存档已复制到剪贴板！\n\n📋 剪贴板备份（推荐）：\n请粘贴到备忘录或云盘保存\n\n📁 文件夹备份：\n已尝试保存到「Android/data/uni.app.UNISANSHI/apps/__UNI__6383D08/doc/SangshiGame/」\n\n💡 重装后选择「📥 导入存档」→「剪贴板恢复」即可恢复',
            showCancel: false
          })
        },
        fail: (err) => {
          console.error('复制到剪贴板失败:', err)
          uni.hideLoading()
          uni.showModal({
            title: '备份完成',
            content: '✅ 已保存游戏进度！\n\n💡 提示：使用「📥 导入存档」中的「剪贴板恢复」作为主要备份方式',
            showCancel: false
          })
        }
      })
    } else {
      uni.hideLoading()
      uni.showToast({ title: '没有找到存档数据', icon: 'none' })
    }
  } catch (e) {
    console.error('导出失败:', e)
    uni.hideLoading()
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

async function importSaveFile() {
  try {
    uni.showModal({
      title: '恢复存档',
      content: '选择恢复方式：\n\n📋 从剪贴板恢复 - 适合粘贴文本存档（推荐）\n\n📁 手动恢复 - 将备份的文件夹复制到「Android/data/uni.app.UNISANSHI/apps/__UNI__6383D08/doc/SangshiGame/」后重启游戏',
      confirmText: '剪贴板恢复',
      cancelText: '取消',
      showCancel: true,
      success: async (res) => {
        if (res.confirm) {
          // 从剪贴板恢复
          uni.getClipboardData({
            success: async (clipRes) => {
              const clipData = clipRes.data
              console.log('从剪贴板获取到数据:', clipData ? clipData.substring(0, 100) : '空')
              
              if (clipData && clipData.length > 50) {
                try {
                  let parsed: any
                  try {
                    parsed = JSON.parse(clipData)
                  } catch (parseErr) {
                    console.error('JSON解析失败:', parseErr)
                    uni.showToast({ title: '剪贴板内容格式错误', icon: 'none', duration: 2000 })
                    return
                  }
                  
                  console.log('解析后的存档:', parsed)
                  
                  if (parsed && parsed.player) {
                    try {
                      // 直接保存原始数据，loadGame 会处理兼容性问题
                      uni.setStorageSync('sangshi_save', JSON.stringify(parsed))
                      console.log('已保存到内部存储')
                      
                      // 调用loadGame，但跳过外部存储
                      const loadResult = await gameStore.loadGame(false)
                      console.log('加载结果:', loadResult)
                      await refreshSaveSlots()
                      
                      if (loadResult.success) {
                        uni.showModal({
                          title: '恢复成功！',
                          content: '存档已成功恢复，点击确定继续游戏。',
                          showCancel: false,
                          success: () => {
                            uni.reLaunch({ url: '/pages/index/index' })
                          }
                        })
                      } else {
                        uni.showToast({ title: '恢复失败: ' + (loadResult.error || '未知错误'), icon: 'none', duration: 3000 })
                      }
                    } catch (storeErr) {
                      console.error('保存到store失败:', storeErr)
                      uni.showToast({ title: '保存失败: ' + (storeErr as Error).message?.substring(0, 100) || '未知错误', icon: 'none' })
                    }
                    return
                  } else {
                    console.log('没有找到player字段')
                    uni.showToast({ title: '存档数据不完整', icon: 'none' })
                  }
                } catch (e) {
                  console.error('剪贴板解析失败:', e)
                  uni.showToast({ title: '解析失败: ' + (e as Error).message, icon: 'none' })
                }
              } else {
                uni.showToast({ title: '剪贴板中没有找到有效存档', icon: 'none' })
              }
            },
            fail: (err) => {
              console.error('获取剪贴板失败:', err)
              uni.showToast({ title: '获取剪贴板失败', icon: 'none' })
            }
          })
        } else {
          console.log('用户取消了导入操作')
        }
      }
    })
  } catch (e) {
    console.error('导入失败:', e)
    uni.showModal({
      title: '导入存档说明',
      content: '建议优先使用剪贴板恢复方式。',
      showCancel: false
    })
  }
}
</script>

<style lang="scss">
.index-container {
  min-height: 100vh;
  background-image: url('/static/backgrounds/zhujiemian.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding: 0 32rpx 32rpx;
  position: relative;
  font-family: 'STXingkai', '华文行楷', 'STKaiti', '华文楷体', 'KaiTi', '楷体', cursive, serif;
}

.decor-top-left,
.decor-top-right,
.decor-bottom-left,
.decor-bottom-right {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 Q30 20 20 40" stroke="%238b7355" fill="none" stroke-width="2"/></svg>');
  background-size: contain;
  opacity: 0.6;
  z-index: 1;
}

.decor-top-left {
  top: 20rpx;
  left: 20rpx;
  transform: rotate(0deg);
}

.decor-top-right {
  top: 20rpx;
  right: 20rpx;
  transform: rotate(90deg);
}

.decor-bottom-left {
  bottom: 20rpx;
  left: 20rpx;
  transform: rotate(-90deg);
}

.decor-bottom-right {
  bottom: 20rpx;
  right: 20rpx;
  transform: rotate(180deg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx 0 32rpx;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: linear-gradient(90deg, rgba(30,40,50,0.85) 0%, rgba(30,40,50,0.7) 100%);
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(100,150,180,0.6);
}

.sun-moon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  position: relative;
  
  &.day {
    background: radial-gradient(circle, #ffd700 0%, #ff8c00 100%);
    box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.8);
  }
  
  &.night {
    background: radial-gradient(circle, #c0c0c0 0%, #808080 100%);
    box-shadow: 0 0 30rpx rgba(192, 192, 192, 0.8);
  }
}

.day-info {
  font-size: 36rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.phase-info {
  font-size: 28rpx;
  margin-left: 8rpx;
  font-weight: 500;
  
  &.day {
    color: #ffd700;
  }
  
  &.night {
    color: #c0c0c0;
  }
}

.header-right {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(80,60,20,0.85) 0%, rgba(60,45,15,0.7) 100%);
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(255,215,0,0.5);
}

.gold-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.gold-count {
  font-size: 36rpx;
  color: #ffd700;
  font-weight: 700;
  text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5);
}

.action-section {
  margin-top: 32rpx;
  position: relative;
  z-index: 2;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.bottom-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.bottom-btn {
  margin-bottom: 0;
}

.action-item {
  background: linear-gradient(180deg, rgba(50,70,80,0.9) 0%, rgba(30,50,60,0.8) 100%);
  border: 2rpx solid rgba(100,150,180,0.7);
  border-radius: 24rpx;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.4);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active {
    transform: scale(0.96);
    
    &::before {
      opacity: 1;
    }
  }
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  filter: drop-shadow(0 4rpx 12rpx rgba(0,0,0,0.3));
}

.action-text {
  font-size: 32rpx;
  color: #f5f5dc;
  font-weight: 600;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}

.phase-button {
  background: linear-gradient(180deg, rgba(50,70,80,0.9) 0%, rgba(30,50,60,0.8) 100%);
  border: 2rpx solid rgba(100,150,180,0.7);
  border-radius: 24rpx;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.4);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active {
    transform: scale(0.96);
    
    &::before {
      opacity: 1;
    }
  }
}

.phase-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  filter: drop-shadow(0 4rpx 12rpx rgba(0,0,0,0.3));
}

.phase-text {
  font-size: 32rpx;
  color: #f5f5dc;
  font-weight: 600;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}

.back-button {
  background: linear-gradient(180deg, #6b3a1a 0%, #4a2810 50%, #2d1808 100%);
  border: 3rpx solid rgba(160,82,45,0.8);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  transition: all 0.3s;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.4);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -4rpx;
    left: -4rpx;
    right: -4rpx;
    bottom: -4rpx;
    border: 3rpx solid rgba(160,82,45,0.9);
    border-radius: 24rpx;
    opacity: 0.8;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.4);
  }
}

.back-text {
  font-size: 36rpx;
  color: #f5deb3;
  font-weight: 700;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.4);
}

.save-button {
  background: linear-gradient(180deg, #4a6741 0%, #2d4a28 50%, #1a2d18 100%);
  border: 3rpx solid rgba(100,180,80,0.8);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
  transition: all 0.3s;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.4);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -4rpx;
    left: -4rpx;
    right: -4rpx;
    bottom: -4rpx;
    border: 3rpx solid rgba(140,220,100,0.9);
    border-radius: 24rpx;
    opacity: 0.8;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.4);
  }
}

.save-icon {
  font-size: 36rpx;
}

.save-text {
  font-size: 32rpx;
  color: #f0fff0;
  font-weight: 700;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.4);
}

.export-import-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 20rpx;
}

.export-button,
.import-button {
  background: linear-gradient(180deg, #3a5a67 0%, #284550 50%, #18302d 100%);
  border: 3rpx solid rgba(100, 160, 180, 0.8);
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.4);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -3rpx;
    left: -3rpx;
    right: -3rpx;
    bottom: -3rpx;
    border: 2rpx solid rgba(140, 200, 220, 0.9);
    border-radius: 23rpx;
    opacity: 0.7;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 3rpx 10rpx rgba(0,0,0,0.4);
  }
}

.export-button {
  border-color: rgba(80, 160, 200, 0.8);
  &::before {
    border-color: rgba(100, 180, 240, 0.9);
  }
}

.import-button {
  background: linear-gradient(180deg, #5a4a67 0%, #453850 50%, #30282d 100%);
  border-color: rgba(160, 100, 180, 0.8);
  &::before {
    border-color: rgba(200, 140, 220, 0.9);
  }
}

.bottom-phase-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 20rpx;
}

.phase-save-btn {
  background: linear-gradient(180deg, #3a5a67 0%, #284550 50%, #18302d 100%);
  border: 3rpx solid rgba(100, 160, 180, 0.8);
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.4);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -3rpx;
    left: -3rpx;
    right: -3rpx;
    bottom: -3rpx;
    border: 2rpx solid rgba(140, 200, 220, 0.9);
    border-radius: 23rpx;
    opacity: 0.7;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 3rpx 10rpx rgba(0,0,0,0.4);
  }
}

.next-phase-btn {
  border-color: rgba(80, 200, 120, 0.8);
  background: linear-gradient(180deg, #3a674a 0%, #285038 50%, #182d28 100%);
  &::before {
    border-color: rgba(140, 240, 180, 0.9);
  }
}

.back-start-btn {
  background: linear-gradient(180deg, #674a3a 0%, #503828 50%, #2d2018 100%);
  border-color: rgba(180, 120, 80, 0.8);
  &::before {
    border-color: rgba(220, 160, 120, 0.9);
  }
}

.footer {
  text-align: center;
  margin-top: 32rpx;
  position: relative;
  z-index: 2;
}

.save-indicator {
  font-size: 28rpx;
  color: #90ee90;
  font-weight: 500;
  text-shadow: 0 0 10rpx rgba(144, 238, 144, 0.5);
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

.save-modal {
  background: linear-gradient(180deg, #2a3f4a 0%, #1a2830 100%);
  border: 3rpx solid rgba(100,150,180,0.7);
  border-radius: 24rpx;
  padding: 32rpx;
  width: 80%;
  max-width: 500rpx;
  box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.5);
}

.modal-title {
  font-size: 36rpx;
  color: #f5f5dc;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-desc {
  font-size: 28rpx;
  color: #a0aec0;
  text-align: center;
  display: block;
  margin-bottom: 32rpx;
}

.save-slots {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.save-slot {
  background: rgba(255,255,255,0.08);
  border: 2rpx solid rgba(100,150,180,0.4);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: all 0.2s;
  
  &.occupied {
    border-color: rgba(100,200,100,0.6);
    background: rgba(100,150,100,0.15);
  }
  
  &:active {
    transform: scale(0.98);
    background: rgba(255,255,255,0.15);
  }
}

.slot-number {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #8b7355 0%, #5c4033 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #f5deb3;
  font-weight: 700;
}

.slot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.slot-name {
  font-size: 28rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.slot-time {
  font-size: 22rpx;
  color: #a0aec0;
}

.name-input {
  width: 100%;
  padding: 20rpx 24rpx;
  background: rgba(0,0,0,0.3);
  border: 2rpx solid rgba(100,150,180,0.5);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #f5f5dc;
  margin-bottom: 24rpx;
  outline: none;
  
  &::placeholder {
    color: #718096;
  }
}

.modal-buttons {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s;
  
  &.cancel {
    background: rgba(150,100,100,0.4);
    border: 2rpx solid rgba(200,100,100,0.5);
    color: #ffcdd2;
  }
  
  &.confirm {
    background: linear-gradient(135deg, #4a6741 0%, #2d4a28 100%);
    border: 2rpx solid rgba(100,180,80,0.6);
    color: #f0fff0;
  }
  
  &:active {
    transform: scale(0.96);
  }
}
</style>