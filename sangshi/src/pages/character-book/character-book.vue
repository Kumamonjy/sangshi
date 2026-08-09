<template>
  <view class="book-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">天下百科</text>
      <view class="placeholder"></view>
    </view>

    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabs" :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        <text class="tab-text">{{ tab }}</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view v-if="activeTab === 0" class="tab-content">
        <view class="sub-tab-bar">
          <view
            v-for="(faction, index) in factionOrder"
            :key="faction"
            class="sub-tab-item"
            :class="{ active: activeFaction === faction }"
            @click="activeFaction = faction"
          >
            <text>{{ getFactionName(faction) }}</text>
          </view>
        </view>

        <view class="sort-bar">
          <view class="sort-label">排序：</view>
          <view 
            class="sort-btn" 
            :class="{ active: sortOrder === 'asc' }"
            @click="sortOrder = sortOrder === 'asc' ? null : 'asc'"
          >
            <text>位阶↑</text>
          </view>
          <view 
            class="sort-btn" 
            :class="{ active: sortOrder === 'desc' }"
            @click="sortOrder = sortOrder === 'desc' ? null : 'desc'"
          >
            <text>位阶↓</text>
          </view>
        </view>

        <view class="character-list">
          <view v-for="char in currentFactionCharacters" :key="char.id" class="character-card">
            <view class="avatar-section" @click="openAvatarPreview(getAvatarPath(char.id))">
              <image v-if="getAvatarPath(char.id)" class="char-avatar" :src="getAvatarPath(char.id)" mode="aspectFill" @click.stop="openAvatarPreview(getAvatarPath(char.id))" />
              <text v-else class="char-emoji">👤</text>
              <view class="name-attribute-row">
                <text class="char-name">{{ char.name }}</text>
                <text
                  class="char-attribute"
                  :style="{ color: ATTRIBUTE_CONFIG[char.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[char.attribute || 'normal'].color }"
                >
                  {{ ATTRIBUTE_CONFIG[char.attribute || 'normal'].name }}
                </text>
              </view>
              <view class="job-row">
                <text class="char-job" :style="{ color: getRankColor(JOB_CONFIG[char.job]?.rank || 1) }">{{ getJobName(char.job) }}</text>
                <text class="char-rank" :style="{ color: getRankColor(JOB_CONFIG[char.job]?.rank || 1) }">【{{ JOB_CONFIG[char.job]?.rank || 1 }}阶】</text>
              </view>
            </view>

            <view class="stats-section">
              <view class="stats-title">初始属性(1级)</view>
              <view class="stats-grid">
                <view class="stat-item">
                  <text class="stat-label">生命</text>
                  <text class="stat-value">{{ char.baseMaxHp }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">法力</text>
                  <text class="stat-value">{{ char.baseMaxMp }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">攻击</text>
                  <text class="stat-value">{{ char.baseAttack }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">防御</text>
                  <text class="stat-value">{{ char.baseDefense }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">移动</text>
                  <text class="stat-value">{{ char.baseMoveRange }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">攻击范围</text>
                  <text class="stat-value">{{ char.baseAttackRange }}</text>
                </view>
              </view>
            </view>

            <view v-if="getCharGrowth(char.id)" class="growth-section">
              <view class="stats-title">升级成长</view>
              <view class="growth-grid">
                <view class="stat-item">
                  <text class="stat-label">生命+</text>
                  <text class="stat-value">{{ getCharGrowth(char.id)?.maxHp }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">法力+</text>
                  <text class="stat-value">{{ getCharGrowth(char.id)?.maxMp }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">攻击+</text>
                  <text class="stat-value">{{ getCharGrowth(char.id)?.attack }}</text>
                </view>
                <view class="stat-item">
                  <text class="stat-label">防御+</text>
                  <text class="stat-value">{{ getCharGrowth(char.id)?.defense }}</text>
                </view>
              </view>
            </view>

            <view v-if="char.skills.length > 0" class="skills-section">
              <view class="stats-title">技能</view>
              <view class="skill-list">
                <view v-for="skill in char.skills" :key="skill.id" class="skill-item">
                  <view class="skill-main">
                    <view class="skill-name-row">
                      <text
                        class="skill-name"
                        :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }"
                      >【{{ skill.name }}】</text>
                    </view>
                    <view class="skill-tags">
                      <text
                        class="skill-tag"
                        :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }"
                      >{{ ATTRIBUTE_CONFIG[skill.attribute || 'normal'].name }}</text>
                      <text class="skill-tag" :style="{ color: getSkillTags(skill).typeColor, borderColor: getSkillTags(skill).typeColor }">{{ getSkillTags(skill).type }}</text>
                      <text class="skill-tag" :style="{ color: getSkillTags(skill).rangeColor, borderColor: getSkillTags(skill).rangeColor }">{{ getSkillTags(skill).range }}</text>
                      <text class="skill-tag" :style="{ color: getSkillTags(skill).targetCountColor, borderColor: getSkillTags(skill).targetCountColor }">{{ getSkillTags(skill).targetCount }}</text>
                    </view>
                    <text class="skill-desc">{{ skill.description }}</text>
                  </view>
                  <view class="skill-info-right">
                    <view class="skill-info-row">
                      <text class="skill-info">消耗法力 {{ skill.mpCost }}</text>
                    </view>
                    <view v-if="skill.reikiCost" class="skill-info-row">
                      <text class="skill-info" style="color: #4ade80;">消耗阵营灵气 {{ skill.reikiCost }}</text>
                    </view>
                    <view v-if="skill.shaQiCost" class="skill-info-row">
                      <text class="skill-info" style="color: #9333ea;">消耗阵营煞气 {{ skill.shaQiCost }}</text>
                    </view>
                    <view class="skill-info-row">
                      <text class="skill-info">冷却 {{ skill.cooldown }} 回合</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="activeTab === 1" class="tab-content">
        <view class="building-list">
          <view v-for="(building, key) in BUILDING_CONFIG" :key="key" class="building-card">
            <image v-if="isBuildingIconUrl(building.icon)" class="building-image" :src="building.icon" mode="aspectFit" />
            <text v-else class="building-icon">{{ building.icon }}</text>
            <view class="building-info">
              <text class="building-name">{{ building.name }}</text>
              <text class="building-desc">{{ building.description }}</text>
              <view class="building-stats">
                <text class="stat-label">生命值：</text>
                <text class="stat-value">{{ building.maxHp }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="activeTab === 2" class="tab-content">
        <view class="sub-tab-bar">
          <view 
            v-for="type in ['all', ...equipmentTypes]" 
            :key="type" 
            class="sub-tab-item"
            :class="{ active: activeEquipmentType === type }"
            @click="activeEquipmentType = type"
          >
            {{ type === 'all' ? '全部' : getEquipmentTypeName(type) }}
          </view>
        </view>
        <view class="equipment-list">
          <view v-for="(items, type) in EQUIPMENT_CONFIG" :key="type" class="equipment-type" v-show="activeEquipmentType === 'all' || activeEquipmentType === type">
            <text class="equipment-type-title">{{ getEquipmentTypeName(type) }}</text>
            <view v-for="(item, index) in items" :key="index" class="equipment-card">
              <image class="equipment-icon" :src="item.icon" mode="aspectFit" />
              <view class="equipment-info">
                <text class="equipment-name">{{ item.name }}</text>
                <view class="equipment-tags">
                  <text class="equipment-tag" :class="getSetTagClass(item.setTag)">{{ item.setTag || '单件' }}</text>
                  <text class="equipment-tag" :style="{ color: getQualityColor(item.quality), borderColor: getQualityColor(item.quality) }">{{ item.quality || '凡物' }}</text>
                </view>
                <text class="equipment-desc">{{ item.description }}</text>
                <view class="equipment-stats">
                  <view v-for="(value, stat) in item.baseStats" :key="stat" class="stat-item-inline">
                    <text class="stat-label">{{ getStatName(stat) }}：</text>
                    <text class="stat-value">{{ value }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="activeTab === 3" class="tab-content">
        <view class="item-list">
          <view v-for="(item, index) in ITEM_CONFIG.consumable" :key="index" class="item-card">
            <image class="item-icon" :src="item.icon" mode="aspectFit" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-desc">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="activeTab === 4" class="tab-content">
        <view class="status-list">
          <view v-for="(status, key) in STATUS_CONFIG" :key="key" class="status-card">
            <text class="status-icon">{{ status.icon }}</text>
            <view class="status-info">
              <view class="status-name-row">
                <text class="status-name">{{ status.name }}</text>
                <text class="status-tag" :class="status.tag === 'positive' ? 'status-tag-positive' : 'status-tag-negative'">{{ status.tag === 'positive' ? '正面' : '负面' }}</text>
              </view>
              <text class="status-desc">{{ status.description }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="showAvatarPreview && avatarPreviewUrl"
      class="avatar-preview-mask"
      @click="closeAvatarPreview"
    >
      <image
        :src="avatarPreviewUrl"
        class="avatar-preview-image"
        mode="aspectFit"
        @click.stop="closeAvatarPreview"
      />
      <text class="avatar-preview-close">点击任意位置关闭</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FACTION_CONFIG,
  JOB_CONFIG,
  HIREABLE_CHARACTERS,
  INITIAL_CHARACTERS,
  CHARACTER_GROWTH,
  BUILDING_CONFIG,
  EQUIPMENT_CONFIG,
  ITEM_CONFIG,
  ATTRIBUTE_CONFIG,
  STATUS_CONFIG,
  getAvatarPath,
  getSkillTags,
  getRankColor,
  type Faction,
  type Character,
} from '../../utils/gameData'

const tabs = ['角色图鉴', '建筑图鉴', '装备图鉴', '道具图鉴', '状态图鉴']
const activeTab = ref(0)

const equipmentTypes = ['weapon', 'armor', 'helmet', 'shoes', 'accessory', 'book'] as const
const activeEquipmentType = ref<string>('all')
const showAvatarPreview = ref(false)
const avatarPreviewUrl = ref('')

const factionOrder: Faction[] = ['human', 'ghost', 'beast', 'immortal', 'god', 'demon']
const activeFaction = ref<Faction>('human')
const sortOrder = ref<'asc' | 'desc' | null>(null)

const allCharacters = computed(() => {
  return [...INITIAL_CHARACTERS, ...HIREABLE_CHARACTERS] as Character[]
})

const currentFactionCharacters = computed(() => {
  let chars = allCharacters.value.filter((char) => char.faction === activeFaction.value)
  if (sortOrder.value) {
    chars = [...chars].sort((a, b) => {
      const rankA = JOB_CONFIG[a.job]?.rank || 1
      const rankB = JOB_CONFIG[b.job]?.rank || 1
      return sortOrder.value === 'asc' ? rankA - rankB : rankB - rankA
    })
  }
  return chars
})

function goBack() {
  uni.navigateBack()
}

function openAvatarPreview(url: string | undefined) {
  if (!url) return
  avatarPreviewUrl.value = url
  showAvatarPreview.value = true
}

function closeAvatarPreview() {
  showAvatarPreview.value = false
  avatarPreviewUrl.value = ''
}

function getFactionName(factionKey: string): string {
  return FACTION_CONFIG[factionKey as Faction]?.name || ''
}

function getJobName(job: string): string {
  return JOB_CONFIG[job]?.name || job
}

function getCharGrowth(charId: string) {
  return CHARACTER_GROWTH[charId]
}

// 使用 gameData.ts 中的共享 getAvatarPath 函数

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

function getStatName(stat: string): string {
  const nameMap: Record<string, string> = {
    attack: '攻击',
    defense: '防御',
    hp: '生命',
    mp: '法力',
    moveRange: '移动',
    attackRange: '攻击范围',
  }
  return nameMap[stat] || stat
}

function getSetTagClass(setTag?: string): string {
  if (!setTag) return 'single-item'
  if (setTag === '精灵') return 'set-jingling'
  if (setTag === '巨兽') return 'set-jushou'
  return 'single-item'
}

function getQualityColor(quality?: string): string {
  if (!quality) return '#9ca3af'
  if (quality === '凡物') return '#9ca3af'
  if (quality === '法器') return '#4ade80'
  if (quality === '灵器') return '#60a5fa'
  if (quality === '古宝') return '#a855f7'
  if (quality === '仙器') return '#f87171'
  if (quality === '神器') return '#fbbf24'
  return '#9ca3af'
}

function isBuildingIconUrl(icon: string): boolean {
  if (!icon) return false
  return icon.startsWith('/static/') || icon.startsWith('http://') || icon.startsWith('https://')
}
</script>

<style>
.avatar-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  flex-direction: column;
}

.avatar-preview-image {
  width: 80vw;
  height: 80vw;
  max-width: 600rpx;
  max-height: 600rpx;
  border-radius: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.avatar-preview-close {
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #a0aec0;
}

.book-container {
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

.back-btn,
.placeholder {
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

.tab-bar {
  display: flex;
  padding: 0 32rpx;
  gap: 16rpx;
  margin-bottom: 16rpx;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.tab-item {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  text-align: center;
  color: #a0aec0;
  font-size: 26rpx;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.tab-item.active {
  background: rgba(100, 180, 150, 0.2);
  color: #fff;
  border-color: rgba(100, 180, 150, 0.5);
}

.content {
  flex: 1;
  padding: 0 32rpx 32rpx;
}

.tab-content {
  display: flex;
  flex-direction: column;
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
  min-width: calc(33.33% - 8rpx);
  max-width: calc(33.33% - 8rpx);
  padding: 12rpx 16rpx;
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

.sort-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.sort-label {
  font-size: 24rpx;
  color: #a0aec0;
}

.sort-btn {
  padding: 10rpx 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10rpx;
  color: #a0aec0;
  font-size: 22rpx;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.sort-btn.active {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.5);
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.character-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.char-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.char-emoji {
  font-size: 60rpx;
}

.name-attribute-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.char-name {
  font-size: 32rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.char-attribute {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  border: 2rpx solid;
  background: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
  font-weight: 600;
}

.job-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.char-job {
  font-size: 24rpx;
  color: #718096;
}

.char-rank {
  font-size: 20rpx;
  color: #60a5fa;
}

.stats-section,
.growth-section,
.skills-section {
  margin-bottom: 20rpx;
}

.stats-title {
  font-size: 24rpx;
  color: #a0aec0;
  margin-bottom: 12rpx;
}

.stats-grid,
.growth-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-item-inline {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #718096;
}

.stat-value {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 600;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  padding: 14rpx 16rpx;
  border-radius: 10rpx;
}

.skill-main {
  flex: 1;
  margin-right: 16rpx;
}

.skill-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.skill-name {
  font-size: 24rpx;
  color: #eaeaea;
  font-weight: 600;
}

.skill-info-right {
  flex-shrink: 0;
  text-align: right;
}

.skill-info-row {
  margin-bottom: 4rpx;
}

.skill-info {
  font-size: 18rpx;
  color: #60a5fa;
  display: block;
  white-space: nowrap;
}

.skill-attribute-tag {
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  border: 2rpx solid;
  background: rgba(255, 255, 255, 0.03);
}

.skill-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 4rpx;
}

.skill-tag {
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  
  &.attribute-tag {
    border-width: 2rpx;
  }
  
  &.type-tag {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.5);
  }
  
  &.range-tag {
    color: #60a5fa;
    border-color: rgba(96, 165, 250, 0.5);
  }
  
  &.target-tag {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.5);
  }
}

.skill-desc {
  font-size: 22rpx;
  color: #718096;
  line-height: 1.6;
}

.building-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.building-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.building-icon {
  font-size: 60rpx;
  flex-shrink: 0;
}

.building-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.building-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
  overflow: hidden;
}

.building-name {
  font-size: 28rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.building-desc {
  font-size: 22rpx;
  color: #718096;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.building-stats {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-top: 8rpx;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.equipment-type {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.equipment-type-title {
  font-size: 28rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.equipment-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.equipment-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.equipment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
  overflow: hidden;
}

.equipment-name {
  font-size: 26rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.equipment-tags {
  display: flex;
  gap: 8rpx;
}

.equipment-tag {
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

.equipment-desc {
  font-size: 20rpx;
  color: #718096;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.equipment-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 8rpx;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.item-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 16rpx;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
  overflow: hidden;
}

.item-name {
  font-size: 26rpx;
  color: #f5f5dc;
  font-weight: 600;
}

.item-desc {
  font-size: 20rpx;
  color: #718096;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.status-card {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.15), rgba(139, 69, 19, 0.05));
  border-radius: 16rpx;
  padding: 20rpx;
  border: 2rpx solid rgba(255, 215, 0, 0.15);
  display: flex;
  gap: 20rpx;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.status-icon {
  font-size: 48rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
  overflow: hidden;
}

.status-name {
  font-size: 28rpx;
  color: #ffd700;
  font-weight: 600;
}

.status-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.status-tag {
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 600;
}

.status-tag-positive {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.15);
  border: 2rpx solid rgba(74, 222, 128, 0.3);
}

.status-tag-negative {
  color: #f87171;
  background: rgba(248, 113, 113, 0.15);
  border: 2rpx solid rgba(248, 113, 113, 0.3);
}

.status-desc {
  font-size: 22rpx;
  color: #a0aec0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}
</style>
