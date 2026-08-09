<template>
  <view class="character-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">角色信息</text>
      <view class="gold-display">
        <text class="gold-icon">💰</text>
        <text class="gold-text">{{ gameStore.player?.gold }}</text>
      </view>
    </view>
    
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'my' }"
        @click="activeTab = 'my'; currentCharIndex = 0"
      >
        <text>我的角色</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'hire' }"
        @click="activeTab = 'hire'; currentCharIndex = 0"
      >
        <text>雇佣角色</text>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <template v-if="activeTab === 'my'">
        <view v-if="characters.length === 0" class="empty-state">
          <text class="empty-icon">👤</text>
          <text class="empty-text">暂无角色</text>
        </view>
        
        <view v-else class="character-detail">
          <view class="char-header">
          <view class="char-header-top">
            <view class="char-avatar" @click="openAvatarPreview(isAvatarUrl(currentCharacter?.avatar) ? currentCharacter?.avatar : '')">
              <image v-if="isAvatarUrl(currentCharacter?.avatar)" :src="currentCharacter?.avatar" class="avatar-image" mode="aspectFill" @click.stop="openAvatarPreview(currentCharacter?.avatar)"></image>
              <text v-else>{{ currentCharacter?.avatar }}</text>
            </view>
            <view class="char-basic">
              <view class="name-row">
                <input 
                  v-if="isEditingName" 
                  v-model="tempName" 
                  class="name-input" 
                  maxlength="6"
                  @blur="saveName"
                  confirm-type="done"
                  @confirm="saveName"
                />
                <text v-else class="char-name">{{ currentCharacter?.name }}</text>
                <view v-if="!isEditingName" class="edit-btn" @click="startEditName">
                  <text>✏️</text>
                </view>
                <view 
                  class="faction-tag" 
                  :style="{ background: FACTION_CONFIG[currentCharacter?.faction || 'human'].color }"
                >
                  {{ FACTION_CONFIG[currentCharacter?.faction || 'human'].name }}
                </view>
                <text 
                  class="attribute-tag"
                  :style="{ color: ATTRIBUTE_CONFIG[currentCharacter?.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[currentCharacter?.attribute || 'normal'].color }"
                >
                  {{ ATTRIBUTE_CONFIG[currentCharacter?.attribute || 'normal'].name }}
                </text>
              </view>
              <view class="job-level-row">
                <text class="char-job" :style="{ color: getRankColor(JOB_CONFIG[currentCharacter?.job || 'warrior']?.rank || 1) }">{{ JOB_CONFIG[currentCharacter?.job || 'warrior']?.name || currentCharacter?.job || '未知' }}</text>
                <text class="char-rank" :style="{ color: getRankColor(JOB_CONFIG[currentCharacter?.job || 'warrior']?.rank || 1) }">【{{ JOB_CONFIG[currentCharacter?.job || 'warrior']?.rank || 1 }}阶】</text>
                <text class="char-level">Lv.{{ currentCharacter?.level }}</text>
              </view>
              <view class="exp-row">
                <text class="exp-label">经验</text>
                <view class="exp-bar-container">
                  <view class="exp-bar" :style="{ width: currentCharacter ? (currentCharacter.exp / getExpRequired(currentCharacter.level) * 100) + '%' : '0%' }"></view>
                </view>
                <text class="exp-value">{{ currentCharacter?.exp }}/{{ currentCharacter ? getExpRequired(currentCharacter.level) : 0 }}</text>
              </view>
            </view>
          </view>
          <view class="nav-buttons">
            <view 
              class="nav-btn prev" 
              :class="{ disabled: currentCharIndex <= 0 }"
              @click="prevCharacter"
            >
              <text>‹</text>
            </view>
            <view class="char-indicator">
              <text>{{ currentCharIndex + 1 }} / {{ characters.length }}</text>
            </view>
            <view 
              class="nav-btn next" 
              :class="{ disabled: currentCharIndex >= characters.length - 1 }"
              @click="nextCharacter"
            >
              <text>›</text>
            </view>
          </view>
        </view>
          
          <view class="stats-section">
            <text class="section-title">属性</text>
            
            <view class="status-bars">
              <view class="status-item">
                <text class="status-icon">❤️</text>
                <view class="status-info">
                  <text class="status-label">生命</text>
                  <view class="bar-container">
                    <view class="hp-bar" :style="{ width: (currentCharacter?.hp || 0) / (currentTotalMaxHp || 1) * 100 + '%' }"></view>
                  </view>
                  <text class="status-value">{{ currentCharacter?.hp }}/{{ currentTotalMaxHp }}</text>
                </view>
              </view>
              <view class="status-item">
                <text class="status-icon">💙</text>
                <view class="status-info">
                  <text class="status-label">法力</text>
                  <view class="bar-container">
                    <view class="mp-bar" :style="{ width: (currentCharacter?.mp || 0) / (currentTotalMaxMp || 1) * 100 + '%' }"></view>
                  </view>
                  <text class="status-value">{{ currentCharacter?.mp }}/{{ currentTotalMaxMp }}</text>
                </view>
              </view>
            </view>
            
            <view class="stats-grid">
              <view class="stat-item">
                <text class="stat-icon">🗡️</text>
                <text class="stat-value">{{ currentTotalAttack }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">🛡️</text>
                <text class="stat-value">{{ currentTotalDefense }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">👟</text>
                <text class="stat-value">{{ currentTotalMoveRange }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">🎯</text>
                <text class="stat-value">{{ currentTotalAttackRange }}</text>
              </view>
            </view>
          </view>
          
          <view class="equipment-section">
            <text class="section-title">装备</text>
            <view class="equipment-slots">
              <view 
                v-for="(slot, key) in equipmentSlots" 
                :key="key" 
                class="equipment-slot"
                @click="handleEquipmentSlotClick(key)"
              >
                <template v-if="currentCharacter?.equipment[key]">
                  <image v-if="currentCharacter.equipment[key]?.icon.includes('.png')" :src="currentCharacter.equipment[key]?.icon" class="equip-slot-icon" mode="aspectFit"></image>
                  <text v-else class="slot-icon">{{ currentCharacter.equipment[key]?.icon || slot.icon }}</text>
                </template>
                <text v-else class="slot-icon">{{ slot.icon }}</text>
                <text class="slot-name">{{ slot.name }}</text>
                <template v-if="currentCharacter?.equipment[key]">
                  <text class="equip-name">
                    {{ currentCharacter?.equipment[key]?.name }}
                  </text>
                  <text class="equip-level">
                    {{ RARITY_CONFIG[currentCharacter?.equipment[key]?.rarity || 'common'].name }} {{ currentCharacter?.equipment[key]?.level }}级
                  </text>
                  <view class="equip-effects" v-if="currentCharacter?.equipment[key]">
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).attack" class="equip-effect">
                      攻+{{ getEquipmentStats(currentCharacter.equipment[key]!).attack }}
                    </text>
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).defense" class="equip-effect">
                      防+{{ getEquipmentStats(currentCharacter.equipment[key]!).defense }}
                    </text>
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).hp" class="equip-effect">
                      血+{{ getEquipmentStats(currentCharacter.equipment[key]!).hp }}
                    </text>
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).mp" class="equip-effect">
                      蓝+{{ getEquipmentStats(currentCharacter.equipment[key]!).mp }}
                    </text>
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).moveRange" class="equip-effect">
                      移+{{ getEquipmentStats(currentCharacter.equipment[key]!).moveRange }}
                    </text>
                    <text v-if="getEquipmentStats(currentCharacter.equipment[key]!).attackRange" class="equip-effect">
                      范+{{ getEquipmentStats(currentCharacter.equipment[key]!).attackRange }}
                    </text>
                  </view>
                </template>
                <text v-else class="empty-slot">空</text>
              </view>
            </view>
          </view>
          
          <view class="set-bonus-section">
            <text class="section-title">套装效果</text>
            <view class="set-bonus-list">
              <template v-if="setBonuses.length > 0">
                <view v-for="(bonus, index) in setBonuses" :key="index" class="set-bonus-item">
                  <text class="set-bonus-name">{{ bonus.setName }}{{ bonus.count }}件</text>
                  <view class="set-bonus-effects">
                    <text v-if="bonus.bonus.hp" class="set-bonus-effect">生命值+{{ bonus.bonus.hp }}</text>
                    <text v-if="bonus.bonus.mp" class="set-bonus-effect">法力值+{{ bonus.bonus.mp }}</text>
                    <text v-if="bonus.bonus.attack" class="set-bonus-effect">攻击力+{{ bonus.bonus.attack }}</text>
                    <text v-if="bonus.bonus.defense" class="set-bonus-effect">防御力+{{ bonus.bonus.defense }}</text>
                  </view>
                </view>
              </template>
              <text v-else class="set-bonus-empty">无</text>
            </view>
          </view>
          
          <!-- 装备选择弹窗 -->
          <view v-if="showEquipmentModal" class="equipment-modal-mask" @click="closeEquipmentModal">
            <view class="equipment-modal" @click.stop>
              <view class="equipment-modal-header">
                <text class="equipment-modal-title">选择装备</text>
                <view class="equipment-modal-close" @click="closeEquipmentModal">✕</view>
              </view>
              
              <view v-if="currentCharacter?.equipment[selectedSlot]" class="equipment-unequip-item" @click="unequipCurrent">
                <text class="unequip-text">卸下当前装备</text>
              </view>
              
              <scroll-view class="equipment-list" scroll-y>
                <view 
                  v-for="(item, index) in availableEquipments" 
                  :key="index"
                  class="equipment-card"
                  @click="equipItem(item)"
                >
                  <view class="equip-avatar" :style="{ borderColor: RARITY_CONFIG[item.rarity].color }">
                    <image v-if="item.icon.includes('.png')" :src="item.icon" class="equip-icon-image" mode="aspectFit"></image>
                    <text v-else class="equip-icon">{{ item.icon }}</text>
                  </view>
                  <view class="equip-info">
                    <view class="equip-name-row">
                      <text class="equip-name" :style="{ color: RARITY_CONFIG[item.rarity].color }">{{ item.name }}</text>
                      <text class="equip-subinfo">{{ RARITY_CONFIG[item.rarity].name }} {{ item.level }}级</text>
                      <text class="equip-count">×{{ item.count }}</text>
                    </view>
                    <view class="equip-effect-list">
                      <text v-if="getEquipmentStats(item).attack" class="equip-effect">攻击力+{{ getEquipmentStats(item).attack }}</text>
                      <text v-if="getEquipmentStats(item).defense" class="equip-effect">防御力+{{ getEquipmentStats(item).defense }}</text>
                      <text v-if="getEquipmentStats(item).hp" class="equip-effect">生命值+{{ getEquipmentStats(item).hp }}</text>
                      <text v-if="getEquipmentStats(item).mp" class="equip-effect">法力值+{{ getEquipmentStats(item).mp }}</text>
                      <text v-if="getEquipmentStats(item).moveRange" class="equip-effect">移动范围+{{ getEquipmentStats(item).moveRange }}</text>
                      <text v-if="getEquipmentStats(item).attackRange" class="equip-effect">攻击范围+{{ getEquipmentStats(item).attackRange }}</text>
                    </view>
                  </view>
                  <view class="equip-action">
                    <text class="equip-action-text">装备</text>
                  </view>
                </view>
                
                <view v-if="availableEquipments.length === 0" class="no-equipment">
                  <text>背包中没有可用的装备</text>
                </view>
              </scroll-view>
            </view>
          </view>
          
          <view class="skills-section">
            <text class="section-title">技能</text>
            <view class="skills-list">
              <view v-for="skill in currentCharacter?.skills" :key="skill.id" class="skill-item">
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
      </template>
      
      <template v-else>
        <view class="sub-tab-bar">
          <view
            v-for="faction in hireFactionOrder"
            :key="faction"
            class="sub-tab-item"
            :class="{ active: activeHireFaction === faction }"
            @click="activeHireFaction = faction"
          >
            <text>{{ FACTION_CONFIG[faction].icon }} {{ FACTION_CONFIG[faction].name }}({{ getFactionCharacterCount(faction) }})</text>
          </view>
        </view>

        <view class="sort-bar">
          <view class="sort-label">排序：</view>
          <view 
            class="sort-btn" 
            :class="{ active: hireSortType === 'rank' && hireSortOrder === 'asc' }"
            @click="handleSortClick('rank', 'asc')"
          >
            <text>位阶↑</text>
          </view>
          <view 
            class="sort-btn" 
            :class="{ active: hireSortType === 'rank' && hireSortOrder === 'desc' }"
            @click="handleSortClick('rank', 'desc')"
          >
            <text>位阶↓</text>
          </view>
          <view 
            class="sort-btn" 
            :class="{ active: hireSortType === 'price' && hireSortOrder === 'asc' }"
            @click="handleSortClick('price', 'asc')"
          >
            <text>价格↑</text>
          </view>
          <view 
            class="sort-btn" 
            :class="{ active: hireSortType === 'price' && hireSortOrder === 'desc' }"
            @click="handleSortClick('price', 'desc')"
          >
            <text>价格↓</text>
          </view>
        </view>

        <view v-if="currentHireCharacters.length === 0" class="empty-state">
          <text class="empty-icon">👤</text>
          <text class="empty-text">该种族暂无可雇佣角色</text>
        </view>

        <view class="character-list">
          <view v-for="char in currentHireCharacters" :key="char.id" class="character-card hire-character-card">
          <view class="hire-header">
            <view class="hire-avatar" @click="openAvatarPreview(getAvatarPath(char.id))">
              <image v-if="isAvatarUrl(getAvatarPath(char.id))" :src="getAvatarPath(char.id)" class="avatar-image" @click.stop="openAvatarPreview(getAvatarPath(char.id))"></image>
              <text v-else>{{ FACTION_CONFIG[char.faction].icon }}</text>
            </view>
            <view class="hire-info">
              <view class="hire-name-row">
                <text class="hire-name">{{ char.name }}</text>
                <view 
                  class="hire-faction-tag" 
                  :style="{ background: FACTION_CONFIG[char.faction].color }"
                >
                  {{ FACTION_CONFIG[char.faction].name }}
                </view>
                <text 
                  class="hire-attribute-tag"
                  :style="{ color: ATTRIBUTE_CONFIG[char.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[char.attribute || 'normal'].color }"
                >
                  {{ ATTRIBUTE_CONFIG[char.attribute || 'normal'].name }}
                </text>
              </view>
              <view class="hire-job-row">
                <text class="hire-job" :style="{ color: getRankColor(JOB_CONFIG[char.job]?.rank || 1) }">{{ JOB_CONFIG[char.job]?.name || char.job }}</text>
                <text class="hire-rank" :style="{ color: getRankColor(JOB_CONFIG[char.job]?.rank || 1) }">【{{ JOB_CONFIG[char.job]?.rank || 1 }}阶】</text>
              </view>
              <text class="hire-level">Lv.{{ char.level }}</text>
            </view>
            <view class="hire-cost">
              <text class="cost-icon">💰</text>
              <text class="cost-value">{{ getHireCost(char) }}</text>
            </view>
          </view>
          
          <view class="hire-stats">
            <view class="hire-stat">
              <text>❤️ {{ char.maxHp }}</text>
            </view>
            <view class="hire-stat">
              <text>💙 {{ char.maxMp }}</text>
            </view>
            <view class="hire-stat">
              <text>🗡️ {{ char.attack }}</text>
            </view>
            <view class="hire-stat">
              <text>🛡️ {{ char.defense }}</text>
            </view>
            <view class="hire-stat">
              <text>👟 {{ char.moveRange }}</text>
            </view>
            <view class="hire-stat">
              <text>🎯 {{ char.attackRange }}</text>
            </view>
          </view>
          
          <view class="hire-skills">
            <view v-for="skill in char.skills" :key="skill.id" class="hire-skill-item">
              <text
                class="hire-skill"
                :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }"
              >{{ skill.name }}</text>
              <view class="hire-skill-tags">
                <text
                  class="hire-skill-tag"
                  :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }"
                >{{ ATTRIBUTE_CONFIG[skill.attribute || 'normal'].name }}</text>
                <text class="hire-skill-tag" :style="{ color: getSkillTags(skill).typeColor, borderColor: getSkillTags(skill).typeColor }">{{ getSkillTags(skill).type }}</text>
                <text class="hire-skill-tag" :style="{ color: getSkillTags(skill).rangeColor, borderColor: getSkillTags(skill).rangeColor }">{{ getSkillTags(skill).range }}</text>
                <text class="hire-skill-tag" :style="{ color: getSkillTags(skill).targetCountColor, borderColor: getSkillTags(skill).targetCountColor }">{{ getSkillTags(skill).targetCount }}</text>
              </view>
            </view>
          </view>
          
          <view 
            class="hire-btn" 
            :class="{ disabled: (gameStore.player?.gold && gameStore.player?.gold < getHireCost(char)) || hasCharacter(char.id) }"
            @click="hireChar(char)"
          >
            <text>{{ hasCharacter(char.id) ? '已拥有' : '雇佣' }}</text>
          </view>
        </view>
        </view>
      </template>
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
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { FACTION_CONFIG, JOB_CONFIG, HIREABLE_CHARACTERS, getExpRequired, getEquipmentStats, RARITY_CONFIG, getAvatarPath, ATTRIBUTE_CONFIG, getSkillTags, calculateSetBonus, getRankColor, type Character, type Skill, type Item, type Equipment, type Faction } from '../../utils/gameData'

const gameStore = useGameStore()
const activeTab = ref<'my' | 'hire'>('my')
const currentCharIndex = ref(0)
const isEditingName = ref(false)
const tempName = ref('')
const showAvatarPreview = ref(false)
const avatarPreviewUrl = ref('')

// 雇佣角色种族分类
const hireFactionOrder: Faction[] = ['human', 'ghost', 'beast', 'immortal', 'god', 'demon']
const activeHireFaction = ref<Faction>('human')
const hireSortType = ref<'rank' | 'price' | null>(null)
const hireSortOrder = ref<'asc' | 'desc' | null>(null)

function handleSortClick(type: 'rank' | 'price', order: 'asc' | 'desc') {
  if (hireSortType.value === type && hireSortOrder.value === order) {
    hireSortType.value = null
    hireSortOrder.value = null
  } else {
    hireSortType.value = type
    hireSortOrder.value = order
  }
}

const currentHireCharacters = computed(() => {
  let chars = HIREABLE_CHARACTERS.filter((char) => char.faction === activeHireFaction.value)
  if (hireSortType.value && hireSortOrder.value) {
    chars = [...chars].sort((a, b) => {
      if (hireSortType.value === 'rank') {
        const rankA = JOB_CONFIG[a.job]?.rank || 1
        const rankB = JOB_CONFIG[b.job]?.rank || 1
        return hireSortOrder.value === 'asc' ? rankA - rankB : rankB - rankA
      } else if (hireSortType.value === 'price') {
        const priceA = getHireCost(a)
        const priceB = getHireCost(b)
        return hireSortOrder.value === 'asc' ? priceA - priceB : priceB - priceA
      }
      return 0
    })
  }
  return chars
})

function getFactionCharacterCount(faction: Faction): number {
  return HIREABLE_CHARACTERS.filter((char) => char.faction === faction).length
}

const equipmentSlots = {
  weapon: { name: '武器', icon: '🗡️' },
  armor: { name: '防具', icon: '🛡️' },
  helmet: { name: '头盔', icon: '⛑️' },
  shoes: { name: '鞋子', icon: '👟' },
  accessory: { name: '饰品', icon: '💍' },
  book: { name: '书籍', icon: '📚' },
}

const characters = computed(() => gameStore.player?.characters || [])

const currentCharacter = computed(() => characters.value[currentCharIndex.value])

// 计算当前查看角色的装备加成后总属性
// 辅助函数：遍历所有装备槽，累加指定属性
function sumEquipmentStat(statKey: 'attack' | 'defense' | 'hp' | 'mp'): number {
  if (!currentCharacter.value) return 0
  let sum = 0
  const slots = ['weapon', 'armor', 'helmet', 'shoes', 'accessory', 'book'] as const
  for (const slot of slots) {
    const item = currentCharacter.value.equipment[slot]
    if (item) {
      const stats = getEquipmentStats(item)
      if (stats && stats[statKey]) sum += stats[statKey]
    }
  }
  return sum
}

const currentTotalAttack = computed(() => currentCharacter.value?.attack || 0)

const currentTotalDefense = computed(() => currentCharacter.value?.defense || 0)

const currentTotalMaxHp = computed(() => currentCharacter.value?.maxHp || 0)

const currentTotalMaxMp = computed(() => currentCharacter.value?.maxMp || 0)

const currentTotalMoveRange = computed(() => currentCharacter.value?.moveRange || 0)

const currentTotalAttackRange = computed(() => currentCharacter.value?.attackRange || 0)

const setBonuses = computed(() => {
  if (!currentCharacter.value) return []
  return calculateSetBonus(currentCharacter.value.equipment)
})

function isAvatarUrl(avatar: string | undefined): boolean {
  if (!avatar) return false
  return avatar.startsWith('/static/') || avatar.startsWith('http://') || avatar.startsWith('https://')
}

// 使用 gameData.ts 中的共享 getAvatarPath 函数，此处已通过 import 引入

function getHireCost(char: typeof HIREABLE_CHARACTERS[0]): number {
  return char.maxHp + char.maxMp + 5 * char.attack + 5 * char.defense + 50 * char.moveRange + 50 * char.attackRange
}

// 装备选择相关
const showEquipmentModal = ref(false)
const selectedSlot = ref<keyof Equipment>('weapon')

const availableEquipments = computed(() => {
  if (!gameStore.player || !selectedSlot.value) return []
  return gameStore.player.inventory.filter(item => {
    if (item.type !== 'equipment') return false
    if (selectedSlot.value === 'weapon' && item.subtype === 'weapon') return true
    if (selectedSlot.value === 'armor' && item.subtype === 'armor') return true
    if (selectedSlot.value === 'helmet' && item.subtype === 'helmet') return true
    if (selectedSlot.value === 'shoes' && item.subtype === 'shoes') return true
    if (selectedSlot.value === 'accessory' && item.subtype === 'accessory') return true
    return false
  })
})

watch(currentCharacter, () => {
  isEditingName.value = false
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

function prevCharacter() {
  if (currentCharIndex.value > 0) {
    currentCharIndex.value--
  }
}

function nextCharacter() {
  if (currentCharIndex.value < characters.value.length - 1) {
    currentCharIndex.value++
  }
}

function startEditName() {
  if (!currentCharacter.value) return
  tempName.value = currentCharacter.value.name
  isEditingName.value = true
}

async function saveName() {
  if (!currentCharacter.value || !tempName.value.trim()) {
    isEditingName.value = false
    return
  }
  
  const character = gameStore.player?.characters.find(c => c.id === currentCharacter.value?.id)
  if (character) {
    character.name = tempName.value.trim()
    await gameStore.saveGame()
  }
  isEditingName.value = false
}

function handleEquipmentSlotClick(key: string) {
  if (!currentCharacter.value) return
  selectedSlot.value = key as keyof Equipment
  showEquipmentModal.value = true
}

function closeEquipmentModal() {
  showEquipmentModal.value = false
}

async function unequipCurrent() {
  if (!currentCharacter.value) return
  const equipment = currentCharacter.value.equipment[selectedSlot.value]
  if (equipment) {
    await gameStore.unequipItem(currentCharacter.value.id, selectedSlot.value)
    uni.showToast({ title: `卸下${equipment.name}`, icon: 'none' })
    closeEquipmentModal()
  }
}

async function equipItem(item: Item) {
  if (!currentCharacter.value) return
  await gameStore.equipItem(currentCharacter.value.id, item.id)
  uni.showToast({ title: `装备${item.name}`, icon: 'success' })
  closeEquipmentModal()
}

function hasCharacter(charId: string): boolean {
  return gameStore.player?.characters.some(c => c.id === charId) || false
}

async function hireChar(char: typeof HIREABLE_CHARACTERS[0]) {
  const success = await gameStore.hireCharacter(char)
  if (success) {
    uni.showToast({ title: `成功雇佣${char.name}`, icon: 'success' })
    if (activeTab.value === 'my') {
      currentCharIndex.value = characters.value.length - 1
    }
  } else {
    if (hasCharacter(char.id)) {
      uni.showToast({ title: '已拥有该角色', icon: 'none' })
    } else {
      uni.showToast({ title: '金币不足', icon: 'none' })
    }
  }
}
</script>

<style lang="scss">
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

.character-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
}

.equipment-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.equipment-modal {
  width: 85%;
  max-height: 70vh;
  background: linear-gradient(180deg, #2d2d44 0%, #1a1a2e 100%);
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.equipment-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.equipment-modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #eaeaea;
}

.equipment-modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #718096;
}

.equipment-list {
  flex: 1;
  max-height: 50vh;
  overflow-y: auto;
}

.equipment-option {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s;

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }

  &.unequip {
    background: rgba(239, 68, 68, 0.1);
    border-bottom: 1rpx solid rgba(239, 68, 68, 0.2);
    justify-content: center;
  }
}

.equipment-option-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.equipment-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.equipment-option-name {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 500;
}

.equipment-option-desc {
  font-size: 22rpx;
  color: #718096;
  margin-top: 8rpx;
}

.equipment-option-text {
  font-size: 28rpx;
  color: #ef4444;
}

.no-equipment {
  padding: 60rpx 32rpx;
  text-align: center;
  color: #718096;
  font-size: 24rpx;
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
  padding: 0 32rpx 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
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

.character-detail {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  margin: 0 0 24rpx 0;
  width: 100%;
  box-sizing: border-box;
}

.char-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.char-header-top {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.char-avatar {
  font-size: 80rpx;
  line-height: 1;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.char-basic {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: nowrap;
  overflow: hidden;
}

.name-input {
  font-size: 36rpx;
  color: #eaeaea;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.char-name {
  font-size: 36rpx;
  color: #eaeaea;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.edit-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  font-size: 24rpx;
}

.faction-tag {
  font-size: 20rpx;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}

.attribute-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  border: 2rpx solid;
  background: rgba(255, 255, 255, 0.03);
}

.job-level-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.char-job {
  font-size: 26rpx;
  color: #a0aec0;
}

.char-rank {
  font-size: 22rpx;
  color: #60a5fa;
  margin: 0 8rpx;
}

.char-level {
  font-size: 24rpx;
  color: #fbbf24;
}

.exp-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.exp-label {
  font-size: 24rpx;
  color: #a0aec0;
}

.exp-bar-container {
  flex: 1;
  height: 12rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.exp-value {
  font-size: 22rpx;
  color: #a0aec0;
  min-width: 100rpx;
  text-align: right;
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 16rpx;
  width: 100%;
}

.nav-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 32rpx;
  color: #eaeaea;
  transition: all 0.3s;
  
  &:active:not(.disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  
  &.prev {
    padding-left: 4rpx;
  }
  
  &.next {
    padding-right: 4rpx;
  }
}

.char-indicator {
  font-size: 22rpx;
  color: #a0aec0;
  min-width: 70rpx;
  text-align: center;
}

.section-title {
  font-size: 30rpx;
  color: #eaeaea;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.stats-section {
  margin-bottom: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.status-bars {
  margin-bottom: 20rpx;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.status-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.status-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.status-label {
  font-size: 24rpx;
  color: #a0aec0;
  width: 60rpx;
}

.bar-container {
  width: 200rpx;
  height: 14rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 7rpx;
  overflow: hidden;
  margin: 0 12rpx;
}

.hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 7rpx;
}

.mp-bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  border-radius: 7rpx;
}

.status-value {
  font-size: 24rpx;
  color: #eaeaea;
  width: 100rpx;
  text-align: right;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 8rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10rpx;
}

.stat-icon {
  font-size: 32rpx;
}

.stat-value {
  font-size: 28rpx;
  color: #eaeaea;
  margin-top: 6rpx;
  font-weight: 600;
}

.equipment-section {
  margin-bottom: 28rpx;
  padding-top: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.set-bonus-section {
  margin-bottom: 28rpx;
  padding-top: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.set-bonus-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.set-bonus-item {
  display: flex;
  flex-direction: column;
  padding: 16rpx 20rpx;
  background: rgba(251, 191, 36, 0.08);
  border-radius: 12rpx;
  border: 2rpx solid rgba(251, 191, 36, 0.2);
}

.set-bonus-name {
  font-size: 26rpx;
  color: #fbbf24;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.set-bonus-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.set-bonus-effect {
  font-size: 22rpx;
  color: #a78bfa;
}

.set-bonus-empty {
  font-size: 24rpx;
  color: #718096;
  padding: 20rpx;
  text-align: center;
}

.equipment-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  width: 100%;
  box-sizing: border-box;
}

.equipment-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 8rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10rpx;
  transition: all 0.3s;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.slot-icon {
  font-size: 28rpx;
}

.equip-slot-icon {
  width: 32rpx;
  height: 32rpx;
}

.equipment-option-image {
  width: 40rpx;
  height: 40rpx;
}

.equipment-unequip-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(239, 68, 68, 0.1);
  border-bottom: 1rpx solid rgba(239, 68, 68, 0.2);
}

.unequip-text {
  font-size: 28rpx;
  color: #ef4444;
}

.equipment-card {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s;
  
  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
}

.equip-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  border: 2rpx solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
}

.equip-icon {
  font-size: 40rpx;
}

.equip-icon-image {
  width: 50rpx;
  height: 50rpx;
}

.equip-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 16rpx;
}

.equip-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.equip-name {
  font-size: 28rpx;
  font-weight: 600;
}

.equip-subinfo {
  font-size: 22rpx;
  color: #a0aec0;
}

.equip-count {
  font-size: 20rpx;
  color: #718096;
}

.equip-effect-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  margin-top: 8rpx;
}

.equip-effect {
  font-size: 20rpx;
  color: #4ade80;
}

.equip-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-radius: 8rpx;
  flex-shrink: 0;
}

.equip-action-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.slot-name {
  font-size: 18rpx;
  color: #718096;
  margin-top: 4rpx;
}

.equip-name {
  font-size: 18rpx;
  color: #eaeaea;
  margin-top: 4rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.equip-level {
  font-size: 14rpx;
  color: #fbbf24;
  margin-top: 2rpx;
  text-align: center;
}

.equip-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 4rpx;
  margin-top: 4rpx;
  justify-content: center;
}

.equip-effect {
  font-size: 12rpx;
  color: #4ade80;
  padding: 2rpx 6rpx;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 4rpx;
}

.empty-slot {
  font-size: 18rpx;
  color: #4a5568;
  margin-top: 4rpx;
}

.skills-section {
  padding-top: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  width: 100%;
  box-sizing: border-box;
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

.hire-skill-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 4rpx;
}

.hire-skill-tag {
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
  font-size: 20rpx;
  color: #a0aec0;
  margin-top: 4rpx;
  display: block;
  line-height: 1.4;
}

.skill-info-right {
  flex-shrink: 0;
  margin-left: 16rpx;
  text-align: right;
}

.skill-info {
  font-size: 18rpx;
  color: #60a5fa;
  display: block;
  white-space: nowrap;
}

.hire-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.hire-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.hire-avatar {
  font-size: 64rpx;
  line-height: 1;
}

.hire-info {
  flex: 1;
  margin-left: 16rpx;
}

.hire-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hire-name {
  font-size: 30rpx;
  color: #eaeaea;
  font-weight: 600;
}

.hire-faction-tag {
  font-size: 18rpx;
  color: #fff;
  padding: 3rpx 10rpx;
  border-radius: 7rpx;
}

.hire-attribute-tag {
  font-size: 18rpx;
  padding: 3rpx 10rpx;
  border-radius: 7rpx;
  border: 2rpx solid;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.03);
}

.hire-job-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 4rpx;
}

.hire-job {
  font-size: 22rpx;
  color: #a0aec0;
}

.hire-rank {
  font-size: 18rpx;
  color: #60a5fa;
}

.hire-level {
  font-size: 20rpx;
  color: #fbbf24;
  margin-top: 4rpx;
}

.hire-cost {
  display: flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.1);
  padding: 10rpx 14rpx;
  border-radius: 10rpx;
}

.cost-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.cost-value {
  font-size: 24rpx;
  color: #ffd700;
  font-weight: 600;
}

.hire-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.hire-stat {
  font-size: 22rpx;
  color: #a0aec0;
  background: rgba(255, 255, 255, 0.03);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
}

.hire-skills {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.hire-skill-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hire-skill {
  font-size: 20rpx;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
}

.hire-skill-attribute {
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  border: 2rpx solid;
  background: rgba(255, 255, 255, 0.03);
}

.hire-btn {
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  
  &:active {
    opacity: 0.9;
  }
  
  &.disabled {
    background: rgba(74, 74, 74, 0.5);
    pointer-events: none;
  }
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

.hire-character-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}
</style>
