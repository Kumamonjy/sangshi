<template>
  <view class="inventory-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">背包仓库</text>
      <view class="gold-display">
        <text class="gold-icon">💰</text>
        <text class="gold-text">{{ gameStore.player?.gold }}</text>
      </view>
    </view>
    
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'equipment' }"
        @click="activeTab = 'equipment'"
      >
        <text>装备</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'consumables' }"
        @click="activeTab = 'consumables'"
      >
        <text>消耗品</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <template v-if="activeTab === 'equipment'">
        <view v-if="equipmentItems.length === 0" class="empty-state centered">
          <text class="empty-icon">📦</text>
          <text class="empty-text">暂无装备</text>
        </view>
        
        <view class="items-grid">
          <view 
            v-for="item in equipmentItems" 
            :key="item.id" 
            class="item-card"
          >
            <view class="item-avatar" :style="{ borderColor: getQualityColor(item.quality) }">
              <image v-if="item.icon.includes('.png')" :src="item.icon" class="item-icon-image" mode="aspectFit"></image>
              <text v-else>{{ item.icon }}</text>
            </view>
            <view class="item-info">
              <view class="item-name-row">
                <text class="item-name" :style="{ color: RARITY_CONFIG[item.rarity].color }">{{ item.name }}</text>
                <text class="item-subinfo">{{ RARITY_CONFIG[item.rarity].name }} {{ item.level }}级</text>
                <text class="item-count">×{{ item.count }}</text>
              </view>
              <view class="item-tags">
                <text class="item-tag" :class="getSetTagClass(item.setTag)">{{ item.setTag || '单件' }}</text>
                <text class="item-tag" :style="{ color: getQualityColor(item.quality), borderColor: getQualityColor(item.quality) }">{{ item.quality || '凡物' }}</text>
              </view>
              <view class="item-effect-list">
                <text v-if="getEquipmentStats(item).attack" class="item-effect">攻击力+{{ getEquipmentStats(item).attack }}</text>
                <text v-if="getEquipmentStats(item).defense" class="item-effect">防御力+{{ getEquipmentStats(item).defense }}</text>
                <text v-if="getEquipmentStats(item).hp" class="item-effect">生命值+{{ getEquipmentStats(item).hp }}</text>
                <text v-if="getEquipmentStats(item).mp" class="item-effect">法力值+{{ getEquipmentStats(item).mp }}</text>
                <text v-if="getEquipmentStats(item).moveRange" class="item-effect">移动范围+{{ getEquipmentStats(item).moveRange }}</text>
                <text v-if="getEquipmentStats(item).attackRange" class="item-effect">攻击范围+{{ getEquipmentStats(item).attackRange }}</text>
              </view>
            </view>
            <view class="item-right">
              <view class="equip-buttons">
                <template v-if="upgradingItemId === item.id">
                  <view class="item-action-btn upgrade-confirm" @click="confirmUpgrade(item)">
                    <text>确认升级</text>
                    <text class="upgrade-cost">{{ getEquipmentUpgradeCost(item) }}金币</text>
                  </view>
                  <view class="item-action-btn upgrade-cancel" @click="cancelUpgrade">
                    <text>取消</text>
                  </view>
                </template>
                <template v-else>
                  <view 
                    v-if="item.level < 11" 
                    class="item-action-btn upgrade" 
                    :class="{ disabled: gameStore.player?.gold < getEquipmentUpgradeCost(item) }"
                    @click="showUpgradeConfirm(item)"
                  >
                    <text>升级</text>
                  </view>
                  <view v-else class="item-action-btn upgrade disabled">
                    <text>已满级</text>
                  </view>
                  <view class="item-action-btn sell" @click="confirmSell(item)">
                    <text>出售</text>
                    <text class="sell-price">💰{{ getSellPrice(item) }}</text>
                  </view>
                </template>
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <template v-else>
        <view v-if="consumableItems.length === 0" class="empty-state">
          <text class="empty-icon">🧪</text>
          <text class="empty-text">暂无消耗品</text>
        </view>
        
        <view class="items-grid">
          <view 
            v-for="item in consumableItems" 
            :key="item.id" 
            class="item-card"
            :class="{ 'soul-item': item.subtype === 'soul' }"
          >
            <view class="item-avatar" :class="{ 'soul-avatar': item.subtype === 'soul' }">
              <image v-if="item.icon.includes('.png')" :src="item.icon" class="item-icon-image" mode="aspectFit"></image>
              <text v-else>{{ item.icon }}</text>
            </view>
            <view class="item-info">
              <view class="item-name-row">
                <text class="item-name" :class="{ 'soul-name': item.subtype === 'soul' }">{{ item.name }}</text>
                <text class="item-count">×{{ item.count }}</text>
              </view>
              <text class="item-desc">{{ item.description }}</text>
              <text v-if="item.subtype === 'soul'" class="item-tag soul-tag">等级上限道具</text>
            </view>
            <view class="item-right">
              <view class="item-action-btn use" :class="{ 'soul-btn': item.subtype === 'soul' }" @click="selectItemForUse(item)">
                <text>使用</text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>
    
    <view v-if="showConsumableTargetPanel" class="equip-target-panel">
      <view class="panel-header">
        <text class="panel-title">选择使用目标（{{ selectedConsumableItem?.name }}）</text>
        <view class="panel-close" @click="showConsumableTargetPanel = false">
          <text>✕</text>
        </view>
      </view>
      <scroll-view class="char-list-scroll" scroll-y>
        <view class="char-list">
          <view
            v-for="char in gameStore.player?.characters"
            :key="char.id"
            class="char-item-row"
            :class="{ disabled: char.hp <= 0 || !canUseSoulOnCharacter(selectedConsumableItem!, char.id) }"
            @click="confirmUseConsumable(char.id)"
          >
            <image
              v-if="isAvatarUrl(getAvatar(char))"
              :src="getAvatar(char)"
              class="char-avatar-image"
              mode="aspectFill"
            />
            <text v-else class="char-avatar-text">{{ getAvatar(char) }}</text>
            <view class="char-info">
              <view class="char-header">
                <text class="char-name">{{ char.name }}</text>
                <text class="char-level">Lv.{{ char.level }}/{{ char.maxLevel }}</text>
              </view>
              <view class="char-stats">
                <view class="stat-bar">
                  <text class="stat-icon">❤️</text>
                  <view class="bar-container">
                    <view class="bar-fill hp-fill" :style="{ width: (char.hp / char.maxHp * 100) + '%' }"></view>
                  </view>
                  <text class="stat-value">{{ char.hp }}/{{ char.maxHp }}</text>
                </view>
                <view class="stat-bar">
                  <text class="stat-icon">💙</text>
                  <view class="bar-container">
                    <view class="bar-fill mp-fill" :style="{ width: (char.mp / char.maxMp * 100) + '%' }"></view>
                  </view>
                  <text class="stat-value">{{ char.mp }}/{{ char.maxMp }}</text>
                </view>
              </view>
            </view>
            <text v-if="char.hp <= 0" class="dead-text">阵亡</text>
            <text v-else-if="selectedConsumableItem?.subtype === 'soul' && !canUseSoulOnCharacter(selectedConsumableItem, char.id)" class="dead-text">不可用</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view v-if="showChestResult" class="chest-result-panel" @click="closeChestResult">
      <view class="chest-result-content" @click.stop>
        <text class="chest-result-title">🎉 恭喜获得 🎉</text>
        <view v-if="chestResultItem" class="chest-result-item">
          <view class="chest-result-avatar" :style="{ borderColor: getQualityColor(chestResultItem.quality) }">
            <image v-if="chestResultItem.icon.includes('.png')" :src="chestResultItem.icon" class="item-icon-image" mode="aspectFit"></image>
            <text v-else>{{ chestResultItem.icon }}</text>
          </view>
          <text class="chest-result-name" :style="{ color: RARITY_CONFIG[chestResultItem.rarity].color }">
            {{ chestResultItem.name }}
          </text>
          <text class="chest-result-rarity">
            {{ RARITY_CONFIG[chestResultItem.rarity].name }}
          </text>
        </view>
        <view class="chest-confirm-btn" @click="closeChestResult">
          <text>确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { RARITY_CONFIG, getEquipmentStats, getEquipmentUpgradeCost, getAvatarPath, isChestItem, getQualityColor } from '../../utils/gameData'
import type { Item } from '../../utils/gameData'

const gameStore = useGameStore()

const activeTab = ref<'equipment' | 'consumables'>('equipment')
const selectedConsumableItem = ref<Item | null>(null)
const showConsumableTargetPanel = ref(false)
const upgradingItemId = ref<string | null>(null)
const showChestResult = ref(false)
const chestResultItem = ref<Item | null>(null)

function isAvatarUrl(avatar: string | undefined): boolean {
  if (!avatar) return false
  return avatar.startsWith('/static/') || avatar.startsWith('http://') || avatar.startsWith('https://')
}

function getAvatar(char: { id: string; avatar?: string }): string {
  // 优先使用 id 映射头像；如果 avatar 本身就是 URL 也支持
  const mapped = getAvatarPath(char.id)
  if (mapped && mapped.startsWith('/static/')) return mapped
  return char.avatar || '👤'
}

const equipmentItems = computed(() => {
  return gameStore.player?.inventory.filter(item => item.type === 'equipment') || []
})

const consumableItems = computed(() => {
  return gameStore.player?.inventory.filter(item => item.type === 'consumable') || []
})

function goBack() {
  uni.navigateBack()
}

async function selectItemForUse(item: Item) {
  if (isChestItem(item)) {
    // 宝箱直接使用，不需要选择角色
    const openedItem = await gameStore.useConsumable(item.id);
    if (openedItem && typeof openedItem !== 'boolean') {
      chestResultItem.value = openedItem;
      showChestResult.value = true;
    }
  } else if (item.subtype === 'soul' && item.soulTargetId !== 'universal') {
    // 特定类型魂魄：检查是否有对应角色
    const hasTargetChar = gameStore.player?.characters.some(c => c.id === item.soulTargetId)
    if (!hasTargetChar) {
      uni.showToast({ title: `没有可以使用【${item.name}】的角色`, icon: 'none' })
      return
    }
    selectedConsumableItem.value = item;
    showConsumableTargetPanel.value = true;
  } else {
    selectedConsumableItem.value = item;
    showConsumableTargetPanel.value = true;
  }
}

// 检查角色是否可以使用魂魄
function canUseSoulOnCharacter(item: Item, charId: string): boolean {
  if (item.subtype !== 'soul') return true
  const char = gameStore.player?.characters.find(c => c.id === charId)
  if (!char) return false
  // 等级上限已达10级不可使用
  if (char.maxLevel >= 10) return false
  // 特定类型魂魄只能用于对应角色
  if (item.soulTargetId && item.soulTargetId !== 'universal' && item.soulTargetId !== charId) return false
  return true
}

function showUpgradeConfirm(item: Item) {
  if (item.level >= 11) return;
  if (!gameStore.player) return;
  
  const cost = getEquipmentUpgradeCost(item);
  if (gameStore.player.gold < cost) {
    uni.showToast({ title: '金币不足', icon: 'none' });
    return;
  }
  
  upgradingItemId.value = item.id;
}

async function confirmUpgrade(item: Item) {
  const success = await gameStore.upgradeEquipment(item.id);
  if (success) {
    uni.showToast({ title: '升级成功', icon: 'success' });
  }
  upgradingItemId.value = null;
}

function cancelUpgrade() {
  upgradingItemId.value = null;
}

function openChestClick() {
  if (!gameStore.player || gameStore.player.gold < 50) {
    uni.showToast({ title: '金币不足', icon: 'none' });
    return;
  }
  const item = gameStore.openChestStore();
  if (item) {
    chestResultItem.value = item;
    showChestResult.value = true;
  }
}

function closeChestResult() {
  showChestResult.value = false;
  chestResultItem.value = null;
}

async function confirmUseConsumable(characterId: string) {
  if (!selectedConsumableItem.value) return
  
  const result = await gameStore.useConsumable(selectedConsumableItem.value.id, characterId)
  if (result === true) {
    uni.showToast({ title: '使用成功', icon: 'success' })
  } else if (result && typeof result !== 'boolean') {
    // 宝箱（此分支一般不会走到）
    chestResultItem.value = result
    showChestResult.value = true
  } else {
    uni.showToast({ title: '使用失败', icon: 'none' })
  }
  
  selectedConsumableItem.value = null
  showConsumableTargetPanel.value = false
}

function getSetTagClass(setTag?: string): string {
  if (!setTag) return 'single-item'
  if (setTag === '精灵') return 'set-jingling'
  if (setTag === '巨兽') return 'set-jushou'
  return 'single-item'
}

function getSellPrice(item: any): number {
  if (!item.baseStats) return 10
  const total = (item.baseStats.attack || 0) + (item.baseStats.defense || 0) + (item.baseStats.hp || 0) + (item.baseStats.mp || 0) + (item.baseStats.moveRange || 0) + (item.baseStats.attackRange || 0)
  const rarityBonus = (RARITY_CONFIG as any)[item.rarity]?.bonus || 0
  return Math.floor(total * 10 * (1 + rarityBonus))
}

async function confirmSell(item: Item) {
  const price = getSellPrice(item)
  uni.showModal({
    title: '确认出售',
    content: `确定要出售「${item.name}」吗？\n出售价格：💰${price}金币`,
    success: async (res) => {
      if (res.confirm) {
        const success = await gameStore.sellEquipment(item.id, price)
        if (success) {
          uni.showToast({ title: `出售成功，获得${price}金币`, icon: 'success' })
        } else {
          uni.showToast({ title: '出售失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss">
.inventory-container {
  min-height: 100vh;
  background: 
    linear-gradient(180deg, rgba(26,26,46,0.5) 0%, rgba(22,33,62,0.5) 100%),
    url('/static/backgrounds/jishi.jpg') center/cover no-repeat;
  display: flex;
  flex-direction: column;
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

.gold-display {
  display: flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.gold-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.gold-text {
  font-size: 28rpx;
  color: #ffd700;
}

.tabs {
  display: flex;
  padding: 0 32rpx;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #a0aec0;
  transition: all 0.3s;
  
  &.active {
    background: rgba(233, 69, 96, 0.3);
    color: #e94560;
  }
}

.content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-x: hidden;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  &.centered {
    width: 100%;
    text-align: center;
  }
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #718096;
  margin-top: 16rpx;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.item-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
}

.item-avatar {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  font-size: 40rpx;
  flex-shrink: 0;
}

.item-icon-image {
  width: 60rpx;
  height: 60rpx;
}

.item-info {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: 500;
}

.item-subinfo {
  font-size: 22rpx;
  color: #718096;
}

.item-tags {
  display: flex;
  gap: 8rpx;
}

.item-tag {
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  
  &.single-item {
    color: #9ca3af;
    border-color: rgba(156, 163, 175, 0.5);
  }
  
  &.set-jingling {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.5);
    background: rgba(74, 222, 128, 0.1);
  }
  
  &.set-jushou {
    color: #d97706;
    border-color: rgba(217, 119, 6, 0.5);
    background: rgba(217, 119, 6, 0.1);
  }
  
  &.quality-fanwu {
    color: #9ca3af;
    border-color: rgba(156, 163, 175, 0.5);
  }
  
  &.quality-faqi {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.5);
    background: rgba(74, 222, 128, 0.1);
  }
  
  &.quality-lingqi {
    color: #60a5fa;
    border-color: rgba(96, 165, 250, 0.5);
    background: rgba(96, 165, 250, 0.1);
  }
  
  &.quality-gubao {
    color: #a855f7;
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(168, 85, 247, 0.1);
  }
  
  &.quality-xianqi {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.5);
    background: rgba(248, 113, 113, 0.1);
  }
  
  &.quality-shenqi {
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.5);
    background: rgba(251, 191, 36, 0.1);
  }
}

.item-effect-list {
  margin-top: 4rpx;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.item-effect {
  font-size: 22rpx;
  color: #4ade80;
  display: block;
}

.item-desc {
  font-size: 22rpx;
  color: #718096;
  margin-top: 4rpx;
  display: block;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  margin-left: 20rpx;
  flex-shrink: 0;
  width: 180rpx;
  justify-content: center;
}

.equip-buttons {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  width: 100%;
}

.item-count {
  font-size: 24rpx;
  color: #718096;
}

.item-action-btn {
  padding: 8rpx 16rpx;
  border-radius: 10rpx;
  text-align: center;
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  
  &.equip {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
  
  &.use {
    background: linear-gradient(135deg, #4ade80, #22c55e);
  }
  
  &.upgrade {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }
  
  &.upgrade-confirm {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  
  &.upgrade-cancel {
    background: rgba(160, 174, 192, 0.3);
    border: 2rpx solid rgba(160, 174, 192, 0.5);
  }
  
  &.sell {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  
  &.disabled {
    background: rgba(160, 174, 192, 0.5);
    opacity: 0.7;
  }
  
  &:active {
    opacity: 0.9;
  }
  
  &.soul-btn {
    background: linear-gradient(135deg, #a855f7, #7c3aed);
  }
}

.soul-item {
  border: 2rpx solid rgba(168, 85, 247, 0.5);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.05));
}

.soul-avatar {
  border-color: #a855f7 !important;
  background: rgba(168, 85, 247, 0.1);
}

.soul-name {
  color: #a855f7 !important;
}

.soul-tag {
  display: inline-block;
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  font-size: 18rpx;
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border-radius: 6rpx;
}

.upgrade-cost {
  font-size: 18rpx;
  opacity: 0.9;
}

.sell-price {
  font-size: 18rpx;
  opacity: 0.9;
}

.chest-section {
  padding: 16rpx 32rpx;
}

.chest-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 16rpx;
  border: 2rpx solid rgba(167, 139, 250, 0.3);
  transition: all 0.3s;
  
  &.disabled {
    background: rgba(160, 174, 192, 0.3);
    border: 2rpx solid rgba(160, 174, 192, 0.2);
    opacity: 0.6;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.chest-icon {
  font-size: 48rpx;
}

.chest-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.chest-cost {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
}

.chest-result-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chest-result-content {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  max-width: 80%;
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.chest-result-title {
  font-size: 32rpx;
  color: #fbbf24;
  font-weight: 700;
}

.chest-result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.chest-result-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  border: 3rpx solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  font-size: 48rpx;
}

.chest-result-name {
  font-size: 28rpx;
  font-weight: 600;
}

.chest-result-rarity {
  font-size: 22rpx;
  color: #a0aec0;
}

.chest-confirm-btn {
  margin-top: 16rpx;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.equip-target-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  max-height: 60vh;
  z-index: 999;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.panel-title {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 600;
}

.panel-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #a0aec0;
}

.char-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 28rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.char-avatar {
  font-size: 40rpx;
}

.char-name {
  font-size: 24rpx;
  color: #eaeaea;
  margin-top: 8rpx;
}

/* 灵药/灵草选择目标用：角色行样式（参考战斗选择角色UI） */
.char-list-scroll {
  max-height: 60vh;
}

.char-item-row {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  margin-bottom: 12rpx;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  &.disabled {
    opacity: 0.5;
  }
}

.char-avatar-image {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.char-avatar-text {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  font-size: 36rpx;
  margin-right: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.char-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.char-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.char-header .char-name {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 500;
  margin-top: 0;
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
  width: 20rpx;
  text-align: center;
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
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.hp-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.mp-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.stat-value {
  font-size: 22rpx;
  color: #eaeaea;
  white-space: nowrap;
}

.dead-text {
  font-size: 22rpx;
  color: #ef4444;
  margin-left: 16rpx;
  font-weight: 600;
}
</style>