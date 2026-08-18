<template>
  <view class="battle-container">
    <view class="battle-header">
      <view class="turn-info">
        <text class="turn-label">回合</text>
        <text class="turn-number">{{ gameStore.battleMap?.turn }}</text>
      </view>
      <view class="weather-info">
        <text class="weather-icon">{{ weatherIcon }}</text>
        <text class="weather-text">{{ weatherText }}</text>
      </view>
      <view class="phase-badge" :class="gameStore.battleMap?.battlePhase">
        {{ gameStore.battleMap?.battlePhase === 'player' ? '玩家回合' : '敌方回合' }}
      </view>
      <view class="escape-btn" @click="escapeBattle">
        <text>逃离</text>
      </view>
    </view>
    
    <view class="reiki-shaqi-bar">
      <view class="faction-resource enemy-resource">
        <text class="faction-label">敌方</text>
        <view class="resource-item reiki">
          <text class="resource-icon reiki-icon">🔵</text>
          <view class="resource-bar-container">
            <view class="resource-bar-fill reiki-fill" :style="{ width: (gameStore.battleMap?.enemyReiki || 0) + '%' }"></view>
          </view>
          <text class="resource-text">{{ gameStore.battleMap?.enemyReiki || 0 }}/100</text>
          <text class="bonus-text">🛡️+{{ getReikiDefenseBonus(gameStore.battleMap?.enemyReiki || 0) }}%</text>
        </view>
        <view class="resource-item shaqi">
          <text class="resource-icon shaqi-icon">💀</text>
          <view class="resource-bar-container">
            <view class="resource-bar-fill shaqi-fill" :style="{ width: (gameStore.battleMap?.enemyShaQi || 0) + '%' }"></view>
          </view>
          <text class="resource-text">{{ gameStore.battleMap?.enemyShaQi || 0 }}/100</text>
          <text class="bonus-text">🗡️+{{ getShaQiAttackBonus(gameStore.battleMap?.enemyShaQi || 0) }}%</text>
        </view>
      </view>
      <view class="faction-resource player-resource">
        <text class="faction-label">我方</text>
        <view class="resource-item reiki">
          <text class="bonus-text">🛡️+{{ getReikiDefenseBonus(gameStore.battleMap?.playerReiki || 0) }}%</text>
          <text class="resource-text">{{ gameStore.battleMap?.playerReiki || 0 }}/100</text>
          <view class="resource-bar-container">
            <view class="resource-bar-fill reiki-fill" :style="{ width: (gameStore.battleMap?.playerReiki || 0) + '%' }"></view>
          </view>
          <text class="resource-icon reiki-icon">🔵</text>
        </view>
        <view class="resource-item shaqi">
          <text class="bonus-text">🗡️+{{ getShaQiAttackBonus(gameStore.battleMap?.playerShaQi || 0) }}%</text>
          <text class="resource-text">{{ gameStore.battleMap?.playerShaQi || 0 }}/100</text>
          <view class="resource-bar-container">
            <view class="resource-bar-fill shaqi-fill" :style="{ width: (gameStore.battleMap?.playerShaQi || 0) + '%' }"></view>
          </view>
          <text class="resource-icon shaqi-icon">💀</text>
        </view>
      </view>
    </view>
    
    <scroll-view class="battle-scroll" scroll-x scroll-y>
      <view class="battle-map-container">
        <view class="battle-map" :style="mapStyle">
          <view 
            v-for="(row, rowIndex) in gameStore.battleMap?.tiles" 
            :key="rowIndex"
            class="battle-row"
          >
            <view 
              v-for="(tile, colIndex) in row" 
              :key="colIndex"
              class="battle-cell"
              :class="getCellClass(tile, rowIndex, colIndex)"
              @click="handleCellClick(rowIndex, colIndex)"
            >
              <!-- 雪地特效 -->
              <view v-if="gameStore.isSnowArea(rowIndex, colIndex)" class="snow-overlay">
                <text class="snow-icon">❄️</text>
              </view>
              
              <!-- 火焰特效（山火/天火） -->
              <view v-if="gameStore.isFireArea(rowIndex, colIndex)" class="fire-overlay">
                <text class="fire-icon">🔥</text>
              </view>
              
              <!-- 迷雾特效 - 圆形云团 -->
              <view v-if="gameStore.isFogArea(rowIndex, colIndex)" class="fog-overlay">
                <view class="fog-cloud">
                  <view class="cloud-puff puff1"></view>
                  <view class="cloud-puff puff2"></view>
                  <view class="cloud-puff puff3"></view>
                  <view class="cloud-puff puff4"></view>
                </view>
              </view>
              
              <!-- 地形 -->
              <text v-if="tile.terrain === 'river'" class="terrain-icon">🌊</text>
              <text v-else-if="tile.terrain === 'obstacle'" class="terrain-icon">⛰️</text>
              
              <!-- 建筑物 -->
              <view 
                v-if="getBuildingAt(rowIndex, colIndex)" 
                class="building-marker"
                :class="{ 'shaking': isShaking(rowIndex, colIndex, 'building') }"
              >
                <image 
                  v-if="isBuildingIconUrl(getBuildingAt(rowIndex, colIndex)!.icon)" 
                  :src="getBuildingAt(rowIndex, colIndex)!.icon" 
                  class="building-image" 
                  mode="aspectFill"
                ></image>
                <text 
                  v-else 
                  class="building-emoji"
                >{{ getBuildingAt(rowIndex, colIndex)!.icon }}</text>
                <view class="building-hp-indicator">
                  <view 
                    class="building-hp-mini-fill" 
                    :class="getBuildingAt(rowIndex, colIndex)!.isPlayer ? 'player-building-hp' : 'enemy-building-hp'"
                    :style="{ width: (getBuildingAt(rowIndex, colIndex)!.hp / getBuildingAt(rowIndex, colIndex)!.maxHp * 100) + '%' }"
                  ></view>
                </view>
              </view>
              
              <!-- 灵草灵药 -->
              <view v-if="getCollectibleAt(rowIndex, colIndex)" class="collectible-marker">
                <image 
                  v-if="isCollectibleIconUrl(getCollectibleAt(rowIndex, colIndex)!.icon)"
                  :src="getCollectibleAt(rowIndex, colIndex)!.icon" 
                  class="collectible-image" 
                  mode="aspectFit"
                ></image>
                <text 
                  v-else 
                  class="collectible-emoji"
                >{{ getCollectibleAt(rowIndex, colIndex)!.icon }}</text>
              </view>
              
              <!-- 角色 -->
              <view 
                v-if="getCharacterAt(rowIndex, colIndex)" 
                class="character-marker"
                :class="{ 
                  'shaking': isShaking(rowIndex, colIndex, 'character'),
                  'highlighted': isCharacterHighlighted(getCharacterAt(rowIndex, colIndex)!),
                  'hit-flashing': isHitFlashing(rowIndex, colIndex),
                  'defeated-kill': isDefeated(rowIndex, colIndex, 'kill'),
                  'defeated-self': isDefeated(rowIndex, colIndex, 'self')
                }"
              >
                <image 
                  v-if="isCharacterAvatarUrl(getCharacterAt(rowIndex, colIndex)!.characterId)" 
                  :src="getCharacterAvatar(getCharacterAt(rowIndex, colIndex)!.characterId)" 
                  class="char-avatar-image" 
                  :class="`rank-${getCharacterRank(getCharacterAt(rowIndex, colIndex)!.characterId)}`"
                  mode="aspectFill"
                ></image>
                <text 
                  v-else 
                  class="char-emoji"
                >{{ getCharacterEmoji(getCharacterAt(rowIndex, colIndex)!.characterId) }}</text>
                <view class="hp-indicator" :class="{ 'hp-flashing': isHitFlashing(rowIndex, colIndex) }">
                  <view 
                    class="hp-mini-fill" 
                    :class="[
                      getCharacterAt(rowIndex, colIndex)!.isPlayer ? 'player-hp' : 'enemy-hp',
                      { 'hp-critical': isHitFlashing(rowIndex, colIndex) }
                    ]"
                    :style="{ 
                      width: (getCharacterAt(rowIndex, colIndex)!.hp / getCharacterMaxHp(getCharacterAt(rowIndex, colIndex)!) * 100) + '%',
                      '--hp-width': (getCharacterAt(rowIndex, colIndex)!.hp / getCharacterMaxHp(getCharacterAt(rowIndex, colIndex)!) * 100) + '%'
                    }"
                  ></view>
                  <view class="hp-shockwave" v-if="isHitFlashing(rowIndex, colIndex)"></view>
                </view>
                <!-- 状态图标 -->
                <view v-if="getCharacterAt(rowIndex, colIndex)!.statuses && getCharacterAt(rowIndex, colIndex)!.statuses.length > 0" class="status-icons">
                  <text v-for="statusType in getCharacterAt(rowIndex, colIndex)!.statuses" :key="statusType" class="status-icon">{{ getStatusIcon(statusType) }}</text>
                </view>
              </view>
              
              <!-- 集结点标记 -->
              <view v-if="gameStore.gatheringPoints.some(p => p.row === rowIndex && p.col === colIndex)" class="gather-point-marker">
                <text class="gather-point-icon">📍</text>
              </view>
              
              <!-- 天启炮瞄准标记 -->
              <view v-if="isTargetedByTianqiPao(rowIndex, colIndex)" class="targeted-marker">
                <text class="targeted-icon">🎯</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 技能光效层 -->
        <view class="skill-effects-layer">
          <view 
            v-for="effect in gameStore.skillEffects" 
            :key="effect.id"
            class="skill-effect"
            :class="[
              effect.size, 
              `attr-${effect.attribute}`, 
              `type-${effect.skillType}`,
              effect.category ? `cat-${effect.category}` : ''
            ]"
            :style="{
              left: (effect.col * 64 + 46) + 'rpx',
              top: (effect.row * 64 + 46) + 'rpx'
            }"
          >
            <!-- 基础光晕 -->
            <view class="effect-base" :style="{ backgroundColor: effect.color }"></view>
            
            <!-- 属性专属核心特效 -->
            <view class="effect-core" :class="`core-${effect.attribute}`"></view>
            
            <!-- 属性专属图标（仅非AOE/陷阵类显示以减少DOM） -->
            <text v-if="effect.category !== 'aoe' && effect.category !== '陷阵' && effect.category !== '轰炸'" class="effect-icon" :class="`icon-${effect.attribute}`">{{ getAttributeIcon(effect.attribute) }}</text>
            
            <!-- 粒子特效（AOE/陷阵类减少粒子数量显示） -->
            <view 
              v-for="(particle, idx) in effect.particles" 
              :key="idx"
              class="effect-particle"
              :style="{
                '--particle-x': particle.x + 'rpx',
                '--particle-y': particle.y + 'rpx',
                '--particle-delay': particle.delay + 's',
                '--particle-color': effect.color
              }"
            ></view>
            
            <!-- 技能类型光环 -->
            <view class="effect-ring" :class="`ring-${effect.skillType}`" :style="{ borderColor: effect.color }"></view>
            
            <!-- 二次扩散波纹（仅指定/非AOE类显示） -->
            <view v-if="effect.category !== 'aoe' && effect.category !== '陷阵'" class="effect-wave" :style="{ borderColor: effect.color }"></view>
            
            <!-- 指定技能：目标锁定框 -->
            <view v-if="effect.category === '指定'" class="effect-target-frame" :style="{ borderColor: effect.color }"></view>
            
            <!-- AOE技能：中心爆炸环 -->
            <view v-if="effect.category === 'aoe'" class="effect-aoe-ring" :style="{ borderColor: effect.color }"></view>
            
            <!-- 横扫/直线技能：方向指示 -->
            <view v-if="effect.category === '横扫' || effect.category === '直线'" class="effect-direction-indicator" :class="effect.direction" :style="{ borderColor: effect.color }"></view>
            
            <!-- 轰炸技能：随机火花 -->
            <view v-if="effect.category === '轰炸'" class="effect-bomb-spark" :style="{ backgroundColor: effect.color }"></view>
            
            <!-- 陷阵技能：瞬移光环 -->
            <view v-if="effect.category === '陷阵'" class="effect-xianzhen-ring" :style="{ borderColor: effect.color }"></view>
          </view>
        </view>
        
        <!-- 飘字特效层 -->
        <view class="floating-texts-layer">
          <view 
            v-for="text in gameStore.floatingTexts" 
            :key="text.id"
            class="floating-text"
            :class="[
              text.type,
              { 'shaking': text.isShaking },
              text.attribute ? `attr-${text.attribute}` : ''
            ]"
            :style="{
              left: (text.col * 64 + 30) + 'rpx',
              top: (text.row * 64) + 'rpx'
            }"
          >
            <text v-if="text.type === 'heal'" class="heal-icon">❤</text>
            {{ text.sign || (text.type === 'damage' ? '-' : '+' ) }}{{ text.value }}
          </view>
        </view>
        
        <!-- 投射物动画层 -->
        <view class="projectiles-layer">
          <view 
            v-for="proj in gameStore.projectiles" 
            :key="proj.id"
            class="projectile"
            :class="`proj-${proj.type}`"
            :style="{
              '--proj-from-row': proj.fromRow,
              '--proj-from-col': proj.fromCol,
              '--proj-to-row': proj.toRow,
              '--proj-to-col': proj.toCol,
              '--proj-color': proj.color,
              '--proj-duration': proj.duration + 'ms'
            }"
          >
            <view class="projectile-body"></view>
            <view class="projectile-trail"></view>
          </view>
        </view>
        
        <!-- 受击粒子飞溅特效层 -->
        <view class="hit-sparks-layer">
          <view 
            v-for="spark in gameStore.hitSparkEffects" 
            :key="spark.id"
            class="hit-spark"
            :class="`attr-${spark.attribute}`"
            :style="{
              left: (spark.col * 64 + 32) + 'rpx',
              top: (spark.row * 64 + 32) + 'rpx'
            }"
          >
            <view 
              v-for="(particle, idx) in spark.particles" 
              :key="idx"
              class="spark-particle"
              :style="{
                '--dx': particle.dx + 'rpx',
                '--dy': particle.dy + 'rpx',
                '--size': particle.size + 'rpx',
                '--delay': particle.delay + 's'
              }"
            ></view>
          </view>
        </view>
        
        <!-- 状态施加视觉反馈层 -->
        <view class="status-apply-layer">
          <view 
            v-for="effect in gameStore.statusApplyEffects" 
            :key="effect.id"
            class="status-apply-effect"
            :class="[
              effect.isPositive ? 'status-positive' : 'status-negative',
              `status-${effect.statusType}`
            ]"
            :style="{
              left: (effect.col * 64 + 32) + 'rpx',
              top: (effect.row * 64 + 32) + 'rpx'
            }"
          >
            <view class="status-apply-ring"></view>
            <text class="status-apply-icon">{{ getStatusIcon(effect.statusType) }}</text>
          </view>
        </view>
        
        <!-- 召唤出场特效层 -->
        <view class="summon-effects-layer">
          <view 
            v-for="effect in gameStore.summonEffects" 
            :key="effect.id"
            class="summon-effect"
            :class="`summon-attr-${effect.attribute}`"
            :style="{
              left: (effect.col * 64 + 16 + 60 / 2) + 'rpx',
              top: (effect.row * 64 + 16 + 60 / 2) + 'rpx'
            }"
          >
            <!-- 光柱 -->
            <view class="summon-pillar"></view>
            <!-- 地面法阵 -->
            <view class="summon-circle"></view>
            <!-- 扩散光环 -->
            <view class="summon-ring"></view>
            <!-- 粒子上升 -->
            <view class="summon-particle summon-particle-1"></view>
            <view class="summon-particle summon-particle-2"></view>
            <view class="summon-particle summon-particle-3"></view>
            <view class="summon-particle summon-particle-4"></view>
          </view>
        </view>
        
        <!-- 移动轨迹粒子层 -->
        <view class="move-trail-layer">
          <template v-for="trail in gameStore.moveTrailEffects" :key="trail.id">
            <view 
              v-for="(particle, idx) in trail.particles" 
              :key="trail.id + '_' + idx"
              class="move-trail-particle"
              :class="trail.isPlayer ? 'trail-player' : 'trail-enemy'"
              :style="{
                left: (particle.col * 64 + 16 + 60 / 2) + 'rpx',
                top: (particle.row * 64 + 16 + 60 / 2) + 'rpx',
                animationDelay: particle.delay + 's'
              }"
            ></view>
          </template>
        </view>
        
        <!-- 元素粒子尾迹层（直线/横扫技能路径上的元素粒子） -->
        <view class="trail-particles-layer">
          <view 
            v-for="p in gameStore.trailParticles" 
            :key="p.id"
            class="trail-particle"
            :class="[p.size, `attr-${p.attribute}`]"
            :style="{
              left: (p.col * 64 + 46) + 'rpx',
              top: (p.row * 64 + 46) + 'rpx',
              '--trail-color': p.color
            }"
          >
            <view class="trail-core"></view>
            <view class="trail-glow"></view>
          </view>
        </view>
        
        <!-- 技能蓄力特效层（选择目标时角色头顶/身上的蓄力光效） -->
        <view class="charge-effects-layer">
          <view 
            v-for="c in gameStore.chargeEffects" 
            :key="c.id"
            class="charge-effect"
            :class="`attr-${c.attribute}`"
            :style="{
              left: (c.col * 64 + 46) + 'rpx',
              top: (c.row * 64 + 46) + 'rpx',
              '--charge-color': c.color
            }"
          >
            <view class="charge-ring charge-ring-outer"></view>
            <view class="charge-ring charge-ring-inner"></view>
            <view class="charge-core"></view>
            <view class="charge-spark charge-spark-1"></view>
            <view class="charge-spark charge-spark-2"></view>
            <view class="charge-spark charge-spark-3"></view>
            <view class="charge-spark charge-spark-4"></view>
          </view>
        </view>
        
        <!-- 环境交互痕迹层（火焰焦黑、冰面冰晶、毒腐蚀） -->
        <view class="terrain-marks-layer">
          <view 
            v-for="m in gameStore.terrainMarks" 
            :key="m.id"
            class="terrain-mark"
            :class="`mark-${m.type}`"
            :style="{
              left: (m.col * 64 + 16 + 60 / 2) + 'rpx',
              top: (m.row * 64 + 16 + 60 / 2) + 'rpx'
            }"
          >
            <!-- 焦黑：烧焦痕迹 -->
            <template v-if="m.type === 'scorch'">
              <view class="scorch-mark scorch-base"></view>
              <view class="scorch-mark scorch-spot-1"></view>
              <view class="scorch-mark scorch-spot-2"></view>
              <view class="scorch-mark scorch-spot-3"></view>
            </template>
            <!-- 冰晶：冰霜痕迹 -->
            <template v-else-if="m.type === 'frost'">
              <view class="frost-mark frost-crystal frost-crystal-1"></view>
              <view class="frost-mark frost-crystal frost-crystal-2"></view>
              <view class="frost-mark frost-crystal frost-crystal-3"></view>
              <view class="frost-mark frost-glow"></view>
            </template>
            <!-- 腐蚀：毒/阴属性痕迹 -->
            <template v-else-if="m.type === 'poison'">
              <view class="poison-mark poison-base"></view>
              <view class="poison-mark poison-bubble poison-bubble-1"></view>
              <view class="poison-mark poison-bubble poison-bubble-2"></view>
              <view class="poison-mark poison-bubble poison-bubble-3"></view>
            </template>
          </view>
        </view>
        
        <!-- 死亡特效层（角色化作光点消散） -->
        <view class="death-effects-layer">
          <view 
            v-for="d in gameStore.deathEffects" 
            :key="d.id"
            class="death-effect"
            :style="{
              left: (d.col * 64 + 46) + 'rpx',
              top: (d.row * 64 + 46) + 'rpx',
              '--death-color': d.color
            }"
          >
            <view class="death-flash"></view>
            <view class="death-ring"></view>
            <view class="death-particle death-particle-1"></view>
            <view class="death-particle death-particle-2"></view>
            <view class="death-particle death-particle-3"></view>
            <view class="death-particle death-particle-4"></view>
            <view class="death-particle death-particle-5"></view>
            <view class="death-particle death-particle-6"></view>
            <view class="death-particle death-particle-7"></view>
            <view class="death-particle death-particle-8"></view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 战斗字幕 -->
    <view v-if="currentBattleSubtitle" class="battle-subtitle">
      <rich-text class="subtitle-text" :nodes="colorizedSubtitle"></rich-text>
    </view>
    
    <!-- 操作面板 -->
    <view class="action-panel">
      <view v-if="selectedCharacter && selectedCharacter.isPlayer" class="selected-info">
        <text class="selected-name">{{ getSelectedCharName() }}</text>
        <text class="selected-level">Lv.{{ selectedCharacter.level }}</text>
        
        <view class="character-stats">
          <view class="mini-stat">
            <text>❤️</text>
            <text>{{ selectedCharacter.hp }}/{{ getCharacterMaxHp(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>💙</text>
            <text>{{ selectedCharacter.mp }}/{{ getCharacterMaxMp(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🗡️</text>
            <text>{{ gameStore.computeAttackPower(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🛡️</text>
            <text>{{ gameStore.computeDefensePower(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>👟</text>
            <text>{{ getCharacterMoveRange(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🎯</text>
            <text>{{ getCharacterAttackRange(selectedCharacter) }}</text>
          </view>
        </view>

        <view v-if="selectedCharacter.statuses && selectedCharacter.statuses.length > 0" class="status-panel">
          <text class="status-label">状态：</text>
          <view class="status-list">
            <text v-for="statusType in selectedCharacter.statuses" :key="statusType" class="status-tag">{{ getStatusIcon(statusType) }} {{ getStatusName(statusType) }}</text>
          </view>
        </view>
        
        <view class="action-buttons">
          <view 
            class="action-btn move"
            :class="{ disabled: selectedCharacter.hasMoved || selectedCharacter.isDefending || gameStore.battleMap?.battlePhase !== 'player' || gameStore.isCharacterInSnow(selectedCharacter) || selectedCharacter.statuses?.some(s => s.type === 'cold') || selectedCharacter.statuses?.some(s => s.type === 'stun') || selectedCharacter.statuses?.some(s => s.type === 'imprison') }"
            @click="showMoveRange"
          >
            <text>移动</text>
          </view>
          <view
            class="action-btn attack"
            :class="{ disabled: selectedCharacter.hasActed || gameStore.battleMap?.battlePhase !== 'player' || selectedCharacter.statuses?.some(s => s.type === 'stun') }"
            @click="showAttackRange"
          >
            <text>攻击</text>
          </view>
          <view
            class="action-btn skill"
            :class="{ disabled: selectedCharacter.hasActed || gameStore.battleMap?.battlePhase !== 'player' || selectedCharacter.statuses?.some(s => s.type === 'silenced') || selectedCharacter.statuses?.some(s => s.type === 'stun') }"
            @click="showSkillPanel"
          >
            <text>技能</text>
          </view>
          <view 
            class="action-btn defend"
            :class="{ disabled: selectedCharacter.hasActed || gameStore.battleMap?.battlePhase !== 'player' }"
            @click="defend"
          >
            <text>防御</text>
          </view>
          <view 
            class="action-btn cancel"
            @click="cancelSelection"
          >
            <text>取消</text>
          </view>
        </view>

        <!-- 多目标技能选择面板 -->
        <view 
          v-if="selectedSkill && ((selectedSkill.targetCount && selectedSkill.targetCount > 1) || selectedSkill.id === 'terror_scream' || selectedSkill.id === 'lian_yu_huo_hai' || selectedSkill.category === '直线' || selectedSkill.category === '横扫' || selectedSkill.category === 'summon' || selectedSkill.category === '陷阵') && currentAction === 'skill'"
          class="multi-target-panel"
        >
          <text class="multi-target-info">
            {{ (selectedSkill.category === '直线' || selectedSkill.category === '横扫') ? (selectedDirection ? `已选方向: ${directionNames[selectedDirection]}` : '请选择方向') : (selectedSkill.category === '陷阵' ? (selectedTargets.length > 0 ? '已选位置，点击确认施放' : '点击范围内的空格子选择目标位置') : (selectedSkill.id === 'terror_scream' || selectedSkill.id === 'lian_yu_huo_hai' ? '点击自己选择目标' : `已选目标 ${selectedTargets.length} / ${selectedSkill.targetCount}`)) }}
          </text>
          <view 
            class="action-btn"
            :class="['confirm-cast', { disabled: (selectedSkill?.category === '直线' || selectedSkill?.category === '横扫') ? !selectedDirection : selectedTargets.length === 0 }]"
            @click="confirmSkillCast"
          >
            <text>确认施放</text>
          </view>
        </view>
        
        <!-- 攻击确认面板 -->
        <view 
          v-if="currentAction === 'attack' && selectedCharacter && !selectedCharacter.hasActed"
          class="multi-target-panel"
        >
          <text class="multi-target-info">
            {{ selectedTargets.length > 0 ? `已选目标 1/1` : '点击范围内的目标进行攻击' }}
          </text>
          <view 
            class="action-btn"
            :class="['confirm-cast', { disabled: selectedTargets.length === 0 }]"
            @click="confirmAttack"
          >
            <text>确认攻击</text>
          </view>
        </view>
      </view>
      
      <view v-else-if="selectedCharacter && !selectedCharacter.isPlayer" class="enemy-info">
        <text class="selected-name">{{ getSelectedCharName() }}</text>
        <text class="selected-level">Lv.{{ selectedCharacter.level }}</text>
        
        <view class="character-stats">
          <view class="mini-stat">
            <text>❤️</text>
            <text>{{ selectedCharacter.hp }}/{{ getCharacterMaxHp(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>💙</text>
            <text>{{ selectedCharacter.mp }}/{{ getCharacterMaxMp(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🗡️</text>
            <text>{{ gameStore.computeAttackPower(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🛡️</text>
            <text>{{ gameStore.computeDefensePower(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>👟</text>
            <text>{{ getCharacterMoveRange(selectedCharacter) }}</text>
          </view>
          <view class="mini-stat">
            <text>🎯</text>
            <text>{{ getCharacterAttackRange(selectedCharacter) }}</text>
          </view>
        </view>

        <view v-if="selectedCharacter.statuses && selectedCharacter.statuses.length > 0" class="status-panel">
          <text class="status-label">状态：</text>
          <view class="status-list">
            <text v-for="statusType in selectedCharacter.statuses" :key="statusType" class="status-tag">{{ getStatusIcon(statusType) }} {{ getStatusName(statusType) }}</text>
          </view>
        </view>
        
        <!-- 技能列表 -->
        <view class="enemy-skills">
          <text class="skills-title">技能</text>
          <view class="skill-list-mini">
            <view 
              v-for="skill in getCharacterSkills(selectedCharacter)" 
              :key="skill.id"
              class="skill-mini-card"
            >
              <view class="skill-mini-info">
                <text class="skill-mini-name">{{ skill.name }}</text>
                <view class="skill-mini-tags">
                  <text class="skill-mini-tag" :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }">{{ ATTRIBUTE_CONFIG[skill.attribute || 'normal'].name }}</text>
                  <text class="skill-mini-tag" :style="{ color: getSkillTags(skill).typeColor, borderColor: getSkillTags(skill).typeColor }">{{ getSkillTags(skill).type }}</text>
                  <text class="skill-mini-tag" :style="{ color: getSkillTags(skill).rangeColor, borderColor: getSkillTags(skill).rangeColor }">{{ getSkillTags(skill).range }}</text>
                  <text class="skill-mini-tag" :style="{ color: getSkillTags(skill).targetCountColor, borderColor: getSkillTags(skill).targetCountColor }">{{ getSkillTags(skill).targetCount }}</text>
                </view>
              </view>
              <text class="skill-mini-cooldown">
                {{ getSkillCurrentCooldown(selectedCharacter, skill.id) }}/{{ skill.cooldown }}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <view v-else-if="selectedBuilding" class="building-info">
        <text class="selected-name">{{ selectedBuilding.name }}</text>
        <text class="selected-level">Lv.{{ gameStore.battleMap?.enemyLevel || 1 }}</text>
        
        <view class="character-stats">
          <view class="mini-stat">
            <text>❤️</text>
            <text>{{ selectedBuilding.hp }}/{{ selectedBuilding.maxHp }}</text>
          </view>
          <view class="mini-stat">
            <text>🛡️</text>
            <text>0</text>
          </view>
        </view>
      </view>
      
      <view v-else class="no-selection">
      </view>
    </view>
    
    <!-- 技能选择面板 -->
    <view v-if="showSkillSelection" class="skill-modal" @click="showSkillSelection = false">
      <view class="skill-panel" @click.stop>
        <view class="skill-panel-header">
          <text class="skill-panel-title">选择技能</text>
          <view class="skill-close-btn" @click="showSkillSelection = false">
            <text>✕</text>
          </view>
        </view>
        <scroll-view class="skill-list" scroll-y>
          <view 
            v-for="skill in characterSkills" 
            :key="skill.id"
            class="skill-card"
            :class="{ disabled: selectedCharacter!.mp < skill.mpCost || selectedCharacter!.hasActed || (getSkillCurrentCooldown(selectedCharacter!, skill.id) > 0) || isSkillHpRestricted(skill.id, selectedCharacter!) || selectedCharacter!.statuses?.some(s => s.type === 'silenced') || selectedCharacter!.statuses?.some(s => s.type === 'stun') || isSkillResourceRestricted(skill) || isSkillSummonLimited(skill, selectedCharacter!) || isSkillMaxUsesReached(skill, selectedCharacter!) }"
            @click="selectSkill(skill)"
          >
            <text class="skill-card-name">{{ skill.name }}</text>
            <view class="skill-card-tags">
              <text class="skill-card-tag" :style="{ color: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color, borderColor: ATTRIBUTE_CONFIG[skill.attribute || 'normal'].color }">{{ ATTRIBUTE_CONFIG[skill.attribute || 'normal'].name }}</text>
              <text class="skill-card-tag" :style="{ color: getSkillTags(skill).typeColor, borderColor: getSkillTags(skill).typeColor }">{{ getSkillTags(skill).type }}</text>
              <text class="skill-card-tag" :style="{ color: getSkillTags(skill).rangeColor, borderColor: getSkillTags(skill).rangeColor }">{{ getSkillTags(skill).range }}</text>
              <text class="skill-card-tag" :style="{ color: getSkillTags(skill).targetCountColor, borderColor: getSkillTags(skill).targetCountColor }">{{ getSkillTags(skill).targetCount }}</text>
            </view>
            <text class="skill-card-desc">{{ skill.description }}</text>
            <view class="skill-card-info">
              <text class="skill-cost">💙 {{ skill.mpCost }}</text>
              <text v-if="skill.reikiCost" class="skill-cost reiki-cost">✨ {{ skill.reikiCost }}</text>
              <text v-if="skill.shaQiCost" class="skill-cost shaqi-cost">💢 {{ skill.shaQiCost }}</text>
              <text class="skill-cooldown">⌛ {{ getSkillCurrentCooldown(selectedCharacter!, skill.id) }}/{{ skill.cooldown }}回合</text>
              <text v-if="skill.maxUsesPerBattle" class="skill-use-count" :class="{ 'maxed': isSkillMaxUsesReached(skill, selectedCharacter!) }">📌 {{ getSkillUseCount(skill, selectedCharacter!) }}/{{ skill.maxUsesPerBattle }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 灵草灵药选择面板 -->
    <view v-if="showCollectibleSelection && selectedCollectible" class="skill-modal" @click="cancelCollectibleSelection">
      <view class="skill-panel" @click.stop>
        <view class="skill-panel-header">
          <text class="skill-panel-title">{{ selectedCollectible.name }}</text>
          <view class="skill-close-btn" @click="cancelCollectibleSelection">
            <text>✕</text>
          </view>
        </view>
        <view class="collectible-info">
          <text class="collectible-icon">{{ selectedCollectible.icon }}</text>
          <text class="collectible-desc">{{ selectedCollectible.description }}</text>
        </view>
        <view class="collectible-actions">
          <view class="collectible-btn use" @click="useCollectible">
            <text>使用</text>
          </view>
          <view class="collectible-btn collect" @click="collectCollectible">
            <text>拾取</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-buttons" v-if="!gameStore.isSelectingGatherPoints">
      <view class="bottom-btn" @click="showBattleLog">
        <text>战斗记录</text>
      </view>
      <view class="bottom-btn" @click="showFactionCommand">
        <text>阵营指令</text>
      </view>
      <view class="bottom-btn" @click="toggleSpeed">
        <text>游戏加速 x{{ gameStore.gameSpeed }}</text>
      </view>
      <view class="bottom-btn end-turn" @click="endTurn">
        <text>结束行动</text>
      </view>
    </view>
    
    <!-- 集结点选择底部栏 -->
    <view class="gather-point-bottom-bar" v-else>
      <view class="gather-point-info">
        <text class="gather-point-title">选择集结点 ({{ gameStore.gatheringPoints.length }}/4)</text>
        <text class="gather-point-desc">点击地图上的空白格子设置集结点</text>
      </view>
      <view class="gather-point-actions">
        <view class="gather-btn cancel" @click="cancelGatherPointSelection">
          <text>取消</text>
        </view>
        <view 
          class="gather-btn confirm" 
          :class="{ disabled: gameStore.gatheringPoints.length === 0 }"
          @click="confirmGatherPoints"
        >
          <text>确认</text>
        </view>
      </view>
    </view>
    
    <!-- 战斗结算弹窗 -->
    <view v-if="showResult && gameStore.battleResult" class="battle-result-modal">
      <view class="result-content">
        <view class="result-title">
          <text v-if="gameStore.battleResult.type === 'victory'" class="victory-icon">🎉</text>
          <text v-else-if="gameStore.battleResult.type === 'defeat'" class="defeat-icon">💀</text>
          <text v-else class="escape-icon">🏃</text>
          <text>{{ gameStore.battleResult.type === 'victory' ? '战斗胜利' : gameStore.battleResult.type === 'defeat' ? '战斗失败' : '逃离战斗' }}</text>
        </view>
        
        <!-- 标签页切换 -->
        <view class="result-tabs">
          <view 
            class="result-tab" 
            :class="{ active: resultTab === 'loot' }"
            @click="resultTab = 'loot'"
          >
            <text>战利品</text>
          </view>
          <view 
            class="result-tab" 
            :class="{ active: resultTab === 'stats' }"
            @click="resultTab = 'stats'"
          >
            <text>战斗统计</text>
          </view>
        </view>
        
        <!-- 战利品标签页 -->
        <view v-if="resultTab === 'loot'" class="result-tab-content">
          <view class="result-section">
            <view class="section-title">战斗统计</view>
            <view class="stat-item">
              <text class="stat-label">击败敌人:</text>
              <text class="stat-value">{{ gameStore.battleResult.defeatedEnemyCount }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">敌方等级:</text>
              <text class="stat-value">{{ gameStore.battleResult.enemyLevel }}</text>
            </view>
          </view>
          
          <view class="result-section" v-if="gameStore.battleResult.goldGained > 0">
            <view class="section-title">获得奖励</view>
            <view class="stat-item">
              <text class="stat-label">金币:</text>
              <text class="stat-value gold">💰 {{ gameStore.battleResult.goldGained }}</text>
            </view>
          </view>
          
          <view class="result-section" v-if="gameStore.battleResult.loot.length > 0">
            <view class="section-title">战利品</view>
            <view class="loot-list">
              <view v-for="item in gameStore.battleResult.loot" :key="item.name" class="loot-item">
                <text>{{ item.name }} ×{{ item.count }}</text>
              </view>
            </view>
          </view>
          
          <view class="result-section">
            <view class="section-title">经验获得</view>
            <view class="exp-list">
              <view v-for="char in gameStore.battleResult.characterExp" :key="char.name" class="exp-item">
                <text class="exp-name">{{ char.name }}<text v-if="char.isDefeated" class="defeated-tag">(战败)</text></text>
                <text class="exp-value">+{{ char.exp }} EXP</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 战斗统计标签页 -->
        <view v-if="resultTab === 'stats'" class="result-tab-content">
          <!-- 总体统计 -->
          <view class="stats-overview">
            <view class="stats-team player-team">
              <text class="stats-team-title">我方</text>
              <view class="stats-row">
                <text class="stats-label">总伤害</text>
                <text class="stats-value damage">{{ gameStore.battleResult.battleStats.playerDamage }}</text>
              </view>
              <view class="stats-row">
                <text class="stats-label">总治疗</text>
                <text class="stats-value heal">{{ gameStore.battleResult.battleStats.playerHeal }}</text>
              </view>
            </view>
            <view class="stats-team enemy-team">
              <text class="stats-team-title">敌方</text>
              <view class="stats-row">
                <text class="stats-label">总伤害</text>
                <text class="stats-value damage">{{ gameStore.battleResult.battleStats.enemyDamage }}</text>
              </view>
              <view class="stats-row">
                <text class="stats-label">总治疗</text>
                <text class="stats-value heal">{{ gameStore.battleResult.battleStats.enemyHeal }}</text>
              </view>
            </view>
          </view>
          
          <!-- 角色统计表 -->
          <view class="stats-table-container">
            <view class="stats-table-title">角色统计</view>
            <view class="stats-table">
              <view class="stats-table-header">
                <text class="stats-col name">角色</text>
                <text class="stats-col side">阵营</text>
                <text class="stats-col damage">伤害</text>
                <text class="stats-col heal">治疗</text>
              </view>
              <view 
                v-for="char in gameStore.battleResult.battleStats.characters" 
                :key="char.name + char.side" 
                class="stats-table-row"
                :class="{ 'player-row': char.side === 'player', 'enemy-row': char.side === 'enemy' }"
              >
                <text class="stats-col name">{{ char.name }}</text>
                <text class="stats-col side" :class="char.side">{{ char.side === 'player' ? '我方' : '敌方' }}</text>
                <text class="stats-col damage">{{ char.damage }}</text>
                <text class="stats-col heal">{{ char.heal }}</text>
              </view>
              <view v-if="gameStore.battleResult.battleStats.characters.length === 0" class="stats-empty">
                <text>暂无数据</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="result-button" @click="closeResult">
          <text>确定</text>
        </view>
      </view>
    </view>
    
    <!-- 战斗记录弹窗 -->
    <view v-if="showLog" class="battle-log-modal" @click="showLog = false">
      <view class="log-content" @click.stop>
        <view class="log-title">战斗记录</view>
        
        <!-- 标签页切换 -->
        <view class="log-tabs">
          <view 
            class="log-tab" 
            :class="{ active: logTab === 'text' }"
            @click="logTab = 'text'"
          >
            <text>文字记录</text>
          </view>
          <view 
            class="log-tab" 
            :class="{ active: logTab === 'data' }"
            @click="logTab = 'data'"
          >
            <text>数据记录</text>
          </view>
          <view 
            class="log-tab close-tab"
            @click="showLog = false"
          >
            <text>关闭</text>
          </view>
        </view>
        
        <!-- 文字记录内容 -->
        <scroll-view v-if="logTab === 'text'" class="log-scroll" scroll-y>
          <rich-text v-for="(log, index) in gameStore.battleLog" :key="index" class="log-item" :nodes="colorizeLogText(log)"></rich-text>
        </scroll-view>
        
        <!-- 数据记录内容 -->
        <scroll-view v-if="logTab === 'data'" class="log-scroll" scroll-y>
          <view class="data-section">
            <view class="data-section-title">我方伤害统计</view>
            <view v-if="playerDamageStats.length === 0" class="data-empty">暂无数据</view>
            <view v-for="char in playerDamageStats" :key="char.id" class="data-row">
              <view class="data-avatar">
                <image :src="getCharacterAvatar(char.characterId)" mode="aspectFill" />
              </view>
              <view class="data-bar-container">
                <view 
                  class="data-bar player-bar" 
                  :style="{ width: (char.totalDamage / maxDamage * 100) + '%' }"
                ></view>
              </view>
              <text class="data-value">{{ char.totalDamage }}</text>
            </view>
          </view>
          
          <view class="data-section">
            <view class="data-section-title">敌方伤害统计</view>
            <view v-if="enemyDamageStats.length === 0" class="data-empty">暂无数据</view>
            <view v-for="char in enemyDamageStats" :key="char.id" class="data-row">
              <view class="data-avatar">
                <image :src="getCharacterAvatar(char.characterId)" mode="aspectFill" />
              </view>
              <view class="data-bar-container">
                <view 
                  class="data-bar enemy-bar" 
                  :style="{ width: (char.totalDamage / maxDamage * 100) + '%' }"
                ></view>
              </view>
              <text class="data-value">{{ char.totalDamage }}</text>
            </view>
          </view>
          
          <view class="data-section">
            <view class="data-section-title">敌方建筑伤害统计</view>
            <view v-if="buildingDamageStats.length === 0" class="data-empty">暂无数据</view>
            <view v-for="building in buildingDamageStats" :key="building.id" class="data-row">
              <view class="data-avatar">
                <image v-if="isBuildingIconUrl(building.icon)" :src="building.icon" mode="aspectFill" />
                <text v-else class="data-emoji">{{ building.icon }}</text>
              </view>
              <view class="data-bar-container">
                <view 
                  class="data-bar enemy-bar" 
                  :style="{ width: (building.totalDamage / maxDamage * 100) + '%' }"
                ></view>
              </view>
              <text class="data-value">{{ building.totalDamage }}</text>
            </view>
          </view>
          
          <view class="data-section">
            <view class="data-section-title">治疗统计</view>
            <view v-if="healStats.length === 0" class="data-empty">暂无数据</view>
            <view v-for="char in healStats" :key="char.id" class="data-row">
              <view class="data-avatar">
                <image :src="getCharacterAvatar(char.characterId)" mode="aspectFill" />
              </view>
              <view class="data-bar-container">
                <view 
                  class="data-bar" 
                  :style="{ width: (char.totalHeal / maxHeal * 100) + '%', backgroundColor: char.isPlayer ? '#60a5fa' : '#a78bfa' }"
                ></view>
              </view>
              <text class="data-value">{{ char.totalHeal }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 阵营指令弹窗 -->
    <view v-if="showFactionCommandModal" class="faction-modal" @click="showFactionCommandModal = false">
      <view class="faction-content" @click.stop>
        <view class="faction-title">阵营指令</view>
        
        <!-- 未在选择集结点时显示指令选择 -->
        <view v-if="!gameStore.isSelectingGatherPoints" class="faction-options">
          <view 
            class="faction-option" 
            :class="{ active: gameStore.factionCommand === 'attack' }"
            @click="selectFactionCommand('attack')"
          >
            <text class="option-icon">🗡️</text>
            <text class="option-name">全军出击</text>
            <text class="option-desc">角色会主动寻找目标造成最大伤害</text>
          </view>
          <view 
            class="faction-option" 
            :class="{ active: gameStore.factionCommand === 'gather' }"
            @click="selectFactionCommand('gather')"
          >
            <text class="option-icon">🏃</text>
            <text class="option-name">全军集结</text>
            <text class="option-desc">角色会向指定位置移动，有机会会攻击</text>
          </view>
        </view>
        
        <!-- 在选择集结点时显示集结点选择提示 -->
        <view v-else class="gather-point-selection">
          <text class="selection-title">选择集结点 ({{ gameStore.gatheringPoints.length }}/4)</text>
          <text class="selection-desc">点击地图上的空白格子设置集结点</text>
          <view class="gather-actions">
            <view class="gather-btn cancel" @click="cancelGatherPointSelection">
              <text>取消</text>
            </view>
            <view 
              class="gather-btn confirm" 
              :class="{ disabled: gameStore.gatheringPoints.length === 0 }"
              @click="confirmGatherPoints"
            >
              <text>确认</text>
            </view>
          </view>
        </view>
        
        <view v-if="!gameStore.isSelectingGatherPoints" class="faction-close" @click="showFactionCommandModal = false">
          <text>关闭</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { HIREABLE_CHARACTERS, INITIAL_CHARACTERS, getEquipmentStats, getAvatarPath, colorizeBattleLogText, STATUS_CONFIG, getSkillTags, ATTRIBUTE_CONFIG, JOB_CONFIG, SKILL_TEMPLATES } from '../../utils/gameData'
import type { BattleCharacter, BattleBuilding, Skill, BattleCollectible } from '../../utils/gameData'

const gameStore = useGameStore()

const selectedCharacter = ref<BattleCharacter | null>(null)
const selectedBuilding = ref<BattleBuilding | null>(null)
const currentAction = ref<'move' | 'attack' | 'skill' | null>(null)
const moveRange = ref<{ row: number; col: number }[]>([])
const attackRange = ref<(BattleCharacter | BattleBuilding)[]>([])
const selectedSkill = ref<Skill | null>(null)
const selectedTargets = ref<string[]>([])
const selectedDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null)
const lineAttackRanges = ref<{ direction: 'up' | 'down' | 'left' | 'right'; positions: { row: number; col: number }[] }[]>([])
const sweepAttackRanges = ref<{ direction: 'up' | 'down' | 'left' | 'right'; positions: { row: number; col: number }[] }[]>([])
const directionNames: Record<string, string> = { up: '上', down: '下', left: '左', right: '右' }
const characterSkills = ref<Skill[]>([])
const showSkillSelection = ref(false)
const showLog = ref(false)
const logTab = ref<'text' | 'data'>('text')
const showResult = ref(false)
const resultTab = ref<'loot' | 'stats'>('loot')
const showStatPanel = ref(false)
const statPanelTitle = ref('')
const statPanelStats = ref<{ icon: string; value: string }[]>([])
const showCollectibleSelection = ref(false)
const selectedCollectible = ref<BattleCollectible | null>(null)
// 使用 gameStore 中的抖动目标
const shakingTargets = computed(() => gameStore.shakingTargets)

// 监听战斗结果
watch(() => gameStore.battleResult, (result) => {
  if (result) {
    showResult.value = true
  }
})
const showFactionCommandModal = ref(false)
const currentBattleSubtitle = ref('')
const subtitleTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// 为字幕内容添加属性颜色，返回 rich-text 可用的 HTML 字符串
const colorizedSubtitle = computed(() => {
  return colorizeBattleLogText(currentBattleSubtitle.value)
})

// 为单条战斗日志添加属性颜色，返回 rich-text 可用的 HTML 字符串
function colorizeLogText(text: string): string {
  return colorizeBattleLogText(text)
}

const weatherIcon = computed(() => {
  const weather = gameStore.battleMap?.weather
  switch (weather) {
    case 'light_snow': return '🌨️'
    case 'medium_snow': return '❄️'
    case 'heavy_snow': return '🌨️'
    case 'mountain_fire': return '🔥'
    case 'sky_fire': return '🔥'
    case 'fog': return '🌫️'
    case 'ghost_fog': return '👻'
    default: return '☀️'
  }
})

// 战斗数据统计
// 包含存活角色和已退场角色的统计数据
const playerDamageStats = computed(() => {
  const map = gameStore.battleMap
  if (!map) return []
  
  // 合并存活玩家和已退场玩家（排除敌方）
  const allPlayers = [
    ...map.players.filter(p => p.isPlayer),
    ...(map.defeatedCharacters || []).filter(p => p.isPlayer)
  ]
  
  return allPlayers
    .map(p => ({
      id: p.id,
      characterId: p.characterId,
      isPlayer: true,
      totalDamage: p.totalDamage || 0
    }))
    .filter(p => p.totalDamage > 0)
    .sort((a, b) => b.totalDamage - a.totalDamage)
})

const enemyDamageStats = computed(() => {
  const map = gameStore.battleMap
  if (!map) return []
  
  // 合并存活敌人和已退场敌人（排除我方）
  const allEnemies = [
    ...map.enemies.filter(e => !e.isPlayer),
    ...(map.defeatedCharacters || []).filter(p => !p.isPlayer)
  ]
  
  return allEnemies
    .map(e => ({
      id: e.id,
      characterId: e.characterId,
      isPlayer: false,
      totalDamage: e.totalDamage || 0
    }))
    .filter(e => e.totalDamage > 0)
    .sort((a, b) => b.totalDamage - a.totalDamage)
})

const healStats = computed(() => {
  const map = gameStore.battleMap
  if (!map) return []
  const allChars = [
    ...map.players,
    ...map.enemies,
    ...(map.defeatedCharacters || [])
  ]
  return allChars
    .map(c => ({
      id: c.id,
      characterId: c.characterId,
      totalHeal: c.totalHeal || 0,
      isPlayer: c.isPlayer
    }))
    .filter(c => c.totalHeal > 0)
    .sort((a, b) => b.totalHeal - a.totalHeal)
})

// 建筑伤害统计
const buildingDamageStats = computed(() => {
  const map = gameStore.battleMap
  if (!map) return []
  
  // 合并存活建筑和已摧毁建筑
  const allBuildings = [
    ...map.buildings.filter(b => !b.isPlayer),
    ...(map.destroyedBuildings || []).filter(b => !b.isPlayer)
  ]
  
  return allBuildings
    .map(b => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      isPlayer: false,
      totalDamage: b.totalDamage || 0
    }))
    .filter(b => b.totalDamage > 0)
    .sort((a, b) => b.totalDamage - a.totalDamage)
})

const maxDamage = computed(() => {
  const playerMax = playerDamageStats.value.length > 0 
    ? playerDamageStats.value[0].totalDamage 
    : 1
  const enemyMax = enemyDamageStats.value.length > 0 
    ? enemyDamageStats.value[0].totalDamage 
    : 1
  const buildingMax = buildingDamageStats.value.length > 0
    ? buildingDamageStats.value[0].totalDamage
    : 1
  return Math.max(playerMax, enemyMax, buildingMax, 1)
})

const maxHeal = computed(() => {
  return healStats.value.length > 0 
    ? healStats.value[0].totalHeal 
    : 1
})

const weatherText = computed(() => {
  const weather = gameStore.battleMap?.weather
  switch (weather) {
    case 'light_snow': return '小雪'
    case 'medium_snow': return '中雪'
    case 'heavy_snow': return '大雪'
    case 'mountain_fire': return '山火'
    case 'sky_fire': return '天火'
    case 'fog': return '迷雾'
    case 'ghost_fog': return '鬼雾'
    default: return '晴朗'
  }
})

const mapStyle = computed(() => {
  const map = gameStore.battleMap
  if (!map) return {}
  return {
    width: `${map.width * 60}rpx`,
    height: `${map.height * 60}rpx`,
  }
})

watch(() => gameStore.isInBattle, (isInBattle) => {
  if (!isInBattle) {
    if (gameStore.battleResult) {
      showResult.value = true
    } else {
      uni.navigateBack()
    }
  }
})

// 监听战斗日志，检测攻击事件并显示字幕
watch(() => gameStore.battleLog, (newLog) => {
  if (newLog.length > 0) {
    const lastLog = newLog[newLog.length - 1]
    // 显示战斗字幕
    showBattleSubtitle(lastLog)
    // 检测是否是攻击相关的日志
    if (lastLog.includes('攻击') || lastLog.includes('伤害')) {
      // 简单检测，根据日志内容尝试找到受攻击目标，这里简化处理
      // 为了演示效果，我们可以临时添加一个抖动效果
    }
  }
}, { deep: true })

// 显示战斗字幕的函数
function showBattleSubtitle(text: string) {
  if (subtitleTimeout.value) {
    clearTimeout(subtitleTimeout.value)
  }
  
  const maxLength = 36
  let displayText = text
  if (text.length > maxLength) {
    displayText = text.substring(0, maxLength) + '...'
  }
  
  currentBattleSubtitle.value = displayText
  subtitleTimeout.value = setTimeout(() => {
    currentBattleSubtitle.value = ''
  }, 3000)
}

function isShaking(row: number, col: number, type: 'character' | 'building'): boolean {
  return shakingTargets.value.some(t => t.row === row && t.col === col && t.type === type)
}

function isHitFlashing(row: number, col: number): boolean {
  return gameStore.hitFlashTargets.some(t => t.row === row && t.col === col)
}

function isDefeated(row: number, col: number, defeatType: 'kill' | 'self'): boolean {
  return gameStore.defeatRecords.some(d => d.row === row && d.col === col && d.defeatType === defeatType)
}

function isCharacterHighlighted(char: BattleCharacter): boolean {
  if (selectedCharacter.value && selectedCharacter.value.id === char.id) return true
  if (gameStore.currentAiCharacter === char.id) return true
  return false
}

function triggerShake(row: number, col: number, type: 'character' | 'building') {
  gameStore.triggerShake(row, col, type)
}

function getCharacterAt(row: number, col: number): BattleCharacter | null {
  const map = gameStore.battleMap
  if (!map) return null
  
  const playerChar = map.players.find(p => p.row === row && p.col === col)
  if (playerChar) return playerChar
  
  const enemyChar = map.enemies.find(e => e.row === row && e.col === col)
  if (enemyChar) return enemyChar
  
  return null
}

function getBuildingAt(row: number, col: number): BattleBuilding | null {
  const map = gameStore.battleMap
  if (!map) return null
  
  return map.buildings.find(b => b.row === row && b.col === col) || null
}

function getAttackableTargetsWithObstacles(char: BattleCharacter): any[] {
  const targets = gameStore.getAttackableTargets(char)
  const map = gameStore.battleMap
  if (!map) return targets
  
  const attackRange = getCharacterAttackRange(char)
  
  for (let r = -attackRange; r <= attackRange; r++) {
    for (let c = -attackRange; c <= attackRange; c++) {
      const nr = char.row + r
      const nc = char.col + c
      if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
        if (map.tiles[nr][nc].terrain === 'obstacle') {
          const distance = Math.abs(r) + Math.abs(c)
          if (distance <= attackRange) {
            targets.push({
              id: `obstacle_${nr}_${nc}`,
              row: nr,
              col: nc,
              isObstacle: true
            })
          }
        }
      }
    }
  }
  
  return targets
}

function getReikiDefenseBonus(reiki: number): number {
  if (reiki >= 100) return 40
  if (reiki >= 60) return 20
  return 0
}

function getShaQiAttackBonus(shaQi: number): number {
  if (shaQi >= 100) return 10
  if (shaQi >= 60) return 5
  return 0
}

function getCharacterAttackRange(char: BattleCharacter): number {
  if (char.characterId === 'heart') return 1
  
  const statusBonus = (char.statuses || []).reduce((acc, s) => {
    const key = typeof s === 'object' ? s.type : s
    const cfg = STATUS_CONFIG?.[key]
    if (cfg?.effects?.attackRange) acc += cfg.effects.attackRange
    return acc
  }, 0)
  
  let attackRange = Math.max(0, char.attackRange + statusBonus)
  
  // 如果角色在迷雾中，攻击范围变成1
  if (gameStore.isFogArea(char.row, char.col)) {
    attackRange = Math.min(attackRange, 1)
  }
  
  return attackRange
}

function getCharacterMoveRange(char: BattleCharacter): number {
  if (char.characterId === 'heart') return 1
  
  const statusBonus = (char.statuses || []).reduce((acc, s) => {
    const key = typeof s === 'object' ? s.type : s
    const cfg = STATUS_CONFIG?.[key]
    if (cfg?.effects?.moveRange) acc += cfg.effects.moveRange
    return acc
  }, 0)
  
  return Math.max(0, char.moveRange + statusBonus)
}

function getCollectibleAt(row: number, col: number): BattleCollectible | null {
  const map = gameStore.battleMap
  if (!map) return null
  
  return map.collectibles.find(c => c.row === row && c.col === col) || null
}

// 头像路径由 gameData.ts 的共享 getAvatarPath 函数提供

function getCharacterEmoji(charId: string): string {
  const template = gameStore.findCharacterTemplateInStore(charId)
  return template?.avatar || '👤'
}

function getCharacterRank(charId: string): number {
  const template = gameStore.findCharacterTemplateInStore(charId)
  if (!template) return 1
  return JOB_CONFIG[template.job]?.rank || 1
}

function getCharacterAvatar(charId: string): string {
  if (charId === 'heart') return '/static/avatars/ghost/xuexin.png'
  // 使用与图鉴一致的头像路径
  return getAvatarPath(charId)
}

function isCharacterAvatarUrl(charId: string): boolean {
  if (charId === 'heart') return true
  const path = getAvatarPath(charId)
  return path.length > 0
}

function getStatusKey(status: string | { type: string }): string {
  if (typeof status === 'object' && status.type) {
    return status.type
  }
  return status
}

function getStatusIcon(status: string | { type: string }): string {
  const key = getStatusKey(status)
  const config = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]
  return config?.icon || '•'
}

function getAttributeIcon(attribute: string): string {
  const iconMap: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    wind: '🌪️',
    earth: '⛰️',
    metal: '⚡',
    wood: '🌿',
    ice: '❄️',
    dark: '🌑',
    yang: '☀️',
    light: '✨',
    shadow: '🌑',
    normal: '💫'
  }
  return iconMap[attribute] || '💫'
}

function getStatusName(status: string | { type: string }): string {
  const key = getStatusKey(status)
  const config = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]
  return config?.name || key
}

// 检查格子是否被天启炮瞄准
function isTargetedByTianqiPao(row: number, col: number): boolean {
  const map = gameStore.battleMap
  if (!map) return false
  
  const tianqiPao = map.buildings.find(b => b.type === 'tianqiPao' && !b.isPlayer)
  if (!tianqiPao || !tianqiPao.targetPositions) return false
  
  return tianqiPao.targetPositions.some(pos => pos.row === row && pos.col === col)
}

function isBuildingIconUrl(icon: string): boolean {
  if (!icon) return false
  return icon.startsWith('/static/') || icon.startsWith('http://') || icon.startsWith('https://')
}

function isCollectibleIconUrl(icon: string): boolean {
  if (!icon) return false
  return icon.startsWith('/static/') || icon.startsWith('http://') || icon.startsWith('https://')
}

function getCharacterMaxHp(char: BattleCharacter): number {
  if (char.characterId === 'heart') return 200
  // 优先使用战斗角色的 maxHp（已包含装备加成和技能提升）
  if (char.maxHp && char.maxHp > 0) {
    return char.maxHp
  }
  // 回退：从模板 + 装备计算
  const template = gameStore.findCharacterTemplateInStore(char.characterId)
  let maxHp = template?.baseMaxHp || char.hp || 100

  const playerChar = gameStore.player?.characters.find(c => c.id === char.characterId)
  if (playerChar) {
    const eq = playerChar.equipment
    if (eq.armor) {
      const stats = getEquipmentStats(eq.armor)
      if (stats.hp) maxHp += stats.hp
    }
    if (eq.accessory) {
      const stats = getEquipmentStats(eq.accessory)
      if (stats.hp) maxHp += stats.hp
    }
  }

  return maxHp
}

function getCharacterMaxMp(char: BattleCharacter): number {
  // 优先使用战斗角色的 maxMp（已包含装备加成和技能提升）
  if (char.maxMp && char.maxMp > 0) {
    return char.maxMp
  }
  // 回退：从模板 + 装备计算
  const template = gameStore.findCharacterTemplateInStore(char.characterId)
  let maxMp = template?.baseMaxMp || 100

  const playerChar = gameStore.player?.characters.find(c => c.id === char.characterId)
  if (playerChar) {
    const eq = playerChar.equipment
    if (eq.helmet) {
      const stats = getEquipmentStats(eq.helmet)
      if (stats.mp) maxMp += stats.mp
    }
    if (eq.accessory) {
      const stats = getEquipmentStats(eq.accessory)
      if (stats.mp) maxMp += stats.mp
    }
  }

  return maxMp
}

function getCharacterAttack(char: BattleCharacter): number {
  if (char.characterId === 'heart') return 30
  let attack = char.attack || 0
  
  // 回退：从模板 + 装备计算（主要用于玩家角色）
  if (!attack) {
    const template = gameStore.findCharacterTemplateInStore(char.characterId)
    attack = template?.baseAttack || 0
    
    // 加上装备加成
    const playerChar = gameStore.player?.characters.find(c => c.id === char.characterId)
    if (playerChar) {
      const eq = playerChar.equipment
      if (eq.weapon) {
        const stats = getEquipmentStats(eq.weapon)
        if (stats.attack) attack += stats.attack
      }
      if (eq.accessory) {
        const stats = getEquipmentStats(eq.accessory)
        if (stats.attack) attack += stats.attack
      }
    }
  }
  
  // 应用攻击力提升效果（如绝处逢生）
  if (char.attackBoost) {
    attack = Math.floor(attack * (1 + char.attackBoost / 100))
  }
  
  return attack
}

function getCharacterDefense(char: BattleCharacter): number {
  if (char.characterId === 'heart') return 10
  let defense = char.defense || 0
  
  // 回退：从模板 + 装备计算（主要用于玩家角色）
  if (!defense) {
    const template = gameStore.findCharacterTemplateInStore(char.characterId)
    defense = template?.baseDefense || 0
    
    // 加上装备加成
    const playerChar = gameStore.player?.characters.find(c => c.id === char.characterId)
    if (playerChar) {
      const eq = playerChar.equipment
      if (eq.armor) {
        const stats = getEquipmentStats(eq.armor)
        if (stats.defense) defense += stats.defense
      }
      if (eq.helmet) {
        const stats = getEquipmentStats(eq.helmet)
        if (stats.defense) defense += stats.defense
      }
      if (eq.shoes) {
        const stats = getEquipmentStats(eq.shoes)
        if (stats.defense) defense += stats.defense
      }
    }
  }
  
  // 如果角色处于防御状态，防御力临时提高20%
  if (char.isDefending) {
    defense = Math.floor(defense * 1.2)
  }
  
  // 应用防御力永久降低效果（如绝处逢生）
  if (char.defenseReductionPermanent) {
    defense = Math.floor(defense * (1 - char.defenseReductionPermanent / 100))
  }
  
  // 应用防御力临时降低效果（如口吐粘液）
  if (char.defenseReduction) {
    defense = Math.floor(defense * (1 - char.defenseReduction / 100))
  }
  
  return Math.max(0, defense)
}

function getSelectedCharName(): string {
  if (!selectedCharacter.value) return ''
  if (selectedCharacter.value.characterId === 'heart') return '血心'
  const template = gameStore.findCharacterTemplateInStore(selectedCharacter.value.characterId)
  return template?.name || selectedCharacter.value.characterId
}

function getCharacterSkills(char: BattleCharacter): Skill[] {
  const playerChar = gameStore.player?.characters.find(c => c.id === char.characterId)
  if (playerChar) return playerChar.skills
  // If not found in player's characters, check the templates
  const template = gameStore.findCharacterTemplateInStore(char.characterId)
  return template?.skills || []
}

function getCellClass(tile: { terrain: string; building?: any }, row: number, col: number): Record<string, boolean> {
  const classes: Record<string, boolean> = {}
  const map = gameStore.battleMap
  
  if (tile.terrain === 'river') classes['river'] = true
  if (tile.terrain === 'obstacle') classes['obstacle'] = true
  if (gameStore.isSnowArea(row, col)) classes['snow-area'] = true
  
  if (map?.mode === 'defensive') {
    const homeOffsetRow = Math.floor((map.height - 9) / 2)
    const homeOffsetCol = Math.floor((map.width - 9) / 2)
    if (row >= homeOffsetRow && row < homeOffsetRow + 9 && 
        col >= homeOffsetCol && col < homeOffsetCol + 9) {
      classes['home-area'] = true
    }
  }
  
  const building = getBuildingAt(row, col)
  if (building) {
    classes['has-building'] = true
  }
  
  const char = getCharacterAt(row, col)
  if (char) {
    classes['has-character'] = true
    classes[char.isPlayer ? 'player-char' : 'enemy-char'] = true
  }
  
  if (selectedCharacter.value && currentAction.value === 'move') {
    if (moveRange.value.some(r => r.row === row && r.col === col)) {
      classes['moveable'] = true
    }
  }
  
  if (selectedCharacter.value && currentAction.value === 'skill') {
    if (selectedSkill.value && selectedSkill.value.category === '直线') {
      // 直线攻击技能：高亮四个方向的攻击范围
      const inLineRange = lineAttackRanges.value.some(dirRange => 
        dirRange.positions.some(pos => pos.row === row && pos.col === col)
      )
      if (inLineRange) {
        // 检查是否属于选中的方向
        const isSelectedDirection = lineAttackRanges.value.some(dirRange =>
          dirRange.direction === selectedDirection.value &&
          dirRange.positions.some(pos => pos.row === row && pos.col === col)
        )
        classes['line-attackable'] = true
        if (isSelectedDirection) {
          classes['target-selected'] = true
        }
      }
      // 高亮角色自身位置（作为起点）
      if (selectedCharacter.value.row === row && selectedCharacter.value.col === col) {
        classes['selected'] = true
      }
    } else if (selectedSkill.value && selectedSkill.value.category === '横扫') {
      // 横扫攻击技能：高亮四个方向的攻击范围
      const inSweepRange = sweepAttackRanges.value.some(dirRange => 
        dirRange.positions.some(pos => pos.row === row && pos.col === col)
      )
      if (inSweepRange) {
        const isSelectedDirection = sweepAttackRanges.value.some(dirRange =>
          dirRange.direction === selectedDirection.value &&
          dirRange.positions.some(pos => pos.row === row && pos.col === col)
        )
        classes['line-attackable'] = true
        if (isSelectedDirection) {
          classes['target-selected'] = true
        }
      }
      if (selectedCharacter.value.row === row && selectedCharacter.value.col === col) {
        classes['selected'] = true
      }
    } else if (selectedSkill.value && selectedSkill.value.category === 'aoe') {
      // AOE技能：显示范围内所有位置（包括自己）
      if (moveRange.value.some(r => r.row === row && r.col === col)) {
        classes['moveable'] = true
      }
    } else if (selectedSkill.value && selectedSkill.value.category === '陷阵') {
      // 陷阵技能：高亮范围内的空格子
      if (moveRange.value.some(r => r.row === row && r.col === col)) {
        const tile = gameStore.battleMap?.tiles[row]?.[col]
        const charHere = getCharacterAt(row, col)
        const buildingHere = getBuildingAt(row, col)
        if (tile && tile.terrain === 'empty' && !charHere && !buildingHere) {
          classes['moveable'] = true
          // 已选中的格子额外高亮
          if (selectedTargets.value.includes(`pos_${row}_${col}`)) {
            classes['target-selected'] = true
          }
        }
      }
    } else if (selectedSkill.value && selectedSkill.value.id === 'bing_feng_zhi_men') {
      // 冰封之门：高亮 2 格范围内的空格（不包含角色、建筑、河流）
      if (moveRange.value.some(r => r.row === row && r.col === col)) {
        const tile = gameStore.battleMap?.tiles[row]?.[col]
        const charHere = getCharacterAt(row, col)
        const buildingHere = getBuildingAt(row, col)
        if (!charHere && !buildingHere && tile && tile.terrain !== 'obstacle' && tile.terrain !== 'river') {
          classes['moveable'] = true
          // 已选中的格子额外高亮
          if (selectedTargets.value.includes(`pos_${row}_${col}`)) {
            classes['target-selected'] = true
          }
        }
      }
    } else if (selectedSkill.value && selectedSkill.value.category === 'summon') {
      // 所有召唤类技能：高亮菱形范围内的空格（多选）
      if (moveRange.value.some(r => r.row === row && r.col === col)) {
        const tile = gameStore.battleMap?.tiles[row]?.[col]
        const charHere = getCharacterAt(row, col)
        const buildingHere = getBuildingAt(row, col)
        if (!charHere && !buildingHere && tile && tile.terrain === 'empty') {
          classes['moveable'] = true
          if (selectedTargets.value.includes(`pos_${row}_${col}`)) {
            classes['target-selected'] = true
          }
        }
      }
    } else if (selectedSkill.value && (selectedSkill.value.type === 'heal' || selectedSkill.value.type === 'support')) {
      // 治疗/辅助技能
      if (selectedSkill.value.areaRange && selectedSkill.value.range === 0) {
        // AOE治疗技能：显示范围内所有位置（菱形范围）
        if (moveRange.value.some(r => r.row === row && r.col === col)) {
          classes['moveable'] = true
        }
      } else {
        // 指定类治疗技能：显示有玩家角色的位置作为目标
        if (moveRange.value.some(r => r.row === row && r.col === col)) {
          const healTarget = getCharacterAt(row, col)
          if (healTarget && healTarget.isPlayer) {
            classes['moveable'] = true
            classes['attackable'] = true
            // 多目标技能：已选中的目标额外高亮
            if (selectedTargets.value.includes(healTarget.id)) {
              classes['target-selected'] = true
            }
          }
        }
      }
    } else {
      // 攻击技能：检查攻击范围（目标角色）
      if (attackRange.value.some(a => a.row === row && a.col === col)) {
        classes['attackable'] = true
        // 多目标技能：已选中的目标额外高亮
        const target = attackRange.value.find(a => a.row === row && a.col === col)
        if (target && selectedTargets.value.includes(target.id)) {
          classes['target-selected'] = true
        }
      }
    }
  }
  
  if (selectedCharacter.value && currentAction.value === 'attack') {
    if (moveRange.value.some(r => r.row === row && r.col === col)) {
      classes['moveable'] = true
    }
    if (attackRange.value.some(a => a.row === row && a.col === col)) {
      classes['attackable'] = true
      const target = attackRange.value.find(a => a.row === row && a.col === col)
      if (target && selectedTargets.value.includes(target.id)) {
        classes['target-selected'] = true
      }
    }
  }
  
  if (selectedCharacter.value && selectedCharacter.value.row === row && selectedCharacter.value.col === col) {
    classes['selected'] = true
  }
  
  // 集结点相关样式
  if (gameStore.isSelectingGatherPoints) {
    classes['gather-point-selectable'] = !char && !building && tile.terrain !== 'obstacle' && tile.terrain !== 'river'
    if (gameStore.gatheringPoints.some(p => p.row === row && p.col === col)) {
      classes['gather-point-selected'] = true
    }
  } else if (gameStore.gatheringPoints.some(p => p.row === row && p.col === col)) {
    classes['gather-point'] = true
  }
  
  return classes
}

function handleCellClick(row: number, col: number) {
  const map = gameStore.battleMap
  if (!map) return

  // 集结点选择模式
  if (gameStore.isSelectingGatherPoints) {
    const clickedChar = getCharacterAt(row, col)
    const clickedBuilding = getBuildingAt(row, col)
    const tile = map.tiles[row][col]
    if (!clickedChar && !clickedBuilding && tile.terrain !== 'obstacle' && tile.terrain !== 'river') {
      // 检查是否已选中，选中则取消，未选中则添加
      const existingIndex = gameStore.gatheringPoints.findIndex(p => p.row === row && p.col === col)
      if (existingIndex !== -1) {
        // 移除集结点
        gameStore.removeGatheringPoint(row, col)
      } else {
        // 添加集结点
        gameStore.addGatheringPoint(row, col)
      }
    }
    return
  }

  if (map.battlePhase !== 'player') return

  const clickedChar = getCharacterAt(row, col)
  const clickedBuilding = getBuildingAt(row, col)
  const clickedCollectible = getCollectibleAt(row, col)

  if (currentAction.value === 'move') {
    if (moveRange.value.some(r => r.row === row && r.col === col)) {
      if (selectedCharacter.value) {
        const charId = selectedCharacter.value.id
        gameStore.moveCharacter(charId, row, col)
        // 移动后不取消选择，继续保持选中状态，并更新角色引用
        const updatedChar = gameStore.battleMap?.players.find(p => p.id === charId)
        if (updatedChar) {
          selectedCharacter.value = updatedChar
        }
        currentAction.value = null
        moveRange.value = []
        attackRange.value = []
        selectedSkill.value = null
      }
    }
    return
  }

  if (currentAction.value === 'attack' || currentAction.value === 'skill') {
    if (selectedCharacter.value && selectedSkill.value) {
      // 处理直线攻击技能：点击范围内的格子选择方向
      if (selectedSkill.value.category === '直线') {
        const clickedInLineRange = lineAttackRanges.value.find(dirRange =>
          dirRange.positions.some(pos => pos.row === row && pos.col === col)
        )
        if (clickedInLineRange) {
          if (selectedDirection.value === clickedInLineRange.direction) {
            selectedDirection.value = null
          } else {
            selectedDirection.value = clickedInLineRange.direction
          }
        }
        return
      }
      
      // 处理横扫攻击技能：点击范围内的格子选择方向
      if (selectedSkill.value.category === '横扫') {
        const clickedInSweepRange = sweepAttackRanges.value.find(dirRange =>
          dirRange.positions.some(pos => pos.row === row && pos.col === col)
        )
        if (clickedInSweepRange) {
          if (selectedDirection.value === clickedInSweepRange.direction) {
            selectedDirection.value = null
          } else {
            selectedDirection.value = clickedInSweepRange.direction
          }
        }
        return
      }
      
      // 处理技能释放
      if (selectedSkill.value.category === 'aoe') {
        if (selectedSkill.value.range > 0 && selectedSkill.value.areaRange > 0) {
          // 远程目标位置AOE：点击范围内任意位置施放（位置作为目标）
          if (moveRange.value.some(r => r.row === row && r.col === col)) {
            const target = `pos_${row}_${col}`
            gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, target)
            cancelSelection()
          }
        } else {
          // 以自身为中心的AOE技能：点击自己即可施放
          if (selectedCharacter.value && row === selectedCharacter.value.row && col === selectedCharacter.value.col) {
            gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id)
            cancelSelection()
          }
        }
      } else if (selectedSkill.value.category === '陷阵') {
        // 陷阵技能：点击范围内空格子选择目标（需要确认按钮施放）
        if (moveRange.value.some(r => r.row === row && r.col === col)) {
          const tile = gameStore.battleMap?.tiles[row]?.[col]
          const charHere = getCharacterAt(row, col)
          const buildingHere = getBuildingAt(row, col)
          if (!charHere && !buildingHere && tile && tile.terrain === 'empty') {
            const posId = `pos_${row}_${col}`
            const existingIdx = selectedTargets.value.indexOf(posId)
            if (existingIdx !== -1) {
              // 已选中，取消选中
              selectedTargets.value.splice(existingIdx, 1)
            } else {
              // 未选中，添加选中
              selectedTargets.value = [posId]
            }
          }
        }
      } else if (selectedSkill.value.id === 'bing_feng_zhi_men') {
        // 冰封之门：点击空格选择目标位置（多目标）
        if (moveRange.value.some(r => r.row === row && r.col === col)) {
          const tile = gameStore.battleMap?.tiles[row]?.[col]
          const charHere = getCharacterAt(row, col)
          const buildingHere = getBuildingAt(row, col)
          if (!charHere && !buildingHere && tile && tile.terrain !== 'obstacle' && tile.terrain !== 'river') {
            const posId = `pos_${row}_${col}`
            const existingIdx = selectedTargets.value.indexOf(posId)
            if (existingIdx !== -1) {
              // 已选中，取消选中
              selectedTargets.value.splice(existingIdx, 1)
            } else if (selectedTargets.value.length < (selectedSkill.value.targetCount || 2)) {
              // 未达上限，添加选中
              selectedTargets.value.push(posId)
            }
          }
        }
      } else if (selectedSkill.value.id === 'terror_scream' || selectedSkill.value.id === 'lian_yu_huo_hai') {
        // 恐怖尖叫/炼狱火海：以自身为中心的AOE，点击自己选择目标
        if (selectedCharacter.value && row === selectedCharacter.value.row && col === selectedCharacter.value.col) {
          const charId = selectedCharacter.value.id
          const existingIdx = selectedTargets.value.indexOf(charId)
          if (existingIdx !== -1) {
            selectedTargets.value.splice(existingIdx, 1)
          } else {
            selectedTargets.value.push(charId)
          }
        }
      } else if (selectedSkill.value.category === 'summon') {
        // 所有召唤类技能：点击空格选择目标位置
        if (moveRange.value.some(r => r.row === row && r.col === col)) {
          const tile = gameStore.battleMap?.tiles[row]?.[col]
          const charHere = getCharacterAt(row, col)
          const buildingHere = getBuildingAt(row, col)
          if (!charHere && !buildingHere && tile && tile.terrain === 'empty') {
            const posId = `pos_${row}_${col}`
            const existingIdx = selectedTargets.value.indexOf(posId)
            if (existingIdx !== -1) {
              // 已选中，取消选中
              selectedTargets.value.splice(existingIdx, 1)
            } else if (selectedTargets.value.length < (selectedSkill.value.targetCount || 1)) {
              // 未达上限，添加选中
              selectedTargets.value.push(posId)
            }
          }
        }
      } else if (selectedSkill.value.type === 'heal' || selectedSkill.value.type === 'support') {
        // AOE治疗技能（以自身为中心，areaRange > 0, range === 0）：点击范围内任意位置即可施放
        if (selectedSkill.value.areaRange && selectedSkill.value.range === 0) {
          const isInRange = moveRange.value.some(r => r.row === row && r.col === col)
          if (isInRange) {
            gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, null)
            cancelSelection()
          }
        } else {
          // 单体治疗/辅助技能：检查玩家角色是否在范围内
          const healTarget = getCharacterAt(row, col)
          if (healTarget && healTarget.isPlayer) {
            // 检查目标是否在技能范围内
            const isInRange = moveRange.value.some(r => r.row === row && r.col === col)
            if (isInRange) {
              // 多目标治疗技能
              const targetCount = selectedSkill.value.targetCount || 1
              if (targetCount > 1) {
                const targetId = healTarget.id
                const existingIdx = selectedTargets.value.indexOf(targetId)
                if (existingIdx !== -1) {
                  selectedTargets.value.splice(existingIdx, 1)
                } else if (selectedTargets.value.length < targetCount) {
                  selectedTargets.value.push(targetId)
                }
              } else {
                gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, healTarget.id)
                cancelSelection()
              }
            }
          }
        }
      } else {
        // 攻击技能：检查攻击范围（目标角色/建筑/障碍物
        const requiredCount = selectedSkill.value?.targetCount || 1
        if (attackRange.value.some(a => a.row === row && a.col === col)) {
          const target = attackRange.value.find(a => a.row === row && a.col === col)
          if (target) {
            if (requiredCount > 1) {
              // 多目标技能：点击后不立即施放，而是收集目标
              const targetId = target.id
              const existingIdx = selectedTargets.value.indexOf(targetId)
              if (existingIdx !== -1) {
                // 已选中，取消选中
                selectedTargets.value.splice(existingIdx, 1)
              } else if (selectedTargets.value.length < requiredCount) {
                // 未选中且未达上限，添加选中
                selectedTargets.value.push(targetId)
              }
            } else {
              // 单目标技能：立即施放
              if ('isObstacle' in target) {
                triggerShake(target.row, target.col, 'character')
                gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, target.id)
                cancelSelection()
              } else if ('characterId' in target) {
                triggerShake(target.row, target.col, 'character')
                gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, target.id)
                cancelSelection()
              } else if ('hp' in target) {
                triggerShake(target.row, target.col, 'building')
                gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, target.id)
                cancelSelection()
              }
            }
          }
        }
      }
    } else if (currentAction.value === 'attack') {
      if (attackRange.value.some(a => a.row === row && a.col === col)) {
        const target = attackRange.value.find(a => a.row === row && a.col === col)
        if (target) {
          gameStore.attack(selectedCharacter.value!.id, target.id)
          cancelSelection()
        }
      }
    }
    return
  }

  if (clickedCollectible) {
    if (selectedCharacter.value) {
      const distance = Math.abs(selectedCharacter.value.row - row) + Math.abs(selectedCharacter.value.col - col)
      if (distance <= 1) {
        selectedCollectible.value = clickedCollectible
        showCollectibleSelection.value = true
        return
      }
    }
    return
  }

  // 优先处理玩家角色点击
  if (clickedChar && clickedChar.isPlayer) {
    selectedCharacter.value = clickedChar
    selectedBuilding.value = null
    showStatPanel.value = false
    return
  }

  // 处理敌方角色点击
  if (clickedChar && !clickedChar.isPlayer) {
    selectedCharacter.value = clickedChar
    selectedBuilding.value = null
    showStatPanel.value = false
    return
  }

  // 处理建筑点击
  if (clickedBuilding) {
    selectedCharacter.value = null
    selectedBuilding.value = clickedBuilding
    showStatPanel.value = false
    return
  }

  // 点击空白处取消所有选择
  cancelSelection()
}

function showEnemyStatPanel(char: BattleCharacter) {
  statPanelTitle.value = getSelectedCharName()
  statPanelStats.value = [
    { icon: '❤️', value: `${char.hp}/${getCharacterMaxHp(char)}` },
    { icon: '🗡️', value: `${gameStore.computeAttackPower(char)}` },
    { icon: '🛡️', value: `${gameStore.computeDefensePower(char)}` },
  ]
  showStatPanel.value = true
}

function showBuildingStatPanel(building: BattleBuilding) {
  statPanelTitle.value = building.name
  statPanelStats.value = [
    { icon: '❤️', value: `${building.hp}/${building.maxHp}` },
    { icon: '🛡️', value: '0' },
  ]
  showStatPanel.value = true
}

function showMoveRange() {
  if (!selectedCharacter.value || selectedCharacter.value.hasMoved || selectedCharacter.value.isDefending || selectedCharacter.value.statuses?.some(s => s.type === 'imprison')) return
  moveRange.value = gameStore.getCharacterMoveRange(selectedCharacter.value)
  currentAction.value = 'move'
  attackRange.value = []
}

function showAttackRange() {
  if (!selectedCharacter.value || selectedCharacter.value.hasActed) return
  selectedTargets.value = []
  attackRange.value = getAttackableTargetsWithObstacles(selectedCharacter.value)
  
  const attackRangeVal = getCharacterAttackRange(selectedCharacter.value)
  const map = gameStore.battleMap
  moveRange.value = []
  if (map) {
    for (let r = -attackRangeVal; r <= attackRangeVal; r++) {
      for (let c = -attackRangeVal; c <= attackRangeVal; c++) {
        const nr = selectedCharacter.value.row + r
        const nc = selectedCharacter.value.col + c
        const distance = Math.abs(r) + Math.abs(c)
        if (distance <= attackRangeVal && distance > 0) {
          if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
            moveRange.value.push({ row: nr, col: nc })
          }
        }
      }
    }
  }
  
  currentAction.value = 'attack'
}

function showSkillPanel() {
  if (!selectedCharacter.value || selectedCharacter.value.hasActed) return
  characterSkills.value = getCharacterSkills(selectedCharacter.value)
  showSkillSelection.value = true
}

// 获取技能当前冷却时间
function getSkillCurrentCooldown(skill: BattleCharacter, skillId: string): number {
  if (skill.isPlayer) {
    const template = gameStore.findCharacterTemplateInStore(skill.characterId)
    const playerChar = gameStore.player?.characters.find(c => c.id === skill.characterId)
    if (playerChar) {
      const s = playerChar.skills.find(sk => sk.id === skillId)
      return s?.currentCooldown || 0
    }
  } else {
    return skill.skillCooldowns?.[skillId] || 0
  }
  return 0
}

function isSkillHpRestricted(skillId: string, char: BattleCharacter): boolean {
  // 腐蚀粘液：只有生命值<=20%时才能使用
  if (skillId === 'fushi_nianye') {
    const maxHp = char.maxHp || gameStore.findCharacterTemplateInStore(char.characterId)?.baseMaxHp || 100
    return char.hp / maxHp > 0.2
  }
  // 需要当前生命值大于攻击力的技能
  const skillTemplate = SKILL_TEMPLATES[skillId]
  if (skillTemplate?.requireHpGtAtk) {
    return char.hp <= char.attack
  }
  return false
}

function isSkillResourceRestricted(skill: Skill): boolean {
  const map = gameStore.battleMap
  if (!map) return false
  if (skill.reikiCost && map.playerReiki < skill.reikiCost) return true
  if (skill.shaQiCost && map.playerShaQi < skill.shaQiCost) return true
  return false
}

function isSkillSummonLimited(skill: Skill, char: BattleCharacter): boolean {
  if (!skill.summonMaxCount || !skill.summonCountId) return false
  const map = gameStore.battleMap
  if (!map) return false
  const currentSide = char.isPlayer ? map.players : map.enemies
  const existingCount = currentSide.filter(c => c.characterId === skill.summonCountId).length
  return existingCount >= skill.summonMaxCount
}

function getSkillUseCount(skill: Skill, char: BattleCharacter): number {
  if (!skill.maxUsesPerBattle) return 0
  if (!char.skillUseCount) return 0
  return char.skillUseCount[skill.id] || 0
}

function isSkillMaxUsesReached(skill: Skill, char: BattleCharacter): boolean {
  if (!skill.maxUsesPerBattle) return false
  return getSkillUseCount(skill, char) >= skill.maxUsesPerBattle
}

function computeSweepPositions(
  direction: 'up' | 'down' | 'left' | 'right',
  row: number,
  col: number,
  length: number,
  width: number,
  map: { height: number; width: number }
): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = []
  
  const startJ = width % 2 === 0 ? -(width / 2 - 1) : -Math.floor(width / 2)
  const endJ = width % 2 === 0 ? width / 2 : Math.floor(width / 2)
  
  for (let i = 1; i <= length; i++) {
    for (let j = startJ; j <= endJ; j++) {
      let r = row
      let c = col
      
      switch (direction) {
        case 'up':
          r = row - i
          c = col + j
          break
        case 'down':
          r = row + i
          c = col + j
          break
        case 'left':
          r = row + j
          c = col - i
          break
        case 'right':
          r = row + j
          c = col + i
          break
      }
      
      if (r >= 0 && r < map.height && c >= 0 && c < map.width) {
        positions.push({ row: r, col: c })
      }
    }
  }
  
  return positions
}

function selectSkill(skill: Skill) {
  if (!selectedCharacter.value || selectedCharacter.value.mp < skill.mpCost || selectedCharacter.value.hasActed) return
  // HP限制检查（如腐蚀粘液）
  if (isSkillHpRestricted(skill.id, selectedCharacter.value)) return
  // 阵营资源检查
  if (isSkillResourceRestricted(skill)) return
  // 召唤数量限制检查
  if (isSkillSummonLimited(skill, selectedCharacter.value)) return
  // 技能使用次数限制检查
  if (isSkillMaxUsesReached(skill, selectedCharacter.value)) return
  selectedSkill.value = skill
  showSkillSelection.value = false
  selectedTargets.value = []
  selectedDirection.value = null
  lineAttackRanges.value = []
  sweepAttackRanges.value = []

  // 触发蓄力特效：选择技能时在角色身上产生蓄力光环
  const attr = skill.attribute || selectedCharacter.value.attribute || 'normal'
  gameStore.triggerChargeEffect(selectedCharacter.value.row, selectedCharacter.value.col, attr)

  if (skill.category === '直线') {
    // 直线攻击技能：计算四个方向的攻击范围
    const lineRange = skill.range || 1
    const row = selectedCharacter.value.row
    const col = selectedCharacter.value.col
    const map = gameStore.battleMap
    
    if (map) {
      lineAttackRanges.value = [
        {
          direction: 'up',
          positions: Array.from({ length: lineRange }, (_, i) => ({ row: row - (i + 1), col }))
            .filter(pos => pos.row >= 0 && pos.row < map.height)
        },
        {
          direction: 'down',
          positions: Array.from({ length: lineRange }, (_, i) => ({ row: row + (i + 1), col }))
            .filter(pos => pos.row >= 0 && pos.row < map.height)
        },
        {
          direction: 'left',
          positions: Array.from({ length: lineRange }, (_, i) => ({ row, col: col - (i + 1) }))
            .filter(pos => pos.col >= 0 && pos.col < map.width)
        },
        {
          direction: 'right',
          positions: Array.from({ length: lineRange }, (_, i) => ({ row, col: col + (i + 1) }))
            .filter(pos => pos.col >= 0 && pos.col < map.width)
        }
      ]
    }
    currentAction.value = 'skill'
  } else if (skill.category === '横扫') {
    // 横扫攻击技能：计算四个方向的攻击范围（长x宽y的矩形区域）
    const sweepLength = skill.sweepLength || 3
    const sweepWidth = skill.sweepWidth || 2
    const row = selectedCharacter.value.row
    const col = selectedCharacter.value.col
    const map = gameStore.battleMap
    
    if (map) {
      sweepAttackRanges.value = [
        {
          direction: 'up',
          positions: computeSweepPositions('up', row, col, sweepLength, sweepWidth, map)
        },
        {
          direction: 'down',
          positions: computeSweepPositions('down', row, col, sweepLength, sweepWidth, map)
        },
        {
          direction: 'left',
          positions: computeSweepPositions('left', row, col, sweepLength, sweepWidth, map)
        },
        {
          direction: 'right',
          positions: computeSweepPositions('right', row, col, sweepLength, sweepWidth, map)
        }
      ]
    }
    currentAction.value = 'skill'
    } else if (skill.category === 'aoe') {
    const char = selectedCharacter.value
    const map = gameStore.battleMap
    if (map && char) {
      if (skill.range > 0 && skill.areaRange > 0) {
        // 远程目标位置AOE：显示 range 范围内的目标位置选择范围
        const skillRange = skill.range || 1
        const targetRange: { row: number; col: number }[] = []
        for (let r = -skillRange; r <= skillRange; r++) {
          for (let c = -skillRange; c <= skillRange; c++) {
            const nr = char.row + r
            const nc = char.col + c
            const distance = Math.abs(r) + Math.abs(c)
            if (distance <= skillRange && distance > 0) {
              if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
                targetRange.push({ row: nr, col: nc })
              }
            }
          }
        }
        moveRange.value = targetRange
      } else {
        // 以自身为中心的AOE技能：显示以自身为中心的菱形范围
        const areaRange = skill.areaRange || 1
        const aoeRange: { row: number; col: number }[] = []
        for (let r = -areaRange; r <= areaRange; r++) {
          for (let c = -areaRange; c <= areaRange; c++) {
            const nr = char.row + r
            const nc = char.col + c
            const distance = Math.abs(r) + Math.abs(c)
            if (skill.rangeType === 'square' || distance <= areaRange) {
              if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
                aoeRange.push({ row: nr, col: nc })
              }
            }
          }
        }
        moveRange.value = aoeRange
      }
    }
    currentAction.value = 'skill'
  } else if (skill.category === '陷阵') {
    // 陷阵技能：显示范围内的空格子
    const char = selectedCharacter.value
    const map = gameStore.battleMap
    if (map && char) {
      const skillRange = skill.range || 1
      const targetRange: { row: number; col: number }[] = []
      for (let r = -skillRange; r <= skillRange; r++) {
        for (let c = -skillRange; c <= skillRange; c++) {
          const nr = char.row + r
          const nc = char.col + c
          const distance = Math.abs(r) + Math.abs(c)
          if (distance <= skillRange && distance > 0) {
            if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
              // 只显示空格子
              const tile = map.tiles[nr]?.[nc]
              const charHere = getCharacterAt(nr, nc)
              const buildingHere = getBuildingAt(nr, nc)
              if (tile && tile.terrain === 'empty' && !charHere && !buildingHere) {
                targetRange.push({ row: nr, col: nc })
              }
            }
          }
        }
      }
      moveRange.value = targetRange
    }
    currentAction.value = 'skill'
  } else if (skill.id === 'bing_feng_zhi_men') {
    // 冰封之门：显示 range 范围内的空格（用于选择生成障碍物的位置，使用 moveRange 显示）
    moveRange.value = getSkillTargetRange(selectedCharacter.value, skill)
    // 多目标选择：最多 targetCount 个空格
    currentAction.value = 'skill'
  } else if (skill.category === 'summon') {
    // 召唤类技能：显示范围内的空格
    moveRange.value = getSkillTargetRange(selectedCharacter.value, skill)
    currentAction.value = 'skill'
  } else if (skill.type === 'heal' || skill.type === 'support') {
    // AOE治疗技能（以自身为中心，areaRange > 0, range === 0）
    if (skill.areaRange && skill.range === 0) {
      const char = selectedCharacter.value
      const map = gameStore.battleMap
      if (map && char) {
        const areaRange = skill.areaRange || 1
        const aoeRange: { row: number; col: number }[] = []
        for (let r = -areaRange; r <= areaRange; r++) {
          for (let c = -areaRange; c <= areaRange; c++) {
            const nr = char.row + r
            const nc = char.col + c
            const distance = Math.abs(r) + Math.abs(c)
            if (skill.rangeType === 'square' || distance <= areaRange) {
              if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
                aoeRange.push({ row: nr, col: nc })
              }
            }
          }
        }
        moveRange.value = aoeRange
      }
    } else {
      moveRange.value = getSkillTargetRange(selectedCharacter.value, skill)
    }
    currentAction.value = 'skill'
  } else {
    attackRange.value = getSkillAttackTargets(selectedCharacter.value, skill)
    currentAction.value = 'skill'
  }
}

function confirmSkillCast() {
  if (!selectedCharacter.value || !selectedSkill.value) return
  
  // 直线攻击技能：需要选择方向后才能释放
  if (selectedSkill.value.category === '直线') {
    if (!selectedDirection.value) return
    gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, selectedDirection.value)
    cancelSelection()
    return
  }
  
  // 横扫攻击技能：需要选择方向后才能释放
  if (selectedSkill.value.category === '横扫') {
    if (!selectedDirection.value) return
    gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, selectedDirection.value)
    cancelSelection()
    return
  }

  // 陷阵技能：需要选择空格子后才能释放
  if (selectedSkill.value.category === '陷阵') {
    if (selectedTargets.value.length === 0) return
    const target = selectedTargets.value[0]
    gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, target)
    cancelSelection()
    return
  }
  
  // AOE治疗技能（以自身为中心，areaRange > 0, range === 0）：不需要选择目标
  if (selectedSkill.value.areaRange && selectedSkill.value.range === 0 && 
      (selectedSkill.value.type === 'heal' || selectedSkill.value.type === 'support')) {
    gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, null)
    cancelSelection()
    return
  }
  
  if (selectedTargets.value.length === 0) return
  gameStore.useSkill(selectedSkill.value.id, selectedCharacter.value.id, [...selectedTargets.value])
  cancelSelection()
}

function confirmAttack() {
  if (!selectedCharacter.value || selectedTargets.value.length === 0) return
  const targetId = selectedTargets.value[0]
  const target = attackRange.value.find(a => a.id === targetId)
  if (target) {
    if ('isObstacle' in target) {
      triggerShake(target.row, target.col, 'character')
      gameStore.attack(selectedCharacter.value.id, target.id)
    } else if ('characterId' in target) {
      triggerShake(target.row, target.col, 'character')
      gameStore.attack(selectedCharacter.value.id, target.id)
    } else if ('hp' in target && 'maxHp' in target) {
      triggerShake(target.row, target.col, 'building')
      gameStore.attackBuilding(selectedCharacter.value.id, target.id)
    }
    cancelSelection()
  }
}

function getSkillTargetRange(char: BattleCharacter, skill: Skill): { row: number; col: number }[] {
  const range: { row: number; col: number }[] = []
  const map = gameStore.battleMap
  if (!map) return range
  
  const skillRange = skill.range || 1
  
  if (skill.id === 'yuan_cheng_dao_dan') {
    // 远程导弹：4格范围内任意格子都可选择（曼哈顿距离）
    for (let r = -skillRange; r <= skillRange; r++) {
      for (let c = -skillRange; c <= skillRange; c++) {
        const nr = char.row + r
        const nc = char.col + c
        const distance = Math.abs(r) + Math.abs(c)
        if (distance <= skillRange && distance > 0) {
          if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
            range.push({ row: nr, col: nc })
          }
        }
      }
    }
    return range
  }

  if (skill.id === 'bing_feng_zhi_men') {
    // 冰封之门：2格范围内的空格（无角色、无建筑、非障碍物非河流）
    for (let r = -skillRange; r <= skillRange; r++) {
      for (let c = -skillRange; c <= skillRange; c++) {
        const nr = char.row + r
        const nc = char.col + c
        const distance = Math.abs(r) + Math.abs(c)
        if (distance <= skillRange && distance > 0) {
          if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
            const tile = map.tiles[nr]?.[nc]
            const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === nr && x.col === nc)
            const hasBuilding = (map.buildings || []).some(b => b.row === nr && b.col === nc)
            if (tile && tile.terrain !== 'obstacle' && tile.terrain !== 'river' && !hasChar && !hasBuilding) {
              range.push({ row: nr, col: nc })
            }
          }
        }
      }
    }
    return range
  }

  if (skill.category === 'summon') {
    // 召唤类技能：菱形范围内的空格（无角色、无建筑、地形为empty）
    for (let r = -skillRange; r <= skillRange; r++) {
      for (let c = -skillRange; c <= skillRange; c++) {
        const nr = char.row + r
        const nc = char.col + c
        const distance = Math.abs(r) + Math.abs(c)
        if (distance <= skillRange && distance > 0) {
          if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
            const tile = map.tiles[nr]?.[nc]
            const hasChar = [...(map.players || []), ...(map.enemies || [])].some(x => x.row === nr && x.col === nc)
            const hasBuilding = (map.buildings || []).some(b => b.row === nr && b.col === nc)
            if (tile && tile.terrain === 'empty' && !hasChar && !hasBuilding) {
              range.push({ row: nr, col: nc })
            }
          }
        }
      }
    }
    return range
  }
  
  for (let r = -skillRange; r <= skillRange; r++) {
    for (let c = -skillRange; c <= skillRange; c++) {
      const nr = char.row + r
      const nc = char.col + c
      const distance = Math.abs(r) + Math.abs(c)
      if (distance <= skillRange && nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
        if (skill.id === 'qian_li_bing_feng') {
          // 千里冰封技能：所有可到达的位置都可作为目标，包括自己
          const tile = map.tiles[nr][nc]
          if (tile.terrain !== 'river' && !getBuildingAt(nr, nc)) {
            range.push({ row: nr, col: nc })
          }
        } else {
          const tile = map.tiles[nr][nc]
          if (tile.terrain !== 'river' && !getBuildingAt(nr, nc)) {
            range.push({ row: nr, col: nc })
          }
        }
      }
    }
  }
  return range
}

function getSkillAttackTargets(char: BattleCharacter, skill: Skill): (BattleCharacter | BattleBuilding | any)[] {
  const targets: (BattleCharacter | BattleBuilding | any)[] = []
  const map = gameStore.battleMap
  if (!map) return targets
  
  const skillRange = skill.range || 1
  // 添加敌人
  for (const enemy of map.enemies) {
    const dist = Math.abs(enemy.row - char.row) + Math.abs(enemy.col - char.col)
    if (dist <= skillRange) {
      targets.push(enemy)
    }
  }
  
  // 添加敌方建筑
  for (const building of map.buildings) {
    if (!building.isPlayer) {
      const dist = Math.abs(building.row - char.row) + Math.abs(building.col - char.col)
      if (dist <= skillRange) {
        targets.push(building)
      }
    }
  }
  
  // 添加障碍物
  const attackRangeVal = getCharacterAttackRange(char)
  for (let r = -skillRange; r <= skillRange; r++) {
    for (let c = -skillRange; c <= skillRange; c++) {
      const nr = char.row + r
      const nc = char.col + c
      if (nr >= 0 && nr < map.height && nc >= 0 && nc < map.width) {
        if (map.tiles[nr][nc].terrain === 'obstacle') {
          const distance = Math.abs(r) + Math.abs(c)
          if (distance <= skillRange) {
            targets.push({
              id: `obstacle_${nr}_${nc}`,
              row: nr,
              col: nc,
              isObstacle: true
            })
          }
        }
      }
    }
  }
  
  return targets
}

function defend() {
  if (!selectedCharacter.value || selectedCharacter.value.hasActed || selectedCharacter.value.isDefending) return
  gameStore.defend(selectedCharacter.value.id)
  cancelSelection()
}

function cancelSelection() {
  selectedCharacter.value = null
  selectedBuilding.value = null
  currentAction.value = null
  moveRange.value = []
  attackRange.value = []
  selectedSkill.value = null
  selectedTargets.value = []
  selectedDirection.value = null
  lineAttackRanges.value = []
  sweepAttackRanges.value = []
  gameStore.clearChargeEffects()
  showStatPanel.value = false
}

async function endTurn() {
  cancelSelection()
  await gameStore.endPlayerTurn()
}

function escapeBattle() {
  uni.showModal({
    title: '确认逃离',
    content: '逃离战斗将失去当前战斗奖励，确定要逃离吗？',
    success: (res) => {
      if (res.confirm) {
        gameStore.endBattle(false, true)
      }
    }
  })
}

function showBattleLog() {
  showLog.value = true
}

function closeResult() {
  showResult.value = false
  resultTab.value = 'loot'
  gameStore.battleResult = null
  uni.navigateBack()
}

function showFactionCommand() {
  showFactionCommandModal.value = true
}

function selectFactionCommand(command: 'attack' | 'gather') {
  gameStore.setFactionCommand(command)
  showFactionCommandModal.value = false
  if (command === 'gather') {
    // 选择全军集结时，直接进入选择模式，不显示弹窗
    // 这个逻辑已经在 gameStore.setFactionCommand 中处理了
  }
}

function cancelGatherPointSelection() {
  gameStore.toggleGatherPointSelection(false)
}

function confirmGatherPoints() {
  gameStore.confirmGatheringPoints()
}

function toggleSpeed() {
  gameStore.toggleSpeed()
}

function cancelCollectibleSelection() {
  selectedCollectible.value = null
  showCollectibleSelection.value = false
}

function useCollectible() {
  if (!selectedCharacter.value || !selectedCollectible.value) return
  gameStore.useCollectible(selectedCollectible.value.id, selectedCharacter.value.id)
  cancelCollectibleSelection()
}

function collectCollectible() {
  if (!selectedCollectible.value) return
  gameStore.collectCollectible(selectedCollectible.value.id)
  cancelCollectibleSelection()
}
</script>

<style lang="scss">
.battle-container {
  height: 100vh;
  background: 
    linear-gradient(180deg, rgba(15,15,26,0.5) 0%, rgba(26,26,46,0.5) 100%),
    url('/static/backgrounds/taiji.jpg') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.battle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 10rpx;
}

.reiki-shaqi-bar {
  display: flex;
  justify-content: space-between;
  padding: 0 32rpx 16rpx;
  gap: 24rpx;
}

.faction-resource {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.faction-resource.enemy-resource {
  align-items: flex-start;
}

.faction-resource.player-resource {
  align-items: flex-end;
}

.faction-label {
  font-size: 22rpx;
  color: #a0aec0;
  margin-bottom: 4rpx;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.resource-item.player-reverse {
  flex-direction: row-reverse;
}

.resource-icon {
  font-size: 20rpx;
}

.resource-icon.reiki-icon {
  color: #60a5fa;
  text-shadow: 0 0 8rpx #3b82f6;
}

.resource-icon.shaqi-icon {
  color: #f87171;
  text-shadow: 0 0 8rpx #ef4444;
}

.resource-bar-container {
  width: 100rpx;
  height: 14rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 7rpx;
  overflow: hidden;
}

.resource-bar-fill {
  height: 100%;
  border-radius: 7rpx;
  transition: width 0.3s ease;
}

.resource-bar-fill.reiki-fill {
  background: linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa);
  box-shadow: 0 0 10rpx rgba(59, 130, 246, 0.5);
}

.resource-bar-fill.shaqi-fill {
  background: linear-gradient(90deg, #b91c1c, #ef4444, #f87171);
  box-shadow: 0 0 10rpx rgba(239, 68, 68, 0.5);
}

.resource-text {
  font-size: 20rpx;
  color: #a0aec0;
  width: 60rpx;
  text-align: right;
}

.bonus-text {
  font-size: 20rpx;
  color: #48bb78;
  font-weight: bold;
  margin-left: 4rpx;
}

.turn-info {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
}

.turn-label {
  font-size: 26rpx;
  color: #a0aec0;
}

.turn-number {
  font-size: 32rpx;
  color: #fbbf24;
  font-weight: 600;
  margin-left: 8rpx;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.05);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.weather-icon {
  font-size: 28rpx;
}

.weather-text {
  font-size: 24rpx;
  color: #a0aec0;
}

.phase-badge {
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  
  &.player {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }
  
  &.enemy {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
  
  &.action {
    background: rgba(96, 165, 250, 0.2);
    color: #60a5fa;
  }
}

.escape-btn {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #a0aec0;
}

.battle-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-content {
  width: 600rpx;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  border: 2rpx solid rgba(96, 165, 250, 0.3);
}

.result-title {
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.victory-icon, .defeat-icon, .escape-icon {
  font-size: 48rpx;
}

.result-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #60a5fa;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
  border-left: 4rpx solid #60a5fa;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  font-size: 26rpx;
  color: #a0aec0;
}

.stat-value {
  font-size: 26rpx;
  color: #fff;
  
  &.gold {
    color: #fbbf24;
  }
}

.loot-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
}

.loot-item {
  font-size: 26rpx;
  color: #a0aec0;
  padding: 8rpx 0;
}

.exp-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
}

.exp-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.exp-name {
  font-size: 26rpx;
  color: #fff;
}

.defeated-tag {
  font-size: 20rpx;
  color: #ef4444;
  margin-left: 8rpx;
}

.exp-value {
  font-size: 26rpx;
  color: #4ade80;
}

/* 战斗结算标签页 */
.result-tabs {
  display: flex;
  margin-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 6rpx;
}

.result-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #a0aec0;
  transition: all 0.2s;
  
  &.active {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: #fff;
  }
}

.result-tab-content {
  max-height: 500rpx;
  overflow-y: auto;
}

/* 战斗统计概览 */
.stats-overview {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.stats-team {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  
  &.player-team {
    border: 2rpx solid rgba(96, 165, 250, 0.3);
  }
  
  &.enemy-team {
    border: 2rpx solid rgba(239, 68, 68, 0.3);
  }
}

.stats-team-title {
  display: block;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 16rpx;
  text-align: center;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.stats-label {
  font-size: 24rpx;
  color: #a0aec0;
}

.stats-value {
  font-size: 24rpx;
  color: #fff;
  
  &.damage {
    color: #ef4444;
  }
  
  &.heal {
    color: #4ade80;
  }
}

/* 战斗统计表 */
.stats-table-container {
  margin-top: 16rpx;
}

.stats-table-title {
  font-size: 26rpx;
  color: #60a5fa;
  margin-bottom: 12rpx;
}

.stats-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  overflow: hidden;
}

.stats-table-header {
  display: flex;
  background: rgba(96, 165, 250, 0.2);
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.stats-table-row {
  display: flex;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  &.player-row {
    background: rgba(96, 165, 250, 0.05);
  }
  
  &.enemy-row {
    background: rgba(239, 68, 68, 0.05);
  }
}

.stats-col {
  &.name {
    flex: 2;
    color: #fff;
  }
  
  &.side {
    flex: 1;
    text-align: center;
    
    &.player {
      color: #60a5fa;
    }
    
    &.enemy {
      color: #ef4444;
    }
  }
  
  &.damage {
    flex: 1;
    text-align: right;
    color: #ef4444;
  }
  
  &.heal {
    flex: 1;
    text-align: right;
    color: #4ade80;
  }
}

.stats-empty {
  padding: 32rpx;
  text-align: center;
  color: #64748b;
  font-size: 26rpx;
}

.result-button {
  margin-top: 32rpx;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  
  text {
    font-size: 30rpx;
    color: #fff;
    font-weight: 600;
  }
}

.battle-scroll {
  flex: 1;
  padding: 0 32rpx;
  overflow: auto;
}

.battle-map-container {
  position: relative;
}

.battle-map {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16rpx;
  min-width: fit-content;
}

.skill-effects-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.skill-effect {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  
  &.small {
    width: 110rpx;
    height: 110rpx;
  }
  
  &.medium {
    width: 140rpx;
    height: 140rpx;
  }
  
  &.large {
    width: 170rpx;
    height: 170rpx;
  }
}

@keyframes skill-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.9;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.skill-effect .effect-base {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: base-pulse 1s ease-out forwards;
  opacity: 0.4;
}

@keyframes base-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.skill-effect.small .effect-base {
  width: 85rpx;
  height: 85rpx;
}

.skill-effect.medium .effect-base {
  width: 110rpx;
  height: 110rpx;
}

.skill-effect.large .effect-base {
  width: 140rpx;
  height: 140rpx;
}

.skill-effect .effect-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: core-pulse 0.8s ease-out forwards;
  z-index: 2;
}

@keyframes core-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

.skill-effect.small .effect-core {
  width: 42rpx;
  height: 42rpx;
}

.skill-effect.medium .effect-core {
  width: 56rpx;
  height: 56rpx;
}

.skill-effect.large .effect-core {
  width: 72rpx;
  height: 72rpx;
}

.skill-effect .effect-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28rpx;
  animation: icon-float 1s ease-out forwards;
  z-index: 3;
  text-shadow: 0 0 10rpx rgba(255, 255, 255, 0.8);
}

@keyframes icon-float {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-10deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 0;
  }
}

.skill-effect.small .effect-icon {
  font-size: 28rpx;
}

.skill-effect.medium .effect-icon {
  font-size: 40rpx;
}

.skill-effect.large .effect-icon {
  font-size: 52rpx;
}

.skill-effect .effect-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background-color: var(--particle-color);
  animation: particle-fly 1s ease-out forwards;
  animation-delay: var(--particle-delay);
  box-shadow: 0 0 14rpx var(--particle-color);
}

@keyframes particle-fly {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0);
    opacity: 0;
  }
}

.skill-effect .effect-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 4rpx solid;
  animation: ring-expand 1s ease-out forwards;
  z-index: 1;
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

.skill-effect.small .effect-ring {
  width: 70rpx;
  height: 70rpx;
}

.skill-effect.medium .effect-ring {
  width: 98rpx;
  height: 98rpx;
}

.skill-effect.large .effect-ring {
  width: 126rpx;
  height: 126rpx;
}

.skill-effect .effect-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 3rpx solid;
  opacity: 0.6;
  animation: wave-expand 1.2s ease-out 0.3s forwards;
  z-index: 1;
}

@keyframes wave-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.skill-effect.small .effect-wave {
  width: 56rpx;
  height: 56rpx;
}

.skill-effect.medium .effect-wave {
  width: 84rpx;
  height: 84rpx;
}

.skill-effect.large .effect-wave {
  width: 112rpx;
  height: 112rpx;
}

.core-fire {
  background: radial-gradient(circle, #ff6b35 0%, #ff0000 70%, transparent 100%);
  box-shadow: 0 0 45rpx #ff6b35, 0 0 90rpx #ff0000, 0 0 135rpx rgba(255, 0, 0, 0.5);
  animation: fire-burn 0.6s ease-out forwards;
}

@keyframes fire-burn {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.8;
    filter: brightness(1.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

.core-water {
  background: radial-gradient(circle, #3b82f6 0%, #06b6d4 70%, transparent 100%);
  box-shadow: 0 0 45rpx #3b82f6, 0 0 90rpx #06b6d4, 0 0 135rpx rgba(6, 182, 212, 0.5);
  animation: water-ripple 0.8s ease-out forwards;
}

@keyframes water-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
}

.core-wind {
  background: radial-gradient(circle, #86efac 0%, #22c55e 70%, transparent 100%);
  box-shadow: 0 0 45rpx #86efac, 0 0 90rpx #22c55e, 0 0 135rpx rgba(34, 197, 94, 0.5);
  animation: wind-spin 0.6s ease-out forwards;
}

@keyframes wind-spin {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(360deg);
    opacity: 0.6;
  }
}

.core-earth {
  background: radial-gradient(circle, #d97706 0%, #b45309 70%, transparent 100%);
  box-shadow: 0 0 45rpx #d97706, 0 0 90rpx #b45309, 0 0 135rpx rgba(180, 83, 9, 0.5);
  animation: earth-crack 0.7s ease-out forwards;
}

@keyframes earth-crack {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
}

.core-metal {
  background: radial-gradient(circle, #a855f7 0%, #6366f1 70%, transparent 100%);
  box-shadow: 0 0 45rpx #a855f7, 0 0 90rpx #6366f1, 0 0 135rpx rgba(99, 102, 241, 0.5);
  animation: metal-shine 0.5s ease-out forwards;
}

@keyframes metal-shine {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.9;
    filter: brightness(2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
    filter: brightness(1);
  }
}

.core-wood {
  background: radial-gradient(circle, #22c55e 0%, #15803d 70%, transparent 100%);
  box-shadow: 0 0 45rpx #22c55e, 0 0 90rpx #15803d, 0 0 135rpx rgba(21, 128, 61, 0.5);
  animation: wood-grow 0.9s ease-out forwards;
}

@keyframes wood-grow {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

.core-light {
  background: radial-gradient(circle, #fbbf24 0%, #f59e0b 70%, transparent 100%);
  box-shadow: 0 0 45rpx #fbbf24, 0 0 90rpx #f59e0b, 0 0 135rpx rgba(245, 158, 11, 0.5);
  animation: light-flash 0.4s ease-out forwards;
}

@keyframes light-flash {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    filter: brightness(2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
    filter: brightness(1);
  }
}

.core-dark {
  background: radial-gradient(circle, #7c3aed 0%, #4c1d95 70%, transparent 100%);
  box-shadow: 0 0 45rpx #7c3aed, 0 0 90rpx #4c1d95, 0 0 135rpx rgba(76, 29, 149, 0.5);
  animation: dark-pulse 0.7s ease-out forwards;
}

@keyframes dark-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

.core-yang {
  background: radial-gradient(circle, #fcd34d 0%, #f59e0b 70%, transparent 100%);
  box-shadow: 0 0 45rpx #fcd34d, 0 0 90rpx #f59e0b, 0 0 135rpx rgba(245, 158, 11, 0.5);
  animation: yang-glow 0.8s ease-out forwards;
}

@keyframes yang-glow {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    filter: brightness(1.5);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
    filter: brightness(1);
  }
}

.core-shadow {
  background: radial-gradient(circle, #64748b 0%, #334155 70%, transparent 100%);
  box-shadow: 0 0 45rpx #64748b, 0 0 90rpx #334155, 0 0 135rpx rgba(51, 65, 85, 0.5);
  animation: shadow-fade 0.8s ease-out forwards;
}

@keyframes shadow-fade {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
}

.core-normal {
  background: radial-gradient(circle, #9ca3af 0%, #6b7280 70%, transparent 100%);
  box-shadow: 0 0 20rpx #9ca3af, 0 0 40rpx #6b7280;
}

.core-ice {
  background: radial-gradient(circle, #67e8f9 0%, #22d3ee 70%, transparent 100%);
  box-shadow: 0 0 45rpx #67e8f9, 0 0 90rpx #22d3ee, 0 0 135rpx rgba(34, 211, 238, 0.5);
  animation: ice-crystal 0.7s ease-out forwards;
}

@keyframes ice-crystal {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2) rotate(15deg);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 0.5;
  }
}

.ring-attack {
  animation: ring-attack-expand 0.6s ease-out forwards;
}

@keyframes ring-attack-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    border-color: rgba(239, 68, 68, 0.8);
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
    border-color: rgba(239, 68, 68, 0);
  }
}

.ring-heal {
  animation: ring-heal-expand 0.8s ease-out forwards;
}

@keyframes ring-heal-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    border-color: rgba(74, 222, 128, 0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
    border-color: rgba(74, 222, 128, 0);
  }
}

.ring-support {
  animation: ring-support-expand 1s ease-out forwards;
}

@keyframes ring-support-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    border-color: rgba(96, 165, 250, 0.8);
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
    border-color: rgba(96, 165, 250, 0);
  }
}

.ring-summon {
  animation: ring-summon-expand 1.2s ease-out forwards;
}

@keyframes ring-summon-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 1;
    border-color: rgba(168, 85, 247, 0.8);
  }
  33% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  66% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
    border-color: rgba(168, 85, 247, 0);
  }
}

.ring-special {
  animation: ring-special-expand 1.5s ease-out forwards;
}

@keyframes ring-special-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    opacity: 1;
    border-color: rgba(251, 191, 36, 0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5) rotate(360deg);
    opacity: 0;
    border-color: rgba(251, 191, 36, 0);
  }
}

.type-heal .effect-core {
  animation: heal-core-glow 0.8s ease-out forwards;
}

@keyframes heal-core-glow {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
    filter: brightness(1.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
    filter: brightness(2);
  }
}

.type-summon .effect-core {
  animation: summon-core-pulse 1s ease-out forwards;
}

@keyframes summon-core-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
}

.type-support .effect-particle {
  animation: support-particle-fly 1s ease-out forwards;
  animation-delay: var(--particle-delay);
}

@keyframes support-particle-fly {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(calc(-50% + var(--particle-x) * 0.5), calc(-50% + var(--particle-y) * 0.5)) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0);
    opacity: 0;
  }
}

.floating-texts-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 20;
}

.floating-text {
  position: absolute;
  font-size: 28rpx;
  font-weight: bold;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.8);
  animation: float-up 1.2s ease-out forwards;
  
  &.damage {
    color: #ef4444;
  }
  
  &.heal {
    color: #4ade80;
  }
  
  &.mp {
    color: #60a5fa;
  }
  
  &.heal .heal-icon {
    display: inline-block;
    margin-right: 4rpx;
    color: #4ade80;
    filter: drop-shadow(0 0 6rpx rgba(74, 222, 128, 0.8));
  }
  
  &.shaking {
    animation: damage-shake 0.3s ease-in-out, float-up 1.2s ease-out forwards;
  }
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) translateY(-20rpx) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-60rpx) scale(1);
  }
}

@keyframes damage-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-4rpx) rotate(-2deg); }
  20% { transform: translateX(4rpx) rotate(2deg); }
  30% { transform: translateX(-4rpx) rotate(-2deg); }
  40% { transform: translateX(4rpx) rotate(2deg); }
  50% { transform: translateX(-3rpx); }
  60% { transform: translateX(3rpx); }
  70% { transform: translateX(-2rpx); }
  80% { transform: translateX(2rpx); }
  90% { transform: translateX(-1rpx); }
}

/* 飘字属性颜色 */
.floating-text.attr-fire.damage { color: #ff6b35; text-shadow: 0 0 10rpx rgba(255, 107, 53, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }
.floating-text.attr-ice.damage { color: #7dd3fc; text-shadow: 0 0 10rpx rgba(125, 211, 252, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }
.floating-text.attr-thunder.damage { color: #fbbf24; text-shadow: 0 0 10rpx rgba(251, 191, 36, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }
.floating-text.attr-dark.damage { color: #a78bfa; text-shadow: 0 0 10rpx rgba(167, 139, 250, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }
.floating-text.attr-light.damage { color: #fde68a; text-shadow: 0 0 10rpx rgba(253, 230, 138, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }
.floating-text.attr-wind.damage { color: #86efac; text-shadow: 0 0 10rpx rgba(134, 239, 172, 0.8), 0 2rpx 4rpx rgba(0, 0, 0, 0.8); }

/* 飘字光晕效果 */
.floating-text.heal {
  text-shadow: 0 0 8rpx rgba(74, 222, 128, 0.6), 0 2rpx 4rpx rgba(0, 0, 0, 0.8);
}

.battle-row {
  display: flex;
  gap: 4rpx;
}

.battle-cell {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
  
  &.home-area {
    background: rgba(251, 191, 36, 0.1);
    border: 1rpx solid rgba(251, 191, 36, 0.3);
  }
  
  &.river {
    background: rgba(96, 165, 250, 0.2);
  }
  
  &.obstacle {
    background: rgba(156, 163, 175, 0.2);
  }
  
  &.snow-area {
    background: rgba(96, 165, 250, 0.2);
    border: 1rpx solid rgba(147, 197, 253, 0.5);
  }
  
  &.player-char {
    background: rgba(74, 222, 128, 0.3);
    border: 2rpx solid #4ade80;
  }
  
  &.enemy-char {
    background: rgba(239, 68, 68, 0.3);
    border: 2rpx solid #ef4444;
  }
  
  &.moveable {
    background: rgba(59, 130, 246, 0.3);
    border: 2rpx dashed #3b82f6;
  }
  
  &.attackable {
    background: rgba(239, 68, 68, 0.4);
    border: 2rpx dashed #ef4444;
  }
  
  &.line-attackable {
    background: rgba(168, 85, 247, 0.4);
    border: 2rpx dashed #a855f7;
  }

  &.target-selected {
    background: rgba(250, 204, 21, 0.6);
    border: 2rpx solid #f59e0b;
    box-shadow: 0 0 12rpx rgba(245, 158, 11, 0.8);
  }
  
  &.selected {
    box-shadow: 0 0 16rpx rgba(233, 69, 96, 0.5);
  }
}

.terrain-icon {
  font-size: 28rpx;
}

.snow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(147, 197, 253, 0.1);
  z-index: 1;
  pointer-events: none;
}

.snow-icon {
  font-size: 24rpx;
  animation: snowflake 2s infinite ease-in-out;
}

@keyframes snowflake {
  0%, 100% { opacity: 0.5; transform: translateY(0) rotate(0deg); }
  50% { opacity: 1; transform: translateY(-4rpx) rotate(10deg); }
}

.fire-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.2);
  z-index: 1;
  pointer-events: none;
}

.fire-icon {
  font-size: 28rpx;
  animation: fire 0.8s infinite ease-in-out;
}

@keyframes fire {
  0%, 100% { opacity: 0.7; transform: scale(1) rotate(-5deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(5deg); }
}

.fog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.fog-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cloud-puff {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 210, 225, 0.7) 0%, rgba(180, 195, 215, 0.5) 50%, rgba(160, 180, 200, 0.3) 100%);
  animation: cloudFloat 3s infinite ease-in-out;
  filter: blur(2rpx);
}

.cloud-puff.puff1 {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 3s;
}

.cloud-puff.puff2 {
  width: 60%;
  height: 60%;
  top: 25%;
  left: 30%;
  animation-delay: 0.5s;
  animation-duration: 2.5s;
}

.cloud-puff.puff3 {
  width: 50%;
  height: 50%;
  bottom: 15%;
  right: 10%;
  animation-delay: 1s;
  animation-duration: 3.5s;
}

.cloud-puff.puff4 {
  width: 40%;
  height: 40%;
  top: 20%;
  right: 20%;
  animation-delay: 1.5s;
  animation-duration: 2.8s;
}

@keyframes cloudFloat {
  0%, 100% { 
    opacity: 0.5; 
    transform: translate(0, 0) scale(1); 
  }
  25% {
    opacity: 0.7;
    transform: translate(3rpx, -2rpx) scale(1.05);
  }
  50% { 
    opacity: 0.6; 
    transform: translate(-2rpx, 2rpx) scale(0.95); 
  }
  75% {
    opacity: 0.8;
    transform: translate(2rpx, 1rpx) scale(1.02);
  }
}

.shaking {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4rpx); }
  40% { transform: translateX(4rpx); }
  60% { transform: translateX(-4rpx); }
  80% { transform: translateX(4rpx); }
}

.building-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.building-emoji {
  font-size: 28rpx;
}

.building-image {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
}

.building-hp-indicator {
  width: 40rpx;
  height: 3rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2rpx;
  margin-top: 2rpx;
  overflow: hidden;
}

.building-hp-mini-fill {
  height: 100%;
  border-radius: 2rpx;
  
  &.player-building-hp {
    background: linear-gradient(90deg, #4ade80, #22c55e);
  }
  
  &.enemy-building-hp {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }
}

.collectible-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collectible-emoji {
  font-size: 32rpx;
}

.collectible-image {
  width: 40rpx;
  height: 40rpx;
}

.character-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: visible;
}

.character-marker.highlighted .char-avatar-image {
  border: 3rpx solid #fbbf24;
  box-shadow: 0 0 10rpx #fbbf24, 0 0 20rpx #fbbf24;
}

.character-marker.highlighted .char-emoji {
  text-shadow: 0 0 10rpx #fbbf24, 0 0 20rpx #fbbf24;
}

.char-emoji {
  font-size: 32rpx;
}

.char-avatar-image {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.char-avatar-image.rank-1 {
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.char-avatar-image.rank-2 {
  border: 2rpx solid rgba(34, 197, 94, 0.8);
}

.char-avatar-image.rank-3 {
  border: 2rpx solid rgba(59, 130, 246, 0.8);
}

.char-avatar-image.rank-4 {
  border: 2rpx solid rgba(168, 85, 247, 0.8);
}

.char-avatar-image.rank-5 {
  border: 2rpx solid rgba(236, 72, 153, 0.8);
}

.char-avatar-image.rank-6 {
  border: 2rpx solid rgba(239, 68, 68, 0.8);
}

.char-avatar-image.rank-7,
.char-avatar-image.rank-8,
.char-avatar-image.rank-9 {
  border: 2rpx solid rgba(251, 191, 36, 0.8);
}

.hp-indicator {
  width: 40rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2rpx;
  margin-top: 2rpx;
  overflow: hidden;
  position: relative;
}

.hp-indicator.hp-flashing {
  animation: hp-shake 0.3s ease-in-out;
}

.hp-shockwave {
  position: absolute;
  top: 50%;
  left: var(--hp-width, 0%);
  width: 8rpx;
  height: 8rpx;
  background: rgba(255, 200, 50, 0.9);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: hp-shockwave 0.4s ease-out forwards;
  pointer-events: none;
}

@keyframes hp-shockwave {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.status-icons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 1rpx;
  max-width: 60rpx;
}

.status-icon {
  font-size: 12rpx;
  line-height: 1;
  margin: 0 0.5rpx;
}

.hp-mini-fill {
  height: 100%;
  border-radius: 2rpx;
  
  &.player-hp {
    background: linear-gradient(90deg, #4ade80, #22c55e);
  }
  
  &.enemy-hp {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }
}

.stat-panel {
  margin: 0 32rpx;
  margin-bottom: 12rpx;
}

.stat-panel-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
}

.stat-panel-title {
  font-size: 22rpx;
  color: #eaeaea;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.stat-grid {
  display: flex;
  gap: 16rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 20rpx;
  color: #a0aec0;
}

.stat-icon {
  font-size: 20rpx;
}

.stat-value {
  font-size: 20rpx;
  color: #eaeaea;
}

.action-panel {
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
}

.selected-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 16rpx;
}

.enemy-info {
  background: rgba(239, 68, 68, 0.1);
  border: 1rpx solid rgba(239, 68, 68, 0.3);
  border-radius: 16rpx;
  padding: 16rpx;
}

.enemy-hint {
  margin-top: 12rpx;
  text-align: center;
  font-size: 22rpx;
  color: #fca5a5;
  display: block;
}

.selected-name {
  font-size: 26rpx;
  color: #eaeaea;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 8rpx;
}

.selected-level {
  font-size: 22rpx;
  color: #fbbf24;
  font-weight: 500;
  display: inline-block;
  margin-left: 8rpx;
  margin-bottom: 8rpx;
}

.character-stats {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 20rpx;
  color: #a0aec0;
}

.status-panel {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 10rpx;
  padding: 8rpx 12rpx;
  background: rgba(139, 69, 19, 0.15);
  border-radius: 8rpx;
}

.status-label {
  font-size: 20rpx;
  color: #a0aec0;
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}

.status-tag {
  font-size: 18rpx;
  padding: 3rpx 8rpx;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 6rpx;
  color: #fca5a5;
}

.action-buttons {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.multi-target-panel {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: rgba(250, 204, 21, 0.15);
  border: 2rpx solid rgba(250, 204, 21, 0.4);
  border-radius: 8rpx;
}

.multi-target-info {
  color: #fbbf24;
  font-size: 22rpx;
  font-weight: 600;
  flex: 1;
}

.action-btn {
  flex: 1;
  min-width: 100rpx;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 24rpx;
  color: #eaeaea;
  transition: all 0.2s;
  
  &.move {
    background: rgba(59, 130, 246, 0.3);
    
    &:active:not(.disabled) {
      background: rgba(59, 130, 246, 0.5);
    }
  }
  
  &.attack {
    background: rgba(239, 68, 68, 0.3);
    
    &:active:not(.disabled) {
      background: rgba(239, 68, 68, 0.5);
    }
  }
  
  &.skill {
    background: rgba(168, 85, 247, 0.3);
    
    &:active:not(.disabled) {
      background: rgba(168, 85, 247, 0.5);
    }
  }
  
  &.defend {
    background: rgba(245, 158, 11, 0.3);
    
    &:active:not(.disabled) {
      background: rgba(245, 158, 11, 0.5);
    }
  }
  
  &.cancel {
    background: rgba(255, 255, 255, 0.1);
  }

  &.confirm-cast {
    flex: 0 0 auto;
    min-width: 160rpx;
    background: rgba(250, 204, 21, 0.4);
    color: #fff;

    &:active:not(.disabled) {
      background: rgba(250, 204, 21, 0.6);
    }
  }
  
  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.action-hint {
  margin-top: 12rpx;
  text-align: center;
  font-size: 22rpx;
  color: #a0aec0;
}

.no-selection {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #718096;
}

.bottom-buttons {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.bottom-btn {
  flex: 1;
  padding: 14rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  text-align: center;
  font-size: 22rpx;
  color: #eaeaea;
  transition: all 0.2s;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.end-turn {
    background: linear-gradient(135deg, #e94560, #c73e54);
    font-weight: 600;
  }
}

.skill-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.skill-panel {
  background: #1a1a2e;
  border-radius: 16rpx;
  width: 80%;
  max-height: 60vh;
  padding: 24rpx;
}

.skill-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.skill-panel-title {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 600;
}

.skill-close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #a0aec0;
}

.skill-list {
  max-height: 45vh;
}

.skill-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 14rpx;
  margin-bottom: 12rpx;
  transition: all 0.2s;
  
  &:active:not(.disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.skill-card-name {
  font-size: 24rpx;
  color: #eaeaea;
  font-weight: 600;
  display: block;
  margin-bottom: 4rpx;
}

.skill-card-tags {
  display: flex;
  gap: 8rpx;
  margin-bottom: 4rpx;
}

.skill-card-tag {
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  
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

.skill-card-desc {
  font-size: 20rpx;
  color: #a0aec0;
  display: block;
  margin-bottom: 6rpx;
}

.skill-card-info {
  display: flex;
  gap: 12rpx;
}

.skill-cost, .skill-cooldown {
  font-size: 18rpx;
  color: #60a5fa;
}

.skill-use-count {
  font-size: 18rpx;
  color: #f59e0b;
}

.skill-use-count.maxed {
  color: #ef4444;
  font-weight: bold;
}

.collectible-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.collectible-icon {
  font-size: 60rpx;
  margin-bottom: 12rpx;
}

.collectible-desc {
  font-size: 22rpx;
  color: #a0aec0;
  text-align: center;
}

.collectible-actions {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
}

.collectible-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 24rpx;
  color: #eaeaea;
  transition: all 0.2s;
  
  &.use {
    background: linear-gradient(135deg, #4ade80, #22c55e);
  }
  
  &.collect {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
}

.battle-log-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.log-content {
  background: #1a1a2e;
  border-radius: 16rpx;
  width: 80%;
  max-height: 60vh;
  padding: 24rpx;
}

.log-title {
  font-size: 28rpx;
  color: #eaeaea;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.log-scroll {
  max-height: 45vh;
}

.log-item {
  font-size: 22rpx;
  color: #a0aec0;
  line-height: 1.6;
  display: block;
  margin-bottom: 8rpx;
}

.log-close {
  margin-top: 16rpx;
  text-align: center;
  padding: 12rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #eaeaea;
}

/* 标签页样式 */
.log-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  padding: 4rpx;
}

.log-tab {
  flex: 1;
  text-align: center;
  padding: 12rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #a0aec0;
  transition: all 0.2s;
  
  &.active {
    background: rgba(59, 130, 246, 0.5);
    color: #eaeaea;
  }
  
  &.close-tab {
    &:active {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

/* 数据记录样式 */
.data-section {
  margin-bottom: 20rpx;
}

.data-section-title {
  font-size: 24rpx;
  color: #eaeaea;
  font-weight: 600;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
  border-left: 4rpx solid #3b82f6;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.data-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  
  image {
    width: 100%;
    height: 100%;
  }
}

.data-bar-container {
  flex: 1;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  overflow: hidden;
}

.data-bar {
  height: 100%;
  border-radius: 12rpx;
  transition: width 0.3s;
  
  &.player-bar {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }
  
  &.enemy-bar {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }
  
  &.heal-bar {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }
}

.data-value {
  width: 80rpx;
  font-size: 22rpx;
  color: #eaeaea;
  text-align: right;
}

.data-empty {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  padding: 16rpx;
}

.data-emoji {
  font-size: 32rpx;
}

/* 集结点相关样式 */
.battle-cell {
  &.gather-point-selectable {
    background: rgba(251, 191, 36, 0.15);
    border: 2rpx dashed #fbbf24;
  }
  
  &.gather-point-selected {
    background: rgba(251, 191, 36, 0.4);
    border: 2rpx solid #fbbf24;
  }
  
  &.gather-point {
    background: rgba(251, 191, 36, 0.2);
    border: 1rpx solid rgba(251, 191, 36, 0.5);
  }
}

/* 阵营指令弹窗样式 */
.faction-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.faction-content {
  background: #1a1a2e;
  border-radius: 16rpx;
  width: 85%;
  max-width: 600rpx;
  padding: 24rpx;
}

.faction-title {
  font-size: 30rpx;
  color: #eaeaea;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20rpx;
}

.faction-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.faction-option {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.2s;
  
  &.active {
    background: rgba(74, 222, 128, 0.15);
    border: 2rpx solid #4ade80;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.option-icon {
  font-size: 40rpx;
}

.option-name {
  font-size: 26rpx;
  color: #eaeaea;
  font-weight: 600;
}

.option-desc {
  font-size: 20rpx;
  color: #a0aec0;
  text-align: center;
}

/* 集结点选择样式 */
.gather-point-selection {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.selection-title {
  font-size: 26rpx;
  color: #eaeaea;
  font-weight: 600;
  text-align: center;
}

.selection-desc {
  font-size: 20rpx;
  color: #a0aec0;
  text-align: center;
  margin-bottom: 12rpx;
}

.gather-actions {
  display: flex;
  gap: 12rpx;
}

.gather-btn {
  flex: 1;
  padding: 14rpx;
  border-radius: 8rpx;
  text-align: center;
  font-size: 24rpx;
  color: #eaeaea;
  transition: all 0.2s;
  
  &.cancel {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.confirm {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    
    &.disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }
}

.faction-close {
  margin-top: 16rpx;
  text-align: center;
  padding: 12rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #eaeaea;
}

/* 集结点标记样式 */
.gather-point-marker {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gather-point-icon {
  font-size: 32rpx;
  animation: pulse 1.5s infinite;
}

/* 天启炮瞄准标记样式 */
.targeted-marker {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.2);
  border: 2rpx solid rgba(239, 68, 68, 0.6);
  border-radius: 8rpx;
}

.targeted-icon {
  font-size: 36rpx;
  animation: targeted-pulse 1s infinite;
}

@keyframes targeted-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.gather-point-bottom-bar {
  display: flex;
  flex-direction: column;
  padding: 16rpx 32rpx;
  background: rgba(0, 0, 0, 0.8);
  gap: 12rpx;
}

.gather-point-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.gather-point-title {
  font-size: 28rpx;
  color: #fbbf24;
  font-weight: 600;
}

.gather-point-desc {
  font-size: 22rpx;
  color: #a0aec0;
}

.gather-point-actions {
  display: flex;
  gap: 12rpx;
}

/* 战斗字幕样式 */
.battle-subtitle {
  position: absolute;
  bottom: 200rpx; /* 放在底部按钮上方 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75); /* 75% 透明度的黑色背景 */
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  z-index: 100;
  max-width: 90%;
  text-align: center;
  animation: subtitleAppear 0.3s ease-out;
}

.subtitle-text {
  font-size: 26rpx;
  color: #ffffff;
  line-height: 1.5;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
}

@keyframes subtitleAppear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 敌方角色技能列表样式 */
.enemy-skills {
  margin-top: 12rpx;
  width: 100%;
}

.skills-title {
  font-size: 22rpx;
  color: #a0aec0;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.skill-list-mini {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.skill-mini-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
  padding: 10rpx 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-mini-info {
  flex: 1;
}

.skill-mini-name {
  font-size: 20rpx;
  color: #eaeaea;
  font-weight: 600;
  display: block;
}

.skill-mini-tags {
  display: flex;
  gap: 6rpx;
  margin-top: 4rpx;
}

.skill-mini-tag {
  font-size: 14rpx;
  padding: 1rpx 8rpx;
  border-radius: 4rpx;
  white-space: nowrap;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  
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

.skill-mini-cooldown {
  font-size: 18rpx;
  color: #fbbf24;
  margin-left: 12rpx;
}

/* ============ 技能类型差异化特效 ============ */

/* 指定技能：目标锁定框 — 四角边框收缩动画 */
.skill-effect .effect-target-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid;
  border-radius: 6rpx;
  animation: target-frame 0.6s ease-out forwards;
  z-index: 5;
  pointer-events: none;
}

@keyframes target-frame {
  0% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
    border-width: 6rpx;
  }
  40% {
    opacity: 1;
    border-width: 4rpx;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0;
    border-width: 2rpx;
  }
}

/* AOE技能：中心爆炸环 — 双层同心环扩散 */
.skill-effect .effect-aoe-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70rpx;
  height: 70rpx;
  border: 5rpx solid;
  border-radius: 50%;
  animation: aoe-ring 0.8s ease-out forwards;
  z-index: 4;
  pointer-events: none;
}

.skill-effect .effect-aoe-ring::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 3rpx solid;
  border-radius: 50%;
  animation: aoe-ring-inner 0.6s ease-out 0.15s forwards;
  border-color: inherit;
}

@keyframes aoe-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.9;
  }
  60% {
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.2);
    opacity: 0;
  }
}

@keyframes aoe-ring-inner {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

/* 横扫/直线技能：方向指示 — 箭头形状 */
.skill-effect .effect-direction-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48rpx;
  height: 48rpx;
  z-index: 4;
  pointer-events: none;
  opacity: 0.7;
}

/* 横扫/直线方向：向上 */
.skill-effect .effect-direction-indicator.up {
  border-top: 4rpx solid;
  border-left: 4rpx solid;
  transform: translate(-50%, -50%) rotate(45deg);
  animation: dir-pulse 0.5s ease-out forwards;
}

/* 横扫/直线方向：向下 */
.skill-effect .effect-direction-indicator.down {
  border-bottom: 4rpx solid;
  border-right: 4rpx solid;
  transform: translate(-50%, -50%) rotate(45deg);
  animation: dir-pulse 0.5s ease-out forwards;
}

/* 横扫/直线方向：向左 */
.skill-effect .effect-direction-indicator.left {
  border-bottom: 4rpx solid;
  border-left: 4rpx solid;
  transform: translate(-50%, -50%) rotate(-45deg);
  animation: dir-pulse 0.5s ease-out forwards;
}

/* 横扫/直线方向：向右 */
.skill-effect .effect-direction-indicator.right {
  border-top: 4rpx solid;
  border-right: 4rpx solid;
  transform: translate(-50%, -50%) rotate(-45deg);
  animation: dir-pulse 0.5s ease-out forwards;
}

@keyframes dir-pulse {
  0% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
    filter: brightness(1.5);
  }
  100% {
    opacity: 0;
  }
}

/* 轰炸技能：随机火花 — 小爆炸点 */
.skill-effect .effect-bomb-spark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  animation: bomb-spark 0.7s ease-out forwards;
  z-index: 5;
  pointer-events: none;
  box-shadow: 0 0 14rpx currentColor;
}

@keyframes bomb-spark {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

.skill-effect .effect-xianzhen-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 4rpx solid;
  animation: xianzhen-ring 0.6s ease-out forwards;
  z-index: 5;
  pointer-events: none;
  box-shadow: 0 0 20rpx currentColor, inset 0 0 20rpx currentColor;
}

@keyframes xianzhen-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* ============ 类型组合动画 ============ */

/* 指定技能：锁定脉冲 */
.skill-effect.cat-指定 .effect-core {
  animation: core-target-lock 0.8s ease-out forwards;
}

@keyframes core-target-lock {
  0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  30% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.9; filter: brightness(1.8); }
  60% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
}

/* AOE技能：中心冲击 */
.skill-effect.cat-aoe .effect-core {
  animation: core-aoe-burst 0.8s ease-out forwards;
}

@keyframes core-aoe-burst {
  0% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
}

/* 横扫技能：滑动斩击 */
.skill-effect.cat-横扫 .effect-core {
  animation: core-sweep-slash 0.6s ease-out forwards;
}

@keyframes core-sweep-slash {
  0% { transform: translate(-50%, -50%) scale(1.3) skewX(15deg); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1) skewX(-10deg); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(0.5) skewX(0deg); opacity: 0; }
}

/* 直线技能：穿透冲击 */
.skill-effect.cat-直线 .effect-core {
  animation: core-line-pierce 0.5s ease-out forwards;
}

@keyframes core-line-pierce {
  0% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
  40% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; filter: brightness(2); }
  100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
}

/* 轰炸技能：多点爆炸 */
.skill-effect.cat-轰炸 .effect-core {
  animation: core-bomb-detonate 0.5s ease-out forwards;
}

@keyframes core-bomb-detonate {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  30% { transform: translate(-50%, -50%) scale(1.6); opacity: 0.9; filter: brightness(2.5); }
  100% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
}

/* ========== 受击闪白 + 血条冲击反馈 ========== */
@keyframes hit-flash-brightness {
  0% { filter: brightness(1); }
  20% { filter: brightness(3) saturate(1.5); }
  50% { filter: brightness(2) saturate(1.2); }
  100% { filter: brightness(1); }
}

.character-marker.hit-flashing {
  animation: hit-flash-brightness 0.4s ease-out;
}

.character-marker.hit-flashing::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  animation: hit-flash-white 0.35s ease-out;
}

@keyframes hit-flash-white {
  0% { opacity: 0.8; }
  50% { opacity: 0.3; }
  100% { opacity: 0; }
}

/* 血条闪红 */
@keyframes hp-flash-critical {
  0%, 100% { background-color: #f87171; }
  50% { background-color: #ffffff; }
}

.hp-indicator.hp-flashing {
  animation: hp-shake 0.3s ease-in-out;
}

.hp-indicator.hp-flashing .hp-mini-fill.hp-critical {
  animation: hp-flash-critical 0.3s ease-in-out;
}

@keyframes hp-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2rpx); }
  50% { transform: translateX(2rpx); }
  75% { transform: translateX(-2rpx); }
}

/* ========== 击杀/退场动画 ========== */
@keyframes defeat-kill {
  0% { transform: scale(1); opacity: 1; filter: brightness(1); }
  15% { transform: scale(1.3); filter: brightness(3); }
  30% { transform: scale(1.1) rotate(-5deg); filter: brightness(2); }
  50% { transform: scale(1) rotate(5deg); filter: brightness(1.5); }
  70% { transform: scale(0.7) rotate(-10deg); opacity: 0.7; }
  100% { transform: scale(0.2) rotate(180deg); opacity: 0; filter: brightness(0.5); }
}

@keyframes defeat-self {
  0% { transform: scale(1); opacity: 1; }
  20% { transform: scale(1.1); filter: brightness(1.5) blur(2rpx); }
  40% { transform: scale(0.9); filter: brightness(1.3) blur(4rpx); }
  60% { transform: scale(0.8); filter: blur(6rpx); opacity: 0.6; }
  100% { transform: scale(0.5); filter: blur(10rpx); opacity: 0; }
}

.character-marker.defeated-kill {
  animation: defeat-kill 0.8s ease-in forwards;
}

.character-marker.defeated-self {
  animation: defeat-self 1.2s ease-in forwards;
}

/* 退场粒子效果 */
.character-marker.defeated-kill::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(255,200,50,0.8) 0%, transparent 70%);
  pointer-events: none;
  animation: defeat-burst 0.6s ease-out forwards;
}

.character-marker.defeated-self::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(120, 80, 200, 0.7) 0%, transparent 70%);
  pointer-events: none;
  animation: self-defeat-dissolve 0.8s ease-out forwards;
}

@keyframes defeat-burst {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(2); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}

@keyframes self-defeat-dissolve {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.4; filter: blur(2rpx); }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; filter: blur(6rpx); }
}

/* ========== 投射物动画 ========== */
.projectiles-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  overflow: visible;
}

.projectile {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  pointer-events: none;
  z-index: 101;
  animation: projectile-fly var(--proj-duration, 300ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.projectile-body {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--proj-color, #fff);
  box-shadow: 0 0 10rpx var(--proj-color, #fff), 0 0 20rpx var(--proj-color, #fff);
}

.projectile-trail {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6rpx;
  height: 40rpx;
  transform: translate(-50%, -50%);
  background: linear-gradient(to bottom, var(--proj-color, #fff), transparent);
  border-radius: 3rpx;
  opacity: 0.7;
  animation: trail-fade var(--proj-duration, 300ms) ease-out forwards;
}

@keyframes projectile-fly {
  0% {
    left: calc(var(--proj-from-col) * 64rpx + 46rpx);
    top: calc(var(--proj-from-row) * 64rpx + 46rpx);
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  90% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    left: calc(var(--proj-to-col) * 64rpx + 46rpx);
    top: calc(var(--proj-to-row) * 64rpx + 46rpx);
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
}

@keyframes trail-fade {
  0%, 80% { opacity: 0.7; }
  100% { opacity: 0; }
}

/* 投射物类型样式 */
.projectile.proj-arrow .projectile-body {
  border-radius: 2rpx;
  transform: rotate(45deg);
}

.projectile.proj-fireball .projectile-body {
  border-radius: 50%;
  box-shadow: 0 0 15rpx #f87171, 0 0 30rpx #f87171, 0 0 45rpx #fb923c;
}

.projectile.proj-fireball .projectile-trail {
  background: linear-gradient(to bottom, #f87171, #fb923c, transparent);
}

.projectile.proj-ice-spike .projectile-body {
  border-radius: 50%;
  box-shadow: 0 0 15rpx #67e8f9, 0 0 30rpx #67e8f9;
  filter: hue-rotate(0deg);
}

.projectile.proj-dark-bolt .projectile-body {
  border-radius: 50%;
  box-shadow: 0 0 15rpx #A21CAF, 0 0 30rpx #A21CAF, 0 0 45rpx #7C3AED;
}

.projectile.proj-metal-blade .projectile-body {
  border-radius: 2rpx;
  box-shadow: 0 0 10rpx #f59e0b, 0 0 20rpx #f59e0b;
  transform: rotate(45deg);
}

.projectile.proj-fist .projectile-body {
  border-radius: 4rpx;
  box-shadow: 0 0 10rpx #eaeaea, 0 0 20rpx #eaeaea;
  animation: fist-punch var(--proj-duration, 200ms) cubic-bezier(0.5, 0, 0.5, 1) forwards;
}

@keyframes fist-punch {
  0% {
    left: calc(var(--proj-from-col) * 64rpx + 46rpx);
    top: calc(var(--proj-from-row) * 64rpx + 46rpx);
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(2);
  }
  70% {
    transform: translate(-50%, -50%) scale(2);
  }
  100% {
    left: calc(var(--proj-to-col) * 64rpx + 46rpx);
    top: calc(var(--proj-to-row) * 64rpx + 46rpx);
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
}

/* ========== 受击粒子飞溅特效 ========== */
.hit-sparks-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 85;
  overflow: visible;
}

.hit-spark {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.spark-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: currentColor;
  animation: spark-fly 0.5s ease-out forwards;
  animation-delay: var(--delay);
  transform-origin: center center;
}

/* 不同属性的粒子颜色 */
.hit-spark.attr-fire { color: #ff6b35; }
.hit-spark.attr-ice { color: #7dd3fc; }
.hit-spark.attr-thunder { color: #fbbf24; }
.hit-spark.attr-dark { color: #a78bfa; }
.hit-spark.attr-light { color: #fde68a; }
.hit-spark.attr-wind { color: #86efac; }
.hit-spark.attr-water { color: #60a5fa; }
.hit-spark.attr-metal { color: #d4d4d8; }
.hit-spark.attr-earth { color: #a3a380; }
.hit-spark.attr-wood { color: #4ade80; }
.hit-spark { color: #eaeaea; } /* 默认颜色 */

@keyframes spark-fly {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
    opacity: 0;
  }
}

/* ========== 状态施加视觉反馈 ========== */
.status-apply-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 90;
  overflow: visible;
}

.status-apply-effect {
  position: absolute;
  width: 64rpx;
  height: 64rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-apply-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3rpx solid currentColor;
  animation: status-ring-expand 1.2s ease-out forwards;
}

.status-positive .status-apply-ring {
  color: #4ade80;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, transparent 70%);
}

.status-negative .status-apply-ring {
  color: #f87171;
  background: radial-gradient(circle, rgba(248, 113, 113, 0.2) 0%, transparent 70%);
}

.status-apply-icon {
  font-size: 28rpx;
  animation: status-icon-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  filter: drop-shadow(0 0 6rpx currentColor);
}

.status-positive .status-apply-icon {
  color: #4ade80;
}

.status-negative .status-apply-icon {
  color: #f87171;
}

@keyframes status-ring-expand {
  0% { transform: scale(0.3); opacity: 0.8; border-width: 4rpx; }
  50% { transform: scale(1.5); opacity: 0.4; border-width: 2rpx; }
  100% { transform: scale(2.5); opacity: 0; border-width: 1rpx; }
}

@keyframes status-icon-pop {
  0% { transform: scale(0) translateY(0); opacity: 0; }
  30% { transform: scale(1.4) translateY(-10rpx); opacity: 1; }
  60% { transform: scale(1) translateY(-20rpx); opacity: 1; }
  100% { transform: scale(1.2) translateY(-40rpx); opacity: 0; }
}

/* 特殊状态颜色 */
.status-burning .status-apply-ring { color: #f87171; }
.status-poison .status-apply-ring { color: #8b5cf6; }
.status-bleeding .status-apply-ring { color: #dc2626; }
.status-imprison .status-apply-ring { color: #737373; }
.status-fragile .status-apply-ring { color: #facc15; }
.status-cold .status-apply-ring { color: #67e8f9; }
.status-fear .status-apply-ring { color: #6b7280; }
.status-disorder .status-apply-ring { color: #A21CAF; }
.status-xinluan .status-apply-ring { color: #ec4899; }
.status-strong .status-apply-ring { color: #ef4444; }
.status-swift .status-apply-ring { color: #3b82f6; }

/* ========== 召唤出场特效 ========== */
.summon-effects-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 95;
  overflow: visible;
}

.summon-effect {
  position: absolute;
  width: 64rpx;
  height: 64rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 光柱：从天而降 */
.summon-pillar {
  position: absolute;
  left: 50%;
  bottom: 50%;
  width: 40rpx;
  height: 200rpx;
  transform: translateX(-50%);
  background: linear-gradient(to top, var(--summon-color, #fbbf24), transparent);
  border-radius: 20rpx;
  opacity: 0;
  animation: summon-pillar-descend 1.5s ease-out forwards;
}

@keyframes summon-pillar-descend {
  0% {
    height: 0;
    opacity: 0;
    filter: brightness(3);
  }
  20% {
    height: 200rpx;
    opacity: 0.9;
    filter: brightness(2.5);
  }
  60% {
    height: 200rpx;
    opacity: 0.6;
    filter: brightness(1.5);
  }
  100% {
    height: 200rpx;
    opacity: 0;
    filter: brightness(1);
  }
}

/* 地面法阵：旋转扩散 */
.summon-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56rpx;
  height: 56rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 3rpx solid var(--summon-color, #fbbf24);
  box-shadow: 0 0 20rpx var(--summon-color, #fbbf24), inset 0 0 15rpx var(--summon-color, #fbbf24);
  opacity: 0;
  animation: summon-circle-rotate 1.5s ease-out forwards;
}

@keyframes summon-circle-rotate {
  0% {
    transform: translate(-50%, -50%) scale(0.2) rotate(0deg);
    opacity: 0;
    border-width: 6rpx;
  }
  20% {
    transform: translate(-50%, -50%) scale(1) rotate(72deg);
    opacity: 1;
    border-width: 4rpx;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.1) rotate(360deg);
    opacity: 0.7;
    border-width: 3rpx;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5) rotate(720deg);
    opacity: 0;
    border-width: 1rpx;
  }
}

/* 扩散光环 */
.summon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40rpx;
  height: 40rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 4rpx solid var(--summon-color, #fbbf24);
  opacity: 0;
  animation: summon-ring-expand 1s ease-out 0.3s forwards;
}

@keyframes summon-ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

/* 上升粒子 */
.summon-particle {
  position: absolute;
  bottom: 50%;
  left: 50%;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--summon-color, #fbbf24);
  box-shadow: 0 0 10rpx var(--summon-color, #fbbf24);
  opacity: 0;
  animation: summon-particle-rise 1.2s ease-out 0.2s forwards;
}

.summon-particle-1 { --px: -20rpx; --py: -80rpx; animation-delay: 0.1s; }
.summon-particle-2 { --px: 15rpx; --py: -90rpx; animation-delay: 0.25s; }
.summon-particle-3 { --px: -10rpx; --py: -100rpx; animation-delay: 0.4s; }
.summon-particle-4 { --px: 20rpx; --py: -85rpx; animation-delay: 0.55s; }

@keyframes summon-particle-rise {
  0% {
    transform: translate(-50%, 0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translate(calc(-50% + var(--px) * 0.3), calc(var(--py) * 0.3)) scale(1.2);
  }
  60% {
    opacity: 0.8;
    transform: translate(calc(-50% + var(--px) * 0.7), calc(var(--py) * 0.7)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--px)), var(--py)) scale(0.3);
  }
}

/* 属性颜色 */
.summon-attr-light { --summon-color: #fbbf24; }
.summon-attr-dark { --summon-color: #7c3aed; }
.summon-attr-fire { --summon-color: #ff6b35; }
.summon-attr-water { --summon-color: #3b82f6; }
.summon-attr-wind { --summon-color: #86efac; }
.summon-attr-earth { --summon-color: #d97706; }
.summon-attr-metal { --summon-color: #a855f7; }
.summon-attr-wood { --summon-color: #22c55e; }
.summon-attr-normal { --summon-color: #eaeaea; }

/* ========== 移动轨迹粒子 ========== */
.move-trail-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 85;
  overflow: visible;
}

.move-trail-particle {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: trail-particle-fade 0.5s ease-out forwards;
}

.move-trail-particle.trail-player {
  background: #60a5fa;
  box-shadow: 0 0 8rpx #60a5fa, 0 0 16rpx rgba(96, 165, 250, 0.5);
}

.move-trail-particle.trail-enemy {
  background: #f87171;
  box-shadow: 0 0 8rpx #f87171, 0 0 16rpx rgba(248, 113, 113, 0.5);
}

@keyframes trail-particle-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}

/* ============ 元素粒子尾迹层 ============ */
.trail-particles-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 11;
}

.trail-particle {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: trail-particle-appear 1.6s ease-out forwards;

  &.small { width: 40rpx; height: 40rpx; }
  &.medium { width: 60rpx; height: 60rpx; }
  &.large { width: 80rpx; height: 80rpx; }
}

.trail-particle .trail-core {
  position: absolute;
  top: 50%; left: 50%;
  width: 40%;
  height: 40%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--trail-color);
  box-shadow: 0 0 16rpx var(--trail-color), 0 0 32rpx var(--trail-color);
  animation: trail-core-pulse 0.6s ease-out forwards;
}

.trail-particle .trail-glow {
  position: absolute;
  top: 50%; left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, var(--trail-color) 0%, transparent 70%);
  opacity: 0.8;
  animation: trail-glow-expand 1.6s ease-out forwards;
}

@keyframes trail-particle-appear {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
  30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

@keyframes trail-core-pulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

@keyframes trail-glow-expand {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

/* ============ 技能蓄力特效层 ============ */
.charge-effects-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 12;
}

.charge-effect {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 120rpx;
  height: 120rpx;
  animation: charge-appear 0.8s ease-out forwards;
}

.charge-effect .charge-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 4rpx solid var(--charge-color);
  box-shadow: 0 0 12rpx var(--charge-color), inset 0 0 12rpx var(--charge-color);
}

.charge-effect .charge-ring-outer {
  width: 120rpx;
  height: 120rpx;
  animation: charge-ring-outer 0.8s ease-out forwards;
}

.charge-effect .charge-ring-inner {
  width: 80rpx;
  height: 80rpx;
  animation: charge-ring-inner 0.6s ease-out forwards;
}

.charge-effect .charge-core {
  position: absolute;
  top: 50%; left: 50%;
  width: 30rpx;
  height: 30rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--charge-color);
  box-shadow: 0 0 20rpx var(--charge-color), 0 0 40rpx var(--charge-color);
  animation: charge-core-pulse 0.8s ease-in-out infinite alternate;
}

.charge-effect .charge-spark {
  position: absolute;
  top: 50%; left: 50%;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--charge-color);
  box-shadow: 0 0 8rpx var(--charge-color);
  animation: charge-spark-fly 0.8s ease-out forwards;
}

.charge-effect .charge-spark-1 { --angle: 0deg; }
.charge-effect .charge-spark-2 { --angle: 90deg; }
.charge-effect .charge-spark-3 { --angle: 180deg; }
.charge-effect .charge-spark-4 { --angle: 270deg; }

@keyframes charge-appear {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

@keyframes charge-ring-outer {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

@keyframes charge-ring-inner {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
}

@keyframes charge-core-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); filter: brightness(1); }
  100% { transform: translate(-50%, -50%) scale(1.3); filter: brightness(1.6); }
}

@keyframes charge-spark-fly {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40rpx) scale(0.3);
    opacity: 0;
  }
}

/* ============ 环境交互痕迹层 ============ */
.terrain-marks-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.terrain-mark {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 60rpx;
  height: 60rpx;
  animation: mark-fade-in 0.4s ease-out forwards;
}

@keyframes mark-fade-in {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  100% { opacity: 0.95; transform: translate(-50%, -50%) scale(1); }
}

/* 焦黑痕迹 */
.terrain-mark.mark-scorch .scorch-mark {
  position: absolute;
  border-radius: 50%;
  background: #1a0808;
  box-shadow: 0 0 8rpx rgba(80, 20, 20, 0.6);
}

.terrain-mark.mark-scorch .scorch-base {
  top: 50%; left: 50%;
  width: 50rpx; height: 50rpx;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, #1a0808 0%, #3d1a0a 60%, transparent 100%);
  border-radius: 50%;
}

.terrain-mark.mark-scorch .scorch-spot-1 {
  top: 30%; left: 30%;
  width: 12rpx; height: 12rpx;
  animation: scorch-pulse 3s ease-in-out infinite;
}

.terrain-mark.mark-scorch .scorch-spot-2 {
  top: 60%; left: 55%;
  width: 10rpx; height: 10rpx;
  animation: scorch-pulse 3s ease-in-out infinite 1s;
}

.terrain-mark.mark-scorch .scorch-spot-3 {
  top: 45%; left: 70%;
  width: 8rpx; height: 8rpx;
  animation: scorch-pulse 3s ease-in-out infinite 2s;
}

@keyframes scorch-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* 冰晶痕迹 */
.terrain-mark.mark-frost .frost-mark {
  position: absolute;
  pointer-events: none;
}

.terrain-mark.mark-frost .frost-crystal {
  top: 50%; left: 50%;
  width: 14rpx; height: 14rpx;
  background: linear-gradient(135deg, #b8f0ff 0%, #67e8f9 50%, #ffffff 100%);
  box-shadow: 0 0 8rpx #67e8f9, 0 0 16rpx rgba(103, 232, 249, 0.5);
  transform-origin: center;
  animation: frost-shimmer 2s ease-in-out infinite;
}

.terrain-mark.mark-frost .frost-crystal-1 { transform: translate(-50%, -50%) rotate(0deg); }
.terrain-mark.mark-frost .frost-crystal-2 { transform: translate(-50%, -50%) rotate(60deg); width: 10rpx; height: 10rpx; animation-delay: 0.3s; }
.terrain-mark.mark-frost .frost-crystal-3 { transform: translate(-50%, -50%) rotate(120deg); width: 8rpx; height: 8rpx; animation-delay: 0.6s; }

.terrain-mark.mark-frost .frost-glow {
  top: 50%; left: 50%;
  width: 60rpx; height: 60rpx;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(184, 240, 255, 0.5) 0%, transparent 70%);
  border-radius: 50%;
  animation: frost-glow-pulse 2s ease-in-out infinite;
}

@keyframes frost-shimmer {
  0%, 100% { opacity: 0.9; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.3); }
}

@keyframes frost-glow-pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
}

/* 腐蚀痕迹 */
.terrain-mark.mark-poison .poison-mark {
  position: absolute;
  border-radius: 50%;
}

.terrain-mark.mark-poison .poison-base {
  top: 50%; left: 50%;
  width: 50rpx; height: 50rpx;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(80, 20, 120, 0.5) 0%, rgba(120, 50, 160, 0.3) 60%, transparent 100%);
}

.terrain-mark.mark-poison .poison-bubble {
  background: #a855f7;
  box-shadow: 0 0 6rpx #a855f7, 0 0 12rpx rgba(168, 85, 247, 0.6);
  animation: poison-bubble-rise 3s ease-in-out infinite;
}

.terrain-mark.mark-poison .poison-bubble-1 {
  top: 55%; left: 40%;
  width: 10rpx; height: 10rpx;
}

.terrain-mark.mark-poison .poison-bubble-2 {
  top: 40%; left: 60%;
  width: 8rpx; height: 8rpx;
  animation-delay: 0.8s;
}

.terrain-mark.mark-poison .poison-bubble-3 {
  top: 50%; left: 70%;
  width: 6rpx; height: 6rpx;
  animation-delay: 1.6s;
}

@keyframes poison-bubble-rise {
  0% { transform: translateY(0); opacity: 0.8; }
  50% { transform: translateY(-8rpx); opacity: 1; }
  100% { transform: translateY(-16rpx); opacity: 0; }
}

/* ============ 死亡特效层 ============ */
.death-effects-layer {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 20;
}

.death-effect {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 120rpx;
  height: 120rpx;
}

.death-effect .death-flash {
  position: absolute;
  top: 50%; left: 50%;
  width: 80rpx;
  height: 80rpx;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--death-color) 0%, transparent 70%);
  border-radius: 50%;
  animation: death-flash 0.6s ease-out forwards;
}

.death-effect .death-ring {
  position: absolute;
  top: 50%; left: 50%;
  width: 60rpx;
  height: 60rpx;
  transform: translate(-50%, -50%);
  border: 4rpx solid var(--death-color);
  border-radius: 50%;
  box-shadow: 0 0 16rpx var(--death-color);
  animation: death-ring 1.4s ease-out forwards;
}

.death-effect .death-particle {
  position: absolute;
  top: 50%; left: 50%;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--death-color);
  box-shadow: 0 0 10rpx var(--death-color), 0 0 20rpx var(--death-color);
  transform: translate(-50%, -50%);
  animation: death-particle-fly 1.5s ease-out forwards;
}

.death-effect .death-particle-1 { --angle: 0deg; --dist: 50rpx; }
.death-effect .death-particle-2 { --angle: 45deg; --dist: 48rpx; animation-delay: 0.05s; }
.death-effect .death-particle-3 { --angle: 90deg; --dist: 52rpx; animation-delay: 0.1s; }
.death-effect .death-particle-4 { --angle: 135deg; --dist: 46rpx; animation-delay: 0.15s; }
.death-effect .death-particle-5 { --angle: 180deg; --dist: 50rpx; animation-delay: 0.2s; }
.death-effect .death-particle-6 { --angle: 225deg; --dist: 48rpx; animation-delay: 0.25s; }
.death-effect .death-particle-7 { --angle: 270deg; --dist: 52rpx; animation-delay: 0.3s; }
.death-effect .death-particle-8 { --angle: 315deg; --dist: 46rpx; animation-delay: 0.35s; }

@keyframes death-flash {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  30% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

@keyframes death-ring {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border-width: 2rpx; }
}

@keyframes death-particle-fly {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(var(--dist) * -1)) scale(0.2);
    opacity: 0;
  }
}
</style>
