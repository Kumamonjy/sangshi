<template>
  <view class="home-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">家园建设</text>
      <view class="save-indicator">✓ 自动保存</view>
    </view>
    
    <view class="toolbar">
      <view 
        v-for="tool in tools" 
        :key="tool.id"
        class="tool-item"
        :class="{ active: selectedTool === tool.id }"
        @click="selectedTool = tool.id"
      >
        <text class="tool-icon">{{ tool.icon }}</text>
        <text class="tool-name">{{ tool.name }}</text>
      </view>
    </view>
    
    <view class="grid-container">
      <view class="home-grid">
        <view 
          v-for="(row, rowIndex) in gameStore.player?.homeGrid" 
          :key="rowIndex"
          class="grid-row"
        >
          <view 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="grid-cell"
            :class="getCellClass(cell)"
            @click="handleCellClick(rowIndex, colIndex)"
            @dblclick="handleCellDoubleClick(rowIndex, colIndex)"
          >
            <text v-if="cell.building" class="cell-icon">{{ cell.building.icon }}</text>
            <text v-else-if="cell.terrain === 'river'" class="cell-icon">🌊</text>
            <text v-else-if="cell.terrain === 'obstacle'" class="cell-icon">⛰️</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="info-panel">
      <view class="panel-title">建筑说明</view>
      <view class="building-info">
        <view class="building-item">
          <text class="building-icon">🌾</text>
          <view class="building-detail">
            <text class="building-name">灵田</text>
            <text class="building-desc">第4回合在周围生成4株灵草</text>
          </view>
        </view>
        <view class="building-item">
          <text class="building-icon">🏯</text>
          <view class="building-detail">
            <text class="building-name">丹房</text>
            <text class="building-desc">第3回合在周围生成1瓶灵药</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="footer-info">
      <text>提示：双击格子可恢复为空地</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { HomeGridCell } from '../../utils/gameData'

const gameStore = useGameStore()

const selectedTool = ref<'river' | 'obstacle' | 'spiritField' | 'elixirRoom'>('river')

const tools = [
  { id: 'river' as const, name: '水域', icon: '🌊' },
  { id: 'obstacle' as const, name: '障碍', icon: '⛰️' },
  { id: 'spiritField' as const, name: '灵田', icon: '🌾' },
  { id: 'elixirRoom' as const, name: '丹房', icon: '🏯' },
]

function goBack() {
  uni.navigateBack()
}

function getCellClass(cell: HomeGridCell): Record<string, boolean> {
  return {
    'has-building': !!cell.building,
    'has-river': cell.terrain === 'river',
    'has-obstacle': cell.terrain === 'obstacle',
  }
}

async function handleCellClick(row: number, col: number) {
  if (!gameStore.player) return
  
  let terrain: 'empty' | 'river' | 'obstacle' = 'empty'
  let buildingType: 'none' | 'spiritField' | 'elixirRoom' = 'none'
  
  switch (selectedTool.value) {
    case 'river':
      terrain = 'river'
      buildingType = 'none'
      break
    case 'obstacle':
      terrain = 'obstacle'
      buildingType = 'none'
      break
    case 'spiritField':
      terrain = 'empty'
      buildingType = 'spiritField'
      break
    case 'elixirRoom':
      terrain = 'empty'
      buildingType = 'elixirRoom'
      break
  }
  
  await gameStore.updateHomeGrid(row, col, terrain, buildingType)
}

async function handleCellDoubleClick(row: number, col: number) {
  if (!gameStore.player) return
  await gameStore.updateHomeGrid(row, col, 'empty', 'none')
  uni.showToast({ title: '已恢复为空地', icon: 'none' })
}
</script>

<style lang="scss">
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  font-family: 'STXingkai', '华文行楷', 'STKaiti', '华文楷体', 'KaiTi', '楷体', cursive, serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 24rpx;
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

.save-indicator {
  font-size: 24rpx;
  color: #4ade80;
}

.toolbar {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
  overflow-x: auto;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  min-width: 100rpx;
  transition: all 0.3s;
  
  &.active {
    background: rgba(233, 69, 96, 0.2);
    border-color: #e94560;
  }
}

.tool-icon {
  font-size: 36rpx;
}

.tool-name {
  font-size: 22rpx;
  color: #a0aec0;
  margin-top: 8rpx;
  
  .active & {
    color: #e94560;
  }
}

.grid-container {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 32rpx;
}

.home-grid {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16rpx;
}

.grid-row {
  display: flex;
  gap: 4rpx;
}

.grid-cell {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.has-building {
    background: rgba(74, 222, 128, 0.2);
    border: 1rpx solid rgba(74, 222, 128, 0.3);
  }
  
  &.has-river {
    background: rgba(96, 165, 250, 0.2);
    border: 1rpx solid rgba(96, 165, 250, 0.3);
  }
  
  &.has-obstacle {
    background: rgba(156, 163, 175, 0.2);
    border: 1rpx solid rgba(156, 163, 175, 0.3);
  }
}

.cell-icon {
  font-size: 32rpx;
}

.info-panel {
  padding: 24rpx 32rpx;
  margin: 24rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16rpx;
}

.panel-title {
  font-size: 26rpx;
  color: #a0aec0;
  margin-bottom: 16rpx;
}

.building-info {
  display: flex;
  gap: 32rpx;
}

.building-item {
  display: flex;
  align-items: center;
}

.building-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.building-detail {
  display: flex;
  flex-direction: column;
}

.building-name {
  font-size: 26rpx;
  color: #eaeaea;
}

.building-desc {
  font-size: 22rpx;
  color: #718096;
}

.footer-info {
  text-align: center;
  padding: 16rpx 32rpx 32rpx;
  font-size: 24rpx;
  color: #718096;
}
</style>
