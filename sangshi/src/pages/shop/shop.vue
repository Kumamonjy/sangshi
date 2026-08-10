<template>
  <view class="shop-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">天下市集</text>
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
        <view class="sub-tab-bar">
          <view 
            v-for="type in equipmentTypes" 
            :key="type" 
            class="sub-tab-item"
            :class="{ active: activeEquipmentType === type }"
            @click="activeEquipmentType = type"
          >
            {{ type === 'all' ? '全部' : getEquipmentTypeName(type) }}
          </view>
        </view>
        <view class="items-grid">
          <view
            v-for="(item, index) in filteredEquipmentShop"
            :key="'equip-' + index"
            class="item-card"
          >
            <view class="item-avatar" :style="{ borderColor: getQualityColor(item.quality) }">
              <image v-if="item.icon.includes('.png')" :src="item.icon" class="item-icon-image" mode="aspectFit"></image>
              <text v-else>{{ item.icon }}</text>
            </view>
            <view class="item-info">
              <view class="item-name-row">
                <text class="item-name" :style="{ color: getRarityColor(item.rarity) }">{{ item.name }}</text>
                <text class="item-subinfo">{{ getRarityName(item.rarity) }}</text>
              </view>
              <view class="item-tags">
                <text class="item-tag" :class="getSetTagClass(item.setTag)">{{ item.setTag || '单件' }}</text>
                <text class="item-tag" :style="{ color: getQualityColor(item.quality), borderColor: getQualityColor(item.quality) }">{{ item.quality || '凡物' }}</text>
              </view>
              <view class="item-effect-list">
                <text v-if="getDisplayStat(item, 'attack')" class="item-effect">攻击力+{{ getDisplayStat(item, 'attack') }}</text>
                <text v-if="getDisplayStat(item, 'defense')" class="item-effect">防御力+{{ getDisplayStat(item, 'defense') }}</text>
                <text v-if="getDisplayStat(item, 'hp')" class="item-effect">生命值+{{ getDisplayStat(item, 'hp') }}</text>
                <text v-if="getDisplayStat(item, 'mp')" class="item-effect">法力值+{{ getDisplayStat(item, 'mp') }}</text>
                <text v-if="getDisplayStat(item, 'moveRange')" class="item-effect">移动范围+{{ getDisplayStat(item, 'moveRange') }}</text>
                <text v-if="getDisplayStat(item, 'attackRange')" class="item-effect">攻击范围+{{ getDisplayStat(item, 'attackRange') }}</text>
              </view>
            </view>
            <view class="item-right">
              <view class="item-price" :class="{ insufficient: (gameStore.player?.gold ?? 0) < getPrice(item) }">
                💰 {{ getPrice(item) }}
              </view>
              <view
                class="item-action-btn buy"
                :class="{ disabled: (gameStore.player?.gold ?? 0) < getPrice(item) }"
                @click="buyEquipment(item)"
              >
                <text>购买</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="items-grid">
          <view
            v-for="(item, index) in consumableShop"
            :key="'consum-' + index"
            class="item-card"
          >
            <view class="item-avatar">
              <image v-if="item.icon.includes('.png')" :src="item.icon" class="item-icon-image" mode="aspectFit"></image>
              <text v-else>{{ item.icon }}</text>
            </view>
            <view class="item-info">
              <view class="item-name-row">
                <text class="item-name">{{ item.name }}</text>
              </view>
              <text class="item-desc">{{ item.description }}</text>
            </view>
            <view class="item-right">
              <view class="item-price" :class="{ insufficient: (gameStore.player?.gold ?? 0) < getConsumablePrice(item.name) }">
                💰 {{ getConsumablePrice(item.name) }}
              </view>
              <view
                class="item-action-btn buy"
                :class="{ disabled: (gameStore.player?.gold ?? 0) < getConsumablePrice(item.name) }"
                @click="buyConsumable(item)"
              >
                <text>购买</text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { EQUIPMENT_TEMPLATES, CONSUMABLE_TEMPLATES, RARITY_CONFIG, getRandomRarity, CHEST_CONFIG, getQualityColor } from '../../utils/gameData'

const gameStore = useGameStore()
const activeTab = ref<'equipment' | 'consumables'>('equipment')
const equipmentTypes = ['all', 'weapon', 'armor', 'helmet', 'shoes', 'accessory', 'book'] as const
const activeEquipmentType = ref<string>('all')

function buildEquipmentShop(): Array<any> {
  const list: Array<any> = []
  ;(Object.values(EQUIPMENT_TEMPLATES) as any[]).forEach((subList: any) => {
    subList.forEach((tpl: any) => {
      list.push({
        ...tpl,
        rarity: tpl.rarity || getRandomRarity()
      })
    })
  })
  return list
}

const chestNames = Object.values(CHEST_CONFIG).map(c => c.name)

function buildConsumableShop(): Array<any> {
  return CONSUMABLE_TEMPLATES.filter((tpl: any) =>
    ['灵草', '灵药', '药箱', ...chestNames].includes(tpl.name)
  )
}

const equipmentShop = ref(buildEquipmentShop())
const consumableShop = ref(buildConsumableShop())

import { computed } from 'vue'

const filteredEquipmentShop = computed(() => {
  if (activeEquipmentType.value === 'all') {
    return equipmentShop.value
  }
  return equipmentShop.value.filter((item: any) => item.subtype === activeEquipmentType.value)
})

function getEquipmentTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    weapon: '武器',
    armor: '防具',
    helmet: '头盔',
    shoes: '鞋子',
    accessory: '饰品',
    book: '书籍',
  }
  return nameMap[type] || type
}

function getRarityColor(rarity: string): string {
  return RARITY_CONFIG[rarity]?.color || '#c0c0c0'
}

function getRarityName(rarity: string): string {
  return RARITY_CONFIG[rarity]?.name || '普通'
}

// 根据品质计算装备属性显示值（参考 getEquipmentStats 的逻辑）
function getDisplayStat(item: any, key: string): number {
  if (!item.baseStats) return 0
  const value = item.baseStats[key]
  if (value === undefined || value === null || value === 0) return 0

  const rarityBonus = (RARITY_CONFIG as any)[item.rarity]?.bonus || 0
  const levelBonus = ((item.level || 1) - 1) * 0.1

  // 百分比属性不受到品质和等级的影响
  if (['attackPercent', 'defensePercent', 'hpPercent', 'mpPercent'].includes(key)) {
    return value
  }

  return Math.floor(value * (1 + rarityBonus + levelBonus))
}

// 装备价格：增加的总属性值 × 25 × (1 + 品质加成)
function getPrice(item: any): number {
  if (!item.baseStats) return 25
  const total = (item.baseStats.attack || 0) + (item.baseStats.defense || 0) + (item.baseStats.hp || 0) + (item.baseStats.mp || 0) + (item.baseStats.moveRange || 0) + (item.baseStats.attackRange || 0)
  const rarityBonus = (RARITY_CONFIG as any)[item.rarity]?.bonus || 0
  return Math.floor(total * 25 * (1 + rarityBonus))
}

// 消耗品固定价格
function getConsumablePrice(name: string): number {
  if (name === '灵草') return 100
  if (name === '灵药') return 300
  if (name === '药箱') return 200
  const chestConfig = Object.values(CHEST_CONFIG).find(c => c.name === name)
  if (chestConfig?.shopPrice) return chestConfig.shopPrice
  return 100
}

function goBack() {
  uni.navigateBack()
}

async function buyEquipment(item: any) {
  const price = getPrice(item)
  if (!gameStore.player || gameStore.player.gold < price) {
    uni.showToast({ title: '金币不足', icon: 'none' })
    return
  }
  const success = await gameStore.buyShopEquipment(item)
  if (success) {
    uni.showToast({ title: '购买成功', icon: 'success' })
  } else {
    uni.showToast({ title: '购买失败', icon: 'none' })
  }
}

async function buyConsumable(item: any) {
  const price = getConsumablePrice(item.name)
  if (!gameStore.player || gameStore.player.gold < price) {
    uni.showToast({ title: '金币不足', icon: 'none' })
    return
  }
  const success = await gameStore.buyShopConsumable(item, price)
  if (success) {
    uni.showToast({ title: '购买成功', icon: 'success' })
  } else {
    uni.showToast({ title: '购买失败', icon: 'none' })
  }
}

function getSetTagClass(setTag?: string): string {
  if (!setTag) return 'single-item'
  if (setTag === '精灵') return 'set-jingling'
  if (setTag === '巨兽') return 'set-jushou'
  return 'single-item'
}


</script>

<style lang="scss">
.shop-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
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
  font-weight: 700;
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

.sub-tab-bar {
  display: flex;
  padding: 0 0 16rpx;
  gap: 12rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.sub-tab-item {
  flex: 1;
  min-width: calc(14.28% - 10rpx);
  max-width: calc(14.28% - 10rpx);
  padding: 12rpx 8rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10rpx;
  text-align: center;
  color: #a0aec0;
  font-size: 22rpx;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.sub-tab-item.active {
  background: rgba(100, 180, 150, 0.2);
  color: #fff;
  border-color: rgba(100, 180, 150, 0.5);
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.item-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.08);
}

.item-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 3rpx solid #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  flex-shrink: 0;
}

.item-icon-image {
  width: 80rpx;
  height: 80rpx;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #eaeaea;
}

.item-subinfo {
  font-size: 22rpx;
  color: #a0aec0;
  background: rgba(255, 255, 255, 0.05);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
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
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.item-effect {
  font-size: 22rpx;
  color: #90ee90;
  background: rgba(144, 238, 144, 0.1);
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #a0aec0;
  line-height: 1.5;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
  flex-shrink: 0;
}

.item-price {
  font-size: 26rpx;
  color: #ffd700;
  font-weight: 700;
  background: rgba(255, 215, 0, 0.08);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;

  &.insufficient {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.08);
  }
}

.item-action-btn {
  padding: 16rpx 28rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;
  transition: all 0.2s;

  &.buy {
    background: linear-gradient(180deg, #e94560 0%, #c23b51 100%);
    color: #ffffff;
    font-weight: 600;
  }

  &.disabled {
    background: rgba(255, 255, 255, 0.1);
    color: #666;
  }

  &:active:not(.disabled) {
    transform: scale(0.96);
    opacity: 0.85;
  }
}
</style>
