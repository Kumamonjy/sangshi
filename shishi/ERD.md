# 苍穹战纪 - 技术架构文档

## 1. 项目概述

### 1.1 项目名称
苍穹战纪 (SangShi)

### 1.2 项目类型
回合制战棋策略游戏

### 1.3 技术栈
- **前端框架**：uni-app + Vue 3
- **状态管理**：Pinia
- **样式预处理器**：SCSS
- **编程语言**：TypeScript
- **目标平台**：Android APP

---

## 2. 数据模型

### 2.1 实体关系图

```mermaid
erDiagram
    Player {
        string id PK
        string name
        int gold
        int day
        string phase "白天|晚上"
        array characters Character[]
        array inventory Item[]
        timestamp createdAt
        timestamp updatedAt
    }

    Character {
        string id PK
        string name
        string faction "人|鬼|仙|魔|妖|神"
        string job "天命人|士兵|机甲|厉鬼|普通丧尸|变异丧尸|炼气修士|筑基修士|魔兽|魔族"
        int level
        int exp
        int baseMaxHp
        int maxHp
        int hp
        int baseMaxMp
        int maxMp
        int mp
        int baseAttack
        int attack
        int baseDefense
        int defense
        int baseMoveRange
        int moveRange
        int baseAttackRange
        int attackRange
        array skills Skill[]
        Equipment equipment
        string avatar
        boolean isPlayerOwned
        float defenseReduction
        int growthMaxHp
        int growthMaxMp
        int growthAttack
        int growthDefense
    }

    Skill {
        string id PK
        string name
        int mpCost
        string type "攻击|治疗|辅助|被动"
        int power
        int cooldown
        int currentCooldown
        string description
        int range "技能释放范围（格子数）"
        int areaRange "范围技能的影响半径"
        int targetCount "多目标技能的目标数量"
        string effectType "fire|ice|thunder|shadow|holy"
        string attribute "normal|metal|wood|water|fire|earth|wind|ice|dark|yang"
    }

    Equipment {
        Item weapon "FK"
        Item armor "FK"
        Item helmet "FK"
        Item shoes "FK"
        Item accessory "FK"
    }

    Item {
        string id PK
        string name
        string icon
        string type "装备|消耗品"
        string rarity "普通|精良|非凡|珍宝|仙品|绝世"
        string subtype "weapon|armor|helmet|shoes|accessory|consumable"
        int count
        int level
        ItemStats baseStats
        string description
        string grantedSkillId "装备附带的技能ID"
    }

    ItemStats {
        int attack
        int defense
        int hp
        int mp
        int moveRange
        int attackRange
        float attackPercent
        float defensePercent
        float hpPercent
        float mpPercent
    }

    Building {
        string id PK
        string name
        string type "灵田|丹房|血心|兵营|天启炮"
        int maxHp
        int hp
        int defense
        int row
        int col
        boolean isPlayer
        int totalDamage
    }

    BattleMap {
        string id PK
        int width
        int height
        string mode "进攻|防御"
        string terrainType "河流|平原|山地"
        array tiles BattleTile[]
        array players BattleCharacter[]
        array enemies BattleCharacter[]
        array buildings BattleBuilding[]
        array collectibles BattleCollectible[]
        array loot Item[]
        int turn
        string phase "player|enemy|action"
        string weather "clear|rain|snow|light_snow|medium_snow|heavy_snow"
        array snowAreas SnowArea[]
        int enemyLevel
        int initialEnemyCount
        array defeatedCharacters BattleCharacter[]
        array destroyedBuildings BattleBuilding[]
    }

    BattleTile {
        int row
        int col
        string terrain "empty|river|obstacle"
        BattleCharacter character "FK"
        BattleBuilding building "FK"
    }

    BattleCharacter {
        string id PK
        string characterId "FK"
        int row
        int col
        int hp
        int mp
        int maxHp "战斗中血量上限（含装备加成+技能提升）"
        int maxMp "战斗中法力上限（含装备加成）"
        boolean hasMoved
        boolean hasActed
        boolean isDefending
        boolean isPlayer
        int level
        float defenseReduction
        float defenseReductionPermanent
        array skillCooldowns
        int movedDistance
        int totalDamage
        int totalHeal
        float attackBoost
        int attack "带装备加成的攻击力"
        int defense "带装备加成的防御力"
    }

    BattleBuilding {
        string id PK
        string type
        string name
        int maxHp
        int hp
        int row
        int col
        boolean isPlayer
        boolean hasSpawnedBonus
        array targetPositions "天启炮瞄准位置"
        int totalDamage
    }

    BattleCollectible {
        string id PK
        string type "spirit_grass|elixir"
        string name
        string icon
        string description
        int hpRestore
        int mpRestore
        int row
        int col
    }

    SnowArea {
        int row
        int col
        string source "weather|skill"
        string expiresAfterPhase "enemy|player"
    }

    GameSave {
        string id PK
        string playerData JSON
        timestamp savedAt
    }

    Player ||--o{ Character : "拥有"
    Player ||--o{ Item : "背包"
    Character ||--|| Equipment : "装备"
    Character ||--o{ Skill : "技能"
    Equipment ||--|| Item : "武器"
    Equipment ||--|| Item : "防具"
    Equipment ||--|| Item : "头盔"
    Equipment ||--|| Item : "鞋子"
    Equipment ||--|| Item : "饰品"
    BattleMap ||--o{ BattleCharacter : "玩家角色"
    BattleMap ||--o{ BattleCharacter : "敌人"
    BattleMap ||--o{ BattleBuilding : "建筑"
    BattleMap ||--o{ BattleTile : "地图格子"
    BattleMap ||--o{ BattleCollectible : "收集品"
    BattleMap ||--o{ SnowArea : "雪地"
    BattleTile ||--|| BattleCharacter : "角色"
    BattleTile ||--|| BattleBuilding : "建筑"
```

---

## 3. 核心接口定义

### 3.1 Player 接口
```typescript
interface Player {
  id: string
  name: string
  gold: number
  day: number
  phase: 'day' | 'night'
  characters: Character[]
  inventory: Item[]
  homeGrid: HomeGridCell[][]
  createdAt: number
  updatedAt: number
}
```

### 3.2 Character 接口
```typescript
interface Character {
  id: string
  name: string
  faction: Faction
  job: Job
  level: number
  exp: number
  baseMaxHp: number
  maxHp: number
  hp: number
  baseMaxMp: number
  maxMp: number
  mp: number
  baseAttack: number
  attack: number
  baseDefense: number
  defense: number
  baseMoveRange: number
  moveRange: number
  baseAttackRange: number
  attackRange: number
  skills: Skill[]
  equipment: Equipment
  avatar: string
  isPlayerOwned: boolean
  defenseReduction: number
  growthMaxHp: number
  growthMaxMp: number
  growthAttack: number
  growthDefense: number
}

type Faction = 'human' | 'ghost' | 'beast' | 'immortal' | 'god' | 'demon'
type Job = '天命人' | '士兵' | '机甲' | '普通丧尸' | '变异丧尸' | '炼气修士' | '筑基修士'
```

### 3.3 Skill 接口
```typescript
interface Skill {
  id: string
  name: string
  mpCost: number
  type: 'attack' | 'heal' | 'support' | 'passive' | 'special' | 'summon'
  power: number
  cooldown: number
  currentCooldown: number
  description?: string
  range?: number
  areaRange?: number
  targetCount?: number
  effectType?: 'fire' | 'ice' | 'thunder' | 'shadow' | 'holy' | 'water' | 'metal' | 'wood' | 'earth' | 'wind' | 'dark' | 'yang'
  attribute?: 'normal' | 'metal' | 'wood' | 'water' | 'fire' | 'earth' | 'wind' | 'ice' | 'dark' | 'yang'
  category?: 'single' | 'aoe' | 'multi' | 'support' | 'summon' | 'special'
}
```

### 3.4 Item 接口
```typescript
interface Item {
  id: string
  name: string
  icon: string
  type: 'equipment' | 'consumable'
  rarity: Rarity
  level: number
  subtype?: ItemSubtype
  count: number
  baseStats?: ItemStats
  description?: string
}

type Rarity = 'common' | 'rare' | 'exceptional' | 'treasure' | 'celestial' | 'peerless'
type ItemSubtype = 'weapon' | 'armor' | 'helmet' | 'shoes' | 'accessory' | 'consumable'
```

### 3.5 Equipment 接口
```typescript
interface Equipment {
  weapon: Item | null
  armor: Item | null
  helmet: Item | null
  shoes: Item | null
  accessory: Item | null
}
```

### 3.6 ItemStats 接口
```typescript
interface ItemStats {
  attack?: number
  defense?: number
  hp?: number
  mp?: number
  moveRange?: number
  attackRange?: number
  attackPercent?: number
  defensePercent?: number
  hpPercent?: number
  mpPercent?: number
}
```

### 3.7 Building 接口
```typescript
interface Building {
  id: string
  type: 'spiritField' | 'elixirRoom' | 'heart' | 'barracks' | 'tianqiPao'
  name: string
  icon: string
  maxHp: number
  hp: number
}

interface BattleBuilding {
  id: string
  type: 'spiritField' | 'elixirRoom' | 'heart' | 'barracks' | 'tianqiPao'
  name: string
  icon: string
  maxHp: number
  hp: number
  row: number
  col: number
  isPlayer: boolean
  spawnRound: number
  hasSpawnedBonus: boolean
  targetPositions?: { row: number; col: number }[]
  totalDamage?: number
}
```

### 3.8 BattleMap 接口
```typescript
interface BattleMap {
  id: string
  width: number
  height: number
  mode: 'offensive' | 'defensive'
  terrainType: string
  tiles: BattleTile[][]
  players: BattleCharacter[]
  enemies: BattleCharacter[]
  buildings: BattleBuilding[]
  collectibles: BattleCollectible[]
  loot: Item[]
  heartPosition?: { row: number; col: number }
  turn: number
  battlePhase: 'player' | 'enemy' | 'action'
  weather: WeatherType
  snowAreas: SnowArea[]
  enemyLevel: number
  initialEnemyCount: number
  defeatedCharacters: BattleCharacter[]
  destroyedBuildings: BattleBuilding[]
}

type WeatherType = 'normal' | 'light_snow' | 'medium_snow' | 'heavy_snow'
```

### 3.9 BattleCharacter 接口
```typescript
interface BattleCharacter {
  id: string
  characterId: string
  row: number
  col: number
  hp: number
  mp: number
  maxHp: number
  maxMp: number
  hasMoved: boolean
  hasActed: boolean
  isDefending: boolean
  isPlayer: boolean
  level: number
  defenseReduction?: number
  defenseReductionPermanent?: number
  attackBoost?: number
  skillCooldowns?: Record<string, number>
  movedDistance?: number
  totalDamage?: number
  totalHeal?: number
  attack: number
  defense: number
}
```

### 3.10 BattleTile 接口
```typescript
interface BattleTile {
  row: number
  col: number
  terrain: TerrainType
  character: BattleCharacter | null
  building: BattleBuilding | null
}

type TerrainType = 'empty' | 'river' | 'obstacle'
```

### 3.11 BattleCollectible 接口
```typescript
interface BattleCollectible {
  id: string
  type: 'spirit_grass' | 'elixir'
  name: string
  icon: string
  description: string
  hpRestore?: number
  mpRestore?: number
  row: number
  col: number
}
```

### 3.12 SnowArea 接口
```typescript
interface SnowArea {
  row: number
  col: number
  source?: 'weather' | 'skill'
  expiresAfterPhase?: 'enemy' | 'player'
}
```

### 3.13 HomeGridCell 接口
```typescript
interface HomeGridCell {
  row: number
  col: number
  terrain: TerrainType
  building: Building | null
}
```

### 3.14 存储相关接口
```typescript
interface StorageResult {
  success: boolean
  message?: string
  filePath?: string
  content?: string
}

interface SaveSlot {
  id: number
  name: string
  savedAt: number
  version: string
  player: Player | null
}
```

---

## 4. 状态管理

### 4.1 Pinia Store 结构
```typescript
// gameStore.ts
export const useGameStore = defineStore('game', {
  state: () => ({
    player: null as Player | null,
    currentCharacter: null as Character | null,
    battleMap: null as BattleMap | null,
    isInBattle: false,
    isLoading: false,
    shakingTargets: [] as { row: number; col: number; type: 'character' | 'building' }[],
    battleLog: [] as string[],
    targetedByTianqiPao: [] as { row: number; col: number }[],
    factionCommand: 'free' as FactionCommand,
    gameSpeed: 1 as number,
  }),
  
  getters: {
    aliveCharacters: (state) => { /* 返回存活的角色 */ },
    totalAttack: (state) => {
      if (!state.currentCharacter) return 0
      const base = state.currentCharacter.attack
      const equipment = getEquipmentBonus(state.currentCharacter)
      return base + equipment.attack
    },
    totalDefense: (state) => {
      if (!state.currentCharacter) return 0
      const base = state.currentCharacter.defense
      const equipment = getEquipmentBonus(state.currentCharacter)
      const defenseBonus = state.currentCharacter.isDefending ? 1.2 : 1
      const reduction = state.currentCharacter.defenseReduction || 0
      return (base + equipment.defense) * defenseBonus * (1 - reduction)
    },
    totalMaxHp: (state) => { /* 计算总最大生命值 */ },
    totalMaxMp: (state) => { /* 计算总最大法力值 */ },
    totalMoveRange: (state) => { /* 计算总移动范围 */ },
    totalAttackRange: (state) => { /* 计算总攻击范围 */ },
  },
  
  actions: {
    initGame(),
    loadGame(tryExternal?: boolean),
    saveGame(),
    saveToSlot(slotId: number, name: string),
    loadFromSlot(slotId: number),
    getSaveSlots(),
    hireCharacter(characterTemplate),
    equipItem(characterId: string, itemId: string),
    unequipItem(characterId: string, slot: string),
    useItem(itemId: string),
    updateCharacterStats(character: Character),
    updateHomeGrid(row: number, col: number, data: Partial<HomeGridCell>),
    startBattle(mode: string, terrain: string, difficulty: string, selectedIds: string[], factions: string[]),
    moveCharacter(characterId: string, row: number, col: number),
    getCharacterMoveRange(character: BattleCharacter),
    attack(attackerId: string, targetId: string),
    attackBuilding(attackerId: string, buildingId: string),
    useSkill(skillId: string, attackerId: string, targetId?: string, targetPos?: {row: number, col: number}, multiTargets?: string[]),
    calculateDamage(attacker: BattleCharacter, target: BattleCharacter | BattleBuilding),
    defend(characterId: string),
    endPlayerTurn(),
    executeEnemyTurn(),
    executeCharacterAi(character: BattleCharacter, isPlayer: boolean),
    executeAttackMode(character: BattleCharacter),
    executeGatherMode(character: BattleCharacter),
    checkBattleEnd(),
    endBattle(victory: boolean, isEscape: boolean),
    nextPhase(),
    restoreResources(percent: number),
    addBattleLog(log: string),
    triggerShake(row: number, col: number, type: 'character' | 'building'),
    removeCharacterFromBattle(charId: string, isPlayer: boolean),
    removeBuildingFromBattle(buildingId: string),
    collectItem(characterId: string, itemId: string),
    getRandomRarity(): Rarity,
    getEquipmentStats(item: Item): ItemStats,
    getExpRequired(level: number): number,
    openChest(): Item,
    setFactionCommand(command: FactionCommand),
    addGatheringPoint(row: number, col: number),
    removeGatheringPoint(row: number, col: number),
    confirmGatheringPoints(),
    toggleGatherPointSelection(active: boolean),
    executeBuildingAction(building: BattleBuilding),
  }
})
```

---

## 5. 角色与技能配置

### 5.1 阵营配置
```typescript
export const FACTION_CONFIG: Record<Faction, { name: string; icon: string; color: string }> = {
  human: { name: '人界', icon: '👤', color: '#4ade80' },
  ghost: { name: '鬼界', icon: '👻', color: '#9333ea' },
  beast: { name: '妖界', icon: '🦊', color: '#f97316' },
  immortal: { name: '仙界', icon: '☁️', color: '#60a5fa' },
  god: { name: '神界', icon: '⭐', color: '#fbbf24' },
  demon: { name: '魔界', icon: '🔥', color: '#ef4444' },
}
```

### 5.2 角色属性标签（Job 配置）
| 属性标签（job） | 对应角色 | 说明 |
|---------------|----------|------|
| 天命人 | 熊熊、兔兔、大黑熊 | 初始核心角色 |
| 士兵 | 恶霸、潜伏者、狙击手、特种兵、狂人、动员兵 | 人界雇佣角色 |
| 机甲 | 歌莉娅 | 人界特殊远程机械单位 |
| 普通丧尸 | 普通丧尸、小鬼丧尸 | 鬼界基础近战单位 |
| 变异丧尸 | 肥胖丧尸、迅猛丧尸、爬行丧尸、长舌丧尸、法老丧尸、尖叫丧尸 | 鬼界高级单位 |
| 炼气修士 | 男修士、女修士 | 仙界基础远程单位 |
| 筑基修士 | 金系修士、木系修士、水系修士、土系修士、火系修士 | 仙界高级单位 |

### 5.3 核心技能配置
```typescript
export const SKILL_TEMPLATES: Record<string, Omit<Skill, 'currentCooldown'>> = {
  // 初始角色技能
  po_kong_zhan: { id: 'po_kong_zhan', name: '破空斩', mpCost: 30, type: 'attack', power: 150, cooldown: 3, range: 1, description: '对相邻1格范围内的指定目标造成150%攻击力的伤害' },
  jue_chu_feng_sheng: { id: 'jue_chu_feng_sheng', name: '绝处逢生', mpCost: 10, type: 'support', power: 0, cooldown: 4, description: '消耗自身最大生命值20%的生命（消耗后生命值至少为1），攻击力+10%且防御力-10%，持续到本局战斗结束' },
  ai_de_bao_bao: { id: 'ai_de_bao_bao', name: '爱的抱抱', mpCost: 20, type: 'heal', power: 0, cooldown: 2, range: 1, description: '对相邻1格范围内的指定目标，恢复血量和法力值，恢复量为0.05*自身最大生命值/法力值+0.1*目标最大生命值/法力值' },
  ai_de_fei_wen: { id: 'ai_de_fei_wen', name: '爱的飞吻', mpCost: 30, type: 'heal', power: 0, cooldown: 3, range: 3, description: '选择3格范围内的一个指定目标，恢复血量为0.05*自身最大生命值+0.1*目标最大生命值' },
  ai_de_hui_yi: { id: 'ai_de_hui_yi', name: '爱的回忆', mpCost: 0, type: 'heal', power: 0, cooldown: 5, range: 1, description: '选择自己为目标，恢复10%的最大生命值以及10%的最大法力值' },
  qian_li_bing_feng: { id: 'qian_li_bing_feng', name: '千里冰封', mpCost: 50, type: 'attack', power: 110, cooldown: 4, range: 2, areaRange: 2, description: '对以自身为中心5*5范围内的所有敌方目标造成110%攻击力的伤害' },

  // 鬼界技能
  fierce_attack: { id: 'fierce_attack', name: '凶猛攻击', mpCost: 50, type: 'attack', power: 200, cooldown: 3, range: 1, description: '对范围1格的指定目标，造成200%的伤害' },
  shadow_assassination: { id: 'shadow_assassination', name: '暗影刺杀', mpCost: 50, type: 'attack', power: 130, cooldown: 3, range: 1, description: '以自己为中心，对1格范围内的所有目标造成伤害，伤害量为(1+0.3*本回合移动格子)*攻击力' },
  throw_grenade: { id: 'throw_grenade', name: '投掷手雷', mpCost: 50, type: 'attack', power: 200, cooldown: 3, range: 3, description: '对目标及周围相邻格子的所有目标，造成200%攻击力的伤害' },
  spit_slime: { id: 'spit_slime', name: '口吐粘液', mpCost: 50, type: 'attack', power: 140, cooldown: 3, range: 2, description: '向2格范围内的指定目标吐出粘液，造成140%攻击力的伤害，并且被击中的角色本局战斗的防御力减少50%' },
  fushi_nianye: { id: 'fushi_nianye', name: '腐蚀粘液', mpCost: 0, type: 'attack', power: 225, cooldown: 2, range: 2, areaRange: 2, description: '以自身为中心引爆，对2格范围内的所有敌方目标造成225%攻击力的伤害，并减少目标50%防御（持续到战斗结束），使用后自身战败退场（仅在生命值<=20%时可用）' },
  er_ye_pao_xiao: { id: 'er_ye_pao_xiao', name: '二爷咆哮', mpCost: 50, type: 'attack', power: 150, cooldown: 5, range: 1, description: '对相邻格子的一个指定单位造成150%攻击力的伤害，并且提高自己30%的攻击力（持续到战斗结束）' },
  xie_e_kun_bang: { id: 'xie_e_kun_bang', name: '邪恶捆绑', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 3, description: '对3格范围内的一个指定目标造成150%攻击力的伤害' },
  life_drain: { id: 'life_drain', name: '汲取生命', mpCost: 35, type: 'attack', power: 120, cooldown: 2, range: 5, description: '对5格范围内的一个指定目标造成120%攻击力的伤害，并恢复自身40%攻击力的生命值' },
  xiong_meng_si_yao: { id: 'xiong_meng_si_yao', name: '凶猛撕咬', mpCost: 50, type: 'attack', power: 150, cooldown: 3, range: 1, description: '选择1格范围内的一个指定目标，造成150%攻击力的伤害' },
  excited_frenzy: { id: 'excited_frenzy', name: '兴奋狂热', mpCost: 50, type: 'attack', power: 180, cooldown: 3, range: 3, description: '消耗自身最大生命值的20%（剩余生命不低于1），对3格范围内的指定目标造成180%攻击力的伤害' },
  jue_ming_fu_ji: { id: 'jue_ming_fu_ji', name: '绝命伏击', mpCost: 50, type: 'attack', power: 200, cooldown: 2, range: 1, description: '选择相邻一格的一个目标，造成攻击力200%的伤害' },
  terror_scream: { id: 'terror_scream', name: '恐怖尖叫', mpCost: 50, type: 'attack', power: 150, cooldown: 4, range: 3, areaRange: 3, description: '对3格范围内的所有对手角色目标和障碍物造成攻击力150%的伤害，摧毁障碍物，并在移动距离2格以内的空格随机生成1只普通丧尸' },

  // 仙界技能
  lingqi_bo: { id: 'lingqi_bo', name: '灵气波', mpCost: 40, type: 'attack', power: 150, cooldown: 3, range: 3, description: '选择3格范围内的一个指定目标，造成攻击力150%的伤害' },
  lingqisi: { id: 'lingqisi', name: '灵气丝', mpCost: 40, type: 'attack', power: 130, cooldown: 3, range: 3, description: '选择3格范围内的一个指定目标，造成攻击力130%的伤害，同时恢复自身50%攻击力的生命' },
  hong_hua_lv_ye: { id: 'hong_hua_lv_ye', name: '红花绿叶', mpCost: 60, type: 'attack', power: 120, cooldown: 3, range: 1, description: '选择1格范围内的1个指定目标，造成攻击力120%的伤害，同时提高生命值上限（+攻击力80%）并恢复同等生命值' },
  ni_tian_can_ren: { id: 'ni_tian_can_ren', name: '逆天残刃', mpCost: 60, type: 'attack', power: 120, cooldown: 4, range: 3, targetCount: 3, description: '选择3格范围内的3个指定目标，分别造成攻击力120%的伤害' },
  dao_guang_jian_ying: { id: 'dao_guang_jian_ying', name: '刀光剑影', mpCost: 40, type: 'attack', power: 140, cooldown: 2, range: 3, targetCount: 2, description: '选择3格范围内的2个指定目标，分别造成攻击力140%的伤害' },
  tian_han_di_dong: { id: 'tian_han_di_dong', name: '天寒地冻', mpCost: 50, type: 'attack', power: 150, cooldown: 2, range: 3, description: '选择3格范围内的1个角色，造成攻击力150%的伤害，同时在目标脚下产生雪地，持续1回合' },
  tian_beng_di_lie: { id: 'tian_beng_di_lie', name: '天崩地裂', mpCost: 60, type: 'attack', power: 80, cooldown: 3, range: 1, areaRange: 1, description: '以自己为中心，对3×3范围内的所有敌方角色和建筑，造成攻击力80%的伤害' },
  xing_huo_liao_yuan: { id: 'xing_huo_liao_yuan', name: '星火燎原', mpCost: 60, type: 'attack', power: 130, cooldown: 3, range: 3, targetCount: 2, description: '选择3格范围内的2个指定目标，分别造成攻击力130%的伤害' },
  ju_huo_fen_tian: { id: 'ju_huo_fen_tian', name: '举火焚天', mpCost: 50, type: 'attack', power: 120, cooldown: 3, range: 3, description: '选择3格范围内的1个指定目标，造成攻击力120%的伤害，同时提高自己10%的攻击力（持续到战斗结束）' },

  // 歌莉娅技能（机甲）
  yuan_cheng_dao_dan: { id: 'yuan_cheng_dao_dan', name: '远程导弹', mpCost: 75, type: 'attack', power: 90, cooldown: 3, range: 4, areaRange: 1, description: '选择4格范围内的1个格子为目标，对以该格子为中心范围1格的菱形区域内的所有敌方目标造成攻击力90%的伤害，并清除范围内的障碍物' },
  jing_zhun_da_ji: { id: 'jing_zhun_da_ji', name: '精准打击', mpCost: 60, type: 'attack', power: 130, cooldown: 3, range: 4, targetCount: 2, description: '选择4格范围内的2个目标，分别造成攻击力130%的伤害' },

  // 妖界技能
  yue_zhi_yin_li: { id: 'yue_zhi_yin_li', name: '月之引力', mpCost: 80, type: 'support', power: 0, cooldown: 5, range: 2, targetCount: 1, description: '选择2格菱形范围内的1个同阵营目标，使自身和该目标都获得【愈合】和【调息】状态', effectType: 'water', attribute: 'water', category: 'support' },
  tian_tu_zhan_fang: { id: 'tian_tu_zhan_fang', name: '天兔绽放', mpCost: 60, type: 'attack', power: 120, cooldown: 3, range: 0, areaRange: 2, description: '以自身为中心，对2格菱形范围内的所有对方阵营目标造成120%攻击力的伤害', effectType: 'water', attribute: 'water', category: 'aoe' },
  fei_xue_meng_ji: { id: 'fei_xue_meng_ji', name: '沸血猛击', mpCost: 80, type: 'attack', power: 210, cooldown: 3, range: 1, targetCount: 1, description: '选择1格菱形范围内的1个敌方单位，造成210%攻击力的伤害，自身损失10%的最大生命值，并获得【愤怒】状态', effectType: 'earth', attribute: 'earth', category: 'single' },
  wu_di_niu_niu: { id: 'wu_di_niu_niu', name: '无敌牛牛', mpCost: 100, type: 'heal', power: 100, cooldown: 5, range: 0, targetCount: 1, description: '选择自身为目标，恢复自身100%攻击力的生命值，驱散所有不良状态，并且自身获得【愈合】状态', effectType: 'earth', attribute: 'earth', category: 'heal' },
  jian_yu: { id: 'jian_yu', name: '箭雨', mpCost: 80, type: 'attack', power: 150, cooldown: 3, range: 4, targetCount: 2, description: '选择4格菱形范围内的2个敌方单位，造成150%攻击力的伤害', effectType: 'wind', attribute: 'wind', category: 'multi' },
  sui_xing: { id: 'sui_xing', name: '碎星', mpCost: 80, type: 'attack', power: 200, cooldown: 4, range: 4, targetCount: 1, description: '选择4格菱形范围内的1个敌方单位，造成200%攻击力的伤害，并使目标陷入【流血】状态', effectType: 'wind', attribute: 'wind', category: 'single' },
}
```

### 5.4 装备品质配置
```typescript
export const RARITY_CONFIG: Record<Rarity, { name: string; color: string; bonus: number }> = {
  common: { name: '普通', color: '#ffffff', bonus: 0 },
  rare: { name: '稀有', color: '#60a5fa', bonus: 0.2 },
  exceptional: { name: '非凡', color: '#4ade80', bonus: 0.4 },
  treasure: { name: '珍宝', color: '#a855f7', bonus: 0.6 },
  celestial: { name: '仙品', color: '#f59e0b', bonus: 0.8 },
  peerless: { name: '绝世', color: '#fbbf24', bonus: 1.0 },
}
```

### 5.5 建筑配置
```typescript
export const BUILDING_CONFIG: Record<string, { name: string; icon: string; description: string; maxHp: number; spawnItem?: { id: string; count: number }; spawnRound?: number; spawnCharacter?: boolean; characterFaction?: string; characterJob?: string }> = {
  spiritField: { name: '灵田', icon: '🌾', description: '种植灵草的田地，战斗第5回合在4个相邻空格上生成最多4株灵草', maxHp: 200, spawnItem: { id: 'spirit_grass', count: 4 }, spawnRound: 5 },
  elixirRoom: { name: '丹房', icon: '🏯', description: '炼制丹药的场所，战斗第5回合在4个相邻空格上随机生成1个丹药', maxHp: 400, spawnItem: { id: 'elixir', count: 1 }, spawnRound: 5 },
  heart: { name: '血心', icon: '/static/avatars/ghost/xuexin.png', description: '鬼界的出兵建筑，每4回合生成一只丧尸；第一次被攻击额外生成一只变异丧尸', maxHp: 400, spawnRound: 4 },
  barracks: { name: '兵营', icon: '/static/avatars/human/bingying.png', description: '人界的出兵建筑，每6回合在周围生成一个随机职业为士兵的角色', maxHp: 600, spawnRound: 6, spawnCharacter: true, characterFaction: 'human', characterJob: '士兵' },
  tianqiPao: { name: '天启炮', icon: '/static/avatars/human/tianqipao.png', description: '敌方建筑，奇数回合锁定玩家目标，偶数回合造成伤害', maxHp: 500 },
}
```

---

## 6. 战斗系统逻辑

### 6.1 伤害计算公式
```
最终伤害 = max(1, (攻击方攻击力 × (1 + 攻击力提升%) - 防御方防御力 × (1 - 防御力降低%)) × 技能倍率)

攻击力提升（attackBoost）：默认0%，可通过技能获得（绝处逢生+10%、二爷咆哮+30%、举火焚天+10%）
防御力降低 = defenseReduction（临时，如口吐粘液50%、腐蚀粘液50%） + defenseReductionPermanent（永久，如绝处逢生10%）
防御状态加成：如果目标在防御状态，防御力额外 × 1.2
技能倍率：100% = 1.0, 150% = 1.5, 以此类推
```

### 6.2 技能释放流程
```
1. 检查技能冷却（currentCooldown必须为0）
2. 检查法力消耗（mp必须 >= mpCost）
3. 检查HP限制（如腐蚀粘液：HP必须 <= 20%）
4. 确定目标类型：
   - 单体目标：选择1个敌人/角色
   - 多目标（targetCount）：选择指定数量的目标
   - 位置指定（如远程导弹）：选择地图上的任意格子
   - 范围目标（areaRange）：以自身或目标为中心的范围
   - 自身目标（如爱的回忆、绝处逢生）：不需要选目标
5. 执行技能效果：
   - 计算伤害（攻击类技能）
   - 恢复生命/法力（治疗类技能）
   - 应用增益/减益（辅助类技能）
   - 清除障碍物（范围技能）
   - 触发抖动特效（triggerShake）
6. 标记角色已行动（hasActed = true）
7. 设置技能冷却（currentCooldown = cooldown）
8. 检查战斗结束条件
```

### 6.3 AI行动逻辑
```
AI行动顺序：按角色到最近敌方目标的曼哈顿距离排序，距离近的先行动

每个敌方角色回合：
1. 检查状态效果（stun > 0 ? 跳过本回合；silenced > 0 ? 只能普通攻击；disorder > 0 ? 混乱行为）
2. 评估最优移动位置和目标
3. 根据角色技能选择最优策略：
   - 召唤技能（优先级9999）：优先选择能召唤且离敌人更近的位置
   - AOE技能（使用areaRange计算伤害，只计算对敌方角色和建筑的伤害）
   - 有HP限制技能且HP满足条件：优先使用该技能
   - 有位置指定技能（如远程导弹）：选择敌人密集的格子
   - 有多目标技能（targetCount）：选择最多数量的敌人目标
   - 辅助技能（绝处逢生、月之引力）：对自己或友方使用，优先选择离敌人更近的位置
   - 普通技能：选择造成最大伤害的单个目标（技能优先级=技能本回合能造成的最大伤害，普通攻击优先级=攻击力）
4. 移动到合适位置（如果需要）
5. 执行攻击/技能
6. 标记已行动

技能优先级：攻击 > 召唤（9999） > 治疗 > 辅助 > 特殊（AI忽略特殊类型技能）
AI不会使用技能攻击障碍物（不会因为障碍物而使用技能）
```

### 6.4 角色属性成长
```
升级时：
  maxHp += growthMaxHp
  maxMp += growthMaxMp
  attack += growthAttack
  defense += growthDefense
  exp -= getExpRequired(level)
  level += 1
  hp = maxHp（战斗外升级回满）
  mp = maxMp（战斗外升级回满）

经验需求公式：
  getExpRequired(level) = 80 + (level - 1) * 40
```

### 6.5 装备属性加成
```
装备基础属性 × (1 + rarityBonus + (itemLevel - 1) × 0.1)

品质加成：
  common: 0%
  rare: 20%
  exceptional: 40%
  treasure: 60%
  celestial: 80%
  peerless: 100%

百分比属性（attackPercent、defensePercent等）不受品质和等级影响
```

### 6.6 雇佣金额计算公式
```
雇佣金额 = maxHp + maxMp + 5 × attack + 5 × defense + 50 × moveRange + 50 × attackRange
```

---

## 7. 数据持久化

### 7.1 存储结构
```typescript
interface SaveData {
  version: string
  savedAt: number
  player: Player
}
```

### 7.2 存档特性
- **HP/MP自动回满**：每次启动游戏，角色都会恢复到满HP满MP
- **技能冷却重置**：保存存档时，所有角色技能的currentCooldown重置为0
- **战斗状态不保存**：只保存家园和角色成长内容
- **家园优化**：只保存有建筑的位置，空地不保存
- **技能简化**：技能不需要icon和description字段
- **avatar和isPlayerOwned不保存**：由角色模板动态获取

### 7.3 外部存储备份
- **Android外部存储路径**：`Android/data/uni.app.UNISANSHI/apps/__UNI__6383D08/doc/SangshiGame/`
- **自动备份**：保存游戏时同时备份到外部存储
- **自动恢复**：应用启动时自动尝试从外部存储恢复

### 7.4 剪贴板备份
- **导出**：存档数据序列化为JSON字符串，复制到剪贴板
- **导入**：从剪贴板读取JSON字符串，解析后加载

---

## 8. 项目文件结构

```
sangshi/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json
│   ├── pages.json
│   ├── uni.scss
│   ├── pages/
│   │   ├── start/
│   │   │   └── start.vue
│   │   ├── index/
│   │   │   └── index.vue
│   │   ├── character/
│   │   │   └── character.vue
│   │   ├── character-book/
│   │   │   └── character-book.vue
│   │   ├── home/
│   │   │   └── home.vue
│   │   ├── battle-select/
│   │   │   └── battle-select.vue
│   │   ├── battle/
│   │   │   └── battle.vue
│   │   └── inventory/
│   │       └── inventory.vue
│   ├── static/
│   │   └── avatars/
│   │       ├── characters/
│   │       ├── human/
│   │       ├── ghost/
│   │       ├── items/
│   │       └── backgrounds/
│   ├── stores/
│   │   └── gameStore.ts
│   └── utils/
│       ├── gameData.ts
│       ├── storageUtils.ts
│       └── characterAvatars.ts
├── package.json
├── PRD.md
├── ERD.md
├── FUNCTIONS.md
└── README.md
```

---

## 9. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0 | 2026-05-19 | 初始版本，完成核心功能 |
| 1.1 | 2026-05-20 | 添加建筑系统、灵草灵药系统、完善战斗操作 |
| 1.2 | 2026-05-20 | 修复BUILDING_CONFIG导入错误、修复战斗选择按钮问题、优化技能信息显示、完善战利品系统 |
| 1.3 | 2026-05-21 | 更新数据模型支持新角色和技能、添加character-book页面路由、更新战斗系统逻辑支持防御机制、添加人类新角色和鬼界丧尸角色配置、移除空地选项、添加战斗日志支持、更新项目文件结构 |
| 1.4 | 2026-05-22 | 更新阵营配置（鬼域→鬼界）、添加兵营和血心建筑配置、更新建筑血量、添加难度系统配置、更新战斗系统逻辑包含阵营指令、战利品结算、经验奖励计算、添加敌人等级计算逻辑、完善AI行动逻辑、更新版本历史 |
| 1.5 | 2026-05-23 | 更新BattleCharacter模型（hasAttacked→hasActed）、添加shakingTargets状态、添加triggerShake action、添加被攻击抖动特效说明、添加技能清除障碍物说明、完善战斗系统逻辑文档、更新版本历史 |
| 1.6 | 2026-05-24 | 更新角色配置（添加小鬼丧尸、法老丧尸、动员兵）、更新技能配置、更新建筑配置、更新存储相关接口、添加存档备份系统文档 |
| 1.7 | 2026-05-24 | 更新StorageResult接口添加content字段、完善存储工具说明、添加外部存储路径说明 |
| 1.8 | 2026-05-25 | 添加存档特性说明（技能冷却重置）、更新getSaveSlots为异步、添加剪贴板备份详细说明 |
| 1.9 | 2026-05-26 | 更新建筑配置（兵营出兵回合5→6）、更新角色配置（狙击手攻击力70→80） |
| 2.0 | 2026-05-27 | 更新BattleCharacter接口（添加totalDamage、totalHeal、attackBoost、defenseReductionPermanent字段）、更新BattleBuilding接口（添加totalDamage字段）、更新BattleMap接口（添加defeatedCharacters、destroyedBuildings字段）、添加天启炮建筑配置、更新技能配置（添加绝处逢生技能）、更新伤害计算公式（支持攻击力提升和防御力永久降低）、添加战斗记录系统文档、添加天启炮瞄准机制说明、添加瞄准准心特效说明、更新存档优化说明 |
| 2.1 | 2026-05-27 | 更新BattleTile接口（移除grass地形，只保留empty、river、obstacle）、更新Rarity类型定义（添加所有6种品质）、更新技能配置（添加恐怖尖叫技能）、更新BattleCharacter接口（添加attack和defense字段存储装备加成属性）、添加装备属性应用说明文档 |
| 2.2 | 2026-06-02 | 更新建筑配置（灵田300→200，丹房500→400，血心500→400，兵营800→600，天启炮750→500）、新增建筑血量成长公式（每级在基础值的10%递增）、更新技能配置（添加爱的回忆技能，口吐粘液威力110→140）、更新血心建筑描述（包含第一次被攻击额外生成变异丧尸机制） |
| 2.3 | 2026-06-04 | 更新BattleCharacter接口（添加maxHp、maxMp必填字段，添加attack、defense必填字段）、更新ERD图中的BattleCharacter实体、添加仙界角色技能（灵气波/红花绿叶/逆天残刃/刀光剑影/天寒地冻）、添加爱的回忆技能、修正兴奋狂热技能威力（160→180）、修正口吐粘液技能威力（110→140）、添加技能对障碍物和建筑的处理说明文档、添加角色属性标签（job字段）配置、添加多目标技能（targetCount）和位置指定技能处理流程 |
| 2.4 | 2026-06-04 | 更新技能配置（添加天崩地裂、星火燎原、举火焚天技能）、更新仙界阵营角色配置（土系修士、火系修士）、修改大黑熊1级防御力（10→15）、为大黑熊添加爱的飞吻技能、完善红花绿叶和举火焚天技能对建筑和障碍物目标的自身buff处理说明、完善多目标技能（targetCount）的通用处理说明、添加远程导弹（位置指定技能）详细处理流程 |
| 2.5 | 2026-06-04 | 更新角色配置（添加女修士、歌莉娅）、更新技能配置（添加腐蚀粘液、灵气丝、远程导弹、精准打击、凶猛撕咬、绝命伏击）、修正暗影刺杀（mpCost40→50，伤害公式0.2→0.3）、修正二爷咆哮（新增攻击力+30%持续效果）、修正灵气波（power160→150）、修正恐怖尖叫（范围改为菱形，可攻击障碍物）、修正邪恶捆绑冷却4→3、修正汲取生命冷却3→2、修正普通丧尸1级攻击40→50、修正小鬼丧尸攻击成长+10→+15、修正兔兔1级法力120→130成长+15→+25、修正大黑熊1级法力150→130成长+15→+25、添加爬行丧尸角色和绝命伏击技能、添加尖叫丧尸初始HP/攻击成长调整、更新雇佣金额公式（maxHp+maxMp+2×attack+2×defense+10×moveRange+10×attackRange）、添加角色属性标签（Job）详细说明文档、完善AI对多目标/位置指定/HP限制技能的处理逻辑 |

| 2.6 | 2026-06-04 | 修复gameData.ts中Skill接口缺失areaRange字段（代码已被技能数据使用但未在接口声明的问题）、统一ERD.md中Skill实体移除不存在的consumeAllMp字段、更新FUNCTIONS.md中Skill接口描述、完善核心文档与最新代码的一致性 |
| 2.7 | 2026-06-30 | 新增神界角色【翎羽】（神兵，风属性，1级生命320/法力180/攻击90/防御20，移动4，攻击范围4，成长生命+80/法力+20/攻击+25/防御+15），新增技能【箭雨】（4格范围2目标，150%攻击力伤害，冷却3回合，消耗法力80）【碎星】（4格范围1目标，200%攻击力伤害，使目标陷入【流血】状态，冷却4回合，消耗法力80），新增职业标签【神兵】 |
